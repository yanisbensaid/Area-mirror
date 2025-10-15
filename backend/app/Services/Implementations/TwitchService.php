<?php

namespace App\Services\Implementations;

use App\Services\Base\BaseService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class TwitchService extends BaseService
{
    protected string $name = 'Twitch';
    protected string $description = 'Live streaming platform integration';
    protected string $authType = 'oauth2';
    protected ?string $icon = 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png';
    protected ?string $color = '#9146FF';

    private string $baseUrl = 'https://api.twitch.tv/helix';
    private ?string $accessToken = null;
    private ?string $clientId = null;

    // Rate limiting: Track API usage
    private const RATE_LIMIT_CACHE_KEY = 'twitch_api_rate_limit';
    private const RATE_LIMIT_PER_MINUTE = 750; // Leave buffer from 800

    public function authenticate(array $credentials): bool
    {
        $this->accessToken = $credentials['access_token'] ?? null;
        $this->clientId = config('services.twitch.client_id');

        if (empty($this->accessToken) || empty($this->clientId)) {
            return false;
        }

        // Validate token by getting user info
        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/users", []);
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Twitch authentication failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    public function isAuthenticated(): bool
    {
        return !empty($this->accessToken) && !empty($this->clientId);
    }

    public function getAvailableActions(): array
    {
        return [
            'stream_started' => [
                'name' => 'Stream Started',
                'description' => 'Triggers when you go live on Twitch',
                'params' => [],
            ],
            'new_follower' => [
                'name' => 'New Follower',
                'description' => 'Triggers when someone follows your channel',
                'params' => [],
            ],
            'stream_title_changed' => [
                'name' => 'Stream Title Changed',
                'description' => 'Triggers when your stream title changes',
                'params' => [],
            ],
        ];
    }

    public function getAvailableReactions(): array
    {
        return [
            'update_stream_title' => [
                'name' => 'Update Stream Title',
                'description' => 'Changes the title of your current stream',
                'params' => [
                    'title' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'New stream title (max 140 characters)',
                    ]
                ],
            ],
            'update_stream_category' => [
                'name' => 'Update Stream Category',
                'description' => 'Changes the game/category of your stream',
                'params' => [
                    'game_name' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Name of the game or category',
                    ]
                ],
            ],
            'create_stream_marker' => [
                'name' => 'Create Stream Marker',
                'description' => 'Adds a marker to your current stream VOD',
                'params' => [
                    'description' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'Marker description (max 140 characters)',
                    ]
                ],
            ],
        ];
    }

    public function executeAction(string $actionName, array $params): mixed
    {
        return match($actionName) {
            'stream_started' => $this->checkStreamStarted($params),
            'new_follower' => $this->checkNewFollowers($params),
            'stream_title_changed' => $this->checkStreamTitleChanged($params),
            default => throw new \InvalidArgumentException("Unknown action: $actionName")
        };
    }

    public function executeReaction(string $reactionName, array $params): bool
    {
        return match($reactionName) {
            'update_stream_title' => $this->updateStreamTitle($params),
            'update_stream_category' => $this->updateStreamCategory($params),
            'create_stream_marker' => $this->createStreamMarker($params),
            default => throw new \InvalidArgumentException("Unknown reaction: $reactionName")
        };
    }

    public function testConnection(): bool
    {
        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/users", []);
            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Twitch connection test failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Check if user started streaming
     */
    private function checkStreamStarted(array $params): array
    {
        if (!$this->canMakeRequest()) {
            Log::warning('Twitch API rate limit reached, skipping check');
            return [];
        }

        $lastStreamId = $params['last_stream_id'] ?? null;
        $isFirstRun = $lastStreamId === null;

        $userId = $this->getUserId();
        if (!$userId) {
            return [];
        }

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/streams", [
                'user_id' => $userId,
            ]);

            if (!$response->successful()) {
                return [];
            }

            $data = $response->json();
            $streams = $data['data'] ?? [];

            // No active stream
            if (empty($streams)) {
                Log::info('Twitch: No active stream found');
                return ['_current_state' => ['last_stream_id' => null]];
            }

            $stream = $streams[0];
            $currentStreamId = $stream['id'];

            // First run: Initialize state without triggering
            if ($isFirstRun) {
                Log::info('Twitch: First run - initializing stream state', [
                    'stream_id' => $currentStreamId
                ]);
                return [[
                    'stream_id' => $currentStreamId,
                    '_is_initialization' => true,
                ]];
            }

            // Stream hasn't changed
            if ($currentStreamId === $lastStreamId) {
                return ['_current_state' => ['last_stream_id' => $currentStreamId]];
            }

            // New stream detected!
            Log::info('Twitch: New stream detected', [
                'old_stream_id' => $lastStreamId,
                'new_stream_id' => $currentStreamId,
            ]);

            $this->incrementRateLimit();

            return [[
                'stream_id' => $stream['id'],
                'user_id' => $stream['user_id'],
                'user_name' => $stream['user_name'],
                'title' => $stream['title'],
                'game_name' => $stream['game_name'],
                'viewer_count' => $stream['viewer_count'],
                'started_at' => $stream['started_at'],
                'thumbnail_url' => $stream['thumbnail_url'],
            ]];

        } catch (\Exception $e) {
            Log::error('Failed to check Twitch stream', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Check for new followers
     */
    private function checkNewFollowers(array $params): array
    {
        if (!$this->canMakeRequest()) {
            Log::warning('Twitch API rate limit reached, skipping check');
            return [];
        }

        $lastFollowerIds = $params['last_follower_ids'] ?? [];
        $isFirstRun = empty($lastFollowerIds);

        $userId = $this->getUserId();
        if (!$userId) {
            return [];
        }

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/channels/followers", [
                'broadcaster_id' => $userId,
                'first' => 20, // Check last 20 followers
            ]);

            if (!$response->successful()) {
                return [];
            }

            $data = $response->json();
            $followers = $data['data'] ?? [];

            if (empty($followers)) {
                return [];
            }

            $currentFollowerIds = array_column($followers, 'user_id');

            // First run: Initialize state
            if ($isFirstRun) {
                Log::info('Twitch: First run - initializing follower state', [
                    'follower_count' => count($currentFollowerIds)
                ]);
                return array_map(function($follower) {
                    return [
                        'follower_id' => $follower['user_id'],
                        'follower_name' => $follower['user_name'],
                        'followed_at' => $follower['followed_at'],
                        '_is_initialization' => true,
                    ];
                }, $followers);
            }

            // Find new followers
            $newFollowerIds = array_diff($currentFollowerIds, $lastFollowerIds);

            if (empty($newFollowerIds)) {
                return ['_current_state' => ['last_follower_ids' => $currentFollowerIds]];
            }

            // Filter to get only new followers
            $newFollowers = array_filter($followers, function($follower) use ($newFollowerIds) {
                return in_array($follower['user_id'], $newFollowerIds);
            });

            $this->incrementRateLimit();

            Log::info('Twitch: New followers detected', [
                'count' => count($newFollowers)
            ]);

            return array_map(function($follower) {
                return [
                    'follower_id' => $follower['user_id'],
                    'follower_name' => $follower['user_name'],
                    'followed_at' => $follower['followed_at'],
                ];
            }, array_values($newFollowers));

        } catch (\Exception $e) {
            Log::error('Failed to check Twitch followers', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Check for stream title changes
     */
    private function checkStreamTitleChanged(array $params): array
    {
        if (!$this->canMakeRequest()) {
            Log::warning('Twitch API rate limit reached, skipping check');
            return [];
        }

        $lastTitle = $params['last_title'] ?? null;
        $isFirstRun = $lastTitle === null;

        $userId = $this->getUserId();
        if (!$userId) {
            return [];
        }

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/channels", [
                'broadcaster_id' => $userId,
            ]);

            if (!$response->successful()) {
                return [];
            }

            $data = $response->json();
            $channels = $data['data'] ?? [];

            if (empty($channels)) {
                return [];
            }

            $channel = $channels[0];
            $currentTitle = $channel['title'];

            // First run: Initialize state
            if ($isFirstRun) {
                Log::info('Twitch: First run - initializing title state');
                return [[
                    'current_title' => $currentTitle,
                    '_is_initialization' => true,
                ]];
            }

            // Title hasn't changed
            if ($currentTitle === $lastTitle) {
                return ['_current_state' => ['last_title' => $currentTitle]];
            }

            // Title changed!
            Log::info('Twitch: Stream title changed', [
                'old_title' => $lastTitle,
                'new_title' => $currentTitle,
            ]);

            $this->incrementRateLimit();

            return [[
                'old_title' => $lastTitle,
                'new_title' => $currentTitle,
                'changed_at' => now()->toIso8601String(),
            ]];

        } catch (\Exception $e) {
            Log::error('Failed to check Twitch stream title', [
                'error' => $e->getMessage(),
            ]);
            return [];
        }
    }

    /**
     * Update stream title
     */
    private function updateStreamTitle(array $params): bool
    {
        $title = $params['title'] ?? null;

        if (!$title || strlen($title) > 140) {
            Log::error('Invalid stream title', ['title' => $title]);
            return false;
        }

        if (!$this->canMakeRequest()) {
            Log::warning('Twitch API rate limit reached, cannot update title');
            return false;
        }

        $userId = $this->getUserId();
        if (!$userId) {
            return false;
        }

        try {
            $response = Http::withHeaders($this->getHeaders())
                ->patch("{$this->baseUrl}/channels?broadcaster_id={$userId}", [
                    'title' => $title,
                ]);

            if ($response->successful()) {
                $this->incrementRateLimit();
                Log::info('Twitch stream title updated', ['title' => $title]);
                return true;
            }

            Log::error('Failed to update Twitch stream title', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('Failed to update Twitch stream title', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Update stream category
     */
    private function updateStreamCategory(array $params): bool
    {
        $gameName = $params['game_name'] ?? null;

        if (!$gameName) {
            Log::error('No game name provided');
            return false;
        }

        if (!$this->canMakeRequest()) {
            Log::warning('Twitch API rate limit reached, cannot update category');
            return false;
        }

        $userId = $this->getUserId();
        if (!$userId) {
            return false;
        }

        try {
            // First, search for the game ID
            $response = $this->makeRequest('GET', "{$this->baseUrl}/games", [
                'name' => $gameName,
            ]);

            if (!$response->successful()) {
                Log::error('Failed to search for game', ['game_name' => $gameName]);
                return false;
            }

            $data = $response->json();
            $games = $data['data'] ?? [];

            if (empty($games)) {
                Log::error('Game not found', ['game_name' => $gameName]);
                return false;
            }

            $gameId = $games[0]['id'];

            // Update channel with game ID
            $response = Http::withHeaders($this->getHeaders())
                ->patch("{$this->baseUrl}/channels?broadcaster_id={$userId}", [
                    'game_id' => $gameId,
                ]);

            if ($response->successful()) {
                $this->incrementRateLimit();
                Log::info('Twitch stream category updated', [
                    'game_name' => $gameName,
                    'game_id' => $gameId,
                ]);
                return true;
            }

            Log::error('Failed to update Twitch stream category', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('Failed to update Twitch stream category', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Create stream marker
     */
    private function createStreamMarker(array $params): bool
    {
        $description = $params['description'] ?? '';

        if (strlen($description) > 140) {
            Log::error('Marker description too long', ['description' => $description]);
            return false;
        }

        if (!$this->canMakeRequest()) {
            Log::warning('Twitch API rate limit reached, cannot create marker');
            return false;
        }

        $userId = $this->getUserId();
        if (!$userId) {
            return false;
        }

        try {
            $body = ['user_id' => $userId];
            if (!empty($description)) {
                $body['description'] = $description;
            }

            $response = Http::withHeaders($this->getHeaders())
                ->post("{$this->baseUrl}/streams/markers", $body);

            if ($response->successful()) {
                $this->incrementRateLimit();
                Log::info('Twitch stream marker created', ['description' => $description]);
                return true;
            }

            Log::error('Failed to create Twitch stream marker', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('Failed to create Twitch stream marker', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get Twitch user ID
     */
    private function getUserId(): ?string
    {
        $cacheKey = 'twitch_user_id_' . md5($this->accessToken ?? '');

        return Cache::remember($cacheKey, 3600, function () {
            try {
                $response = $this->makeRequest('GET', "{$this->baseUrl}/users", []);

                if ($response->successful()) {
                    $data = $response->json();
                    return $data['data'][0]['id'] ?? null;
                }
            } catch (\Exception $e) {
                Log::error('Failed to get Twitch user ID', ['error' => $e->getMessage()]);
            }

            return null;
        });
    }

    protected function getHeaders(): array
    {
        return [
            'Authorization' => 'Bearer ' . $this->accessToken,
            'Client-Id' => $this->clientId,
            'Content-Type' => 'application/json',
        ];
    }

    /**
     * Check if we can make an API request within rate limits
     */
    private function canMakeRequest(): bool
    {
        $currentUsage = Cache::get(self::RATE_LIMIT_CACHE_KEY, 0);
        return $currentUsage < self::RATE_LIMIT_PER_MINUTE;
    }

    /**
     * Increment API rate limit counter (resets every minute)
     */
    private function incrementRateLimit(): void
    {
        $currentUsage = Cache::get(self::RATE_LIMIT_CACHE_KEY, 0);
        $newUsage = $currentUsage + 1;

        // Cache for 60 seconds
        Cache::put(self::RATE_LIMIT_CACHE_KEY, $newUsage, 60);

        Log::debug('Twitch API rate limit', [
            'current' => $newUsage,
            'limit' => self::RATE_LIMIT_PER_MINUTE,
        ]);
    }
}
