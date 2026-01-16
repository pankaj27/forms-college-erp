<?php

namespace App\Http\Controllers;

use App\Models\ApplicantQualificationDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ApplicantQualificationDetailsController extends Controller
{
    public function show(Request $request)
    {
        $user = Auth::guard('applicant')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $detail = ApplicantQualificationDetail::firstOrNew([
            'applicant_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'data' => $detail,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::guard('applicant')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'relevant_qualification' => 'required|string|max:255',
            'main_subjects' => 'nullable|string|max:500',
            'year_of_passing' => 'required|integer|min:1900|max:2100',
            'division' => 'required|string|max:100',
            'percent_marks' => 'required|numeric|min:0|max:100',
            'board_code' => 'required|string|max:100',
            'board_roll_number' => 'nullable|string|max:255',
            'nad_username' => 'nullable|string|max:255',
            'nad_certificate_id' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $detail = ApplicantQualificationDetail::updateOrCreate(
            ['applicant_id' => $user->id],
            array_merge($data, [
                'applicant_id' => $user->id,
            ])
        );

        return response()->json([
            'success' => true,
            'message' => 'Qualification details saved successfully.',
            'data' => $detail,
            'redirect_to' => url('/applicant/qualification/summary'),
        ]);
    }
}

