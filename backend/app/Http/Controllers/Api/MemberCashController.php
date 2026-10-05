<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CashService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberCashController extends Controller
{
    public function index(Request $request, CashService $cash): JsonResponse
    {
        $perPage = (int) ($request->input('per_page') ?: 5);
        $page = (int) ($request->input('page') ?: $request->input('current_page') ?: 1);

        return response()->json([
            'data' => $cash->memberPeriods($request->user(), $perPage, $page),
        ]);
    }
}
