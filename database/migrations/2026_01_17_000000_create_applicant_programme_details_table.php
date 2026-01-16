<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_programme_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('applicant_id')->unique();
            $table->string('programme_type')->nullable();
            $table->string('mode_of_study')->nullable();
            $table->string('programme_enrollment')->nullable();
            $table->string('region_code')->nullable();
            $table->string('study_center_code')->nullable();
            $table->string('medium')->nullable();
            $table->string('is_existing_student')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_programme_details');
    }
};
