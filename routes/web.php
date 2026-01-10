<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DynamicFormController;

Route::get('/', function () {
    return view('welcome');
});

// View route - handled by React Router (via welcome blade)
Route::get('/forms/{short_code}', function () {
    return view('welcome');
})->name('forms.show');

// API routes (used by React)
Route::get('/api/forms/{short_code}', [DynamicFormController::class, 'getFormDetails']);
Route::post('/api/forms/{short_code}', [DynamicFormController::class, 'submit']);
