<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Services\IconService;

class ServicesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'YouTube',
                'description' => 'Video sharing platform for uploading, sharing, and viewing videos.',
                'status' => 'active',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Twitch',
                'description' => 'Live streaming platform primarily focused on video game streaming.',
                'status' => 'active',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Gmail',
                'description' => 'Email service for sending and receiving electronic messages.',
                'status' => 'active',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Telegram',
                'description' => 'Cloud-based instant messaging app with a focus on speed and security.',
                'status' => 'active',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Steam',
                'description' => 'Digital distribution platform for video games and software.',
                'status' => 'active',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Discord',
                'description' => 'Communication platform for creating communities and chatting via text, voice, and video.',
                'status' => 'active',
                'auth_type' => 'oauth2',
            ],
        ];

        foreach ($services as $serviceData) {
            Service::firstOrCreate(
                ['name' => $serviceData['name']],
                [
                    'description' => $serviceData['description'],
                    'status' => $serviceData['status'],
                    'auth_type' => $serviceData['auth_type'],
                    'icon_url' => IconService::findIconForService($serviceData['name'])
                ]
            );
        }
    }
}
