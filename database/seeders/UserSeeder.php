<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $super_admin = User::factory()->create([
            'full_name' => 'Super Admin',
            'email' => 'super.admin@dwp.co.id',
            'password' => bcrypt('super_admin'),
        ]);


        $super_admin->assignRole('super-admin');

        // User::factory()
        //     ->count(10)
        //     ->create()
        //     ->each(function ($user) {
        //         $user->assignRole('programmer');
        //     });
    }
}
