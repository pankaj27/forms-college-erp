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
        if (!Schema::hasTable('admission_payments')) {
            Schema::create('admission_payments', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('institute_id');
                $table->unsignedBigInteger('branch_id');
                $table->unsignedBigInteger('applicant_id'); // Application ID
                $table->string('payment_group')->default('Online Admission');
                $table->decimal('pay_receiving_amount', 10, 2);
                $table->date('transaction_date');
                $table->string('transaction_id');
                $table->string('bank_name')->nullable();
                $table->string('bank_branch_name')->nullable(); // For bank transfer
                $table->string('payment_mode'); // Online/Net Banking/UPI/IMPS
                $table->string('payment_proof')->nullable(); // For bank transfer
                $table->string('status')->default('pending'); // pending/verified/failed
                $table->timestamps();

                // Foreign keys if tables exist, but usually safe to just index them if tables might be in different db or loosely coupled
                // Assuming strict integrity is desired:
                // $table->foreign('applicant_id')->references('id')->on('applicants')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admission_payments');
    }
};
