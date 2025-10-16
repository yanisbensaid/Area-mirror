<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\UserServiceToken;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AreaController extends Controller
{
    /**
     * List user's AREAs
     */
    public function index(Request $request): JsonResponse
    {
        $areas = Area::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($area) {
                return [
                    'id' => $area->id,
                    'name' => $area->name,
                    'description' => $area->description,
                    'active' => $area->active,
                    'action_service' => $area->action_service,
                    'action_type' => $area->action_type,
                    'reaction_service' => $area->reaction_service,
                    'reaction_type' => $area->reaction_type,
                    'trigger_count' => $area->trigger_count,
                    'last_triggered_at' => $area->last_triggered_at?->toIso8601String(),
                    'can_execute' => $area->canExecute(),
                    'created_at' => $area->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $areas
        ]);
    }

    /**
     * Get available AREA templates
     */
    public function templates(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Check which services user has connected
        $connectedServices = UserServiceToken::where('user_id', $userId)
            ->pluck('service_name')
            ->toArray();

        $templates = [
            [
                'id' => 'youtube_to_telegram',
                'name' => 'YouTube to Telegram',
                'description' => 'Get notified on Telegram when you like a video on YouTube',
                'action_service' => 'YouTube',
                'action_type' => 'video_liked',
                'reaction_service' => 'Telegram',
                'reaction_type' => 'send_message',
                'requires_services' => ['YouTube', 'Telegram'],
                'services_connected' => [
                    'YouTube' => in_array('YouTube', $connectedServices),
                    'Telegram' => in_array('Telegram', $connectedServices),
                ],
                'can_activate' => in_array('YouTube', $connectedServices) && in_array('Telegram', $connectedServices),
                'default_config' => [
                    'reaction_config' => [
                        'message_template' => "🎥 You liked a new video!\n\n📺 {title}\n👤 {channel}\n🔗 {url}"
                    ]
                ]
            ],
            [
                'id' => 'twitch_to_telegram',
                'name' => 'Twitch to Telegram',
                'description' => 'Get notified on Telegram when you start streaming on Twitch',
                'action_service' => 'Twitch',
                'action_type' => 'stream_started',
                'reaction_service' => 'Telegram',
                'reaction_type' => 'send_message',
                'requires_services' => ['Twitch', 'Telegram'],
                'services_connected' => [
                    'Twitch' => in_array('Twitch', $connectedServices),
                    'Telegram' => in_array('Telegram', $connectedServices),
                ],
                'can_activate' => in_array('Twitch', $connectedServices) && in_array('Telegram', $connectedServices),
                'default_config' => [
                    'reaction_config' => [
                        'message_template' => "🔴 You're now LIVE on Twitch!\n\n📺 {title}\n🎮 {game_name}\n👥 {viewer_count} viewers\n🔗 https://twitch.tv/{user_name}"
                    ]
                ]
            ],
            [
                'id' => 'youtube_to_gmail',
                'name' => 'YouTube to Gmail',
                'description' => 'Receive an email when you like a video on YouTube',
                'action_service' => 'YouTube',
                'action_type' => 'video_liked',
                'reaction_service' => 'Gmail',
                'reaction_type' => 'send_email',
                'requires_services' => ['YouTube', 'Gmail'],
                'services_connected' => [
                    'YouTube' => in_array('YouTube', $connectedServices),
                    'Gmail' => in_array('Gmail', $connectedServices),
                ],
                'can_activate' => in_array('YouTube', $connectedServices) && in_array('Gmail', $connectedServices),
                'default_config' => [
                    'reaction_config' => [
                        'to' => '{user_email}',
                        'subject' => 'You liked a new YouTube video',
                        'body' => "<h2>🎥 You liked a new video!</h2><p><strong>📺 Title:</strong> {title}</p><p><strong>👤 Channel:</strong> {channel}</p><p><strong>🔗 Link:</strong> <a href='{url}'>{url}</a></p>"
                    ]
                ]
            ],
            [
                'id' => 'gmail_to_telegram',
                'name' => 'Gmail to Telegram',
                'description' => 'Get notified on Telegram when you receive a new email',
                'action_service' => 'Gmail',
                'action_type' => 'new_email_received',
                'reaction_service' => 'Telegram',
                'reaction_type' => 'send_message',
                'requires_services' => ['Gmail', 'Telegram'],
                'services_connected' => [
                    'Gmail' => in_array('Gmail', $connectedServices),
                    'Telegram' => in_array('Telegram', $connectedServices),
                ],
                'can_activate' => in_array('Gmail', $connectedServices) && in_array('Telegram', $connectedServices),
                'default_config' => [
                    'reaction_config' => [
                        'message_template' => "📧 New email received!\n\n📨 From: {from}\n📝 Subject: {subject}\n📅 Date: {date}"
                    ]
                ]
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $templates
        ]);
    }

    /**
     * Create new AREA from template
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'template_id' => 'required|string',
            'name' => 'nullable|string|max:255',
            'reaction_config' => 'nullable|array',
        ]);

        $userId = $request->user()->id;

        // For YouTube to Telegram template
        if ($validated['template_id'] === 'youtube_to_telegram') {
            // Verify both services are connected
            $hasYouTube = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'YouTube')
                ->exists();

            $hasTelegram = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Telegram')
                ->exists();

            if (!$hasYouTube || !$hasTelegram) {
                return response()->json([
                    'success' => false,
                    'error' => 'Please connect both YouTube and Telegram services first',
                    'missing_services' => [
                        'YouTube' => !$hasYouTube,
                        'Telegram' => !$hasTelegram,
                    ]
                ], 400);
            }

            // Create AREA
            $area = Area::create([
                'user_id' => $userId,
                'name' => $validated['name'] ?? 'YouTube to Telegram',
                'description' => 'Sends Telegram notification when you like a YouTube video',
                'action_service' => 'YouTube',
                'action_type' => 'video_liked',
                'action_config' => [
                    'last_video_ids' => [] // Will store video IDs to detect new likes
                ],
                'reaction_service' => 'Telegram',
                'reaction_type' => 'send_message',
                'reaction_config' => $validated['reaction_config'] ?? [
                    'message_template' => "🎥 You liked a new video!\n\n📺 {title}\n👤 {channel}\n🔗 {url}"
                ],
                'active' => false, // User must manually activate
            ]);

            Log::info('AREA created', [
                'area_id' => $area->id,
                'user_id' => $userId,
                'template' => 'youtube_to_telegram'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'AREA created successfully. Click "Activate" to start monitoring.',
                'data' => [
                    'id' => $area->id,
                    'name' => $area->name,
                    'active' => $area->active,
                ]
            ], 201);
        }

        // For Twitch to Telegram template
        if ($validated['template_id'] === 'twitch_to_telegram') {
            // Verify both services are connected
            $hasTwitch = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Twitch')
                ->exists();

            $hasTelegram = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Telegram')
                ->exists();

            if (!$hasTwitch || !$hasTelegram) {
                return response()->json([
                    'success' => false,
                    'error' => 'Please connect both Twitch and Telegram services first',
                    'missing_services' => [
                        'Twitch' => !$hasTwitch,
                        'Telegram' => !$hasTelegram,
                    ]
                ], 400);
            }

            // Create AREA
            $area = Area::create([
                'user_id' => $userId,
                'name' => $validated['name'] ?? 'Twitch to Telegram',
                'description' => 'Sends Telegram notification when you start streaming on Twitch',
                'action_service' => 'Twitch',
                'action_type' => 'stream_started',
                'action_config' => [
                    'last_stream_id' => null // Will store stream ID to detect new streams
                ],
                'reaction_service' => 'Telegram',
                'reaction_type' => 'send_message',
                'reaction_config' => $validated['reaction_config'] ?? [
                    'message_template' => "🔴 You're now LIVE on Twitch!\n\n📺 {title}\n🎮 {game_name}\n👥 {viewer_count} viewers\n🔗 https://twitch.tv/{user_name}"
                ],
                'active' => false, // User must manually activate
            ]);

            Log::info('AREA created', [
                'area_id' => $area->id,
                'user_id' => $userId,
                'template' => 'twitch_to_telegram'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'AREA created successfully. Click "Activate" to start monitoring.',
                'data' => [
                    'id' => $area->id,
                    'name' => $area->name,
                    'active' => $area->active,
                ]
            ], 201);
        }

        // For YouTube to Gmail template
        if ($validated['template_id'] === 'youtube_to_gmail') {
            // Verify both services are connected
            $hasYouTube = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'YouTube')
                ->exists();

            $hasGmail = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Gmail')
                ->exists();

            if (!$hasYouTube || !$hasGmail) {
                return response()->json([
                    'success' => false,
                    'error' => 'Please connect both YouTube and Gmail services first',
                    'missing_services' => [
                        'YouTube' => !$hasYouTube,
                        'Gmail' => !$hasGmail,
                    ]
                ], 400);
            }

            // Get user email for the 'to' field
            $userEmail = $request->user()->email;

            // Create AREA
            $area = Area::create([
                'user_id' => $userId,
                'name' => $validated['name'] ?? 'YouTube to Gmail',
                'description' => 'Sends email notification when you like a YouTube video',
                'action_service' => 'YouTube',
                'action_type' => 'video_liked',
                'action_config' => [
                    'last_video_ids' => [] // Will store video IDs to detect new likes
                ],
                'reaction_service' => 'Gmail',
                'reaction_type' => 'send_email',
                'reaction_config' => $validated['reaction_config'] ?? [
                    'to' => $userEmail,
                    'subject' => 'You liked a new YouTube video',
                    'body' => "<h2>🎥 You liked a new video!</h2><p><strong>📺 Title:</strong> {title}</p><p><strong>👤 Channel:</strong> {channel}</p><p><strong>🔗 Link:</strong> <a href='{url}'>{url}</a></p>"
                ],
                'active' => false, // User must manually activate
            ]);

            Log::info('AREA created', [
                'area_id' => $area->id,
                'user_id' => $userId,
                'template' => 'youtube_to_gmail'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'AREA created successfully. Click "Activate" to start monitoring.',
                'data' => [
                    'id' => $area->id,
                    'name' => $area->name,
                    'active' => $area->active,
                ]
            ], 201);
        }

        // For Gmail to Telegram template
        if ($validated['template_id'] === 'gmail_to_telegram') {
            // Verify both services are connected
            $hasGmail = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Gmail')
                ->exists();

            $hasTelegram = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Telegram')
                ->exists();

            if (!$hasGmail || !$hasTelegram) {
                return response()->json([
                    'success' => false,
                    'error' => 'Please connect both Gmail and Telegram services first',
                    'missing_services' => [
                        'Gmail' => !$hasGmail,
                        'Telegram' => !$hasTelegram,
                    ]
                ], 400);
            }

            // Create AREA
            $area = Area::create([
                'user_id' => $userId,
                'name' => $validated['name'] ?? 'Gmail to Telegram',
                'description' => 'Sends Telegram notification when you receive a new email',
                'action_service' => 'Gmail',
                'action_type' => 'new_email_received',
                'action_config' => [
                    'last_message_ids' => [] // Will store message IDs to detect new emails
                ],
                'reaction_service' => 'Telegram',
                'reaction_type' => 'send_message',
                'reaction_config' => $validated['reaction_config'] ?? [
                    'message_template' => "📧 New email received!\n\n📨 From: {from}\n📝 Subject: {subject}\n📅 Date: {date}"
                ],
                'active' => false, // User must manually activate
            ]);

            Log::info('AREA created', [
                'area_id' => $area->id,
                'user_id' => $userId,
                'template' => 'gmail_to_telegram'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'AREA created successfully. Click "Activate" to start monitoring.',
                'data' => [
                    'id' => $area->id,
                    'name' => $area->name,
                    'active' => $area->active,
                ]
            ], 201);
        }

        return response()->json([
            'success' => false,
            'error' => 'Unknown template ID'
        ], 400);
    }

    /**
     * Toggle AREA active status
     */
    public function toggle(Request $request, Area $area): JsonResponse
    {
        // Verify ownership
        if ($area->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized'
            ], 403);
        }

        // Check if can execute before activating
        if (!$area->active && !$area->canExecute()) {
            return response()->json([
                'success' => false,
                'error' => 'Cannot activate: required services not connected'
            ], 400);
        }

        $area->active = !$area->active;
        $area->save();

        Log::info('AREA toggled', [
            'area_id' => $area->id,
            'user_id' => $request->user()->id,
            'active' => $area->active
        ]);

        return response()->json([
            'success' => true,
            'message' => $area->active ? 'AREA activated' : 'AREA deactivated',
            'data' => [
                'id' => $area->id,
                'active' => $area->active
            ]
        ]);
    }

    /**
     * Delete AREA
     */
    public function destroy(Request $request, Area $area): JsonResponse
    {
        if ($area->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized'
            ], 403);
        }

        Log::info('AREA deleted', [
            'area_id' => $area->id,
            'user_id' => $request->user()->id
        ]);

        $area->delete();

        return response()->json([
            'success' => true,
            'message' => 'AREA deleted successfully'
        ]);
    }
}
