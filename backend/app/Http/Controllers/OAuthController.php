<?php

namespace App\Http\Controllers;

use App\Models\UserServiceToken;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    /**
     * Redirect user to YouTube OAuth page
     */
    public function redirectToYouTube(Request $request): JsonResponse
    {
        try {
            // Pass user_id in state parameter
            $state = base64_encode(json_encode([
                'user_id' => $request->user()->id
            ]));

            $authUrl = Socialite::driver('google')
                ->scopes([
                    'https://www.googleapis.com/auth/youtube.readonly',
                    'https://www.googleapis.com/auth/youtube.force-ssl'
                ])
                ->with(['state' => $state])
                ->stateless()
                ->redirect()
                ->getTargetUrl();

            return response()->json([
                'success' => true,
                'auth_url' => $authUrl
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to generate YouTube OAuth URL', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to generate authentication URL'
            ], 500);
        }
    }

    /**
     * Handle OAuth callback from YouTube
     */
    public function handleYouTubeCallback(Request $request): JsonResponse
    {
        try {
            // Get user_id from state parameter
            $stateData = json_decode(base64_decode($request->input('state')), true);
            $userId = $stateData['user_id'] ?? null;

            if (!$userId) {
                throw new \Exception('User ID not found in state parameter');
            }

            $googleUser = Socialite::driver('google')
                ->stateless()
                ->user();

            // Store YouTube token (model auto-encrypts)
            UserServiceToken::updateOrCreate(
                [
                    'user_id' => $userId,
                    'service_name' => 'YouTube',
                ],
                [
                    'access_token' => $googleUser->token,
                    'refresh_token' => $googleUser->refreshToken,
                    'expires_at' => $googleUser->expiresIn ? now()->addSeconds($googleUser->expiresIn) : now()->addHour(),
                    'additional_data' => [
                        'email' => $googleUser->email,
                        'name' => $googleUser->name,
                    ]
                ]
            );

            Log::info('YouTube OAuth successful', [
                'user_id' => $userId,
                'email' => $googleUser->email
            ]);

            // Redirect to frontend success page
            return response()->json([
                'success' => true,
                'message' => 'Successfully connected to YouTube! You can close this window.'
            ]);

        } catch (\Exception $e) {
            Log::error('YouTube OAuth callback failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to authenticate with YouTube: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refresh YouTube access token
     */
    public function refreshYouTubeToken(UserServiceToken $token): bool
    {
        if (!$token->refresh_token) {
            return false;
        }

        try {
            $response = Http::post('https://oauth2.googleapis.com/token', [
                'client_id' => config('services.youtube.client_id'),
                'client_secret' => config('services.youtube.client_secret'),
                'refresh_token' => $token->getDecryptedRefreshToken(),
                'grant_type' => 'refresh_token',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $token->update([
                    'access_token' => $data['access_token'],
                    'expires_at' => now()->addSeconds($data['expires_in'] ?? 3600),
                ]);

                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Failed to refresh YouTube token', [
                'user_id' => $token->user_id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
