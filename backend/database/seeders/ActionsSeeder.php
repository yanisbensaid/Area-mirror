<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\Action;

class ActionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = Service::all();

        $actions = [
            'Facebook' => [
                [
                    'name' => 'New Post by You',
                    'description' => 'Triggers when you create a new post on your timeline.',
                    'trigger_type' => 'post.created',
                ],
                [
                    'name' => 'New Photo Upload',
                    'description' => 'Triggers when you upload a new photo to your profile or album.',
                    'trigger_type' => 'photo.uploaded',
                ],
            ],
            'Twitter' => [
                [
                    'name' => 'New Tweet by You',
                    'description' => 'Triggers when you post a new tweet.',
                    'trigger_type' => 'tweet.created',
                ],
                [
                    'name' => 'New Follower',
                    'description' => 'Triggers when you gain a new follower.',
                    'trigger_type' => 'follower.gained',
                ],
            ],
            'Instagram' => [
                [
                    'name' => 'New Photo Post by You',
                    'description' => 'Triggers when you post a new photo on your profile.',
                    'trigger_type' => 'photo.posted',
                ],
                [
                    'name' => 'New Comment on Your Post',
                    'description' => 'Triggers when someone comments on your photo post.',
                    'trigger_type' => 'photo.commented',
                ],
            ],
            'LinkedIn' => [
                [
                    'name' => 'New Post by You',
                    'description' => 'Triggers when you create a new post on your LinkedIn feed.',
                    'trigger_type' => 'post.created',
                ],
                [
                    'name' => 'New Connection',
                    'description' => 'Triggers when you connect with a new professional.',
                    'trigger_type' => 'connection.created',
                ],
            ],
            'GitHub' => [
                [
                    'name' => 'New Repository by You',
                    'description' => 'Triggers when you create a new repository.',
                    'trigger_type' => 'repository.created',
                ],
                [
                    'name' => 'New Issue in Your Repository',
                    'description' => 'Triggers when a new issue is opened in one of your repositories.',
                    'trigger_type' => 'issue.created',
                ],
            ],
            'Spotify' => [
                [
                    'name' => 'New Playlist by You',
                    'description' => 'Triggers when you create a new playlist.',
                    'trigger_type' => 'playlist.created',
                ],
                [
                    'name' => 'New Follower',
                    'description' => 'Triggers when you gain a new follower on Spotify.',
                    'trigger_type' => 'follower.gained',
                ],
            ],
            'YouTube' => [
                [
                    'name' => 'New Video Upload by You',
                    'description' => 'Triggers when you upload a new video to your channel.',
                    'trigger_type' => 'video.uploaded',
                ],
                [
                    'name' => 'New Comment on Your Video',
                    'description' => 'Triggers when someone comments on your video.',
                    'trigger_type' => 'video.commented',
                ],
            ],
            'Pinterest' => [
                [
                    'name' => 'New Pin by You',
                    'description' => 'Triggers when you create a new pin on your board.',
                    'trigger_type' => 'pin.created',
                ],
                [
                    'name' => 'New Follower',
                    'description' => 'Triggers when you gain a new follower on Pinterest.',
                    'trigger_type' => 'follower.gained',
                ],
            ],
            'Mail' => [
                [
                    'name' => 'New Email Received',
                    'description' => 'Triggers when you receive a new email in your inbox.',
                    'trigger_type' => 'email.received',
                ],
                [
                    'name' => 'New Email from Specific Sender',
                    'description' => 'Triggers when you receive a new email from a specific sender.',
                    'trigger_type' => 'email.from_specific_sender',
                ],
            ],
            'Steam' => [
                [
                    'name' => 'New Game Purchase by You',
                    'description' => 'Triggers when you purchase a new game on Steam.',
                    'trigger_type' => 'game.purchased',
                ],
                [
                    'name' => 'New Friend Request',
                    'description' => 'Triggers when you receive a new friend request.',
                    'trigger_type' => 'friend.requested',
                ],
            ],
            'Twitch' => [
                [
                    'name' => 'New Stream by You',
                    'description' => 'Triggers when you start a new stream.',
                    'trigger_type' => 'stream.started',
                ],
                [
                    'name' => 'New Follower',
                    'description' => 'Triggers when you gain a new follower on Twitch.',
                    'trigger_type' => 'follower.gained',
                ],
            ],
            'Discord' => [
                [
                    'name' => 'New Message in Specific Channel',
                    'description' => 'Triggers when a new message is posted in a specific channel.',
                    'trigger_type' => 'message.posted',
                ],
                [
                    'name' => 'New Member Joined Server',
                    'description' => 'Triggers when a new member joins your Discord server.',
                    'trigger_type' => 'member.joined',
                ],
            ],
            'Telegram' => [
                [
                    'name' => 'New Message in Specific Chat',
                    'description' => 'Triggers when a new message is received in a specific chat.',
                    'trigger_type' => 'message.received',
                ],
                [
                    'name' => 'New Member Joined Group',
                    'description' => 'Triggers when a new member joins your Telegram group.',
                    'trigger_type' => 'member.joined',
                ],
            ],
        ];

        foreach ($services as $service) {
            if (isset($actions[$service->name])) {
                foreach ($actions[$service->name] as $actionData) {
                    Action::firstOrCreate(
                        [
                            'name' => $actionData['name'],
                            'service_id' => $service->id,
                        ],
                        [
                            'description' => $actionData['description'],
                            'trigger_type' => $actionData['trigger_type'],
                        ]
                    );
                }
            }
        }
    }
}
