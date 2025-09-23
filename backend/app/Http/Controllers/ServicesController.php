<?php

namespace App\Http\Controllers;

use App\Models\Services;
use App\Models\Actions;
use App\Models\Reactions;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServicesController extends Controller
{

    /**
     * Store a newly created service in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:services,name',
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'auth_type' => 'required|string|max:255',
        ]);

        $service = Services::create($validated);

        return response()->json([
            'message' => 'Service created successfully',
            'service' => $service,
        ], 201);
    }

    /**
     * Store a newly created Action in storage.
     */
    public function storeActions(Request $request, $id): JsonResponse
    {
        $service = Services::find($id);

        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validated['service_id'] = $service->id;
        $action = Actions::create($validated);

        return response()->json([
            'message' => 'Action created successfully',
            'action' => $action,
        ], 201);
    }

    /**
     * Store a newly created Reaction in storage.
     */
    public function storeReactions(Request $request, $id): JsonResponse
    {
        $service = Services::find($id);

        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validated['service_id'] = $service->id;
        $reaction = Reactions::create($validated);

        return response()->json([
            'message' => 'Reaction created successfully',
            'reaction' => $reaction,
        ], 201);
    }

    /**
     * Display a listing of all services, including their actions and reactions.
     */
    public function index(): JsonResponse
    {
        $services = Services::with(['actions', 'reactions'])->get()
            ->sortBy('id'); // Sort services by ID

        return response()->json([
            'client' => [
                'host' => request()->ip(), // Get the client's IP address
            ],
            'server' => [
                'current_time' => now()->timestamp, // Get the current Unix timestamp
                'services' => $services->toArray(),
            ],
        ]);

        console.log("index called successfully");
    }

    /**
     * Display the specified service by ID, including its actions and reactions.
     */
    public function show($id): JsonResponse
    {
        $service = Services::with(['actions', 'reactions'])->find($id);

        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        return response()->json([
            'client' => [
                'host' => request()->ip(),
            ],
            'server' => [
                'current_time' => now()->timestamp,
                'service' => $service,
            ],
        ]);

        console.log("show called successfully with id: ", id);
    }

    /**
     * Display the actions of the specified service by ID.
     */
    public function showActions($id): JsonResponse
    {
        $service = Services::with('actions')->find($id);

        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        if (!$service->actions) {
            return response()->json(['message' => 'No actions found for this service'], 404);
        }

        return response()->json([
            'client' => [
                'host' => request()->ip(),
            ],
            'server' => [
                'current_time' => now()->timestamp,
                'actions' => $service->actions,
            ],
        ]);

        console.log("showActions called successfully with id: ", id);
    }

    /**
     * Display the reactions of the specified service by ID.
     */
    public function showReactions($id): JsonResponse
    {
        $service = Services::with('reactions')->find($id);

        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        if (!$service->reactions) {
            return response()->json(['message' => 'No reactions found for this service'], 404);
        }

        return response()->json([
            'client' => [
                'host' => request()->ip(),
            ],
            'server' => [
                'current_time' => now()->timestamp,
                'reactions' => $service->reactions,
            ],
        ]);

        console.log("showReactions called successfully with id: ", id);
    }

    /**
     * Display the specified service by ID, including its actions and reactions.
     */
    public function destroy(Services $service): JsonResponse
    {
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        // Delete the service
        $service->delete();

        return response()->json(['message' => 'Service and its associated actions and reactions deleted successfully'], 200);
    }
}
