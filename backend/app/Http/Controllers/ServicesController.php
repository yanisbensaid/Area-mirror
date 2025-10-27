<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Action;
use App\Models\Reaction;
use App\Models\User;
use App\Services\IconService;
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
            'icon_url' => 'nullable|url',
        ]);

        // If no icon_url provided, try to automatically find one
        if (empty($validated['icon_url'])) {
            $autoIcon = IconService::findIconForService($validated['name']);
            if ($autoIcon) {
                $validated['icon_url'] = $autoIcon;
            }
        }

        $service = Service::create($validated);

        return response()->json([
            'message' => 'Service created successfully',
            'service' => $service,
        ], 201);
    }

    /**
     * Update an existing service in storage.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:services,name,' . $id,
            'description' => 'nullable|string',
            'status' => 'required|in:active,inactive',
            'auth_type' => 'required|string|max:255',
            'icon_url' => 'nullable|url',
        ]);

        // If no icon_url provided, try to automatically find one (only if name changed)
        if (empty($validated['icon_url']) && $validated['name'] !== $service->name) {
            $autoIcon = IconService::findIconForService($validated['name']);
            if ($autoIcon) {
                $validated['icon_url'] = $autoIcon;
            }
        }

        $service->update($validated);

        return response()->json([
            'message' => 'Service updated successfully',
            'service' => $service->fresh(),
        ], 200);
    }

    /**
     * Store a newly created Action in storage.
     */
    public function storeActions(Request $request, $id): JsonResponse
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validated['service_id'] = $service->id;
        $action = Action::create($validated);

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
        $service = Service::find($id);

        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $validated['service_id'] = $service->id;
        $reaction = Reaction::create($validated);

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
        try {
            $services = Service::with(['actions', 'reactions'])->get()
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
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Database error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified service by ID, including its actions and reactions.
     */
    public function show($id): JsonResponse
    {
        $service = Service::with(['actions', 'reactions'])->find($id);

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
        $service = Service::with('actions')->find($id);

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
        $service = Service::with('reactions')->find($id);

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
     * Store a new action for a service.
     */
    public function storeAction(Request $request, $serviceId): JsonResponse
    {
        $service = Service::find($serviceId);
        
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'trigger_type' => 'nullable|string|max:255',
            'trigger_config' => 'nullable|array',
        ]);

        $validated['service_id'] = $serviceId;

        $action = Action::create($validated);

        return response()->json([
            'message' => 'Action created successfully',
            'action' => $action,
        ], 201);
    }

    /**
     * Store a new reaction for a service.
     */
    public function storeReaction(Request $request, $serviceId): JsonResponse
    {
        $service = Service::find($serviceId);
        
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'action_type' => 'nullable|string|max:255',
            'action_config' => 'nullable|array',
        ]);

        $validated['service_id'] = $serviceId;

        $reaction = Reaction::create($validated);

        return response()->json([
            'message' => 'Reaction created successfully',
            'reaction' => $reaction,
        ], 201);
    }

    /**
     * Destroy the specified service by ID, including its actions and reactions.
     */
    public function destroy(Service $service): JsonResponse
    {
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        // Delete the service
        $service->delete();

        return response()->json(['message' => 'Service and its associated actions and reactions deleted successfully'], 200);
    }

    /**
     * Destroy a specified action of the specified service by ID.
     */
    public function destroyAction(Service $service, $actionId): JsonResponse
    {
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $action = $service->actions()->find($actionId);

        if (!$action) {
            return response()->json(['message' => 'Action not found'], 404);
        }

        $action->delete();

        return response()->json(['message' => 'Action deleted successfully'], 200);
    }

    /**
     * Show a specific action by ID.
     */
    public function showAction($actionId): JsonResponse
    {
        $action = Action::find($actionId);

        if (!$action) {
            return response()->json(['message' => 'Action not found'], 404);
        }

        return response()->json([
            'server' => [
                'action' => $action
            ]
        ], 200);
    }

    /**
     * Update a specific action by ID.
     */
    public function updateAction(Request $request, $actionId): JsonResponse
    {
        $action = Action::find($actionId);

        if (!$action) {
            return response()->json(['message' => 'Action not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'required|string|max:255',
        ]);

        $action->update($validated);

        return response()->json([
            'message' => 'Action updated successfully',
            'server' => [
                'action' => $action
            ]
        ], 200);
    }

    /**
     * Delete a specific action by ID.
     */
    public function deleteAction($actionId): JsonResponse
    {
        $action = Action::find($actionId);

        if (!$action) {
            return response()->json(['message' => 'Action not found'], 404);
        }

        $action->delete();

        return response()->json(['message' => 'Action deleted successfully'], 200);
    }

    /**
     * Show a specific reaction by ID.
     */
    public function showReaction($reactionId): JsonResponse
    {
        $reaction = Reaction::find($reactionId);

        if (!$reaction) {
            return response()->json(['message' => 'Reaction not found'], 404);
        }

        return response()->json([
            'server' => [
                'reaction' => $reaction
            ]
        ], 200);
    }

    /**
     * Update a specific reaction by ID.
     */
    public function updateReaction(Request $request, $reactionId): JsonResponse
    {
        $reaction = Reaction::find($reactionId);

        if (!$reaction) {
            return response()->json(['message' => 'Reaction not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'reaction_type' => 'required|string|max:255',
        ]);

        $reaction->update($validated);

        return response()->json([
            'message' => 'Reaction updated successfully',
            'server' => [
                'reaction' => $reaction
            ]
        ], 200);
    }

    /**
     * Delete a specific reaction by ID.
     */
    public function deleteReaction($reactionId): JsonResponse
    {
        $reaction = Reaction::find($reactionId);

        if (!$reaction) {
            return response()->json(['message' => 'Reaction not found'], 404);
        }

        $reaction->delete();

        return response()->json(['message' => 'Reaction deleted successfully'], 200);
    }

    /**
     * Destroy a specified reaction of the specified service by ID.
     */
    public function destroyReaction(Service $service, $reactionId): JsonResponse
    {
        if (!$service) {
            return response()->json(['message' => 'Service not found'], 404);
        }

        $reaction = $service->reactions()->find($reactionId);

        if (!$reaction) {
            return response()->json(['message' => 'Reaction not found'], 404);
        }

        $reaction->delete();

        return response()->json(['message' => 'Reaction deleted successfully'], 200);
    }
}
