<?php

namespace Database\Seeders;

use App\Models\CashSetting;
use App\Models\CashTransaction;
use Illuminate\Database\Seeder;

class CashTransactionSeeder extends Seeder
{
    public function run(): void
    {
        CashSetting::updateOrCreate(['id' => 1], [
            'monthly_amount' => 10200,
            'treasurer_name' => 'Bendahara TO26',
            'notes' => 'Kas wajib dibayarkan setiap bulan maksimal tanggal 20.',
        ]);

        $transactions = [
            ['2026-09-02', 'income', 'Kas Angkatan', 'Kas Bulan September 2026', 3240000],
            ['2026-10-02', 'income', 'Kas Angkatan', 'Kas Bulan Oktober 2026', 2960000],
            ['2026-10-12', 'income', 'Sponsor', 'Dana Sponsor Kegiatan', 5000000],
            ['2026-11-20', 'income', 'Usaha', 'Penjualan Merchandise Angkatan', 2400000],
            ['2026-09-15', 'expense', 'Perlengkapan', 'Beli Perlengkapan Kegiatan', 850000],
            ['2026-10-05', 'expense', 'Konsumsi', 'Konsumsi Rapat Angkatan', 450000],
            ['2026-10-18', 'expense', 'Sewa', 'Sewa Ruangan Pelatihan', 1200000],
            ['2026-11-02', 'expense', 'Cetak', 'Banner dan Cetak Dokumen', 680000],
            ['2026-11-25', 'expense', 'Transportasi', 'Transportasi Kunjungan Industri', 1750000],
            ['2026-12-03', 'expense', 'Sosial', 'Dana Sosial Angkatan', 900000],
        ];

        foreach ($transactions as [$date, $type, $category, $description, $amount]) {
            CashTransaction::updateOrCreate(
                ['transaction_date' => $date, 'description' => $description],
                [
                    'type' => $type,
                    'category' => $category,
                    'amount' => $amount,
                    'created_by' => 'Super Admin TO26',
                ],
            );
        }
    }
}
