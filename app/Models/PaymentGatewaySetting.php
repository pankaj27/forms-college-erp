<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentGatewaySetting extends Model
{
    use HasFactory;

    protected $table = 'payment_gateway_settings';

    protected $fillable = [
        'institute_id',
        'gateway',
        'mode',
        'is_active',
        'config'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'config' => 'array'
    ];
}
