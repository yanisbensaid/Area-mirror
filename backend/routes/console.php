<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule AREA checks every minute
Schedule::command('areas:check')
    ->cron('* * * * *')
    ->withoutOverlapping()
    ->runInBackground()
    ->appendOutputTo('/dev/stdout');
