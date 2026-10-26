<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;    

    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@eventpass.test')],
            [
                'name' => 'Admin',
                'password' => env('ADMIN_PASSWORD', 'password'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );
    }
}
