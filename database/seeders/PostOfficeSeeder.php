<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PostOfficeMaster;

class PostOfficeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample data for verification
        $data = [
            [
                'pincode' => '110001',
                'post_office_name' => 'New Delhi G.P.O.',
                'address' => 'New Delhi',
                'location' => 'New Delhi',
            ],
            [
                'pincode' => '110001',
                'post_office_name' => 'Parliament House',
                'address' => 'New Delhi',
                'location' => 'New Delhi',
            ],
            [
                'pincode' => '400001',
                'post_office_name' => 'Mumbai G.P.O.',
                'address' => 'Mumbai',
                'location' => 'Mumbai',
            ],
            [
                'pincode' => '700001',
                'post_office_name' => 'Kolkata G.P.O.',
                'address' => 'Kolkata',
                'location' => 'Kolkata',
            ],
            [
                'pincode' => '600001',
                'post_office_name' => 'Chennai G.P.O.',
                'address' => 'Chennai',
                'location' => 'Chennai',
            ],
        ];

        foreach ($data as $item) {
            PostOfficeMaster::firstOrCreate(
                ['pincode' => $item['pincode'], 'post_office_name' => $item['post_office_name']],
                $item
            );
        }
    }
}
