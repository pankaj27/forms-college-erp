<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApplicantProgrammeDetail extends Model
{
    use HasFactory;

    protected $table = 'applicant_programme_details';

    protected $fillable = [
        'applicant_id',
        'programme_type',
        'mode_of_study',
        'programme_enrollment',
        'region_code',
        'study_center_code',
        'medium',
        'is_existing_student',
    ];
}

