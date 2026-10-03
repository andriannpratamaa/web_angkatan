<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ClassSeeder::class,
            MemberSeeder::class,
            CashPeriodSeeder::class,
            CashPaymentSeeder::class,
            CashTransactionSeeder::class,
            TimahPanasSeeder::class,
            ContentSeeder::class,
        ]);
    }
}
