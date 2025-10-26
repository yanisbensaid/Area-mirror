<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Team members with admin roles
        $teamMembers = [
            [
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'password' => bcrypt('adminadmin'),
                'role' => User::ROLE_ADMIN,
            ],
            [
                'name' => 'Ethan',
                'email' => 'ethan@gmail.com',
                'password' => bcrypt('Ethan@123!'),
                'role' => User::ROLE_ADMIN,
            ],
            [
                'name' => 'Louis',
                'email' => 'louis@gmail.com',
                'password' => bcrypt('Louis@123!'),
                'role' => User::ROLE_ADMIN,
            ],
            [
                'name' => 'Marius',
                'email' => 'marius@gmail.com',
                'password' => bcrypt('Marius@123!'),
                'role' => User::ROLE_ADMIN,
            ],
            [
                'name' => 'Thea',
                'email' => 'thea@gmail.com',
                'password' => bcrypt('Thea@123!'),
                'role' => User::ROLE_ADMIN,
            ],
            [
                'name' => 'Yanis',
                'email' => 'yanis@gmail.com',
                'password' => bcrypt('Yanis@123!'),
                'role' => User::ROLE_ADMIN,
            ],
        ];

        $demoUsers = [
            [
                'name' => 'Demo User 1',
                'email' => 'user1@area.com',
                'password' => bcrypt('user123'),
                'role' => User::ROLE_USER,
            ],
            [
                'name' => 'Demo User 2',
                'email' => 'user2@area.com',
                'password' => bcrypt('user123'),
                'role' => User::ROLE_USER,
            ]
        ];

        foreach ($teamMembers as $member) {
            $user = User::firstOrCreate(
                ['email' => $member['email']],
                [
                    'name' => $member['name'],
                    'password' => $member['password'],
                    'role' => $member['role'],
                    'role_assigned_at' => now(),
                ]
            );

            if ($user->wasRecentlyCreated) {
                $this->command->info("✅ Admin user created: {$member['name']} ({$member['email']})");
            } else {
                // Update existing user to admin role if not already
                if (!$user->isAdmin()) {
                    $user->makeAdmin();
                    $this->command->info("🔄 Updated {$member['name']} to admin role");
                } else {
                    $this->command->info("ℹ️  {$member['name']} is already an admin");
                }
            }
        }

        foreach ($demoUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            if ($user->wasRecentlyCreated) {
                $this->command->info("✅ Demo user created: {$userData['email']}");
            }
        }

        $this->command->info('🎉 Team seeding completed! All team members have admin access.');
    }
}
