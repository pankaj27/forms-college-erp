<?php

namespace App\Http\Controllers;

use App\Models\PostOfficeMaster;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostOfficeController extends Controller
{
    public function getByPincode($pincode)
    {
        $validator = Validator::make(['pincode' => $pincode], [
            'pincode' => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid pincode format',
                'errors' => $validator->errors()
            ], 422);
        }

        $postOffices = PostOfficeMaster::where('pincode', $pincode)->get();

        return response()->json([
            'success' => true,
            'data' => $postOffices
        ]);
    }
}
