<?php

namespace App\Http\Controllers;

use App\Models\AdmissionPayment;
use App\Models\Applicant;
use App\Models\FinalRegistration;
use App\Models\PaymentGatewaySetting;
use App\Mail\RegistrationSuccess;
use App\Mail\PaymentVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class ApplicantPaymentController extends Controller
{
    public function submitBankTransfer(Request $request)
    {
        $user = Auth::guard('applicant')->user();

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric',
            'transaction_id' => 'required|string',
            'bank_name' => 'required|string',
            'transaction_date' => 'required|date',
            'proof_document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Upload Proof
        $path = null;
        if ($request->hasFile('proof_document')) {
            $file = $request->file('proof_document');
            $filename = 'proof_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('payment_proofs', $filename, 'public');
        }

        // Snapshot Logic
        $applicant = Applicant::with([
            'personalDetails', 
            'programmeDetails', 
            'qualificationDetails', 
            'correspondenceDetails', 
            'uploads'
        ])->find($user->id);

        // Fetch Institute and Branch details
        $instituteId = null;
        $branchId = null;
        
        if ($applicant->programmeDetails) {
            if ($applicant->programmeDetails->region_code) {
                $branchId = $applicant->programmeDetails->region_code;
                $institute = DB::table('institute_branches')
                    ->where('id', $branchId)
                    ->first();
                if ($institute) {
                    $instituteId = $institute->institute_id;
                }
            }
        }

        // Create Final Registration
        FinalRegistration::create([
            'applicant_id' => $user->id,
            'institute_id' => $instituteId,
            'branch_id' => $branchId,
            'payment_method' => 'bank_transfer',
            'payment_status' => 'pending',
            'amount' => $request->amount,
            'transaction_id' => $request->transaction_id,
            'bank_name' => $request->bank_name,
            'transaction_date' => $request->transaction_date,
            'proof_document' => $path,
            'application_snapshot' => $applicant->toArray(),
        ]);

        // Create Admission Payment Record
        AdmissionPayment::create([
            'institute_id' => $instituteId,
            'branch_id' => $branchId,
            'applicant_id' => $user->id,
            'payment_group' => 'Online Admission',
            'pay_receiving_amount' => $request->amount,
            'transaction_date' => $request->transaction_date,
            'transaction_id' => $request->transaction_id,
            'bank_name' => $request->bank_name,
            'bank_branch_name' => null, // Assuming this is not captured in form currently, or we can use bank_name as well if needed, but keeping it null if not explicit
            'payment_mode' => 'Bank Transfer',
            'payment_proof' => $path,
            'status' => 'pending',
        ]);

        // Update User Status
        $user->status = 'Registered';
        $user->save();

        // Send Email
        try {
            Mail::to($user->email)->send(new PaymentVerification($applicant));
        } catch (\Exception $e) {
            \Log::error('Failed to send payment verification email: ' . $e->getMessage());
        }

        return response()->json(['success' => true, 'message' => 'Payment details submitted successfully.']);
    }

    public function processGatewayPayment(Request $request)
    {
        $user = Auth::guard('applicant')->user();

        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric',
            'transaction_id' => 'required|string',
            'payment_method' => 'required|string', // e.g., 'razorpay', 'stripe'
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Snapshot Logic
        $applicant = Applicant::with([
            'personalDetails', 
            'programmeDetails', 
            'qualificationDetails', 
            'correspondenceDetails', 
            'uploads'
        ])->find($user->id);

        // Fetch Institute and Branch details
        $instituteId = null;
        $branchId = null;
        
        if ($applicant->programmeDetails) {
            if ($applicant->programmeDetails->region_code) {
                $branchId = $applicant->programmeDetails->region_code;
                $institute = DB::table('institute_branches')
                    ->where('id', $branchId)
                    ->first();
                if ($institute) {
                    $instituteId = $institute->institute_id;
                }
            }
        }

        // Create Final Registration
        FinalRegistration::create([
            'applicant_id' => $user->id,
            'institute_id' => $instituteId,
            'branch_id' => $branchId,
            'payment_method' => $request->payment_method, // e.g. 'gateway' or specific gateway name
            'payment_status' => 'completed',
            'amount' => $request->amount,
            'transaction_id' => $request->transaction_id,
            'application_snapshot' => $applicant->toArray(),
        ]);

        // Create Admission Payment Record
        AdmissionPayment::create([
            'institute_id' => $instituteId,
            'branch_id' => $branchId,
            'applicant_id' => $user->id,
            'payment_group' => 'Online Admission',
            'pay_receiving_amount' => $request->amount,
            'transaction_date' => now(), // Gateway payments are immediate
            'transaction_id' => $request->transaction_id,
            'bank_name' => null, // Online payment usually doesn't capture this unless specific
            'bank_branch_name' => null,
            'payment_mode' => 'Online', // Generalizing for gateway
            'payment_proof' => null,
            'status' => 'verified', // Gateway payments are verified immediately upon success
        ]);

        // Update User Status
        $user->status = 'Registered';
        $user->save();

        // Send Email
        try {
            Mail::to($user->email)->send(new RegistrationSuccess($applicant));
        } catch (\Exception $e) {
            \Log::error('Failed to send registration success email: ' . $e->getMessage());
        }

        return response()->json(['success' => true, 'message' => 'Payment successful. Registration complete.']);
    }

    public function createCashfreeOrder(Request $request)
    {
        $user = Auth::guard('applicant')->user();
        
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $gatewayConfig = $this->getGatewayConfig('cashfree');

        if (!$gatewayConfig || empty($gatewayConfig['app_id']) || empty($gatewayConfig['secret_key'])) {
             return response()->json(['success' => false, 'message' => 'Cashfree Credentials are not configured in settings.'], 500);
        }

        $appId = trim($gatewayConfig['app_id']);
        $secretKey = trim($gatewayConfig['secret_key']);
        $baseUrl = $gatewayConfig['url'];
        $mode = $gatewayConfig['mode'];

        $orderId = 'ORDER_' . $user->id . '_' . time();
        $amount = $request->amount;
        
        // Ensure customer info is available
        // Load relationship if not already loaded
        if (!$user->relationLoaded('personalDetails')) {
            $user->load('personalDetails');
        }

        $customerName = $user->personalDetails->apar_name ?? 'Applicant';
        // Clean phone number (remove special chars)
        $customerPhone = preg_replace('/[^0-9]/', '', $user->mobile);
        if (strlen($customerPhone) > 10) {
            $customerPhone = substr($customerPhone, -10);
        }
        if (empty($customerPhone)) {
             $customerPhone = '9999999999'; // Fallback for testing
        }
        
        try {
            $response = Http::withoutVerifying()->timeout(60)->withHeaders([
                'x-client-id' => $appId,
                'x-client-secret' => $secretKey,
                'x-api-version' => '2023-08-01',
                'Content-Type' => 'application/json'
            ])->post("$baseUrl/orders", [
                'order_id' => $orderId,
                'order_amount' => $amount,
                'order_currency' => 'INR',
                'customer_details' => [
                    'customer_id' => (string)$user->id,
                    'customer_email' => $user->email,
                    'customer_phone' => $customerPhone,
                    'customer_name' => $customerName
                ],
                'order_meta' => [
                    'return_url' => url("/applicant/fee?order_id={order_id}")
                ]
            ]);

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'payment_session_id' => $response->json()['payment_session_id'],
                    'order_id' => $orderId,
                    'mode' => $mode
                ]);
            } else {
                \Log::error('Cashfree Order Creation Failed: ' . $response->body());
                \Log::error('Using App ID: ' . substr($appId, 0, 5) . '... and Secret: ' . substr($secretKey, 0, 5) . '...');
                $errorDetails = $response->json();
                $errorMessage = $errorDetails['message'] ?? 'Failed to create order';
                return response()->json(['success' => false, 'message' => $errorMessage, 'details' => $errorDetails], 500);
            }
        } catch (\Exception $e) {
            \Log::error('Cashfree Order Creation Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error creating order: ' . $e->getMessage()], 500);
        }
    }

    public function verifyCashfreeOrder(Request $request)
    {
        $user = Auth::guard('applicant')->user();
        $orderId = $request->order_id;

        if (!$orderId) {
            return response()->json(['success' => false, 'message' => 'Order ID is required'], 400);
        }

        $gatewayConfig = $this->getGatewayConfig('cashfree');

        if (!$gatewayConfig || empty($gatewayConfig['app_id']) || empty($gatewayConfig['secret_key'])) {
             return response()->json(['success' => false, 'message' => 'Cashfree Credentials are not configured in settings.'], 500);
        }

        $appId = $gatewayConfig['app_id'];
        $secretKey = $gatewayConfig['secret_key'];
        $baseUrl = $gatewayConfig['url'];

        try {
            $response = Http::withoutVerifying()->timeout(60)->withHeaders([
                'x-client-id' => $appId,
                'x-client-secret' => $secretKey,
                'x-api-version' => '2023-08-01',
                'Content-Type' => 'application/json'
            ])->get("$baseUrl/orders/$orderId");

            if ($response->successful()) {
                $orderData = $response->json();
                
                if ($orderData['order_status'] === 'PAID') {
                    // Check if already registered to avoid duplicates
                    $existingReg = FinalRegistration::where('transaction_id', $orderId)->first();
                    if ($existingReg) {
                        return response()->json(['success' => true, 'message' => 'Payment already processed.']);
                    }

                    // Snapshot Logic
                    $applicant = Applicant::with([
                        'personalDetails', 
                        'programmeDetails', 
                        'qualificationDetails', 
                        'correspondenceDetails', 
                        'uploads'
                    ])->find($user->id);

                    // Create Final Registration
                    FinalRegistration::create([
                        'applicant_id' => $user->id,
                        'payment_method' => 'cashfree',
                        'payment_status' => 'completed',
                        'amount' => $orderData['order_amount'],
                        'transaction_id' => $orderId,
                        'application_snapshot' => $applicant->toArray(),
                    ]);

                    // Update User Status
                    $user->status = 'Registered';
                    $user->save();

                    // Send Email
                    try {
                        Mail::to($user->email)->send(new RegistrationSuccess($applicant));
                    } catch (\Exception $e) {
                        \Log::error('Failed to send registration success email: ' . $e->getMessage());
                    }

                    return response()->json(['success' => true, 'message' => 'Payment verified and registration complete.']);
                } else {
                    return response()->json(['success' => false, 'message' => 'Payment not completed. Status: ' . $orderData['order_status']]);
                }
            } else {
                return response()->json(['success' => false, 'message' => 'Failed to verify payment', 'details' => $response->json()], 500);
            }
        } catch (\Exception $e) {
            \Log::error('Cashfree Verification Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error verifying payment: ' . $e->getMessage()], 500);
        }
    }

    public function getActiveGateways()
    {
        $gateways = [];
        $bankDetails = null;
        $settings = PaymentGatewaySetting::where('is_active', true)->get();

        foreach ($settings as $setting) {
            if ($setting->gateway === 'cashfree') {
                $config = $this->getGatewayConfig('cashfree');
                if ($config && !empty($config['app_id']) && !empty($config['secret_key'])) {
                     $gateways[] = [
                        'id' => 'cashfree',
                        'name' => 'Cashfree Payments',
                        'icon' => 'https://avatars.githubusercontent.com/u/13360431?s=200&v=4'
                    ];
                }
            } elseif ($setting->gateway === 'bank_transfer') {
                $bankDetails = $setting->config;
            }
            // Add other gateways checks here if needed
        }

        return response()->json([
            'success' => true,
            'gateways' => $gateways,
            'bank_details' => $bankDetails
        ]);
    }

    public function history()
    {
        $user = Auth::guard('applicant')->user();
        
        $transactions = FinalRegistration::where('applicant_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'transactions' => $transactions
        ]);
    }

    private function getGatewayConfig($gatewayName)
    {
        $setting = PaymentGatewaySetting::where('gateway', $gatewayName)->where('is_active', true)->first();
        
        if (!$setting) {
            return null;
        }

        $config = $setting->config; // casted to array
        $mode = $setting->mode; // 'test' or 'live'

        if ($mode === 'test') {
            return [
                'app_id' => $config['test_app_id'] ?? null,
                'secret_key' => $config['test_secret_key'] ?? null,
                'url' => 'https://sandbox.cashfree.com/pg',
                'mode' => 'sandbox'
            ];
        } else {
            return [
                'app_id' => $config['live_app_id'] ?? null,
                'secret_key' => $config['live_secret_key'] ?? null,
                'url' => 'https://api.cashfree.com/pg',
                'mode' => 'production'
            ];
        }
    }
}
