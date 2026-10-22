<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'code',
        'industry',
        'email',
        'phone',
        'address',
        'logo',
        'plan',
        'status',
        'max_employees',
        'subscription_expires_at',
        'settings',
    ];

    protected $casts = [
        'subscription_expires_at' => 'date',
        'settings' => 'array',
        'max_employees' => 'integer',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function employees()
    {
        return $this->hasMany(User::class)->where('role', 'employee');
    }

    public function admins()
    {
        return $this->hasMany(User::class)->where('role', 'admin');
    }

    public function farmers()
    {
        return $this->hasMany(User::class)->where('role', 'farmer');
    }

    public function visits()
    {
        return $this->hasManyThrough(FarmerVisit::class, User::class, 'company_id', 'employee_id');
    }

    public function attendanceLogs()
    {
        return $this->hasManyThrough(AttendanceLog::class, User::class, 'company_id', 'employee_id');
    }

    public function payments()
    {
        return $this->hasManyThrough(Payment::class, User::class, 'company_id', 'employee_id');
    }

    public function trackingSessions()
    {
        return $this->hasManyThrough(TrackingSession::class, User::class, 'company_id', 'employee_id');
    }
}
