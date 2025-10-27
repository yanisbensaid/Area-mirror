<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Laravel\Socialite\Contracts\Factory;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        // ...existing events...
    ];

    public function boot(): void
    {
        $socialite = $this->app->make(Factory::class);
        
        $socialite->extend('microsoft', function ($app) use ($socialite) {
            $config = $app['config']['services.microsoft'];
            return $socialite->buildProvider(
                \SocialiteProviders\Microsoft\Provider::class,
                $config
            );
        });

        $socialite->extend('google', function ($app) use ($socialite) {
            $config = $app['config']['services.google'];
            return $socialite->buildProvider(
                \SocialiteProviders\Google\Provider::class,
                $config
            );
        });

        $socialite->extend('github', function ($app) use ($socialite) {
            $config = $app['config']['services.github'];
            return $socialite->buildProvider(
                \SocialiteProviders\GitHub\Provider::class,
                $config
            );
        });
    }
}