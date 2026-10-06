<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('timah_panas_participants', function (Blueprint $table) {
            $table->foreignId('member_id')->nullable()->change();
            // Unique constraint for date-based: prevent duplicate dates per requirement
            $table->unique(['requirement_id', 'participation_date', 'member_id'], 'unique_requirement_date_member');
        });
    }

    public function down(): void
    {
        Schema::table('timah_panas_participants', function (Blueprint $table) {
            $table->dropUnique('unique_requirement_date_member');
            $table->foreignId('member_id')->nullable(false)->change();
        });
    }
};