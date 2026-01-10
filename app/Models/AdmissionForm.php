<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmissionForm extends Model
{
    protected $fillable = [
        'institute_id',
        'branch_id',
        'academic_session_id',
        'title',
        'description',
        'uuid',
        'short_code',
        'opening_date',
        'opening_time',
        'closing_date',
        'closing_time',
        'late_fee_closing_date',
        'late_fee_closing_time',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'opening_date' => 'date',
        'closing_date' => 'date',
        'late_fee_closing_date' => 'date',
    ];

    public function sections(): HasMany
    {
        return $this->hasMany(AdmissionFormSection::class)->orderBy('order');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(AdmissionFormField::class)->orderBy('order');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(AdmissionFormSubmission::class);
    }
}
