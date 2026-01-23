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
        if ($user->status !== 'draft' && $user->status !== 'rejected') {
            return response()->json(['success' => false, 'message' => 'Application already submitted.']);
        }

        // 1. Update Status
        $user->status = 'submitted';
        $user->submitted_at = now();
        $user->rejection_reason = null; // Clear rejection reason on resubmission
        $user->save();

        // 3. Generate PDF
        $pdfOutput = null;
        try {
            // Eager load relationships for the PDF
            $applicant = Applicant::with(['personalDetails', 'programmeDetails', 'qualificationDetails', 'correspondenceDetails', 'uploads'])->find($user->id);
            
            // Check if applicant has all required details
            if (!$applicant->personalDetails) {
                return response()->json(['success' => false, 'message' => 'Personal details are missing. Please complete your profile.'], 422);
            }

            $pdf = Pdf::loadView('pdf.student_application', compact('applicant'));
            $pdfOutput = $pdf->output();
        } catch (\Exception $e) {
            \Log::error('Failed to generate PDF for applicant ' . $user->id . ': ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to generate application PDF. Please try again or contact support.'], 500);
        }

        // 4. Send Email
        try {
            if ($pdfOutput) {
                Mail::to($user->email)->send(new StudentApplicationSubmitted($applicant, $pdfOutput));
            }
        } catch (\Exception $e) {
            // Log email failure but don't fail the request
            \Log::error('Failed to send application submission email to ' . $user->email . ': ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully.',
            'status' => 'submitted'
        ]);
    }
}

