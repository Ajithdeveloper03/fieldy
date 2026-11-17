<?php
namespace App\Http\Controllers\Api\V1;
use App\Events\LocationUpdated;
use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\FarmerProfile;
use App\Models\FarmerVisit;
use App\Models\Task;
use App\Models\User;
use App\Services\Industry\IndustryCatalog;
use App\Services\IndustryService;
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
        IndustryService::syncUserService($user, $request);

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
            'is_gps_enabled' => 'nullable|boolean',
            'battery_level' => 'nullable|integer',
            'speed' => 'nullable|numeric',
            'heading' => 'nullable|numeric',
        ]);
        $user = $request->user();
        IndustryService::syncUserService($user, $request);
        $isGpsEnabled = (bool) ($validated['is_gps_enabled'] ?? true);
        $batteryLevel = (int) ($validated['battery_level'] ?? 95);

        $user->locationLogs()->create([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'is_gps_enabled' => $isGpsEnabled,
            'battery_level' => $batteryLevel,
            'recorded_at' => now(),
        ]);

        \App\Services\Tracking\GeofenceTrackingService::logPing(
            $user,
            (float) $validated['latitude'],
            (float) $validated['longitude'],
            10.0,
            isset($validated['speed']) ? (float) $validated['speed'] : 0.0,
            isset($validated['heading']) ? (float) $validated['heading'] : 0.0,
            $batteryLevel
        );

        broadcast(new LocationUpdated(
            $user->id,
            $validated['latitude'],
            $validated['longitude'],
            $isGpsEnabled,
            $batteryLevel
        ));
        if (! $isGpsEnabled || $batteryLevel < 15) {
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
            'farmer_id' => 'nullable|integer|exists:users,id',
            'site_id' => 'nullable|integer|exists:users,id',
            'task_id' => 'nullable',
            'check_in_latitude' => 'nullable|numeric',
            'check_in_longitude' => 'nullable|numeric',
            'check_out_latitude' => 'nullable|numeric',
            'check_out_longitude' => 'nullable|numeric',
            'farm_condition_notes' => 'nullable|string',
            'notes' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'before_photo' => 'nullable|string',
            'after_photo' => 'nullable|string',
            'otp_verified' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $industry = IndustryService::syncUserService($user, $request);
        $task = null;
        if (! empty($validated['task_id']) && is_numeric($validated['task_id'])) {
            $task = Task::find((int) $validated['task_id']);
        }

        $farmerId = $validated['farmer_id']
            ?? $validated['site_id']
            ?? $task?->customer_id
            ?? User::where('role', 'farmer')
                ->when($user->company_id, fn ($q, $cid) => $q->where('company_id', $cid))
                ->value('id')
            ?? $user->id;

        $notes = $validated['farm_condition_notes'] ?? $validated['notes'] ?? 'Field work completed and verified.';

        $visit = FarmerVisit::create([
            'employee_id' => $user->id,
            'farmer_id' => $farmerId,
            'industry' => $industry,
            'check_in_time' => now(),
            'check_out_time' => now(),
            'check_in_latitude' => $validated['check_in_latitude'] ?? null,
            'check_in_longitude' => $validated['check_in_longitude'] ?? null,
            'check_out_latitude' => $validated['check_out_latitude'] ?? ($validated['check_in_latitude'] ?? null),
            'check_out_longitude' => $validated['check_out_longitude'] ?? ($validated['check_in_longitude'] ?? null),
            'farm_condition_notes' => $notes,
            'recommendations' => $validated['recommendations'] ?? null,
        ]);

        if ($task) {
            $task->update([
                'status' => 'done',
                'otp_verified' => (bool) ($validated['otp_verified'] ?? true),
                'before_photos' => ! empty($validated['before_photo']) ? [$validated['before_photo']] : $task->before_photos,
                'after_photos' => ! empty($validated['after_photo']) ? [$validated['after_photo']] : $task->after_photos,
            ]);
        }

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
        $user = $request->user()->load(['company', 'employeeDetail']);
        $today = Carbon::today();
        $industry = IndustryService::syncUserService($user, $request);
        $attendance = AttendanceLog::where('employee_id', $user->id)
            ->whereDate('date', $today)
            ->first();
        $visitsCount = FarmerVisit::where('employee_id', $user->id)->count();
        $visitsToday = FarmerVisit::where('employee_id', $user->id)
            ->whereDate('check_in_time', $today)
            ->count();
        $totalSites = User::where('role', 'farmer')
            ->when($user->company_id, fn ($q, $cid) => $q->where('company_id', $cid))
            ->count();
        $pendingTasks = Task::where('assigned_to', $user->id)
            ->where('status', '!=', 'done')
            ->count();
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
                    'farmerName' => $farmer?->name ?? 'Assigned Site',
                    'farmerPhone' => $farmer?->phone ?? '',
                    'address' => $profile?->land_address ?? ($profile?->village ?? 'Chennai, Tamil Nadu'),
                    'acres' => $profile?->land_size_acres ? "{$profile->land_size_acres} Units" : 'Standard Site',
                    'date' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('M d, Y') : Carbon::today()->format('M d, Y'),
                    'time' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('h:i A') : '10:00 AM',
                    'status' => $v->check_out_time ? 'completed' : ($v->check_in_time ? 'in_progress' : 'pending'),
                    'remarks' => $v->farm_condition_notes ?? 'Field visit completed.',
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
                    'designation' => $user->employeeDetail?->designation ?? 'Field Executive',
                    'employee_code' => $user->employeeDetail?->employee_code ?? 'EMP-'.str_pad($user->id, 3, '0', STR_PAD_LEFT),
                    'region' => $user->employeeDetail?->assigned_region ?? 'Tamil Nadu',
                    'company_id' => $user->company_id,
                    'company_name' => $user->company?->name,
                    'industry' => $industry,
                ],
                'attendance' => $attendance ? [
                    'checked_in' => true,
                    'check_in_at' => $attendance->check_in_timestamp ? Carbon::parse($attendance->check_in_timestamp)->format('h:i A') : null,
                    'checked_out' => ! is_null($attendance->check_out_timestamp),
                    'latitude' => $attendance->check_in_latitude,
                    'longitude' => $attendance->check_in_longitude,
                ] : ['checked_in' => false],
                'visits_today' => $visitsToday,
                'visits_total' => $visitsCount,
                'total_farmers' => $totalSites,
                'pending_tasks' => $pendingTasks,
                'pending_visits' => FarmerVisit::where('employee_id', $user->id)->whereNull('check_out_time')->count(),
                'recent_visits' => $recentVisits,
            ],
        ]);
    }
    public function tasks(Request $request)
    {
        $user = $request->user()->load('company');
        $industry = IndustryService::syncUserService($user, $request);

        $tasks = Task::with(['customer.farmerProfile'])
            ->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id);
                if ($user->company_id) {
                    $q->orWhere(function ($sub) use ($user) {
                        $sub->whereNull('assigned_to')
                            ->whereHas('createdBy', fn ($u) => $u->where('company_id', $user->company_id));
                    });
                }
            })
            ->where(function ($q) use ($industry) {
                $q->where('industry', $industry)->orWhereNull('industry');
            })
            ->orderByDesc('id')
            ->get()
            ->map(function ($t) use ($industry) {
                $site = $t->customer;
                $profile = $site?->farmerProfile;
                return [
                    'id' => (string) $t->id,
                    'workOrderCode' => $t->work_order_code ?: 'WO-'.str_pad($t->id, 5, '0', STR_PAD_LEFT),
                    'title' => $t->title,
                    'description' => $t->description ?: 'Complete assigned field verification and upload site report.',
                    'industry' => $t->industry ?: $industry,
                    'targetEntity' => $site?->name ?? 'Assigned Project Site',
                    'facility' => $site?->name ?? 'Assigned Project Site',
                    'farmerId' => $site?->id,
                    'address' => $profile?->land_address ?? ($profile?->village ?? 'Chennai, Tamil Nadu'),
                    'latitude' => $profile?->land_latitude ? (float) $profile->land_latitude : null,
                    'longitude' => $profile?->land_longitude ? (float) $profile->land_longitude : null,
                    'priority' => ucfirst($t->priority ?: 'medium'),
                    'status' => $t->status === 'done' ? 'Completed' : ($t->status === 'in_progress' ? 'In Progress' : 'Pending'),
                    'rawStatus' => $t->status ?: 'pending',
                    'due' => $t->due_date ? $t->due_date->format('M d, Y') : 'Today',
                    'points' => $t->points_awarded ?: 35,
                    'aiDiagnostic' => $t->ai_suggestions ?: 'Verify site checklist and record field report after checkout.',
                    'checklist' => $t->checklist ?? [],
                    'safety_requirements' => $t->safety_requirements ?? [],
                    'customer_otp' => $t->customer_otp ?: '4821',
                ];
            });

        return response()->json([
            'status' => 'success',
            'industry' => $industry,
            'tasks' => $tasks,
        ]);
    }
    public function updateTaskStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,in_progress,done,cancelled',
        ]);
        $task = Task::findOrFail($id);
        $task->update(['status' => $validated['status']]);

        return response()->json(['status' => 'success', 'task' => $task]);
    }
    public function sites(Request $request)
    {
        $user = $request->user()->load('company');
        $industry = IndustryService::syncUserService($user, $request);

        $sites = User::where('role', 'farmer')
            ->when($user->company_id, fn ($q, $cid) => $q->where('company_id', $cid))
            ->with('farmerProfile')
            ->orderByDesc('id')
            ->get()
            ->map(function ($site) use ($industry) {
                $fp = $site->farmerProfile;
                return [
                    'id' => (string) $site->id,
                    'site_contact_id' => (string) $site->id,
                    'name' => $site->name,
                    'phone' => $site->phone,
                    'site_code' => $fp?->farmer_code ?? 'SITE-'.str_pad($site->id, 3, '0', STR_PAD_LEFT),
                    'site_address' => $fp?->land_address ?? ($fp?->village ?? 'Chennai, Tamil Nadu'),
                    'address' => $fp?->land_address ?? ($fp?->village ?? 'Chennai, Tamil Nadu'),
                    'city' => $fp?->district ?? 'Chennai',
                    'area' => $fp?->village ?? 'Project Zone',
                    'type' => ucfirst($fp?->customer_category ?? $industry),
                    'size' => $fp?->land_size_acres ? (string) $fp->land_size_acres : '1200',
                    'latitude' => $fp?->land_latitude ? (float) $fp->land_latitude : 13.0827,
                    'longitude' => $fp?->land_longitude ? (float) $fp->land_longitude : 80.2707,
                ];
            });

        if ($sites->isEmpty()) {
            $catalogSites = collect(IndustryCatalog::entities($industry))->map(fn ($e, $idx) => [
                'id' => (string) ($e['id'] ?? ($idx + 1)),
                'name' => $e['name'],
                'phone' => $e['phone'] ?? '',
                'site_code' => $e['code'] ?? 'SITE-00'.($idx + 1),
                'site_address' => $e['address'] ?? 'Chennai, Tamil Nadu',
                'address' => $e['address'] ?? 'Chennai, Tamil Nadu',
                'city' => $e['city'] ?? 'Chennai',
                'area' => $e['area'] ?? '',
                'type' => $e['type'] ?? ucfirst($industry),
                'size' => (string) ($e['size'] ?? '2500'),
                'latitude' => $e['latitude'] ?? 13.0827,
                'longitude' => $e['longitude'] ?? 80.2707,
            ]);
            return response()->json(['status' => 'success', 'industry' => $industry, 'sites' => $catalogSites]);
        }

        return response()->json(['status' => 'success', 'industry' => $industry, 'sites' => $sites]);
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