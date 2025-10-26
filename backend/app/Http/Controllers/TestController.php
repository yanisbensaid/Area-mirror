<?php

namespace App\Http\Controllers;

use App\Services\ServiceManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

/**
 * Test Controller
 *
 * Provides quick testing endpoints for service functionality.
 * These endpoints are for development and debugging purposes.
 */
class TestController extends Controller
{
    public function __construct(
        private ServiceManager $serviceManager
    ) {}

    /**
     * Test sending a Telegram message
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function testTelegramSend(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'chat_id' => 'nullable|string', // Made optional - will use stored chat_id if not provided
                'text' => 'required|string|max:4096',
                'parse_mode' => 'nullable|string|in:Markdown,HTML',
            ]);

            $user = Auth::user();
            $token = $user->getServiceToken('Telegram');

            if (!$token || !$token->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Telegram service not connected or token invalid',
                ], 400);
            }

            // Use stored chat_id if not provided in request
            $chatId = $validated['chat_id'] ?? $token->getChatId();

            if (!$chatId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please send /start to your bot first to complete setup, or provide a chat_id in the request',
                ], 400);
            }

            // Get Telegram service and set credentials
            $telegramService = $this->serviceManager->get('Telegram');
            if (!$telegramService) {
                return response()->json([
                    'success' => false,
                    'message' => 'Telegram service not available',
                ], 500);
            }

            $telegramService->setCredentials($token->getCredentialsArray());

            // Send the message
            $result = $telegramService->executeReaction('send_message', [
                'chat_id' => $chatId,
                'text' => $validated['text'],
                'parse_mode' => $validated['parse_mode'] ?? 'Markdown',
            ]);

            Log::info('Test message sent', [
                'user_id' => $user->id,
                'chat_id' => $chatId,
                'success' => $result,
            ]);

            return response()->json([
                'success' => $result,
                'message' => $result ? 'Message sent successfully' : 'Failed to send message',
                'data' => [
                    'chat_id' => $chatId,
                    'text' => $validated['text'],
                    'sent_at' => now()->toISOString(),
                    'used_stored_chat_id' => !isset($validated['chat_id']),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send test Telegram message', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to send message: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test Telegram bot info retrieval
     *
     * @return JsonResponse
     */
    public function testTelegramInfo(): JsonResponse
    {
        try {
            $user = Auth::user();
            $token = $user->getServiceToken('Telegram');

            if (!$token || !$token->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Telegram service not connected or token invalid',
                ], 400);
            }

            // Get Telegram service and set credentials
            $telegramService = $this->serviceManager->get('Telegram');
            if (!$telegramService) {
                return response()->json([
                    'success' => false,
                    'message' => 'Telegram service not available',
                ], 500);
            }

            $telegramService->setCredentials($token->getCredentialsArray());

            // Test connection and get bot info
            $isConnected = $telegramService->testConnection();

            return response()->json([
                'success' => true,
                'data' => [
                    'service' => 'Telegram',
                    'connection_status' => $isConnected ? 'healthy' : 'unhealthy',
                    'authenticated' => $telegramService->isAuthenticated(),
                    'token_valid' => $token->isValid(),
                    'token_expires_at' => $token->expires_at?->toISOString(),
                    'tested_at' => now()->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get Telegram bot info', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to get bot info: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test Telegram photo sending
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function testTelegramPhoto(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'chat_id' => 'nullable|string', // Made optional
                'photo_url' => 'required|url',
                'caption' => 'nullable|string|max:1024',
            ]);

            $user = Auth::user();
            $token = $user->getServiceToken('Telegram');

            if (!$token || !$token->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Telegram service not connected or token invalid',
                ], 400);
            }

            // Use stored chat_id if not provided
            $chatId = $validated['chat_id'] ?? $token->getChatId();

            if (!$chatId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please send /start to your bot first to complete setup, or provide a chat_id in the request',
                ], 400);
            }

            $telegramService = $this->serviceManager->get('Telegram');
            $telegramService->setCredentials($token->getCredentialsArray());

            // Send the photo
            $result = $telegramService->executeReaction('send_photo', [
                'chat_id' => $chatId,
                'photo_url' => $validated['photo_url'],
                'caption' => $validated['caption'] ?? null,
            ]);

            return response()->json([
                'success' => $result,
                'message' => $result ? 'Photo sent successfully' : 'Failed to send photo',
                'data' => [
                    'chat_id' => $chatId,
                    'photo_url' => $validated['photo_url'],
                    'sent_at' => now()->toISOString(),
                    'used_stored_chat_id' => !isset($validated['chat_id']),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send photo: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test checking for new messages
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function testTelegramMessages(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'chat_id' => 'nullable|string', // Made optional
            ]);

            $user = Auth::user();
            $token = $user->getServiceToken('Telegram');

            if (!$token || !$token->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Telegram service not connected or token invalid',
                ], 400);
            }

            // Use stored chat_id if not provided
            $chatId = $validated['chat_id'] ?? $token->getChatId();

            if (!$chatId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please send /start to your bot first to complete setup, or provide a chat_id in the request',
                ], 400);
            }

            $telegramService = $this->serviceManager->get('Telegram');
            $telegramService->setCredentials($token->getCredentialsArray());

            // Check for new messages
            $messages = $telegramService->executeAction('new_message_in_chat', [
                'chat_id' => $chatId,
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'chat_id' => $chatId,
                    'messages' => $messages,
                    'count' => count($messages),
                    'checked_at' => now()->toISOString(),
                    'used_stored_chat_id' => !isset($validated['chat_id']),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check messages: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test service health check
     *
     * @return JsonResponse
     */
    public function healthCheck(): JsonResponse
    {
        try {
            $healthResults = $this->serviceManager->healthCheck();

            return response()->json([
                'success' => true,
                'data' => [
                    'services' => $healthResults,
                    'overall_status' => $this->calculateOverallStatus($healthResults),
                    'checked_at' => now()->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Health check failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate overall health status
     */
    private function calculateOverallStatus(array $results): string
    {
        if (empty($results)) {
            return 'no_services';
        }

        $statuses = array_column($results, 'status');

        if (in_array('error', $statuses)) {
            return 'degraded';
        }

        if (in_array('unhealthy', $statuses)) {
            return 'partial';
        }

        if (all_equal($statuses, 'healthy')) {
            return 'healthy';
        }

        return 'unknown';
    }
}

/**
 * Helper function to check if all array values are equal to a given value
 */
function all_equal(array $array, $value): bool
{
    return array_filter($array, fn($item) => $item === $value) === $array;
}
