<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Applicant;
use App\Models\FinalRegistration;
use App\Models\ApplicantProgrammeDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class FinalRegistrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure there is at least one institute branch
        $branch = DB::table('institute_branches')->first();
        
        if (!$branch) {
            $this->command->info('No institute branches found. Skipping FinalRegistrationSeeder.');
            return;
        }

        // Create a test applicant if not exists
        $applicant = Applicant::firstOrCreate(
            ['email' => 'seeded_student@example.com'],
            [
                'username' => 'seeded_student',
                'mobile' => '9876543210',
                'password' => Hash::make('password'),
                'status' => 'Registered',
                'progress' => [
                    'personal' => true,
                    'programme' => true,
                    'qualification' => true,
                    'uploads' => true,
                    'preview' => true,
                    'fee' => true
                ]
            ]
        );

        // Add programme details for this applicant
        ApplicantProgrammeDetail::updateOrCreate(
            ['applicant_id' => $applicant->id],
            [
                'programme_type' => 'BACHELOR',
                'mode_of_study' => 'FULL_TIME',
                'programme_enrollment' => 'BACHELOR OF NURSING',
                'region_code' => $branch->id, // Use the branch ID as region code (Campus)
                'study_center_code' => $branch->branch_code,
                'medium' => 'ENGLISH',
            ]
        );

        // Fetch fresh applicant with relationships
        $applicant = Applicant::with('programmeDetails', 'personalDetails')->find($applicant->id);

        // Determine Institute ID and Branch ID
        $instituteId = $branch->institute_id;
        $branchId = $branch->id;

        // Create Final Registration record
        FinalRegistration::firstOrCreate(
            ['applicant_id' => $applicant->id],
            [
                'institute_id' => $instituteId,
                'branch_id' => $branchId,
                'payment_method' => 'bank_transfer',
                'payment_status' => 'completed',
                'amount' => 5000.00,
                'transaction_id' => 'SEED_' . time(),
                'bank_name' => 'HDFC Bank',
                'transaction_date' => now(),
                'proof_document' => 'payment_proofs/sample.jpg',
                'application_snapshot' => $applicant->toArray(),
            ]
        );

        $this->command->info('Final Registration seeded for applicant: ' . $applicant->email);
    }
}
