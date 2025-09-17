<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ApiTestController extends Controller
{
    public function test(): JsonResponse
    {
        return response()->json([
            'message' => 'API is working!',
            'timestamp' => now()->toISOString(),
            'status' => 'success',
            'version' => '1.0.0'
        ]);
    }

    public function echo(Request $request): JsonResponse
    {
        return response()->json([
            'message' => 'Echo endpoint',
            'data' => $request->all(),
            'method' => $request->method(),
        ]);
    }
}
