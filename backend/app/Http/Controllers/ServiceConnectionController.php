<?php

namespace App\Http\Controllers;

use App\Models\UserServiceToken;
use App\Services\ServiceManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Service Connection Controller
 *
 * Handles user connections to external    private function validateServiceCredentials(string $serviceName, array $credentials): void
    {
        $rules = match ($serviceName) {
            'Telegram' => [
                'bot_token' => 'required|string|regex:/^\d+:[A-Za-z0-9_-]{20,50}$/',
            ],
            // Add validation rules for other services here
            default => []
        };

        if (!empty($rules)) {
            validator($credentials, $rules)->validate();
        }
    }en management,
 * and service availability information.
 */
class ServiceConnectionController extends Controller
{
    public function __construct(
        private ServiceManager $serviceManager
    ) {}

    /**
     * Get all available services with connection status
     *
     * @return JsonResponse
     */
    public function availableServices(): JsonResponse
    {
        try {
            $user = Auth::user();
            $services = $this->serviceManager->getAllServiceInfo();

            // Add connection status for each service
            foreach ($services as &$service) {
                $service['is_connected'] = $user->hasServiceToken($service['name']);
                $service['connection_status'] = $this->getConnectionStatus($user, $service['name']);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'services' => $services,
                    'total' => count($services),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get available services', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve available services',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get information about a specific service
     *
     * @param string $serviceName
     * @return JsonResponse
     */
    public function serviceInfo(string $serviceName): JsonResponse
    {
        try {
            $serviceInfo = $this->serviceManager->getServiceInfo($serviceName);

            if (!$serviceInfo) {
                return response()->json([
                    'success' => false,
                    'message' => "Service '$serviceName' not found",
                ], 404);
            }

            $user = Auth::user();
            $serviceInfo['is_connected'] = $user->hasServiceToken($serviceName);
            $serviceInfo['connection_status'] = $this->getConnectionStatus($user, $serviceName);

            return response()->json([
                'success' => true,
                'data' => $serviceInfo,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get service info', [
                'service' => $serviceName,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve service information',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Connect a service for the authenticated user
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function connectService(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'service' => 'required|string',
                'credentials' => 'required|array',
            ]);

            $serviceName = $validated['service'];
            $credentials = $validated['credentials'];

            // Get the service instance
            $service = $this->serviceManager->get($serviceName);
            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => "Service '$serviceName' not found",
                ], 404);
            }

            // Validate service-specific credentials
            $this->validateServiceCredentials($serviceName, $credentials);

            // Attempt to authenticate with the service
            if (!$service->authenticate($credentials)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication failed. Please check your credentials.',
                ], 401);
            }

            // Store the credentials securely
            $user = Auth::user();
            $this->storeServiceCredentials($user, $serviceName, $credentials);

            // Special handling for Telegram: Setup webhook automatically
            $instructions = null;
            if ($serviceName === 'Telegram') {
                $service->setupWebhook();
                $instructions = 'Please send /start to your bot to complete setup and enable automatic message delivery.';
            }

            Log::info('Service connected successfully', [
                'service' => $serviceName,
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully connected to $serviceName",
                'instructions' => $instructions,
                'data' => [
                    'service' => $serviceName,
                    'connected_at' => now()->toISOString(),
                ],
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            Log::error('Failed to connect service', [
                'service' => $request->input('service'),
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect service: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Disconnect a service for the authenticated user
     *
     * @param string $serviceName
     * @return JsonResponse
     */
    public function disconnectService(Request $request, string $serviceName = null): JsonResponse
    {
        try {
            // Accept service name from URL parameter or POST body
            if (!$serviceName) {
                $serviceName = $request->input('service');
            }

            if (!$serviceName) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service name is required',
                ], 400);
            }

            $user = Auth::user();
            $token = $user->getServiceToken($serviceName);

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => "Service '$serviceName' is not connected",
                ], 404);
            }

            // Delete the token
            $token->delete();

            Log::info('Service disconnected successfully', [
                'service' => $serviceName,
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully disconnected from $serviceName",
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to disconnect service', [
                'service' => $serviceName ?? 'unknown',
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to disconnect service',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Test a service connection
     *
     * @param string $serviceName
     * @return JsonResponse
     */
    public function testConnection(string $serviceName): JsonResponse
    {
        try {
            $user = Auth::user();
            $token = $user->getServiceToken($serviceName);

            if (!$token || !$token->isValid()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Service not connected or token expired',
                    'connection_status' => 'disconnected',
                ], 400);
            }

            // Get service instance and set credentials
            $service = $this->serviceManager->get($serviceName);
            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => "Service '$serviceName' not found",
                ], 404);
            }

            $service->setCredentials($token->getCredentialsArray());

            // Test the connection
            $isHealthy = $service->testConnection();

            Log::info('Service connection tested', [
                'service' => $serviceName,
                'user_id' => $user->id,
                'result' => $isHealthy ? 'success' : 'failed',
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'service' => $serviceName,
                    'connection_status' => $isHealthy ? 'healthy' : 'unhealthy',
                    'authenticated' => $service->isAuthenticated(),
                    'tested_at' => now()->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to test service connection', [
                'service' => $serviceName,
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to test connection',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get user's connected services
     *
     * @return JsonResponse
     */
    public function connectedServices(): JsonResponse
    {
        try {
            $user = Auth::user();
            $tokens = $user->activeServiceTokens()->get();

            $connectedServices = $tokens->map(function ($token) {
                return [
                    'service' => $token->service_name,
                    'connected_at' => $token->created_at->toISOString(),
                    'updated_at' => $token->updated_at->toISOString(),
                    'is_valid' => $token->isValid(),
                    'expires_at' => $token->expires_at?->toISOString(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'connected_services' => $connectedServices,
                    'total' => $connectedServices->count(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get connected services', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve connected services',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check if a specific service is connected
     */
    public function checkServiceConnection(string $serviceName): JsonResponse
    {
        try {
            $user = Auth::user();
            $token = $user->getServiceToken($serviceName);

            return response()->json([
                'success' => true,
                'connected' => $token !== null && $token->is_active,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'connected' => false,
            ]);
        }
    }

    /**
     * Get connection status for a user and service
     */
    private function getConnectionStatus($user, string $serviceName): string
    {
        $token = $user->getServiceToken($serviceName);

        if (!$token) {
            return 'disconnected';
        }

        if (!$token->is_active) {
            return 'disabled';
        }

        if ($token->isExpired()) {
            return 'expired';
        }

        return 'connected';
    }

    /**
     * Validate service-specific credentials
     */
    private function validateServiceCredentials(string $serviceName, array $credentials): void
    {
        $rules = match ($serviceName) {
            'Telegram' => [
                'bot_token' => 'required|string|regex:/^\d+:[A-Za-z0-9_-]{20,50}$/',
            ],
            'Steam' => [
                'api_key' => 'required|string|min:32',
                'user_id' => 'required|string|regex:/^\d{17}$/',
            ],
            'Discord' => [
                'bot_token' => 'required|string|min:30',
                'webhook_url' => 'required|string|url',
            ],
            // Add validation rules for other services here
            default => []
        };

        if (!empty($rules)) {
            validator($credentials, $rules)->validate();
        }
    }

    /**
     * Get Telegram service status including chat_id detection status
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function telegramStatus(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $token = $user->getServiceToken('Telegram');

            if (!$token) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'connected' => false,
                        'setup_complete' => false,
                        'chat_id_detected' => false,
                        'instructions' => 'Please connect your Telegram bot first.',
                    ]
                ]);
            }

            $chatId = $token->getChatId();
            $setupComplete = !empty($chatId);

            return response()->json([
                'success' => true,
                'data' => [
                    'connected' => true,
                    'setup_complete' => $setupComplete,
                    'chat_id_detected' => $setupComplete,
                    'chat_id' => $chatId,
                    'user_info' => [
                        'username' => $token->additional_data['username'] ?? null,
                        'first_name' => $token->additional_data['first_name'] ?? null,
                        'detected_at' => $token->additional_data['detected_at'] ?? null,
                    ],
                    'instructions' => $setupComplete
                        ? 'Setup complete! Your bot is ready to use.'
                        : 'Please send /start to your bot to complete setup.',
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get Telegram status', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve Telegram status',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Connect Steam service using .env credentials
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function connectSteam(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            // Get credentials from .env
            $apiKey = config('services.steam.api_key');
            $steamId = env('STEAM_USER_ID');

            if (!$apiKey || !$steamId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Steam credentials not configured on server. Please contact administrator.',
                ], 500);
            }

            // Get the service instance
            $service = $this->serviceManager->get('Steam');
            if (!$service) {
                return response()->json([
                    'success' => false,
                    'message' => 'Steam service not found',
                ], 404);
            }

            // Attempt to authenticate with the service
            if (!$service->authenticate(['api_key' => $apiKey, 'user_id' => $steamId])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Steam authentication failed. Please check server configuration.',
                ], 401);
            }

            // Store the credentials securely
            $this->storeServiceCredentials($user, 'Steam', [
                'api_key' => $apiKey,
                'user_id' => $steamId
            ]);

            Log::info('Steam service connected successfully', [
                'user_id' => $user->id,
                'steam_id' => $steamId
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Successfully connected to Steam',
                'data' => [
                    'service' => 'Steam',
                    'steam_id' => $steamId,
                    'connected_at' => now()->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to connect Steam service', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to connect Steam: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Store service credentials securely
     */
    private function storeServiceCredentials($user, string $serviceName, array $credentials): void
    {
        // Extract main token based on service type
        $accessToken = match ($serviceName) {
            'Telegram' => $credentials['bot_token'],
            'Steam' => $credentials['api_key'],
            'Discord' => $credentials['bot_token'],
            // Add token extraction for other services
            default => $credentials['access_token'] ?? null
        };

        if (!$accessToken) {
            throw new \InvalidArgumentException('No access token found in credentials');
        }

        // Store additional data (everything except the main token)
        $additionalData = $credentials;
        unset($additionalData['bot_token'], $additionalData['access_token'], $additionalData['api_key']);

        UserServiceToken::updateOrCreateToken(
            userId: $user->id,
            serviceName: $serviceName,
            accessToken: $accessToken,
            additionalData: !empty($additionalData) ? $additionalData : null
        );
    }
}
