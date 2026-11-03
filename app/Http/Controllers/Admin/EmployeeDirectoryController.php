<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\EmployeeDetail;
use App\Models\FarmerProfile;
use App\Models\FarmerVisit;
use App\Models\LocationPoint;
use App\Models\User;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EmployeeDirectoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $region = $request->query('region', '');
        $companyId = auth()->user()?->company_id;
        $industryKey = IndustryContext::current();

        $query = User::where('role', 'employee')
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
            ->with(['employeeDetail', 'attendanceLogs' => fn ($q) => $q->whereDate('date', Carbon::today())]);

        $query = IndustryContext::scope($query, $industryKey);

        if ($search) {
            $query->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('employeeDetail', fn ($ed) => $ed->where('employee_code', 'like', "%{$search}%"));
            });
        }

        if ($region) {
            $query->whereHas('employeeDetail', fn ($ed) => $ed->where('assigned_region', 'like', "%{$region}%"));
        }

        $employees = $query->orderBy('name')->get()->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
            'status' => $user->status,
            'employee_code' => $user->employeeDetail?->employee_code ?? 'N/A',
            'region' => $user->employeeDetail?->assigned_region ?? 'Unassigned',
            'designation' => $user->employeeDetail?->designation ?? 'field_staff',
            'reports_to' => $user->employeeDetail?->reports_to,
            'manager_name' => $user->employeeDetail?->reports_to ? User::find($user->employeeDetail->reports_to)?->name : 'None',
            'emergency' => $user->employeeDetail?->emergency_phone ?? 'N/A',
            'checked_in' => $user->attendanceLogs->isNotEmpty(),
        ]);

        // If no employees exist in DB for this service vertical, supply curated catalog workforce
        if ($employees->isEmpty()) {
            $catalogStaff = IndustryCatalog::staff($industryKey);
            $employees = collect($catalogStaff)->map(fn ($s) => [
                'id' => $s['id'],
                'name' => $s['name'],
                'phone' => $s['phone'],
                'email' => $s['email'],
                'status' => $s['status'],
                'employee_code' => $s['code'],
                'region' => $s['region'],
                'designation' => $s['role'],
                'reports_to' => null,
                'manager_name' => 'Operations Head',
                'emergency' => '9840099881',
                'checked_in' => $s['online'],
                'is_sample' => true,
            ]);

            if ($search) {
                $employees = $employees->filter(fn ($e) => stripos($e['name'], $search) !== false || stripos($e['employee_code'], $search) !== false || stripos($e['phone'], $search) !== false)->values();
            }
            if ($region) {
                $employees = $employees->filter(fn ($e) => stripos($e['region'], $region) !== false)->values();
            }
        }

        $regions = $employees->pluck('region')->filter()->unique()->values();

        return Inertia::render('Admin/Profiles/EmployeeList', [
            'employees' => $employees,
            'regions' => $regions,
            'filters' => ['search' => $search, 'region' => $region],
        ]);
    }

    public function show($id)
    {
        $industryKey = IndustryContext::current();

        $catalogMember = IndustryCatalog::staffMember($industryKey, $id);
        if ($catalogMember) {
            $sampleVisits = collect(IndustryCatalog::visits($industryKey))
                ->where('staff_id', $catalogMember['id'])
                ->take(10)
                ->values()
                ->map(fn ($v) => [
                    'id' => $v['id'],
                    'farmer_name' => $v['entity_name'],
                    'check_in' => $v['check_in'],
                    'check_out' => $v['check_out'],
                    'date' => $v['date'],
                    'notes' => $v['notes'],
                ]);

            $sampleEntities = collect(IndustryCatalog::entities($industryKey))
                ->where('assigned_staff_id', $catalogMember['id'])
                ->values()
                ->map(fn ($e) => [
                    'id' => $e['id'],
                    'name' => $e['name'],
                    'farmer_code' => $e['code'],
                    'district' => $e['city'],
                    'land_acres' => $e['size'],
                    'status' => $e['status'],
                ]);

            return Inertia::render('Admin/Profiles/EmployeeDetail', [
                'employee' => [
                    'id' => $catalogMember['id'],
                    'name' => $catalogMember['name'],
                    'phone' => $catalogMember['phone'],
                    'email' => $catalogMember['email'],
                    'status' => $catalogMember['status'],
                    'employee_code' => $catalogMember['code'],
                    'region' => $catalogMember['region'],
                    'emergency' => '9840099881',
                    'last_latitude' => 12.9716,
                    'last_longitude' => 77.5946,
                    'recentPath' => [
                        ['lat' => 12.9716, 'lng' => 77.5946, 'time' => '09:30 AM'],
                        ['lat' => 12.9825, 'lng' => 77.6081, 'time' => '11:15 AM'],
                    ],
                    'last_seen' => $catalogMember['online'] ? 'Just now' : 'Yesterday',
                    'avg_rating' => 4.9,
                    'is_sample' => true,
                ],
                'attendance' => [
                    ['date' => Carbon::today()->format('M d, Y'), 'check_in' => '08:58 AM', 'check_out' => '06:05 PM', 'total_hours' => 9.1, 'regular_hours' => 8.0, 'overtime_hours' => 0.1, 'is_late' => false, 'is_within_geofence' => true, 'status' => 'present', 'shift_name' => 'General (09:00 - 18:00)'],
                    ['date' => Carbon::yesterday()->format('M d, Y'), 'check_in' => '09:02 AM', 'check_out' => '06:00 PM', 'total_hours' => 8.9, 'regular_hours' => 7.9, 'overtime_hours' => 0.0, 'is_late' => false, 'is_within_geofence' => true, 'status' => 'present', 'shift_name' => 'General (09:00 - 18:00)'],
                    ['date' => Carbon::now()->subDays(2)->format('M d, Y'), 'check_in' => '09:22 AM', 'check_out' => '06:30 PM', 'total_hours' => 9.1, 'regular_hours' => 8.0, 'overtime_hours' => 0.1, 'is_late' => true, 'late_minutes' => 22, 'is_within_geofence' => true, 'status' => 'late', 'shift_name' => 'General (09:00 - 18:00)'],
                    ['date' => Carbon::now()->subDays(3)->format('M d, Y'), 'check_in' => '08:55 AM', 'check_out' => '07:15 PM', 'total_hours' => 10.3, 'regular_hours' => 8.0, 'overtime_hours' => 1.3, 'is_late' => false, 'is_within_geofence' => true, 'status' => 'overtime', 'shift_name' => 'General (09:00 - 18:00)'],
                    ['date' => Carbon::now()->subDays(4)->format('M d, Y'), 'check_in' => '09:00 AM', 'check_out' => '06:00 PM', 'total_hours' => 9.0, 'regular_hours' => 8.0, 'overtime_hours' => 0.0, 'is_late' => false, 'is_within_geofence' => true, 'status' => 'present', 'shift_name' => 'General (09:00 - 18:00)'],
                ],
                'visitsThisWeek' => $sampleVisits,
                'assignedFarmers' => $sampleEntities,
                'recentReviews' => [
                    ['rating' => 5, 'comment' => 'Very punctual and thorough with all procedures.', 'farmer_name' => 'Site Lead', 'date' => '2 hours ago'],
                ],
            ]);
        }

        $user = User::where('id', $id)->where('role', 'employee')
            ->with('employeeDetail')
            ->firstOrFail();

        $weekStart = Carbon::now()->startOfWeek();

        $attendance = AttendanceLog::where('employee_id', $id)
            ->orderBy('date', 'desc')
            ->take(7)
            ->get()
            ->map(fn ($a) => [
                'date' => $a->date->format('M d, Y'),
                'check_in' => $a->check_in_timestamp?->format('h:i A') ?? 'N/A',
                'check_out' => $a->check_out_timestamp?->format('h:i A') ?? 'N/A',
                'total_hours' => (float) ($a->total_hours ?: ($a->check_in_timestamp && $a->check_out_timestamp ? round(Carbon::parse($a->check_in_timestamp)->diffInMinutes(Carbon::parse($a->check_out_timestamp)) / 60, 1) : 0)),
                'regular_hours' => (float) ($a->regular_hours ?: 0),
                'overtime_hours' => (float) ($a->overtime_hours ?: 0),
                'is_late' => (bool) $a->is_late,
                'late_minutes' => (int) $a->late_minutes,
                'is_within_geofence' => (bool) ($a->is_within_geofence ?? true),
                'status' => $a->status ?: ($a->check_in_timestamp ? 'present' : 'absent'),
                'shift_name' => $a->shift_name ?: 'General (09:00 - 18:00)',
            ]);

        $visitsThisWeek = FarmerVisit::where('employee_id', $id)
            ->whereDate('created_at', '>=', $weekStart)
            ->with('farmer:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'farmer_name' => $v->farmer?->name ?? 'Unknown',
                'check_in' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('h:i A') : 'N/A',
                'check_out' => $v->check_out_time ? Carbon::parse($v->check_out_time)->format('h:i A') : 'N/A',
                'date' => Carbon::parse($v->created_at)->format('M d, Y'),
                'notes' => $v->farm_condition_notes,
            ]);

        $recentPoints = LocationPoint::where('employee_id', $id)
            ->whereDate('created_at', Carbon::today())
            ->orderBy('timestamp', 'desc')
            ->limit(100)
            ->get()
            ->map(fn ($p) => [
                'lat' => $p->latitude,
                'lng' => $p->longitude,
            ]);

        $assignedFarmers = FarmerProfile::where('created_by_employee_id', $id)
            ->with('user:id,name')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($f) => [
                'id' => $f->user_id,
                'name' => $f->user?->name ?? 'Unknown',
                'farmer_code' => $f->farmer_code,
                'district' => $f->district,
                'land_acres' => $f->land_size_acres,
                'status' => $f->approval_status,
            ]);

        $avgRating = FarmerVisit::join('farmer_reviews', 'farmer_visits.id', '=', 'farmer_reviews.visit_id')
            ->where('farmer_visits.employee_id', $id)
            ->avg('farmer_reviews.rating');

        $recentReviews = FarmerVisit::join('farmer_reviews', 'farmer_visits.id', '=', 'farmer_reviews.visit_id')
            ->where('farmer_visits.employee_id', $id)
            ->orderBy('farmer_reviews.created_at', 'desc')
            ->take(5)
            ->get(['farmer_reviews.rating', 'farmer_reviews.feedback_comments', 'farmer_visits.farmer_id', 'farmer_reviews.created_at'])
            ->map(function ($review) {
                $farmer = User::find($review->farmer_id);
                return [
                    'rating' => $review->rating,
                    'comment' => $review->feedback_comments,
                    'farmer_name' => $farmer ? $farmer->name : 'Unknown',
                    'date' => Carbon::parse($review->created_at)->diffForHumans(),
                ];
            });

        return Inertia::render('Admin/Profiles/EmployeeDetail', [
            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'status' => $user->status,
                'employee_code' => $user->employeeDetail?->employee_code ?? 'N/A',
                'region' => $user->employeeDetail?->assigned_region ?? 'Unassigned',
                'emergency' => $user->employeeDetail?->emergency_phone ?? 'N/A',
                'last_latitude' => $recentPoints->first()['lat'] ?? null,
                'last_longitude' => $recentPoints->first()['lng'] ?? null,
                'recentPath' => $recentPoints,
                'last_seen' => $recentPoints->isNotEmpty() ? 'Recently' : 'Never',
                'avg_rating' => $avgRating ? round($avgRating, 1) : null,
            ],
            'attendance' => $attendance,
            'visitsThisWeek' => $visitsThisWeek,
            'assignedFarmers' => $assignedFarmers,
            'recentReviews' => $recentReviews,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Profiles/EmployeeRegistrationForm');
    }

    public function store(Request $request)
    {
        $industryKey = IndustryContext::current();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|unique:users,phone|max:20',
            'emergency_phone' => 'nullable|string|max:20',
            'assigned_region' => 'nullable|string|max:255',
        ]);

        $password = Str::random(12);
        $email = $validated['phone'].'@fieldy.io';

        $userAttributes = [
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'employee',
            'status' => 'active',
            'company_id' => auth()->user()?->company_id,
        ];
        $userAttributes = IndustryContext::tag($userAttributes, 'users', $industryKey);
        $user = User::create($userAttributes);

        $region = $validated['assigned_region'] ?? '';
        $prefix = $region ? strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $region), 0, 3)) : 'FLD';

        EmployeeDetail::create([
            'user_id' => $user->id,
            'employee_code' => $prefix.'-EMP-'.str_pad($user->id, 4, '0', STR_PAD_LEFT),
            'emergency_phone' => $validated['emergency_phone'] ?? null,
            'assigned_region' => $validated['assigned_region'] ?? null,
        ]);

        return redirect('/admin/employees')
            ->with('success', 'Staff member registered successfully.')
            ->with('generated_password', $password);
    }

    public function edit($id)
    {
        $industryKey = IndustryContext::current();
        $catalogMember = IndustryCatalog::staffMember($industryKey, $id);
        if ($catalogMember) {
            return Inertia::render('Admin/Profiles/EmployeeDetail', [
                'employee' => [
                    'id' => $catalogMember['id'],
                    'name' => $catalogMember['name'],
                    'phone' => $catalogMember['phone'],
                    'status' => $catalogMember['status'],
                    'employee_code' => $catalogMember['code'],
                    'region' => $catalogMember['region'],
                    'emergency' => '9840099881',
                ],
                'editing' => true,
            ]);
        }

        $user = User::where('id', $id)->where('role', 'employee')
            ->with('employeeDetail')
            ->firstOrFail();

        return Inertia::render('Admin/Profiles/EmployeeDetail', [
            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'status' => $user->status,
                'employee_code' => $user->employeeDetail?->employee_code,
                'region' => $user->employeeDetail?->assigned_region,
                'emergency' => $user->employeeDetail?->emergency_phone,
            ],
            'editing' => true,
        ]);
    }

    public function update(Request $request, $id)
    {
        $industryKey = IndustryContext::current();
        if (IndustryCatalog::staffMember($industryKey, $id)) {
            return redirect('/admin/employees/'.$id)->with('success', 'Staff member updated.');
        }

        $user = User::where('id', $id)->where('role', 'employee')->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'assigned_region' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,disabled',
        ]);

        $user->update(['name' => $validated['name'], 'status' => $validated['status']]);
        $user->employeeDetail?->update([
            'assigned_region' => $validated['assigned_region'],
            'emergency_phone' => $validated['emergency_phone'],
        ]);

        return redirect('/admin/employees/'.$id)->with('success', 'Staff member updated.');
    }
}
