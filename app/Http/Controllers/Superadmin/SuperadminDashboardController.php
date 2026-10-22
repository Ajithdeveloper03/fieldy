<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Company;
use App\Models\FarmerVisit;
use App\Models\Task;
use App\Models\TrackingSession;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class SuperadminDashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();

        // High-level Platform Metrics
        $totalCompanies = Company::count();
        $activeCompanies = Company::where('status', 'active')->count();

        $totalEmployees = User::where('role', 'employee')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        $totalFarmers = User::where('role', 'farmer')->count();

        // Platform-wide Activity
        $activeTrackingToday = TrackingSession::where('status', 'active')->count();
        $todayCheckIns = AttendanceLog::whereDate('date', $today)->count();
        $todayVisits = FarmerVisit::whereDate('check_in_time', $today)->count();
        $totalVisits = FarmerVisit::count();

        // Recent Companies with employee and visit counts
        $companies = Company::withCount(['employees', 'admins', 'farmers'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comp) use ($today) {
                // Calculate today's visits for this company's employees
                $empIds = User::where('company_id', $comp->id)->where('role', 'employee')->pluck('id');
                $visitsToday = FarmerVisit::whereIn('employee_id', $empIds)->whereDate('check_in_time', $today)->count();
                $activeOfficers = TrackingSession::whereIn('employee_id', $empIds)->where('status', 'active')->count();

                return [
                    'id' => $comp->id,
                    'name' => $comp->name,
                    'slug' => $comp->slug,
                    'code' => $comp->code,
                    'industry' => $comp->industry,
                    'plan' => $comp->plan,
                    'status' => $comp->status,
                    'max_employees' => $comp->max_employees,
                    'employees_count' => $comp->employees_count,
                    'admins_count' => $comp->admins_count,
                    'farmers_count' => $comp->farmers_count,
                    'visits_today' => $visitsToday,
                    'active_now' => $activeOfficers,
                    'created_at' => $comp->created_at->format('M d, Y'),
                ];
            });

        // Plan distribution
        $planBreakdown = [
            'starter' => Company::where('plan', 'starter')->count(),
            'professional' => Company::where('plan', 'professional')->count(),
            'enterprise' => Company::where('plan', 'enterprise')->count(),
        ];

        return Inertia::render('Superadmin/Dashboard', [
            'stats' => [
                'totalCompanies' => $totalCompanies,
                'activeCompanies' => $activeCompanies,
                'totalEmployees' => $totalEmployees,
                'totalAdmins' => $totalAdmins,
                'totalFarmers' => $totalFarmers,
                'activeTrackingToday' => $activeTrackingToday,
                'todayCheckIns' => $todayCheckIns,
                'todayVisits' => $todayVisits,
                'totalVisits' => $totalVisits,
            ],
            'companies' => $companies,
            'planBreakdown' => $planBreakdown,
        ]);
    }
}
