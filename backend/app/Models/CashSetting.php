<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CashSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'monthly_amount',
        'treasurer_name',
        'notes',
    ];

    protected $casts = [
        'monthly_amount' => 'integer',
    ];

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'monthly_amount' => 20000,
            'treasurer_name' => 'Bendahara TO26',
        ]);
    }
}
