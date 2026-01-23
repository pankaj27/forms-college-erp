<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantUpload extends Model
{
    protected $fillable = [
        'applicant_id',
        'document_type',
        'file_path',
        'original_name',
        'mime_type',
        'file_size',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
