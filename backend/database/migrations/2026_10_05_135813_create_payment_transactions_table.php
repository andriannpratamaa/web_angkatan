<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('mahasiswa_id')->constrained('members')->cascadeOnDelete();
            $table->string('nrp', 20);
            $table->foreignId('tagihan_id')->constrained('cash_periods')->cascadeOnDelete();
            $table->string('order_id')->unique();
            $table->unsignedBigInteger('gross_amount');
            $table->string('snap_token')->nullable();
            $table->string('transaction_id')->nullable()->unique();
            $table->string('payment_type')->nullable();
            $table->enum('transaction_status', ['pending', 'settlement', 'capture', 'expire', 'deny', 'cancel', 'failure'])->default('pending');
            $table->enum('fraud_status', ['accept', 'challenge', 'deny'])->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('mahasiswa_id');
            $table->index('tagihan_id');
            $table->index('order_id');
            $table->index('transaction_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
    }
};