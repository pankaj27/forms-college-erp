<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_qualification_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('applicant_id')->unique();
            $table->string('relevant_qualification')->nullable();
            $table->string('main_subjects')->nullable();
            $table->integer('year_of_passing')->nullable();
            $table->string('division')->nullable();
            $table->decimal('percent_marks', 5, 2)->nullable();
            $table->string('board_code')->nullable();
            $table->string('board_roll_number')->nullable();
            $table->string('nad_username')->nullable();
            $table->string('nad_certificate_id')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_qualification_details');
    }
};

