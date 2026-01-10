<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmissionFormField extends Model
{
    protected $fillable = [
        'admission_form_id',
        'section_id',
        'field_type',
        'label',
        'name',
        'placeholder',
        'options',
        'is_required',
        'grid_width',
        'order',
        'validation_rules',
    ];

    protected $casts = [
        'options' => 'array',
        'validation_rules' => 'array',
        'is_required' => 'boolean',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(AdmissionForm::class, 'admission_form_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(AdmissionFormSection::class, 'section_id');
    }
}
