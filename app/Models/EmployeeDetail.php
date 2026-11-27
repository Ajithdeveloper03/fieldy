<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmployeeDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'employee_code',
        'emergency_phone',
        'assigned_region',
        'photo_path',
    ];

    protected $hidden = ['photo_path'];

    public function photoVersion(): ?string
    {
        return $this->photo_path ? basename($this->photo_path) : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
