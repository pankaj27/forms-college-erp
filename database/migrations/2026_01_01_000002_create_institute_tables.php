<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('institutes')) {
            Schema::create('institutes', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('code')->unique();
                $table->string('address')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('institute_branches')) {
            Schema::create('institute_branches', function (Blueprint $table) {
                $table->id();
                $table->foreignId('institute_id')->constrained('institutes')->onDelete('cascade');
                $table->string('name');
                $table->string('branch_code')->unique();
                $table->string('address')->nullable();
                $table->string('contact_number')->nullable();
                $table->string('email')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('institute_branches');
        Schema::dropIfExists('institutes');
    }
};
