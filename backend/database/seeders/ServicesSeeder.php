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
                'name' => 'Facebook',
                'description' => 'Social media platform for connecting with friends and family.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Twitter',
                'description' => 'Microblogging platform for sharing short messages and updates.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Instagram',
                'description' => 'Photo and video sharing social networking service.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'LinkedIn',
                'description' => 'Professional networking platform for career development and job searching.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'GitHub',
                'description' => 'Platform for version control and collaborative software development.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Spotify',
                'description' => 'Music streaming service with a vast library of songs and podcasts.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'YouTube',
                'description' => 'Video sharing platform for uploading, sharing, and viewing videos.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Pinterest',
                'description' => 'Image sharing and social media service for discovering and saving ideas.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Mail',
                'description' => 'Email service for sending and receiving electronic messages.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Steam',
                'description' => 'Digital distribution platform for video games and software.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Twitch',
                'description' => 'Live streaming platform primarily focused on video game streaming.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Discord',
                'description' => 'Communication platform for creating communities and chatting via text, voice, and video.',
                'status' => 'inactive',
                'auth_type' => 'oauth2',
            ],
            [
                'name' => 'Telegram',
                'description' => 'Cloud-based instant messaging app with a focus on speed and security.',
                'status' => 'inactive',
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
