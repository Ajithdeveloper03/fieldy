<?php

namespace App\Services\Attendance;

use App\Models\AttendanceLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class AttendanceService
{
    /**
     * Standard Haversine distance calculation in meters.
     */
    public static function distanceMeters(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371000; // Earth's mean radius in meters
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return round($earthRadius * $c);
    }

    /**
     * Validate whether employee coordinates fall within the geofenced site boundary.
     */
    public static function checkGeofence(
        float $lat,
        float $lng,
        ?float $siteLat = null,
        ?float $siteLng = null,
        int $allowedRadiusMeters = 250
    ): array {
        if ($siteLat === null || $siteLng === null) {
            // Default verified when no strict site anchor is defined
            return [
                'is_within' => true,
                'distance_meters' => 0,
                'allowed_radius' => $allowedRadiusMeters,
            ];
        }

        $distance = self::distanceMeters($lat, $lng, $siteLat, $siteLng);

        return [
            'is_within' => $distance <= $allowedRadiusMeters,
            'distance_meters' => (int) $distance,
            'allowed_radius' => $allowedRadiusMeters,
        ];
    }

    /**
     * Compute shift timing, lateness, early leave, regular hours and overtime (digiSME standard).
     */
    public static function evaluateShift(
        Carbon $checkIn,
        ?Carbon $checkOut = null,
        string $shiftStart = '09:00',
        string $shiftEnd = '18:00',
        int $graceMinutes = 15
    ): array {
        $dateStr = $checkIn->toDateString();
        $scheduledStart = Carbon::parse("{$dateStr} {$shiftStart}");
        $lateThreshold = $scheduledStart->copy()->addMinutes($graceMinutes);
        $scheduledEnd = Carbon::parse("{$dateStr} {$shiftEnd}");

        $isLate = $checkIn->gt($lateThreshold);
        $lateMinutes = $isLate ? (int) $scheduledStart->diffInMinutes($checkIn) : 0;

        $isEarly = false;
        $totalHours = 0.0;
        $regularHours = 0.0;
        $overtimeHours = 0.0;
        $status = $isLate ? 'late' : 'present';

        if ($checkOut) {
            $isEarly = $checkOut->lt($scheduledEnd->copy()->subMinutes(15));
            $durationMinutes = $checkIn->diffInMinutes($checkOut);
            $totalHours = round($durationMinutes / 60, 2);

            // In Connecteam / digiSME: standard shift is 8 regular hours (after 1h lunch/rest)
            // Any working presence above 9 total hours counts as Overtime
            if ($totalHours < 4.0) {
                $status = 'half_day';
                $regularHours = $totalHours;
                $overtimeHours = 0.0;
            } elseif ($totalHours > 9.0) {
                $status = 'overtime';
                $regularHours = 8.0;
                $overtimeHours = round($totalHours - 9.0, 2);
            } else {
                $status = $isLate ? 'late' : 'present';
                $regularHours = max(0, min($totalHours - 1.0, 8.0));
                $overtimeHours = 0.0;
            }
        }

        return [
            'is_late' => $isLate,
            'late_minutes' => $lateMinutes,
            'is_early_checkout' => $isEarly,
            'total_hours' => $totalHours,
            'regular_hours' => $regularHours,
            'overtime_hours' => $overtimeHours,
            'status' => $status,
        ];
    }

    /**
     * Process clock-in action with GPS & Geofence check.
     */
    public static function recordClockIn(
        User $employee,
        float $latitude,
        float $longitude,
        ?string $selfiePath = null,
        ?float $siteLat = null,
        ?float $siteLng = null
    ): AttendanceLog {
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        $geofence = self::checkGeofence($latitude, $longitude, $siteLat, $siteLng);
        $shift = self::evaluateShift($now);

        $log = AttendanceLog::firstOrNew([
            'employee_id' => $employee->id,
            'date' => $today,
        ]);

        $log->fill([
            'check_in_timestamp' => $now,
            'check_in_latitude' => $latitude,
            'check_in_longitude' => $longitude,
            'selfie_image_path' => $selfiePath ?: $log->selfie_image_path,
            'is_late' => $shift['is_late'],
            'late_minutes' => $shift['late_minutes'],
            'is_within_geofence' => $geofence['is_within'],
            'geofence_deviation_meters' => $geofence['distance_meters'],
            'status' => $shift['status'],
            'approval_status' => $geofence['is_within'] ? 'approved' : 'pending_review',
        ]);

        $log->save();

        return $log;
    }

    /**
     * Process clock-out action and compute final shift hours.
     */
    public static function recordClockOut(
        User $employee,
        float $latitude,
        float $longitude
    ): ?AttendanceLog {
        $today = Carbon::today()->toDateString();
        $now = Carbon::now();

        $log = AttendanceLog::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        if (! $log) {
            return null;
        }

        $checkIn = Carbon::parse($log->check_in_timestamp);
        $shift = self::evaluateShift($checkIn, $now);

        $log->update([
            'check_out_timestamp' => $now,
            'check_out_latitude' => $latitude,
            'check_out_longitude' => $longitude,
            'is_early_checkout' => $shift['is_early_checkout'],
            'total_hours' => $shift['total_hours'],
            'regular_hours' => $shift['regular_hours'],
            'overtime_hours' => $shift['overtime_hours'],
            'status' => $shift['status'],
        ]);

        return $log;
    }

    /**
     * Generate digiSME Timesheet summary statistics for an employee over a given period.
     */
    public static function getTimesheetSummary(int $employeeId, ?Carbon $start = null, ?Carbon $end = null): array
    {
        $start = $start ?: Carbon::now()->startOfMonth();
        $end = $end ?: Carbon::now();

        $logs = AttendanceLog::where('employee_id', $employeeId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get();

        $daysPresent = $logs->whereNotNull('check_in_timestamp')->count();
        $lateDays = $logs->where('is_late', true)->count();
        $earlyLeaves = $logs->where('is_early_checkout', true)->count();
        $overtimeCount = $logs->where('status', 'overtime')->count();
        $totalHoursWorked = round($logs->sum('total_hours'), 1);
        $totalOtHours = round($logs->sum('overtime_hours'), 1);
        $geofenceBreaches = $logs->where('is_within_geofence', false)->count();

        $complianceRate = $daysPresent > 0
            ? round((($daysPresent - $geofenceBreaches) / $daysPresent) * 100)
            : 100;

        return [
            'days_present' => $daysPresent,
            'late_days' => $lateDays,
            'early_leaves' => $earlyLeaves,
            'overtime_shifts' => $overtimeCount,
            'total_hours' => $totalHoursWorked,
            'overtime_hours' => $totalOtHours,
            'geofence_breaches' => $geofenceBreaches,
            'geofence_compliance_rate' => $complianceRate,
        ];
    }
}

