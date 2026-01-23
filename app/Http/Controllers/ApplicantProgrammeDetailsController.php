<?php

namespace App\Http\Controllers;

use App\Models\ApplicantProgrammeDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ApplicantProgrammeDetailsController extends Controller
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

        $detail = ApplicantProgrammeDetail::firstOrNew([
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

        // Prevent editing if submitted
        if (in_array($user->status, ['submitted', 'approved'])) {
            return response()->json([
                'success' => false,
                'message' => 'Application is already submitted and cannot be edited.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'programme_type' => 'required|string|max:100',
            'mode_of_study' => 'required|string|max:100',
            'programme_enrollment' => 'required|string|max:255',
            'region_code' => 'required|string|max:100',
            'study_center_code' => 'required|string|max:100',
            'medium' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $detail = ApplicantProgrammeDetail::updateOrCreate(
            ['applicant_id' => $user->id],
            array_merge($data, [
                'applicant_id' => $user->id,
            ])
        );

        return response()->json([
            'success' => true,
            'message' => 'Programme details saved successfully.',
            'data' => $detail,
            'redirect_to' => url('/applicant/programme/summary'),
        ]);
    }

    public function branches(Request $request)
    {
        $user = Auth::guard('applicant')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $branches = DB::table('institute_branches')
            ->select('id', 'branch_name as name', 'branch_code as code')
            ->orderBy('branch_name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $branches,
        ]);
    }
}
