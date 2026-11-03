<?php

namespace App\Services\Tracking;

use App\Models\EmergencyAlert;
use App\Models\LocationPoint;
use App\Models\TrackingSession;
use App\Models\User;
use App\Services\Attendance\AttendanceService;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class GeofenceTrackingService
{
    /**
     * Compute total distance traveled in kilometers from an ordered sequence of GPS points.
     */
    public static function calculateTotalDistanceKm(Collection $points): float
    {
        if ($points->count() < 2) {
            return 0.0;
        }

        $totalMeters = 0.0;
        $prev = null;

        foreach ($points as $p) {
            if ($prev !== null) {
                $d = AttendanceService::distanceMeters(
                    (float) $prev->latitude,
                    (float) $prev->longitude,
                    (float) $p->latitude,
                    (float) $p->longitude
                );

                // Filter out impossible GPS drift spikes (> 120 km/h jump)
                if ($d < 5000) {
                    $totalMeters += $d;
                }
            }
            $prev = $p;
        }

        return round($totalMeters / 1000, 2);
    }

    /**
     * Analyze stationary vs active transit state based on recent GPS breadcrumbs.
     */
    public static function analyzeMotionState(Collection $points, int $idleThresholdMinutes = 20): array
    {
        if ($points->isEmpty()) {
            return ['state' => 'offline', 'stationary_minutes' => 0];
        }

        $latest = $points->first();
        $latestTime = Carbon::createFromTimestampMs($latest->timestamp);

        if ($latestTime->diffInMinutes(Carbon::now()) > 30) {
            return ['state' => 'offline', 'stationary_minutes' => (int) $latestTime->diffInMinutes(Carbon::now())];
        }

        // Check if employee stayed within 30m over recent points
        $recentPoints = $points->take(10);
        $maxDeviation = 0.0;

        foreach ($recentPoints as $p) {
            $dist = AttendanceService::distanceMeters(
                (float) $latest->latitude,
                (float) $latest->longitude,
                (float) $p->latitude,
                (float) $p->longitude
            );
            if ($dist > $maxDeviation) {
                $maxDeviation = $dist;
            }
        }

        if ($maxDeviation < 35.0 && $recentPoints->count() >= 3) {
            $firstInCluster = $recentPoints->last();
            $clusterDuration = Carbon::createFromTimestampMs($firstInCluster->timestamp)->diffInMinutes($latestTime);

            if ($clusterDuration >= $idleThresholdMinutes) {
                return ['state' => 'stationary', 'stationary_minutes' => (int) $clusterDuration];
            }
        }

        return ['state' => 'active_transit', 'stationary_minutes' => 0];
    }

    /**
     * Log a GPS point and evaluate geofence adherence & telemetry.
     */
    public static function logPing(
        User $employee,
        float $lat,
        float $lng,
        ?float $accuracy = 10.0,
        ?float $speed = 0.0,
        ?float $heading = 0.0,
        ?int $battery = 90
    ): LocationPoint {
        // Find active tracking session or create one
        $session = TrackingSession::firstOrCreate(
            ['employee_id' => $employee->id, 'status' => 'active'],
            [
                'session_id' => 'TRK-' . $employee->id . '-' . date('Ymd-His'),
                'start_time' => now(),
                'start_latitude' => $lat,
                'start_longitude' => $lng,
            ]
        );

        $point = LocationPoint::create([
            'tracking_session_id' => $session->id,
            'employee_id' => $employee->id,
            'latitude' => $lat,
            'longitude' => $lng,
            'accuracy' => $accuracy,
            'speed' => $speed,
            'heading' => $heading,
            'timestamp' => Carbon::now()->getTimestampMs(),
        ]);

        return $point;
    }
}

