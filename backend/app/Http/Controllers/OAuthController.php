<?php

namespace App\Http\Controllers;

use App\Models\UserServiceToken;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class OAuthController extends Controller
{
    /**
     * Redirect user to YouTube OAuth page (for popup, accepts token in query)
     */
    public function redirectToYouTubePopup(Request $request)
    {
        try {
            // Get user from token in query parameter
            $token = $request->query('token');
            if (!$token) {
                return response()->json(['error' => 'Token required'], 400);
            }

            // Find user by token
            $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if (!$personalAccessToken) {
                return response()->json(['error' => 'Invalid token'], 401);
            }

            $user = $personalAccessToken->tokenable;

            // Pass user_id in state parameter
            $state = base64_encode(json_encode([
                'user_id' => $user->id
            ]));

            return Socialite::driver('google')
                ->scopes([
                    'https://www.googleapis.com/auth/youtube.readonly',
                    'https://www.googleapis.com/auth/youtube.force-ssl'
                ])
                ->with([
                    'state' => $state,
                    'access_type' => 'offline',
                    'approval_prompt' => 'force'
                ])
                ->stateless()
                ->redirect();

        } catch (\Exception $e) {
            Log::error('Failed to redirect to YouTube OAuth', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to redirect to YouTube'
            ], 500);
        }
    }

    /**
     * Redirect user to YouTube OAuth page (JSON response for API)
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
                ->with([
                    'state' => $state,
                    'access_type' => 'offline',
                    'approval_prompt' => 'force'
                ])
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

            // Redirect to frontend callback page
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            return redirect($frontendUrl . '/oauth-success?service=YouTube');

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

    /**
     * Redirect user to Twitch OAuth page
     */
    public function redirectToTwitch(Request $request): JsonResponse
    {
        $user = Auth::user();

        $state = base64_encode(json_encode([
            'user_id' => $user->id,
            'timestamp' => time()
        ]));

        $scopes = implode(' ', config('services.twitch.scopes'));

        $authUrl = 'https://id.twitch.tv/oauth2/authorize?' . http_build_query([
            'client_id' => config('services.twitch.client_id'),
            'redirect_uri' => config('services.twitch.redirect'),
            'response_type' => 'code',
            'scope' => $scopes,
            'state' => $state,
        ]);

        return response()->json([
            'success' => true,
            'auth_url' => $authUrl
        ]);
    }

    /**
     * Handle OAuth callback from Twitch
     */
    public function handleTwitchCallback(Request $request)
    {
        $code = $request->input('code');
        $state = json_decode(base64_decode($request->input('state')), true);
        $userId = $state['user_id'];

        // Exchange code for tokens
        $response = Http::asForm()->post('https://id.twitch.tv/oauth2/token', [
            'client_id' => config('services.twitch.client_id'),
            'client_secret' => config('services.twitch.client_secret'),
            'code' => $code,
            'grant_type' => 'authorization_code',
            'redirect_uri' => config('services.twitch.redirect'),
        ]);

        if (!$response->successful()) {
            Log::error('Twitch OAuth token exchange failed', [
                'response' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to authenticate'], 500);
        }

        $tokens = $response->json();

        // Get user info
        $userResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $tokens['access_token'],
            'Client-Id' => config('services.twitch.client_id'),
        ])->get('https://api.twitch.tv/helix/users');

        $userData = $userResponse->successful() ? $userResponse->json()['data'][0] ?? [] : [];

        // Store tokens
        UserServiceToken::updateOrCreate(
            [
                'user_id' => $userId,
                'service_name' => 'Twitch',
            ],
            [
                'access_token' => $tokens['access_token'],
                'refresh_token' => isset($tokens['refresh_token']) ? $tokens['refresh_token'] : null,
                'expires_at' => now()->addSeconds($tokens['expires_in']),
                'additional_data' => [
                    'login' => $userData['login'] ?? null,
                    'display_name' => $userData['display_name'] ?? null,
                    'email' => $userData['email'] ?? null,
                ]
            ]
        );

        Log::info('Twitch OAuth successful', [
            'user_id' => $userId,
            'twitch_user' => $userData['login'] ?? 'unknown'
        ]);

        // Redirect to frontend callback page
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect($frontendUrl . '/oauth-success?service=Twitch');
    }

    /**
     * Refresh Twitch access token
     */
    public function refreshTwitchToken(UserServiceToken $token): bool
    {
        if (!$token->refresh_token) {
            return false;
        }

        try {
            $response = Http::asForm()->post('https://id.twitch.tv/oauth2/token', [
                'client_id' => config('services.twitch.client_id'),
                'client_secret' => config('services.twitch.client_secret'),
                'refresh_token' => $token->getDecryptedRefreshToken(),
                'grant_type' => 'refresh_token',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $token->update([
                    'access_token' => $data['access_token'],
                    'refresh_token' => isset($data['refresh_token']) ? $data['refresh_token'] : $token->refresh_token,
                    'expires_at' => now()->addSeconds($data['expires_in']),
                ]);

                return true;
            }
        } catch (\Exception $e) {
            Log::error('Failed to refresh Twitch token', [
                'user_id' => $token->user_id,
                'error' => $e->getMessage()
            ]);
        }

        return false;
    }

    /**
     * Redirect user to Gmail OAuth page (for popup, accepts token in query)
     */
    public function redirectToGmailPopup(Request $request)
    {
        try {
            $token = $request->query('token');
            if (!$token) {
                return response()->json(['error' => 'Token required'], 400);
            }

            $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if (!$personalAccessToken) {
                return response()->json(['error' => 'Invalid token'], 401);
            }

            $user = $personalAccessToken->tokenable;

            $state = base64_encode(json_encode([
                'user_id' => $user->id,
                'timestamp' => time()
            ]));

            $scopes = implode(' ', config('services.gmail.scopes'));

            $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
                'client_id' => config('services.gmail.client_id'),
                'redirect_uri' => config('services.gmail.redirect'),
                'response_type' => 'code',
                'scope' => $scopes,
                'access_type' => 'offline',
                'prompt' => 'consent',
                'state' => $state,
            ]);

            return redirect($authUrl);

        } catch (\Exception $e) {
            Log::error('Failed to redirect to Gmail OAuth', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'error' => 'Failed to redirect'], 500);
        }
    }

    /**
     * Redirect user to Twitch OAuth page (for popup, accepts token in query)
     */
    public function redirectToTwitchPopup(Request $request)
    {
        try {
            $token = $request->query('token');
            if (!$token) {
                return response()->json(['error' => 'Token required'], 400);
            }

            $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if (!$personalAccessToken) {
                return response()->json(['error' => 'Invalid token'], 401);
            }

            $user = $personalAccessToken->tokenable;

            $state = base64_encode(json_encode(['user_id' => $user->id]));

            return Socialite::driver('twitch')
                ->scopes(['user:read:email'])
                ->with(['state' => $state])
                ->stateless()
                ->redirect();

        } catch (\Exception $e) {
            Log::error('Failed to redirect to Twitch OAuth', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'error' => 'Failed to redirect'], 500);
        }
    }

    /**
     * Redirect user to Gmail OAuth page (JSON response for API)
     */
    public function redirectToGmail(Request $request): JsonResponse
    {
        $user = Auth::user();

        $state = base64_encode(json_encode([
            'user_id' => $user->id,
            'timestamp' => time()
        ]));

        $scopes = implode(' ', config('services.gmail.scopes'));

        $authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query([
            'client_id' => config('services.gmail.client_id'),
            'redirect_uri' => config('services.gmail.redirect'),
            'response_type' => 'code',
            'scope' => $scopes,
            'access_type' => 'offline',
            'prompt' => 'consent',
            'state' => $state,
        ]);

        return response()->json([
            'success' => true,
            'auth_url' => $authUrl
        ]);
    }

    /**
     * Handle OAuth callback from Gmail
     */
    public function handleGmailCallback(Request $request)
    {
        $code = $request->input('code');
        $state = json_decode(base64_decode($request->input('state')), true);
        $userId = $state['user_id'];

        // Exchange code for tokens
        $response = Http::post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => config('services.gmail.client_id'),
            'client_secret' => config('services.gmail.client_secret'),
            'redirect_uri' => config('services.gmail.redirect'),
            'grant_type' => 'authorization_code',
        ]);

        if (!$response->successful()) {
            Log::error('Gmail OAuth token exchange failed', [
                'response' => $response->body()
            ]);
            return response()->json(['error' => 'Failed to authenticate'], 500);
        }

        $tokens = $response->json();

        // Get user profile info to retrieve email
        $profileResponse = Http::withHeaders([
            'Authorization' => 'Bearer ' . $tokens['access_token']
        ])->get('https://gmail.googleapis.com/gmail/v1/users/me/profile');

        $gmailEmail = null;
        if ($profileResponse->successful()) {
            $gmailEmail = $profileResponse->json()['emailAddress'] ?? null;
        }

        // Store tokens
        UserServiceToken::updateOrCreate(
            [
                'user_id' => $userId,
                'service_name' => 'Gmail',
            ],
            [
                'access_token' => $tokens['access_token'],
                'refresh_token' => isset($tokens['refresh_token']) ? $tokens['refresh_token'] : null,
                'expires_at' => now()->addSeconds($tokens['expires_in']),
                'scopes' => implode(',', config('services.gmail.scopes')),
                'additional_data' => $gmailEmail ? ['email' => $gmailEmail] : null,
            ]
        );

        Log::info('Gmail OAuth successful', [
            'user_id' => $userId,
            'email' => $gmailEmail
        ]);

        // Redirect to frontend callback page
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        return redirect($frontendUrl . '/oauth-success?service=Gmail');
    }

    /**
     * Refresh Gmail access token
     */
    public function refreshGmailToken(UserServiceToken $token): bool
    {
        if (!$token->refresh_token) {
            return false;
        }

        try {
            $response = Http::post('https://oauth2.googleapis.com/token', [
                'client_id' => config('services.gmail.client_id'),
                'client_secret' => config('services.gmail.client_secret'),
                'refresh_token' => $token->getDecryptedRefreshToken(),
                'grant_type' => 'refresh_token',
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $token->update([
                    'access_token' => $data['access_token'],
                    'expires_at' => now()->addSeconds($data['expires_in']),
                ]);

                return true;
            }
        } catch (\Exception $e) {
            Log::error('Failed to refresh Gmail token', [
                'user_id' => $token->user_id,
                'error' => $e->getMessage()
            ]);
        }

        return false;
    }

    /**
     * Redirect user to Discord OAuth page (for popup, accepts token in query)
     */
    public function redirectToDiscordPopup(Request $request)
    {
        try {
            // Get user from token in query parameter
            $token = $request->query('token');
            if (!$token) {
                return response()->json(['error' => 'Token required'], 400);
            }

            // Find user by token
            $personalAccessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if (!$personalAccessToken) {
                return response()->json(['error' => 'Invalid token'], 401);
            }

            $user = $personalAccessToken->tokenable;

            // Pass user_id in state parameter
            $state = base64_encode(json_encode([
                'user_id' => $user->id
            ]));

            $config = config('services.discord');
            $scopes = implode(' ', $config['scopes']);

            $authUrl = 'https://discord.com/oauth2/authorize?' . http_build_query([
                'client_id' => $config['client_id'],
                'redirect_uri' => $config['redirect'],
                'response_type' => 'code',
                'scope' => $scopes,
                'state' => $state,
            ]);

            return redirect($authUrl);

        } catch (\Exception $e) {
            Log::error('Failed to redirect to Discord OAuth', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to redirect to Discord'
            ], 500);
        }
    }

    /**
     * Handle Discord OAuth callback
     */
    public function handleDiscordCallback(Request $request)
    {
        try {
            $code = $request->input('code');
            $state = $request->input('state');

            if (!$code || !$state) {
                Log::error('Discord callback missing code or state');
                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '?error=oauth_failed');
            }

            // Decode state to get user_id
            $stateData = json_decode(base64_decode($state), true);
            $userId = $stateData['user_id'] ?? null;

            if (!$userId) {
                Log::error('Discord callback missing user_id in state');
                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '?error=invalid_state');
            }

            // Exchange code for access token
            $config = config('services.discord');
            $response = Http::asForm()->post('https://discord.com/api/oauth2/token', [
                'client_id' => $config['client_id'],
                'client_secret' => $config['client_secret'],
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $config['redirect'],
            ]);

            if (!$response->successful()) {
                Log::error('Discord token exchange failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '?error=token_exchange_failed');
            }

            $tokenData = $response->json();

            // Fetch user information
            $userInfoResponse = Http::withHeaders([
                'Authorization' => 'Bearer ' . $tokenData['access_token']
            ])->get('https://discord.com/api/users/@me');

            if (!$userInfoResponse->successful()) {
                Log::error('Failed to fetch Discord user info');
                return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '?error=user_info_failed');
            }

            $userInfo = $userInfoResponse->json();

            // Store or update the token
            UserServiceToken::updateOrCreate(
                [
                    'user_id' => $userId,
                    'service_name' => 'Discord'
                ],
                [
                    'access_token' => $tokenData['access_token'],
                    'refresh_token' => $tokenData['refresh_token'] ?? null,
                    'expires_at' => isset($tokenData['expires_in'])
                        ? now()->addSeconds($tokenData['expires_in'])
                        : null,
                    'service_user_id' => $userInfo['id'],
                    'service_user_email' => $userInfo['email'] ?? null,
                    'additional_data' => json_encode([
                        'username' => $userInfo['username'],
                        'discriminator' => $userInfo['discriminator'] ?? null,
                        'avatar' => $userInfo['avatar'] ?? null,
                    ])
                ]
            );

            Log::info('Discord OAuth successful', [
                'user_id' => $userId,
                'discord_user_id' => $userInfo['id'],
                'discord_username' => $userInfo['username']
            ]);

            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '/oauth-success?service=Discord');

        } catch (\Exception $e) {
            Log::error('Discord callback error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect(env('FRONTEND_URL', 'http://localhost:5173') . '?error=oauth_exception');
        }
    }

    /**
     * Refresh Discord access token
     */
    public function refreshDiscordToken(UserServiceToken $token): bool
    {
        try {
            if (!$token->refresh_token) {
                return false;
            }

            $config = config('services.discord');
            $response = Http::asForm()->post('https://discord.com/api/oauth2/token', [
                'client_id' => $config['client_id'],
                'client_secret' => $config['client_secret'],
                'grant_type' => 'refresh_token',
                'refresh_token' => $token->refresh_token,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                $token->update([
                    'access_token' => $data['access_token'],
                    'refresh_token' => $data['refresh_token'] ?? $token->refresh_token,
                    'expires_at' => now()->addSeconds($data['expires_in']),
                ]);

                return true;
            }
        } catch (\Exception $e) {
            Log::error('Failed to refresh Discord token', [
                'user_id' => $token->user_id,
                'error' => $e->getMessage()
            ]);
        }

        return false;
    }
}
