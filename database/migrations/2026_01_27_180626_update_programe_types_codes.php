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
        DB::table('programe_types')->where('programe_type_name', 'Diploma')->update(['programe_type_code' => 'DIPLOMA']);
        DB::table('programe_types')->where('programe_type_name', 'Bachelor')->update(['programe_type_code' => 'BACHELOR']);
        DB::table('programe_types')->where('programe_type_name', 'Certificate')->update(['programe_type_code' => 'CERTIFICATE']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('programe_types')->update(['programe_type_code' => null]);
    }
};
