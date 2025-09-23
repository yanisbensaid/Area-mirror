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
        User::create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => bcrypt('adminadmin'),
        ]);

        User::create([
            'name' => 'Ethan',
            'email' => 'ethan@gmail.com',
            'password' => bcrypt('Ethan@123!'),
        ]);

        User::create([
            'name' => 'Louis',
            'email' => 'louis@gmail.com',
            'password' => bcrypt('Louis@123!'),
        ]);

        User::create([
            'name' => 'Marius',
            'email' => 'marius@gmail.com',
            'password' => bcrypt('Marius@123!'),
        ]);

        User::create([
            'name' => 'Thea',
            'email' => 'thea@gmail.com',
            'password' => bcrypt('Thea@123!'),
        ]);

        User::create([
            'name' => 'Yanis',
            'email' => 'yanis@gmail.com',
            'password' => bcrypt('Yanis@123!'),
        ]);
    }
}
