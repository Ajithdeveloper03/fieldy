<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmerProfile;
use App\Models\FarmerVisit;
use App\Models\User;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FarmerDirectoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $district = $request->query('district', '');
        $kyc = $request->query('kyc', '');
        $category = $request->query('category', '');
        $companyId = auth()->user()?->company_id;
        $industryKey = IndustryContext::current();

        $query = FarmerProfile::with(['user', 'createdBy:id,name'])
            ->when($companyId, fn ($q) => $q->whereHas('user', fn ($u) => $u->where('company_id', $companyId)));

        $query = IndustryContext::scope($query, $industryKey);

        if ($category) {
            $query->where('customer_category', $category);
        }
        if ($district) {
            $query->where('district', $district);
        }
        if ($kyc) {
            $query->where('kyc_status', $kyc);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', fn ($u) => $u->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                )->orWhere('farmer_code', 'like', "%{$search}%");
            });
        }

        $farmers = $query->orderBy('created_at', 'desc')->get()->map(fn ($fp) => [
            'id' => $fp->user?->id,
            'name' => $fp->user?->name ?? 'Unknown',
            'phone' => $fp->user?->phone ?? 'N/A',
            'farmer_code' => $fp->farmer_code,
            'land_acres' => $fp->land_size_acres,
            'district' => $fp->district,
            'soil_type' => $fp->soil_type ?? 'N/A',
            'customer_category' => $fp->customer_category ?? 'standard',
            'crop_types' => $fp->crop_types ?? [],
            'status' => $fp->approval_status,
            'approval_status' => $fp->approval_status,
            'registered_by' => $fp->createdBy?->name ?? 'Admin',
            'joined' => $fp->created_at?->format('M d, Y') ?? 'Recently',
            'farmer_photo' => $fp->farmer_photo_path ? Storage::url($fp->farmer_photo_path) : null,
        ]);

        // If no real records exist for this service vertical, supply curated industry catalog data
        if ($farmers->isEmpty()) {
            $catalogEntities = IndustryCatalog::entities($industryKey);
            $farmers = collect($catalogEntities)->map(fn ($e) => [
                'id' => $e['id'],
                'name' => $e['name'],
                'phone' => $e['contact_phone'],
                'farmer_code' => $e['code'],
                'land_acres' => $e['size'],
                'district' => $e['city'],
                'soil_type' => $e['type'],
                'customer_category' => $e['contact_role'],
                'crop_types' => $e['attributes'],
                'status' => $e['status'],
                'approval_status' => $e['approval_status'],
                'registered_by' => 'System Catalog',
                'joined' => $e['joined'],
                'farmer_photo' => null,
                'is_sample' => true,
            ]);

            if ($search) {
                $farmers = $farmers->filter(fn ($f) => stripos($f['name'], $search) !== false || stripos($f['farmer_code'], $search) !== false || stripos($f['phone'], $search) !== false)->values();
            }
            if ($district) {
                $farmers = $farmers->filter(fn ($f) => $f['district'] === $district)->values();
            }
            if ($kyc) {
                $farmers = $farmers->filter(fn ($f) => ($f['approval_status'] === 'approved' ? 'verified' : 'pending') === $kyc)->values();
            }
        }

        $districts = $farmers->pluck('district')->filter()->unique()->values();

        return Inertia::render('Admin/Profiles/FarmerList', [
            'farmers' => $farmers,
            'districts' => $districts,
            'filters' => ['search' => $search, 'district' => $district, 'kyc' => $kyc, 'category' => $category],
        ]);
    }

    public function show($id)
    {
        $industryKey = IndustryContext::current();

        // Check sample catalog first for synthetic IDs
        $catalogEntity = IndustryCatalog::entity($industryKey, $id);
        if ($catalogEntity) {
            $sampleVisits = collect(IndustryCatalog::visits($industryKey))
                ->where('entity_id', $catalogEntity['id'])
                ->take(10)
                ->values()
                ->map(fn ($v) => [
                    'id' => $v['id'],
                    'employee_name' => $v['staff_name'],
                    'check_in' => $v['check_in'],
                    'check_out' => $v['check_out'],
                    'date' => $v['date'],
                    'notes' => $v['notes'],
                    'recommendations' => $v['recommendations'],
                ]);

            return Inertia::render('Admin/Profiles/FarmerDetail', [
                'farmer' => [
                    'id' => $catalogEntity['id'],
                    'name' => $catalogEntity['name'],
                    'phone' => $catalogEntity['contact_phone'],
                    'status' => 'active',
                    'farmer_code' => $catalogEntity['code'],
                    'land_acres' => $catalogEntity['size'],
                    'land_address' => $catalogEntity['address'],
                    'land_latitude' => $catalogEntity['latitude'],
                    'land_longitude' => $catalogEntity['longitude'],
                    'village' => $catalogEntity['area'],
                    'taluk' => $catalogEntity['area'],
                    'district' => $catalogEntity['city'],
                    'state' => 'Tamil Nadu',
                    'pincode' => '600001',
                    'aadhaar_number' => '****1234',
                    'kyc_status' => $catalogEntity['kyc_status'],
                    'approval_status' => $catalogEntity['approval_status'],
                    'registered_by' => 'Operations Dispatch',
                    'joined' => $catalogEntity['joined'],
                    'crop_stage' => $catalogEntity['type'],
                    'planting_date' => null,
                    'total_land_owned' => $catalogEntity['size'] . ' ' . $catalogEntity['size_unit'],
                    'survey_number' => $catalogEntity['code'],
                    'irrigation_type' => $catalogEntity['type'],
                    'soil_type' => implode(', ', $catalogEntity['attributes']),
                    'seed_bags_required' => null,
                    'planned_investment' => null,
                    'customer_category' => $catalogEntity['contact_role'],
                    'crop_types' => $catalogEntity['attributes'],
                    'farmer_photo' => null,
                    'aadhaar_image' => null,
                    'farm_photos' => [],
                    'total_visits' => count($sampleVisits),
                ],
                'visits' => $sampleVisits,
            ]);
        }

        $user = User::where('id', $id)->where('role', 'farmer')
            ->with('farmerProfile.createdBy:id,name')
            ->firstOrFail();

        $fp = $user->farmerProfile;

        $visits = FarmerVisit::where('farmer_id', $id)
            ->with('employee:id,name')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'employee_name' => $v->employee?->name ?? 'Unknown',
                'check_in' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('h:i A') : 'N/A',
                'check_out' => $v->check_out_time ? Carbon::parse($v->check_out_time)->format('h:i A') : 'N/A',
                'date' => Carbon::parse($v->created_at)->format('M d, Y'),
                'notes' => $v->farm_condition_notes,
                'recommendations' => $v->recommendations,
            ]);

        return Inertia::render('Admin/Profiles/FarmerDetail', [
            'farmer' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'status' => $user->status,
                'farmer_code' => $fp?->farmer_code,
                'land_acres' => $fp?->land_size_acres,
                'land_address' => $fp?->land_address,
                'land_latitude' => $fp?->land_latitude,
                'land_longitude' => $fp?->land_longitude,
                'village' => $fp?->village,
                'taluk' => $fp?->taluk,
                'district' => $fp?->district,
                'state' => $fp?->state,
                'pincode' => $fp?->pincode,
                'aadhaar_number' => $fp?->aadhaar_number,
                'kyc_status' => $fp?->kyc_status ?? 'pending',
                'approval_status' => $fp?->approval_status ?? 'pending',
                'registered_by' => $fp?->createdBy?->name ?? 'Admin',
                'joined' => $user->created_at->format('M d, Y'),
                'crop_stage' => $fp?->vetiver_crop_stage,
                'planting_date' => $fp?->planting_date?->format('M d, Y'),
                'total_land_owned' => $fp?->total_land_owned,
                'survey_number' => $fp?->survey_number,
                'irrigation_type' => $fp?->irrigation_type,
                'soil_type' => $fp?->soil_type,
                'seed_bags_required' => $fp?->seed_bags_required,
                'planned_investment' => $fp?->planned_investment,
                'customer_category' => $fp?->customer_category,
                'crop_types' => $fp?->crop_types ?? [],
                'farmer_photo' => $fp?->farmer_photo_path ? Storage::url($fp->farmer_photo_path) : null,
                'aadhaar_image' => $fp?->aadhaar_image_path ? Storage::url($fp->aadhaar_image_path) : null,
                'farm_photos' => $fp?->farm_photos ? array_map(fn ($p) => Storage::url($p), $fp->farm_photos) : [],
                'total_visits' => FarmerVisit::where('farmer_id', $id)->count(),
            ],
            'visits' => $visits,
        ]);
    }

    public function store(Request $request)
    {
        $industryKey = IndustryContext::current();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone|max:20',
            'village' => 'nullable|string',
            'district' => 'nullable|string',
            'state' => 'nullable|string',
            'land_size_acres' => 'nullable|numeric',
            'soil_type' => 'nullable|string',
            'irrigation_type' => 'nullable|string',
            'farmer_photo' => 'nullable|image|max:4096',
            'aadhaar_image' => 'nullable|image|max:4096',
        ]);

        $userAttributes = [
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['phone'].'@fieldy.io',
            'password' => Hash::make($validated['phone']),
            'role' => 'farmer',
            'status' => 'active',
            'company_id' => auth()->user()?->company_id,
        ];
        $userAttributes = IndustryContext::tag($userAttributes, 'users', $industryKey);
        $farmerUser = User::create($userAttributes);

        $farmerPhotoPath = $request->hasFile('farmer_photo')
            ? $request->file('farmer_photo')->store('farmer_photos', 'public')
            : null;
        $aadhaarPath = $request->hasFile('aadhaar_image')
            ? $request->file('aadhaar_image')->store('aadhaar_images', 'public')
            : null;

        $district = $validated['district'] ?? '';
        $prefix = $district ? strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $district), 0, 3)) : 'FLD';

        $profileAttributes = [
            'user_id' => $farmerUser->id,
            'created_by_employee_id' => auth()->id(),
            'approval_status' => 'approved',
            'farmer_code' => $prefix.'-REC-'.str_pad($farmerUser->id, 4, '0', STR_PAD_LEFT),
            'land_size_acres' => $validated['land_size_acres'] ?? null,
            'mobile_number' => $validated['phone'],
            'village' => $validated['village'] ?? null,
            'district' => $validated['district'] ?? null,
            'state' => $validated['state'] ?? null,
            'soil_type' => $validated['soil_type'] ?? null,
            'irrigation_type' => $validated['irrigation_type'] ?? null,
            'kyc_status' => 'verified',
            'farmer_photo_path' => $farmerPhotoPath,
            'aadhaar_image_path' => $aadhaarPath,
        ];
        $profileAttributes = IndustryContext::tag($profileAttributes, 'farmer_profiles', $industryKey);
        FarmerProfile::create($profileAttributes);

        return redirect('/admin/farmers')->with('success', 'Entity registered successfully.');
    }
}
