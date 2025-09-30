<?php

namespace App\Providers;

use App\Services\ServiceManager;
use App\Services\Implementations\TelegramService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register the ServiceManager as a singleton
        $this->app->singleton(ServiceManager::class, function ($app) {
            $manager = new ServiceManager();

            // Register all available services
            $manager->register(new TelegramService());

            // Future services can be registered here:
            // $manager->register(new GmailService());
            // $manager->register(new GitHubService());
            // $manager->register(new SpotifyService());
            // etc.

            return $manager;
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
