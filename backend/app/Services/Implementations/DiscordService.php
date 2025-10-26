<?php

namespace App\Services\Implementations;

use App\Services\Base\BaseService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Discord Service Implementation
 *
 * Integrates with Discord API to provide user authentication and guild information.
 * Supports OAuth2 authentication to access user profile and guilds.
 *
 * Authentication: OAuth2
 * API Documentation: https://discord.com/developers/docs/intro
 *
 * Important Notes:
 * 1. OAuth2 scopes: identify, email, guilds
 * 2. Bot Token still used for webhook actions/reactions (from config)
 * 3. OAuth2 provides: user ID, username, email, guilds list
 * 4. Rate limits: 50 requests per second
 *
 * Design Decisions:
 * 1. OAuth2 for user authentication and data access
 * 2. Bot Token (from config) for webhook reactions
 * 3. Hybrid approach: OAuth2 auth + Bot functionality
 * 4. State tracking for guild changes detection
 */
class DiscordService extends BaseService
{
    protected string $name = 'Discord';
    protected string $description = 'Chat and notification integration for Discord servers';
    protected string $authType = 'oauth2';
    protected ?string $icon = 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico';
    protected ?string $color = '#5865F2';

    private string $baseUrl = 'https://discord.com/api/v10';
    private ?string $accessToken = null;

    /**
     * Validate that required credentials are present (OAuth2 token)
     */
    protected function validateCredentials(): bool
    {
        return isset($this->credentials['access_token']) &&
               !empty($this->credentials['access_token']);
    }

    /**
     * Set credentials and initialize OAuth2 access token
     */
    public function setCredentials(array $credentials): void
    {
        parent::setCredentials($credentials);
        $this->accessToken = $credentials['access_token'] ?? null;
    }

    /**
     * Authenticate with Discord API using OAuth2
     */
    public function authenticate(array $credentials): bool
    {
        $this->setCredentials($credentials);

        if (empty($this->accessToken)) {
            Log::error('Discord OAuth2 authentication failed: missing access token');
            return false;
        }

        try {
            // Validate by fetching user information with OAuth2 token
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'Content-Type' => 'application/json',
            ])->get("{$this->baseUrl}/users/@me");

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Discord OAuth2 authentication successful', [
                    'username' => $data['username'] ?? null,
                    'user_id' => $data['id'] ?? null,
                    'email' => $data['email'] ?? null
                ]);
                return true;
            }

            Log::error('Discord OAuth2 authentication failed: invalid response', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return false;

        } catch (\Throwable $e) {
            Log::error('Discord authentication error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Test the connection using OAuth2 token
     */
    public function testConnection(): bool
    {
        try {
            if (empty($this->accessToken)) {
                return false;
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
            ])->get("{$this->baseUrl}/users/@me");

            return $response->successful();
        } catch (\Throwable $e) {
            Log::error('Discord connection test failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Execute an action
     */
    public function executeAction(string $actionType, array $params = []): array
    {
        Log::info("Discord executing action: {$actionType}", [
            'params' => array_keys($params)
        ]);

        return match ($actionType) {
            'user_joined_guild' => $this->checkUserJoinedGuild($params),
            'guild_list_changed' => $this->checkGuildListChanged($params),
            'get_user_profile' => $this->getUserProfileAction($params),
            default => throw new \InvalidArgumentException("Unknown action type: {$actionType}")
        };
    }

    /**
     * Execute a reaction
     */
    public function executeReaction(string $reactionType, array $params = []): bool
    {
        Log::info("Discord executing reaction: {$reactionType}", [
            'params' => array_keys($params)
        ]);

        return match ($reactionType) {
            'send_message' => $this->sendMessage($params),
            'send_embed' => $this->sendEmbed($params),
            default => throw new \InvalidArgumentException("Unknown reaction type: {$reactionType}")
        };
    }

    /**
     * ACTION: Check if user joined a new guild
     *
     * @param array $params ['previous_guilds' => array|null]
     * @return array Returns guild info if user joined new guild
     */
    private function checkUserJoinedGuild(array $params): array
    {
        $currentGuilds = $this->getUserGuilds();

        if (empty($params['previous_guilds'])) {
            // First run, store current guilds for next check
            return [
                'triggered' => false,
                'guilds' => $currentGuilds
            ];
        }

        $previousIds = array_column($params['previous_guilds'], 'id');
        $currentIds = array_column($currentGuilds, 'id');

        $addedIds = array_diff($currentIds, $previousIds);

        if (!empty($addedIds)) {
            // Find the newly joined guild(s)
            $newGuilds = array_filter($currentGuilds, function($guild) use ($addedIds) {
                return in_array($guild['id'], $addedIds);
            });

            Log::info('Discord user joined new guild', [
                'count' => count($newGuilds),
                'guild_names' => array_column($newGuilds, 'name')
            ]);

            return [
                'triggered' => true,
                'new_guilds' => array_values($newGuilds),
                'guilds' => $currentGuilds
            ];
        }

        return [
            'triggered' => false,
            'guilds' => $currentGuilds
        ];
    }

    /**
     * ACTION: Check if guild list changed
     *
     * @param array $params ['previous_guilds' => array|null]
     * @return array Returns change info if guild list changed
     */
    private function checkGuildListChanged(array $params): array
    {
        $currentGuilds = $this->getUserGuilds();

        if (empty($params['previous_guilds'])) {
            // First run, store current guilds for next check
            return [
                'triggered' => false,
                'guilds' => $currentGuilds
            ];
        }

        $previousIds = array_column($params['previous_guilds'], 'id');
        $currentIds = array_column($currentGuilds, 'id');

        $added = array_diff($currentIds, $previousIds);
        $removed = array_diff($previousIds, $currentIds);

        if (!empty($added) || !empty($removed)) {
            Log::info('Discord guild list changed', [
                'added' => count($added),
                'removed' => count($removed)
            ]);

            return [
                'triggered' => true,
                'added_count' => count($added),
                'removed_count' => count($removed),
                'guilds' => $currentGuilds
            ];
        }

        return [
            'triggered' => false,
            'guilds' => $currentGuilds
        ];
    }

    /**
     * ACTION: Get user profile
     *
     * @param array $params
     * @return array User profile data
     */
    private function getUserProfileAction(array $params): array
    {
        $profile = $this->getUserProfile();

        if ($profile) {
            return [
                'triggered' => true,
                'profile' => [
                    'id' => $profile['id'] ?? null,
                    'username' => $profile['username'] ?? null,
                    'discriminator' => $profile['discriminator'] ?? null,
                    'email' => $profile['email'] ?? null,
                    'avatar' => $profile['avatar'] ?? null,
                    'verified' => $profile['verified'] ?? false,
                ]
            ];
        }

        return [
            'triggered' => false,
            'error' => 'Failed to fetch user profile'
        ];
    }

    /**
     * REACTION: Send a simple message to Discord
     *
     * Sends a text message via webhook
     *
     * @param array $params ['webhook_url' => string, 'content' => string, 'username' => string|null]
     * @return bool Success status
     */
    private function sendMessage(array $params): bool
    {
        $this->validateParams($params, ['webhook_url', 'content']);

        try {
            $response = Http::post($params['webhook_url'], [
                'content' => $params['content'],
                'username' => $params['username'] ?? 'AREA Bot',
            ]);

            if ($response->successful()) {
                Log::info('Discord message sent successfully');
                return true;
            }

            Log::error('Failed to send Discord message', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return false;

        } catch (\Throwable $e) {
            Log::error('Discord sendMessage error', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * REACTION: Send an embed message to Discord
     *
     * Sends a rich embed message via webhook
     *
     * @param array $params ['webhook_url' => string, 'title' => string, 'description' => string, 'color' => int|null, 'fields' => array|null]
     * @return bool Success status
     */
    private function sendEmbed(array $params): bool
    {
        $this->validateParams($params, ['webhook_url', 'title', 'description']);

        try {
            $embed = [
                'title' => $params['title'],
                'description' => $params['description'],
                'color' => $params['color'] ?? 5865242, // Discord blurple
                'timestamp' => now()->toISOString(),
            ];

            // Add optional fields
            if (isset($params['fields']) && is_array($params['fields'])) {
                $embed['fields'] = $params['fields'];
            }

            if (isset($params['footer'])) {
                $embed['footer'] = ['text' => $params['footer']];
            }

            if (isset($params['thumbnail'])) {
                $embed['thumbnail'] = ['url' => $params['thumbnail']];
            }

            if (isset($params['image'])) {
                $embed['image'] = ['url' => $params['image']];
            }

            $response = Http::post($params['webhook_url'], [
                'embeds' => [$embed],
                'username' => $params['username'] ?? 'AREA Bot',
            ]);

            if ($response->successful()) {
                Log::info('Discord embed sent successfully');
                return true;
            }

            Log::error('Failed to send Discord embed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return false;

        } catch (\Throwable $e) {
            Log::error('Discord sendEmbed error', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get available actions (OAuth2-based)
     */
    public function getAvailableActions(): array
    {
        return [
            'user_joined_guild' => [
                'name' => 'User Joined Guild',
                'description' => 'Triggers when you join a new Discord server',
                'params' => []
            ],
            'guild_list_changed' => [
                'name' => 'Guild List Changed',
                'description' => 'Triggers when your Discord server list changes (join or leave)',
                'params' => []
            ],
            'get_user_profile' => [
                'name' => 'Get User Profile',
                'description' => 'Retrieves your Discord profile information',
                'params' => []
            ]
        ];
    }

    /**
     * Get available reactions (webhook-based, requires webhook URL in credentials)
     */
    public function getAvailableReactions(): array
    {
        return [
            'send_message' => [
                'name' => 'Send Message',
                'description' => 'Sends a simple text message to a Discord channel via webhook',
                'params' => [
                    'webhook_url' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Discord Webhook URL',
                        'placeholder' => 'https://discord.com/api/webhooks/...'
                    ],
                    'content' => [
                        'type' => 'text',
                        'required' => true,
                        'description' => 'Message content to send',
                        'placeholder' => 'Hello from AREA!'
                    ],
                    'username' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'Custom username for the webhook',
                        'placeholder' => 'AREA Bot'
                    ]
                ]
            ],
            'send_embed' => [
                'name' => 'Send Embed',
                'description' => 'Sends a rich embed message to a Discord channel via webhook',
                'params' => [
                    'webhook_url' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Discord Webhook URL',
                        'placeholder' => 'https://discord.com/api/webhooks/...'
                    ],
                    'title' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Embed title',
                        'placeholder' => 'Notification'
                    ],
                    'description' => [
                        'type' => 'text',
                        'required' => true,
                        'description' => 'Embed description',
                        'placeholder' => 'Something happened!'
                    ],
                    'color' => [
                        'type' => 'number',
                        'required' => false,
                        'description' => 'Embed color (decimal)',
                        'placeholder' => '5865242'
                    ],
                    'username' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'Custom username for the webhook',
                        'placeholder' => 'AREA Bot'
                    ]
                ]
            ]
        ];
    }

    /**
     * Get Discord user profile information
     *
     * @return array|null User profile data or null on failure
     */
    public function getUserProfile(): ?array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'Content-Type' => 'application/json',
            ])->get("{$this->baseUrl}/users/@me");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to fetch Discord user profile', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return null;

        } catch (\Throwable $e) {
            Log::error('Error fetching Discord user profile', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Get user's Discord guilds (servers)
     *
     * @return array List of guilds the user is a member of
     */
    public function getUserGuilds(): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$this->accessToken}",
                'Content-Type' => 'application/json',
            ])->get("{$this->baseUrl}/users/@me/guilds");

            if ($response->successful()) {
                return $response->json();
            }

            Log::error('Failed to fetch Discord user guilds', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);
            return [];

        } catch (\Throwable $e) {
            Log::error('Error fetching Discord user guilds', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Check if user's guild list has changed
     *
     * @param array $previousGuilds Previous guild list from state
     * @return bool True if guilds have changed
     */
    public function checkGuildChanges(array $previousGuilds): bool
    {
        $currentGuilds = $this->getUserGuilds();

        // Extract guild IDs for comparison
        $previousIds = array_column($previousGuilds, 'id');
        $currentIds = array_column($currentGuilds, 'id');

        // Check if there are any differences
        $added = array_diff($currentIds, $previousIds);
        $removed = array_diff($previousIds, $currentIds);

        if (!empty($added) || !empty($removed)) {
            Log::info('Discord guild changes detected', [
                'added' => count($added),
                'removed' => count($removed)
            ]);
            return true;
        }

        return false;
    }
}
