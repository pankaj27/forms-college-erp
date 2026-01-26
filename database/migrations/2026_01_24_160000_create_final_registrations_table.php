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
        Schema::create('final_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained('applicants')->onDelete('cascade');
            
            // Payment Details
            $table->string('payment_method'); // 'gateway' or 'bank_transfer'
            $table->string('payment_status')->default('pending'); // 'pending', 'completed'
            $table->decimal('amount', 10, 2);
            $table->string('transaction_id')->nullable();
            
            // Bank Transfer Specifics
            $table->string('bank_name')->nullable();
            $table->date('transaction_date')->nullable();
            $table->string('proof_document')->nullable(); // Path to file

            // Snapshot of all application data
            $table->json('application_snapshot');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('final_registrations');
    }
};
