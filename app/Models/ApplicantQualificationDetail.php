<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantQualificationDetail extends Model
{
    protected $fillable = [
        'applicant_id',
        'relevant_qualification',
        'main_subjects',
        'year_of_passing',
        'division',
        'percent_marks',
        'board_code',
        'board_roll_number',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id');
    }
}

