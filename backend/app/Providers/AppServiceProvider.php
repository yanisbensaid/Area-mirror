<?php

namespace App\Providers;

use App\Services\ServiceManager;
use App\Services\Implementations\TelegramService;
use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Facades\Socialite;
use SocialiteProviders\Manager\SocialiteWasCalled;

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
            $manager->register(new \App\Services\Implementations\YouTubeService());
            $manager->register(new \App\Services\Implementations\TwitchService());

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
        // Configure Socialite Google provider
        $this->app['events']->listen(
            SocialiteWasCalled::class,
            'SocialiteProviders\\Google\\GoogleExtendSocialite@handle'
        );
    }
}
