<?php

namespace App\Http\Controllers;

use App\Models\UserServiceToken;
use App\Services\ServiceManager;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

/**
 * Telegram Webhook Controller
 *
 * Handles incoming webhook events from Telegram Bot API.
 * Primary purpose: Auto-detect chat_id when users send /start command.
 *
 * Security: This is a public endpoint (no auth) as Telegram calls it.
 * Consider adding webhook secret validation in production.
 */
class TelegramWebhookController extends Controller
{
    public function __construct(
        private ServiceManager $serviceManager
    ) {}

    /**
     * Handle incoming Telegram webhook updates
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function handle(Request $request): JsonResponse
    {
        try {
            $update = $request->all();

            Log::info('Telegram webhook received', [
                'update_id' => $update['update_id'] ?? null,
                'has_message' => isset($update['message']),
            ]);

            // Extract message data
            $message = $update['message'] ?? null;
            if (!$message) {
                return response()->json(['ok' => true]);
            }

            $chatId = $message['chat']['id'] ?? null;
            $text = $message['text'] ?? '';
            $from = $message['from'] ?? [];

            // Check if this is a /start command
            if ($text === '/start' && $chatId) {
                $this->handleStartCommand($chatId, $from);
            }

            return response()->json(['ok' => true]);

        } catch (\Exception $e) {
            Log::error('Telegram webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Always return 200 OK to Telegram to avoid retries
            return response()->json(['ok' => true]);
        }
    }

    /**
     * Handle /start command from user
     * Auto-detects and stores chat_id for the user
     */
    private function handleStartCommand(string $chatId, array $from): void
    {
        try {
            // Find the most recently connected Telegram service without a chat_id
            // This assumes the user just connected their bot and is now activating it
            $token = UserServiceToken::where('service_name', 'Telegram')
                ->whereNull('additional_data->chat_id')
                ->orWhereJsonDoesntContain('additional_data->chat_id', $chatId)
                ->latest('updated_at')
                ->first();

            if (!$token) {
                Log::warning('Received /start but no matching Telegram token found', [
                    'chat_id' => $chatId,
                    'from' => $from,
                ]);
                return;
            }

            // Store the chat_id with user info
            $token->setChatId($chatId, [
                'username' => $from['username'] ?? null,
                'first_name' => $from['first_name'] ?? null,
                'last_name' => $from['last_name'] ?? null,
            ]);

            Log::info('Chat ID auto-detected and stored', [
                'user_id' => $token->user_id,
                'chat_id' => $chatId,
                'username' => $from['username'] ?? null,
            ]);

            // Send confirmation message to user
            $this->sendConfirmationMessage($token, $chatId);

        } catch (\Exception $e) {
            Log::error('Error handling /start command', [
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send confirmation message to user after successful setup
     */
    private function sendConfirmationMessage(UserServiceToken $token, string $chatId): void
    {
        try {
            $service = $this->serviceManager->get('Telegram');
            if (!$service) {
                return;
            }

            $botToken = $token->getDecryptedAccessToken();
            if (!$botToken) {
                return;
            }

            $service->authenticate(['bot_token' => $botToken]);

            $service->executeReaction('send_message', [
                'chat_id' => $chatId,
                'text' => "✅ *Successfully connected to AREA!*\n\nYour bot is now ready to use in automations.\n\nYou can close this chat and return to AREA.",
                'parse_mode' => 'Markdown',
            ]);

            Log::info('Confirmation message sent', [
                'chat_id' => $chatId,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send confirmation message', [
                'chat_id' => $chatId,
                'error' => $e->getMessage(),
            ]);
            // Don't throw - confirmation is optional
        }
    }
}
