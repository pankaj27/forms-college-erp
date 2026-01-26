<?php

namespace App\Http\Controllers;

use App\Models\ApplicantQualificationDetail;
use App\Models\ApplicantPersonalDetail;
use App\Models\BoardMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ApplicantQualificationDetailsController extends Controller
{
    public function getBoards(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'programe_level' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $boards = BoardMaster::where('programe_level', $request->programe_level)
            ->where('is_active', true)
            ->get(['name', 'code']);

        return response()->json([
            'success' => true,
            'data' => $boards,
        ]);
    }

    public function show(Request $request)
    {
        $user = Auth::guard('applicant')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $qualifications = ApplicantQualificationDetail::where('applicant_id', $user->id)->get();
        $personalDetail = ApplicantPersonalDetail::where('applicant_id', $user->id)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'qualifications' => $qualifications,
                'nad_username' => $personalDetail ? $personalDetail->nad_username : '',
                'nad_certificate_id' => $personalDetail ? $personalDetail->nad_certificate_id : '',
            ],
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
            'qualifications' => 'required|array|min:1',
            'qualifications.*.relevant_qualification' => 'required|string|max:255',
            'qualifications.*.main_subjects' => 'nullable|string|max:500',
            'qualifications.*.year_of_passing' => 'required|integer|min:1900|max:2100',
            'qualifications.*.division' => 'required|string|max:100',
            'qualifications.*.percent_marks' => 'required|numeric|min:0|max:100',
            'qualifications.*.board_code' => 'required|string|max:100',
            'qualifications.*.board_roll_number' => 'nullable|string|max:255',
            'nad_username' => 'nullable|string|max:255',
            'nad_certificate_id' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            DB::beginTransaction();

            $data = $validator->validated();

            // Save NAD details to Personal Details
            ApplicantPersonalDetail::updateOrCreate(
                ['applicant_id' => $user->id],
                [
                    'nad_username' => $data['nad_username'] ?? null,
                    'nad_certificate_id' => $data['nad_certificate_id'] ?? null,
                ]
            );

            // Delete existing qualifications and insert new ones
            ApplicantQualificationDetail::where('applicant_id', $user->id)->delete();

            foreach ($data['qualifications'] as $qual) {
                ApplicantQualificationDetail::create([
                    'applicant_id' => $user->id,
                    'relevant_qualification' => $qual['relevant_qualification'],
                    'main_subjects' => $qual['main_subjects'] ?? null,
                    'year_of_passing' => $qual['year_of_passing'],
                    'division' => $qual['division'],
                    'percent_marks' => $qual['percent_marks'],
                    'board_code' => $qual['board_code'],
                    'board_roll_number' => $qual['board_roll_number'] ?? null,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Qualification details saved successfully.',
                'redirect_to' => '/applicant/qualification/summary',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while saving details. Please try again.',
                'debug_message' => $e->getMessage(),
            ], 500);
        }
    }
}

