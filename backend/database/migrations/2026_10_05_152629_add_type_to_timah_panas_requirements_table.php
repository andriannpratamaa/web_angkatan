<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('timah_panas_requirements', function (Blueprint $table) {
            $table->enum('type', ['member', 'date'])->default('member')->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('timah_panas_requirements', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};