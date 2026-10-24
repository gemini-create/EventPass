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
        User::create([
            'name' => 'Admin',
            'email' => 'admin@eventpass.test',
            'password' => 'password',
            'role' => 'admin',
        ]);
    }
}
