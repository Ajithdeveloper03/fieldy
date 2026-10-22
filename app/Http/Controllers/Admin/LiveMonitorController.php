<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;

class LiveMonitorController extends Controller
{
    /**
     * Build employee monitoring data array (used by both Inertia and JSON endpoints).
     */
    private function buildEmployeeData(): Collection
    {
        $today = Carbon::today();
        $companyId = auth()->user()?->company_id;

        return User::where('role', 'employee')
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
            ])
            ->get()
            ->map(function ($user) {
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
                        'action' => 'Visited: '.($visit->farmer?->name ?? "Farmer #{$visit->farmer_id}"),
                        'time' => Carbon::parse($visit->check_in_time)->format('h:i A'),
                        'location' => "Lat: {$visit->check_in_latitude}, Lng: {$visit->check_in_longitude}",
                        'timestamp' => Carbon::parse($visit->check_in_time)->timestamp,
                    ]);
                }

                if ($latestLocation) {
                    // $latestLocation->timestamp is a big integer (unix timestamp in ms or seconds).
                    // In LocationPoint it's a bigInteger 'timestamp'. Usually JS Date.now() sends ms.
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
                    'role' => 'Field Officer',
                    'region' => $user->employeeDetail?->assigned_region ?? 'Unknown',
                    'employee_code' => $user->employeeDetail?->employee_code ?? 'N/A',
                    'status' => $isActive ? 'active' : ($attendanceToday ? 'idle' : 'offline'),
                    'gps' => 'enabled', // We assume enabled if we are getting points
                    'battery' => 100, // Not tracked in new schema
                    'lastSeen' => $latestLocation ? Carbon::createFromTimestampMs($latestLocation->timestamp)->diffForHumans() : 'Never',
                    'visitsDone' => $visitsToday,
                    'visitsTarget' => 5,
                    'currentLocation' => $latestLocation ? "Lat: {$latestLocation->latitude}, Lng: {$latestLocation->longitude}" : 'Unknown',
                    'latitude' => $latestLocation?->latitude,
                    'longitude' => $latestLocation?->longitude,
                    'checkInTime' => $attendanceToday?->check_in_timestamp
                        ? Carbon::parse($attendanceToday->check_in_timestamp)->format('h:i A')
                        : 'N/A',
                    'recentPath' => $recentPath,
                    'activities' => $sortedActivities->all(),
                ];
            });
    }

    /**
     * Inertia page load.
     */
    public function index()
    {
        return Inertia::render('Admin/LiveMonitor', [
            'employees' => $this->buildEmployeeData()->values(),
        ]);
    }

    /**
     * JSON endpoint for 30-second polling by the frontend.
     * GET /admin/monitor/live
     */
    public function liveData()
    {
        return response()->json([
            'employees' => $this->buildEmployeeData()->values(),
            'updated_at' => now()->toISOString(),
        ]);
    }
}
