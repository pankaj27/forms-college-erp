<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeesMaster extends Model
{
    use HasFactory;

    protected $table = 'fees_masters';

    protected $fillable = [
        'institute_id',
        'branch_id',
        'programe_id',
        'fees_head_id',
        'amount',
        'description'
    ];

    public function feesHead()
    {
        return $this->belongsTo(FeesHead::class, 'fees_head_id');
    }

    public function feesGroupMasters()
    {
        return $this->hasMany(FeesGroupMaster::class, 'fees_master_id');
    }
}
