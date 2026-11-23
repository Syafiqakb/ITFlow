<?php

namespace Database\Seeders;

use App\Models\ServiceCatalog;
use Illuminate\Database\Seeder;

class ServiceCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'name' => 'Laptop / PC Request',
                'code' => 'LAPTOP_PC',
                'category_id' => 1,
                'description' => 'Request a new laptop or desktop computer.',
                'icon' => 'laptop',
                'is_active' => true,
            ],
            [
                'name' => 'Software Installation',
                'code' => 'SOFTWARE_INSTALL',
                'category_id' => 2,
                'description' => 'Request installation of approved software.',
                'icon' => 'software',
                'is_active' => true,
            ],
            [
                'name' => 'Application Access',
                'code' => 'APP_ACCESS',
                'category_id' => 4,
                'description' => 'Request access to an application or system.',
                'icon' => 'lock',
                'is_active' => true,
            ],
            [
                'name' => 'Account Request',
                'code' => 'ACCOUNT_REQUEST',
                'category_id' => 4,
                'description' => 'Request a new account or account-related service.',
                'icon' => 'user',
                'is_active' => true,
            ],
            [
                'name' => 'Network Access',
                'code' => 'NETWORK_ACCESS',
                'category_id' => 3,
                'description' => 'Request network or connectivity access.',
                'icon' => 'network',
                'is_active' => true,
            ],
            [
                'name' => 'Peripheral Request',
                'code' => 'PERIPHERAL',
                'category_id' => 1,
                'description' => 'Request monitors, keyboards, mice, printers, or other peripherals.',
                'icon' => 'monitor',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            ServiceCatalog::updateOrCreate(
                ['code' => $service['code']],
                $service
            );
        }
    }
}