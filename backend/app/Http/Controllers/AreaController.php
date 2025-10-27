<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\UserServiceToken;
use App\Models\Action;
use App\Models\Reaction;
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
     * Get a single AREA by ID
     */
    public function show(Request $request, $id): JsonResponse
    {
        $area = Area::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (!$area) {
            return response()->json([
                'success' => false,
                'message' => 'AREA not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
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
            ]
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
            [
                'id' => 'steam_to_telegram',
                'name' => 'Steam to Telegram',
                'description' => 'Get notified on Telegram when you purchase a new game on Steam',
                'action_service' => 'Steam',
                'action_type' => 'new_game_purchased',
                'reaction_service' => 'Telegram',
                'reaction_type' => 'send_message',
                'requires_services' => ['Steam', 'Telegram'],
                'services_connected' => [
                    'Steam' => in_array('Steam', $connectedServices),
                    'Telegram' => in_array('Telegram', $connectedServices),
                ],
                'can_activate' => in_array('Steam', $connectedServices) && in_array('Telegram', $connectedServices),
                'default_config' => [
                    'reaction_config' => [
                        'message_template' => "🎮 New game purchased on Steam!\n\n🎯 Game: {game_name}\n🕒 Playtime: {playtime_forever} minutes\n📅 Detected: {detected_at}"
                    ]
                ]
            ],
            [
                'id' => 'youtube_to_discord',
                'name' => 'YouTube to Discord',
                'description' => 'Send a Discord message when you like a video on YouTube',
                'action_service' => 'YouTube',
                'action_type' => 'video_liked',
                'reaction_service' => 'Discord',
                'reaction_type' => 'send_message',
                'requires_services' => ['YouTube', 'Discord'],
                'services_connected' => [
                    'YouTube' => in_array('YouTube', $connectedServices),
                    'Discord' => in_array('Discord', $connectedServices),
                ],
                'can_activate' => in_array('YouTube', $connectedServices) && in_array('Discord', $connectedServices),
                'default_config' => [
                    'reaction_config' => [
                        'content' => "🎥 You liked a new video!\n\n📺 **{title}**\n👤 Channel: {channel}\n🔗 {url}"
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

            // Get Gmail email from OAuth token (stored in additional_data)
            $gmailToken = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Gmail')
                ->first();

            $gmailEmail = $gmailToken && isset($gmailToken->additional_data['email'])
                ? $gmailToken->additional_data['email']
                : $request->user()->email;

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
                    'to' => $gmailEmail,
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

        // For Steam to Telegram template
        if ($validated['template_id'] === 'steam_to_telegram') {
            // Verify both services are connected
            $hasSteam = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Steam')
                ->exists();

            $hasTelegram = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Telegram')
                ->exists();

            if (!$hasSteam || !$hasTelegram) {
                return response()->json([
                    'success' => false,
                    'error' => 'Please connect both Steam and Telegram services first',
                    'missing_services' => [
                        'Steam' => !$hasSteam,
                        'Telegram' => !$hasTelegram,
                    ]
                ], 400);
            }

            // Create AREA
            $area = Area::create([
                'user_id' => $userId,
                'name' => $validated['name'] ?? 'Steam to Telegram',
                'description' => 'Sends Telegram notification when you purchase a new game on Steam',
                'action_service' => 'Steam',
                'action_type' => 'new_game_purchased',
                'action_config' => [
                    'last_game_ids' => [] // Will store game IDs to detect new purchases
                ],
                'reaction_service' => 'Telegram',
                'reaction_type' => 'send_message',
                'reaction_config' => $validated['reaction_config'] ?? [
                    'message_template' => "🎮 New game purchased on Steam!\n\n🎯 Game: {game_name}\n🕒 Playtime: {playtime_forever} minutes\n📅 Detected: {detected_at}"
                ],
                'active' => false, // User must manually activate
            ]);

            Log::info('AREA created', [
                'area_id' => $area->id,
                'user_id' => $userId,
                'template' => 'steam_to_telegram'
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

        // For YouTube to Discord template
        if ($validated['template_id'] === 'youtube_to_discord') {
            // Verify both services are connected
            $hasYouTube = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'YouTube')
                ->exists();

            $hasDiscord = UserServiceToken::where('user_id', $userId)
                ->where('service_name', 'Discord')
                ->exists();

            if (!$hasYouTube || !$hasDiscord) {
                return response()->json([
                    'success' => false,
                    'error' => 'Please connect both YouTube and Discord services first',
                    'missing_services' => [
                        'YouTube' => !$hasYouTube,
                        'Discord' => !$hasDiscord,
                    ]
                ], 400);
            }

            // Create AREA
            $area = Area::create([
                'user_id' => $userId,
                'name' => $validated['name'] ?? 'YouTube to Discord',
                'description' => 'Sends Discord message when you like a YouTube video',
                'action_service' => 'YouTube',
                'action_type' => 'video_liked',
                'action_config' => [
                    'last_video_ids' => [] // Will store video IDs to detect new likes
                ],
                'reaction_service' => 'Discord',
                'reaction_type' => 'send_message',
                'reaction_config' => $validated['reaction_config'] ?? [
                    'content' => "🎥 You liked a new video!\n\n📺 **{title}**\n👤 Channel: {channel}\n🔗 {url}"
                ],
                'active' => false, // User must manually activate
            ]);

            Log::info('AREA created', [
                'area_id' => $area->id,
                'user_id' => $userId,
                'template' => 'youtube_to_discord'
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

    /**
     * Create custom AREA (user-defined action and reaction)
     */
    public function storeCustom(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'action_service' => 'required|string',
            'action_type' => 'required|string',
            'action_config' => 'nullable|array',
            'reaction_service' => 'required|string',
            'reaction_type' => 'required|string',
            'reaction_config' => 'nullable|array',
            'active' => 'nullable|boolean',
        ]);

        $userId = $request->user()->id;

        // Verify both services are connected
        $hasActionService = UserServiceToken::where('user_id', $userId)
            ->where('service_name', $validated['action_service'])
            ->exists();

        $hasReactionService = UserServiceToken::where('user_id', $userId)
            ->where('service_name', $validated['reaction_service'])
            ->exists();

        if (!$hasActionService || !$hasReactionService) {
            return response()->json([
                'success' => false,
                'error' => 'Please connect both services first',
                'missing_services' => [
                    $validated['action_service'] => !$hasActionService,
                    $validated['reaction_service'] => !$hasReactionService,
                ]
            ], 400);
        }

        // Set default action_config based on action service
        $defaultActionConfig = [];
        if ($validated['action_service'] === 'YouTube') {
            $defaultActionConfig = ['last_video_ids' => []];
        } elseif ($validated['action_service'] === 'Steam') {
            $defaultActionConfig = ['last_game_ids' => []];
        } elseif ($validated['action_service'] === 'Discord') {
            $defaultActionConfig = ['last_message_id' => null];
        } elseif ($validated['action_service'] === 'Gmail') {
            $defaultActionConfig = ['last_message_ids' => []];
        } elseif ($validated['action_service'] === 'Telegram') {
            $defaultActionConfig = ['last_update_id' => 0];
            // Add keyword for message_contains_keyword action type
            if ($validated['action_type'] === 'message_contains_keyword') {
                $defaultActionConfig['keyword'] = 'hello';
            }
        }

        // Merge with user-provided config
        $actionConfig = array_merge($defaultActionConfig, $validated['action_config'] ?? []);

        // Create AREA
        $area = Area::create([
            'user_id' => $userId,
            'name' => $validated['name'] ?? "{$validated['action_service']} to {$validated['reaction_service']}",
            'description' => $validated['description'] ?? "Custom automation",
            'action_service' => $validated['action_service'],
            'action_type' => $validated['action_type'],
            'action_config' => $actionConfig,
            'reaction_service' => $validated['reaction_service'],
            'reaction_type' => $validated['reaction_type'],
            'reaction_config' => $validated['reaction_config'] ?? [],
            'active' => $validated['active'] ?? false,
        ]);

        Log::info('Custom AREA created', [
            'area_id' => $area->id,
            'user_id' => $userId,
            'action' => "{$validated['action_service']}.{$validated['action_type']}",
            'reaction' => "{$validated['reaction_service']}.{$validated['reaction_type']}"
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Custom AREA created successfully',
            'data' => [
                'id' => $area->id,
                'name' => $area->name,
                'active' => $area->active,
            ]
        ], 201);
    }

    /**
     * Get all available actions (optionally filtered by service)
     */
    public function getActions(Request $request): JsonResponse
    {
        $serviceName = $request->query('service');

        if ($serviceName) {
            $actions = Action::forService($serviceName);
        } else {
            $actions = Action::where('active', true)->get();
        }

        return response()->json([
            'success' => true,
            'data' => $actions
        ]);
    }

    /**
     * Get all available reactions (optionally filtered by service)
     */
    public function getReactions(Request $request): JsonResponse
    {
        $serviceName = $request->query('service');

        if ($serviceName) {
            $reactions = Reaction::forService($serviceName);
        } else {
            $reactions = Reaction::where('active', true)->get();
        }

        return response()->json([
            'success' => true,
            'data' => $reactions
        ]);
    }

    /**
     * Get actions and reactions grouped by service
     */
    public function getActionsAndReactions(Request $request): JsonResponse
    {
        $actions = Action::allGroupedByService();
        $reactions = Reaction::allGroupedByService();

        return response()->json([
            'success' => true,
            'data' => [
                'actions' => $actions,
                'reactions' => $reactions
            ]
        ]);
    }
}
