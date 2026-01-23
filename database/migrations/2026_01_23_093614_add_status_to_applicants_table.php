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
        Schema::table('applicants', function (Blueprint $table) {
            $table->string('status')->default('draft')->after('email_verified_at'); // draft, submitted, approved, rejected
            $table->timestamp('submitted_at')->nullable()->after('status');
            $table->text('rejection_reason')->nullable()->after('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn(['status', 'submitted_at', 'rejection_reason']);
        });
    }
};
