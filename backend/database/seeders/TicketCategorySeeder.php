<?php

namespace Database\Seeders;

use App\Models\TicketCategory;
use Illuminate\Database\Seeder;

class TicketCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Hardware',
                'code' => 'HARDWARE',
                'description' => 'Computer, laptop, printer, and other hardware issues.',
            ],
            [
                'name' => 'Software',
                'code' => 'SOFTWARE',
                'description' => 'Application, operating system, and software issues.',
            ],
            [
                'name' => 'Network',
                'code' => 'NETWORK',
                'description' => 'Internet, Wi-Fi, LAN, VPN, and network connectivity issues.',
            ],
            [
                'name' => 'Access & Account',
                'code' => 'ACCESS',
                'description' => 'Account access, password, permissions, and authentication issues.',
            ],
            [
                'name' => 'Email',
                'code' => 'EMAIL',
                'description' => 'Email delivery, mailbox, and configuration issues.',
            ],
            [
                'name' => 'Other',
                'code' => 'OTHER',
                'description' => 'Other IT requests and issues.',
            ],
        ];

        foreach ($categories as $category) {
            TicketCategory::updateOrCreate(
                ['code' => $category['code']],
                $category
            );
        }
    }
}
