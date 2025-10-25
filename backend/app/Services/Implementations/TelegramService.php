<?php

namespace App\Services\Implementations;

use App\Services\Base\BaseService;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Log;

/**
 * Telegram Bot Service Implementation
 *
 * Integrates with Telegram Bot API to provide AREA functionality.
 * Supports sending messages, photos, and monitoring for triggers.
 *
 * Authentication: Requires Bot Token from BotFather
 * Rate Limits: 30 messages per second per bot
 *
 * Design Decisions:
 * 1. Used Bot API instead of MTProto for simplicity and stability
 * 2. Implemented polling for demo (webhooks recommended for production)
 * 3. Chat ID can be numeric or @username format
 * 4. All text messages are sent with parse_mode='Markdown' for formatting
 *
 * Security Considerations:
 * 1. Bot token is stored encrypted in database
 * 2. Chat IDs are validated before API calls
 * 3. Message content is sanitized for Telegram's requirements
 * 4. Rate limiting is implemented to respect Telegram's limits
 */
class TelegramService extends BaseService
{
    protected string $name = 'Telegram';
    protected string $description = 'Send messages and monitor Telegram chats via Bot API';
    protected string $authType = 'api_key';
    protected ?string $icon = 'https://telegram.org/img/t_logo.png';
    protected ?string $color = '#0088cc';

    private string $baseUrl = 'https://api.telegram.org/bot';
    private ?string $botToken = null;

    public function __construct()
    {
        // Bot token will be set via setCredentials when user connects
    }

    /**
     * Validate that required credentials are present
     */
    protected function validateCredentials(): bool
    {
        return isset($this->credentials['bot_token']) &&
               !empty($this->credentials['bot_token']) &&
               $this->isValidBotToken($this->credentials['bot_token']);
    }

    /**
     * Validate bot token format (basic check)
     */
    private function isValidBotToken(string $token): bool
    {
        // Telegram bot tokens follow pattern: <bot_id>:<auth_token>
        // Example: 123456789:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
        // Auth token length can vary, typically 20-50 characters
        return preg_match('/^\d+:[A-Za-z0-9_-]{20,50}$/', $token) === 1;
    }

    /**
     * Set credentials and initialize bot token
     */
    public function setCredentials(array $credentials): void
    {
        parent::setCredentials($credentials);
        $this->botToken = $credentials['bot_token'] ?? null;
    }

    /**
     * Get available actions (triggers)
     */
    public function getAvailableActions(): array
    {
        return [
            'new_message_in_chat' => [
                'name' => 'New Message in Chat',
                'description' => 'Triggers when a new message is received in specified chat',
                'params' => [
                    'chat_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Chat ID (numeric) or username (@username)',
                        'example' => '@mychannel or -1001234567890'
                    ]
                ],
                'returns' => [
                    'message_id' => 'Unique message ID',
                    'text' => 'Message content',
                    'from' => 'Sender information',
                    'date' => 'Message timestamp',
                    'chat' => 'Chat information'
                ]
            ],
            'message_contains_keyword' => [
                'name' => 'Message Contains Keyword',
                'description' => 'Triggers when you receive a message containing specific keyword(s)',
                'params' => [
                    'keyword' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Keyword to search for in messages (case-insensitive)',
                        'placeholder' => 'urgent'
                    ],
                    'exact_match' => [
                        'type' => 'boolean',
                        'required' => false,
                        'default' => false,
                        'description' => 'Whether to match exact word or substring'
                    ]
                ],
                'returns' => [
                    'message_id' => 'Message ID that matched',
                    'text' => 'Full message text',
                    'matched_keyword' => 'The keyword that was found',
                    'from' => 'Sender information'
                ]
            ],
            'bot_mentioned' => [
                'name' => 'Bot Mentioned',
                'description' => 'Triggers when the bot is mentioned in a group chat',
                'params' => [
                    'chat_id' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'Specific chat ID to monitor (optional - monitors all if empty)'
                    ]
                ],
                'returns' => [
                    'message_id' => 'Message ID',
                    'text' => 'Message that mentioned the bot',
                    'from' => 'User who mentioned the bot',
                    'chat' => 'Chat where mention occurred'
                ]
            ]
        ];
    }

    /**
     * Get available reactions (responses)
     */
    public function getAvailableReactions(): array
    {
        return [
            'send_message' => [
                'name' => 'Send Message',
                'description' => 'Send a text message to a chat',
                'params' => [
                    'chat_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Target chat ID or username'
                    ],
                    'text' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Message text (supports Markdown formatting)',
                        'max_length' => 4096
                    ],
                    'parse_mode' => [
                        'type' => 'string',
                        'required' => false,
                        'default' => 'Markdown',
                        'options' => ['Markdown', 'HTML', null],
                        'description' => 'Message formatting mode'
                    ],
                    'disable_notification' => [
                        'type' => 'boolean',
                        'required' => false,
                        'default' => false,
                        'description' => 'Send silently without notification sound'
                    ]
                ]
            ],
            'send_photo' => [
                'name' => 'Send Photo',
                'description' => 'Send a photo to a chat',
                'params' => [
                    'chat_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Target chat ID or username'
                    ],
                    'photo_url' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'URL of the photo to send (must be accessible)'
                    ],
                    'caption' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'Photo caption',
                        'max_length' => 1024
                    ],
                    'parse_mode' => [
                        'type' => 'string',
                        'required' => false,
                        'default' => 'Markdown',
                        'description' => 'Caption formatting mode'
                    ]
                ]
            ],
            'send_document' => [
                'name' => 'Send Document',
                'description' => 'Send a document/file to a chat',
                'params' => [
                    'chat_id' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'Target chat ID or username'
                    ],
                    'document_url' => [
                        'type' => 'string',
                        'required' => true,
                        'description' => 'URL of the document to send'
                    ],
                    'caption' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'Document caption'
                    ],
                    'filename' => [
                        'type' => 'string',
                        'required' => false,
                        'description' => 'Custom filename for the document'
                    ]
                ]
            ]
        ];
    }

    /**
     * Authenticate with Telegram Bot API
     */
    public function authenticate(array $credentials): bool
    {
        if (!isset($credentials['bot_token'])) {
            return false;
        }

        $this->setCredentials($credentials);

        try {
            // Test the bot token by calling getMe
            return $this->testConnection();
        } catch (\Exception $e) {
            Log::error("Telegram authentication failed", [
                'error' => $e->getMessage(),
                'token_format_valid' => $this->isValidBotToken($credentials['bot_token'])
            ]);
            return false;
        }
    }

    /**
     * Test connection to Telegram API
     */
    public function testConnection(): bool
    {
        if (!$this->botToken) {
            return false;
        }

        try {
            $response = $this->makeRequest('GET', $this->baseUrl . $this->botToken . '/getMe');

            if ($response->successful()) {
                $data = $response->json();

                Log::info("Telegram bot connection successful", [
                    'bot_id' => $data['result']['id'] ?? null,
                    'bot_username' => $data['result']['username'] ?? null,
                    'bot_name' => $data['result']['first_name'] ?? null,
                ]);

                return $data['ok'] ?? false;
            }

            return false;
        } catch (\Exception $e) {
            Log::error("Telegram connection test failed", [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Setup webhook for automatic chat_id detection
     *
     * @return bool Success status
     */
    public function setupWebhook(): bool
    {
        if (!$this->botToken) {
            Log::error('Cannot setup webhook: bot token not set');
            return false;
        }

        $webhookUrl = config('services.telegram.webhook_url');

        if (!$webhookUrl) {
            Log::warning('Telegram webhook URL not configured in services config');
            return false;
        }

        try {
            $response = $this->makeRequest(
                'POST',
                $this->baseUrl . $this->botToken . '/setWebhook',
                [
                    'url' => $webhookUrl,
                    'drop_pending_updates' => true,
                    'allowed_updates' => ['message'], // Only listen for messages
                ]
            );

            if ($response->successful()) {
                $data = $response->json();

                Log::info('Telegram webhook configured successfully', [
                    'webhook_url' => $webhookUrl,
                    'description' => $data['description'] ?? null,
                ]);

                return $data['ok'] ?? false;
            }

            Log::error('Failed to setup Telegram webhook', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('Error setting up Telegram webhook', [
                'error' => $e->getMessage(),
                'webhook_url' => $webhookUrl,
            ]);
            return false;
        }
    }

    /**
     * Get current webhook info
     *
     * @return array|null Webhook information
     */
    public function getWebhookInfo(): ?array
    {
        if (!$this->botToken) {
            return null;
        }

        try {
            $response = $this->makeRequest(
                'GET',
                $this->baseUrl . $this->botToken . '/getWebhookInfo'
            );

            if ($response->successful()) {
                $data = $response->json();
                return $data['result'] ?? null;
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Error getting webhook info', [
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Execute an action (trigger)
     */
    public function executeAction(string $actionName, array $params): mixed
    {
        if (!$this->isAuthenticated()) {
            throw new \RuntimeException('Telegram service is not authenticated');
        }

        return match($actionName) {
            'new_message_in_chat' => $this->checkNewMessages($params),
            'message_contains_keyword' => $this->checkKeywordMessages($params),
            'bot_mentioned' => $this->checkBotMentions($params),
            default => throw new \InvalidArgumentException("Unknown action: $actionName")
        };
    }

    /**
     * Execute a reaction (response)
     */
    public function executeReaction(string $reactionName, array $params): bool
    {
        if (!$this->isAuthenticated()) {
            throw new \RuntimeException('Telegram service is not authenticated');
        }

        return match($reactionName) {
            'send_message' => $this->sendMessage($params),
            'send_photo' => $this->sendPhoto($params),
            'send_document' => $this->sendDocument($params),
            default => throw new \InvalidArgumentException("Unknown reaction: $reactionName")
        };
    }

    /**
     * Check for new messages in a chat
     * Note: This is a simplified implementation using getUpdates
     * Production should use webhooks for real-time processing
     */
    private function checkNewMessages(array $params): array
    {
        $this->validateParams($params, ['chat_id']);

        try {
            $response = $this->makeRequest('GET', $this->baseUrl . $this->botToken . '/getUpdates', [
                'limit' => 10,
                'timeout' => 0,
            ]);

            if (!$response->successful()) {
                throw new \RuntimeException($this->handleApiError($response));
            }

            $data = $response->json();
            $messages = [];

            if (isset($data['result'])) {
                foreach ($data['result'] as $update) {
                    if (isset($update['message'])) {
                        $message = $update['message'];

                        // Check if message is from the specified chat
                        $chatId = (string) $message['chat']['id'];
                        $targetChatId = $this->normalizeChatId($params['chat_id']);

                        if ($chatId === $targetChatId || $this->chatMatches($message['chat'], $targetChatId)) {
                            $messages[] = [
                                'message_id' => $message['message_id'],
                                'text' => $message['text'] ?? '[Non-text message]',
                                'from' => [
                                    'id' => $message['from']['id'],
                                    'username' => $message['from']['username'] ?? null,
                                    'first_name' => $message['from']['first_name'] ?? null,
                                ],
                                'date' => $message['date'],
                                'chat' => [
                                    'id' => $message['chat']['id'],
                                    'type' => $message['chat']['type'],
                                    'title' => $message['chat']['title'] ?? null,
                                ]
                            ];
                        }
                    }
                }
            }

            return $messages;

        } catch (\Exception $e) {
            Log::error("Failed to check new messages", [
                'chat_id' => $params['chat_id'],
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Check for messages containing specific keywords
     */
    private function checkKeywordMessages(array $params): array
    {
        $this->validateParams($params, ['keyword']);

        // Use chat_id from credentials if not provided in params
        if (!isset($params['chat_id'])) {
            $params['chat_id'] = $this->credentials['chat_id'] ?? null;
        }

        if (!$params['chat_id']) {
            Log::warning('No chat_id available for keyword message check');
            return [];
        }

        $messages = $this->checkNewMessages($params);
        $keyword = strtolower($params['keyword']);
        $exactMatch = $params['exact_match'] ?? false;
        $matchedMessages = [];

        foreach ($messages as $message) {
            $text = strtolower($message['text']);
            $matched = false;

            if ($exactMatch) {
                // Match whole words only
                $matched = preg_match('/\b' . preg_quote($keyword, '/') . '\b/', $text);
            } else {
                // Substring match
                $matched = str_contains($text, $keyword);
            }

            if ($matched) {
                $message['matched_keyword'] = $keyword;
                $matchedMessages[] = $message;
            }
        }

        return $matchedMessages;
    }

    /**
     * Check for bot mentions
     */
    private function checkBotMentions(array $params): array
    {
        // Get bot info first to know the bot username
        $botInfo = $this->getBotInfo();
        if (!$botInfo) {
            return [];
        }

        $botUsername = '@' . $botInfo['username'];

        // If specific chat_id provided, check that chat; otherwise check all
        if (!empty($params['chat_id'])) {
            $messages = $this->checkNewMessages($params);
        } else {
            $messages = $this->checkNewMessages(['chat_id' => 'all']); // This would need modification
        }

        $mentions = [];
        foreach ($messages as $message) {
            if (str_contains(strtolower($message['text']), strtolower($botUsername))) {
                $mentions[] = $message;
            }
        }

        return $mentions;
    }

    /**
     * Send a text message
     */
    private function sendMessage(array $params): bool
    {
        $this->validateParams($params, ['chat_id', 'text']);

        // Validate message length
        if (strlen($params['text']) > 4096) {
            throw new \InvalidArgumentException('Message text too long (max 4096 characters)');
        }

        try {
            $requestData = [
                'chat_id' => $this->normalizeChatId($params['chat_id']),
                'text' => $params['text'],
                'parse_mode' => $params['parse_mode'] ?? 'Markdown',
            ];

            if (isset($params['disable_notification'])) {
                $requestData['disable_notification'] = $params['disable_notification'];
            }

            $response = $this->makeRequest(
                'POST',
                $this->baseUrl . $this->botToken . '/sendMessage',
                $requestData
            );

            if ($response->successful()) {
                $data = $response->json();
                Log::info("Message sent successfully", [
                    'chat_id' => $params['chat_id'],
                    'message_id' => $data['result']['message_id'] ?? null
                ]);
                return $data['ok'] ?? false;
            }

            Log::warning("Failed to send message", [
                'chat_id' => $params['chat_id'],
                'status' => $response->status(),
                'error' => $response->body()
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error("Error sending message", [
                'chat_id' => $params['chat_id'],
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send a photo
     */
    private function sendPhoto(array $params): bool
    {
        $this->validateParams($params, ['chat_id', 'photo_url']);

        try {
            $requestData = [
                'chat_id' => $this->normalizeChatId($params['chat_id']),
                'photo' => $params['photo_url'],
            ];

            if (!empty($params['caption'])) {
                if (strlen($params['caption']) > 1024) {
                    throw new \InvalidArgumentException('Caption too long (max 1024 characters)');
                }
                $requestData['caption'] = $params['caption'];
                $requestData['parse_mode'] = $params['parse_mode'] ?? 'Markdown';
            }

            $response = $this->makeRequest(
                'POST',
                $this->baseUrl . $this->botToken . '/sendPhoto',
                $requestData
            );

            if ($response->successful()) {
                $data = $response->json();
                Log::info("Photo sent successfully", [
                    'chat_id' => $params['chat_id'],
                    'message_id' => $data['result']['message_id'] ?? null
                ]);
                return $data['ok'] ?? false;
            }

            return false;

        } catch (\Exception $e) {
            Log::error("Error sending photo", [
                'chat_id' => $params['chat_id'],
                'photo_url' => $params['photo_url'],
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send a document
     */
    private function sendDocument(array $params): bool
    {
        $this->validateParams($params, ['chat_id', 'document_url']);

        try {
            $requestData = [
                'chat_id' => $this->normalizeChatId($params['chat_id']),
                'document' => $params['document_url'],
            ];

            if (!empty($params['caption'])) {
                $requestData['caption'] = $params['caption'];
            }

            if (!empty($params['filename'])) {
                // Note: Telegram API doesn't directly support custom filenames via URL
                // This would require uploading the file directly
                Log::warning("Custom filename not supported when sending via URL", [
                    'filename' => $params['filename']
                ]);
            }

            $response = $this->makeRequest(
                'POST',
                $this->baseUrl . $this->botToken . '/sendDocument',
                $requestData
            );

            if ($response->successful()) {
                $data = $response->json();
                return $data['ok'] ?? false;
            }

            return false;

        } catch (\Exception $e) {
            Log::error("Error sending document", [
                'chat_id' => $params['chat_id'],
                'document_url' => $params['document_url'],
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get bot information
     */
    private function getBotInfo(): ?array
    {
        try {
            $response = $this->makeRequest('GET', $this->baseUrl . $this->botToken . '/getMe');

            if ($response->successful()) {
                $data = $response->json();
                return $data['result'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Normalize chat ID for API calls
     */
    private function normalizeChatId(string $chatId): string
    {
        // Remove @ prefix if present and add it back for username format
        $chatId = trim($chatId);

        if (str_starts_with($chatId, '@')) {
            return $chatId; // Already formatted username
        }

        if (is_numeric($chatId)) {
            return $chatId; // Numeric chat ID
        }

        // Assume it's a username without @
        return '@' . $chatId;
    }

    /**
     * Check if a chat matches the target chat ID
     */
    private function chatMatches(array $chat, string $targetChatId): bool
    {
        $chatId = (string) $chat['id'];

        // Direct ID match
        if ($chatId === $targetChatId) {
            return true;
        }

        // Username match
        if (isset($chat['username']) && ('@' . $chat['username']) === $targetChatId) {
            return true;
        }

        return false;
    }

    /**
     * Get headers for Telegram API requests
     */
    protected function getHeaders(): array
    {
        return array_merge(parent::getHeaders(), [
            'Accept' => 'application/json',
        ]);
    }

    /**
     * Handle Telegram-specific API errors
     */
    protected function handleApiError(Response $response): string
    {
        $body = $response->json();
        $errorCode = $body['error_code'] ?? $response->status();
        $description = $body['description'] ?? 'Unknown error';

        // Telegram-specific error codes
        return match ($errorCode) {
            400 => "Bad Request: $description",
            401 => 'Unauthorized: Invalid bot token',
            403 => "Forbidden: $description (bot may be blocked or insufficient permissions)",
            404 => 'Not Found: Chat not found or bot not added to chat',
            429 => 'Too Many Requests: Rate limit exceeded',
            default => parent::handleApiError($response)
        };
    }
}