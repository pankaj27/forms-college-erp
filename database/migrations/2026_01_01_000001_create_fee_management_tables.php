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
        if (!Schema::hasTable('fees_heads')) {
            Schema::create('fees_heads', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->unsignedBigInteger('institute_id')->nullable();
                $table->unsignedBigInteger('branch_id')->nullable();
                $table->unsignedBigInteger('fees_term_id')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('fees_masters')) {
            Schema::create('fees_masters', function (Blueprint $table) {
                $table->id();
                $table->foreignId('fees_head_id')->constrained('fees_heads')->onDelete('cascade');
                $table->decimal('amount', 10, 2);
                $table->unsignedBigInteger('institute_id')->nullable();
                $table->unsignedBigInteger('branch_id')->nullable();
                $table->unsignedBigInteger('programe_id')->nullable();
                $table->string('description')->nullable();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('fees_groups')) {
            Schema::create('fees_groups', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->unsignedBigInteger('institute_id')->nullable();
                $table->unsignedBigInteger('branch_id')->nullable();
                $table->unsignedBigInteger('programe_id')->nullable();
                $table->date('start_date')->nullable();
                $table->date('due_date')->nullable();
                $table->decimal('total_amount', 10, 2);
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('fees_group_masters')) {
            Schema::create('fees_group_masters', function (Blueprint $table) {
                $table->id();
                $table->foreignId('fees_group_id')->constrained('fees_groups')->onDelete('cascade');
                $table->foreignId('fees_master_id')->constrained('fees_masters')->onDelete('cascade');
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fees_group_masters');
        Schema::dropIfExists('fees_groups');
        Schema::dropIfExists('fees_masters');
        Schema::dropIfExists('fees_heads');
    }
};
