<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BoardMaster extends Model
{
    use HasFactory;

    protected $fillable = [
        'institute_id',
        'branch_id',
        'name',
        'code',
        'course_level',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];
}
