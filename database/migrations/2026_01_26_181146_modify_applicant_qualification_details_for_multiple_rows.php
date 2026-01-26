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
        Schema::table('applicant_qualification_details', function (Blueprint $table) {
            // $table->dropUnique(['applicant_id']); // Index does not exist
            $table->dropColumn(['nad_username', 'nad_certificate_id']);
            $table->index('applicant_id'); // Add non-unique index for performance
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicant_qualification_details', function (Blueprint $table) {
            $table->dropIndex(['applicant_id']);
            // $table->unique('applicant_id');
            $table->string('nad_username')->nullable();
            $table->string('nad_certificate_id')->nullable();
        });
    }
};
