<?php

namespace App\Http\Controllers;

use App\Mail\StudentApplicationSubmitted;
use App\Models\Applicant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

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

        // 2. Send Confirmation Email
        try {
            // Eager load relationships for the email details
            $applicant = Applicant::with(['personalDetails', 'programmeDetails'])->find($user->id);
            
            Mail::to($user->email)->send(new StudentApplicationSubmitted($applicant));
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

