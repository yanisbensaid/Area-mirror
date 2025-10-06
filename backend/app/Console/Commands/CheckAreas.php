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

            if ($area->action_service === 'YouTube') {
                $oauthController = app(\App\Http\Controllers\OAuthController::class);
                if (!$oauthController->refreshYouTubeToken($actionToken)) {
                    $this->error("❌ Failed to refresh token");
                    return false;
                }
                $actionToken->refresh(); // Reload from database
            }
        }

        // Authenticate action service
        $actionService->authenticate([
            'access_token' => $actionToken->getDecryptedAccessToken()
        ]);

        // Execute action (check for trigger)
        $this->info("🔍 Checking action: {$area->action_service}.{$area->action_type}");

        $results = $actionService->executeAction($area->action_type, [
            'last_video_ids' => $area->getLastCheckedVideoIds()
        ]);

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

        // Check for state update marker (no new videos but state exists)
        $isStateUpdate = isset($results['_current_state']);

        if ($isStateUpdate) {
            // Update state with current video IDs
            $currentState = $results['_current_state'];
            $area->updateLastCheckedVideoIds(array_slice($currentState, -50));
            $area->save();
            $this->info("ℹ️  No new triggers for AREA {$area->id} - state updated");
            Log::info('State updated', ['video_ids' => $currentState]);
            return false;
        }

        if ($isInitialization) {
            // First run - store IDs but don't trigger notifications
            $videoIds = array_column($results, 'video_id');
            $area->updateLastCheckedVideoIds(array_slice($videoIds, -50));
            $area->save();
            $this->info("✨ AREA {$area->id} initialized with " . count($videoIds) . " existing video(s)");
            Log::info('AREA initialized', ['area_id' => $area->id, 'video_count' => count($videoIds)]);
            return false;
        }

        // Check for duplicates before processing
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
        // Keep only last 50 video IDs to prevent unlimited growth
        $area->updateLastCheckedVideoIds(array_slice($allVideoIds, -50));

        // Execute reactions with deduplicated results
        $this->info("🎯 Found " . count($newResults) . " new trigger(s), executing reactions...");
        $this->executeReactions($area, array_values($newResults), $serviceManager);

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

        // Authenticate reaction service
        $reactionService->authenticate([
            'bot_token' => $reactionToken->getDecryptedAccessToken()
        ]);

        // Get chat_id for Telegram
        $chatId = $reactionToken->getChatId();
        if (!$chatId) {
            $this->warn("⚠️  No chat_id found. User needs to send /start to bot");
            return;
        }

        // Execute reaction for each trigger result
        foreach ($triggerResults as $result) {
            try {
                $message = $this->buildMessage($area->reaction_config, $result);

                $this->info("📤 Sending message to Telegram...");

                $success = $reactionService->executeReaction($area->reaction_type, [
                    'chat_id' => $chatId,
                    'text' => $message
                ]);

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
        $template = $config['message_template'] ?? "🎥 New video liked!\n{title}\n{url}";

        // Replace placeholders with actual data
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $template = str_replace("{{$key}}", $value, $template);
            }
        }

        return $template;
    }
}
