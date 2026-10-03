<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('transaction_date');
            $table->enum('type', ['income', 'expense']);
            $table->string('category')->nullable();
            $table->string('description');
            $table->unsignedBigInteger('amount');
            $table->string('receipt_url')->nullable();
            $table->string('receipt_public_id')->nullable();
            $table->string('created_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['transaction_date', 'type']);
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
    }
};
