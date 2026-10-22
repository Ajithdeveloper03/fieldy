<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Company;
use App\Models\FarmerVisit;
use App\Models\TrackingSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperadminMonitoringController extends Controller
{
    public function employees(Request $request)
    {
        $companyId = $request->query('company_id');
        $search = $request->query('search');

        $query = User::with(['company', 'employeeDetail'])
            ->where('role', 'employee');

        if ($companyId) {
            $query->where('company_id', $companyId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $today = Carbon::today();

        $employees = $query->orderBy('company_id')
            ->orderBy('name')
            ->paginate(25)
            ->through(function ($emp) use ($today) {
                $attendance = AttendanceLog::where('employee_id', $emp->id)
                    ->whereDate('date', $today)
                    ->latest()
                    ->first();

                $activeSession = TrackingSession::where('employee_id', $emp->id)
                    ->where('status', 'active')
                    ->latest()
                    ->first();

                $visitsToday = FarmerVisit::where('employee_id', $emp->id)
                    ->whereDate('check_in_time', $today)
                    ->count();

                return [
                    'id' => $emp->id,
                    'name' => $emp->name,
                    'email' => $emp->email,
                    'phone' => $emp->phone,
                    'status' => $emp->status,
                    'company' => $emp->company ? [
                        'id' => $emp->company->id,
                        'name' => $emp->company->name,
                        'plan' => $emp->company->plan,
                    ] : null,
                    'designation' => $emp->employeeDetail->designation ?? 'Field Agent',
                    'assigned_region' => $emp->employeeDetail->assigned_region ?? 'N/A',
                    'isCheckedInToday' => !is_null($attendance),
                    'checkInTime' => $attendance?->check_in_timestamp ? Carbon::parse($attendance->check_in_timestamp)->format('h:i A') : null,
                    'isTrackingActive' => !is_null($activeSession),
                    'visitsToday' => $visitsToday,
                ];
            });

        $companies = Company::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Superadmin/EmployeesMonitor', [
            'employees' => $employees,
            'companies' => $companies,
            'filters' => [
                'company_id' => $companyId,
                'search' => $search,
            ],
        ]);
    }

    public function analytics(Request $request)
    {
        $today = Carbon::today();
        $sevenDaysAgo = Carbon::today()->subDays(6);

        // Daily visits across last 7 days platform-wide
        $visitTrends = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $count = FarmerVisit::whereDate('check_in_time', $date)->count();
            $checkIns = AttendanceLog::whereDate('date', $date)->count();
            $visitTrends[] = [
                'date' => $date->format('M d'),
                'visits' => $count,
                'checkins' => $checkIns,
            ];
        }

        // Top active companies
        $topCompanies = Company::withCount(['employees', 'farmers'])
            ->get()
            ->map(function ($comp) use ($today) {
                $empIds = User::where('company_id', $comp->id)->pluck('id');
                $visits = FarmerVisit::whereIn('employee_id', $empIds)->count();
                return [
                    'name' => $comp->name,
                    'employees' => $comp->employees_count,
                    'farmers' => $comp->farmers_count,
                    'visits' => $visits,
                    'plan' => $comp->plan,
                    'status' => $comp->status,
                ];
            })
            ->sortByDesc('visits')
            ->values();

        return Inertia::render('Superadmin/Analytics', [
            'visitTrends' => $visitTrends,
            'topCompanies' => $topCompanies,
            'summary' => [
                'totalVisitsAllTime' => FarmerVisit::count(),
                'totalAttendanceLogs' => AttendanceLog::count(),
                'activeTrackingSessions' => TrackingSession::where('status', 'active')->count(),
            ],
        ]);
    }
}
