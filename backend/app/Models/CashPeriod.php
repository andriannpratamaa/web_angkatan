<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'month',
        'year',
        'amount',
        'due_date',
        'is_active',
    ];

    protected $casts = [
        'month' => 'integer',
        'year' => 'integer',
        'amount' => 'integer',
        'due_date' => 'date:Y-m-d',
        'is_active' => 'boolean',
    ];

    public function payments(): HasMany
    {
        return $this->hasMany(CashPayment::class);
    }
}
