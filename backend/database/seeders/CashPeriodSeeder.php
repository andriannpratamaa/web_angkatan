<?php

namespace Database\Seeders;

use App\Models\CashPeriod;
use Illuminate\Database\Seeder;

class CashPeriodSeeder extends Seeder
{
    public function run(): void
    {
        $periods = [
            ['name' => 'Kas September 2026', 'month' => 9, 'year' => 2026, 'amount' => 20000, 'due_date' => '2026-09-20', 'is_active' => false],
            ['name' => 'Kas Oktober 2026', 'month' => 10, 'year' => 2026, 'amount' => 20000, 'due_date' => '2026-10-20', 'is_active' => true],
            ['name' => 'Kas November 2026', 'month' => 11, 'year' => 2026, 'amount' => 20000, 'due_date' => '2026-11-20', 'is_active' => false],
        ];

        foreach ($periods as $period) {
            CashPeriod::updateOrCreate(
                ['month' => $period['month'], 'year' => $period['year']],
                $period,
            );
        }
    }
}
