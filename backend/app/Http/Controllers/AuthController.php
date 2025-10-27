<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Mail\WelcomeMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|max:255',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        // Send welcome email (optional - can be disabled in production if needed)
        try {
            Mail::to($user->email)->send(new WelcomeMail($user));
        } catch (\Exception $e) {
            // Log the error but don't fail the registration
            \Log::warning('Failed to send welcome email to ' . $user->email . ': ' . $e->getMessage());
        }

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_admin' => $user->isAdmin(),
            ],
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_admin' => $user->isAdmin(),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /**
     * Redirect to Google OAuth provider
     */
    public function redirectToGoogle(): JsonResponse
    {
        try {
            $url = Socialite::driver('google')->stateless()->redirect()->getTargetUrl();
            
            return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            \Log::error('Google OAuth redirect error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to generate OAuth URL',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request)
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
            
            // Find or create user
            $user = User::where('email', $googleUser->getEmail())->first();
            
            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $googleUser->getName() ?? $googleUser->getNickname() ?? 'Google User',
                    'email' => $googleUser->getEmail(),
                    'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                    'email_verified_at' => now(), // Auto-verify OAuth users
                ]);
            }
            
            // Generate token
            $token = $user->createToken('auth-token')->plainTextToken;
            
            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away("{$frontendUrl}/oauth/callback?token={$token}");
            
        } catch (\Exception $e) {
            \Log::error('Google OAuth error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away("{$frontendUrl}/login?error=oauth_failed");
        }
    }

    /**
     * Redirect to GitHub OAuth provider
     */
    public function redirectToGitHub(): JsonResponse
    {
        try {
            $url = Socialite::driver('github')->stateless()->redirect()->getTargetUrl();
            
            return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            \Log::error('GitHub OAuth redirect error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Failed to generate OAuth URL',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle GitHub OAuth callback
     */
    public function handleGitHubCallback(Request $request)
    {
        try {
            $githubUser = Socialite::driver('github')->stateless()->user();
            
            // Find or create user
            $user = User::where('email', $githubUser->getEmail())->first();
            
            if (!$user) {
                // Create new user
                $user = User::create([
                    'name' => $githubUser->getName() ?? $githubUser->getNickname() ?? 'GitHub User',
                    'email' => $githubUser->getEmail(),
                    'password' => Hash::make(Str::random(32)), // Random password for OAuth users
                    'email_verified_at' => now(), // Auto-verify OAuth users
                ]);
            }
            
            // Generate token
            $token = $user->createToken('auth-token')->plainTextToken;
            
            // Redirect to frontend with token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away("{$frontendUrl}/oauth/callback?token={$token}");
            
        } catch (\Exception $e) {
            \Log::error('GitHub OAuth error: ' . $e->getMessage());
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away("{$frontendUrl}/login?error=oauth_failed");
        }
    }
}
