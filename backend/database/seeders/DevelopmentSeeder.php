<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DevelopmentSeeder extends Seeder
{
    /**
     * Seed the application's database for development.
     */
    public function run(): void
    {
        $this->command->info('🌱 Seeding development data...');
        $this->command->newLine();

        // Create test users
        $testUser = User::firstOrCreate(
            ['email' => 'test@area.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => User::ROLE_USER
            ]
        );

        $adminUser = User::firstOrCreate(
            ['email' => 'admin@area.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'role' => User::ROLE_ADMIN
            ]
        );

        $this->command->info('✅ Users created successfully');
        $this->command->info('   📧 Test user: test@area.com / password');
        $this->command->info('   📧 Admin user: admin@area.com / password');
        $this->command->newLine();

        $this->command->info('🎉 Development data seeded successfully!');
    }
}
