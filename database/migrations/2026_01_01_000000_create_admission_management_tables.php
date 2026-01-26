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
        if (!Schema::hasTable('admission_forms')) {
            Schema::create('admission_forms', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('institute_id')->nullable();
                $table->unsignedBigInteger('branch_id')->nullable();
                $table->unsignedBigInteger('academic_session_id')->nullable();
                $table->uuid('uuid')->unique();
                $table->string('title');
                $table->text('description')->nullable();
                $table->string('short_code')->unique();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('admission_form_sections')) {
            Schema::create('admission_form_sections', function (Blueprint $table) {
                $table->id();
                $table->foreignId('admission_form_id')->constrained('admission_forms')->onDelete('cascade');
                $table->string('title');
                $table->text('description')->nullable();
                $table->integer('order')->default(0);
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('admission_form_fields')) {
            Schema::create('admission_form_fields', function (Blueprint $table) {
                $table->id();
                $table->foreignId('admission_form_id')->constrained('admission_forms')->onDelete('cascade');
                $table->foreignId('section_id')->constrained('admission_form_sections')->onDelete('cascade');
                $table->string('field_type'); // text, select, radio, etc.
                $table->string('label');
                $table->string('name');
                $table->string('placeholder')->nullable();
                $table->json('options')->nullable(); // For select, radio, checkbox
                $table->boolean('is_required')->default(false);
                $table->integer('grid_width')->default(12); // Bootstrap col-md-X
                $table->integer('order')->default(0);
                $table->json('validation_rules')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admission_form_fields');
        Schema::dropIfExists('admission_form_sections');
        Schema::dropIfExists('admission_forms');
    }
};
