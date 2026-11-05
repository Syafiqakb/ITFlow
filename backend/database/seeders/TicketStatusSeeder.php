<?php

namespace Database\Seeders;

use App\Models\TicketStatus;
use Illuminate\Database\Seeder;

class TicketStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $statuses = [
            [
                'name' => 'New',
                'code' => 'NEW',
                'sort_order' => 1,
                'is_closed' => false,
                'description' => 'Ticket has been created and is awaiting assignment.',
            ],
            [
                'name' => 'Assigned',
                'code' => 'ASSIGNED',
                'sort_order' => 2,
                'is_closed' => false,
                'description' => 'Ticket has been assigned to an IT support staff member.',
            ],
            [
                'name' => 'In Progress',
                'code' => 'IN_PROGRESS',
                'sort_order' => 3,
                'is_closed' => false,
                'description' => 'IT support is actively working on the ticket.',
            ],
            [
                'name' => 'Waiting for User',
                'code' => 'WAITING_USER',
                'sort_order' => 4,
                'is_closed' => false,
                'description' => 'Ticket is waiting for information or action from the requester.',
            ],
            [
                'name' => 'Resolved',
                'code' => 'RESOLVED',
                'sort_order' => 5,
                'is_closed' => false,
                'description' => 'Issue has been resolved and is awaiting confirmation.',
            ],
            [
                'name' => 'Closed',
                'code' => 'CLOSED',
                'sort_order' => 6,
                'is_closed' => true,
                'description' => 'Ticket has been completed and closed.',
            ],
        ];

        foreach ($statuses as $status) {
            TicketStatus::updateOrCreate(
                ['code' => $status['code']],
                $status
            );
        }
    }
}
