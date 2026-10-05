<?php

namespace App\Services;

use App\Models\CashPayment;
use App\Models\CashPeriod;
use App\Models\CashSetting;
use App\Models\CashTransaction;
use App\Models\Member;
use App\Models\StudentClass;
use Illuminate\Support\Collection;

class CashService
{
    public function balance(): array
    {
        $income = (int) CashTransaction::query()->income()->sum('amount');
        $expense = (int) CashTransaction::query()->expense()->sum('amount');

        return [
            'total_income' => $income,
            'total_expense' => $expense,
            'balance' => $income - $expense,
            'transaction_count' => CashTransaction::query()->count(),
        ];
    }

    public function activePeriod(?int $periodId = null): ?CashPeriod
    {
        if ($periodId) {
            return CashPeriod::query()->find($periodId);
        }

        return CashPeriod::query()
            ->where('is_active', true)
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->first()
            ?? CashPeriod::query()->orderByDesc('year')->orderByDesc('month')->first();
    }

    public function periods(): Collection
    {
        return CashPeriod::query()->orderByDesc('year')->orderByDesc('month')->get();
    }

    public function summary(?int $periodId = null): array
    {
        $period = $this->activePeriod($periodId);
        $totalMembers = Member::query()->where('is_active', true)->count();

        $paid = 0;
        $collected = 0;

        if ($period) {
            $paid = CashPayment::query()
                ->where('cash_period_id', $period->id)
                ->where('status', CashPayment::STATUS_PAID)
                ->count();

            $collected = (int) CashPayment::query()
                ->where('cash_period_id', $period->id)
                ->where('status', CashPayment::STATUS_PAID)
                ->sum('amount');
        }

        return [
            ...$this->balance(),
            'total_members' => $totalMembers,
            'paid' => $paid,
            'unpaid' => max(0, $totalMembers - $paid),
            'percentage' => $totalMembers > 0 ? round($paid / $totalMembers * 100, 1) : 0.0,
            'collected' => $collected,
            'period' => $period,
            'periods' => $this->periods(),
            'monthly_amount' => CashSetting::current()->monthly_amount,
        ];
    }

    public function classBreakdown(?CashPeriod $period = null): Collection
    {
        $period ??= $this->activePeriod();

        $classes = StudentClass::query()
            ->withCount(['members' => fn ($query) => $query->where('is_active', true)])
            ->orderBy('code')
            ->get();

        $paidByClass = collect();

        if ($period) {
            $paidByClass = CashPayment::query()
                ->join('members', 'members.id', '=', 'cash_payments.member_id')
                ->where('cash_payments.cash_period_id', $period->id)
                ->where('cash_payments.status', CashPayment::STATUS_PAID)
                ->selectRaw('members.class_id, COUNT(*) as paid_count, SUM(cash_payments.amount) as total_amount')
                ->groupBy('members.class_id')
                ->get()
                ->keyBy('class_id');
        }

        return $classes->map(function (StudentClass $class) use ($paidByClass) {
            $paid = (int) ($paidByClass[$class->id]->paid_count ?? 0);
            $amount = (int) ($paidByClass[$class->id]->total_amount ?? 0);
            $total = (int) $class->members_count;

            return [
                'id' => $class->id,
                'name' => $class->name,
                'code' => $class->code,
                'label' => $class->label,
                'total_members' => $total,
                'paid' => $paid,
                'unpaid' => max(0, $total - $paid),
                'percentage' => $total > 0 ? round($paid / $total * 100, 1) : 0.0,
                'total_amount' => $amount,
            ];
        });
    }

    public function memberStatuses(
        ?int $classId = null,
        ?int $periodId = null,
        ?string $status = null,
        ?string $search = null
    ): Collection {
        $period = $this->activePeriod($periodId);

        $query = Member::query()
            ->where('is_active', true)
            ->with('studentClass:id,name,code');

        if ($classId) {
            $query->where('class_id', $classId);
        }

        if ($search) {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('nrp', 'like', "%{$search}%");
            });
        }

        $members = $query->orderBy('nrp')->get();

        $payments = collect();
        if ($period) {
            $payments = CashPayment::query()
                ->where('cash_period_id', $period->id)
                ->whereIn('member_id', $members->pluck('id'))
                ->get()
                ->keyBy('member_id');
        }

        $rows = $members->map(function (Member $member) use ($payments, $period) {
            $payment = $payments[$member->id] ?? null;
            $paid = $payment && $payment->status === CashPayment::STATUS_PAID;

            return [
                'member_id' => $member->id,
                'nrp' => $member->nrp,
                'name' => $member->name,
                'slug' => $member->slug,
                'photo' => $member->photo,
                'class_id' => $member->class_id,
                'class' => $member->studentClass?->label,
                'payment_id' => $payment?->id,
                'status' => $paid ? 'paid' : 'unpaid',
                'status_label' => $paid ? 'LUNAS' : 'BELUM BAYAR',
                'amount' => $paid ? (int) $payment->amount : 0,
                'payment_date' => $paid ? $payment->payment_date : null,
                'notes' => $payment?->notes,
                'period' => $period?->name,
            ];
        });

        if ($status === 'paid' || $status === 'unpaid') {
            $rows = $rows->where('status', $status)->values();
        }

        return $rows->values();
    }

    public function overview(?int $periodId = null): array
    {
        $summary = $this->summary($periodId);
        $summary['classes'] = $this->classBreakdown($summary['period']);

        return $summary;
    }

    /**
     * Tagihan kas untuk satu mahasiswa (dipakai portal mahasiswa).
     */
    public function memberPeriods(Member $member, ?int $perPage = 5, ?int $page = 1): array
    {
        $query = CashPeriod::query()
            ->orderBy('year')
            ->orderBy('month');

        $paginated = $query->paginate($perPage, ['*'], 'page', $page);

        $payments = CashPayment::query()
            ->where('member_id', $member->id)
            ->whereIn('cash_period_id', $paginated->pluck('id'))
            ->get()
            ->keyBy('cash_period_id');

        $rows = $paginated->map(function (CashPeriod $period) use ($payments) {
            $payment = $payments[$period->id] ?? null;
            $paid = $payment && $payment->status === CashPayment::STATUS_PAID;

            return [
                'id' => $period->id,
                'name' => $period->name,
                'month' => $period->month,
                'year' => $period->year,
                'amount' => (int) $period->amount,
                'due_date' => $period->due_date,
                'status' => $paid ? 'paid' : 'unpaid',
                'status_label' => $paid ? 'Lunas' : 'Belum Bayar',
                'payment_date' => $paid ? $payment->payment_date : null,
                'payment_method' => $payment?->payment_method,
            ];
        })->values();

        // Totals still computed across all periods for accuracy
        $allPeriods = CashPeriod::query()
            ->orderBy('year')
            ->orderBy('month')
            ->get();
        $allPayments = CashPayment::query()
            ->where('member_id', $member->id)
            ->get()
            ->keyBy('cash_period_id');
        $allRows = $allPeriods->map(function (CashPeriod $period) use ($allPayments) {
            $payment = $allPayments[$period->id] ?? null;
            $paid = $payment && $payment->status === CashPayment::STATUS_PAID;
            return ['amount' => (int) $period->amount, 'status' => $paid ? 'paid' : 'unpaid'];
        });
        $totalTagihan = (int) $allRows->sum('amount');
        $totalPaid = (int) $allRows->where('status', 'paid')->sum('amount');

        return [
            'periods' => $rows,
            'pagination' => [
                'total' => $paginated->total(),
                'per_page' => $paginated->perPage(),
                'current_page' => $paginated->currentPage(),
                'last_page' => $paginated->lastPage(),
            ],
            'summary' => [
                'total_tagihan' => $totalTagihan,
                'total_paid' => $totalPaid,
                'total_unpaid' => max(0, $totalTagihan - $totalPaid),
                'paid_count' => $allRows->where('status', 'paid')->count(),
                'unpaid_count' => $allRows->where('status', 'unpaid')->count(),
            ],
        ];
    }
}
