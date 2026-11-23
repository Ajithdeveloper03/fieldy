<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'work_order_code',
        'title',
        'description',
        'assigned_to',
        'customer_id',
        'created_by',
        'due_date',
        'priority',
        'industry',
        'ai_suggestions',
        'checklist',
        'safety_requirements',
        'status',
        'customer_otp',
        'otp_verified',
        'before_photos',
        'after_photos',
        'points_awarded',
    ];

    protected $casts = [
        'due_date' => 'date',
        'completed_at' => 'datetime',
        'checklist' => 'array',
        'safety_requirements' => 'array',
        'otp_verified' => 'boolean',
        'before_photos' => 'array',
        'after_photos' => 'array',
        'points_awarded' => 'integer',
    ];

    protected static function booted(): void
    {
        static::saving(function (Task $task) {
            if ($task->isDirty('status')) {
                $task->completed_at = $task->status === 'done' ? now() : null;
            }
        });
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
