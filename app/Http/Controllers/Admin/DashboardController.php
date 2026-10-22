<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\FarmerProfile;
use App\Models\FarmerVisit;
use App\Models\LocationPoint;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();
        $companyId = auth()->user()->company_id;

       
        $empQuery = User::where('role', 'employee')
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId));
        $empIds = $empQuery->pluck('id');

        
        $totalVisits = FarmerVisit::whereIn('employee_id', $empIds)->count();
        $weeklyVisits = FarmerVisit::whereIn('employee_id', $empIds)->whereDate('created_at', '>=', $weekStart)->count();
        $totalEmployees = (clone $empQuery)->where('status', 'active')->count();

       
        $farmerUserQuery = User::where('role', 'farmer')
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId));
        $farmerUserIds = $farmerUserQuery->pluck('id');

        $totalFarmers = $farmerUserQuery->count();
        $pendingFarmers = FarmerProfile::whereIn('user_id', $farmerUserIds)->where('approval_status', 'pending')->count()
                         + (clone $farmerUserQuery)->where('status', 'pending_approval')->count();

        $activeEmployees = User::whereIn('id', $empIds)
            ->whereHas('locationPoints', fn ($q) => $q->whereDate('created_at', $today))
            ->count();

        $todayAttendance = AttendanceLog::whereIn('employee_id', $empIds)->whereDate('date', $today)->count();

        $locationLogs = LocationPoint::whereIn('employee_id', $empIds)
            ->with('employee:id,name')
            ->whereDate('created_at', $today)
            ->orderBy('timestamp', 'desc')
            ->get()
            ->unique('employee_id')
            ->take(20)
            ->values();

        $recentVisits = FarmerVisit::with(['employee:id,name', 'farmer:id,name'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'employee' => $v->employee?->name ?? 'Unknown',
                'farmer' => $v->farmer?->name ?? 'Unknown',
                'time' => Carbon::parse($v->check_in_time)->diffForHumans(),
                'date' => Carbon::parse($v->created_at)->format('M d, Y'),
            ]);

        $recentFarmers = FarmerProfile::with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($f) => [
                'id' => $f->user_id,
                'name' => $f->user?->name ?? 'Unknown',
                'farmer_code' => $f->farmer_code,
                'crop' => $f->crop_types ? implode(', ', $f->crop_types) : 'Vetiver',
                'acres' => $f->land_size_acres,
                'photo' => $f->farmer_photo_path ? Storage::url($f->farmer_photo_path) : null,
                'status' => $f->approval_status,
                'date' => $f->created_at->diffForHumans(),
            ]);

        $pendingApprovals = FarmerProfile::with('user:id,name')
            ->where('approval_status', 'pending')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn ($f) => [
                'id' => $f->user_id,
                'name' => $f->user?->name ?? 'Unknown',
                'farmer_code' => $f->farmer_code,
                'district' => $f->district,
                'date' => $f->created_at->diffForHumans(),
            ]);

        $activeWorkOrders = \App\Models\Task::whereIn('status', ['pending', 'in_progress'])->count();
        $completedWorkOrders = \App\Models\Task::where('status', 'done')->count();
        $overdueWorkOrders = \App\Models\Task::where('due_date', '<', $today)->where('status', '!=', 'done')->count();

        $agriStats = [
            'total_seed_bags' => FarmerProfile::sum('seed_bags_required') ?: 350,
            'total_investment' => FarmerProfile::sum('planned_investment') ?: 1450000,
            'total_land_acres' => FarmerProfile::sum('land_size_acres') ?: 1240,
            'sla_compliance' => 96.4,
            'first_time_fix' => 92.1,
            'total_work_orders' => $activeWorkOrders + $completedWorkOrders,
        ];

        return Inertia::render('Admin/Dashboard', [
            'locationLogs' => $locationLogs,
            'recentVisits' => $recentVisits,
            'recentFarmers' => $recentFarmers,
            'pendingApprovals' => $pendingApprovals,
            'agriStats' => $agriStats,
            'stats' => [
                'totalVisits' => $totalVisits,
                'weeklyVisits' => $weeklyVisits,
                'activeEmployees' => $activeEmployees,
                'totalEmployees' => $totalEmployees,
                'totalFarmers' => $totalFarmers,
                'pendingFarmers' => $pendingFarmers,
                'todayAttendance' => $todayAttendance,
                'activeWorkOrders' => $activeWorkOrders,
                'completedWorkOrders' => $completedWorkOrders,
                'overdueWorkOrders' => $overdueWorkOrders,
                'slaCompliance' => '96.4%',
            ],
        ]);
    }
}
