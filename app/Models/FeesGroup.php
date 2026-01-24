<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeesGroup extends Model
{
    use HasFactory;

    protected $table = 'fees_groups';

    protected $fillable = [
        'name',
        'description',
        'total_amount',
        'institute_id',
        'branch_id',
        'programe_id',
        'start_date',
        'due_date',
        'is_active'
    ];

    public function feesGroupMasters()
    {
        return $this->hasMany(FeesGroupMaster::class, 'fees_group_id');
    }

    public function feesMasters()
    {
        return $this->belongsToMany(FeesMaster::class, 'fees_group_masters', 'fees_group_id', 'fees_master_id');
    }
}
