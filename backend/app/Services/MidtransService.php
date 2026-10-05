<?php

namespace App\Services;

use App\Models\CashPayment;
use App\Models\CashPeriod;
use App\Models\Member;
use App\Models\PaymentTransaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Midtrans\Config;
use Midtrans\Snap;

class MidtransService
{
    protected string $serverKey;
    protected string $clientKey;
    protected bool $isProduction;
    protected string $apiUrl;
    protected string $snapUrl;

    public function __construct()
    {
        $this->isProduction = config('midtrans.is_production');
        $this->serverKey = config('midtrans.server_key');
        $this->clientKey = config('midtrans.client_key');

        if ($this->isProduction) {
            $this->apiUrl = config('midtrans.production.api_url');
            $this->snapUrl = config('midtrans.production.snap_url');
        } else {
            $this->apiUrl = config('midtrans.sandbox.api_url');
            $this->snapUrl = config('midtrans.sandbox.snap_url');
        }

        // Configure Midtrans PHP SDK
        Config::$serverKey = $this->serverKey;
        Config::$isProduction = $this->isProduction;
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    /**
     * Get the appropriate Midtrans URL based on environment
     */
    public function getSnapUrl(): string
    {
        return $this->snapUrl;
    }

    public function getClientKey(): string
    {
        return $this->clientKey;
    }

    public function isProduction(): bool
    {
        return $this->isProduction;
    }

    /**
     * Create Snap transaction token
     */
    public function createSnapToken(Member $member, CashPeriod $period, ?PaymentTransaction $existingTransaction = null): array
    {
        $amount = (int) $period->amount;
        $orderId = $existingTransaction?->order_id ?? $this->generateOrderId($member->nrp, $period->id);

        // Check if transaction already exists and is pending
        if ($existingTransaction && $existingTransaction->isPending()) {
            // Return existing snap token if still valid
            if ($existingTransaction->snap_token) {
                return [
                    'order_id' => $existingTransaction->order_id,
                    'snap_token' => $existingTransaction->snap_token,
                    'redirect_url' => null,
                ];
            }
        }

        $transactionDetails = [
            'order_id' => $orderId,
            'gross_amount' => $amount,
        ];

        $customerDetails = [
            'first_name' => $member->name,
            'email' => $member->email ?? $member->nrp . '@to26.local',
            'phone' => '', // Optional
        ];

        $itemDetails = [[
            'id' => 'KAS-' . $period->id,
            'price' => $amount,
            'quantity' => 1,
            'name' => 'Tagihan ' . $period->name,
            'category' => 'Kas Angkatan',
        ]];

        $frontendUrl = env('FRONTEND_URL', config('app.url'));
        
        $callbacks = [
            'finish' => $frontendUrl . '/akun?payment=finish',
            'error' => $frontendUrl . '/akun?payment=error',
            'pending' => $frontendUrl . '/akun?payment=pending',
        ];

        try {
            $snapToken = Snap::getSnapToken([
                'transaction_details' => $transactionDetails,
                'customer_details' => $customerDetails,
                'item_details' => $itemDetails,
                'callbacks' => $callbacks,
                'enabled_payments' => config('midtrans.snap.enabled_payments', ['qris', 'gopay', 'shopeepay', 'bank_transfer']),
                'credit_card' => config('midtrans.snap.credit_card', ['secure' => true]),
                'expiry' => [
                    'start_time' => now()->format('Y-m-d H:i:s O'),
                    'unit' => 'hour',
                    'duration' => 24,
                ],
            ]);

            return [
                'order_id' => $orderId,
                'snap_token' => $snapToken,
                'redirect_url' => null,
            ];
        } catch (\Exception $e) {
            Log::error('Midtrans Snap Token creation failed', [
                'member_id' => $member->id,
                'period_id' => $period->id,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    /**
     * Generate unique order ID: KAS-{NRP}-{TAGIHAN_ID}-{TIMESTAMP}
     */
    public function generateOrderId(string $nrp, int $tagihanId): string
    {
        $timestamp = now()->format('YmdHis');
        return "KAS-{$nrp}-{$tagihanId}-{$timestamp}";
    }

    /**
     * Verify webhook notification by calling Midtrans API
     */
    public function verifyNotification(string $orderId): ?array
    {
        try {
            $response = Http::withBasicAuth($this->serverKey, '')
                ->timeout(30)
                ->get("{$this->apiUrl}/{$orderId}/status");

            if ($response->successful()) {
                return $response->json();
            }

            Log::warning('Midtrans notification verification failed', [
                'order_id' => $orderId,
                'status' => $response->status(),
                'response' => $response->body(),
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('Midtrans notification verification error', [
                'order_id' => $orderId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Map Midtrans status to internal status
     */
    public function mapStatus(array $midtransResponse): array
    {
        $transactionStatus = $midtransResponse['transaction_status'] ?? 'pending';
        $fraudStatus = $midtransResponse['fraud_status'] ?? null;
        $paymentType = $midtransResponse['payment_type'] ?? null;
        $transactionId = $midtransResponse['transaction_id'] ?? null;
        $settlementTime = $midtransResponse['settlement_time'] ?? null;

        $internalStatus = 'pending';
        $isPaid = false;

        switch ($transactionStatus) {
            case 'settlement':
                $internalStatus = 'settlement';
                $isPaid = true;
                break;
            case 'capture':
                $internalStatus = 'capture';
                $isPaid = ($fraudStatus === 'accept');
                break;
            case 'pending':
                $internalStatus = 'pending';
                break;
            case 'expire':
                $internalStatus = 'expire';
                break;
            case 'deny':
                $internalStatus = 'deny';
                break;
            case 'cancel':
                $internalStatus = 'cancel';
                break;
            case 'failure':
                $internalStatus = 'failure';
                break;
        }

        return [
            'transaction_status' => $internalStatus,
            'fraud_status' => $fraudStatus,
            'payment_type' => $paymentType,
            'transaction_id' => $transactionId,
            'paid_at' => $isPaid && $settlementTime ? \Carbon\Carbon::parse($settlementTime) : ($isPaid ? now() : null),
            'is_paid' => $isPaid,
        ];
    }

    /**
     * Create or get existing pending transaction for a member's bill
     */
    public function getOrCreateTransaction(Member $member, CashPeriod $period): PaymentTransaction
    {
        // Check for existing pending transaction
        $existing = PaymentTransaction::where('mahasiswa_id', $member->id)
            ->where('tagihan_id', $period->id)
            ->where('transaction_status', 'pending')
            ->latest()
            ->first();

        if ($existing) {
            return $existing;
        }

        // Check if bill already paid
        $paid = CashPayment::where('member_id', $member->id)
            ->where('cash_period_id', $period->id)
            ->where('status', CashPayment::STATUS_PAID)
            ->exists();

        if ($paid) {
            throw new \Exception('Tagihan sudah lunas');
        }

        // Create new transaction record
        $orderId = $this->generateOrderId($member->nrp, $period->id);

        return PaymentTransaction::create([
            'mahasiswa_id' => $member->id,
            'nrp' => $member->nrp,
            'tagihan_id' => $period->id,
            'order_id' => $orderId,
            'gross_amount' => $period->amount,
            'transaction_status' => 'pending',
        ]);
    }
}