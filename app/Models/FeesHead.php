<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeesHead extends Model
{
    use HasFactory;

    protected $table = 'fees_heads';

    protected $fillable = [
        'name',
        'institute_id',
        'branch_id',
        'fees_term_id'
    ];
}
