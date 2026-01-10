<?php

namespace App\Http\Controllers;

use App\Models\AdmissionForm;
use App\Models\AdmissionFormSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DynamicFormController extends Controller
{
    public function getFormDetails($short_code)
    {
        $form = AdmissionForm::where('short_code', $short_code)
            ->where('is_active', true)
            ->with(['sections.fields' => function ($query) {
                $query->orderBy('order');
            }])
            ->firstOrFail();

        return response()->json($form);
    }

    public function submit(Request $request, $short_code)
    {
        $form = AdmissionForm::where('short_code', $short_code)
            ->where('is_active', true)
            ->with('fields')
            ->firstOrFail();

        // Build validation rules
        $rules = [];
        foreach ($form->fields as $field) {
            if ($field->is_required) {
                $rules[$field->name] = 'required';
            }
            if (!empty($field->validation_rules)) {
                 $extraRules = $field->validation_rules;
                 if (is_array($extraRules)) {
                     if (isset($rules[$field->name])) {
                        $rules[$field->name] = is_array($rules[$field->name]) 
                            ? array_merge($rules[$field->name], $extraRules) 
                            : array_merge([$rules[$field->name]], $extraRules);
                     } else {
                        $rules[$field->name] = $extraRules;
                     }
                 }
            }
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->except(['_token']);

        // Handle file uploads
        foreach ($form->fields as $field) {
            if ($field->field_type === 'file' && $request->hasFile($field->name)) {
                $file = $request->file($field->name);
                $path = $file->store('admission_uploads', 'public');
                $data[$field->name] = $path;
            }
        }

        // Store submission
        AdmissionFormSubmission::create([
            'admission_form_id' => $form->id,
            'data' => $data,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Form submitted successfully!'
        ]);
    }
}
