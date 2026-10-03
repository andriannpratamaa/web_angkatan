<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CashSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function cash(): JsonResponse
    {
        return response()->json(['data' => CashSetting::current()]);
    }

    public function updateCash(Request $request): JsonResponse
    {
        $data = $request->validate([
            'monthly_amount' => ['required', 'integer', 'min:0'],
            'treasurer_name' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ], [
            'monthly_amount.required' => 'Nominal kas bulanan wajib diisi.',
            'monthly_amount.integer' => 'Nominal kas bulanan harus berupa angka.',
        ]);

        $setting = CashSetting::current();
        $setting->update($data);

        return response()->json([
            'message' => 'Pengaturan berhasil disimpan.',
            'data' => $setting->fresh(),
        ]);
    }
}
