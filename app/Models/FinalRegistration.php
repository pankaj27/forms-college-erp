<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FinalRegistration extends Model
{
    use HasFactory;

    protected $fillable = [
        'applicant_id',
        'institute_id',
        'branch_id',
        'payment_method',
        'payment_status',
        'amount',
        'transaction_id',
        'bank_name',
        'transaction_date',
        'proof_document',
        'application_snapshot',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'application_snapshot' => 'array',
    ];

    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }
}
