<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('nrp', 30)->unique();
            $table->enum('gender', ['L', 'P'])->nullable();
            $table->string('role')->default('Anggota');
            $table->string('photo')->nullable();
            $table->string('cloudinary_public_id')->nullable();
            $table->text('bio')->nullable();
            $table->text('quote')->nullable();
            $table->string('instagram')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('github')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('class_id');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
