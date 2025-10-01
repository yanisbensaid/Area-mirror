<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\Reaction;

class ReactionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = Service::all();

        $reactions = [
            'Facebook' => [
                [
                    'name' => 'Create Post',
                    'description' => 'Creates a new post on your timeline.',
                    'action_type' => 'post.create',
                ],
                [
                    'name' => 'Upload Photo',
                    'description' => 'Uploads a new photo to your profile or album.',
                    'action_type' => 'photo.upload',
                ],
            ],
            'Twitter' => [
                [
                    'name' => 'Post Tweet',
                    'description' => 'Posts a new tweet to your timeline.',
                    'action_type' => 'tweet.post',
                ],
                [
                    'name' => 'Send Direct Message',
                    'description' => 'Sends a direct message to a specified user.',
                    'action_type' => 'dm.send',
                ],
            ],
            'Instagram' => [
                [
                    'name' => 'Post Photo',
                    'description' => 'Posts a new photo to your profile.',
                    'action_type' => 'photo.post',
                ],
                [
                    'name' => 'Like Photo',
                    'description' => 'Likes a specified photo on Instagram.',
                    'action_type' => 'photo.like',
                ],
            ],
            'LinkedIn' => [
                [
                    'name' => 'Create Post',
                    'description' => 'Creates a new post on your LinkedIn feed.',
                    'action_type' => 'post.create',
                ],
                [
                    'name' => 'Send Connection Request',
                    'description' => 'Sends a connection request to a specified user.',
                    'action_type' => 'connection.request',
                ],
            ],
            'GitHub' => [
                [
                    'name' => 'Create Issue',
                    'description' => 'Creates a new issue in a specified repository.',
                    'action_type' => 'issue.create',
                ],
                [
                    'name' => 'Create Pull Request',
                    'description' => 'Creates a new pull request in a specified repository.',
                    'action_type' => 'pr.create',
                ],
            ],
            'Spotify' => [
                [
                    'name' => 'Add Track to Playlist',
                    'description' => 'Adds a specified track to one of your playlists.',
                    'action_type' => 'playlist.add_track',
                ],
                [
                    'name' => 'Follow Artist',
                    'description' => 'Follows a specified artist on Spotify.',
                    'action_type' => 'artist.follow',
                ],
            ],
            'YouTube' => [
                [
                    'name' => 'Upload Video',
                    'description' => 'Uploads a new video to your YouTube channel.',
                    'action_type' => 'video.upload',
                ],
                [
                    'name' => 'Create Playlist',
                    'description' => 'Creates a new playlist on your YouTube channel.',
                    'action_type' => 'playlist.create',
                ],
            ],
            'Pinterest' => [
                [
                    'name' => 'Create Pin',
                    'description' => 'Creates a new pin on one of your boards.',
                    'action_type' => 'pin.create',
                ],
                [
                    'name' => 'Follow Board',
                    'description' => 'Follows a specified board on Pinterest.',
                    'action_type' => 'board.follow',
                ],
            ],
            'Mail' => [
                [
                    'name' => 'Send Email',
                    'description' => 'Sends an email to a specified address.',
                    'action_type' => 'email.send',
                ],
                [
                    'name' => 'Create Draft',
                    'description' => 'Creates a draft email in your mailbox.',
                    'action_type' => 'email.draft',
                ],
            ],
            'Steam' => [
                [
                    'name' => 'Add Friend',
                    'description' => 'Sends a friend request to a specified user.',
                    'action_type' => 'friend.add',
                ],
                [
                    'name' => 'Post in Group',
                    'description' => 'Posts a message in a specified Steam group.',
                    'action_type' => 'group.post',
                ],
            ],
            'Twitch' => [
                [
                    'name' => 'Start Stream',
                    'description' => 'Starts a new live stream on your Twitch channel.',
                    'action_type' => 'stream.start',
                ],
                [
                    'name' => 'Send Message in Chat',
                    'description' => 'Sends a message in your channel\'s chat.',
                    'action_type' => 'chat.message',
                ],
            ],
            'Discord' => [
                [
                    'name' => 'Send Message',
                    'description' => 'Sends a message to a specified channel.',
                    'action_type' => 'message.send',
                ],
                [
                    'name' => 'Create Channel',
                    'description' => 'Creates a new channel in your server.',
                    'action_type' => 'channel.create',
                ],
            ],
            'Telegram' => [
                [
                    'name' => 'Send Message',
                    'description' => 'Sends a message to a specified chat or user.',
                    'action_type' => 'message.send',
                ],
                [
                    'name' => 'Send Photo',
                    'description' => 'Sends a photo to a specified chat or user.',
                    'action_type' => 'photo.send',
                ],
            ],
        ];

        foreach ($services as $service) {
            if (isset($reactions[$service->name])) {
                foreach ($reactions[$service->name] as $reactionData) {
                    Reaction::firstOrCreate(
                        [
                            'name' => $reactionData['name'],
                            'service_id' => $service->id,
                        ],
                        [
                            'description' => $reactionData['description'],
                            'action_type' => $reactionData['action_type'],
                        ]
                    );
                }
            }
        }
    }
}