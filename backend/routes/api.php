<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiTestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\MailController;
use App\Http\Controllers\UserController;

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

// Mail endpoints
Route::post('/mail/test', [MailController::class, 'testEmail']);

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
        Route::post('/services/{service}/actions', [ServicesController::class, 'storeActions']);
        Route::post('/services/{service}/reactions', [ServicesController::class, 'storeReactions']);

        Route::delete('/services/{service}', [ServicesController::class, 'destroy']);
        Route::delete('/services/{service}/actions/{action}', [ServicesController::class, 'destroyAction']);
        Route::delete('/services/{service}/reactions/{reaction}', [ServicesController::class, 'destroyReaction']);
    });
});
