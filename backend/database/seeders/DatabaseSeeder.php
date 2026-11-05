<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            DepartmentSeeder::class,
            TicketCategorySeeder::class,
            TicketPrioritySeeder::class,
            TicketStatusSeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
