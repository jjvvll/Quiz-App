<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Sample users
        $users = [
            [
                'name' => 'Alice Johnson',
                'email' => 'alice@example.com',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Bob Smith',
                'email' => 'bob@example.com',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Charlie Brown',
                'email' => 'charlie@example.com',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'David Lee',
                'email' => 'david@example.com',
                'password' => Hash::make('password'),
            ],
            [
                'name' => 'Eve Adams',
                'email' => 'eve@example.com',
                'password' => Hash::make('password'),
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }

        // Optional: generate 10 random users using Faker
        User::factory()->count(10)->create();
    }
}
