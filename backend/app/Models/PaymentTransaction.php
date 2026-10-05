<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'mahasiswa_id',
        'nrp',
        'tagihan_id',
        'order_id',
        'gross_amount',
        'snap_token',
        'transaction_id',
        'payment_type',
        'transaction_status',
        'fraud_status',
        'paid_at',
    ];

    protected $casts = [
        'gross_amount' => 'integer',
        'paid_at' => 'datetime',
    ];

    public function mahasiswa(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'mahasiswa_id');
    }

    public function tagihan(): BelongsTo
    {
        return $this->belongsTo(CashPeriod::class, 'tagihan_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function isPending(): bool
    {
        return $this->transaction_status === 'pending';
    }

    public function isPaid(): bool
    {
        return in_array($this->transaction_status, ['settlement', 'capture']) 
            && $this->fraud_status === 'accept';
    }

    public function isFailed(): bool
    {
        return in_array($this->transaction_status, ['expire', 'deny', 'cancel', 'failure']);
    }
}