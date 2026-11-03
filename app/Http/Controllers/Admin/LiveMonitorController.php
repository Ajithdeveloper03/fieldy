<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class LiveMonitorController extends Controller
{
    private function buildEmployeeData(): Collection
    {
        $today = Carbon::today();
        $companyId = auth()->user()?->company_id;
        $industryKey = IndustryContext::current();
        $vocab = IndustryCatalog::def($industryKey);

        $query = User::where('role', 'employee')
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
            ->with([
                'employeeDetail',
                'locationPoints' => function ($query) {
                    $query->orderBy('timestamp', 'desc')->limit(20);
                },
                'attendanceLogs' => function ($query) use ($today) {
                    $query->whereDate('date', $today);
                },
                'farmerVisits' => function ($query) use ($today) {
                    $query->whereDate('created_at', $today)->with('farmer:id,name');
                },
            ]);

        $query = IndustryContext::scope($query, $industryKey);

        $employees = $query->get()->map(function ($user) use ($vocab) {
            $latestLocation = $user->locationPoints->first();
            $visitsToday = $user->farmerVisits->count();
            $attendanceToday = $user->attendanceLogs->first();

            $activities = collect([]);

            if ($attendanceToday && $attendanceToday->check_in_timestamp) {
                $activities->push([
                    'type' => 'checkin',
                    'action' => 'Marked Morning Attendance',
                    'time' => Carbon::parse($attendanceToday->check_in_timestamp)->format('h:i A'),
                    'location' => "Lat: {$attendanceToday->check_in_latitude}, Lng: {$attendanceToday->check_in_longitude}",
                    'timestamp' => Carbon::parse($attendanceToday->check_in_timestamp)->timestamp,
                ]);
            }

            foreach ($user->farmerVisits as $visit) {
                $activities->push([
                    'type' => 'visit',
                    'action' => 'Field Action: '.($visit->farmer?->name ?? "Site #{$visit->farmer_id}"),
                    'time' => Carbon::parse($visit->check_in_time)->format('h:i A'),
                    'location' => "Lat: {$visit->check_in_latitude}, Lng: {$visit->check_in_longitude}",
                    'timestamp' => Carbon::parse($visit->check_in_time)->timestamp,
                ]);
            }

            if ($latestLocation) {
                $carbonDate = Carbon::createFromTimestampMs($latestLocation->timestamp);
                $activities->push([
                    'type' => 'location',
                    'action' => 'Last GPS Ping',
                    'time' => $carbonDate->format('h:i A'),
                    'location' => "Lat: {$latestLocation->latitude}, Lng: {$latestLocation->longitude}",
                    'timestamp' => $latestLocation->timestamp / 1000,
                ]);
            }

            $recentPath = $user->locationPoints->take(20)->map(function ($log) {
                return [
                    'lat' => (float) $log->latitude,
                    'lng' => (float) $log->longitude,
                    'time' => Carbon::createFromTimestampMs($log->timestamp)->format('h:i A'),
                ];
            })->toArray();

            $sortedActivities = $activities->sortByDesc('timestamp')->values()->map(function ($item) {
                unset($item['timestamp']);
                return $item;
            });

            $isActive = $latestLocation &&
                Carbon::createFromTimestampMs($latestLocation->timestamp)->diffInMinutes(Carbon::now()) < 15;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->employeeDetail?->designation ?? $vocab['roles'][0],
                'region' => $user->employeeDetail?->assigned_region ?? 'Assigned Beat',
                'employee_code' => $user->employeeDetail?->employee_code ?? 'N/A',
                'status' => $isActive ? 'active' : ($attendanceToday ? 'idle' : 'offline'),
                'gps' => 'enabled',
                'battery' => 95,
                'lastSeen' => $latestLocation ? Carbon::createFromTimestampMs($latestLocation->timestamp)->diffForHumans() : 'Never',
                'visitsDone' => $visitsToday,
                'visitsTarget' => 5,
                'currentLocation' => $latestLocation ? "Lat: {$latestLocation->latitude}, Lng: {$latestLocation->longitude}" : 'Unknown',
                'latitude' => $latestLocation?->latitude,
                'longitude' => $latestLocation?->longitude,
                'within_geofence' => (bool) ($attendanceToday?->is_within_geofence ?? true),
                'distance_today_km' => \App\Services\Tracking\GeofenceTrackingService::calculateTotalDistanceKm($user->locationPoints),
                'checkInTime' => $attendanceToday?->check_in_timestamp
                    ? Carbon::parse($attendanceToday->check_in_timestamp)->format('h:i A')
                    : 'N/A',
                'recentPath' => $recentPath,
                'activities' => $sortedActivities->all(),
            ];
        });

        // If no employees exist for this service vertical in DB, build curated live map positions
        if ($employees->isEmpty()) {
            $catalogStaff = IndustryCatalog::staff($industryKey);
            $catalogEntities = IndustryCatalog::entities($industryKey);

            $employees = collect($catalogStaff)->map(function ($s, $idx) use ($catalogEntities, $vocab) {
                $e = $catalogEntities[$idx % count($catalogEntities)];
                $lat = $e['latitude'] + 0.0012 * ($idx % 3);
                $lng = $e['longitude'] - 0.0009 * ($idx % 2);

                $recentPath = [
                    ['lat' => round($lat - 0.005, 6), 'lng' => round($lng - 0.004, 6), 'time' => '09:00 AM'],
                    ['lat' => round($lat - 0.002, 6), 'lng' => round($lng - 0.001, 6), 'time' => '10:30 AM'],
                    ['lat' => round($lat, 6), 'lng' => round($lng, 6), 'time' => '11:45 AM'],
                ];

                return [
                    'id' => $s['id'],
                    'name' => $s['name'],
                    'phone' => $s['phone'],
                    'role' => $s['role'],
                    'region' => $s['region'],
                    'employee_code' => $s['code'],
                    'status' => $s['online'] ? 'active' : 'idle',
                    'gps' => 'enabled',
                    'battery' => 92 - $idx * 7,
                    'lastSeen' => $s['online'] ? '2 mins ago' : '1 hour ago',
                    'visitsDone' => 2 + ($idx % 3),
                    'visitsTarget' => 5,
                    'currentLocation' => "Lat: {$lat}, Lng: {$lng}",
                    'latitude' => $lat,
                    'longitude' => $lng,
                    'within_geofence' => true,
                    'distance_today_km' => round(12.4 + ($idx * 3.8), 1),
                    'checkInTime' => '08:55 AM',
                    'recentPath' => $recentPath,
                    'activities' => [
                        ['type' => 'location', 'action' => "Live Beat: {$e['name']}", 'time' => '11:45 AM', 'location' => "Lat: {$lat}, Lng: {$lng}"],
                        ['type' => 'checkin', 'action' => 'Clocked in on duty', 'time' => '08:55 AM', 'location' => $e['address']],
                    ],
                    'is_sample' => true,
                ];
            });
        }

        return $employees;
    }

    public function index()
    {
        return Inertia::render('Admin/LiveMonitor', [
            'employees' => $this->buildEmployeeData()->values(),
        ]);
    }

    public function liveData()
    {
        return response()->json([
            'employees' => $this->buildEmployeeData()->values(),
            'updated_at' => now()->toISOString(),
        ]);
    }
}
