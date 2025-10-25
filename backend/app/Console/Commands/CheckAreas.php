<?php

namespace App\Console\Commands;

use App\Models\Area;
use App\Models\UserServiceToken;
use App\Services\ServiceManager;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CheckAreas extends Command
{
    protected $signature = 'areas:check';
    protected $description = 'Check all active AREAs and trigger reactions when conditions are met';

    public function handle(ServiceManager $serviceManager): int
    {
        $activeAreas = Area::where('active', true)
            ->with('user')
            ->get();

        $this->info("🔍 Checking {$activeAreas->count()} active AREAs...");

        $triggered = 0;
        $errors = 0;

        foreach ($activeAreas as $area) {
            try {
                if ($this->checkArea($area, $serviceManager)) {
                    $triggered++;
                }
            } catch (\Exception $e) {
                $errors++;
                Log::error("Failed to check AREA {$area->id}", [
                    'area_id' => $area->id,
                    'user_id' => $area->user_id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                $this->error("❌ Error checking AREA {$area->id}: {$e->getMessage()}");
            }
        }

        $this->info("✅ Check complete! Triggered: {$triggered}, Errors: {$errors}");
        return 0;
    }

    private function checkArea(Area $area, ServiceManager $serviceManager): bool
    {
        // Verify area can execute
        if (!$area->canExecute()) {
            $this->warn("⚠️  AREA {$area->id} cannot execute (services not connected)");
            return false;
        }

        // Get action service
        $actionService = $serviceManager->get($area->action_service);
        if (!$actionService) {
            $this->error("❌ Action service '{$area->action_service}' not found");
            return false;
        }

        // Get user's token for action service
        $actionToken = UserServiceToken::where('user_id', $area->user_id)
            ->where('service_name', $area->action_service)
            ->first();

        if (!$actionToken) {
            $this->warn("⚠️  No token found for {$area->action_service}");
            return false;
        }

        // Check if token expired and try to refresh
        if ($actionToken->expires_at && $actionToken->expires_at->isPast()) {
            $this->info("🔄 Token expired, attempting refresh...");

            $oauthController = app(\App\Http\Controllers\OAuthController::class);

            if ($area->action_service === 'YouTube') {
                if (!$oauthController->refreshYouTubeToken($actionToken)) {
                    $this->error("❌ Failed to refresh YouTube token");
                    return false;
                }
                $actionToken->refresh(); // Reload from database
            } elseif ($area->action_service === 'Twitch') {
                if (!$oauthController->refreshTwitchToken($actionToken)) {
                    $this->error("❌ Failed to refresh Twitch token");
                    return false;
                }
                $actionToken->refresh(); // Reload from database
            } elseif ($area->action_service === 'Gmail') {
                if (!$oauthController->refreshGmailToken($actionToken)) {
                    $this->error("❌ Failed to refresh Gmail token");
                    return false;
                }
                $actionToken->refresh(); // Reload from database
            }
        }

        // Authenticate action service
        if ($area->action_service === 'Steam') {
            // Steam uses API key + user_id
            $additionalData = $actionToken->additional_data ?? [];
            $actionService->authenticate([
                'api_key' => $actionToken->getDecryptedAccessToken(),
                'user_id' => $additionalData['user_id'] ?? null
            ]);
        } elseif ($area->action_service === 'Discord') {
            // Discord uses OAuth2 access_token
            $actionService->authenticate([
                'access_token' => $actionToken->getDecryptedAccessToken()
            ]);
        } elseif ($area->action_service === 'Telegram') {
            // Telegram uses bot_token + chat_id
            $actionService->authenticate([
                'bot_token' => $actionToken->getDecryptedAccessToken(),
                'chat_id' => $actionToken->getChatId()
            ]);
        } else {
            // OAuth2 services (YouTube, Gmail, Twitch)
            $actionService->authenticate([
                'access_token' => $actionToken->getDecryptedAccessToken()
            ]);
        }

        // Execute action (check for trigger)
        $this->info("🔍 Checking action: {$area->action_service}.{$area->action_type}");

        // Prepare action parameters based on service type
        $actionParams = [];
        if ($area->action_service === 'YouTube') {
            $actionParams = [
                'last_video_ids' => $area->getLastCheckedVideoIds()
            ];
        } elseif ($area->action_service === 'Twitch') {
            // Twitch uses different state management based on action type
            $actionConfig = $area->action_config ?? [];
            $actionParams = $actionConfig;
        } elseif ($area->action_service === 'Steam') {
            // Steam uses action_config for state tracking
            $actionConfig = $area->action_config ?? [];
            if ($area->action_type === 'new_game_purchased') {
                $actionParams = [
                    'last_game_ids' => $actionConfig['last_game_ids'] ?? []
                ];
            } else {
                $actionParams = $actionConfig;
            }
        } elseif ($area->action_service === 'Discord') {
            // Discord uses action_config for state tracking
            $actionConfig = $area->action_config ?? [];
            $actionParams = array_merge($actionConfig, [
                'channel_id' => $actionConfig['channel_id'] ?? null,
                'last_message_id' => $actionConfig['last_message_id'] ?? null,
            ]);
            if ($area->action_type === 'message_with_keyword') {
                $actionParams['keyword'] = $actionConfig['keyword'] ?? null;
            }
        } elseif ($area->action_service === 'Telegram') {
            // Telegram uses action_config for state tracking (update_id)
            $actionConfig = $area->action_config ?? [];
            $actionParams = array_merge($actionConfig, [
                'last_update_id' => $actionConfig['last_update_id'] ?? 0,
            ]);
        } else {
            // Default for other services
            $actionParams = $area->action_config ?? [];
        }

        $results = $actionService->executeAction($area->action_type, $actionParams);

        Log::info('AREA check results', [
            'area_id' => $area->id,
            'last_video_ids' => $area->getLastCheckedVideoIds(),
            'results_count' => count($results),
            'results' => $results
        ]);

        // Update last checked time
        $area->last_checked_at = now();

        // Handle empty results
        if (empty($results)) {
            $area->save();
            $this->info("ℹ️  No new triggers for AREA {$area->id}");
            return false;
        }

        // Check for initialization marker (first run)
        $isInitialization = isset($results[0]['_is_initialization']) && $results[0]['_is_initialization'] === true;

        // Check for state update marker (no new triggers but state exists)
        $isStateUpdate = isset($results['_current_state']);

        if ($isStateUpdate) {
            // Update state based on service type
            $currentState = $results['_current_state'];

            if ($area->action_service === 'YouTube') {
                $area->updateLastCheckedVideoIds(array_slice($currentState, -50));
            } else {
                // For other services (Twitch, etc), update action_config
                $area->action_config = array_merge($area->action_config ?? [], $currentState);
            }

            $area->save();
            $this->info("ℹ️  No new triggers for AREA {$area->id} - state updated");
            Log::info('State updated', ['state' => $currentState]);
            return false;
        }

        if ($isInitialization) {
            // First run - store state but don't trigger notifications (YouTube only)
            if ($area->action_service === 'YouTube') {
                $videoIds = array_column($results, 'video_id');
                $area->updateLastCheckedVideoIds(array_slice($videoIds, -50));
                $this->info("✨ AREA {$area->id} initialized with " . count($videoIds) . " existing video(s)");
                $area->save();
                Log::info('AREA initialized', ['area_id' => $area->id]);
                return false;
            }
            // Note: Twitch doesn't use initialization logic - it triggers immediately
        }

        // Check for duplicates before processing (YouTube-specific)
        if ($area->action_service === 'YouTube') {
            $lastCheckedIds = $area->getLastCheckedVideoIds();
            $newResults = array_filter($results, function($result) use ($lastCheckedIds) {
                return !in_array($result['video_id'], $lastCheckedIds);
            });

            if (empty($newResults)) {
                $area->save();
                $this->info("ℹ️  No new triggers for AREA {$area->id} (all already processed)");
                return false;
            }

            // Update last checked video IDs
            $allVideoIds = array_merge(
                $lastCheckedIds,
                array_column($newResults, 'video_id')
            );
            $area->updateLastCheckedVideoIds(array_slice($allVideoIds, -50));

            $results = array_values($newResults);
        } else {
            // For Twitch and other services, update state after successful trigger
            if ($area->action_service === 'Twitch' && !empty($results)) {
                if (isset($results[0]['stream_id'])) {
                    $area->action_config = array_merge($area->action_config ?? [], ['last_stream_id' => $results[0]['stream_id']]);
                } elseif (isset($results[0]['follower_id'])) {
                    $followerIds = array_column($results, 'follower_id');
                    $existingIds = $area->action_config['last_follower_ids'] ?? [];
                    $allFollowerIds = array_merge($existingIds, $followerIds);
                    $area->action_config = array_merge($area->action_config ?? [], ['last_follower_ids' => array_slice($allFollowerIds, -100)]);
                } elseif (isset($results[0]['new_title'])) {
                    $area->action_config = array_merge($area->action_config ?? [], ['last_title' => $results[0]['new_title']]);
                }
            } elseif ($area->action_service === 'Gmail' && !empty($results)) {
                // Gmail includes _current_state in each result
                if (isset($results[0]['_current_state'])) {
                    $area->action_config = array_merge($area->action_config ?? [], $results[0]['_current_state']);
                    Log::info('Gmail state updated', ['state' => $results[0]['_current_state']]);
                }
            } elseif ($area->action_service === 'Steam' && !empty($results)) {
                // Steam: update last_game_ids
                if ($area->action_type === 'new_game_purchased') {
                    $gameIds = array_column($results, 'game_id');
                    $existingIds = $area->action_config['last_game_ids'] ?? [];
                    $allGameIds = array_merge($existingIds, $gameIds);
                    $area->action_config = array_merge($area->action_config ?? [], ['last_game_ids' => array_slice($allGameIds, -100)]);
                }
            } elseif ($area->action_service === 'Discord' && !empty($results)) {
                // Discord: update last_message_id
                $lastMessageId = $results[count($results) - 1]['message_id'] ?? null;
                if ($lastMessageId) {
                    $area->action_config = array_merge($area->action_config ?? [], ['last_message_id' => $lastMessageId]);
                }
            } elseif ($area->action_service === 'Telegram' && !empty($results)) {
                // Telegram: update last_update_id from the last result
                $lastUpdateId = $results[count($results) - 1]['_last_update_id'] ?? null;
                if ($lastUpdateId) {
                    $area->action_config = array_merge($area->action_config ?? [], ['last_update_id' => $lastUpdateId]);
                    Log::info('Telegram state updated', ['last_update_id' => $lastUpdateId]);
                }
            }
        }

        // Execute reactions with results
        $this->info("🎯 Found " . count($results) . " new trigger(s), executing reactions...");
        $this->executeReactions($area, $results, $serviceManager);

        return true;
    }

    private function executeReactions(Area $area, array $triggerResults, ServiceManager $serviceManager): void
    {
        // Get reaction service
        $reactionService = $serviceManager->get($area->reaction_service);
        if (!$reactionService) {
            $this->error("❌ Reaction service '{$area->reaction_service}' not found");
            return;
        }

        // Get user's token for reaction service
        $reactionToken = UserServiceToken::where('user_id', $area->user_id)
            ->where('service_name', $area->reaction_service)
            ->first();

        if (!$reactionToken) {
            $this->warn("⚠️  No token found for {$area->reaction_service}");
            return;
        }

        // Authenticate reaction service based on service type
        if ($area->reaction_service === 'Telegram') {
            $reactionService->authenticate([
                'bot_token' => $reactionToken->getDecryptedAccessToken()
            ]);
        } elseif ($area->reaction_service === 'Discord') {
            $additionalData = $reactionToken->additional_data ?? [];
            $reactionService->authenticate([
                'bot_token' => $reactionToken->getDecryptedAccessToken(),
                'webhook_url' => $additionalData['webhook_url'] ?? null
            ]);
        } else {
            // For Gmail and other OAuth services
            $reactionService->authenticate([
                'access_token' => $reactionToken->getDecryptedAccessToken()
            ]);
        }

        // Execute reaction for each trigger result
        foreach ($triggerResults as $result) {
            try {
                // Build reaction parameters based on service type
                if ($area->reaction_service === 'Telegram') {
                    $chatId = $reactionToken->getChatId();
                    if (!$chatId) {
                        $this->warn("⚠️  No chat_id found. User needs to send /start to bot");
                        continue;
                    }

                    $message = $this->buildMessage($area->reaction_config, $result);
                    $this->info("📤 Sending message to Telegram...");

                    $reactionParams = [
                        'chat_id' => $chatId,
                        'text' => $message
                    ];
                } elseif ($area->reaction_service === 'Gmail') {
                    // Build email parameters
                    $reactionParams = $area->reaction_config;

                    // Add action service and action type to data for placeholders
                    $resultWithMeta = array_merge($result, [
                        'service' => $area->action_service,
                        'action_type' => $area->action_type,
                        'action_name' => $this->getActionDisplayName($area->action_service, $area->action_type)
                    ]);

                    // Replace placeholders in email content
                    foreach ($reactionParams as $key => $value) {
                        if (is_string($value)) {
                            $reactionParams[$key] = $this->replacePlaceholders($value, $resultWithMeta);
                        }
                    }

                    $this->info("📤 Sending email via Gmail...");
                } elseif ($area->reaction_service === 'Discord') {
                    // Build Discord message parameters
                    $content = $area->reaction_config['content'] ?? "🎥 New video!\n{title}\n{url}";

                    // Add action service and action type to data for placeholders
                    $resultWithMeta = array_merge($result, [
                        'service' => $area->action_service,
                        'action_type' => $area->action_type,
                        'action_name' => $this->getActionDisplayName($area->action_service, $area->action_type)
                    ]);

                    // Replace placeholders with actual data
                    $content = $this->replacePlaceholders($content, $resultWithMeta);

                    $this->info("📤 Sending message to Discord...");

                    $reactionParams = [
                        'webhook_url' => $area->reaction_config['webhook_url'] ?? null,
                        'content' => $content,
                        'username' => $area->reaction_config['username'] ?? 'AREA Bot'
                    ];
                } else {
                    $this->warn("⚠️  Unsupported reaction service: {$area->reaction_service}");
                    continue;
                }

                $success = $reactionService->executeReaction($area->reaction_type, $reactionParams);

                if ($success) {
                    // Update trigger count
                    $area->increment('trigger_count');
                    $area->last_triggered_at = now();
                    $area->save();

                    $this->info("✅ Reaction executed successfully");

                    Log::info("AREA triggered successfully", [
                        'area_id' => $area->id,
                        'user_id' => $area->user_id,
                        'trigger_data' => $result
                    ]);
                } else {
                    $this->error("❌ Failed to execute reaction");
                }

            } catch (\Exception $e) {
                $this->error("❌ Error executing reaction: {$e->getMessage()}");
                Log::error("Failed to execute reaction", [
                    'area_id' => $area->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    private function buildMessage(array $config, array $data): string
    {
        // Use 'text' field if available (new format), otherwise fall back to 'message_template' (old format)
        $template = $config['text'] ?? $config['message_template'] ?? "🎥 New video liked!\n{title}\n{url}";

        // Replace placeholders with actual data
        foreach ($data as $key => $value) {
            if (is_string($value) || is_numeric($value)) {
                $template = str_replace("{{$key}}", $value, $template);
            }
        }

        return $template;
    }

    private function replacePlaceholders(string $template, array $data): string
    {
        // Replace placeholders with actual data
        foreach ($data as $key => $value) {
            if (is_string($value) || is_numeric($value)) {
                $template = str_replace("{{$key}}", $value, $template);
            }
        }

        return $template;
    }

    private function getActionDisplayName(string $serviceName, string $actionType): string
    {
        // Map of action types to human-readable names
        $actionNames = [
            'YouTube' => [
                'video_liked' => 'YouTube Video Liked',
                'new_video_uploaded' => 'New YouTube Video',
            ],
            'Gmail' => [
                'new_email' => 'New Email',
                'email_from_sender' => 'Email from Specific Sender',
            ],
            'Telegram' => [
                'message_contains_keyword' => 'Telegram Message with Keyword',
                'new_message' => 'New Telegram Message',
            ],
            'Twitch' => [
                'stream_started' => 'Twitch Stream Started',
                'new_follower' => 'New Twitch Follower',
                'stream_title_changed' => 'Twitch Stream Title Changed',
            ],
            'Discord' => [
                'new_message' => 'New Discord Message',
                'message_with_keyword' => 'Discord Message with Keyword',
            ],
            'Steam' => [
                'game_time_milestone' => 'Steam Game Time Milestone',
                'new_game_purchased' => 'New Steam Game Purchased',
            ]
        ];

        return $actionNames[$serviceName][$actionType] ?? "$serviceName - $actionType";
    }
}
