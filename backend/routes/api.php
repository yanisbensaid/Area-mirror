<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiTestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServicesController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Test endpoints
Route::get('/test', [ApiTestController::class, 'test']);
Route::post('/echo', [ApiTestController::class, 'echo']);

// Auth endpoints
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Services, Actions, and Reactions endpoints
Route::post('/services', [ServicesController::class, 'store']);
Route::post('/services/{service}/actions', [ServicesController::class, 'storeActions']);
Route::post('/services/{service}/reactions', [ServicesController::class, 'storeReactions']);

Route::delete('/services/{service}', [ServicesController::class, 'destroy']);

Route::get('/services', [ServicesController::class, 'index']);
Route::get('/services/{service}', [ServicesController::class, 'show']);
Route::get('/services/{service}/actions', [ServicesController::class, 'showActions']);
Route::get('/services/{service}/reactions', [ServicesController::class, 'showReactions']);

// Example protected route
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/protected', function () {
        return response()->json(['message' => 'This is a protected route!']);
    });
});
