<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FarmerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'industry',
        'created_by_employee_id',
        'approval_status',
        'farmer_code',
        'land_size_acres',
        'land_latitude',
        'land_longitude',
        'land_address',
        'vetiver_crop_stage',
        'planting_date',
        // New Registration Fields
        'mobile_number',
        'otp_verified_at',
        'aadhaar_number',
        'aadhaar_image_path',
        'farmer_photo_path',
        'address',
        'village',
        'taluk',
        'district',
        'state',
        'pincode',
        'kyc_status',
        'total_land_owned',
        'survey_number',
        'irrigation_type',
        'soil_type',
        'seed_bags_required',
        'planned_investment',
        'farm_photos',
        'customer_category',
        'crop_types',
    ];

    protected $casts = [
        'otp_verified_at' => 'datetime',
        'planting_date' => 'date',
        'farm_photos' => 'array',
        'land_size_acres' => 'decimal:2',
        'total_land_owned' => 'decimal:2',
        'planned_investment' => 'decimal:2',
        'land_latitude' => 'decimal:7',
        'land_longitude' => 'decimal:7',
        'crop_types' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_employee_id');
    }
}
