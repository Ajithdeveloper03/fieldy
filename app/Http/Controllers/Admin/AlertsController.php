<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
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
        }

        return Inertia::render('Admin/Alerts', [
            'alerts' => $alerts,
        ]);
    }
}
