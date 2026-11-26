<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AttendanceLog extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
        'check_in_timestamp' => 'datetime',
        'check_out_timestamp' => 'datetime',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id')->withTrashed();
    }
}
