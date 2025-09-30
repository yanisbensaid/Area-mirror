<?php

namespace App\Http\Controllers;

use App\Models\Automation;
use App\Models\Service;
use App\Models\Action;
use App\Models\Reaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AutomationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $automations = Automation::with([
            'triggerService',
            'actionService', 
            'action',
            'reaction',
            'user'
        ])->get();

        return response()->json($automations);
    }

    /**
     * Display automations for a specific service.
     */
    public function getAutomationsForService($serviceId)
    {
        $automations = Automation::with([
            'triggerService',
            'actionService',
            'action',
            'reaction'
        ])
        ->where('trigger_service_id', $serviceId)
        ->orWhere('action_service_id', $serviceId)
        ->get();

        return response()->json($automations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_service_id' => 'required|exists:services,id',
            'action_service_id' => 'required|exists:services,id',
            'action_id' => 'required|exists:actions,id',
            'reaction_id' => 'required|exists:reactions,id',
            'category' => 'nullable|string',
            'tags' => 'nullable|array',
        ]);

        $automation = Automation::create([
            'name' => $request->name,
            'description' => $request->description,
            'trigger_service_id' => $request->trigger_service_id,
            'action_service_id' => $request->action_service_id,
            'action_id' => $request->action_id,
            'reaction_id' => $request->reaction_id,
            'user_id' => Auth::id(),
            'category' => $request->category,
            'tags' => $request->tags,
            'is_active' => true,
            'popularity' => 0,
        ]);

        return response()->json($automation->load([
            'triggerService',
            'actionService',
            'action',
            'reaction'
        ]), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Automation $automation)
    {
        return response()->json($automation->load([
            'triggerService',
            'actionService',
            'action',
            'reaction',
            'user'
        ]));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Automation $automation)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
            'category' => 'nullable|string',
            'tags' => 'nullable|array',
        ]);

        $automation->update($request->only([
            'name',
            'description',
            'is_active',
            'category',
            'tags'
        ]));

        return response()->json($automation->load([
            'triggerService',
            'actionService',
            'action',
            'reaction'
        ]));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Automation $automation)
    {
        $automation->delete();
        return response()->json(['message' => 'Automation deleted successfully']);
    }
}
