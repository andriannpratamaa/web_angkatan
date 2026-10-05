<?php

namespace Database\Seeders;

use App\Models\CashPeriod;
use Illuminate\Database\Seeder;

class CashPeriodSeeder extends Seeder
{
    public function run(): void
    {
        $periods = [];

        // Generate from September 2026 to December 2029
        $start = strtotime('2026-09-01');
        $end = strtotime('2029-12-01');

        while ($start <= $end) {
            $year = (int) date('Y', $start);
            $month = (int) date('n', $start);
            $monthName = $this->getMonthName($month);

            // Determine amount: Oct 2026 = 25200, else 10200 (from Sept 2026 onward as requested)
            if ($year === 2026 && $month === 10) {
                $amount = 25200;
            } else {
                $amount = 10200;
            }

            $dueDate = date('Y-m-d', mktime(0, 0, 0, $month, 20, $year));
            $name = 'Kas ' . $monthName . ' ' . $year;

            // Set active: October 2026 as in original? Or keep logic; original had October active
            $isActive = ($year === 2026 && $month === 10);

            $periods[] = [
                'name' => $name,
                'month' => $month,
                'year' => $year,
                'amount' => $amount,
                'due_date' => $dueDate,
                'is_active' => $isActive,
            ];

            $start = strtotime('+1 month', $start);
        }

        foreach ($periods as $period) {
            CashPeriod::updateOrCreate(
                ['month' => $period['month'], 'year' => $period['year']],
                $period,
            );
        }
    }

    private function getMonthName(int $month): string
    {
        $names = [
            1 => 'Januari',
            2 => 'Februari',
            3 => 'Maret',
            4 => 'April',
            5 => 'Mei',
            6 => 'Juni',
            7 => 'Juli',
            8 => 'Agustus',
            9 => 'September',
            10 => 'Oktober',
            11 => 'November',
            12 => 'Desember',
        ];

        return $names[$month] ?? '';
    }
}
