<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Information Technology',
                'code' => 'IT',
                'description' => 'Technology and IT operations department.',
            ],
            [
                'name' => 'Human Resources',
                'code' => 'HR',
                'description' => 'Human resources and employee management.',
            ],
            [
                'name' => 'Finance',
                'code' => 'FIN',
                'description' => 'Finance and accounting department.',
            ],
            [
                'name' => 'Operations',
                'code' => 'OPS',
                'description' => 'Business operations department.',
            ],
        ];

        foreach ($departments as $department) {
            Department::updateOrCreate(
                ['code' => $department['code']],
                $department
            );
        }
    }
}
