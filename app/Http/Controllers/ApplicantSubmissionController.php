<?php

namespace App\Http\Controllers;

use App\Mail\StudentApplicationSubmitted;
use App\Models\Applicant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Barryvdh\DomPDF\Facade\Pdf;

class ApplicantSubmissionController extends Controller
{
    public function submit(Request $request)
    {
        $user = Auth::guard('applicant')->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }

        // Check if already submitted
        // Allow if status is 'draft', 'rejected', or NULL/empty
        // Reload user from DB to ensure status is fresh
        $applicant = Applicant::find($user->id);
        $currentStatus = strtolower(trim($applicant->status ?? ''));
        
        if ($currentStatus !== '' && $currentStatus !== 'draft' && $currentStatus !== 'rejected') {
            return response()->json([
                'success' => false, 
                'message' => 'Application already submitted.',
                'status' => $applicant->status
            ]);
        }

        // Load all details for validation and PDF
        $applicant->load([
            'personalDetails', 
            'programmeDetails', 
            'qualificationDetails', 
            'correspondenceDetails', 
            'uploads'
        ]);

        // Validation: Check if required sections are filled
        if (!$applicant->personalDetails) {
            return response()->json(['success' => false, 'message' => 'Personal details are missing. Please complete the Personal Details section.'], 422);
        }
        if (!$applicant->programmeDetails) {
            return response()->json(['success' => false, 'message' => 'Programme details are missing. Please complete the Programme Details section.'], 422);
        }
        if (!$applicant->correspondenceDetails) {
            return response()->json(['success' => false, 'message' => 'Correspondence details are missing. Please complete the Address Details section.'], 422);
        }
        if (!$applicant->qualificationDetails) {
             return response()->json(['success' => false, 'message' => 'Qualification details are missing. Please complete the Qualification Details section.'], 422);
        }

        // Validate Uploads (Photo and Signature are mandatory)
        $uploads = $applicant->uploads->keyBy('document_type');
        if (!isset($uploads['photo'])) {
             return response()->json(['success' => false, 'message' => 'Photo is missing. Please upload your photo in the Upload section.'], 422);
        }
        if (!isset($uploads['signature'])) {
             return response()->json(['success' => false, 'message' => 'Signature is missing. Please upload your signature in the Upload section.'], 422);
        }

        // 1. Generate PDF
        try {
            // Ensure view exists and data is passed correctly
            $pdf = Pdf::loadView('pdf.student_application', compact('applicant'));
            $pdfOutput = $pdf->output();
        } catch (\Exception $e) {
            \Log::error('Failed to generate PDF for applicant ' . $user->id . ': ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to generate application PDF. Please contact support.'], 500);
        }

        // 2. Update Status
        $user->status = 'submitted';
        $user->submitted_at = now();
        $user->rejection_reason = null; // Clear rejection reason on resubmission
        $user->save();

        // 3. Send Confirmation Email
        try {
            Mail::to($user->email)->send(new StudentApplicationSubmitted($applicant, $pdfOutput));
        } catch (\Exception $e) {
            // Log email failure but don't fail the request
            // We still want to return success because the application IS submitted in the DB.
            \Log::error('Failed to send application submission email to ' . $user->email . ': ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully.',
            'status' => 'submitted'
        ]);
    }
}
