<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantCorrespondenceDetail extends Model
{
    protected $fillable = [
        'applicant_id',
        'address_line_1',
        'address_line_2',
        'city',
        'pincode',
        'post_office',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class, 'applicant_id');
    }
}
