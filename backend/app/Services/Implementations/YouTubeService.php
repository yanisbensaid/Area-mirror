<?php

namespace App\Services\Implementations;

use App\Services\Base\BaseService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class YouTubeService extends BaseService
{
    protected string $name = 'YouTube';
    protected string $description = 'Monitor YouTube activity and interact with videos';
    protected string $authType = 'oauth2';
    protected ?string $icon = 'https://www.youtube.com/s/desktop/7a7c6e5b/img/favicon_144x144.png';
    protected ?string $color = '#FF0000';

    private string $baseUrl = 'https://www.googleapis.com/youtube/v3';
    private ?string $accessToken = null;

    // Rate limiting: Track API quota usage
    private const QUOTA_CACHE_KEY = 'youtube_api_quota';
    private const DAILY_QUOTA_LIMIT = 9000; // Leave buffer from 10,000

    public function authenticate(array $credentials): bool
    {
        $this->accessToken = $credentials['access_token'] ?? null;

        if (empty($this->accessToken)) {
            return false;
        }

        // Validate token by making a lightweight API call
        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/channels", [
                'part' => 'snippet',
                'mine' => 'true',
                'maxResults' => 1,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('YouTube authentication failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function isAuthenticated(): bool
    {
        return !empty($this->accessToken);
    }

    public function getAvailableActions(): array
    {
        return [
            'video_liked' => [
                'name' => 'Video Liked',
                'description' => 'Triggers when you like a video on YouTube',
                'params' => [],
                'quota_cost' => 1,
            ],
        ];
    }

    public function getAvailableReactions(): array
    {
        return [
            'like_video' => [
                'name' => 'Like Video',
                'description' => 'Likes a video on YouTube',
                'params' => [
                    'video_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'YouTube video ID',
                    ]
                ],
                'quota_cost' => 50,
            ],
        ];
    }

    public function executeAction(string $actionName, array $params): mixed
    {
        return match($actionName) {
            'video_liked' => $this->checkLikedVideos($params),
            default => throw new \InvalidArgumentException("Unknown action: $actionName")
        };
    }

    public function executeReaction(string $reactionName, array $params): bool
    {
        return match($reactionName) {
            'like_video' => $this->likeVideo($params),
            default => throw new \InvalidArgumentException("Unknown reaction: $reactionName")
        };
    }

    public function testConnection(): bool
    {
        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/channels", [
                'part' => 'snippet',
                'mine' => 'true',
                'maxResults' => 1,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('YouTube connection test failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Check for newly liked videos
     *
     * IMPORTANT: YouTube API doesn't provide "recently liked" directly
     * We must fetch all liked videos and compare with previous state
     */
    private function checkLikedVideos(array $params): array
    {
        // Check quota before making request
        if (!$this->canMakeRequest(1)) {
            Log::warning('YouTube API quota exceeded, skipping check');
            return [];
        }

        $lastVideoIds = $params['last_video_ids'] ?? [];
        $isFirstRun = empty($lastVideoIds);

        Log::info('YouTube check started', [
            'last_video_ids_count' => count($lastVideoIds),
            'is_first_run' => $isFirstRun,
            'last_ids' => $lastVideoIds
        ]);

        try {
            // Fetch liked videos without cache to get real-time data
            // Cache was causing new likes to not be detected for 10 minutes
            $likedVideos = $this->fetchLikedVideos();

            Log::info('Fetched liked videos', [
                'count' => count($likedVideos),
                'video_ids' => array_column($likedVideos, 'video_id')
            ]);

            if (empty($likedVideos)) {
                return [];
            }

            // Extract current video IDs
            $currentVideoIds = array_column($likedVideos, 'video_id');

            // First run: Return special marker to initialize state without triggering
            // The command will store current IDs but won't send notifications
            if ($isFirstRun) {
                Log::info('First run detected - initializing state', [
                    'video_count' => count($currentVideoIds)
                ]);

                // Return videos with a special marker
                return array_map(function($video) {
                    $video['_is_initialization'] = true;
                    return $video;
                }, $likedVideos);
            }

            // Find new likes (videos in current but not in last check)
            $newVideoIds = array_diff($currentVideoIds, $lastVideoIds);

            Log::info('New videos detected', [
                'count' => count($newVideoIds),
                'new_ids' => array_values($newVideoIds)
            ]);

            if (empty($newVideoIds)) {
                // No new videos, but return current state for tracking
                return ['_current_state' => $currentVideoIds];
            }

            // Filter to get only new liked videos
            $newLikes = array_filter($likedVideos, function($video) use ($newVideoIds) {
                return in_array($video['video_id'], $newVideoIds);
            });

            // Increment quota usage
            $this->incrementQuotaUsage(1);

            Log::info('Returning new likes', [
                'count' => count($newLikes)
            ]);

            return array_values($newLikes);

        } catch (\Exception $e) {
            Log::error('Failed to check YouTube liked videos', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    /**
     * Fetch liked videos from YouTube API
     */
    private function fetchLikedVideos(): array
    {
        // Get user's liked videos playlist
        // Note: Every YouTube user has a "Liked Videos" playlist
        $response = $this->makeRequest('GET', "{$this->baseUrl}/channels", [
            'part' => 'contentDetails',
            'mine' => 'true',
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to fetch channel details');
        }

        $channelData = $response->json();

        Log::info('YouTube channel data', [
            'has_items' => isset($channelData['items']),
            'items_count' => count($channelData['items'] ?? []),
            'channel_data' => $channelData
        ]);

        $likedPlaylistId = $channelData['items'][0]['contentDetails']['relatedPlaylists']['likes'] ?? null;

        Log::info('YouTube liked playlist ID', [
            'playlist_id' => $likedPlaylistId
        ]);

        if (!$likedPlaylistId) {
            return [];
        }

        // Fetch videos from liked playlist
        $response = $this->makeRequest('GET', "{$this->baseUrl}/playlistItems", [
            'part' => 'snippet,contentDetails',
            'playlistId' => $likedPlaylistId,
            'maxResults' => 10, // Only check last 10 likes
        ]);

        if (!$response->successful()) {
            throw new \Exception('Failed to fetch liked videos');
        }

        $playlistItems = $response->json()['items'] ?? [];
        $likedVideos = [];

        foreach ($playlistItems as $item) {
            $snippet = $item['snippet'];
            $videoId = $item['contentDetails']['videoId'];

            $likedVideos[] = [
                'video_id' => $videoId,
                'title' => $snippet['title'],
                'channel' => $snippet['channelTitle'],
                'channel_id' => $snippet['channelId'],
                'url' => "https://www.youtube.com/watch?v={$videoId}",
                'thumbnail' => $snippet['thumbnails']['default']['url'] ?? null,
                'published_at' => $snippet['publishedAt'],
                'detected_at' => now()->toIso8601String(),
            ];
        }

        return $likedVideos;
    }

    /**
     * Like a video on YouTube
     */
    private function likeVideo(array $params): bool
    {
        $videoId = $params['video_id'] ?? null;

        if (!$videoId) {
            return false;
        }

        if (!$this->canMakeRequest(50)) {
            Log::warning('YouTube API quota exceeded, cannot like video');
            return false;
        }

        try {
            $response = $this->makeRequest('POST', "{$this->baseUrl}/videos/rate", [
                'id' => $videoId,
                'rating' => 'like',
            ]);

            if ($response->successful()) {
                $this->incrementQuotaUsage(50);
                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Failed to like YouTube video', [
                'video_id' => $videoId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    protected function getHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->accessToken,
            'Accept' => 'application/json',
        ];
    }

    /**
     * Check if we can make an API request within quota limits
     */
    private function canMakeRequest(int $quotaCost): bool
    {
        $currentUsage = Cache::get(self::QUOTA_CACHE_KEY, 0);
        return ($currentUsage + $quotaCost) <= self::DAILY_QUOTA_LIMIT;
    }

    /**
     * Increment API quota usage (resets daily at midnight)
     */
    private function incrementQuotaUsage(int $cost): void
    {
        $currentUsage = Cache::get(self::QUOTA_CACHE_KEY, 0);
        $newUsage = $currentUsage + $cost;

        // Cache until end of day
        $secondsUntilMidnight = now()->endOfDay()->diffInSeconds(now());
        Cache::put(self::QUOTA_CACHE_KEY, $newUsage, $secondsUntilMidnight);

        Log::info('YouTube API quota usage', [
            'current' => $newUsage,
            'limit' => self::DAILY_QUOTA_LIMIT,
            'percentage' => round(($newUsage / self::DAILY_QUOTA_LIMIT) * 100, 2) . '%'
        ]);
    }
}
