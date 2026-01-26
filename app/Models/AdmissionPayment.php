<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdmissionPayment extends Model
{
    protected $fillable = [
        'institute_id',
        'branch_id',
        'applicant_id',
        'payment_group',
        'pay_receiving_amount',
        'transaction_date',
        'transaction_id',
        'bank_name',
        'bank_branch_name',
        'payment_mode',
        'payment_proof',
        'status',
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'pay_receiving_amount' => 'decimal:2',
    ];
}
