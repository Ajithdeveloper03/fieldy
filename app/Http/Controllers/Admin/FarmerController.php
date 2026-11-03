<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmerProfile;
use App\Models\User;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class FarmerController extends Controller
{
    public function pending()
    {
        $industryKey = IndustryContext::current();
        $companyId = auth()->user()?->company_id;

        $query = FarmerProfile::where(function ($q) {
            $q->where('approval_status', 'pending')
              ->orWhere('kyc_status', 'pending');
        })
        ->when($companyId, fn ($q) => $q->whereHas('user', fn ($u) => $u->where('company_id', $companyId)))
        ->with(['user', 'createdBy:id,name']);

        $query = IndustryContext::scope($query, $industryKey);

        $farmers = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($fp) => [
                'id' => $fp->user?->id,
                'name' => $fp->user?->name ?? 'Unknown',
                'phone' => $fp->user?->phone ?? 'N/A',
                'farmer_code' => $fp->farmer_code,
                'village' => $fp->village,
                'district' => $fp->district,
                'land_acres' => $fp->land_size_acres,
                'kyc_status' => $fp->kyc_status ?? 'pending',
                'approval_status' => $fp->approval_status ?? 'pending',
                'registered_by' => $fp->createdBy?->name ?? 'Admin',
                'submitted_on' => $fp->created_at?->format('M d, Y') ?? 'Recently',
                'farmer_photo' => $fp->farmer_photo_path ? Storage::url($fp->farmer_photo_path) : null,
                'aadhaar_number' => $fp->aadhaar_number ? '**'.substr($fp->aadhaar_number, -4) : 'Not provided',
            ]);

        // If no pending records exist in DB for this service, supply curated pending items from catalog
        if ($farmers->isEmpty()) {
            $catalogPending = collect(IndustryCatalog::entities($industryKey))
                ->where('approval_status', 'pending')
                ->values()
                ->map(fn ($e) => [
                    'id' => $e['id'],
                    'name' => $e['name'],
                    'phone' => $e['contact_phone'],
                    'farmer_code' => $e['code'],
                    'village' => $e['area'],
                    'district' => $e['city'],
                    'land_acres' => $e['size'],
                    'kyc_status' => $e['kyc_status'],
                    'approval_status' => $e['approval_status'],
                    'registered_by' => 'Operations Field Team',
                    'submitted_on' => $e['submitted_at'],
                    'farmer_photo' => null,
                    'aadhaar_number' => 'DOC-VERIFIED',
                    'is_sample' => true,
                ]);
            $farmers = $catalogPending;
        }

        return Inertia::render('Admin/PendingFarmers', [
            'farmers' => $farmers,
        ]);
    }

    public function showPending($id)
    {
        $industryKey = IndustryContext::current();

        $catalogEntity = IndustryCatalog::entity($industryKey, $id);
        if ($catalogEntity) {
            return Inertia::render('Admin/Profiles/PendingFarmerDetail', [
                'farmer' => [
                    'id' => $catalogEntity['id'],
                    'name' => $catalogEntity['name'],
                    'phone' => $catalogEntity['contact_phone'],
                    'email' => strtolower(str_replace(' ', '', $catalogEntity['name'])).'@fieldy.demo',
                    'farmer_code' => $catalogEntity['code'],
                    'village' => $catalogEntity['area'],
                    'taluk' => $catalogEntity['area'],
                    'district' => $catalogEntity['city'],
                    'state' => 'Tamil Nadu',
                    'pincode' => '600001',
                    'land_size_acres' => $catalogEntity['size'],
                    'land_address' => $catalogEntity['address'],
                    'soil_type' => $catalogEntity['type'],
                    'irrigation_type' => implode(', ', $catalogEntity['attributes']),
                    'kyc_status' => $catalogEntity['kyc_status'],
                    'approval_status' => $catalogEntity['approval_status'],
                    'registered_by' => 'Operations Field Team',
                    'farmer_photo_url' => null,
                    'aadhaar_number' => 'DOC-VERIFIED',
                    'customer_category' => $catalogEntity['contact_role'],
                    'document' => $catalogEntity['document'],
                    'is_sample' => true,
                ],
            ]);
        }

        $farmer = User::where('id', $id)->where('role', 'farmer')->firstOrFail();
        $profile = FarmerProfile::where('user_id', $id)->with('createdBy:id,name')->firstOrFail();

        return Inertia::render('Admin/Profiles/PendingFarmerDetail', [
            'farmer' => array_merge($farmer->toArray(), $profile->toArray(), [
                'registered_by' => $profile->createdBy?->name ?? 'Admin',
                'farmer_photo_url' => $profile->farmer_photo_path ? Storage::url($profile->farmer_photo_path) : null,
            ]),
        ]);
    }

    public function approve(Request $request, $id)
    {
        $industryKey = IndustryContext::current();
        if (IndustryCatalog::entity($industryKey, $id)) {
            return redirect('/admin/pending-farmers')->with('success', "Approval confirmed for selected {$industryKey} record.");
        }

        $user = User::where('id', $id)->where('role', 'farmer')->firstOrFail();
        $user->update(['status' => 'active']);

        $fp = FarmerProfile::where('user_id', $id)->firstOrFail();
        $fp->update([
            'approval_status' => 'approved',
            'kyc_status' => 'verified',
        ]);

        return redirect('/admin/pending-farmers')->with('success', "Record {$user->name} approved.");
    }

    public function reject(Request $request, $id)
    {
        $industryKey = IndustryContext::current();
        if (IndustryCatalog::entity($industryKey, $id)) {
            return redirect('/admin/pending-farmers')->with('success', "Rejection recorded for selected {$industryKey} record.");
        }

        $request->validate(['reason' => 'nullable|string|max:500']);

        $user = User::where('id', $id)->where('role', 'farmer')->firstOrFail();
        $user->update(['status' => 'disabled']);

        $fp = FarmerProfile::where('user_id', $id)->firstOrFail();
        $fp->update([
            'approval_status' => 'rejected',
            'kyc_status' => 'rejected',
        ]);

        return redirect('/admin/pending-farmers')->with('success', "Record {$user->name} rejected.");
    }
}
