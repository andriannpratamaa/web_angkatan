<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashPayment extends Model
{
    use HasFactory;

    public const STATUS_PAID = 'paid';
    public const STATUS_UNPAID = 'unpaid';

    protected $fillable = [
        'member_id',
        'cash_period_id',
        'amount',
        'payment_date',
        'status',
        'notes',
        'receipt_url',
        'receipt_public_id',
    ];

    protected $casts = [
        'amount' => 'integer',
        'payment_date' => 'date:Y-m-d',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(CashPeriod::class, 'cash_period_id');
    }
}
