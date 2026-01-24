<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FeesHead;
use App\Models\FeesMaster;
use App\Models\FeesGroup;
use App\Models\FeesGroupMaster;

class FeeStructureSeeder extends Seeder
{
    public function run()
    {
        // 1. Create Fees Heads
        $heads = [
            'Tuition Fee' => 50000,
            'Admission Fee' => 1000,
            'Library Fee' => 500,
            'Laboratory Fee' => 2000,
            'Examination Fee' => 1500,
            'Identity Card' => 100,
            'Sports Fee' => 500,
        ];

        $masterIds = [];

        foreach ($heads as $headName => $amount) {
            $head = FeesHead::firstOrCreate(
                ['name' => $headName],
                [
                    'institute_id' => 1,
                    'branch_id' => 1,
                    'fees_term_id' => 1 // Assuming 1 exists or defaults
                ]
            );

            // 2. Create Fees Masters
            $master = FeesMaster::firstOrCreate(
                [
                    'fees_head_id' => $head->id,
                    'amount' => $amount,
                ],
                [
                    'institute_id' => 1,
                    'branch_id' => 1,
                    'programe_id' => 1,
                    'description' => 'Standard ' . $headName
                ]
            );
            $masterIds[] = $master->id;
        }

        // 3. Create Fees Group 'On Admission'
        $group = FeesGroup::firstOrCreate(
            ['name' => 'On Admission'],
            [
                'description' => 'Fees payable at the time of admission',
                'institute_id' => 1,
                'branch_id' => 1,
                'programe_id' => 1,
                'start_date' => now(),
                'due_date' => now()->addDays(30),
                'total_amount' => array_sum($heads),
                'is_active' => true
            ]
        );

        // 4. Link in FeesGroupMaster
        foreach ($masterIds as $masterId) {
            FeesGroupMaster::firstOrCreate([
                'fees_group_id' => $group->id,
                'fees_master_id' => $masterId
            ]);
        }
    }
}
