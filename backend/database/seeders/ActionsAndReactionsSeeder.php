<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Action;
use App\Models\Reaction;
use App\Services\ServiceManager;

class ActionsAndReactionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $serviceManager = app(ServiceManager::class);

        // Clear existing data
        Action::truncate();
        Reaction::truncate();

        // Get all registered services
        $services = ['YouTube', 'Twitch', 'Gmail', 'Telegram', 'Steam', 'Discord'];

        foreach ($services as $serviceName) {
            try {
                $service = $serviceManager->get($serviceName);

                if (!$service) {
                    $this->command->warn("Service {$serviceName} not found");
                    continue;
                }

                // Seed actions
                $availableActions = $service->getAvailableActions();
                foreach ($availableActions as $actionKey => $actionData) {
                    Action::create([
                        'service_name' => $serviceName,
                        'action_key' => $actionKey,
                        'name' => $actionData['name'],
                        'description' => $actionData['description'],
                        'parameters' => $actionData['params'] ?? [],
                        'active' => true,
                    ]);

                    $this->command->info("✓ Created action: {$serviceName}.{$actionKey}");
                }

                // Seed reactions
                $availableReactions = $service->getAvailableReactions();
                foreach ($availableReactions as $reactionKey => $reactionData) {
                    Reaction::create([
                        'service_name' => $serviceName,
                        'reaction_key' => $reactionKey,
                        'name' => $reactionData['name'],
                        'description' => $reactionData['description'],
                        'parameters' => $reactionData['params'] ?? [],
                        'active' => true,
                    ]);

                    $this->command->info("✓ Created reaction: {$serviceName}.{$reactionKey}");
                }

            } catch (\Exception $e) {
                $this->command->error("Failed to seed {$serviceName}: {$e->getMessage()}");
            }
        }

        $this->command->info("\n✅ Seeding completed!");
        $this->command->info("Total actions: " . Action::count());
        $this->command->info("Total reactions: " . Reaction::count());
    }
}
