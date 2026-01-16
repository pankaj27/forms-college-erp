<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_personal_details', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('applicant_id')->unique();
            $table->string('apar_id')->nullable();
            $table->string('apar_name')->nullable();
            $table->string('apar_gender')->nullable();
            $table->date('apar_dob')->nullable();
            $table->string('certificate_name')->nullable();
            $table->string('certificate_gender')->nullable();
            $table->date('certificate_dob')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('guardian_relation')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('category')->nullable();
            $table->string('citizenship_country')->nullable();
            $table->string('territory_area')->nullable();
            $table->string('minority')->nullable();
            $table->string('religion')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('social_status')->nullable();
            $table->string('email')->nullable();
            $table->string('alternate_email')->nullable();
            $table->string('mobile')->nullable();
            $table->string('alternate_mobile')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_personal_details');
    }
};
