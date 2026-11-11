<?php

namespace Database\Seeders;

use App\Models\SlaPolicy;
use App\Models\TicketPriority;
use Illuminate\Database\Seeder;

class SlaPolicySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $policies = [
            'LOW' => [
                'response_time_minutes' => 240,
                'resolution_time_minutes' => 4320,
            ],

            'MEDIUM' => [
                'response_time_minutes' => 120,
                'resolution_time_minutes' => 1440,
            ],

            'HIGH' => [
                'response_time_minutes' => 30,
                'resolution_time_minutes' => 480,
            ],

            'CRITICAL' => [
                'response_time_minutes' => 15,
                'resolution_time_minutes' => 240,
            ],
        ];

        foreach ($policies as $priorityCode => $times) {
            $priority = TicketPriority::where(
                'code',
                $priorityCode
            )->firstOrFail();

            SlaPolicy::updateOrCreate(
                [
                    'priority_id' => $priority->id,
                ],
                [
                    ...$times,
                    'is_active' => true,
                ]
            );
        }
    }
}