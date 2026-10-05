<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCashPeriodRequest;
use App\Models\CashPeriod;
use Illuminate\Http\JsonResponse;

class CashPeriodController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => CashPeriod::query()
                ->withCount('payments')
                ->orderBy('year')
                ->orderBy('month')
                ->paginate(5),
        ]);
    }

    public function store(StoreCashPeriodRequest $request): JsonResponse
    {
        $period = CashPeriod::create($request->validated());

        return response()->json([
            'message' => 'Periode kas berhasil ditambahkan.',
            'data' => $period,
        ], 201);
    }

    public function update(StoreCashPeriodRequest $request, CashPeriod $period): JsonResponse
    {
        $period->update($request->validated());

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $period->fresh(),
        ]);
    }

    public function destroy(CashPeriod $period): JsonResponse
    {
        $period->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
