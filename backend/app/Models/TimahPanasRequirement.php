<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TimahPanasRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'target',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'target' => 'integer',
        'sort_order' => 'integer',
        'is_active' => 'boolean',
    ];

    protected $appends = ['fulfilled', 'percentage', 'status'];

    public function participants(): HasMany
    {
        return $this->hasMany(TimahPanasParticipant::class, 'requirement_id');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function getFulfilledAttribute(): int
    {
        if (array_key_exists('participants_count', $this->attributes)) {
            return (int) $this->attributes['participants_count'];
        }

        return $this->participants()->count();
    }

    public function getPercentageAttribute(): float
    {
        if ($this->target < 1) {
            return 0.0;
        }

        return round($this->fulfilled / $this->target * 100, 1);
    }

    public function getStatusAttribute(): string
    {
        return $this->fulfilled >= $this->target ? 'Terpenuhi' : 'Belum Terpenuhi';
    }
}
