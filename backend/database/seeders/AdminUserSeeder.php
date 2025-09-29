<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create default admin user
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@area.com'],
            [
                'name' => 'AREA Admin',
                'password' => Hash::make('admin123'),
                'role' => User::ROLE_ADMIN,
                'role_assigned_at' => now(),
            ]
        );

        if ($adminUser->wasRecentlyCreated) {
            $this->command->info('✅ Default admin user created successfully');
            $this->command->info('📧 Email: admin@area.com');
            $this->command->info('🔑 Password: admin123');
            $this->command->warn('⚠️  Please change the default password after first login!');
        } else {
            $this->command->info('ℹ️  Admin user already exists');
        }

        // Create some demo regular users
        $demoUsers = [
            [
                'name' => 'Demo User 1',
                'email' => 'user1@area.com',
                'password' => Hash::make('user123'),
                'role' => User::ROLE_USER,
            ],
            [
                'name' => 'Demo User 2',
                'email' => 'user2@area.com',
                'password' => Hash::make('user123'),
                'role' => User::ROLE_USER,
            ]
        ];

        foreach ($demoUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );

            if ($user->wasRecentlyCreated) {
                $this->command->info("✅ Demo user created: {$userData['email']}");
            }
        }

        $this->command->info('🎉 User seeding completed!');
    }
}
