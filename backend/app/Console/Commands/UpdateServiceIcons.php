<?php

namespace App\Console\Commands;

use App\Models\Services;
use App\Services\IconService;
use Illuminate\Console\Command;

class UpdateServiceIcons extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'services:update-icons {--force : Force update even if icon_url already exists}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically fetch and update icons for services that don\'t have them';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $force = $this->option('force');
        
        $query = Services::query();
        if (!$force) {
            $query->where(function($q) {
                $q->whereNull('icon_url')->orWhere('icon_url', '');
            });
        }
        
        $services = $query->get();
        
        if ($services->isEmpty()) {
            $this->info('No services need icon updates.');
            return;
        }
        
        $this->info("Found {$services->count()} services to update...");
        
        $updated = 0;
        $failed = 0;
        
        foreach ($services as $service) {
            $this->line("Processing: {$service->name}...");
            
            $iconUrl = IconService::findIconForService($service->name);
            
            if ($iconUrl) {
                $service->update(['icon_url' => $iconUrl]);
                $this->info("  ✓ Updated {$service->name} with icon: {$iconUrl}");
                $updated++;
            } else {
                $this->warn("  ✗ No icon found for {$service->name}");
                $failed++;
            }
            
            // Small delay to be respectful to APIs
            usleep(500000); // 0.5 seconds
        }
        
        $this->newLine();
        $this->info("Summary:");
        $this->info("  Updated: {$updated}");
        $this->warn("  Failed: {$failed}");
        $this->info("  Total: " . ($updated + $failed));
    }
}
