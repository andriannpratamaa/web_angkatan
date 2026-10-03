<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimahPanasParticipant extends Model
{
    use HasFactory;

    protected $fillable = [
        'requirement_id',
        'member_id',
        'participation_date',
        'notes',
        'proof_url',
        'proof_public_id',
    ];

    protected $casts = [
        'participation_date' => 'date:Y-m-d',
    ];

    public function requirement(): BelongsTo
    {
        return $this->belongsTo(TimahPanasRequirement::class, 'requirement_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
