<?php

namespace App\Http\Controllers;

use App\Models\AdmissionForm;
use App\Models\AdmissionFormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Mail\ApplicationSubmitted;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;

class DynamicFormController extends Controller
{
    public function getFormDetails($short_code)
    {
        if (!Auth::guard('applicant')->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required to access this form.',
            ], 401);
        }

        $form = AdmissionForm::where('short_code', $short_code)
            ->where('is_active', true)
            ->with(['sections.fields' => function ($query) {
                $query->orderBy('order');
            }])
            ->firstOrFail();

        return response()->json($form);
    }

    public function submit(Request $request, $short_code)
    {
        if (!Auth::guard('applicant')->check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required to submit this form.',
            ], 401);
        }

        $form = AdmissionForm::where('short_code', $short_code)
            ->where('is_active', true)
            ->with(['fields', 'sections.fields' => function ($query) {
                $query->orderBy('order');
            }])
            ->firstOrFail();

        // Build validation rules
        $rules = [];
        foreach ($form->fields as $field) {
            if ($field->is_required) {
                $rules[$field->name] = 'required';
            }
            if (!empty($field->validation_rules)) {
                 $extraRules = $field->validation_rules;
                 if (is_array($extraRules)) {
                     if (isset($rules[$field->name])) {
                        $rules[$field->name] = is_array($rules[$field->name]) 
                            ? array_merge($rules[$field->name], $extraRules) 
                            : array_merge([$rules[$field->name]], $extraRules);
                     } else {
                        $rules[$field->name] = $extraRules;
                     }
                 }
            }
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['_token']);
        $uploadedFiles = [];

        // Handle file uploads
        foreach ($form->fields as $field) {
            if ($field->field_type === 'file' && $request->hasFile($field->name)) {
                $file = $request->file($field->name);
                $path = $file->store('admission_uploads', 'public');
                $data[$field->name] = $path;
                $uploadedFiles[] = $path;
            }
        }

        // Store submission
        $submission = AdmissionFormSubmission::create([
            'admission_form_id' => $form->id,
            'data' => $data,
            'status' => 'pending',
        ]);

        // Find email field to send confirmation
        $emailField = $form->fields->where('field_type', 'email')->first();
        $email = $emailField ? ($data[$emailField->name] ?? null) : null;

        if ($email) {
            try {
                // Generate PDF
                $pdf = Pdf::loadView('pdf.application_form', [
                    'form' => $form,
                    'submission' => $submission,
                    'data' => $data
                ]);

                // Send Email
                Mail::to($email)->send(new ApplicationSubmitted($submission, $form, $pdf->output(), $uploadedFiles));
            } catch (\Exception $e) {
                // Log error but don't fail the request
                \Log::error('Failed to send confirmation email: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Form submitted successfully! Check your email for confirmation.'
        ]);
    }

    public function getFeesDetails($groupName)
    {
        $user = Auth::guard('applicant')->user();
        $status = strtolower($user->status);

        if ($status !== 'approved' && $status !== 'registered') {
            return response()->json([
                'success' => false,
                'message' => 'Application not approved.',
            ], 403);
        }

        $group = \App\Models\FeesGroup::where('name', $groupName)
            ->with(['feesGroupMasters.feesMaster.feesHead'])
            ->first();

        if (!$group) {
            return response()->json([
                'success' => false,
                'message' => 'Fees group not found.',
            ], 404);
        }

        // Transform data for easier consumption
        $details = $group->feesGroupMasters->map(function ($fgm) {
            return [
                'head_name' => $fgm->feesMaster->feesHead->name,
                'amount' => $fgm->feesMaster->amount,
            ];
        });

        return response()->json([
            'success' => true,
            'group_name' => $group->name,
            'description' => $group->description,
            'total_amount' => $group->total_amount,
            'details' => $details,
            'due_date' => $group->due_date,
        ]);
    }
}
