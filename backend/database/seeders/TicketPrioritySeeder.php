<?php

namespace Database\Seeders;

use App\Models\TicketPriority;
use Illuminate\Database\Seeder;

class TicketPrioritySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $priorities = [
            [
                'name' => 'Low',
                'code' => 'LOW',
                'level' => 1,
                'description' => 'Minor issue with limited impact.',
            ],
            [
                'name' => 'Medium',
                'code' => 'MEDIUM',
                'level' => 2,
                'description' => 'Normal issue affecting regular work.',
            ],
            [
                'name' => 'High',
                'code' => 'HIGH',
                'level' => 3,
                'description' => 'Significant issue affecting productivity.',
            ],
            [
                'name' => 'Critical',
                'code' => 'CRITICAL',
                'level' => 4,
                'description' => 'Critical issue causing major business impact.',
            ],
        ];

        foreach ($priorities as $priority) {
            TicketPriority::updateOrCreate(
                ['code' => $priority['code']],
                $priority
            );
        }
    }
}
