<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AdmissionForm;
use App\Models\AdmissionFormSection;
use App\Models\AdmissionFormField;
use Illuminate\Support\Str;

class FormSeeder extends Seeder
{
    public function run()
    {
        // Clean up existing form
        $existing = AdmissionForm::where('short_code', 'bsc-nursing-2026')->first();
        if ($existing) {
             // This will also delete related sections/fields if cascade delete is set up, 
             // otherwise we might leave orphans, but for now this is fine or we should delete manually if needed.
             // Assuming cascade on delete is in migration or we don't care about orphans for this test.
             // Actually, standard migrations often cascade.
             $existing->delete();
        }

        // Create the main form
        $form = AdmissionForm::create([
            'institute_id' => 1,
            'branch_id' => 1,
            'academic_session_id' => 1,
            'uuid' => Str::uuid(),
            'title' => 'B.Sc. Nursing Admission 2026',
            'description' => 'Application form for Bachelor of Science in Nursing. Please fill all details carefully.',
            'short_code' => 'bsc-nursing-2026',
            'is_active' => true,
        ]);

        // Section 1: Personal Details
        $personalSection = AdmissionFormSection::create([
            'admission_form_id' => $form->id,
            'title' => 'Personal Details',
            'description' => 'Enter your personal information as per official documents.',
            'order' => 1,
        ]);

        AdmissionFormField::create([
            'section_id' => $personalSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Full Name',
            'name' => 'full_name',
            'field_type' => 'text',
            'is_required' => true,
            'grid_width' => 6,
            'order' => 1,
        ]);

        AdmissionFormField::create([
            'section_id' => $personalSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Date of Birth',
            'name' => 'dob',
            'field_type' => 'date',
            'is_required' => true,
            'grid_width' => 6,
            'order' => 2,
        ]);

        AdmissionFormField::create([
            'section_id' => $personalSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Gender',
            'name' => 'gender',
            'field_type' => 'radio',
            'options' => ['Male', 'Female', 'Other'],
            'is_required' => true,
            'grid_width' => 6,
            'order' => 3,
        ]);

        AdmissionFormField::create([
            'section_id' => $personalSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Category',
            'name' => 'category',
            'field_type' => 'select',
            'options' => ['General', 'OBC', 'SC', 'ST'],
            'is_required' => true,
            'grid_width' => 6,
            'order' => 4,
        ]);

        // Section 2: Contact Details
        $contactSection = AdmissionFormSection::create([
            'admission_form_id' => $form->id,
            'title' => 'Contact Details',
            'description' => 'Please provide valid contact information.',
            'order' => 2,
        ]);

        AdmissionFormField::create([
            'section_id' => $contactSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Email Address',
            'name' => 'email',
            'field_type' => 'email',
            'is_required' => true,
            'grid_width' => 6,
            'order' => 1,
        ]);

        AdmissionFormField::create([
            'section_id' => $contactSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Phone Number',
            'name' => 'phone',
            'field_type' => 'number',
            'is_required' => true,
            'grid_width' => 6,
            'order' => 2,
        ]);

        AdmissionFormField::create([
            'section_id' => $contactSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Permanent Address',
            'name' => 'address',
            'field_type' => 'textarea',
            'is_required' => true,
            'grid_width' => 12,
            'order' => 3,
        ]);

        // Section 3: Academic Details & Documents
        $academicSection = AdmissionFormSection::create([
            'admission_form_id' => $form->id,
            'title' => 'Academic & Documents',
            'description' => 'Upload necessary documents.',
            'order' => 3,
        ]);

        AdmissionFormField::create([
            'section_id' => $academicSection->id,
            'admission_form_id' => $form->id,
            'label' => 'High School Percentage',
            'name' => 'hs_percentage',
            'field_type' => 'number',
            'is_required' => true,
            'grid_width' => 6,
            'order' => 1,
        ]);

        AdmissionFormField::create([
            'section_id' => $academicSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Intermediate Percentage',
            'name' => 'inter_percentage',
            'field_type' => 'number',
            'is_required' => true,
            'grid_width' => 6,
            'order' => 2,
        ]);

        AdmissionFormField::create([
            'section_id' => $academicSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Upload Photo',
            'name' => 'photo',
            'field_type' => 'file',
            'is_required' => true,
            'grid_width' => 6,
            'order' => 3,
        ]);

        AdmissionFormField::create([
            'section_id' => $academicSection->id,
            'admission_form_id' => $form->id,
            'label' => 'Upload Signature',
            'name' => 'signature',
            'field_type' => 'file',
            'is_required' => true,
            'grid_width' => 6,
            'order' => 4,
        ]);
        
        AdmissionFormField::create([
            'section_id' => $academicSection->id,
            'admission_form_id' => $form->id,
            'label' => 'I agree to the terms and conditions',
            'name' => 'terms',
            'field_type' => 'checkbox',
            'is_required' => true,
            'grid_width' => 12,
            'order' => 5,
        ]);
    }
}
