<?php

namespace App\Services\Implementations;

use App\Services\Base\BaseService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Discord Service Implementation
 *
 * Integrates with Discord API to provide messaging and notification functionality.
 * Supports monitoring messages, keywords, and mentions, as well as sending messages and embeds.
 *
 * Authentication: Bot Token + Webhook URL
 * API Documentation: https://discord.com/developers/docs/intro
 *
 * Important Notes:
 * 1. Requires Discord Bot Token for reading messages
 * 2. Requires Webhook URL for sending messages
 * 3. Bot needs appropriate permissions in the server
 * 4. Rate limits: 50 requests per second per bot
 *
 * Design Decisions:
 * 1. Using Bot Token for authentication
 * 2. Using Webhooks for sending messages (simpler than bot commands)
 * 3. Channel IDs are required for monitoring
 * 4. State tracking for last_message_id to avoid duplicates
 */
class DiscordService extends BaseService
{
    protected string $name = 'Discord';
    protected string $description = 'Chat and notification integration for Discord servers';
    protected string $authType = 'bot_token';
    protected ?string $icon = 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico';
    protected ?string $color = '#5865F2';

    private string $baseUrl = 'https://discord.com/api/v10';
    private ?string $botToken = null;
    private ?string $webhookUrl = null;

    /**
     * Validate that required credentials are present
     */
    protected function validateCredentials(): bool
    {
        return isset($this->credentials['bot_token']) &&
               !empty($this->credentials['bot_token']) &&
               isset($this->credentials['webhook_url']) &&
               !empty($this->credentials['webhook_url']);
    }

    /**
     * Set credentials and initialize bot token and webhook URL
     */
    public function setCredentials(array $credentials): void
    {
        parent::setCredentials($credentials);
        $this->botToken = $credentials['bot_token'] ?? config('services.discord.bot_token');
        $this->webhookUrl = $credentials['webhook_url'] ?? config('services.discord.webhook_url');
    }

    /**
     * Authenticate with Discord API
     */
    public function authenticate(array $credentials): bool
    {
        $this->setCredentials($credentials);

        if (empty($this->botToken) || empty($this->webhookUrl)) {
            Log::error('Discord authentication failed: missing credentials', [
                'has_bot_token' => !empty($this->botToken),
                'has_webhook_url' => !empty($this->webhookUrl)
            ]);
            return false;
        }

        try {
            // Validate by fetching bot user information
            $response = Http::withHeaders([
                'Authorization' => "Bot {$this->botToken}",
                'Content-Type' => 'application/json',
            ])->get("{$this->baseUrl}/users/@me");

            if ($response->successful()) {
                $data = $response->json();
                Log::info('Discord authentication successful', [
                    'bot_username' => $data['username'] ?? null,
                    'bot_id' => $data['id'] ?? null
                ]);
                return true;
            }

            Log::error('Discord authentication failed: invalid response', [
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
     * Test the connection
     */
    public function testConnection(): bool
    {
        try {
            if (empty($this->botToken)) {
                return false;
            }

            $response = Http::withHeaders([
                'Authorization' => "Bot {$this->botToken}",
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
            'new_message_in_channel' => $this->checkNewMessages($params),
            'message_with_keyword' => $this->checkMessagesWithKeyword($params),
            'bot_mentioned' => $this->checkBotMentions($params),
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
     * ACTION: Check for new messages in a channel
     *
     * Monitors a specific Discord channel for new messages
     *
     * @param array $params ['channel_id' => string, 'last_message_id' => string|null]
     * @return array Array of new messages
     */
    private function checkNewMessages(array $params): array
    {
        $this->validateParams($params, ['channel_id']);
        $channelId = $params['channel_id'];
        $lastMessageId = $params['last_message_id'] ?? null;

        try {
            $url = "{$this->baseUrl}/channels/{$channelId}/messages";
            $queryParams = ['limit' => 50];

            if ($lastMessageId) {
                $queryParams['after'] = $lastMessageId;
            }

            $response = Http::withHeaders([
                'Authorization' => "Bot {$this->botToken}",
            ])->get($url, $queryParams);

            if (!$response->successful()) {
                Log::error('Failed to fetch Discord messages', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return [];
            }

            $messages = $response->json();

            if (empty($messages)) {
                return [];
            }

            // Transform messages to standard format
            return array_map(function ($message) {
                return [
                    'message_id' => $message['id'],
                    'content' => $message['content'] ?? '',
                    'author' => $message['author']['username'] ?? 'Unknown',
                    'author_id' => $message['author']['id'] ?? null,
                    'timestamp' => $message['timestamp'] ?? now()->toISOString(),
                    'channel_id' => $message['channel_id'] ?? null,
                ];
            }, $messages);

        } catch (\Throwable $e) {
            Log::error('Discord checkNewMessages error', [
                'error' => $e->getMessage(),
                'channel_id' => $channelId
            ]);
            return [];
        }
    }

    /**
     * ACTION: Check for messages containing a specific keyword
     *
     * Monitors messages in a channel for specific keywords
     *
     * @param array $params ['channel_id' => string, 'keyword' => string, 'last_message_id' => string|null]
     * @return array Array of messages containing the keyword
     */
    private function checkMessagesWithKeyword(array $params): array
    {
        $this->validateParams($params, ['channel_id', 'keyword']);
        $keyword = strtolower($params['keyword']);

        // First get all new messages
        $allMessages = $this->checkNewMessages($params);

        // Filter messages containing the keyword
        return array_filter($allMessages, function ($message) use ($keyword) {
            return stripos($message['content'], $keyword) !== false;
        });
    }

    /**
     * ACTION: Check for bot mentions
     *
     * Monitors when the bot is mentioned in messages
     *
     * @param array $params ['channel_id' => string, 'bot_id' => string, 'last_message_id' => string|null]
     * @return array Array of messages mentioning the bot
     */
    private function checkBotMentions(array $params): array
    {
        $this->validateParams($params, ['channel_id']);

        // Get bot ID if not provided
        if (!isset($params['bot_id'])) {
            $botInfo = $this->getBotInfo();
            $params['bot_id'] = $botInfo['id'] ?? null;
        }

        if (!$params['bot_id']) {
            Log::error('Discord bot ID not available for mention check');
            return [];
        }

        $botId = $params['bot_id'];

        // Get all new messages
        $allMessages = $this->checkNewMessages($params);

        // Filter messages mentioning the bot
        return array_filter($allMessages, function ($message) use ($botId) {
            return stripos($message['content'], "<@{$botId}>") !== false ||
                   stripos($message['content'], "<@!{$botId}>") !== false;
        });
    }

    /**
     * REACTION: Send a simple message to Discord
     *
     * Sends a text message via webhook
     *
     * @param array $params ['content' => string]
     * @return bool Success status
     */
    private function sendMessage(array $params): bool
    {
        $this->validateParams($params, ['content']);

        try {
            $response = Http::post($this->webhookUrl, [
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
     * @param array $params ['title' => string, 'description' => string, 'color' => int|null, 'fields' => array|null]
     * @return bool Success status
     */
    private function sendEmbed(array $params): bool
    {
        $this->validateParams($params, ['title', 'description']);

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

            $response = Http::post($this->webhookUrl, [
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
     * Get bot information
     */
    private function getBotInfo(): array
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => "Bot {$this->botToken}",
            ])->get("{$this->baseUrl}/users/@me");

            if ($response->successful()) {
                return $response->json();
            }

            return [];
        } catch (\Throwable $e) {
            Log::error('Failed to get Discord bot info', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get available actions
     */
    public function getAvailableActions(): array
    {
        return [
            'new_message_in_channel' => [
                'name' => 'New Message in Channel',
                'description' => 'Triggers when a new message is posted in a specific Discord channel',
                'params' => [
                    'channel_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Discord Channel ID to monitor',
                        'placeholder' => '123456789012345678'
                    ]
                ]
            ],
            'message_with_keyword' => [
                'name' => 'Message with Keyword',
                'description' => 'Triggers when a message contains a specific keyword',
                'params' => [
                    'channel_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Discord Channel ID to monitor',
                        'placeholder' => '123456789012345678'
                    ],
                    'keyword' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Keyword to search for in messages',
                        'placeholder' => 'important'
                    ]
                ]
            ],
            'bot_mentioned' => [
                'name' => 'Bot Mentioned',
                'description' => 'Triggers when the bot is mentioned in a message',
                'params' => [
                    'channel_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Discord Channel ID to monitor',
                        'placeholder' => '123456789012345678'
                    ]
                ]
            ]
        ];
    }

    /**
     * Get available reactions
     */
    public function getAvailableReactions(): array
    {
        return [
            'send_message' => [
                'name' => 'Send Message',
                'description' => 'Sends a simple text message to a Discord channel via webhook',
                'params' => [
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
}
