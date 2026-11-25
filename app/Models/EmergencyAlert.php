<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmergencyAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'alert_type',
        'latitude',
        'longitude',
        'is_resolved',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'is_resolved' => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }
}
