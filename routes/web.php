<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\DynamicFormController;
use App\Http\Controllers\CaptchaController;
use App\Http\Controllers\ApplicantAuthController;
use App\Http\Controllers\ApplicantPersonalDetailsController;
use App\Http\Controllers\ApplicantProgrammeDetailsController;
use App\Http\Controllers\ApplicantQualificationDetailsController;
use App\Http\Controllers\ApplicantCorrespondenceDetailsController;
use App\Http\Controllers\PostOfficeController;
use App\Http\Controllers\ApplicantUploadsController;
use App\Http\Controllers\ApplicantSubmissionController;

Route::get('/', function () {
    if (Auth::guard('applicant')->check()) {
        return redirect('/applicant/dashboard');
    }
    return view('welcome');
});

Route::get('/auth/login', function () {
    return view('welcome');
});

Route::get('/auth/register', function () {
    return view('welcome');
});

Route::get('/auth/verify-otp', function () {
    return view('welcome');
});

Route::get('/auth/forgot-password', function () {
    return view('welcome');
});

Route::get('/auth/forgot-username', function () {
    return view('welcome');
});

Route::get('/auth/resend-registration-email', function () {
    return view('welcome');
});

Route::get('/applicant/dashboard', function () {
    return view('welcome');
});

Route::get('/applicant/personal', function () {
    return view('welcome');
});

Route::get('/applicant/personal/summary', function () {
    return view('welcome');
});

Route::get('/applicant/programme', function () {
    return view('welcome');
});

Route::get('/applicant/programme/summary', function () {
    return view('welcome');
});

Route::get('/applicant/qualification', function () {
    return view('welcome');
});

Route::get('/applicant/qualification/summary', function () {
    return view('welcome');
});

Route::get('/applicant/correspondence', function () {
    return view('welcome');
});

Route::get('/applicant/correspondence/summary', function () {
    return view('welcome');
});

Route::get('/applicant/uploads', function () {
    return view('welcome');
});

Route::get('/applicant/uploads/summary', function () {
    return view('welcome');
});

Route::get('/applicant/preview', function () {
    return view('welcome');
});

Route::get('/applicant/fee', function () {
    return view('welcome');
});

Route::get('/forms/{short_code}', function () {
    return view('welcome');
})->name('forms.show');

Route::middleware('auth:applicant')->group(function () {
    Route::get('/api/forms/{short_code}', [DynamicFormController::class, 'getFormDetails']);
    Route::post('/api/forms/{short_code}', [DynamicFormController::class, 'submit']);
});

Route::prefix('api/applicants')->group(function () {
    Route::post('/register', [ApplicantAuthController::class, 'register']);
    Route::post('/login', [ApplicantAuthController::class, 'login']);
    Route::post('/verify-otp', [ApplicantAuthController::class, 'verifyOtp']);
    Route::post('/forgot-password', [ApplicantAuthController::class, 'requestPasswordResetOtp']);
    Route::post('/reset-password', [ApplicantAuthController::class, 'resetPassword']);
    Route::post('/forgot-username', [ApplicantAuthController::class, 'requestUsernameReminder']);
    Route::post('/resend-registration-email', [ApplicantAuthController::class, 'resendRegistrationEmail']);
    Route::middleware('auth:applicant')->group(function () {
        Route::get('/me', [ApplicantAuthController::class, 'me']);
        Route::post('/logout', [ApplicantAuthController::class, 'logout']);
        Route::get('/personal-details', [ApplicantPersonalDetailsController::class, 'show']);
        Route::post('/personal-details', [ApplicantPersonalDetailsController::class, 'store']);
        Route::get('/programme-details', [ApplicantProgrammeDetailsController::class, 'show']);
        Route::post('/programme-details', [ApplicantProgrammeDetailsController::class, 'store']);
        Route::get('/qualification-details', [ApplicantQualificationDetailsController::class, 'show']);
        Route::post('/qualification-details', [ApplicantQualificationDetailsController::class, 'store']);
        Route::get('/qualification-details/boards', [ApplicantQualificationDetailsController::class, 'getBoards']);
        Route::get('/correspondence-details', [ApplicantCorrespondenceDetailsController::class, 'show']);
        Route::post('/correspondence-details', [ApplicantCorrespondenceDetailsController::class, 'store']);
        Route::get('/post-offices/{pincode}', [PostOfficeController::class, 'getByPincode']);
        Route::get('/uploads', [ApplicantUploadsController::class, 'index']);
        Route::post('/uploads', [ApplicantUploadsController::class, 'store']);
        Route::delete('/uploads/{document_type}', [ApplicantUploadsController::class, 'destroy']);
        Route::get('/branches', [ApplicantProgrammeDetailsController::class, 'branches']);
        Route::post('/submit', [ApplicantSubmissionController::class, 'submit']);
    });
});

Route::get('/captcha', [CaptchaController::class, 'image'])->name('captcha.image');

// Route::get('/dashboard', function () {
//     return view('dashboard');
// })->middleware(['auth'])->name('dashboard');
