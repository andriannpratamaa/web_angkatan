<?php

use App\Models\CashPayment;
use App\Models\CashPeriod;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    private const DEFAULT_AMOUNT = 10000;

    private const OCTOBER_AMOUNT = 25000;

    public function up(): void
    {
        $octoberPeriodIds = CashPeriod::query()->where('month', 10)->pluck('id');

        CashPeriod::query()->update(['amount' => self::DEFAULT_AMOUNT]);
        CashPeriod::query()->whereIn('id', $octoberPeriodIds)->update(['amount' => self::OCTOBER_AMOUNT]);

        CashPayment::query()->update(['amount' => self::DEFAULT_AMOUNT]);
        CashPayment::query()
            ->whereIn('cash_period_id', $octoberPeriodIds)
            ->update(['amount' => self::OCTOBER_AMOUNT]);
    }

    public function down(): void
    {
        //
    }
};
