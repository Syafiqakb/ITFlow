<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Administrator',
                'code' => 'ADMIN',
                'description' => 'Full access to ITFlow system.',
            ],
            [
                'name' => 'IT Manager',
                'code' => 'IT_MANAGER',
                'description' => 'Manages IT operations, tickets, assignments, and reports.',
            ],
            [
                'name' => 'IT Support',
                'code' => 'IT_SUPPORT',
                'description' => 'Handles assigned tickets and provides technical support.',
            ],
            [
                'name' => 'Employee',
                'code' => 'EMPLOYEE',
                'description' => 'Creates and manages own IT support requests.',
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['code' => $role['code']],
                $role
            );
        }
    }
}
