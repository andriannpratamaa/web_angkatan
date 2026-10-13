<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashPayment;
use App\Models\CashPeriod;
use App\Services\CloudinaryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberPaymentController extends Controller
{
    public function __construct(
        protected CloudinaryService $cloudinary
    ) {}

    public function uploadProof(Request $request, int $periodId): JsonResponse
    {
        $request->validate([
            'proof_file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:10240'],
        ]);

        $member = $request->user();
        $period = CashPeriod::findOrFail($periodId);

        $cashPayment = CashPayment::where('member_id', $member->id)
            ->where('cash_period_id', $periodId)
            ->first();

        if ($cashPayment && $cashPayment->status === CashPayment::STATUS_PAID) {
            return response()->json([
                'message' => 'Tagihan sudah lunas.',
            ], 422);
        }

        $file = $request->file('proof_file');
        $upload = $this->cloudinary->upload($file, config('cloudinary.folders.receipts'), 'auto');

        if ($cashPayment) {
            if ($cashPayment->receipt_public_id) {
                $this->cloudinary->destroy($cashPayment->receipt_public_id, 'image');
            }
            $cashPayment->update([
                'receipt_url' => $upload['url'],
                'receipt_public_id' => $upload['public_id'],
                'payment_method' => 'qris',
                'status' => CashPayment::STATUS_UNPAID,
                'notes' => 'Menunggu verifikasi admin',
            ]);
        } else {
            $cashPayment = CashPayment::create([
                'member_id' => $member->id,
                'cash_period_id' => $periodId,
                'amount' => $period->amount,
                'status' => CashPayment::STATUS_UNPAID,
                'payment_method' => 'qris',
                'receipt_url' => $upload['url'],
                'receipt_public_id' => $upload['public_id'],
                'notes' => 'Menunggu verifikasi admin',
            ]);
        }

        return response()->json([
            'message' => 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.',
            'data' => [
                'payment_id' => $cashPayment->id,
                'status' => 'unpaid',
                'receipt_url' => $upload['url'],
            ],
        ]);
    }
}
