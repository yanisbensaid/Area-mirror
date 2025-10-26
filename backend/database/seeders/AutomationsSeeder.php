<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Service;
use App\Models\Action;
use App\Models\Reaction;
use App\Models\Automation;

class AutomationsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = Service::all();
        $actions = Action::all();
        $reactions = Reaction::all();

        $automations = [
            // Facebook automations
            [
                'name' => 'Facebook to Twitter Cross-Post',
                'description' => 'Automatically tweet when you post on Facebook',
                'trigger_service' => 'Facebook',
                'action_service' => 'Twitter', 
                'action' => 'New Post by You',
                'reaction' => 'Post Tweet',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Social Media',
                'tags' => json_encode(['social', 'cross-posting']),
                'popularity' => 85,
            ],
            [
                'name' => 'Facebook Photo to Instagram',
                'description' => 'Share your Facebook photos on Instagram automatically',
                'trigger_service' => 'Facebook',
                'action_service' => 'Instagram',
                'action' => 'New Photo Upload',
                'reaction' => 'Post Photo',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Social Media',
                'tags' => json_encode(['photos', 'social']),
                'popularity' => 78,
            ],
            
            // Twitter automations
            [
                'name' => 'Tweet to LinkedIn Post',
                'description' => 'Share your tweets as LinkedIn posts automatically',
                'trigger_service' => 'Twitter',
                'action_service' => 'LinkedIn',
                'action' => 'New Tweet by You',
                'reaction' => 'Create Post',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Professional',
                'tags' => json_encode(['professional', 'social']),
                'popularity' => 72,
            ],
            [
                'name' => 'New Follower Email Alert',
                'description' => 'Get email notification when you gain a new Twitter follower',
                'trigger_service' => 'Twitter',
                'action_service' => 'Mail',
                'action' => 'New Follower',
                'reaction' => 'Send Email',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Notifications',
                'tags' => json_encode(['notifications', 'email']),
                'popularity' => 65,
            ],
            
            // Instagram automations
            [
                'name' => 'Instagram to Pinterest',
                'description' => 'Create Pinterest pins from your Instagram photos',
                'trigger_service' => 'Instagram',
                'action_service' => 'Pinterest',
                'action' => 'New Photo Post by You',
                'reaction' => 'Create Pin',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Social Media',
                'tags' => json_encode(['photos', 'pinterest']),
                'popularity' => 68,
            ],
            [
                'name' => 'Instagram Comment Discord Alert',
                'description' => 'Get Discord notification when someone comments on your Instagram post',
                'trigger_service' => 'Instagram',
                'action_service' => 'Discord',
                'action' => 'New Comment on Your Post',
                'reaction' => 'Send Message',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Notifications',
                'tags' => json_encode(['notifications', 'discord']),
                'popularity' => 55,
            ],
            
            // LinkedIn automations
            [
                'name' => 'LinkedIn to Facebook Share',
                'description' => 'Share your LinkedIn posts on Facebook automatically',
                'trigger_service' => 'LinkedIn',
                'action_service' => 'Facebook',
                'action' => 'New Post by You',
                'reaction' => 'Create Post',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Professional',
                'tags' => json_encode(['professional', 'social']),
                'popularity' => 61,
            ],
            [
                'name' => 'New Connection Telegram Alert',
                'description' => 'Get Telegram notification when you make a new LinkedIn connection',
                'trigger_service' => 'LinkedIn',
                'action_service' => 'Telegram',
                'action' => 'New Connection',
                'reaction' => 'Send Message',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Networking',
                'tags' => json_encode(['networking', 'notifications']),
                'popularity' => 42,
            ],
            
            // GitHub automations
            [
                'name' => 'GitHub Issue to Discord',
                'description' => 'Send Discord message when new issue is created in your repository',
                'trigger_service' => 'GitHub',
                'action_service' => 'Discord',
                'action' => 'New Issue in Your Repository',
                'reaction' => 'Send Message',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Development',
                'tags' => json_encode(['development', 'github', 'notifications']),
                'popularity' => 88,
            ],
            [
                'name' => 'New Repo Tweet Announcement',
                'description' => 'Tweet about your new GitHub repositories',
                'trigger_service' => 'GitHub',
                'action_service' => 'Twitter',
                'action' => 'New Repository by You',
                'reaction' => 'Post Tweet',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Development',
                'tags' => json_encode(['development', 'github', 'social']),
                'popularity' => 75,
            ],
            
            // Spotify automations
            [
                'name' => 'New Playlist to Facebook',
                'description' => 'Share your new Spotify playlists on Facebook',
                'trigger_service' => 'Spotify',
                'action_service' => 'Facebook',
                'action' => 'New Playlist by You',
                'reaction' => 'Create Post',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Music',
                'tags' => json_encode(['music', 'social']),
                'popularity' => 58,
            ],
            [
                'name' => 'Spotify Follower Email',
                'description' => 'Get email notification when you gain a new Spotify follower',
                'trigger_service' => 'Spotify',
                'action_service' => 'Mail',
                'action' => 'New Follower',
                'reaction' => 'Send Email',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Music',
                'tags' => json_encode(['music', 'notifications']),
                'popularity' => 35,
            ],
            
            // YouTube automations
            [
                'name' => 'YouTube Video to Twitter',
                'description' => 'Tweet about your new YouTube video uploads',
                'trigger_service' => 'YouTube',
                'action_service' => 'Twitter',
                'action' => 'New Video Upload by You',
                'reaction' => 'Post Tweet',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Content Creation',
                'tags' => json_encode(['youtube', 'social', 'content']),
                'popularity' => 92,
            ],
            [
                'name' => 'YouTube Comment Discord Alert',
                'description' => 'Get Discord notification when someone comments on your YouTube video',
                'trigger_service' => 'YouTube',
                'action_service' => 'Discord',
                'action' => 'New Comment on Your Video',
                'reaction' => 'Send Message',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Content Creation',
                'tags' => json_encode(['youtube', 'notifications']),
                'popularity' => 67,
            ],
            
            // Pinterest automations
            [
                'name' => 'Pinterest Pin to Instagram',
                'description' => 'Share your Pinterest pins as Instagram posts',
                'trigger_service' => 'Pinterest',
                'action_service' => 'Instagram',
                'action' => 'New Pin by You',
                'reaction' => 'Post Photo',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Social Media',
                'tags' => json_encode(['pinterest', 'instagram', 'photos']),
                'popularity' => 53,
            ],
            [
                'name' => 'Pinterest Follower Email',
                'description' => 'Get email notification when you gain a new Pinterest follower',
                'trigger_service' => 'Pinterest',
                'action_service' => 'Mail',
                'action' => 'New Follower',
                'reaction' => 'Send Email',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Social Media',
                'tags' => json_encode(['pinterest', 'notifications']),
                'popularity' => 28,
            ],
            
            // Mail automations
            [
                'name' => 'Important Email to Discord',
                'description' => 'Send Discord message when you receive email from specific sender',
                'trigger_service' => 'Mail',
                'action_service' => 'Discord',
                'action' => 'New Email from Specific Sender',
                'reaction' => 'Send Message',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Productivity',
                'tags' => json_encode(['email', 'notifications', 'productivity']),
                'popularity' => 73,
            ],
            [
                'name' => 'Email Backup to Telegram',
                'description' => 'Forward important emails to Telegram for backup',
                'trigger_service' => 'Mail',
                'action_service' => 'Telegram',
                'action' => 'New Email Received',
                'reaction' => 'Send Message',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Productivity',
                'tags' => json_encode(['email', 'backup', 'telegram']),
                'popularity' => 45,
            ],
            
            // Steam automations
            [
                'name' => 'Steam Game Purchase Tweet',
                'description' => 'Tweet about your new Steam game purchases',
                'trigger_service' => 'Steam',
                'action_service' => 'Twitter',
                'action' => 'New Game Purchase by You',
                'reaction' => 'Post Tweet',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Gaming',
                'tags' => json_encode(['gaming', 'steam', 'social']),
                'popularity' => 62,
            ],
            [
                'name' => 'Steam Friend Request Discord',
                'description' => 'Get Discord notification for new Steam friend requests',
                'trigger_service' => 'Steam',
                'action_service' => 'Discord',
                'action' => 'New Friend Request',
                'reaction' => 'Send Message',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Gaming',
                'tags' => json_encode(['gaming', 'steam', 'notifications']),
                'popularity' => 41,
            ],
            
            // Twitch automations
            [
                'name' => 'Twitch Stream to Twitter',
                'description' => 'Tweet when you start streaming on Twitch',
                'trigger_service' => 'Twitch',
                'action_service' => 'Twitter',
                'action' => 'New Stream by You',
                'reaction' => 'Post Tweet',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Streaming',
                'tags' => json_encode(['streaming', 'twitch', 'social']),
                'popularity' => 89,
            ],
            [
                'name' => 'Twitch Follower Email',
                'description' => 'Get email notification when you gain a new Twitch follower',
                'trigger_service' => 'Twitch',
                'action_service' => 'Mail',
                'action' => 'New Follower',
                'reaction' => 'Send Email',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Streaming',
                'tags' => json_encode(['streaming', 'twitch', 'notifications']),
                'popularity' => 57,
            ],
            
            // Discord automations
            [
                'name' => 'Discord New Member to Telegram',
                'description' => 'Send Telegram message when new member joins your Discord server',
                'trigger_service' => 'Discord',
                'action_service' => 'Telegram',
                'action' => 'New Member Joined Server',
                'reaction' => 'Send Message',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Community',
                'tags' => json_encode(['discord', 'community', 'notifications']),
                'popularity' => 48,
            ],
            [
                'name' => 'Discord Messages to Email',
                'description' => 'Forward important Discord messages to email',
                'trigger_service' => 'Discord',
                'action_service' => 'Mail',
                'action' => 'New Message in Specific Channel',
                'reaction' => 'Send Email',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Community',
                'tags' => json_encode(['discord', 'email', 'notifications']),
                'popularity' => 39,
            ],
            
            // Telegram automations
            [
                'name' => 'Telegram Group Member to Discord',
                'description' => 'Send Discord message when new member joins your Telegram group',
                'trigger_service' => 'Telegram',
                'action_service' => 'Discord',
                'action' => 'New Member Joined Group',
                'reaction' => 'Send Message',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Community',
                'tags' => json_encode(['telegram', 'discord', 'community']),
                'popularity' => 36,
            ],
            [
                'name' => 'Telegram Messages to Email',
                'description' => 'Forward important Telegram messages to email',
                'trigger_service' => 'Telegram',
                'action_service' => 'Mail',
                'action' => 'New Message in Specific Chat',
                'reaction' => 'Send Email',
                'user_id' => 1,
                'is_active' => true,
                'category' => 'Communication',
                'tags' => json_encode(['telegram', 'email', 'backup']),
                'popularity' => 33,
            ],
        ];

        foreach ($automations as $automationData) {
            $triggerService = $services->firstWhere('name', $automationData['trigger_service']);
            $actionService = $services->firstWhere('name', $automationData['action_service']);
            $action = $actions->where('service_id', $triggerService->id ?? 0)
                            ->firstWhere('name', $automationData['action']);
            $reaction = $reactions->where('service_id', $actionService->id ?? 0)
                              ->firstWhere('name', $automationData['reaction']);
                              
            if ($triggerService && $actionService && $action && $reaction) {
                Automation::firstOrCreate(
                    [
                        'name' => $automationData['name'],
                        'user_id' => $automationData['user_id']
                    ],
                    [
                        'description' => $automationData['description'],
                        'trigger_service_id' => $triggerService->id,
                        'action_service_id' => $actionService->id,
                        'action_id' => $action->id,
                        'reaction_id' => $reaction->id,
                        'is_active' => $automationData['is_active'],
                        'category' => $automationData['category'],
                        'tags' => $automationData['tags'],
                        'popularity' => $automationData['popularity'],
                    ]
                );
            }
        }
    }
}
