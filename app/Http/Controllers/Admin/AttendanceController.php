<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'employee_id' => 'nullable|integer|min:1',
            'from' => 'nullable|date_format:Y-m-d',
            'to' => 'nullable|date_format:Y-m-d'.($request->filled('from') ? '|after_or_equal:from' : ''),
        ]);
        $admin = $request->user();
        $team = fn (Builder $query) => $query->where('role', 'employee')
            ->when(! $admin->isSuperAdmin() || $admin->company_id,
                fn (Builder $query) => $query->where('company_id', $admin->company_id));

        $logs = AttendanceLog::whereHas('employee', $team)
            ->with('employee:id,name,deleted_at', 'employee.employeeDetail:user_id,employee_code')
            ->when($filters['employee_id'] ?? null, fn ($query, $id) => $query->where('employee_id', $id))
            ->when($filters['from'] ?? null, fn ($query, $date) => $query->whereDate('date', '>=', $date))
            ->when($filters['to'] ?? null, fn ($query, $date) => $query->whereDate('date', '<=', $date))
            ->orderByDesc('date')->orderByDesc('check_in_timestamp')->orderByDesc('id')
            ->paginate(30)->withQueryString()
            ->through(fn (AttendanceLog $log) => [
                'id' => $log->id,
                'name' => $log->employee->name,
                'code' => $log->employee->employeeDetail?->employee_code,
                'archived' => $log->employee->trashed(),
                'date' => $log->date->toDateString(),
                'check_in' => $log->check_in_timestamp?->toIso8601String(),
                'check_out' => $log->check_out_timestamp?->toIso8601String(),
                'status' => $log->status,
            ]);

        return Inertia::render('Admin/Attendance', [
            'logs' => $logs,
            'employees' => $team(User::withTrashed())->orderBy('name')->get(['id', 'name']),
            'filters' => $filters,
        ]);
    }
}
