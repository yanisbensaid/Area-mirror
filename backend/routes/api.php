<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiTestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\ServiceConnectionController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\AutomationController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TelegramWebhookController;
use App\Http\Controllers\OAuthController;
use App\Http\Controllers\AreaController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Test endpoints
Route::get('/test', [ApiTestController::class, 'test']);
Route::post('/echo', [ApiTestController::class, 'echo']);

// Auth endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Services, Actions, and Reactions endpoints to show services
Route::get('/services', [ServicesController::class, 'index']);
Route::get('/services/{service}', [ServicesController::class, 'show']);
Route::get('/services/{service}/actions', [ServicesController::class, 'showActions']);
Route::get('/services/{service}/reactions', [ServicesController::class, 'showReactions']);
Route::get('/services/{service}/automations', [AutomationController::class, 'getAutomationsForService']);
Route::get('/services/{service}/automations', [AutomationController::class, 'getAutomationsForService']);

// Public automation endpoints
Route::get('/automations', [AutomationController::class, 'index']);

// New service integration endpoints
Route::get('/services/available', [ServiceConnectionController::class, 'availableServices']);
Route::get('/services/info/{service}', [ServiceConnectionController::class, 'serviceInfo']);

// Mail endpoints
Route::post('/mail/test', [MailController::class, 'testEmail']);

// Webhook endpoints (public - no authentication)
Route::post('/webhooks/telegram', [TelegramWebhookController::class, 'handle']);

// OAuth callback (public - user_id passed via state)
Route::get('/oauth/youtube/callback', [OAuthController::class, 'handleYouTubeCallback']);

// Protected routes (requires authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [UserController::class, 'me']);
    Route::get('/protected', function () {
        return response()->json(['message' => 'This is a protected route!']);
    });

    // Protected mail endpoints
    Route::post('/mail/welcome', [MailController::class, 'sendWelcomeEmail']);
    Route::post('/mail/notification', [MailController::class, 'sendNotificationEmail']);
    Route::post('/mail/bulk', [MailController::class, 'sendBulkEmail']);

    // Service connection management
    Route::post('/services/connect', [ServiceConnectionController::class, 'connectService']);
    Route::delete('/services/{service}/disconnect', [ServiceConnectionController::class, 'disconnectService']);
    Route::post('/services/{service}/test', [ServiceConnectionController::class, 'testConnection']);
    Route::get('/services/connected', [ServiceConnectionController::class, 'connectedServices']);
    Route::get('/services/telegram/status', [ServiceConnectionController::class, 'telegramStatus']);

    // OAuth routes for YouTube (redirect requires auth, callback is public)
    Route::get('/oauth/youtube', [OAuthController::class, 'redirectToYouTube']);

    // AREA management
    Route::get('/areas', [AreaController::class, 'index']);
    Route::get('/areas/templates', [AreaController::class, 'templates']);
    Route::post('/areas', [AreaController::class, 'store']);
    Route::post('/areas/{area}/toggle', [AreaController::class, 'toggle']);
    Route::delete('/areas/{area}', [AreaController::class, 'destroy']);

    // Testing endpoints for development
    Route::prefix('test')->group(function () {
        Route::post('/telegram/send', [TestController::class, 'testTelegramSend']);
        Route::get('/telegram/info', [TestController::class, 'testTelegramInfo']);
        Route::post('/telegram/photo', [TestController::class, 'testTelegramPhoto']);
        Route::post('/telegram/messages', [TestController::class, 'testTelegramMessages']);
        Route::get('/health', [TestController::class, 'healthCheck']);
    });
    // User automation management
    Route::resource('automations', AutomationController::class)->except(['index']);

    // Admin only routes
    Route::middleware('admin')->group(function () {
        // User management
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/stats', [UserController::class, 'getStats']);
        Route::post('/users/make-admin', [UserController::class, 'makeAdmin']);
        Route::post('/users/remove-admin', [UserController::class, 'removeAdmin']);
        Route::delete('/users/{userId}', [UserController::class, 'destroy']);

        // Services management (admin only)
        Route::post('/services', [ServicesController::class, 'store']);
        Route::put('/services/{service}', [ServicesController::class, 'update']);
        Route::post('/services/{service}/actions', [ServicesController::class, 'storeAction']);
        Route::post('/services/{service}/reactions', [ServicesController::class, 'storeReaction']);

        // Individual action management (admin only)
        Route::get('/actions/{action}', [ServicesController::class, 'showAction']);
        Route::put('/actions/{action}', [ServicesController::class, 'updateAction']);
        Route::delete('/actions/{action}', [ServicesController::class, 'deleteAction']);

        // Individual reaction management (admin only)
        Route::get('/reactions/{reaction}', [ServicesController::class, 'showReaction']);
        Route::put('/reactions/{reaction}', [ServicesController::class, 'updateReaction']);
        Route::delete('/reactions/{reaction}', [ServicesController::class, 'deleteReaction']);

        Route::delete('/services/{service}', [ServicesController::class, 'destroy']);
        Route::delete('/services/{service}/actions/{action}', [ServicesController::class, 'destroyAction']);
        Route::delete('/services/{service}/reactions/{reaction}', [ServicesController::class, 'destroyReaction']);
    });
});
