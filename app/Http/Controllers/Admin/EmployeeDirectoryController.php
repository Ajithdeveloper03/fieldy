<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\EmployeeDetail;
use App\Models\FarmerProfile;
use App\Models\FarmerVisit;
use App\Models\LocationPoint;
use App\Models\User;
use App\Services\EmployeeCodeService;
use App\Services\EmployeePerformanceService;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Str;
use Inertia\Inertia;

class EmployeeDirectoryController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $region = $request->query('region', '');
        $industryKey = IndustryContext::current();

        $query = $this->manageableEmployees()
            ->with(['employeeDetail', 'attendanceLogs' => fn ($q) => $q->whereDate('date', Carbon::today())]);

        if (IndustryContext::hasColumn('users')) {
            $query = IndustryContext::scope($query, $industryKey);
        }

        if ($search) {
            $likeSearch = \App\Support\SqlSafe::likeTerm($search);
            if ($likeSearch !== '') {
                $query->where(function ($sub) use ($likeSearch) {
                    $sub->where('name', 'like', $likeSearch)
                        ->orWhere('phone', 'like', $likeSearch)
                        ->orWhereHas('employeeDetail', fn ($ed) => $ed->where('employee_code', 'like', $likeSearch));
                });
            }
        }

        if ($region) {
            $likeRegion = \App\Support\SqlSafe::likeTerm($region);
            if ($likeRegion !== '') {
                $query->whereHas('employeeDetail', fn ($ed) => $ed->where('assigned_region', 'like', $likeRegion));
            }
        }

        $employees = $query->orderBy('id')->get()->sortBy('employeeDetail.employee_code', SORT_NATURAL)->values()->map(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'email' => $user->email,
            'status' => $user->status,
            'employee_code' => $user->employeeDetail?->employee_code ?? 'N/A',
            'has_photo' => filled($user->employeeDetail?->photo_path),
            'region' => $user->employeeDetail?->assigned_region ?? 'Unassigned',
            'designation' => $user->employeeDetail?->designation ?? 'field_staff',
            'reports_to' => $user->employeeDetail?->reports_to,
            'manager_name' => $user->employeeDetail?->reports_to ? User::find($user->employeeDetail->reports_to)?->name : 'None',
            'emergency' => $user->employeeDetail?->emergency_phone ?? 'N/A',
            'checked_in' => $user->attendanceLogs->isNotEmpty(),
        ]);

        $regions = $employees->pluck('region')->filter()->unique()->values();

        return Inertia::render('Admin/Profiles/EmployeeList', [
            'employees' => $employees,
            'regions' => $regions,
            'filters' => ['search' => $search, 'region' => $region],
        ]);
    }

    public function show($id, EmployeePerformanceService $performance, bool $editing = false)
    {
        $industryKey = IndustryContext::current();
        $companyId = auth()->user()?->company_id;

        $catalogMember = ! $companyId ? IndustryCatalog::staffMember($industryKey, $id) : null;
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
                'performanceHistory' => [],
            ]);
        }

        $user = $this->manageableEmployees()->whereKey($id)
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
            'editing' => $editing,
            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'email' => $user->email,
                'status' => $user->status,
                'employee_code' => $user->employeeDetail?->employee_code ?? 'N/A',
                'has_photo' => filled($user->employeeDetail?->photo_path),
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
            'performanceHistory' => $this->performanceHistory($user, $performance),
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
            'email' => 'nullable|string|max:255|unique:users,email',
            'password' => 'nullable|string|min:4|max:100',
            'emergency_phone' => 'nullable|string|max:20',
            'assigned_region' => 'nullable|string|max:255',
            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $password = !empty($validated['password']) ? $validated['password'] : Str::random(10);
        $email = !empty($validated['email']) ? trim($validated['email']) : ($validated['phone'].'@fieldy.io');

        $userAttributes = [
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'employee',
            'status' => 'active',
            'company_id' => auth()->user()?->company_id,
        ];
        if (IndustryContext::hasColumn('users')) {
            $userAttributes = IndustryContext::tag($userAttributes, 'users', $industryKey);
        }
        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('employee-photos', 'local');
            if (! $photoPath) {
                throw ValidationException::withMessages(['photo' => 'The photo could not be saved. Please try again.']);
            }
        }

        try {
            DB::transaction(function () use ($userAttributes, $validated, $photoPath) {
                $user = User::create($userAttributes);
                app(EmployeeCodeService::class)->ensure($user, [
                    'emergency_phone' => $validated['emergency_phone'] ?? null,
                    'assigned_region' => $validated['assigned_region'] ?? null,
                    'photo_path' => $photoPath,
                ]);
            });
        } catch (\Throwable $exception) {
            if ($photoPath) {
                Storage::disk('local')->delete($photoPath);
            }
            throw $exception;
        }

        $employeesUrl = ($request->is('fieldy/*') && ! str_ends_with(rtrim(url('/'), '/'), '/fieldy'))
            ? '/fieldy/admin/employees'
            : '/admin/employees';

        return redirect($employeesUrl)
            ->with('success', $validated['name'].' registered successfully.')
            ->with('generated_password', $password)
            ->with('generated_login_id', $email)
            ->with('generated_name', $validated['name']);
    }

    public function edit($id, EmployeePerformanceService $performance)
    {
        return $this->show($id, $performance, true);
    }

    public function photo($id)
    {
        $employee = $this->manageableEmployees()->with('employeeDetail')->findOrFail($id);
        $path = $employee->employeeDetail?->photo_path;
        $disk = Storage::disk('local');
        abort_unless($path && $disk->exists($path), 404);

        return $disk->response($path, headers: [
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = $this->manageableEmployees()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|max:255|unique:users,email,'.$user->id,
            'phone' => 'required|string|max:20|unique:users,phone,'.$user->id,
            'password' => 'nullable|string|min:4|max:100',
            'assigned_region' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:20',
            'status' => 'required|in:active,disabled',
        ]);

        $userData = [
            'name' => $validated['name'],
            'email' => trim($validated['email']),
            'phone' => trim($validated['phone']),
            'status' => $validated['status'],
        ];
        if (!empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }
        DB::transaction(function () use ($user, $userData, $validated) {
            $user->update($userData);
            app(EmployeeCodeService::class)->ensure($user, [
                'assigned_region' => $validated['assigned_region'] ?? null,
                'emergency_phone' => $validated['emergency_phone'] ?? null,
            ]);
            if (isset($userData['password'])) {
                $user->tokens()->delete();
            }
        });

        return $this->employeeRedirect($request, 'employees.show', $user->id)
            ->with('success', $validated['name'].' credentials and profile updated.');
    }

    public function destroy(Request $request, $id)
    {
        $employee = $this->manageableEmployees()->findOrFail($id);

        DB::transaction(function () use ($employee) {
            $employee->tokens()->delete();
            $employee->delete();
        });

        return $this->employeeRedirect($request, 'employees.index')
            ->with('success', $employee->name.' removed. Attendance history was kept.');
    }

    private function manageableEmployees()
    {
        $admin = auth()->user();

        return User::where('role', 'employee')
            ->when(! $admin->isSuperAdmin() || $admin->company_id,
                fn ($query) => $query->where('company_id', $admin->company_id));
    }

    private function employeeRedirect(Request $request, string $route, ?int $id = null)
    {
        $name = str_starts_with($request->route()->getName(), 'fieldy.') ? 'fieldy.'.$route : $route;

        return redirect()->route($name, $id === null ? [] : ['id' => $id]);
    }

    private function performanceHistory(User $employee, EmployeePerformanceService $performance): array
    {
        $now = CarbonImmutable::now();
        $history = [];
        for ($monthsAgo = 0; $monthsAgo < 6; $monthsAgo++) {
            $start = $now->startOfMonth()->subMonths($monthsAgo);
            $metrics = $performance->summarize($employee, $start, $monthsAgo ? $start->endOfMonth() : $now);
            if ($metrics['score'] !== null) {
                $history[] = ['period' => $start->format('M Y'), ...$metrics];
            }
        }

        return $history;
    }
}
