<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentClass extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = [
        'name',
        'code',
        'description',
    ];

    protected $appends = ['label'];

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'class_id');
    }

    public function getLabelAttribute(): string
    {
        return preg_replace('/^(TO-1)([A-Z])$/', '$1/$2', $this->code) ?? $this->code;
    }
}
