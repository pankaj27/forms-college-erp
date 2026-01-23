<?php

namespace App\Http\Controllers;

use App\Models\ApplicantCorrespondenceDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ApplicantCorrespondenceDetailsController extends Controller
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

        $detail = ApplicantCorrespondenceDetail::firstOrNew([
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
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'pincode' => 'required|string|max:10',
            'post_office' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $detail = ApplicantCorrespondenceDetail::updateOrCreate(
            ['applicant_id' => $user->id],
            array_merge($data, [
                'applicant_id' => $user->id,
            ])
        );

        return response()->json([
            'success' => true,
            'message' => 'Correspondence details saved successfully.',
            'data' => $detail,
            'redirect_to' => url('/applicant/uploads'),
        ]);
    }
}
