<?php

namespace App\Services\Implementations;

use App\Services\Base\BaseService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * Steam Service Implementation
 *
 * Integrates with Steam Web API to provide gaming-related AREA functionality.
 * Supports monitoring game purchases, achievements, friends activity, and playtime.
 *
 * Authentication: API Key (no OAuth)
 * API Documentation: https://developer.valvesoftware.com/wiki/Steam_Web_API
 *
 * Important Notes:
 * 1. Steam API is READ-ONLY - no write operations (reactions) are possible
 * 2. User's Steam profile must be public to access their data
 * 3. Requires Steam ID (steamID64) in addition to API key
 * 4. No rate limiting or very high limits
 *
 * Design Decisions:
 * 1. Using API Key authentication (simpler than OAuth)
 * 2. Caching game lists to reduce API calls
 * 3. All actions return arrays of detected changes
 * 4. Steam ID is stored in user_service_tokens.additional_data
 */
class SteamService extends BaseService
{
    protected string $name = 'Steam';
    protected string $description = 'Gaming platform integration for game tracking and achievements';
    protected string $authType = 'api_key';
    protected ?string $icon = 'https://store.steampowered.com/favicon.ico';
    protected ?string $color = '#171a21';

    private string $baseUrl = 'https://api.steampowered.com';
    private ?string $apiKey = null;
    private ?string $steamId = null;

    /**
     * Validate that required credentials are present
     */
    protected function validateCredentials(): bool
    {
        return isset($this->credentials['api_key']) &&
               !empty($this->credentials['api_key']) &&
               isset($this->credentials['user_id']) &&
               !empty($this->credentials['user_id']);
    }

    /**
     * Set credentials and initialize API key and Steam ID
     */
    public function setCredentials(array $credentials): void
    {
        parent::setCredentials($credentials);
        $this->apiKey = $credentials['api_key'] ?? config('services.steam.api_key');
        $this->steamId = $credentials['user_id'] ?? null;
    }

    /**
     * Authenticate with Steam API
     */
    public function authenticate(array $credentials): bool
    {
        $this->setCredentials($credentials);

        if (empty($this->apiKey) || empty($this->steamId)) {
            Log::error('Steam authentication failed: missing credentials', [
                'has_api_key' => !empty($this->apiKey),
                'has_steam_id' => !empty($this->steamId)
            ]);
            return false;
        }

        try {
            // Validate by fetching user summary
            $response = $this->makeRequest('GET', "{$this->baseUrl}/ISteamUser/GetPlayerSummaries/v2/", [
                'key' => $this->apiKey,
                'steamids' => $this->steamId,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $players = $data['response']['players'] ?? [];

                if (!empty($players)) {
                    Log::info('Steam authentication successful', [
                        'steam_id' => $this->steamId,
                        'persona_name' => $players[0]['personaname'] ?? null
                    ]);
                    return true;
                }
            }

            Log::error('Steam authentication failed: invalid response', [
                'status' => $response->status(),
                'steam_id' => $this->steamId
            ]);

        } catch (\Exception $e) {
            Log::error('Steam authentication failed', [
                'error' => $e->getMessage(),
                'steam_id' => $this->steamId
            ]);
        }

        return false;
    }

    /**
     * Test connection to Steam API
     */
    public function testConnection(): bool
    {
        return $this->authenticate([
            'api_key' => $this->apiKey,
            'user_id' => $this->steamId
        ]);
    }

    /**
     * Get available actions (triggers)
     */
    public function getAvailableActions(): array
    {
        return [
            'new_game_purchased' => [
                'name' => 'New Game Purchased',
                'description' => 'Triggers when you purchase a new game on Steam',
                'params' => []
            ],
            'achievement_unlocked' => [
                'name' => 'Achievement Unlocked',
                'description' => 'Triggers when you unlock an achievement in a game',
                'params' => [
                    'game_id' => [
                        'type' => 'integer',
                        'required' => true,
                        'description' => 'Steam App ID of the game to monitor'
                    ]
                ]
            ],
            'friend_started_playing' => [
                'name' => 'Friend Started Playing',
                'description' => 'Triggers when a Steam friend starts playing a game',
                'params' => []
            ],
            'game_time_milestone' => [
                'name' => 'Game Time Milestone',
                'description' => 'Triggers when you reach a playtime milestone in a game',
                'params' => [
                    'game_id' => [
                        'type' => 'integer',
                        'required' => true,
                        'description' => 'Steam App ID of the game'
                    ],
                    'target_hours' => [
                        'type' => 'integer',
                        'required' => true,
                        'description' => 'Target hours to reach (e.g., 100)'
                    ]
                ]
            ],
        ];
    }

    /**
     * Get available reactions (responses)
     * Note: Steam API is read-only, so no reactions are available
     */
    public function getAvailableReactions(): array
    {
        return [];
    }

    /**
     * Execute an action (trigger)
     */
    public function executeAction(string $actionName, array $params): mixed
    {
        if (!$this->isAuthenticated()) {
            throw new \RuntimeException('Steam service is not authenticated');
        }

        return match($actionName) {
            'new_game_purchased' => $this->checkNewGames($params),
            'achievement_unlocked' => $this->checkNewAchievements($params),
            'friend_started_playing' => $this->checkFriendsPlaying($params),
            'game_time_milestone' => $this->checkGameTimeMilestone($params),
            default => throw new \InvalidArgumentException("Unknown action: $actionName")
        };
    }

    /**
     * Execute a reaction (response)
     * Steam API does not support write operations
     */
    public function executeReaction(string $reactionName, array $params): bool
    {
        throw new \Exception("Steam API is read-only. No reactions are available.");
    }

    /**
     * Check for newly purchased games
     */
    private function checkNewGames(array $params): array
    {
        $lastGameIds = $params['last_game_ids'] ?? [];

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/IPlayerService/GetOwnedGames/v1/", [
                'key' => $this->apiKey,
                'steamid' => $this->steamId,
                'include_appinfo' => 1,
                'include_played_free_games' => 1,
            ]);

            if (!$response->successful()) {
                Log::warning('Failed to fetch owned games', [
                    'status' => $response->status(),
                    'steam_id' => $this->steamId
                ]);
                return [];
            }

            $data = $response->json();
            $games = $data['response']['games'] ?? [];

            $currentGameIds = array_column($games, 'appid');
            $newGameIds = array_diff($currentGameIds, $lastGameIds);

            if (empty($newGameIds)) {
                return [];
            }

            $newGames = array_filter($games, function($game) use ($newGameIds) {
                return in_array($game['appid'], $newGameIds);
            });

            return array_map(function($game) {
                return [
                    'game_id' => $game['appid'],
                    'game_name' => $game['name'],
                    'playtime_forever' => $game['playtime_forever'] ?? 0,
                    'img_icon_url' => "https://media.steampowered.com/steamcommunity/public/images/apps/{$game['appid']}/{$game['img_icon_url']}.jpg",
                    'detected_at' => now()->toIso8601String(),
                ];
            }, array_values($newGames));

        } catch (\Exception $e) {
            Log::error('Failed to check Steam owned games', [
                'error' => $e->getMessage(),
                'steam_id' => $this->steamId
            ]);
            return [];
        }
    }

    /**
     * Check for newly unlocked achievements
     */
    private function checkNewAchievements(array $params): array
    {
        $this->validateParams($params, ['game_id']);

        $gameId = $params['game_id'];
        $lastAchievementIds = $params['last_achievement_ids'] ?? [];

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/ISteamUserStats/GetPlayerAchievements/v1/", [
                'key' => $this->apiKey,
                'steamid' => $this->steamId,
                'appid' => $gameId,
            ]);

            if (!$response->successful()) {
                Log::warning('Failed to fetch achievements', [
                    'status' => $response->status(),
                    'game_id' => $gameId,
                    'steam_id' => $this->steamId
                ]);
                return [];
            }

            $data = $response->json();

            if (!isset($data['playerstats']['success']) || !$data['playerstats']['success']) {
                return [];
            }

            $achievements = $data['playerstats']['achievements'] ?? [];

            // Filter only unlocked achievements
            $unlockedAchievements = array_filter($achievements, function($achievement) {
                return $achievement['achieved'] === 1;
            });

            $currentAchievementNames = array_column($unlockedAchievements, 'apiname');
            $newAchievementNames = array_diff($currentAchievementNames, $lastAchievementIds);

            if (empty($newAchievementNames)) {
                return [];
            }

            $newAchievements = array_filter($unlockedAchievements, function($achievement) use ($newAchievementNames) {
                return in_array($achievement['apiname'], $newAchievementNames);
            });

            return array_map(function($achievement) use ($gameId) {
                return [
                    'achievement_id' => $achievement['apiname'],
                    'achievement_name' => $achievement['name'] ?? $achievement['apiname'],
                    'description' => $achievement['description'] ?? '',
                    'game_id' => $gameId,
                    'unlocked_at' => $achievement['unlocktime'] ?? now()->timestamp,
                    'detected_at' => now()->toIso8601String(),
                ];
            }, array_values($newAchievements));

        } catch (\Exception $e) {
            Log::error('Failed to check Steam achievements', [
                'game_id' => $gameId,
                'error' => $e->getMessage(),
                'steam_id' => $this->steamId
            ]);
            return [];
        }
    }

    /**
     * Check for friends currently playing games
     */
    private function checkFriendsPlaying(array $params): array
    {
        try {
            // Get friends list
            $response = $this->makeRequest('GET', "{$this->baseUrl}/ISteamUser/GetFriendList/v1/", [
                'key' => $this->apiKey,
                'steamid' => $this->steamId,
                'relationship' => 'friend',
            ]);

            if (!$response->successful()) {
                Log::warning('Failed to fetch friends list', [
                    'status' => $response->status(),
                    'steam_id' => $this->steamId
                ]);
                return [];
            }

            $data = $response->json();
            $friends = $data['friendslist']['friends'] ?? [];

            if (empty($friends)) {
                return [];
            }

            // Get steamids of friends (limit to 100)
            $friendIds = array_column($friends, 'steamid');
            $friendIdsString = implode(',', array_slice($friendIds, 0, 100));

            // Get their current game status
            $response = $this->makeRequest('GET', "{$this->baseUrl}/ISteamUser/GetPlayerSummaries/v2/", [
                'key' => $this->apiKey,
                'steamids' => $friendIdsString,
            ]);

            if (!$response->successful()) {
                return [];
            }

            $data = $response->json();
            $players = $data['response']['players'] ?? [];

            // Filter only those currently playing
            $playingFriends = array_filter($players, function($player) {
                return isset($player['gameid']);
            });

            return array_map(function($player) {
                return [
                    'friend_id' => $player['steamid'],
                    'friend_name' => $player['personaname'],
                    'game_id' => $player['gameid'],
                    'game_name' => $player['gameextrainfo'] ?? 'Unknown Game',
                    'avatar_url' => $player['avatarfull'] ?? '',
                    'detected_at' => now()->toIso8601String(),
                ];
            }, array_values($playingFriends));

        } catch (\Exception $e) {
            Log::error('Failed to check Steam friends playing', [
                'error' => $e->getMessage(),
                'steam_id' => $this->steamId
            ]);
            return [];
        }
    }

    /**
     * Check if game time milestone has been reached
     */
    private function checkGameTimeMilestone(array $params): array
    {
        $this->validateParams($params, ['game_id', 'target_hours']);

        $gameId = $params['game_id'];
        $targetHours = $params['target_hours'];

        try {
            $response = $this->makeRequest('GET', "{$this->baseUrl}/IPlayerService/GetOwnedGames/v1/", [
                'key' => $this->apiKey,
                'steamid' => $this->steamId,
                'appids_filter' => [$gameId],
                'include_appinfo' => 1,
            ]);

            if (!$response->successful()) {
                return [];
            }

            $data = $response->json();
            $games = $data['response']['games'] ?? [];

            if (empty($games)) {
                return [];
            }

            $game = $games[0];
            $playtimeMinutes = $game['playtime_forever'] ?? 0;
            $playtimeHours = round($playtimeMinutes / 60, 1);

            // Check if milestone reached
            if ($playtimeHours >= $targetHours) {
                return [[
                    'game_id' => $game['appid'],
                    'game_name' => $game['name'],
                    'playtime_hours' => $playtimeHours,
                    'target_hours' => $targetHours,
                    'milestone_reached' => true,
                    'detected_at' => now()->toIso8601String(),
                ]];
            }

            return [];

        } catch (\Exception $e) {
            Log::error('Failed to check Steam game time milestone', [
                'game_id' => $gameId,
                'error' => $e->getMessage(),
                'steam_id' => $this->steamId
            ]);
            return [];
        }
    }

    /**
     * Get headers for Steam API requests
     */
    protected function getHeaders(): array
    {
        return [
            'Accept' => 'application/json',
        ];
    }
}
