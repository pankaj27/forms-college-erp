<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InstituteSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create an Institute
        $instituteId = DB::table('institutes')->insertGetId([
            'name' => 'Tech University',
            'code' => 'TECHU',
            'address' => '123 Tech Street, Silicon Valley',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create a Branch for the Institute
        DB::table('institute_branches')->insert([
            'institute_id' => $instituteId,
            'name' => 'Main Campus',
            'branch_code' => 'MC001',
            'address' => '123 Tech Street, Building A',
            'contact_number' => '1234567890',
            'email' => 'admin@techu.edu',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->command->info('Institute and Branch seeded successfully.');
    }
}
