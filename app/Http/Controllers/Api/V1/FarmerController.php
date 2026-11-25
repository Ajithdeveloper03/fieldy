<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FarmerProfile;
use App\Models\FarmerReview;
use App\Models\FarmerVisit;
use Carbon\Carbon;
use Illuminate\Http\Request;

class FarmerController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $profile = FarmerProfile::where('user_id', $user->id)->first();
        $recentVisits = FarmerVisit::where('farmer_id', $user->id)
            ->with('employee')
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($v) => [
                'id' => (string) $v->id,
                'officer_name' => $v->employee?->name ?? 'Field Officer',
                'date' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('M d, Y') : null,
                'recommendations' => $v->recommendations ?? 'Maintain watering schedule.',
                'status' => $v->check_out_time ? 'completed' : 'scheduled',
            ]);

        return response()->json([
            'status' => 'success',
            'data' => [
                'farmer' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'farmer_code' => $profile?->farmer_code,
                    'approval_status' => $profile?->approval_status ?? 'pending',
                    'land_acres' => $profile?->land_size_acres ?? 0,
                    'address' => $profile?->address,
                    'village' => $profile?->village ?? 'Tamil Nadu',
                    'taluk' => $profile?->taluk,
                    'district' => $profile?->district ?? 'Coimbatore',
                    'state' => $profile?->state,
                    'pincode' => $profile?->pincode,
                    'crop_stage' => $profile?->vetiver_crop_stage ?? 'vegetative',
                    'soil_type' => $profile?->soil_type ?? 'Red Loam',
                    'irrigation_type' => $profile?->irrigation_type ?? 'Drip',
                    'customer_category' => $profile?->customer_category ?? 'crop',
                    'survey_number' => $profile?->survey_number,
                    'seed_bags_required' => $profile?->seed_bags_required,
                    'planned_investment' => $profile?->planned_investment,
                    'aadhaar_number' => $profile?->aadhaar_number,
                    'kyc_status' => $profile?->kyc_status ?? 'pending',
                ],
                'recent_visits' => $recentVisits,
                'weather' => [
                    'temperature' => '29°C',
                    'condition' => 'Partly Cloudy',
                    'humidity' => '65%',
                ],
            ],
        ]);
    }

    public function visits(Request $request)
    {
        $visits = FarmerVisit::where('farmer_id', $request->user()->id)
            ->with('employee')
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn ($v) => [
                'id' => (string) $v->id,
                'officer_name' => $v->employee?->name ?? 'Field Officer',
                'officer_phone' => $v->employee?->phone ?? '',
                'date' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('M d, Y') : null,
                'time' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('h:i A') : '10:00 AM',
                'recommendations' => $v->recommendations,
                'notes' => $v->farm_condition_notes,
                'status' => $v->check_out_time ? 'completed' : 'scheduled',
            ]);

        return response()->json(['status' => 'success', 'visits' => $visits]);
    }

    /**
     * Rate a visit.
     * POST /api/v1/farmer/visit/{id}/rate
     */
    public function rateVisit(Request $request, $id)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $visit = FarmerVisit::where('id', $id)
            ->where('farmer_id', $request->user()->id)
            ->firstOrFail();

        FarmerReview::create([
            'visit_id' => $visit->id,
            'farmer_id' => $request->user()->id,
            'employee_id' => $visit->employee_id,
            'rating' => $validated['rating'],
            'feedback_comments' => $validated['comment'] ?? null,
        ]);

        return response()->json(['status' => 'success', 'message' => 'Review submitted successfully.']);
    }
}
