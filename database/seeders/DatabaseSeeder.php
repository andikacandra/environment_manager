<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\EnvType;
use App\Models\Group;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;


class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // $this->call([
        //     RolePermissionSeeder::class,
        //     UserSeeder::class,
        // ]);
        Schema::disableForeignKeyConstraints();

        $this->call([
            RolePermissionSeeder::class,
            UserSeeder::class,
            EnvTypeSeeder::class,
        ]);

        // Group::factory()
        //     ->count(10)
        //     ->create();

        // Application::factory()
        //     ->count(100)
        //     ->create();



        Schema::enableForeignKeyConstraints();
    }
}
