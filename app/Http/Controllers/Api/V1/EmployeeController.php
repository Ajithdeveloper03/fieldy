<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\LocationUpdated;
use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\EmergencyAlert;
use App\Models\EmployeeDetail;
use App\Models\FarmerProfile;
use App\Models\FarmerReview;
use App\Models\FarmerVisit;
use App\Models\LocationPoint;
use App\Models\MediaFile;
use App\Models\SessionActivity;
use App\Models\Task;
use App\Models\TrackingSession;
use App\Models\User;
use App\Services\Attendance\AttendanceService;
use App\Services\EmployeePerformanceService;
use App\Services\IndustryService;
use App\Services\Tracking\GeofenceTrackingService;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    /**
     * Record a live GPS point into location_points so Web Admin Live Monitor
     * and Dashboard maps reflect mobile movement, clock-ins, and check-ins immediately.
     */
    private function recordLivePoint(
        User $user,
        float $latitude,
        float $longitude,
        ?float $accuracy = 10.0,
        ?float $speed = 0.0,
        ?float $heading = 0.0
    ): void {
        if (! Schema::hasTable('tracking_sessions') || ! Schema::hasTable('location_points')) {
            return;
        }

        $activeSession = TrackingSession::where('employee_id', $user->id)
            ->where('status', 'active')
            ->latest('id')
            ->first();

        if (! $activeSession) {
            $dailySessionKey = 'live_'.$user->id.'_'.Carbon::today()->format('Ymd');
            $activeSession = TrackingSession::firstOrCreate(
                ['session_id' => $dailySessionKey],
                [
                    'employee_id' => $user->id,
                    'start_time' => now(),
                    'start_latitude' => $latitude,
                    'start_longitude' => $longitude,
                    'status' => 'active',
                ]
            );
        }

        LocationPoint::create([
            'tracking_session_id' => $activeSession->id,
            'employee_id' => $user->id,
            'latitude' => $latitude,
            'longitude' => $longitude,
            'accuracy' => $accuracy,
            'speed' => $speed,
            'heading' => $heading,
            'timestamp' => (int) round(microtime(true) * 1000),
        ]);
    }

    /**
     * Resolve assigned sites query for an employee strictly scoped to their tenant company.
     */
    private function assignedSitesQuery(User $user)
    {
        return User::where('role', 'farmer')
            ->when($user->company_id, fn ($q, $cid) => $q->where('company_id', $cid), fn ($q) => $q->whereRaw('1 = 0'))
            ->where(function ($q) use ($user) {
                $q->whereDoesntHave('farmerProfile')
                    ->orWhereHas('farmerProfile', fn ($profile) => $profile
                        ->where('assignment_mode', 'all')
                        ->orWhereNull('assignment_mode')
                        ->orWhere('assigned_to', $user->id));
            });
    }

    /**
     * Resolve tasks query for an employee scoped to their tenant and service vertical.
     */
    private function employeeTasksQuery(User $user, string $industry)
    {
        return Task::where(function ($q) use ($user) {
            $q->where('assigned_to', $user->id);
            if ($user->company_id) {
                $q->orWhere(function ($shared) use ($user) {
                    $shared->whereNull('assigned_to')
                        ->whereHas('createdBy', fn ($creator) => $creator->where('company_id', $user->company_id));
                });
            }
        })->where(function ($q) use ($industry) {
            $q->where('industry', $industry)->orWhereNull('industry');
        });
    }

    /**
     * Compute Haversine distance in km from the employee's previous visit or clock-in today.
     */
    private function computeDistanceFromPreviousKm(User $user, ?float $lat, ?float $lng): float
    {
        if ($lat === null || $lng === null) {
            return 0.0;
        }

        $today = Carbon::today();
        $lastVisit = FarmerVisit::where('employee_id', $user->id)
            ->whereDate('check_in_time', $today)
            ->whereNotNull('check_in_latitude')
            ->whereNotNull('check_in_longitude')
            ->latest('id')
            ->first();

        if ($lastVisit) {
            $prevLat = (float) ($lastVisit->check_out_latitude ?? $lastVisit->check_in_latitude);
            $prevLng = (float) ($lastVisit->check_out_longitude ?? $lastVisit->check_in_longitude);

            return round(AttendanceService::distanceMeters($prevLat, $prevLng, $lat, $lng) / 1000, 2);
        }

        $todayAttendance = AttendanceLog::where('employee_id', $user->id)
            ->whereDate('date', $today)
            ->whereNotNull('check_in_latitude')
            ->whereNotNull('check_in_longitude')
            ->first();

        if ($todayAttendance) {
            return round(
                AttendanceService::distanceMeters(
                    (float) $todayAttendance->check_in_latitude,
                    (float) $todayAttendance->check_in_longitude,
                    $lat,
                    $lng
                ) / 1000,
                2
            );
        }

        return 0.0;
    }

    /**
     * Normalize task checklist items into structured { id, text, done } entries.
     */
    private function normalizeChecklist($rawChecklist): array
    {
        if (! is_array($rawChecklist)) {
            return [];
        }

        $items = [];
        foreach (array_values($rawChecklist) as $idx => $entry) {
            if (is_string($entry)) {
                $items[] = [
                    'id' => $idx + 1,
                    'text' => $entry,
                    'done' => false,
                ];
            } elseif (is_array($entry)) {
                $items[] = [
                    'id' => $entry['id'] ?? ($idx + 1),
                    'text' => (string) ($entry['text'] ?? $entry['label'] ?? 'Checklist step '.($idx + 1)),
                    'done' => (bool) ($entry['done'] ?? $entry['completed'] ?? false),
                ];
            }
        }

        return $items;
    }

    /**
     * GET /api/v1/employee/attendance
     * Real-time attendance state, monthly calendar grid, geofence anchor & shift history.
     */
    public function attendanceOverview(Request $request)
    {
        $user = $request->user()->load(['company', 'employeeDetail']);
        IndustryService::syncUserService($user, $request);

        $today = Carbon::today();
        $now = Carbon::now();
        $todayLog = AttendanceLog::where('employee_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        $monthParam = $request->query('month');
        $monthAnchor = $monthParam && preg_match('/^\d{4}-\d{2}$/', (string) $monthParam)
            ? Carbon::createFromFormat('Y-m-d', $monthParam.'-01')->startOfMonth()
            : Carbon::now()->startOfMonth();

        $monthEnd = $monthAnchor->copy()->endOfMonth();
        $monthLogs = AttendanceLog::where('employee_id', $user->id)
            ->whereBetween('date', [$monthAnchor->toDateString(), $monthEnd->toDateString()])
            ->orderByDesc('date')
            ->get();

        $calendarDays = [];
        foreach ($monthLogs as $log) {
            if (! $log->date) {
                continue;
            }
            $dayNum = (int) $log->date->day;
            $hours = (float) ($log->total_hours ?? 0);
            if ($hours <= 0 && $log->check_in_timestamp && $log->check_out_timestamp) {
                $hours = round($log->check_in_timestamp->diffInMinutes($log->check_out_timestamp) / 60, 2);
            }
            $calendarDays[(string) $dayNum] = [
                'status' => $log->is_late ? 'late' : ($log->status ?: 'present'),
                'check_in' => $log->check_in_timestamp?->format('h:i A'),
                'check_out' => $log->check_out_timestamp?->format('h:i A'),
                'hours' => $hours,
                'is_late' => (bool) $log->is_late,
                'is_within_geofence' => (bool) ($log->is_within_geofence ?? true),
            ];
        }

        $elapsedMinutes = 0;
        if ($todayLog && $todayLog->check_in_timestamp) {
            $endRef = $todayLog->check_out_timestamp ?: $now;
            $elapsedMinutes = max(0, (int) $todayLog->check_in_timestamp->diffInMinutes($endRef));
        }
        $elapsedHours = intdiv($elapsedMinutes, 60);
        $elapsedRemMins = $elapsedMinutes % 60;

        // Nearest/primary assigned site with coordinates for geofence verification
        $primarySite = $this->assignedSitesQuery($user)
            ->with('farmerProfile')
            ->get()
            ->first(fn ($s) => $s->farmerProfile?->land_latitude !== null && $s->farmerProfile?->land_longitude !== null);

        $targetSite = $primarySite ? [
            'id' => (string) $primarySite->id,
            'name' => $primarySite->name,
            'address' => $primarySite->farmerProfile?->land_address ?? $primarySite->farmerProfile?->address,
            'latitude' => (float) $primarySite->farmerProfile->land_latitude,
            'longitude' => (float) $primarySite->farmerProfile->land_longitude,
            'radius_meters' => 250,
        ] : null;

        $recentLogs = AttendanceLog::where('employee_id', $user->id)
            ->whereNotNull('check_in_timestamp')
            ->orderByDesc('date')
            ->limit(14)
            ->get()
            ->map(function (AttendanceLog $log) use ($today) {
                $hours = (float) ($log->total_hours ?? 0);
                if ($hours <= 0 && $log->check_in_timestamp && $log->check_out_timestamp) {
                    $hours = round($log->check_in_timestamp->diffInMinutes($log->check_out_timestamp) / 60, 2);
                }

                return [
                    'id' => (string) $log->id,
                    'date' => $log->date?->toDateString(),
                    'date_label' => $log->date?->isSameDay($today) ? 'Today' : $log->date?->format('M d, Y'),
                    'day_name' => $log->date?->isSameDay($today) ? 'Today' : $log->date?->format('D, M j'),
                    'check_in' => $log->check_in_timestamp?->format('h:i A'),
                    'check_out' => $log->check_out_timestamp?->format('h:i A'),
                    'hours' => $hours,
                    'is_late' => (bool) ($log->is_late ?? false),
                    'late_minutes' => (int) ($log->late_minutes ?? 0),
                    'is_within_geofence' => (bool) ($log->is_within_geofence ?? true),
                    'status' => $log->check_out_timestamp ? ($log->is_late ? 'Late' : 'Present') : 'On Duty',
                ];
            })
            ->values();

        return response()->json([
            'status' => 'success',
            'today' => [
                'checked_in' => (bool) ($todayLog && $todayLog->check_in_timestamp),
                'checked_out' => (bool) ($todayLog && $todayLog->check_out_timestamp),
                'is_on_duty' => (bool) ($todayLog && $todayLog->check_in_timestamp && ! $todayLog->check_out_timestamp),
                'check_in_at' => $todayLog?->check_in_timestamp?->format('h:i A'),
                'check_in_iso' => $todayLog?->check_in_timestamp?->toIso8601String(),
                'check_out_at' => $todayLog?->check_out_timestamp?->format('h:i A'),
                'check_out_iso' => $todayLog?->check_out_timestamp?->toIso8601String(),
                'total_hours' => (float) ($todayLog?->total_hours ?? round($elapsedMinutes / 60, 2)),
                'elapsed_minutes' => $elapsedMinutes,
                'elapsed_label' => "{$elapsedHours}h ".str_pad((string) $elapsedRemMins, 2, '0', STR_PAD_LEFT).'m',
                'is_late' => (bool) ($todayLog?->is_late ?? false),
                'late_minutes' => (int) ($todayLog?->late_minutes ?? 0),
                'is_within_geofence' => (bool) ($todayLog?->is_within_geofence ?? true),
                'geofence_deviation_meters' => (int) ($todayLog?->geofence_deviation_meters ?? 0),
            ],
            'target_site' => $targetSite,
            'calendar' => [
                'year' => (int) $monthAnchor->year,
                'month' => (int) $monthAnchor->month,
                'month_label' => $monthAnchor->format('F Y'),
                'today_day' => $monthAnchor->isSameMonth($today) ? (int) $today->day : null,
                'days_in_month' => (int) $monthAnchor->daysInMonth,
                'start_day_offset' => ((int) $monthAnchor->dayOfWeekIso) - 1,
                'days' => (object) $calendarDays,
            ],
            'summary' => AttendanceService::getTimesheetSummary($user->id, $monthAnchor->copy(), $now),
            'recent_logs' => $recentLogs,
        ]);
    }

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

        $lat = (float) $validated['latitude'];
        $lng = (float) $validated['longitude'];

        if ($validated['action'] === 'check_in') {
            $siteLat = isset($validated['site_latitude']) ? (float) $validated['site_latitude'] : null;
            $siteLng = isset($validated['site_longitude']) ? (float) $validated['site_longitude'] : null;

            if ($siteLat === null || $siteLng === null) {
                $nearestSite = $this->assignedSitesQuery($user)
                    ->with('farmerProfile')
                    ->get()
                    ->filter(fn ($s) => $s->farmerProfile?->land_latitude !== null && $s->farmerProfile?->land_longitude !== null)
                    ->sortBy(fn ($s) => AttendanceService::distanceMeters(
                        $lat,
                        $lng,
                        (float) $s->farmerProfile->land_latitude,
                        (float) $s->farmerProfile->land_longitude
                    ))
                    ->first();

                if ($nearestSite) {
                    $siteLat = (float) $nearestSite->farmerProfile->land_latitude;
                    $siteLng = (float) $nearestSite->farmerProfile->land_longitude;
                }
            }

            $log = AttendanceService::recordClockIn(
                $user,
                $lat,
                $lng,
                $validated['selfie_image_path'] ?? null,
                $siteLat,
                $siteLng
            );

            $this->recordLivePoint($user, $lat, $lng);

            if (SessionActivity::tableReady()) {
                SessionActivity::record(
                    'employee_clock_out',
                    "Employee {$user->name} clocked out ({$log->total_hours} hrs logged).",
                    $request,
                    $user,
                    'info',
                    0,
                    ['total_hours' => (float) $log->total_hours]
                );
            }

            return response()->json([
                'status' => 'success',
                'action' => 'check_in',
                'check_in_at' => $log->check_in_timestamp?->format('h:i A'),
                'check_in_iso' => $log->check_in_timestamp?->toIso8601String(),
                'is_late' => (bool) $log->is_late,
                'late_minutes' => (int) $log->late_minutes,
                'is_within_geofence' => (bool) $log->is_within_geofence,
                'geofence_deviation_meters' => (int) $log->geofence_deviation_meters,
            ]);
        }

        if ($validated['action'] === 'check_out') {
            $log = AttendanceService::recordClockOut($user, $lat, $lng);
            if (! $log) {
                return response()->json([
                    'message' => 'You have not clocked in today yet.',
                ], 422);
            }

            $this->recordLivePoint($user, $lat, $lng);

            if (SessionActivity::tableReady()) {
                SessionActivity::record(
                    'employee_clock_out',
                    "Employee {$user->name} clocked out ({$log->total_hours} hrs logged).",
                    $request,
                    $user,
                    'info',
                    0,
                    ['total_hours' => (float) $log->total_hours]
                );
            }

            return response()->json([
                'status' => 'success',
                'action' => 'check_out',
                'check_out_at' => $log->check_out_timestamp?->format('h:i A'),
                'total_hours' => (float) $log->total_hours,
                'regular_hours' => (float) $log->regular_hours,
                'overtime_hours' => (float) $log->overtime_hours,
                'is_early_checkout' => (bool) $log->is_early_checkout,
            ]);
        }

        return response()->json(['status' => 'success']);
    }

    public function locationPing(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'accuracy' => 'nullable|numeric',
            'is_gps_enabled' => 'nullable|boolean',
            'battery_level' => 'nullable|integer',
            'speed' => 'nullable|numeric',
            'heading' => 'nullable|numeric',
        ]);
        $user = $request->user();
        IndustryService::syncUserService($user, $request);
        $isGpsEnabled = (bool) ($validated['is_gps_enabled'] ?? true);
        $batteryLevel = (int) ($validated['battery_level'] ?? 95);
        $lat = (float) $validated['latitude'];
        $lng = (float) $validated['longitude'];
        $speed = isset($validated['speed']) ? (float) $validated['speed'] : 0.0;
        $heading = isset($validated['heading']) ? (float) $validated['heading'] : 0.0;
        $accuracy = isset($validated['accuracy']) ? (float) $validated['accuracy'] : 10.0;

        $user->locationLogs()->create([
            'latitude' => $lat,
            'longitude' => $lng,
            'is_gps_enabled' => $isGpsEnabled,
            'battery_level' => $batteryLevel,
            'recorded_at' => now(),
        ]);

        $this->recordLivePoint($user, $lat, $lng, $accuracy, $speed, $heading);

        GeofenceTrackingService::logPing(
            $user,
            $lat,
            $lng,
            $accuracy,
            $speed,
            $heading,
            $batteryLevel
        );

        broadcast(new LocationUpdated(
            $user->id,
            $lat,
            $lng,
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
        $authUser = $request->user();
        $employeeId = $authUser?->id
            ?? User::where('role', 'employee')->first()?->id
            ?? 1;
        $farmerUser = User::firstOrCreate(
            ['phone' => $validated['phone']],
            [
                'name' => $validated['name'] ?? 'Registered Site Contact',
                'email' => $validated['phone'].'@farmer.inymart.com',
                'password' => Hash::make($validated['phone']),
                'role' => 'farmer',
                'status' => 'pending_approval',
                'company_id' => $authUser?->company_id,
                'industry' => $authUser ? IndustryService::syncUserService($authUser, $request) : null,
            ]
        );
        FarmerProfile::updateOrCreate(
            ['user_id' => $farmerUser->id],
            [
                'created_by_employee_id' => $employeeId,
                'assigned_to' => $authUser?->id,
                'assignment_mode' => $authUser ? 'selected' : 'all',
                'approval_status' => 'pending',
                'farmer_code' => null,
                'land_size_acres' => $validated['land_size_acres'] ?? 1.0,
                'land_latitude' => $validated['land_latitude'] ?? null,
                'land_longitude' => $validated['land_longitude'] ?? null,
                'land_address' => $validated['land_address'] ?? ($validated['village'] ?? ''),
                'mobile_number' => $validated['phone'],
                'village' => $validated['village'] ?? '',
                'district' => $validated['district'] ?? '',
                'state' => $validated['state'] ?? 'Tamil Nadu',
                'soil_type' => $validated['soil_type'] ?? null,
                'irrigation_type' => $validated['irrigation_type'] ?? null,
                'customer_category' => $validated['customer_category'] ?? 'standard',
                'crop_types' => $validated['crop_types'] ?? [],
                'kyc_status' => 'pending',
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Site registered successfully and is pending admin approval',
            'farmer_id' => $farmerUser->id,
            'farmer_code' => null,
        ]);
    }

    /**
     * POST /api/v1/employee/visit/check-in
     * Creates a live in-progress FarmerVisit, transitions linked task to in_progress,
     * validates real site geofence distance, and attaches optional check-in photo.
     */
    public function checkInVisit(Request $request)
    {
        $validated = $request->validate([
            'farmer_id' => 'nullable|integer|exists:users,id',
            'site_id' => 'nullable|integer|exists:users,id',
            'task_id' => 'nullable',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'media_id' => 'nullable|integer',
        ]);

        $user = $request->user();
        $industry = IndustryService::syncUserService($user, $request);
        $lat = (float) $validated['latitude'];
        $lng = (float) $validated['longitude'];

        $task = null;
        if (! empty($validated['task_id']) && is_numeric($validated['task_id'])) {
            $task = $this->employeeTasksQuery($user, $industry)
                ->whereKey((int) $validated['task_id'])
                ->first();
        }

        $farmerId = $validated['farmer_id']
            ?? $validated['site_id']
            ?? $task?->customer_id
            ?? $this->assignedSitesQuery($user)->value('id')
            ?? $user->id;

        $siteUser = User::with('farmerProfile')->find($farmerId);
        $siteLat = $siteUser?->farmerProfile?->land_latitude !== null ? (float) $siteUser->farmerProfile->land_latitude : null;
        $siteLng = $siteUser?->farmerProfile?->land_longitude !== null ? (float) $siteUser->farmerProfile->land_longitude : null;
        $geofence = AttendanceService::checkGeofence($lat, $lng, $siteLat, $siteLng, 250);

        $existingOpenVisit = FarmerVisit::where('employee_id', $user->id)
            ->where('farmer_id', $farmerId)
            ->whereDate('check_in_time', Carbon::today())
            ->whereNull('check_out_time')
            ->latest('id')
            ->first();

        if ($existingOpenVisit) {
            $visit = $existingOpenVisit;
        } else {
            $distanceKm = $this->computeDistanceFromPreviousKm($user, $lat, $lng);
            $visit = FarmerVisit::create([
                'employee_id' => $user->id,
                'farmer_id' => $farmerId,
                'industry' => $industry,
                'check_in_time' => now(),
                'check_out_time' => null,
                'check_in_latitude' => $lat,
                'check_in_longitude' => $lng,
                'distance_from_previous_farmer_km' => $distanceKm,
                'farm_condition_notes' => 'Checked in on site — inspection in progress.',
            ]);
        }

        if ($task && $task->status === 'pending') {
            $task->update(['status' => 'in_progress']);
        }

        if (! empty($validated['media_id']) && MediaFile::tableReady()) {
            $media = MediaFile::whereKey((int) $validated['media_id'])
                ->where('uploaded_by', $user->id)
                ->first();
            if ($media) {
                $media->update([
                    'visit_id' => $visit->id,
                    'task_id' => $task?->id ?? $media->task_id,
                    'farmer_id' => $farmerId ?: $media->farmer_id,
                ]);
            }
        }

        $this->recordLivePoint($user, $lat, $lng);

        if (SessionActivity::tableReady()) {
            $siteLabel = $siteUser?->name ?? 'Assigned Site';
            SessionActivity::record(
                'employee_visit_checkin',
                "Employee {$user->name} checked in at {$siteLabel}.",
                $request,
                $user,
                'info',
                0,
                ['visit_id' => $visit->id, 'site_name' => $siteLabel]
            );
        }

        if (SessionActivity::tableReady()) {
            SessionActivity::record(
                'employee_visit_submitted',
                "Employee {$user->name} submitted a visit report (Visit #{$visit->id}).",
                $request,
                $user,
                'info',
                0,
                ['visit_id' => $visit->id]
            );
        }

        return response()->json([
            'status' => 'success',
            'visit_id' => $visit->id,
            'site_name' => $siteUser?->name,
            'check_in_time' => Carbon::parse($visit->check_in_time)->format('h:i A'),
            'check_in_iso' => Carbon::parse($visit->check_in_time)->toIso8601String(),
            'distance_to_site_meters' => $geofence['distance_meters'],
            'is_within_site_radius' => $geofence['is_within'],
            'has_site_coordinates' => $siteLat !== null && $siteLng !== null,
            'requires_otp' => (bool) ($task && $task->customer_otp),
        ]);
    }

    public function submitVisit(Request $request)
    {
        $validated = $request->validate([
            'visit_id' => 'nullable|integer',
            'farmer_id' => 'nullable|integer|exists:users,id',
            'site_id' => 'nullable|integer|exists:users,id',
            'task_id' => 'nullable',
            'check_in_latitude' => 'nullable|numeric',
            'check_in_longitude' => 'nullable|numeric',
            'check_out_latitude' => 'nullable|numeric',
            'check_out_longitude' => 'nullable|numeric',
            'distance_km' => 'nullable|numeric',
            'farm_condition_notes' => 'nullable|string',
            'notes' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'before_photo' => 'nullable|string',
            'after_photo' => 'nullable|string',
            'media_ids' => 'nullable|array',
            'media_ids.*' => 'integer',
            'customer_otp' => 'nullable|string|max:12',
            'otp_verified' => 'nullable|boolean',
        ]);

        $user = $request->user();
        $industry = IndustryService::syncUserService($user, $request);
        $task = null;
        if (! empty($validated['task_id']) && is_numeric($validated['task_id'])) {
            $task = $this->employeeTasksQuery($user, $industry)
                ->whereKey((int) $validated['task_id'])
                ->firstOrFail();
            if ($task->customer_otp) {
                $submittedOtp = trim((string) ($validated['customer_otp'] ?? ''));
                if ($submittedOtp === '') {
                    return response()->json(['message' => 'Customer OTP verification code is required for this work order.'], 422);
                }
                if (! hash_equals((string) $task->customer_otp, $submittedOtp)) {
                    return response()->json(['message' => 'The customer verification code is incorrect.'], 422);
                }
            }
        }
        $otpVerified = $task && $task->customer_otp
            ? hash_equals((string) $task->customer_otp, trim((string) ($validated['customer_otp'] ?? '')))
            : false;

        $farmerId = $validated['farmer_id']
            ?? $validated['site_id']
            ?? $task?->customer_id
            ?? $this->assignedSitesQuery($user)->value('id')
            ?? $user->id;

        $notes = trim((string) ($validated['farm_condition_notes'] ?? $validated['notes'] ?? ''));
        if ($notes === '') {
            $notes = 'Field work completed and verified.';
        }

        $inLat = isset($validated['check_in_latitude']) ? (float) $validated['check_in_latitude'] : null;
        $inLng = isset($validated['check_in_longitude']) ? (float) $validated['check_in_longitude'] : null;
        $outLat = isset($validated['check_out_latitude']) ? (float) $validated['check_out_latitude'] : $inLat;
        $outLng = isset($validated['check_out_longitude']) ? (float) $validated['check_out_longitude'] : $inLng;

        // Complete an active in-progress visit if one was started at check-in
        $visit = null;
        if (! empty($validated['visit_id'])) {
            $visit = FarmerVisit::whereKey((int) $validated['visit_id'])
                ->where('employee_id', $user->id)
                ->first();
        }
        if (! $visit) {
            $visit = FarmerVisit::where('employee_id', $user->id)
                ->where('farmer_id', $farmerId)
                ->whereDate('check_in_time', Carbon::today())
                ->whereNull('check_out_time')
                ->latest('id')
                ->first();
        }

        $distanceKm = isset($validated['distance_km']) && (float) $validated['distance_km'] > 0
            ? round((float) $validated['distance_km'], 2)
            : $this->computeDistanceFromPreviousKm($user, $outLat ?? $inLat, $outLng ?? $inLng);

        if ($visit) {
            $visit->update([
                'farmer_id' => $farmerId,
                'industry' => $industry,
                'check_out_time' => now(),
                'check_in_latitude' => $visit->check_in_latitude ?? $inLat,
                'check_in_longitude' => $visit->check_in_longitude ?? $inLng,
                'check_out_latitude' => $outLat ?? $visit->check_in_latitude,
                'check_out_longitude' => $outLng ?? $visit->check_in_longitude,
                'distance_from_previous_farmer_km' => max((float) ($visit->distance_from_previous_farmer_km ?? 0), $distanceKm),
                'farm_condition_notes' => $notes,
                'recommendations' => $validated['recommendations'] ?? null,
            ]);
        } else {
            $visit = FarmerVisit::create([
                'employee_id' => $user->id,
                'farmer_id' => $farmerId,
                'industry' => $industry,
                'check_in_time' => now(),
                'check_out_time' => now(),
                'check_in_latitude' => $inLat,
                'check_in_longitude' => $inLng,
                'check_out_latitude' => $outLat,
                'check_out_longitude' => $outLng,
                'distance_from_previous_farmer_km' => $distanceKm,
                'farm_condition_notes' => $notes,
                'recommendations' => $validated['recommendations'] ?? null,
            ]);
        }

        $pointsAwarded = 0;
        if ($task) {
            $pointsAwarded = (int) ($task->points_awarded ?: 40);
            $task->update([
                'status' => 'done',
                'points_awarded' => $pointsAwarded,
                'otp_verified' => $otpVerified,
                'before_photos' => ! empty($validated['before_photo']) ? [$validated['before_photo']] : $task->before_photos,
                'after_photos' => ! empty($validated['after_photo']) ? [$validated['after_photo']] : $task->after_photos,
            ]);
        }

        if (($outLat !== null && $outLng !== null) || ($inLat !== null && $inLng !== null)) {
            $this->recordLivePoint($user, $outLat ?? $inLat, $outLng ?? $inLng);
        }

        // Attach uploaded images/videos/files to this visit & mirror into visit_media
        if (! empty($validated['media_ids']) && MediaFile::tableReady()) {
            $mediaRecords = MediaFile::whereIn('id', $validated['media_ids'])
                ->where(function ($q) use ($user) {
                    $q->where('uploaded_by', $user->id);
                    if ($user->company_id) {
                        $q->orWhere('company_id', $user->company_id);
                    }
                })
                ->get();

            foreach ($mediaRecords as $media) {
                $media->update([
                    'visit_id' => $visit->id,
                    'task_id' => $task?->id ?? $media->task_id,
                    'farmer_id' => $farmerId ?: $media->farmer_id,
                ]);
                if (in_array($media->category, ['image', 'video'], true) && Schema::hasTable('visit_media')) {
                    $alreadyMirrored = DB::table('visit_media')
                        ->where('visit_id', $visit->id)
                        ->where('file_path', $media->stored_path)
                        ->exists();
                    if (! $alreadyMirrored) {
                        DB::table('visit_media')->insert([
                            'visit_id' => $visit->id,
                            'file_path' => $media->stored_path,
                            'file_type' => $media->category === 'video' ? 'video' : 'photo',
                            'captured_latitude' => $media->captured_latitude ?? $visit->check_in_latitude,
                            'captured_longitude' => $media->captured_longitude ?? $visit->check_in_longitude,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        }

        if (SessionActivity::tableReady()) {
            SessionActivity::record(
                'employee_visit_submitted',
                "Employee {$user->name} submitted a visit report (Visit #{$visit->id}).",
                $request,
                $user,
                'info',
                0,
                ['visit_id' => $visit->id]
            );
        }

        return response()->json([
            'status' => 'success',
            'visit_id' => $visit->id,
            'points_awarded' => $pointsAwarded,
            'dossier_url' => URL::temporarySignedRoute('media.signed.visit-dossier', now()->addHours(12), ['id' => $visit->id]),
        ]);
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

    public function dashboard(Request $request, EmployeePerformanceService $performanceService)
    {
        $user = $request->user()->load(['company', 'employeeDetail']);
        $today = Carbon::today();
        $now = CarbonImmutable::now();
        $industry = IndustryService::syncUserService($user, $request);

        $attendance = AttendanceLog::where('employee_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        $visitsCount = FarmerVisit::where('employee_id', $user->id)->count();
        $visitsToday = FarmerVisit::where('employee_id', $user->id)
            ->whereDate('check_in_time', $today)
            ->count();

        $totalSites = $this->assignedSitesQuery($user)->count();
        $allTasksQuery = $this->employeeTasksQuery($user, $industry);

        $activeTasksCount = (clone $allTasksQuery)->whereIn('status', ['pending', 'in_progress'])->count();
        $completedTasksCount = (clone $allTasksQuery)->where('status', 'done')->count();
        $totalTasksCount = $activeTasksCount + $completedTasksCount;
        $earnedPoints = (int) ((clone $allTasksQuery)->where('status', 'done')->sum('points_awarded') ?? 0);

        $perfSummary = $performanceService->summarize($user, $now->startOfMonth(), $now);
        $taskCompletionRate = $totalTasksCount > 0 ? round(($completedTasksCount / $totalTasksCount) * 100, 1) : 0;

        $todayPoints = Schema::hasTable('location_points')
            ? LocationPoint::where('employee_id', $user->id)
                ->whereDate('created_at', $today)
                ->orderBy('timestamp')
                ->get()
            : collect();
        $distanceTodayKm = $todayPoints->count() > 1
            ? GeofenceTrackingService::calculateTotalDistanceKm($todayPoints)
            : (float) FarmerVisit::where('employee_id', $user->id)
                ->whereDate('check_in_time', $today)
                ->sum('distance_from_previous_farmer_km');

        $activeTasks = (clone $allTasksQuery)
            ->with(['customer.farmerProfile'])
            ->whereIn('status', ['in_progress', 'pending'])
            ->orderByRaw("CASE status WHEN 'in_progress' THEN 1 ELSE 2 END")
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END")
            ->limit(5)
            ->get()
            ->map(function ($t) use ($industry) {
                $site = $t->customer;
                $profile = $site?->farmerProfile;

                return [
                    'id' => (string) $t->id,
                    'workOrderCode' => $t->work_order_code ?: 'WO-'.str_pad((string) $t->id, 5, '0', STR_PAD_LEFT),
                    'title' => $t->title,
                    'description' => $t->description,
                    'industry' => $t->industry ?: $industry,
                    'targetEntity' => $site?->name,
                    'farmerId' => $site?->id ? (string) $site->id : null,
                    'address' => $profile?->land_address ?? $profile?->address,
                    'latitude' => $profile?->land_latitude !== null ? (float) $profile->land_latitude : null,
                    'longitude' => $profile?->land_longitude !== null ? (float) $profile->land_longitude : null,
                    'priority' => ucfirst($t->priority ?: 'medium'),
                    'status' => $t->status === 'in_progress' ? 'In Progress' : 'Pending',
                    'rawStatus' => $t->status ?: 'pending',
                    'due' => $t->due_date ? ($t->due_date->isToday() ? 'Today' : $t->due_date->format('M d, Y')) : 'Flexible',
                    'points' => (int) ($t->points_awarded ?: 40),
                    'requiresOtp' => ! empty($t->customer_otp),
                ];
            })
            ->values();

        $mapVisit = function ($v) {
            $farmer = $v->farmer;
            $profile = $farmer?->farmerProfile;

            return [
                'id' => (string) $v->id,
                'farmerId' => (string) ($farmer?->id ?? ''),
                'farmerName' => $farmer?->name ?? 'Assigned Site',
                'farmerPhone' => $farmer?->phone ?? '',
                'address' => $profile?->land_address ?? $profile?->address,
                'acres' => $profile?->land_size_acres ? "{$profile->land_size_acres} Units" : null,
                'date' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('M d, Y') : null,
                'time' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('h:i A') : null,
                'checkOutTime' => $v->check_out_time ? Carbon::parse($v->check_out_time)->format('h:i A') : null,
                'status' => $v->check_out_time ? 'completed' : ($v->check_in_time ? 'in_progress' : 'pending'),
                'remarks' => $v->farm_condition_notes,
                'distanceKm' => (float) ($v->distance_from_previous_farmer_km ?? 0),
            ];
        };

        $recentVisits = FarmerVisit::where('employee_id', $user->id)
            ->with(['farmer.farmerProfile'])
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map($mapVisit)
            ->values();

        $todayVisits = FarmerVisit::where('employee_id', $user->id)
            ->whereDate('check_in_time', $today)
            ->with(['farmer.farmerProfile'])
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->map($mapVisit)
            ->values();

        $unreadNotificationsCount = $activeTasksCount
            + EmergencyAlert::where('employee_id', $user->id)->where('is_resolved', false)->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'employee' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'designation' => $user->employeeDetail?->designation,
                    'employee_code' => $user->employeeDetail?->employee_code,
                    'region' => $user->employeeDetail?->assigned_region,
                    'company_id' => $user->company_id,
                    'company_name' => $user->company?->name,
                    'is_tenant' => ! empty($user->company_id),
                    'industry' => $industry,
                ],
                'attendance' => $attendance ? [
                    'checked_in' => ! is_null($attendance->check_in_timestamp),
                    'check_in_at' => $attendance->check_in_timestamp ? Carbon::parse($attendance->check_in_timestamp)->format('h:i A') : null,
                    'check_in_iso' => $attendance->check_in_timestamp ? Carbon::parse($attendance->check_in_timestamp)->toIso8601String() : null,
                    'checked_out' => ! is_null($attendance->check_out_timestamp),
                    'check_out_at' => $attendance->check_out_timestamp ? Carbon::parse($attendance->check_out_timestamp)->format('h:i A') : null,
                    'total_hours' => (float) ($attendance->total_hours ?? 0),
                    'is_within_geofence' => (bool) ($attendance->is_within_geofence ?? true),
                    'latitude' => $attendance->check_in_latitude,
                    'longitude' => $attendance->check_in_longitude,
                ] : ['checked_in' => false, 'checked_out' => false],
                'visits_today' => $visitsToday,
                'visits_total' => $visitsCount,
                'total_farmers' => $totalSites,
                'pending_tasks' => $activeTasksCount,
                'pending_visits' => FarmerVisit::where('employee_id', $user->id)->whereNull('check_out_time')->count(),
                'stats' => [
                    'sites_count' => $totalSites,
                    'tasks_count' => $activeTasksCount,
                    'completed_tasks_count' => $completedTasksCount,
                    'visits_count' => $visitsCount,
                    'visits_today' => $visitsToday,
                    'points_earned' => $earnedPoints,
                    'score' => $perfSummary['score'] ?? 0,
                    'has_score' => $perfSummary['score'] !== null,
                    'task_completion_rate' => $taskCompletionRate,
                    'hours_worked' => (float) ($perfSummary['hours_worked'] ?? 0),
                    'distance_today_km' => round($distanceTodayKm, 2),
                    'unread_notifications' => $unreadNotificationsCount,
                ],
                'active_tasks' => $activeTasks,
                'today_visits' => $todayVisits,
                'recent_visits' => $recentVisits,
            ],
        ]);
    }

    public function performance(Request $request, EmployeePerformanceService $performanceService)
    {
        $user = $request->user()->load(['company', 'employeeDetail']);
        $industry = IndustryService::syncUserService($user, $request);
        $now = CarbonImmutable::now();
        $summary = $performanceService->summarize($user, $now->startOfMonth(), $now);

        $tasks = $this->employeeTasksQuery($user, $industry);

        $attendance = AttendanceLog::where('employee_id', $user->id)
            ->whereBetween('date', [Carbon::now()->startOfMonth()->toDateString(), Carbon::today()->toDateString()])
            ->orderByDesc('date')
            ->get();

        $visits = FarmerVisit::where('employee_id', $user->id)
            ->whereDate('check_in_time', '>=', Carbon::now()->startOfMonth())
            ->whereDate('check_in_time', '<=', Carbon::today())
            ->count();
        $completedVisits = FarmerVisit::where('employee_id', $user->id)
            ->whereDate('check_in_time', '>=', Carbon::now()->startOfMonth())
            ->whereDate('check_in_time', '<=', Carbon::today())
            ->whereNotNull('check_out_time')
            ->count();
        $distanceMonthKm = (float) FarmerVisit::where('employee_id', $user->id)
            ->whereDate('check_in_time', '>=', Carbon::now()->startOfMonth())
            ->whereDate('check_in_time', '<=', Carbon::today())
            ->sum('distance_from_previous_farmer_km');

        $workdaysElapsed = 0;
        for ($day = Carbon::now()->startOfMonth(); $day->lte(Carbon::today()); $day->addDay()) {
            if ($day->isWeekday()) {
                $workdaysElapsed++;
            }
        }
        $attendanceDays = $attendance->whereNotNull('check_in_timestamp')->count();
        $punctualDays = $attendance->where('is_late', false)->whereNotNull('check_in_timestamp')->count();
        $hours = $attendance->sum(function ($log) {
            if ((float) ($log->total_hours ?? 0) > 0) {
                return (float) $log->total_hours;
            }
            if ($log->check_in_timestamp && $log->check_out_timestamp) {
                return round(Carbon::parse($log->check_in_timestamp)->diffInMinutes(Carbon::parse($log->check_out_timestamp)) / 60, 2);
            }

            return 0;
        });

        $taskCount = (clone $tasks)->whereIn('status', ['pending', 'in_progress', 'done'])->count();
        $completedTaskCount = (clone $tasks)->where('status', 'done')->count();
        $earnedPoints = (int) ((clone $tasks)->where('status', 'done')->sum('points_awarded') ?? 0);
        $pendingTaskCount = (clone $tasks)->whereIn('status', ['pending', 'in_progress'])->count();

        // Real current-week Mon-Sun activity breakdown
        $weekStart = Carbon::today()->startOfWeek(Carbon::MONDAY);
        $weeklyBars = [];
        for ($offset = 0; $offset < 7; $offset++) {
            $dayDate = $weekStart->copy()->addDays($offset);
            $dayTasksDone = (clone $tasks)
                ->where('status', 'done')
                ->where(function ($q) use ($dayDate) {
                    $q->whereDate('completed_at', $dayDate)
                        ->orWhere(fn ($sub) => $sub->whereNull('completed_at')->whereDate('updated_at', $dayDate));
                })
                ->count();
            $dayVisitsDone = FarmerVisit::where('employee_id', $user->id)
                ->whereDate('check_in_time', $dayDate)
                ->count();
            $dayAtt = $attendance->first(fn ($l) => $l->date && $l->date->isSameDay($dayDate));
            $dayHours = $dayAtt ? (float) ($dayAtt->total_hours ?? 0) : 0.0;

            $weeklyBars[] = [
                'day' => $dayDate->format('D'),
                'date' => $dayDate->toDateString(),
                'tasks_done' => $dayTasksDone,
                'visits_done' => $dayVisitsDone,
                'total_actions' => $dayTasksDone + $dayVisitsDone,
                'hours' => round($dayHours, 1),
                'is_today' => $dayDate->isToday(),
            ];
        }

        $recentTasks = (clone $tasks)
            ->with('customer:id,name')
            ->orderByDesc('updated_at')
            ->limit(6)
            ->get()
            ->map(fn ($task) => [
                'id' => (string) $task->id,
                'workOrderCode' => $task->work_order_code ?: 'WO-'.str_pad((string) $task->id, 5, '0', STR_PAD_LEFT),
                'title' => $task->title,
                'site' => $task->customer?->name,
                'status' => $task->status,
                'priority' => ucfirst($task->priority ?: 'medium'),
                'points' => (int) ($task->points_awarded ?? 0),
                'updated_at' => $task->updated_at?->toIso8601String(),
                'date_label' => $task->updated_at?->format('M d, h:i A'),
            ]);

        return response()->json([
            'status' => 'success',
            'period' => Carbon::now()->format('F Y'),
            'score' => $summary['score'] ?? 0,
            'has_activity' => $summary['score'] !== null || $taskCount > 0 || $visits > 0 || $attendanceDays > 0,
            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
                'designation' => $user->employeeDetail?->designation,
                'employee_code' => $user->employeeDetail?->employee_code,
                'company_name' => $user->company?->name,
            ],
            'metrics' => [
                'score' => $summary['score'] ?? 0,
                'tasks_total' => $taskCount,
                'tasks_completed' => $completedTaskCount,
                'tasks_pending' => $pendingTaskCount,
                'tasks_on_time' => (int) ($summary['tasks_on_time'] ?? 0),
                'task_completion_rate' => $taskCount ? round($completedTaskCount * 100 / $taskCount, 1) : 0,
                'points_earned' => $earnedPoints,
                'attendance_days' => $attendanceDays,
                'workdays_elapsed' => $workdaysElapsed,
                'attendance_rate' => $workdaysElapsed ? round($attendanceDays * 100 / $workdaysElapsed, 1) : 0,
                'punctual_days' => $punctualDays,
                'punctuality_rate' => $attendanceDays ? round($punctualDays * 100 / $attendanceDays, 1) : 0,
                'hours_worked' => round($hours, 2),
                'visits_total' => $visits,
                'visits_completed' => $completedVisits,
                'visit_completion_rate' => $visits ? round($completedVisits * 100 / $visits, 1) : 0,
                'distance_km_month' => round($distanceMonthKm, 2),
                'rating' => $summary['rating'],
            ],
            'weekly_bars' => $weeklyBars,
            'attendance' => $attendance->map(fn ($log) => [
                'date' => $log->date?->toDateString(),
                'date_label' => $log->date?->format('M d, Y'),
                'check_in' => $log->check_in_timestamp?->format('h:i A'),
                'check_out' => $log->check_out_timestamp?->format('h:i A'),
                'hours' => (float) ($log->total_hours ?? 0),
                'is_late' => (bool) ($log->is_late ?? false),
            ])->values(),
            'recent_tasks' => $recentTasks,
        ]);
    }

    public function tasks(Request $request)
    {
        $user = $request->user()->load('company');
        $industry = IndustryService::syncUserService($user, $request);

        $tasks = $this->employeeTasksQuery($user, $industry)
            ->with(['customer.farmerProfile'])
            ->orderByRaw("CASE status WHEN 'in_progress' THEN 1 WHEN 'pending' THEN 2 WHEN 'done' THEN 3 ELSE 4 END")
            ->orderByDesc('id')
            ->get()
            ->map(function ($t) use ($industry) {
                $site = $t->customer;
                $profile = $site?->farmerProfile;
                $checklist = $this->normalizeChecklist($t->checklist);
                $doneItems = count(array_filter($checklist, fn ($c) => ! empty($c['done'])));

                return [
                    'id' => (string) $t->id,
                    'workOrderCode' => $t->work_order_code ?: 'WO-'.str_pad((string) $t->id, 5, '0', STR_PAD_LEFT),
                    'title' => $t->title,
                    'description' => $t->description,
                    'industry' => $t->industry ?: $industry,
                    'targetEntity' => $site?->name,
                    'facility' => $site?->name,
                    'farmerId' => $site?->id ? (string) $site->id : null,
                    'sitePhone' => $site?->phone,
                    'address' => $profile?->land_address ?? $profile?->address,
                    'latitude' => $profile?->land_latitude !== null ? (float) $profile->land_latitude : null,
                    'longitude' => $profile?->land_longitude !== null ? (float) $profile->land_longitude : null,
                    'priority' => ucfirst($t->priority ?: 'medium'),
                    'status' => $t->status === 'done' ? 'Completed' : ($t->status === 'in_progress' ? 'In Progress' : 'Pending'),
                    'rawStatus' => $t->status ?: 'pending',
                    'due' => $t->due_date ? ($t->due_date->isToday() ? 'Today' : $t->due_date->format('M d, Y')) : 'No deadline',
                    'dueDateIso' => $t->due_date?->toDateString(),
                    'createdAtIso' => $t->created_at?->toDateString(),
                    'completedAt' => $t->completed_at?->format('M d, Y • h:i A'),
                    'points' => (int) ($t->points_awarded ?: 40),
                    'aiDiagnostic' => $t->ai_suggestions,
                    'checklist' => $checklist,
                    'checklistDoneCount' => $doneItems,
                    'checklistTotalCount' => count($checklist),
                    'safety_requirements' => is_array($t->safety_requirements) ? $t->safety_requirements : [],
                    'requires_otp' => ! empty($t->customer_otp),
                    'otp_verified' => (bool) $t->otp_verified,
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
        $user = $request->user();
        $industry = IndustryService::syncUserService($user, $request);
        $task = $this->employeeTasksQuery($user, $industry)->whereKey($id)->firstOrFail();
        $task->update(['status' => $validated['status']]);

        if ($task->wasChanged('status') && SessionActivity::tableReady()) {
            $cancelled = $task->status === 'cancelled';
            SessionActivity::record(
                $cancelled ? 'employee_task_cancelled' : 'employee_task_updated',
                $cancelled
                    ? "{$user->name} cancelled work order \"{$task->title}\"."
                    : "{$user->name} updated work order \"{$task->title}\" to {$task->status}.",
                $request,
                $user,
                'info',
                0,
                ['task_id' => $task->id, 'status' => $validated['status']]
            );
        }

        return response()->json(['status' => 'success', 'task' => $task]);
    }

    public function updateTaskChecklist(Request $request, $id)
    {
        $validated = $request->validate([
            'checklist' => 'required|array',
        ]);
        $user = $request->user();
        $industry = IndustryService::syncUserService($user, $request);
        $task = $this->employeeTasksQuery($user, $industry)->whereKey($id)->firstOrFail();

        $normalized = $this->normalizeChecklist($validated['checklist']);
        $updates = ['checklist' => $normalized];
        if ($task->status === 'pending' && collect($normalized)->contains(fn ($c) => ! empty($c['done']))) {
            $updates['status'] = 'in_progress';
        }
        $task->update($updates);

        if (SessionActivity::tableReady()) {
            $doneCount = collect($normalized)->where('done', true)->count();
            $totalCount = count($normalized);
            SessionActivity::record(
                'employee_task_updated',
                "Employee {$user->name} updated checklist ({$doneCount}/{$totalCount}) on \"{$task->title}\".",
                $request,
                $user,
                'info',
                0,
                ['task_id' => $task->id, 'done' => $doneCount, 'total' => $totalCount]
            );
        }

        return response()->json([
            'status' => 'success',
            'checklist' => $normalized,
            'task_status' => $task->status,
        ]);
    }

    public function sites(Request $request)
    {
        $user = $request->user()->load('company');
        $industry = IndustryService::syncUserService($user, $request);

        $visitCounts = FarmerVisit::where('employee_id', $user->id)
            ->select('farmer_id', DB::raw('COUNT(*) as total_visits'), DB::raw('MAX(check_in_time) as last_visit_at'))
            ->groupBy('farmer_id')
            ->get()
            ->keyBy('farmer_id');

        $sites = $this->assignedSitesQuery($user)
            ->with('farmerProfile')
            ->orderByDesc('id')
            ->get()
            ->map(function ($site) use ($industry, $visitCounts) {
                $fp = $site->farmerProfile;
                $vStat = $visitCounts->get($site->id);

                return [
                    'id' => (string) $site->id,
                    'site_contact_id' => (string) $site->id,
                    'name' => $site->name,
                    'phone' => $site->phone,
                    'email' => $site->email,
                    'site_code' => $fp?->farmer_code ?: 'SITE-'.str_pad((string) $site->id, 4, '0', STR_PAD_LEFT),
                    'site_address' => $fp?->land_address ?? $fp?->address,
                    'address' => $fp?->land_address ?? $fp?->address,
                    'city' => $fp?->district,
                    'area' => $fp?->village,
                    'state' => $fp?->state,
                    'type' => ucfirst(str_replace('_', ' ', (string) ($fp?->customer_category ?? $industry))),
                    'size' => $fp?->land_size_acres ? (string) $fp->land_size_acres : null,
                    'approval_status' => $fp?->approval_status ?? 'approved',
                    'latitude' => $fp?->land_latitude !== null ? (float) $fp->land_latitude : null,
                    'longitude' => $fp?->land_longitude !== null ? (float) $fp->land_longitude : null,
                    'visits_count' => (int) ($vStat?->total_visits ?? 0),
                    'last_visit_at' => $vStat?->last_visit_at ? Carbon::parse($vStat->last_visit_at)->format('M d, Y') : null,
                ];
            });

        return response()->json(['status' => 'success', 'industry' => $industry, 'sites' => $sites]);
    }

    public function visits(Request $request)
    {
        $employeeId = $request->user()->id;
        $with = ['farmer.farmerProfile'];
        if (MediaFile::tableReady()) {
            $with[] = 'mediaFiles.uploader:id,name';
        }

        $visits = FarmerVisit::where('employee_id', $employeeId)
            ->with($with)
            ->orderByDesc('id')
            ->get()
            ->map(function ($v) {
                $farmer = $v->farmer;
                $profile = $farmer?->farmerProfile;
                $media = MediaFile::tableReady()
                    ? $v->mediaFiles->map(fn (MediaFile $m) => $m->toPayload(true))->values()->all()
                    : [];

                $checkIn = $v->check_in_time ? Carbon::parse($v->check_in_time) : ($v->created_at ? Carbon::parse($v->created_at) : Carbon::now());
                $checkOut = $v->check_out_time ? Carbon::parse($v->check_out_time) : null;
                $durationMins = $checkOut ? max(1, (int) $checkIn->diffInMinutes($checkOut)) : null;

                return [
                    'id' => (string) $v->id,
                    'visitCode' => 'VST-'.str_pad((string) $v->id, 4, '0', STR_PAD_LEFT),
                    'farmerId' => (string) ($farmer?->id ?? ''),
                    'farmerName' => $farmer?->name ?? 'Assigned Site',
                    'farmerPhone' => $farmer?->phone ?? '',
                    'farmerCode' => $profile?->farmer_code ?: ($farmer ? 'SITE-'.str_pad((string) $farmer->id, 4, '0', STR_PAD_LEFT) : null),
                    'address' => $profile?->land_address ?? $profile?->address,
                    'city' => $profile?->district ?? $profile?->village,
                    'acres' => $profile?->land_size_acres ? "{$profile->land_size_acres} Units" : null,
                    'cropType' => $profile?->crop_types[0] ?? null,
                    'date' => $checkIn->format('M d, Y'),
                    'dateIso' => $checkIn->toDateString(),
                    'monthKey' => $checkIn->format('Y-m'),
                    'monthLabel' => $checkIn->format('F Y'),
                    'time' => $checkIn->format('h:i A'),
                    'checkInTime' => $checkIn->format('h:i A'),
                    'checkOutTime' => $checkOut?->format('h:i A'),
                    'durationMinutes' => $durationMins,
                    'distanceKm' => (float) ($v->distance_from_previous_farmer_km ?? 0),
                    'latitude' => $v->check_in_latitude !== null ? (float) $v->check_in_latitude : ($profile?->land_latitude !== null ? (float) $profile->land_latitude : null),
                    'longitude' => $v->check_in_longitude !== null ? (float) $v->check_in_longitude : ($profile?->land_longitude !== null ? (float) $profile->land_longitude : null),
                    'status' => $v->check_out_time ? 'completed' : ($v->check_in_time ? 'in_progress' : 'pending'),
                    'visitFrequency' => null,
                    'remarks' => $v->farm_condition_notes,
                    'recommendations' => $v->recommendations,
                    'media' => $media,
                    'media_count' => count($media),
                    'dossier_url' => URL::temporarySignedRoute('media.signed.visit-dossier', now()->addHours(12), ['id' => $v->id]),
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
                'id' => $fp->user?->id,
                'name' => $fp->user?->name,
                'phone' => $fp->user?->phone,
                'farmer_code' => $fp->farmer_code,
                'land_address' => $fp->land_address,
                'kyc_status' => $fp->kyc_status,
                'land_acres' => $fp->land_size_acres,
                'crop_stage' => $fp->vetiver_crop_stage ?? 'growing',
            ]);

        return response()->json(['status' => 'success', 'farmers' => $farmers]);
    }

    /**
     * GET /api/v1/employee/notifications
     * 100% real activity feed built from assigned tasks, visits, attendance, and SOS alerts.
     */
    public function notifications(Request $request)
    {
        $user = $request->user()->load('company');
        $industry = IndustryService::syncUserService($user, $request);
        $items = collect();

        // 1. Active unresolved SOS alerts
        EmergencyAlert::where('employee_id', $user->id)
            ->latest()
            ->limit(5)
            ->get()
            ->each(function (EmergencyAlert $alert) use ($items) {
                $items->push([
                    'id' => 'sos-'.$alert->id,
                    'category' => 'alert',
                    'title' => $alert->is_resolved ? 'SOS Alert Resolved' : 'Active SOS Dispatch',
                    'message' => $alert->is_resolved
                        ? 'Your emergency alert was acknowledged and resolved by operations.'
                        : 'High-priority GPS alert transmitted to your company admin.',
                    'time' => $alert->created_at?->diffForHumans() ?? 'Recently',
                    'timestamp' => $alert->created_at?->timestamp ?? 0,
                    'isUnread' => ! $alert->is_resolved,
                    'route' => '/(employee)/sos',
                    'actionLabel' => 'View',
                ]);
            });

        // 2. Assigned work orders (urgent/pending/recently completed)
        $this->employeeTasksQuery($user, $industry)
            ->with('customer:id,name')
            ->latest('updated_at')
            ->limit(10)
            ->get()
            ->each(function (Task $task) use ($items) {
                $siteName = $task->customer?->name ? " at {$task->customer->name}" : '';
                $isDone = $task->status === 'done';
                $isCancelled = $task->status === 'cancelled';
                $items->push([
                    'id' => 'task-'.$task->id,
                    'category' => $isCancelled ? 'alert' : ($isDone ? 'completed' : ($task->priority === 'urgent' ? 'urgent' : 'task')),
                    'title' => $isCancelled ? 'Work Order Cancelled' : ($isDone ? 'Work Order Completed' : 'Assigned Work Order'),
                    'message' => "{$task->title}{$siteName}".($isCancelled ? ' was cancelled.' : ($task->due_date && ! $isDone ? ' • Due '.$task->due_date->format('M d') : '')),
                    'time' => $task->updated_at?->diffForHumans() ?? 'Recently',
                    'timestamp' => $task->updated_at?->timestamp ?? 0,
                    'isUnread' => ! $isDone,
                    'route' => '/(employee)/task/'.$task->id,
                    'actionLabel' => $isDone || $isCancelled ? 'Details' : 'Open',
                ]);
            });

        // 3. Recent visits & client reviews
        FarmerVisit::where('employee_id', $user->id)
            ->with('farmer:id,name')
            ->latest('id')
            ->limit(8)
            ->get()
            ->each(function (FarmerVisit $visit) use ($items) {
                $site = $visit->farmer?->name ?? 'Assigned Site';
                $completed = ! is_null($visit->check_out_time);
                $items->push([
                    'id' => 'visit-'.$visit->id,
                    'category' => 'visit',
                    'title' => $completed ? 'Visit Report Synced' : 'Site Visit In Progress',
                    'message' => $completed
                        ? "Submitted field report for {$site}."
                        : "Checked in at {$site} — checkout pending.",
                    'time' => ($visit->updated_at ?: $visit->created_at)?->diffForHumans() ?? 'Recently',
                    'timestamp' => ($visit->updated_at ?: $visit->created_at)?->timestamp ?? 0,
                    'isUnread' => ! $completed,
                    'route' => $completed ? '/(employee)/report/'.$visit->id : '/(employee)/visit/'.$visit->id,
                    'actionLabel' => $completed ? 'Report' : 'Resume',
                ]);
            });

        // 4. Today's attendance log
        $todayAtt = AttendanceLog::where('employee_id', $user->id)
            ->whereDate('date', Carbon::today())
            ->first();
        if ($todayAtt && $todayAtt->check_in_timestamp) {
            $items->push([
                'id' => 'att-'.$todayAtt->id,
                'category' => 'attendance',
                'title' => $todayAtt->check_out_timestamp ? 'Shift Completed' : 'Clocked In On Duty',
                'message' => $todayAtt->check_out_timestamp
                    ? 'Logged '.($todayAtt->total_hours ?? 0).' hrs today.'
                    : 'Shift started at '.$todayAtt->check_in_timestamp->format('h:i A').($todayAtt->is_late ? ' (Marked Late).' : '.'),
                'time' => ($todayAtt->check_out_timestamp ?: $todayAtt->check_in_timestamp)->diffForHumans(),
                'timestamp' => ($todayAtt->check_out_timestamp ?: $todayAtt->check_in_timestamp)->timestamp,
                'isUnread' => false,
                'route' => '/(employee)/attendance-hub',
                'actionLabel' => 'Logs',
            ]);
        }

        // 5. Newly created / assigned Project Sites from Web Admin
        $this->assignedSitesQuery($user)
            ->with('farmerProfile')
            ->latest('updated_at')
            ->limit(6)
            ->get()
            ->each(function (User $site) use ($items) {
                $city = $site->farmerProfile?->district ?: $site->farmerProfile?->village ?: 'Assigned Sector';
                $items->push([
                    'id' => 'site-'.$site->id,
                    'category' => 'site',
                    'title' => 'Project Site Assigned',
                    'message' => "{$site->name} ({$city}) is assigned to your route.",
                    'time' => ($site->updated_at ?: $site->created_at)?->diffForHumans() ?? 'Recently',
                    'timestamp' => ($site->updated_at ?: $site->created_at)?->timestamp ?? 0,
                    'isUnread' => $site->created_at ? $site->created_at->gt(Carbon::now()->subDays(2)) : false,
                    'route' => '/(employee)/site/'.$site->id,
                    'actionLabel' => 'Open',
                ]);
            });

        $sorted = $items->sortByDesc('timestamp')->values()->map(function ($item) {
            unset($item['timestamp']);

            return $item;
        });

        return response()->json([
            'status' => 'success',
            'notifications' => $sorted,
        ]);
    }

    /**
     * GET /api/v1/employee/sos-contacts
     * Real company admin / supervisor escalation contacts for the logged-in employee.
     */
    public function sosContacts(Request $request)
    {
        $user = $request->user()->load(['company', 'employeeDetail']);
        $contacts = [];

        if ($user->company_id) {
            $admins = User::where('company_id', $user->company_id)
                ->where('role', 'admin')
                ->whereNotNull('phone')
                ->limit(3)
                ->get();

            foreach ($admins as $admin) {
                $contacts[] = [
                    'role' => ($user->company?->name ? $user->company->name.' Admin' : 'Company Admin').' ('.$admin->name.')',
                    'phone' => $admin->phone,
                    'available' => 'Company Dispatch',
                ];
            }
        }

        if ($user->employeeDetail?->emergency_phone) {
            $contacts[] = [
                'role' => 'Registered Emergency Contact',
                'phone' => $user->employeeDetail->emergency_phone,
                'available' => 'Personal Escalation',
            ];
        }

        $contacts[] = [
            'role' => 'National Emergency Response (Police / Ambulance / Fire)',
            'phone' => '112',
            'available' => '24/7 Emergency Services',
        ];

        $hasActiveSos = EmergencyAlert::where('employee_id', $user->id)
            ->where('is_resolved', false)
            ->exists();

        return response()->json([
            'status' => 'success',
            'has_active_sos' => $hasActiveSos,
            'contacts' => $contacts,
        ]);
    }

    /**
     * POST /api/v1/employee/sos
     * Dispatches a real EmergencyAlert into the database so Web Admin /admin/alerts sees it immediately.
     */
    public function triggerSos(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'incident_type' => 'nullable|string|max:60',
        ]);

        $user = $request->user();
        $lat = isset($validated['latitude']) ? (float) $validated['latitude'] : null;
        $lng = isset($validated['longitude']) ? (float) $validated['longitude'] : null;

        $alert = EmergencyAlert::create([
            'employee_id' => $user->id,
            'alert_type' => 'sos_manual',
            'latitude' => $lat,
            'longitude' => $lng,
            'is_resolved' => false,
        ]);

        if ($lat !== null && $lng !== null) {
            $this->recordLivePoint($user, $lat, $lng);
            broadcast(new LocationUpdated($user->id, $lat, $lng, true, 100));
        }

        return response()->json([
            'status' => 'success',
            'alert_id' => $alert->id,
            'message' => 'Emergency SOS dispatched to your company admin monitor.',
        ]);
    }

    /**
     * PUT /api/v1/employee/profile
     * Updates authenticated employee's contact details & emergency phone in real time.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user()->load(['company', 'employeeDetail']);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:120',
            'username' => 'sometimes|required|string|max:120',
            'phone' => ['sometimes', 'required', 'string', 'max:25', Rule::unique('users', 'phone')->ignore($user->id)],
            'email' => ['sometimes', 'nullable', 'email', 'max:160', Rule::unique('users', 'email')->ignore($user->id)],
            'emergency_phone' => 'nullable|string|max:25',
            'region' => 'nullable|string|max:120',
        ]);

        $oldName = $user->name;
        $newName = trim((string) ($validated['username'] ?? $validated['name'] ?? $user->name));

        $user->update(array_filter([
            'name' => $newName !== '' ? $newName : $user->name,
            'phone' => $validated['phone'] ?? $user->phone,
            'email' => array_key_exists('email', $validated) ? $validated['email'] : $user->email,
        ], fn ($v) => $v !== null));

        if (array_key_exists('emergency_phone', $validated) || array_key_exists('region', $validated)) {
            EmployeeDetail::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'emergency_phone' => $validated['emergency_phone'] ?? $user->employeeDetail?->emergency_phone,
                    'assigned_region' => $validated['region'] ?? $user->employeeDetail?->assigned_region,
                ]
            );
        }

        $user->refresh()->load(['company', 'employeeDetail']);

        if (SessionActivity::tableReady()) {
            $summary = $oldName !== $user->name
                ? "Employee changed username from {$oldName} to {$user->name}"
                : "Employee {$user->name} updated profile credentials";
            SessionActivity::record(
                'employee_profile_updated',
                $summary,
                $request,
                $user,
                'info',
                0,
                ['old_name' => $oldName, 'new_name' => $user->name, 'phone' => $user->phone, 'email' => $user->email]
            );
        }

        return response()->json([
            'status' => 'success',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'phone' => $user->phone,
                'email' => $user->email,
                'designation' => $user->employeeDetail?->designation,
                'employee_code' => $user->employeeDetail?->employee_code,
                'region' => $user->employeeDetail?->assigned_region,
                'emergency_phone' => $user->employeeDetail?->emergency_phone,
                'company_id' => $user->company_id,
                'company_name' => $user->company?->name,
                'industry' => IndustryService::syncUserService($user, $request),
            ],
        ]);
    }
}
