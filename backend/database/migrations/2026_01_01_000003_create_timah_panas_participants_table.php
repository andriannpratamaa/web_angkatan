<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('timah_panas_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requirement_id')->constrained('timah_panas_requirements')->cascadeOnDelete();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->date('participation_date')->nullable();
            $table->text('notes')->nullable();
            $table->string('proof_url')->nullable();
            $table->string('proof_public_id')->nullable();
            $table->timestamps();

            $table->unique(['requirement_id', 'member_id'], 'timah_panas_participant_unique');
            $table->index('member_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('timah_panas_participants');
    }
};
