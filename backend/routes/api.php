<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApiTestController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Test endpoints
Route::get('/test', [ApiTestController::class, 'test']);
Route::post('/echo', [ApiTestController::class, 'echo']);

// Example protected route
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/protected', function () {
        return response()->json(['message' => 'This is a protected route!']);
    });
});
