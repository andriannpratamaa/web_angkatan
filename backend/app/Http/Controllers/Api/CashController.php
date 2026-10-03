<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction;
use App\Services\CashService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashController extends Controller
{
    public function summary(Request $request, CashService $cash): JsonResponse
    {
        return response()->json([
            'data' => $cash->summary($request->integer('period_id') ?: null),
        ]);
    }

    public function classes(Request $request, CashService $cash): JsonResponse
    {
        $period = $cash->activePeriod($request->integer('period_id') ?: null);

        return response()->json([
            'data' => $cash->classBreakdown($period),
            'period' => $period,
        ]);
    }

    public function payments(Request $request, CashService $cash): JsonResponse
    {
        $rows = $cash->memberStatuses(
            $request->integer('class_id') ?: null,
            $request->integer('period_id') ?: null,
            $request->query('status'),
            $request->query('search'),
        );

        return response()->json([
            'data' => $rows,
            'meta' => [
                'total' => $rows->count(),
                'paid' => $rows->where('status', 'paid')->count(),
                'unpaid' => $rows->where('status', 'unpaid')->count(),
            ],
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $query = CashTransaction::query();

        if ($search = $request->query('search')) {
            $query->where('description', 'like', "%{$search}%");
        }

        if ($type = $request->query('type')) {
            if (in_array($type, [CashTransaction::TYPE_INCOME, CashTransaction::TYPE_EXPENSE], true)) {
                $query->where('type', $type);
            }
        }

        if ($month = $request->query('month')) {
            $query->whereMonth('transaction_date', (int) $month);
        }

        if ($year = $request->query('year')) {
            $query->whereYear('transaction_date', (int) $year);
        }

        $running = 0;
        $balances = [];

        CashTransaction::query()
            ->orderBy('transaction_date')
            ->orderBy('id')
            ->get(['id', 'type', 'amount'])
            ->each(function (CashTransaction $transaction) use (&$running, &$balances) {
                $running += $transaction->type === CashTransaction::TYPE_INCOME
                    ? (int) $transaction->amount
                    : -(int) $transaction->amount;
                $balances[$transaction->id] = $running;
            });

        $perPage = min(max((int) $request->query('per_page', 10), 1), 100);

        $paginator = $query
            ->orderByDesc('transaction_date')
            ->orderByDesc('id')
            ->paginate($perPage);

        $paginator->getCollection()->transform(function (CashTransaction $transaction) use ($balances) {
            $transaction->setAttribute('balance_after', $balances[$transaction->id] ?? null);

            return $transaction;
        });

        return response()->json([
            ...$paginator->toArray(),
            'filters' => [
                'years' => CashTransaction::query()
                    ->selectRaw('YEAR(transaction_date) as year')
                    ->distinct()
                    ->orderByDesc('year')
                    ->pluck('year')
                    ->values(),
            ],
        ]);
    }
}
