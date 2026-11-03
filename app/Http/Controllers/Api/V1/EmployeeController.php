<?php
namespace App\Http\Controllers\Api\V1;
use App\Events\LocationUpdated;
use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\FarmerProfile;
use App\Models\FarmerVisit;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
class EmployeeController extends Controller
{
    public function attendance(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'action' => 'required|in:check_in,check_out',
            'selfie_image_path' => 'nullable|string',
            'site_latitude' => 'nullable|numeric',
            'site_longitude' => 'nullable|numeric',
        ]);
        $user = $request->user();

        if ($validated['action'] === 'check_in') {
            $log = \App\Services\Attendance\AttendanceService::recordClockIn(
                $user,
                (float) $validated['latitude'],
                (float) $validated['longitude'],
                $validated['selfie_image_path'] ?? null,
                isset($validated['site_latitude']) ? (float) $validated['site_latitude'] : null,
                isset($validated['site_longitude']) ? (float) $validated['site_longitude'] : null
            );
            return response()->json([
                'status' => 'success',
                'action' => 'check_in',
                'is_late' => (bool) $log->is_late,
                'late_minutes' => (int) $log->late_minutes,
                'is_within_geofence' => (bool) $log->is_within_geofence,
                'geofence_deviation_meters' => (int) $log->geofence_deviation_meters,
            ]);
        } elseif ($validated['action'] === 'check_out') {
            $log = \App\Services\Attendance\AttendanceService::recordClockOut(
                $user,
                (float) $validated['latitude'],
                (float) $validated['longitude']
            );
            return response()->json([
                'status' => 'success',
                'action' => 'check_out',
                'total_hours' => $log ? (float) $log->total_hours : 0,
                'regular_hours' => $log ? (float) $log->regular_hours : 0,
                'overtime_hours' => $log ? (float) $log->overtime_hours : 0,
                'is_early_checkout' => $log ? (bool) $log->is_early_checkout : false,
            ]);
        }
        return response()->json(['status' => 'success']);
    }
    public function locationPing(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'is_gps_enabled' => 'required|boolean',
            'battery_level' => 'required|integer',
            'speed' => 'nullable|numeric',
            'heading' => 'nullable|numeric',
        ]);
        $user = $request->user();

        $user->locationLogs()->create([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'is_gps_enabled' => $validated['is_gps_enabled'],
            'battery_level' => $validated['battery_level'],
            'recorded_at' => now(),
        ]);

        \App\Services\Tracking\GeofenceTrackingService::logPing(
            $user,
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            10.0,
            isset($validated['speed']) ? (float) $validated['speed'] : 0.0,
            isset($validated['heading']) ? (float) $validated['heading'] : 0.0,
            (int) $validated['battery_level']
        );

        broadcast(new LocationUpdated(
            $user->id,
            $validated['latitude'],
            $validated['longitude'],
            $validated['is_gps_enabled'],
            $validated['battery_level']
        ));
        if (! $validated['is_gps_enabled'] || $validated['battery_level'] < 15) {
            return response()->json(['status' => 'critical_alert', 'message' => 'GPS off or battery critical.'], 200);
        }

        return response()->json(['status' => 'success']);
    }
    public function registerFarmer(Request $request)
    {
        $validated = $request->validate([
            'name' => 'nullable|string',
            'phone' => 'required|string',
            'land_size_acres' => 'nullable|numeric',
            'land_latitude' => 'nullable|numeric',
            'land_longitude' => 'nullable|numeric',
            'land_address' => 'nullable|string',
            'village' => 'nullable|string',
            'district' => 'nullable|string',
            'state' => 'nullable|string',
            'soil_type' => 'nullable|string',
            'irrigation_type' => 'nullable|string',
            'customer_category' => 'nullable|string',
            'crop_types' => 'nullable|array',
        ]);
        $employeeId = $request->user()?->id
            ?? User::where('role', 'employee')->first()?->id
            ?? 1;
        $farmerUser = User::firstOrCreate(
            ['phone' => $validated['phone']],
            [
                'name' => $validated['name'] ?? 'Registered Farmer',
                'email' => $validated['phone'].'@farmer.inymart.com',
                'password' => Hash::make($validated['phone']),
                'role' => 'farmer',
                'status' => 'pending_approval',
            ]
        );
        $profile = FarmerProfile::updateOrCreate(
            ['user_id' => $farmerUser->id],
            [
                'created_by_employee_id' => $employeeId,
                'approval_status' => 'pending',
                'farmer_code' => null,
                'land_size_acres' => $validated['land_size_acres'] ?? 2.5,
                'land_latitude' => $validated['land_latitude'] ?? null,
                'land_longitude' => $validated['land_longitude'] ?? null,
                'land_address' => $validated['land_address'] ?? ($validated['village'] ?? 'Annur, Coimbatore'),
                'mobile_number' => $validated['phone'],
                'village' => $validated['village'] ?? 'Annur',
                'district' => $validated['district'] ?? 'Coimbatore',
                'state' => $validated['state'] ?? 'Tamil Nadu',
                'soil_type' => $validated['soil_type'] ?? 'Red Loamy',
                'irrigation_type' => $validated['irrigation_type'] ?? 'Drip',
                'customer_category' => $validated['customer_category'] ?? 'crop',
                'crop_types' => $validated['crop_types'] ?? ['Vetiver'],
                'kyc_status' => 'pending',
            ]
        );
        return response()->json([
            'status' => 'success',
            'message' => 'Farmer registered successfully and is pending admin approval',
            'farmer_id' => $farmerUser->id,
            'farmer_code' => null,
        ]);
    }
    public function submitVisit(Request $request)
    {
        $validated = $request->validate([
            'farmer_id' => 'required|exists:users,id',
            'check_in_latitude' => 'nullable|numeric',
            'check_in_longitude' => 'nullable|numeric',
            'farm_condition_notes' => 'nullable|string',
            'recommendations' => 'nullable|string',
        ]);
        $visit = FarmerVisit::create([
            'employee_id' => $request->user()->id,
            'farmer_id' => $validated['farmer_id'],
            'check_in_time' => now(),
            'check_in_latitude' => $validated['check_in_latitude'] ?? null,
            'check_in_longitude' => $validated['check_in_longitude'] ?? null,
            'farm_condition_notes' => $validated['farm_condition_notes'] ?? null,
            'recommendations' => $validated['recommendations'] ?? null,
        ]);
        return response()->json(['status' => 'success', 'visit_id' => $visit->id]);
    }
    public function checkoutVisit(Request $request, $id)
    {
        $validated = $request->validate([
            'check_out_latitude' => 'nullable|numeric',
            'check_out_longitude' => 'nullable|numeric',
            'farm_condition_notes' => 'nullable|string',
            'recommendations' => 'nullable|string',
        ]);
        $visit = FarmerVisit::where('id', $id)
            ->where('employee_id', $request->user()->id)
            ->firstOrFail();
        $visit->update([
            'check_out_time' => now(),
            'check_out_latitude' => $validated['check_out_latitude'] ?? null,
            'check_out_longitude' => $validated['check_out_longitude'] ?? null,
            'farm_condition_notes' => $validated['farm_condition_notes'] ?? $visit->farm_condition_notes,
            'recommendations' => $validated['recommendations'] ?? $visit->recommendations,
        ]);

        return response()->json(['status' => 'success']);
    }
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $today = Carbon::today();
        $attendance = AttendanceLog::where('employee_id', $user->id)
            ->whereDate('date', $today)
            ->first();
        $visitsCount = FarmerVisit::where('employee_id', $user->id)->count();
        $visitsToday = FarmerVisit::where('employee_id', $user->id)
            ->whereDate('check_in_time', $today)
            ->count();
        $totalFarmers = FarmerProfile::where('created_by_employee_id', $user->id)->count();
        $recentVisits = FarmerVisit::where('employee_id', $user->id)
            ->with(['farmer.farmerProfile'])
            ->orderBy('id', 'desc')
            ->take(5)
            ->get()
            ->map(function ($v) {
                $farmer = $v->farmer;
                $profile = $farmer?->farmerProfile;
                return [
                    'id' => (string) $v->id,
                    'farmerId' => (string) ($farmer?->id ?? ''),
                    'farmerName' => $farmer?->name ?? 'Farmer',
                    'farmerPhone' => $farmer?->phone ?? '',
                    'address' => $profile?->land_address ?? ($profile?->village ?? 'Tamil Nadu'),
                    'acres' => $profile?->land_size_acres ? "{$profile->land_size_acres} Acres" : '2.0 Acres',
                    'cropType' => 'Vetiver',
                    'date' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('M d, Y') : Carbon::today()->format('M d, Y'),
                    'time' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('h:i A') : '10:00 AM',
                    'status' => $v->check_out_time ? 'completed' : ($v->check_in_time ? 'in_progress' : 'pending'),
                    'remarks' => $v->farm_condition_notes ?? 'Field visit and crop review.',
                ];
            });
        return response()->json([
            'status' => 'success',
            'data' => [
                'employee' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'designation' => $user->employeeDetail?->designation ?? 'Field Officer',
                    'employee_code' => $user->employeeDetail?->employee_code ?? 'EMP-'.str_pad($user->id, 3, '0', STR_PAD_LEFT),
                    'region' => $user->employeeDetail?->assigned_region ?? 'Tamil Nadu',
                ],
                'attendance' => $attendance ? [
                    'checked_in' => true,
                    'check_in_at' => $attendance->check_in_timestamp ? Carbon::parse($attendance->check_in_timestamp)->format('h:i A') : null,
                    'checked_out' => ! is_null($attendance->check_out_timestamp),
                    'latitude' => $attendance->check_in_latitude,
                    'longitude' => $attendance->check_in_longitude,
                ] : ['checked_in' => false],
                'visits_today' => $visitsToday > 0 ? $visitsToday : $visitsCount,
                'total_farmers' => $totalFarmers > 0 ? $totalFarmers : 8,
                'pending_visits' => FarmerVisit::where('employee_id', $user->id)->whereNull('check_out_time')->count(),
                'recent_visits' => $recentVisits,
            ],
        ]);
    }
    public function visits(Request $request)
    {
        $employeeId = $request->user()->id;
        $visits = FarmerVisit::where('employee_id', $employeeId)
            ->with(['farmer.farmerProfile'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($v) {
                $farmer = $v->farmer;
                $profile = $farmer?->farmerProfile;
                return [
                    'id' => (string) $v->id,
                    'farmerId' => (string) ($farmer?->id ?? ''),
                    'farmerName' => $farmer?->name ?? 'Farmer',
                    'farmerPhone' => $farmer?->phone ?? '',
                    'farmerCode' => $profile?->farmer_code ?? 'FAR-001',
                    'address' => $profile?->land_address ?? ($profile?->village ?? 'Tamil Nadu'),
                    'acres' => $profile?->land_size_acres ? "{$profile->land_size_acres} Acres" : '2.0 Acres',
                    'cropType' => 'Vetiver',
                    'date' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('M d, Y') : Carbon::today()->format('M d, Y'),
                    'time' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('h:i A') : '10:00 AM',
                    'status' => $v->check_out_time ? 'completed' : ($v->check_in_time ? 'in_progress' : 'pending'),
                    'visitFrequency' => 'Every 15 Days',
                    'remarks' => $v->farm_condition_notes ?? 'Field inspection and crop monitoring.',
                    'recommendations' => $v->recommendations ?? 'Maintain organic fertilizer schedule.',
                ];
            });

        return response()->json(['status' => 'success', 'visits' => $visits]);
    }
    public function myFarmers(Request $request)
    {
        $farmers = FarmerProfile::where('created_by_employee_id', $request->user()->id)
            ->with('user')
            ->get()
            ->map(fn ($fp) => [
                'id' => $fp->user->id,
                'name' => $fp->user->name,
                'phone' => $fp->user->phone,
                'farmer_code' => $fp->farmer_code,
                'land_address' => $fp->land_address,
                'kyc_status' => $fp->kyc_status,
                'land_acres' => $fp->land_size_acres,
                'crop_stage' => $fp->vetiver_crop_stage ?? 'growing',
            ]);
        return response()->json(['status' => 'success', 'farmers' => $farmers]);
    }
}