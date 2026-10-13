<?php

use App\Models\CashPayment;
use App\Models\CashPeriod;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        $october = CashPeriod::query()->where('month', 10)->where('year', 2026)->first();

        if ($october) {
            CashPayment::query()
                ->where('cash_period_id', $october->id)
                ->update([
                    'status' => CashPayment::STATUS_UNPAID,
                    'payment_date' => null,
                    'receipt_url' => null,
                    'receipt_public_id' => null,
                    'notes' => null,
                ]);
        }
    }

    public function down(): void
    {
        //
    }
};
