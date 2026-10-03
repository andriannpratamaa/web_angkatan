<?php

namespace Database\Seeders;

use App\Models\CashPayment;
use App\Models\CashPeriod;
use App\Models\Member;
use App\Models\StudentClass;
use Illuminate\Database\Seeder;

class CashPaymentSeeder extends Seeder
{
    /**
     * Jumlah mahasiswa "LUNAS" per kelas untuk periode aktif (Oktober 2026).
     * Sisa mahasiswa otomatis dianggap BELUM BAYAR (tidak ada record pembayaran).
     */
    private array $paidTargets = [
        'TO-1A' => 29,
        'TO-1B' => 30,
        'TO-1C' => 31,
        'TO-1D' => 28,
        'TO-1E' => 30,
    ];

    public function run(): void
    {
        $september = CashPeriod::query()->where('month', 9)->where('year', 2026)->first();
        $october = CashPeriod::query()->where('month', 10)->where('year', 2026)->first();

        $classes = StudentClass::query()->orderBy('code')->get();

        foreach ($classes as $class) {
            $members = Member::query()
                ->where('class_id', $class->id)
                ->orderBy('nrp')
                ->get();

            foreach ($members as $index => $member) {
                // Seluruh mahasiswa sudah membayar periode September.
                if ($september) {
                    CashPayment::updateOrCreate(
                        ['member_id' => $member->id, 'cash_period_id' => $september->id],
                        [
                            'amount' => $september->amount,
                            'status' => CashPayment::STATUS_PAID,
                            'payment_date' => '2026-09-05',
                        ],
                    );
                }

                // Periode Oktober sesuai target per kelas.
                $target = $this->paidTargets[$class->code] ?? 0;

                if ($october && $index < $target) {
                    CashPayment::updateOrCreate(
                        ['member_id' => $member->id, 'cash_period_id' => $october->id],
                        [
                            'amount' => $october->amount,
                            'status' => CashPayment::STATUS_PAID,
                            'payment_date' => '2026-10-05',
                        ],
                    );
                }
            }
        }
    }
}
