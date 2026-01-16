<?php

namespace App\Http\Controllers;

use App\Models\ApplicantPersonalDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ApplicantPersonalDetailsController extends Controller
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

        $detail = ApplicantPersonalDetail::firstOrNew([
            'applicant_id' => $user->id,
        ]);

        if (!$detail->email) {
            $detail->email = $user->email;
        }

        if (!$detail->mobile) {
            $detail->mobile = $user->mobile;
        }

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
            'apar_id' => 'nullable|string|max:50',
            'apar_name' => 'nullable|string|max:255',
            'apar_gender' => 'nullable|string|max:50',
            'apar_dob' => 'nullable|date',
            'certificate_name' => 'nullable|string|max:255',
            'certificate_gender' => 'nullable|string|max:50',
            'certificate_dob' => 'nullable|date',
            'mother_name' => 'required|string|max:255',
            'guardian_relation' => 'required|string|max:100',
            'guardian_name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'citizenship_country' => 'nullable|string|max:100',
            'territory_area' => 'required|string|max:100',
            'minority' => 'required|string|max:100',
            'religion' => 'required|string|max:100',
            'marital_status' => 'required|string|max:100',
            'social_status' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'alternate_email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'alternate_mobile' => 'nullable|string|max:20',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        $detail = ApplicantPersonalDetail::updateOrCreate(
            ['applicant_id' => $user->id],
            array_merge($data, [
                'applicant_id' => $user->id,
            ])
        );

        return response()->json([
            'success' => true,
            'message' => 'Personal details saved successfully.',
            'data' => $detail,
            'redirect_to' => url('/applicant/personal/summary'),
        ]);
    }
}
