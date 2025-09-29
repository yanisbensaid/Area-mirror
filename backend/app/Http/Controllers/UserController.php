<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Get all users (Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'role_assigned_at', 'created_at')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'message' => 'Users retrieved successfully',
            'users' => $users
        ]);
    }

    /**
     * Get current user info
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_admin' => $user->isAdmin(),
                'role_assigned_at' => $user->role_assigned_at,
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * Make user admin (Admin only)
     */
    public function makeAdmin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($request->user_id);

        if ($user->isAdmin()) {
            return response()->json([
                'message' => 'User is already an admin',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]);
        }

        $user->makeAdmin();

        return response()->json([
            'message' => 'User promoted to admin successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_assigned_at' => $user->role_assigned_at,
            ]
        ]);
    }

    /**
     * Remove admin role (Admin only)
     */
    public function removeAdmin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::findOrFail($request->user_id);
        $currentUser = $request->user();

        // Prevent user from removing their own admin role
        if ($user->id === $currentUser->id) {
            return response()->json([
                'message' => 'You cannot remove your own admin privileges'
            ], 403);
        }

        if ($user->isUser()) {
            return response()->json([
                'message' => 'User is already a regular user',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ]
            ]);
        }

        $user->makeUser();

        return response()->json([
            'message' => 'Admin privileges removed successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'role_assigned_at' => $user->role_assigned_at,
            ]
        ]);
    }

    /**
     * Get user statistics (Admin only)
     */
    public function getStats(): JsonResponse
    {
        $totalUsers = User::count();
        $totalAdmins = User::admins()->count();
        $totalRegularUsers = User::regularUsers()->count();
        $recentUsers = User::where('created_at', '>=', now()->subDays(7))->count();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_admins' => $totalAdmins,
                'total_regular_users' => $totalRegularUsers,
                'recent_users_last_7_days' => $recentUsers,
            ]
        ]);
    }

    /**
     * Delete user (Admin only)
     */
    public function destroy(Request $request, $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        $currentUser = $request->user();

        // Prevent user from deleting themselves
        if ($user->id === $currentUser->id) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 403);
        }

        $userName = $user->name;
        $user->delete();

        return response()->json([
            'message' => "User '{$userName}' deleted successfully"
        ]);
    }
}
