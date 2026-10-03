<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CashTransaction extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const TYPE_INCOME = 'income';
    public const TYPE_EXPENSE = 'expense';

    protected $fillable = [
        'transaction_date',
        'type',
        'category',
        'description',
        'amount',
        'receipt_url',
        'receipt_public_id',
        'created_by',
    ];

    protected $casts = [
        'transaction_date' => 'date:Y-m-d',
        'amount' => 'integer',
    ];

    public function scopeIncome($query)
    {
        return $query->where('type', self::TYPE_INCOME);
    }

    public function scopeExpense($query)
    {
        return $query->where('type', self::TYPE_EXPENSE);
    }
}
