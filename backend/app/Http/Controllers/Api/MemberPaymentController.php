<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CashPayment;
use App\Models\CashPeriod;
use App\Models\PaymentTransaction;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberPaymentController extends Controller
{
    public function __construct(
        protected MidtransService $midtrans
    ) {}

    /**
     * Create Midtrans Snap transaction for a bill
     */
    public function createTransaction(Request $request, int $periodId): JsonResponse
    {
        $member = $request->user();

        $period = CashPeriod::findOrFail($periodId);

        // Verify bill belongs to this member (check if member has this period available)
        $cashPayment = CashPayment::where('member_id', $member->id)
            ->where('cash_period_id', $periodId)
            ->first();

        // If no CashPayment record exists, check if period is valid for this member
        // (All active members should have bills for all periods)
        if (! $cashPayment) {
            // Create unpaid cash_payment record if not exists
            $cashPayment = CashPayment::create([
                'member_id' => $member->id,
                'cash_period_id' => $periodId,
                'amount' => $period->amount,
                'status' => CashPayment::STATUS_UNPAID,
            ]);
        }

        // Check if already paid
        if ($cashPayment->status === CashPayment::STATUS_PAID) {
            return response()->json([
                'message' => 'Tagihan sudah lunas.',
            ], 422);
        }

        try {
            // Get or create payment transaction
            $transaction = $this->midtrans->getOrCreateTransaction($member, $period);

            // Create Snap token
            $snapResult = $this->midtrans->createSnapToken($member, $period, $transaction);

            // Update transaction with snap token if new
            if (! $transaction->snap_token || $transaction->order_id !== $snapResult['order_id']) {
                $transaction->update([
                    'order_id' => $snapResult['order_id'],
                    'snap_token' => $snapResult['snap_token'],
                    'gross_amount' => $period->amount,
                ]);
            }

            return response()->json([
                'message' => 'Transaksi berhasil dibuat.',
                'data' => [
                    'order_id' => $snapResult['order_id'],
                    'snap_token' => $snapResult['snap_token'],
                    'snap_url' => $this->midtrans->getSnapUrl(),
                    'client_key' => $this->midtrans->getClientKey(),
                    'gross_amount' => $period->amount,
                    'period_name' => $period->name,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat transaksi: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check payment status for a bill (for polling)
     */
    public function checkStatus(Request $request, int $periodId): JsonResponse
    {
        $member = $request->user();

        $period = CashPeriod::findOrFail($periodId);

        $cashPayment = CashPayment::where('member_id', $member->id)
            ->where('cash_period_id', $periodId)
            ->first();

        $transaction = PaymentTransaction::where('mahasiswa_id', $member->id)
            ->where('tagihan_id', $periodId)
            ->latest()
            ->first();

        $status = 'unpaid';
        $paymentStatus = 'unpaid';
        $paidAt = null;

        if ($cashPayment && $cashPayment->status === CashPayment::STATUS_PAID) {
            $status = 'paid';
            $paymentStatus = 'paid';
            $paidAt = $cashPayment->payment_date?->format('Y-m-d H:i:s');
        } elseif ($transaction) {
            // If transaction is pending, verify with Midtrans API directly
            if ($transaction->isPending() && $transaction->order_id) {
                $verification = $this->midtrans->verifyNotification($transaction->order_id);
                if ($verification) {
                    $mapped = $this->midtrans->mapStatus($verification);
                    
                    // Update transaction with latest status
                    $transaction->update([
                        'transaction_id' => $mapped['transaction_id'] ?? $transaction->transaction_id,
                        'payment_type' => $mapped['payment_type'] ?? $transaction->payment_type,
                        'transaction_status' => $mapped['transaction_status'],
                        'fraud_status' => $mapped['fraud_status'] ?? $transaction->fraud_status,
                        'paid_at' => $mapped['paid_at'] ?? $transaction->paid_at,
                    ]);

                    // If paid, update cash_payment
                    if ($mapped['is_paid']) {
                        if ($cashPayment) {
                            $cashPayment->update([
                                'status' => CashPayment::STATUS_PAID,
                                'payment_date' => $mapped['paid_at'] ?? now(),
                                'payment_method' => $mapped['payment_type'] ?? 'midtrans',
                                'notes' => 'Dibayar via Midtrans: ' . ($verification['payment_type'] ?? 'unknown'),
                            ]);
                        } else {
                            CashPayment::create([
                                'member_id' => $member->id,
                                'cash_period_id' => $periodId,
                                'amount' => $period->amount,
                                'status' => CashPayment::STATUS_PAID,
                                'payment_date' => $mapped['paid_at'] ?? now(),
                                'payment_method' => $mapped['payment_type'] ?? 'midtrans',
                                'notes' => 'Dibayar via Midtrans: ' . ($verification['payment_type'] ?? 'unknown'),
                            ]);
                        }
                        $status = 'paid';
                        $paymentStatus = 'paid';
                        $paidAt = $mapped['paid_at'] ?? now()->format('Y-m-d H:i:s');
                    } elseif ($mapped['transaction_status'] === 'pending') {
                        $status = 'pending';
                        $paymentStatus = 'pending';
                    } else {
                        $status = 'unpaid';
                        $paymentStatus = 'failed';
                    }
                } else {
                    $status = 'pending';
                    $paymentStatus = 'pending';
                }
            } elseif ($transaction->isPaid()) {
                $status = 'paid';
                $paymentStatus = 'paid';
                $paidAt = $transaction->paid_at?->format('Y-m-d H:i:s');
            } elseif ($transaction->isPending()) {
                $status = 'pending';
                $paymentStatus = 'pending';
            } elseif ($transaction->isFailed()) {
                $status = 'unpaid';
                $paymentStatus = 'failed';
            }
        }

        return response()->json([
            'data' => [
                'tagihan_id' => $periodId,
                'period_name' => $period->name,
                'amount' => $period->amount,
                'status' => $status,
                'payment_status' => $paymentStatus,
                'paid_at' => $paidAt,
                'snap_token' => $transaction?->snap_token,
                'order_id' => $transaction?->order_id,
            ],
        ]);
    }

    /**
     * Cancel a pending payment transaction
     */
    public function cancelTransaction(Request $request, int $periodId): JsonResponse
    {
        $member = $request->user();

        $period = CashPeriod::findOrFail($periodId);

        $transaction = PaymentTransaction::where('mahasiswa_id', $member->id)
            ->where('tagihan_id', $periodId)
            ->where('transaction_status', 'pending')
            ->latest()
            ->first();

        if (! $transaction) {
            return response()->json([
                'message' => 'Tidak ada transaksi pending untuk dibatalkan.',
            ], 422);
        }

        // Update transaction status to cancelled
        $transaction->update([
            'transaction_status' => 'cancel',
        ]);

        return response()->json([
            'message' => 'Transaksi berhasil dibatalkan.',
            'data' => [
                'tagihan_id' => $periodId,
                'status' => 'unpaid',
            ],
        ]);
    }
}