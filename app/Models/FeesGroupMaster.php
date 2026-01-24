<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeesGroupMaster extends Model
{
    use HasFactory;

    protected $table = 'fees_group_masters';

    protected $fillable = [
        'fees_group_id',
        'fees_master_id'
    ];

    public function feesGroup()
    {
        return $this->belongsTo(FeesGroup::class, 'fees_group_id');
    }

    public function feesMaster()
    {
        return $this->belongsTo(FeesMaster::class, 'fees_master_id');
    }
}
