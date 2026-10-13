<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\CashService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashController extends Controller
{
    public function overview(Request $request, CashService $cash): JsonResponse
    {
        return response()->json([
            'data' => $cash->overview($request->integer('period_id') ?: null),
        ]);
    }

    public function pendingProofs(CashService $cash): JsonResponse
    {
        return response()->json([
            'data' => [
                'count' => $cash->pendingProofsCount(),
            ],
        ]);
    }

    public function pendingProofsList(CashService $cash): JsonResponse
    {
        return response()->json([
            'data' => $cash->pendingProofsList(),
        ]);
    }
}
