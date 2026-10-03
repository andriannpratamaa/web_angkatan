<?php

namespace Database\Seeders;

use App\Models\TimahPanasRequirement;
use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@to26.test'],
            [
                'name' => 'Super Admin TO26',
                'password' => 'password',
                'role' => User::ROLE_SUPER_ADMIN,
            ],
        );

        User::updateOrCreate(
            ['email' => 'bendahara@to26.test'],
            [
                'name' => 'Bendahara TO26',
                'password' => 'password',
                'role' => User::ROLE_BENDAHARA,
            ],
        );
    }
}
