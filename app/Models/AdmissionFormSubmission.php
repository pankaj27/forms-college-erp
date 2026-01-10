<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AdmissionFormSubmission extends Model
{
    protected $fillable = [
        'admission_form_id',
        'data',
        'status',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(AdmissionForm::class, 'admission_form_id');
    }
}
