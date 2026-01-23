<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Applicant extends Authenticatable
{
    use HasFactory;
    use Notifiable;

    protected $table = 'applicants';

    protected $fillable = [
        'username',
        'email',
        'email_verified_at',
        'mobile',
        'password',
        'otp',
        'otp_expires_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires_at' => 'datetime',
    ];

    public function personalDetails()
    {
        return $this->hasOne(ApplicantPersonalDetail::class);
    }

    public function programmeDetails()
    {
        return $this->hasOne(ApplicantProgrammeDetail::class);
    }

    public function qualificationDetails()
    {
        return $this->hasOne(ApplicantQualificationDetail::class);
    }

    public function correspondenceDetails()
    {
        return $this->hasOne(ApplicantCorrespondenceDetail::class);
    }

    public function uploads()
    {
        return $this->hasMany(ApplicantUpload::class);
    }
}
