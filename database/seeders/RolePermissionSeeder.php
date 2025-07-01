<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $super_admin = Role::create(['name' => 'super-admin']);
        $programmer = Role::create(['name' => 'programmer']);
        Role::create(['name' => 'supervisor']);
        Role::create(['name' => 'user']);

        Permission::create(['name' => 'view-dashboard']);
        Permission::create(['name' => 'view-any-groups']);
        Permission::create(['name' => 'view-groups']);
        Permission::create(['name' => 'create-groups']);
        Permission::create(['name' => 'edit-groups']);
        Permission::create(['name' => 'delete-groups']);


        Permission::create(['name' => 'create-development']);
        Permission::create(['name' => 'view-development']);
        Permission::create(['name' => 'edit-development']);
        Permission::create(['name' => 'delete-development']);

        Permission::create(['name' => 'create-staging']);
        Permission::create(['name' => 'view-staging']);
        Permission::create(['name' => 'edit-staging']);
        Permission::create(['name' => 'delete-staging']);

        Permission::create(['name' => 'create-production']);
        Permission::create(['name' => 'view-production']);
        Permission::create(['name' => 'edit-production']);
        Permission::create(['name' => 'delete-production']);

        Permission::create(['name' => 'view-any-groupMembers']);
        Permission::create(['name' => 'view-groupMembers']);
        Permission::create(['name' => 'create-groupMembers']);
        Permission::create(['name' => 'edit-groupMembers']);
        Permission::create(['name' => 'delete-groupMembers']);

        Permission::create(['name' => 'view-any-applications']);
        Permission::create(['name' => 'view-applications']);
        Permission::create(['name' => 'create-applications']);
        Permission::create(['name' => 'edit-applications']);
        Permission::create(['name' => 'delete-applications']);

        Permission::create(['name' => 'view-env-variables']);
        Permission::create(['name' => 'create-env-variables']);
        Permission::create(['name' => 'edit-env-variables']);
        Permission::create(['name' => 'delete-env-variables']);
        Permission::create(['name' => 'edit-env-values']);

        Permission::create(['name' => 'view-any-users']);
        Permission::create(['name' => 'view-users']);
        Permission::create(['name' => 'create-users']);
        Permission::create(['name' => 'edit-users']);
        Permission::create(['name' => 'delete-users']);

        Permission::create(['name' => 'view-any-roles']);
        Permission::create(['name' => 'view-roles']);
        Permission::create(['name' => 'create-roles']);
        Permission::create(['name' => 'edit-roles']);
        Permission::create(['name' => 'delete-roles']);
        Permission::create(['name' => 'assign-roles']);

        Permission::create(['name' => 'view-any-permissions']);
        Permission::create(['name' => 'give-permissions']);
        Permission::create(['name' => 'revoke-permissions']);
        Permission::create(['name' => 'view-permissions']);
        Permission::create(['name' => 'create-permissions']);
        Permission::create(['name' => 'edit-permissions']);
        Permission::create(['name' => 'delete-permissions']);

        Permission::create(['name' => 'view-any-env-value-changes']);
        Permission::create(['name' => 'view-env-value-changes']);
        Permission::create(['name' => 'create-env-value-changes']);
        Permission::create(['name' => 'edit-env-value-changes']);
        Permission::create(['name' => 'delete-env-value-changes']);

        $super_admin->givePermissionTo(Permission::all());

        $programmer->givePermissionTo([
            'view-dashboard',
            'view-any-groups',
            'view-any-applications',
            'view-any-env-value-changes',
            'create-applications',
            'create-development',
            'view-development',
            'edit-development',
            'delete-development',
            'create-staging',
            'view-staging',
            'edit-staging',
            'delete-staging',
            'create-env-variables',
            'view-env-variables',
            'edit-env-variables',
            'delete-env-variables',
            'edit-env-values',
        ]);
    }
}
