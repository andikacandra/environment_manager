<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Group;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // // Clear existing applications
        // DB::table('applications')->truncate();

        // // Get all existing groups
        // $groups = Group::all();

        // // Create applications for each group
        // foreach ($groups as $group) {
        //     // Create 3 applications for each group
        //     Application::factory()
        //         ->count(3)
        //         ->forGroup($group)
        //         ->create();
        // }

        // // Also create some applications without groups (optional)
        // Application::factory()
        //     ->count(5)
        //     ->create();
    }
}
