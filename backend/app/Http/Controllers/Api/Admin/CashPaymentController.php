<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\BulkCashPaymentRequest;
use App\Http\Requests\StoreCashPaymentRequest;
use App\Models\CashPayment;
use App\Models\CashPeriod;
use App\Services\CashService;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CashPaymentController extends Controller
{
    public function index(Request $request, CashService $cash): JsonResponse
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

    public function store(StoreCashPaymentRequest $request, CloudinaryService $cloudinary): JsonResponse
    {
        $data = $request->validated();

        if ($file = $request->file('receipt_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.receipts'), 'auto');
            $data['receipt_url'] = $upload['url'];
            $data['receipt_public_id'] = $upload['public_id'];
        }

        unset($data['receipt_file']);

        $payment = CashPayment::updateOrCreate(
            [
                'member_id' => $data['member_id'],
                'cash_period_id' => $data['cash_period_id'],
            ],
            $data,
        );

        return response()->json([
            'message' => 'Pembayaran berhasil disimpan.',
            'data' => $payment->load('member', 'period'),
        ], 201);
    }

    public function bulk(BulkCashPaymentRequest $request): JsonResponse
    {
        $data = $request->validated();
        $period = CashPeriod::query()->findOrFail($data['cash_period_id']);
        $amount = $data['amount'] ?? $period->amount;
        $status = $data['status'] ?? CashPayment::STATUS_PAID;

        $created = 0;
        $updated = 0;

        DB::transaction(function () use ($data, $period, $amount, $status, &$created, &$updated) {
            foreach (array_unique($data['member_ids']) as $memberId) {
                $payment = CashPayment::updateOrCreate(
                    [
                        'member_id' => $memberId,
                        'cash_period_id' => $period->id,
                    ],
                    [
                        'amount' => $amount,
                        'status' => $status,
                        'payment_date' => $status === CashPayment::STATUS_PAID
                            ? ($data['payment_date'] ?? now()->toDateString())
                            : null,
                        'notes' => $data['notes'] ?? null,
                    ],
                );

                $payment->wasRecentlyCreated ? $created++ : $updated++;
            }
        });

        return response()->json([
            'message' => "{$created} pembayaran baru dibuat, {$updated} diperbarui.",
            'created' => $created,
            'updated' => $updated,
        ]);
    }

    public function update(
        StoreCashPaymentRequest $request,
        CashPayment $payment,
        CloudinaryService $cloudinary
    ): JsonResponse {
        $data = $request->validated();

        if ($file = $request->file('receipt_file')) {
            $upload = $cloudinary->upload($file, config('cloudinary.folders.receipts'), 'auto');
            $cloudinary->destroy($payment->receipt_public_id, 'image');
            $data['receipt_url'] = $upload['url'];
            $data['receipt_public_id'] = $upload['public_id'];
        }

        unset($data['receipt_file']);

        $payment->update($data);

        return response()->json([
            'message' => 'Data berhasil diperbarui.',
            'data' => $payment->fresh()->load('member', 'period'),
        ]);
    }

    public function destroy(CashPayment $payment, CloudinaryService $cloudinary): JsonResponse
    {
        $cloudinary->destroy($payment->receipt_public_id, 'image');
        $payment->delete();

        return response()->json(['message' => 'Data berhasil dihapus.']);
    }
}
