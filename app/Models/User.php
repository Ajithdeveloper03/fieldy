<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'company_id',
        'name',
        'email',
        'phone',
        'password',
        'role',
        'status',
        'fcm_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // ─── Relations ────────────────────────────────────────────────────────────

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function isSuperAdmin(): bool
    {
        return $this->role === 'superadmin';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function locationLogs()
    {
        return $this->hasMany(LocationLog::class, 'employee_id');
    }

    public function trackingSessions()
    {
        return $this->hasMany(TrackingSession::class, 'employee_id');
    }

    public function locationPoints()
    {
        return $this->hasMany(LocationPoint::class, 'employee_id');
    }

    public function attendanceLogs()
    {
        return $this->hasMany(AttendanceLog::class, 'employee_id');
    }

    public function farmerVisits()
    {
        return $this->hasMany(FarmerVisit::class, 'employee_id');
    }

    public function employeeDetail()
    {
        return $this->hasOne(EmployeeDetail::class, 'user_id');
    }

    public function farmerProfile()
    {
        return $this->hasOne(FarmerProfile::class, 'user_id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'employee_id');
    }
}
