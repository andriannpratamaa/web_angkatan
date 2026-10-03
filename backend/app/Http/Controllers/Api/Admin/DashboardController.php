<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction;
use App\Models\Member;
use App\Models\StudentClass;
use App\Services\CashService;
use App\Services\TimahPanasService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(CashService $cash, TimahPanasService $timah): JsonResponse
    {
        $summary = $cash->summary();
        $timahData = $timah->index(false);

        return response()->json([
            'data' => [
                'total_members' => Member::query()->where('is_active', true)->count(),
                'total_classes' => StudentClass::query()->count(),
                'balance' => $summary['balance'],
                'total_income' => $summary['total_income'],
                'total_expense' => $summary['total_expense'],
                'paid' => $summary['paid'],
                'unpaid' => $summary['unpaid'],
                'percentage' => $summary['percentage'],
                'collected' => $summary['collected'],
                'period' => $summary['period'],
                'total_requirements' => $timahData['summary']['total_requirements'],
                'completed_requirements' => $timahData['summary']['fulfilled_requirements'],
                'total_participation' => $timahData['summary']['total_participation'],
                'classes' => $cash->classBreakdown($summary['period']),
                'requirements' => $timahData['data'],
                'recent_transactions' => CashTransaction::query()
                    ->orderByDesc('transaction_date')
                    ->orderByDesc('id')
                    ->limit(6)
                    ->get(),
            ],
        ]);
    }
}
