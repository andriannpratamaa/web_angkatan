<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('cash_period_id')->constrained('cash_periods')->cascadeOnDelete();
            $table->unsignedBigInteger('amount')->default(0);
            $table->date('payment_date')->nullable();
            $table->enum('status', ['paid', 'unpaid'])->default('paid');
            $table->text('notes')->nullable();
            $table->string('receipt_url')->nullable();
            $table->string('receipt_public_id')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'cash_period_id'], 'cash_payment_member_period_unique');
            $table->index('member_id');
            $table->index('cash_period_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_payments');
    }
};
