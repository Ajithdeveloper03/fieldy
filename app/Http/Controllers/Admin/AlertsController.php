<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\EmergencyAlert;
use App\Models\SessionActivity;
use App\Models\Task;
use App\Models\User;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use Carbon\Carbon;
use Inertia\Inertia;

class AlertsController extends Controller
{
    public function index()
    {
        $industryKey = IndustryContext::current();
        $companyId = auth()->user()?->company_id;

        if (! $companyId) {
            $alerts = IndustryCatalog::alerts($industryKey);
        } else {
            $alerts = [];
            $today = Carbon::today();
            $companyUserIds = User::where('company_id', $companyId)->pluck('id');
            $empIds = User::where('company_id', $companyId)->where('role', 'employee')->pluck('id');

            // 0. Live Emergency SOS & GPS/App critical dispatches from field staff
            $emergencyAlerts = EmergencyAlert::whereIn('employee_id', $empIds)
                ->where('is_resolved', false)
                ->with('employee:id,name,phone')
                ->latest()
                ->take(15)
                ->get();

            foreach ($emergencyAlerts as $sos) {
                $label = match ($sos->alert_type) {
                    'sos_manual' => 'CRITICAL SOS DISPATCH',
                    'gps_turned_off' => 'GPS Disabled Alert',
                    'app_killed' => 'Tracking Interrupted',
                    default => 'Field Safety Alert',
                };
                $alerts[] = [
                    'id' => 'sos-' . $sos->id,
                    'type' => 'critical',
                    'title' => $label . ': ' . ($sos->employee?->name ?? 'Field Staff'),
                    'message' => 'Emergency alert triggered from mobile app'
                        . ($sos->employee?->phone ? ' (Phone: ' . $sos->employee->phone . ').' : '.'),
                    'location' => $sos->latitude !== null && $sos->longitude !== null
                        ? "Lat: {$sos->latitude}, Lng: {$sos->longitude}"
                        : 'Live GPS Pending',
                    'timestamp' => $sos->created_at ? $sos->created_at->diffForHumans() : 'Just now',
                    'resolved' => (bool) $sos->is_resolved,
                ];
            }

            // 1. Real overdue tasks for this company
            $overdueTasks = IndustryContext::scope(Task::query(), $industryKey)
                ->where(function ($q) use ($companyUserIds) {
                    $q->whereIn('assigned_to', $companyUserIds)
                        ->orWhereIn('created_by', $companyUserIds);
                })
                ->whereNotIn('status', ['done', 'cancelled'])
                ->whereNotNull('due_date')
                ->whereDate('due_date', '<', $today)
                ->with(['assignedTo:id,name', 'customer:id,name'])
                ->orderBy('due_date', 'asc')
                ->take(15)
                ->get();

            foreach ($overdueTasks as $task) {
                $alerts[] = [
                    'id' => 'task-' . $task->id,
                    'type' => $task->priority === 'urgent' ? 'critical' : 'high',
                    'title' => 'Overdue Task: ' . $task->title,
                    'message' => 'Assigned to ' . ($task->assignedTo?->name ?? 'Unassigned') . ' — due ' . $task->due_date->format('M d, Y') . '.',
                    'location' => $task->customer?->name ?? 'Assigned Site',
                    'timestamp' => $task->due_date->diffForHumans(),
                    'resolved' => false,
                ];
            }

            // 2. Real geofence / late check-in exceptions from today
            $attendanceAlerts = AttendanceLog::whereIn('employee_id', $empIds)
                ->whereDate('date', $today)
                ->where(function ($q) {
                    $q->where('is_within_geofence', false)
                        ->orWhere('is_late', true);
                })
                ->with('employee:id,name')
                ->latest('check_in_timestamp')
                ->take(15)
                ->get();

            foreach ($attendanceAlerts as $log) {
                $isGeofence = $log->is_within_geofence === false;
                $alerts[] = [
                    'id' => 'att-' . $log->id,
                    'type' => $isGeofence ? 'critical' : 'high',
                    'title' => $isGeofence
                        ? 'Geofence Exception: ' . ($log->employee?->name ?? 'Staff')
                        : 'Late Check-in: ' . ($log->employee?->name ?? 'Staff'),
                    'message' => $isGeofence
                        ? 'Check-in was logged outside the configured geofence boundary.'
                        : 'Staff member checked in after scheduled shift start.',
                    'location' => $log->check_in_latitude && $log->check_in_longitude
                        ? "Lat: {$log->check_in_latitude}, Lng: {$log->check_in_longitude}"
                        : 'Field GPS',
                    'timestamp' => $log->check_in_timestamp
                        ? Carbon::parse($log->check_in_timestamp)->diffForHumans()
                        : 'Today',
                    'resolved' => false,
                ];
            }

            // 3. Real-time employee activity notifications (username/profile updates, attendance, visits, tasks)
            if (SessionActivity::tableReady()) {
                $activities = SessionActivity::whereIn('user_id', $empIds)
                    ->where('event_type', 'like', 'employee_%')
                    ->with('user:id,name')
                    ->latest('id')
                    ->take(20)
                    ->get();

                foreach ($activities as $act) {
                    $titleMap = [
                        'employee_profile_updated' => 'Profile Updated',
                        'employee_clock_in' => 'Employee Clocked In',
                        'employee_clock_out' => 'Employee Clocked Out',
                        'employee_visit_checkin' => 'Site Visit Check-In',
                        'employee_visit_submitted' => 'Visit Report Submitted',
                        'employee_task_updated' => 'Task Updated',
                    ];
                    $alerts[] = [
                        'id' => 'act-' . $act->id,
                        'type' => $act->severity === 'critical' ? 'critical' : 'medium',
                        'title' => ($titleMap[$act->event_type] ?? 'Employee Activity') . ': ' . ($act->user?->name ?? 'Field Staff'),
                        'message' => $act->description ?: 'Activity logged from mobile app.',
                        'location' => 'Mobile App Live Sync',
                        'timestamp' => $act->created_at ? $act->created_at->diffForHumans() : 'Just now',
                        'resolved' => false,
                    ];
                }
            }
        }

        return Inertia::render('Admin/Alerts', [
            'alerts' => $alerts,
        ]);
    }
}
