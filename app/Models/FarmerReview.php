<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'visit_id',
        'farmer_id',
        'employee_id',
        'rating',
        'feedback_comments',
    ];

    public function visit()
    {
        return $this->belongsTo(FarmerVisit::class, 'visit_id');
    }

    public function farmer()
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }
}
