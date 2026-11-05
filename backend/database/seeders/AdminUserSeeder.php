<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $adminRole = Role::where('code', 'ADMIN')->firstOrFail();

        $itDepartment = Department::where('code', 'IT')->firstOrFail();

        User::updateOrCreate(
            [
                'email' => 'admin@itflow.local',
            ],
            [
                'name' => 'ITFlow Administrator',
                'password' => Hash::make('Admin@12345'),
                'role_id' => $adminRole->id,
                'department_id' => $itDepartment->id,
                'is_active' => true,
            ]
        );
    }
}
