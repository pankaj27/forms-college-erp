<?php

namespace App\Http\Controllers;

use App\Models\Applicant;
use App\Mail\ApplicantRegistered;
use App\Mail\ApplicantOtp;
use App\Mail\ApplicantPasswordResetOtp;
use App\Mail\ApplicantUsernameReminder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;

class ApplicantAuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:3|max:50|unique:applicants,username',
            'email' => 'required|email|max:255|unique:applicants,email|confirmed',
            'password' => 'required|string|min:6|confirmed',
            'mobile' => 'required|string|regex:/^[0-9]{10}$/|confirmed|unique:applicants,mobile',
            'captcha' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $storedCaptcha = (string) $request->session()->get('captcha_code', '');
        $inputCaptcha = (string) $request->input('captcha');

        if (mb_strtolower($inputCaptcha) !== mb_strtolower($storedCaptcha)) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'captcha' => ['Invalid captcha entered.'],
                ],
            ], 422);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $applicant = Applicant::create([
            'username' => $request->input('username'),
            'email' => $request->input('email'),
            'mobile' => $request->input('mobile'),
            'password' => Hash::make($request->input('password')),
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(15),
        ]);

        try {
            Mail::to($applicant->email)->send(new ApplicantOtp($applicant));
        } catch (\Exception $e) {
        }

        $request->session()->forget('captcha_code');
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Registration successful. An OTP has been sent to your email for verification.',
            'redirect_to' => url('/auth/verify-otp'),
            'email' => $applicant->email,
            'otp_expires_at' => $applicant->otp_expires_at ? $applicant->otp_expires_at->toIso8601String() : null,
        ]);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'password' => 'required|string',
            'captcha' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $storedCaptcha = (string) $request->session()->get('captcha_code', '');
        $inputCaptcha = (string) $request->input('captcha');

        if (mb_strtolower($inputCaptcha) !== mb_strtolower($storedCaptcha)) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'captcha' => ['Invalid captcha entered.'],
                ],
            ], 422);
        }

        $applicant = Applicant::where('username', $request->input('username'))->first();

        if (!$applicant || !Hash::check($request->input('password'), $applicant->password)) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'username' => ['Invalid username or password.'],
                ],
            ], 422);
        }

        if (!$applicant->email_verified_at) {
            $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            $applicant->otp = $otp;
            $applicant->otp_expires_at = now()->addMinutes(15);
            $applicant->save();

            try {
                Mail::to($applicant->email)->send(new ApplicantOtp($applicant));
            } catch (\Exception $e) {
            }

            $request->session()->forget('captcha_code');
            $request->session()->regenerate();

            return response()->json([
                'success' => true,
                'requires_otp' => true,
                'message' => 'Your email is not verified. An OTP has been sent to your email for verification.',
                'redirect_to' => url('/auth/verify-otp'),
                'email' => $applicant->email,
                'otp_expires_at' => $applicant->otp_expires_at ? $applicant->otp_expires_at->toIso8601String() : null,
            ]);
        }

        $request->session()->forget('captcha_code');
        $request->session()->regenerate();

        Auth::guard('applicant')->login($applicant);

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'redirect_to' => url('/applicant/dashboard'),
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'captcha' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $storedCaptcha = (string) $request->session()->get('captcha_code', '');
        $inputCaptcha = (string) $request->input('captcha');

        if (mb_strtolower($inputCaptcha) !== mb_strtolower($storedCaptcha)) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'captcha' => ['Invalid captcha entered.'],
                ],
            ], 422);
        }

        $applicant = Applicant::where('email', $request->input('email'))->first();

        if (!$applicant) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'email' => ['Applicant not found for the provided email address.'],
                ],
            ], 422);
        }

        if (!$applicant->otp || !$applicant->otp_expires_at || now()->greaterThan($applicant->otp_expires_at)) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'otp' => ['The OTP has expired. Please register again or request a new OTP.'],
                ],
            ], 422);
        }

        if ($applicant->otp !== $request->input('otp')) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'otp' => ['The OTP entered is incorrect.'],
                ],
            ], 422);
        }

        $applicant->email_verified_at = now();
        $applicant->otp = null;
        $applicant->otp_expires_at = null;
        $applicant->save();

        $request->session()->forget('captcha_code');
        $request->session()->regenerate();

        $loginUrl = url('/auth/login');

        try {
            Mail::to($applicant->email)->send(new ApplicantRegistered($applicant, $loginUrl));
        } catch (\Exception $e) {
        }

        Auth::guard('applicant')->login($applicant);

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully.',
            'redirect_to' => url('/applicant/dashboard'),
        ]);
    }

    public function me(Request $request)
    {
        $user = Auth::guard('applicant')->user();

        if (!$user) {
            return response()->json([
                'authenticated' => false,
            ]);
        }

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'email' => $user->email,
                'mobile' => $user->mobile,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::guard('applicant')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
        ]);
    }

    public function requestPasswordResetOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string',
            'captcha' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $storedCaptcha = (string) $request->session()->get('captcha_code', '');
        $inputCaptcha = (string) $request->input('captcha');

        if (mb_strtolower($inputCaptcha) !== mb_strtolower($storedCaptcha)) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'captcha' => ['Invalid captcha entered.'],
                ],
            ], 422);
        }

        $applicant = Applicant::where('username', $request->input('username'))->first();

        if (!$applicant || !$applicant->email_verified_at) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'username' => ['No verified applicant found with this username.'],
                ],
            ], 422);
        }

        $otp = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $applicant->otp = $otp;
        $applicant->otp_expires_at = now()->addMinutes(15);
        $applicant->save();

        try {
            Mail::to($applicant->email)->send(new ApplicantPasswordResetOtp($applicant));
        } catch (\Exception $e) {
        }

        $request->session()->forget('captcha_code');
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'An OTP has been sent to your registered email address to reset your password.',
        ]);
    }

    public function requestUsernameReminder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'captcha' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $storedCaptcha = (string) $request->session()->get('captcha_code', '');
        $inputCaptcha = (string) $request->input('captcha');

        if (mb_strtolower($inputCaptcha) !== mb_strtolower($storedCaptcha)) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'captcha' => ['Invalid captcha entered.'],
                ],
            ], 422);
        }

        $applicant = Applicant::where('email', $request->input('email'))->first();

        if (!$applicant || !$applicant->email_verified_at) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'email' => ['No verified applicant found with this email address.'],
                ],
            ], 422);
        }

        try {
            Mail::to($applicant->email)->send(new ApplicantUsernameReminder($applicant));
        } catch (\Exception $e) {
        }

        $request->session()->forget('captcha_code');
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Your username has been sent to your registered email address.',
        ]);
    }

    public function resendRegistrationEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'captcha' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $storedCaptcha = (string) $request->session()->get('captcha_code', '');
        $inputCaptcha = (string) $request->input('captcha');

        if (mb_strtolower($inputCaptcha) !== mb_strtolower($storedCaptcha)) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'captcha' => ['Invalid captcha entered.'],
                ],
            ], 422);
        }

        $applicant = Applicant::where('email', $request->input('email'))->first();

        if (!$applicant || !$applicant->email_verified_at) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'email' => ['No verified applicant found with this email address.'],
                ],
            ], 422);
        }

        $loginUrl = url('/auth/login');

        try {
            Mail::to($applicant->email)->send(new ApplicantRegistered($applicant, $loginUrl));
        } catch (\Exception $e) {
        }

        $request->session()->forget('captcha_code');
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Registration confirmation email has been resent to your registered email address.',
        ]);
    }
}
