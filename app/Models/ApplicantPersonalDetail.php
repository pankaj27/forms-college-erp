<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantPersonalDetail extends Model
{
    protected $fillable = [
        'applicant_id',
        'apar_id',
        'apar_name',
        'apar_gender',
        'apar_dob',
        'certificate_name',
        'certificate_gender',
        'certificate_dob',
        'mother_name',
        'guardian_relation',
        'guardian_name',
        'category',
        'citizenship_country',
        'territory_area',
        'minority',
        'religion',
        'marital_status',
        'social_status',
        'email',
        'alternate_email',
        'mobile',
        'alternate_mobile',
        'nad_username',
        'nad_certificate_id',
    ];

    protected $casts = [
        'apar_dob' => 'date:Y-m-d',
        'certificate_dob' => 'date:Y-m-d',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id');
    }
}
