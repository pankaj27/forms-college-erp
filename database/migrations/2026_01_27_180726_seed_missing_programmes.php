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
        $diplomaId = DB::table('programe_types')->where('programe_type_code', 'DIPLOMA')->value('id');
        
        if ($diplomaId) {
            // Check if Diploma in Nursing exists
            $exists = DB::table('programes')
                ->where('programe_name', 'Diploma in Nursing')
                ->exists();
                
            if (!$exists) {
                DB::table('programes')->insert([
                    'institute_id' => 1,
                    'programe_type_id' => $diplomaId,
                    'programe_name' => 'Diploma in Nursing',
                    'programe_code' => 'DIPN',
                    'is_active' => true,
                    'min_duration' => 3,
                    'max_duration' => 5,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('programes')->where('programe_name', 'Diploma in Nursing')->delete();
    }
};
