<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerVisit extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function employee()
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function farmer()
    {
        return $this->belongsTo(User::class, 'farmer_id');
    }

    public function mediaFiles()
    {
        return $this->hasMany(MediaFile::class, 'visit_id')->orderByDesc('id');
    }
}
