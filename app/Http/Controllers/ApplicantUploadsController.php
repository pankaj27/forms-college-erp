<?php

namespace App\Http\Controllers;

use App\Models\ApplicantUpload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class ApplicantUploadsController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::guard('applicant')->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Authentication required.',
            ], 401);
        }

        $uploads = ApplicantUpload::where('applicant_id', $user->id)->get();
        
        $mappedUploads = $uploads->mapWithKeys(function ($item) {
            return [$item->document_type => [
                'id' => $item->id,
                'original_name' => $item->original_name,
                'file_size' => $item->file_size,
                'uploaded_at' => $item->created_at,
                'url' => Storage::url($item->file_path),
            ]];
        });

        return response()->json([
            'success' => true,
            'data' => $mappedUploads,
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
            'document_type' => 'required|string',
            'file' => 'required|file|max:2048', // 2MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $documentType = $request->input('document_type');
        $file = $request->file('file');

        // Validation for specific types can be added here
        // e.g., Photo/Signature: jpg, jpeg only, max 100KB
        // e.g., Marksheets: jpg, jpeg, pdf, max 200KB

        $extension = $file->getClientOriginalExtension();
        $fileName = $user->id . '_' . $documentType . '_' . time() . '.' . $extension;
        $path = $file->storeAs('uploads/applicants/' . $user->id, $fileName, 'public');

        // AI Verification for Photo and Signature
        if (in_array($documentType, ['photo', 'signature'])) {
            $absolutePath = storage_path('app/public/' . $path);
            $scriptPath = base_path('app/Scripts/verify_image.py');
            
            // Using python to run the verification script
            // Ensure python is in your system PATH or provide absolute path to python executable
            $cmd = "python \"$scriptPath\" \"$absolutePath\" \"$documentType\"";
            $output = shell_exec($cmd);
            $result = json_decode($output, true);
            
            if (!$result || !isset($result['success']) || !$result['success']) {
                // Delete the file if verification fails
                Storage::disk('public')->delete($path);
                
                return response()->json([
                    'success' => false,
                    'message' => $result['message'] ?? 'Image verification failed. Please upload a valid image.',
                    'errors' => ['file' => [$result['message'] ?? 'Image verification failed.']]
                ], 422);
            }
        }

        $upload = ApplicantUpload::updateOrCreate(
            [
                'applicant_id' => $user->id,
                'document_type' => $documentType,
            ],
            [
                'file_path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
            ]
        );

        $this->updateProgress($user);

        return response()->json([
            'success' => true,
            'message' => 'File uploaded successfully.',
            'data' => [
                'document_type' => $documentType,
                'id' => $upload->id,
                'original_name' => $upload->original_name,
                'url' => Storage::url($path),
            ],
        ]);
    }

    public function destroy(Request $request, $document_type)
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

        $upload = ApplicantUpload::where('applicant_id', $user->id)
            ->where('document_type', $document_type)
            ->first();

        if (!$upload) {
            return response()->json([
                'success' => false,
                'message' => 'File not found.',
            ], 404);
        }

        Storage::disk('public')->delete($upload->file_path);
        $upload->delete();

        $this->updateProgress($user);

        return response()->json([
            'success' => true,
            'message' => 'File deleted successfully.',
        ]);
    }

    private function updateProgress($user)
    {
        $required = ['photo', 'signature'];
        $uploaded = ApplicantUpload::where('applicant_id', $user->id)
            ->whereIn('document_type', $required)
            ->pluck('document_type')
            ->toArray();
            
        $hasAll = count(array_intersect($required, $uploaded)) === count($required);
        
        $progress = $user->progress ?? [];
        $progress['uploads'] = $hasAll;
        $user->progress = $progress;
        $user->save();
    }
}
