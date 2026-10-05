<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;

class Member extends Model
{
    use HasApiTokens;
    use HasFactory;

    protected $fillable = [
        'class_id',
        'name',
        'slug',
        'nrp',
        'email',
        'password',
        'must_change_password',
        'last_login_at',
        'gender',
        'role',
        'photo',
        'cloudinary_public_id',
        'bio',
        'quote',
        'instagram',
        'linkedin',
        'github',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'must_change_password' => 'boolean',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function studentClass(): BelongsTo
    {
        return $this->belongsTo(StudentClass::class, 'class_id');
    }

    public function timahPanasParticipants(): HasMany
    {
        return $this->hasMany(TimahPanasParticipant::class);
    }

    public function cashPayments(): HasMany
    {
        return $this->hasMany(CashPayment::class);
    }

    public static function makeSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'member';
        $slug = $base;
        $suffix = 2;

        while (static::where('slug', $slug)
            ->when($ignoreId, fn ($query) => $query->where('id', '!=', $ignoreId))
            ->exists()) {
            $slug = $base.'-'.$suffix++;
        }

        return $slug;
    }
}
