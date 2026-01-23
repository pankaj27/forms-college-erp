<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostOfficeMaster extends Model
{
    protected $fillable = [
        'pincode',
        'post_office_name',
        'address',
        'location',
    ];
}
