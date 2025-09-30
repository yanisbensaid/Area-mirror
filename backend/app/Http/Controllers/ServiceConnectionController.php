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
 * Handles user connections to external services, token management,
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

            Log::info('Service connected successfully', [
                'service' => $serviceName,
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => "Successfully connected to $serviceName",
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
    public function disconnectService(string $serviceName): JsonResponse
    {
        try {
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
                'service' => $serviceName,
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
                'bot_token' => 'required|string|regex:/^\d+:[A-Za-z0-9_-]{35}$/',
            ],
            // Add validation rules for other services here
            default => []
        };

        if (!empty($rules)) {
            validator($credentials, $rules)->validate();
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
            // Add token extraction for other services
            default => $credentials['access_token'] ?? null
        };

        if (!$accessToken) {
            throw new \InvalidArgumentException('No access token found in credentials');
        }

        // Store additional data (everything except the main token)
        $additionalData = $credentials;
        unset($additionalData['bot_token'], $additionalData['access_token']);

        UserServiceToken::updateOrCreateToken(
            userId: $user->id,
            serviceName: $serviceName,
            accessToken: $accessToken,
            additionalData: !empty($additionalData) ? $additionalData : null
        );
    }
}
