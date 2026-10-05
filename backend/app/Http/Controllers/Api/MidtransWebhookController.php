<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashPayment;
use App\Models\CashPeriod;
use App\Models\Member;
use App\Models\PaymentTransaction;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MidtransWebhookController extends Controller
{
    public function __construct(
        protected MidtransService $midtrans
    ) {}

    /**
     * Handle Midtrans notification webhook
     */
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Midtrans webhook received', ['payload' => $payload]);

        $orderId = $payload['order_id'] ?? null;

        if (! $orderId) {
            Log::warning('Midtrans webhook missing order_id');
            return response()->json(['message' => 'Order ID tidak ditemukan'], 400);
        }

        // Verify with Midtrans
        $verification = $this->midtrans->verifyNotification($orderId);

        if (! $verification) {
            Log::warning('Midtrans webhook verification failed', ['order_id' => $orderId]);
            return response()->json(['message' => 'Verifikasi gagal'], 400);
        }

        // Map status
        $mapped = $this->midtrans->mapStatus($verification);

        // Find transaction
        $transaction = PaymentTransaction::where('order_id', $orderId)
            ->with(['mahasiswa', 'tagihan'])
            ->first();

        if (! $transaction) {
            Log::warning('Midtrans webhook transaction not found', ['order_id' => $orderId]);
            return response()->json(['message' => 'Transaksi tidak ditemukan'], 404);
        }

        // Verify amount matches
        $grossAmount = (int) ($verification['gross_amount'] ?? 0);
        if ($grossAmount !== $transaction->gross_amount) {
            Log::warning('Midtrans webhook amount mismatch', [
                'order_id' => $orderId,
                'expected' => $transaction->gross_amount,
                'received' => $grossAmount,
            ]);
            return response()->json(['message' => 'Jumlah tidak sesuai'], 400);
        }

        // Verify member matches
        $verificationEmail = $verification['customer_details']['email'] ?? '';
        $emailNrp = explode('@', $verificationEmail)[0];

        // Allow matching by nrp or by email nrp (we set email as nrp@to26.local)
        if ($transaction->nrp !== $emailNrp && $transaction->nrp !== $verificationEmail) {
            Log::warning('Midtrans webhook member mismatch', [
                'order_id' => $orderId,
                'expected_nrp' => $transaction->nrp,
                'received_email' => $verificationEmail,
                'extracted_nrp' => $emailNrp,
            ]);
            return response()->json(['message' => 'Member tidak sesuai'], 400);
        }

        DB::transaction(function () use ($transaction, $verification, $mapped, $payload) {
            // Update transaction
            $transaction->update([
                'transaction_id' => $mapped['transaction_id'] ?? $transaction->transaction_id,
                'payment_type' => $mapped['payment_type'] ?? $transaction->payment_type,
                'transaction_status' => $mapped['transaction_status'],
                'fraud_status' => $mapped['fraud_status'] ?? $transaction->fraud_status,
                'paid_at' => $mapped['paid_at'] ?? $transaction->paid_at,
            ]);

            // If paid, update cash_payment and mark bill as paid
            if ($mapped['is_paid']) {
                $cashPayment = CashPayment::where('member_id', $transaction->mahasiswa_id)
                    ->where('cash_period_id', $transaction->tagihan_id)
                    ->first();

                if ($cashPayment) {
                    $cashPayment->update([
                        'status' => CashPayment::STATUS_PAID,
                        'payment_date' => $mapped['paid_at'] ?? now(),
                        'payment_method' => $mapped['payment_type'] ?? 'midtrans',
                        'notes' => 'Dibayar via Midtrans: ' . ($verification['payment_type'] ?? 'unknown'),
                    ]);
                } else {
                    // Create cash_payment if not exists
                    CashPayment::create([
                        'member_id' => $transaction->mahasiswa_id,
                        'cash_period_id' => $transaction->tagihan_id,
                        'amount' => $transaction->gross_amount,
                        'status' => CashPayment::STATUS_PAID,
                        'payment_date' => $mapped['paid_at'] ?? now(),
                        'payment_method' => $mapped['payment_type'] ?? 'midtrans',
                        'notes' => 'Dibayar via Midtrans: ' . ($verification['payment_type'] ?? 'unknown'),
                    ]);
                }

                Log::info('Tagihan ditandai LUNAS via webhook', [
                    'member_id' => $transaction->mahasiswa_id,
                    'period_id' => $transaction->tagihan_id,
                    'order_id' => $orderId,
                    'transaction_id' => $mapped['transaction_id'],
                ]);
            }
        });

        return response()->json(['message' => 'OK']);
    }
}