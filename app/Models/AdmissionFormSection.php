<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmissionFormSection extends Model
{
    protected $fillable = [
        'admission_form_id',
        'title',
        'order',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(AdmissionForm::class, 'admission_form_id');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(AdmissionFormField::class, 'section_id')->orderBy('order');
    }
}
