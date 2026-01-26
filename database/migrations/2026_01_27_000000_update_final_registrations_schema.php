<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Use raw SQL for renames to avoid default value quoting issues
        
        if (Schema::hasColumn('final_registrations', 'payment_amount') && !Schema::hasColumn('final_registrations', 'amount')) {
            DB::statement("ALTER TABLE final_registrations CHANGE payment_amount amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00");
        }
        
        if (Schema::hasColumn('final_registrations', 'payment_mode') && !Schema::hasColumn('final_registrations', 'payment_method')) {
            DB::statement("ALTER TABLE final_registrations CHANGE payment_mode payment_method VARCHAR(255) NOT NULL DEFAULT 'online'");
        }
        
        if (Schema::hasColumn('final_registrations', 'payment_date') && !Schema::hasColumn('final_registrations', 'transaction_date')) {
            DB::statement("ALTER TABLE final_registrations CHANGE payment_date transaction_date DATETIME NULL");
        }
        
        if (Schema::hasColumn('final_registrations', 'status') && !Schema::hasColumn('final_registrations', 'payment_status')) {
            DB::statement("ALTER TABLE final_registrations CHANGE status payment_status VARCHAR(255) NOT NULL DEFAULT 'pending'");
        }

        Schema::table('final_registrations', function (Blueprint $table) {
            // Add new columns if they don't exist
            if (!Schema::hasColumn('final_registrations', 'bank_name')) {
                $table->string('bank_name')->nullable();
            }
            if (!Schema::hasColumn('final_registrations', 'proof_document')) {
                $table->string('proof_document')->nullable();
            }
            if (!Schema::hasColumn('final_registrations', 'application_snapshot')) {
                $table->json('application_snapshot')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('final_registrations', 'amount') && !Schema::hasColumn('final_registrations', 'payment_amount')) {
            DB::statement("ALTER TABLE final_registrations CHANGE amount payment_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00");
        }
        
        if (Schema::hasColumn('final_registrations', 'payment_method') && !Schema::hasColumn('final_registrations', 'payment_mode')) {
            DB::statement("ALTER TABLE final_registrations CHANGE payment_method payment_mode VARCHAR(255) NOT NULL DEFAULT 'online'");
        }
        
        if (Schema::hasColumn('final_registrations', 'transaction_date') && !Schema::hasColumn('final_registrations', 'payment_date')) {
            DB::statement("ALTER TABLE final_registrations CHANGE transaction_date payment_date DATETIME NULL");
        }
        
        // For status/payment_status, since we are conditional in up(), we should be careful in down().
        // If we didn't rename, we shouldn't rename back. 
        // But for simplicity, we can try to restore if missing.
        if (Schema::hasColumn('final_registrations', 'payment_status') && !Schema::hasColumn('final_registrations', 'status')) {
            DB::statement("ALTER TABLE final_registrations CHANGE payment_status status VARCHAR(255) NOT NULL DEFAULT 'pending'");
        }

        Schema::table('final_registrations', function (Blueprint $table) {
            $table->dropColumn(['bank_name', 'proof_document', 'application_snapshot']);
        });
    }
};
