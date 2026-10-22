<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CompanyManagementController extends Controller
{
    public function index()
    {
        $companies = Company::with(['admins'])
            ->withCount(['employees', 'farmers'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($comp) {
                return [
                    'id' => $comp->id,
                    'name' => $comp->name,
                    'slug' => $comp->slug,
                    'code' => $comp->code,
                    'industry' => $comp->industry,
                    'email' => $comp->email,
                    'phone' => $comp->phone,
                    'address' => $comp->address,
                    'plan' => $comp->plan,
                    'status' => $comp->status,
                    'max_employees' => $comp->max_employees,
                    'employees_count' => $comp->employees_count,
                    'farmers_count' => $comp->farmers_count,
                    'subscription_expires_at' => $comp->subscription_expires_at ? $comp->subscription_expires_at->format('Y-m-d') : null,
                    'admin' => $comp->admins->first() ? [
                        'name' => $comp->admins->first()->name,
                        'email' => $comp->admins->first()->email,
                        'phone' => $comp->admins->first()->phone,
                    ] : null,
                ];
            });

        return Inertia::render('Superadmin/Companies', [
            'companies' => $companies,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:companies,code',
            'industry' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'plan' => 'required|in:starter,professional,enterprise',
            'max_employees' => 'required|integer|min:1',
            'subscription_expires_at' => 'nullable|date',
            // Primary Admin Account
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|unique:users,email',
            'admin_phone' => 'required|string|unique:users,phone',
            'admin_password' => 'required|string|min:6',
        ]);

        $slug = Str::slug($validated['name']);
        // Ensure slug uniqueness
        $originalSlug = $slug;
        $counter = 1;
        while (Company::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $counter++;
        }

        $company = Company::create([
            'name' => $validated['name'],
            'slug' => $slug,
            'code' => $validated['code'] ?? strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $validated['name']), 0, 6)),
            'industry' => $validated['industry'] ?? 'Field Services & Sales',
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'address' => $validated['address'] ?? null,
            'plan' => $validated['plan'],
            'status' => 'active',
            'max_employees' => $validated['max_employees'],
            'subscription_expires_at' => $validated['subscription_expires_at'] ?? now()->addYear(),
        ]);

        // Create the company's designated Client Admin user
        User::create([
            'company_id' => $company->id,
            'name' => $validated['admin_name'],
            'email' => $validated['admin_email'],
            'phone' => $validated['admin_phone'],
            'password' => Hash::make($validated['admin_password']),
            'role' => 'admin',
            'status' => 'active',
        ]);

        return redirect()->back()->with('success', "Company '{$company->name}' and Client Admin created successfully!");
    }

    public function update(Request $request, $id)
    {
        $company = Company::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'industry' => 'nullable|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'plan' => 'required|in:starter,professional,enterprise',
            'status' => 'required|in:active,inactive,suspended',
            'max_employees' => 'required|integer|min:1',
            'subscription_expires_at' => 'nullable|date',
        ]);

        $company->update($validated);

        return redirect()->back()->with('success', "Company updated successfully!");
    }

    public function show($id)
    {
        $company = Company::with(['admins', 'employees.employeeDetail'])->findOrFail($id);

        $today = \Carbon\Carbon::today();

        // 1. Employees with mobile tracking telemetry & attendance
        $employees = $company->employees->map(function ($emp) use ($today) {
            $latestLocation = \App\Models\LocationPoint::where('employee_id', $emp->id)->latest('timestamp')->first();
            $activeSession = \App\Models\TrackingSession::where('employee_id', $emp->id)->where('status', 'active')->first();
            $attendanceToday = \App\Models\AttendanceLog::where('employee_id', $emp->id)->whereDate('date', $today)->first();
            $visitsToday = \App\Models\FarmerVisit::where('employee_id', $emp->id)->whereDate('created_at', $today)->count();
            $totalVisits = \App\Models\FarmerVisit::where('employee_id', $emp->id)->count();

            return [
                'id' => $emp->id,
                'name' => $emp->name,
                'email' => $emp->email,
                'phone' => $emp->phone,
                'status' => $emp->status,
                'designation' => $emp->employeeDetail->designation ?? 'Field Agent',
                'region' => $emp->employeeDetail->assigned_region ?? 'N/A',
                'employee_code' => $emp->employeeDetail->employee_code ?? 'EMP-'.$emp->id,
                'hasCheckedIn' => !is_null($attendanceToday),
                'checkInTime' => $attendanceToday?->check_in_timestamp ? \Carbon\Carbon::parse($attendanceToday->check_in_timestamp)->format('h:i A') : null,
                'checkOutTime' => $attendanceToday?->check_out_timestamp ? \Carbon\Carbon::parse($attendanceToday->check_out_timestamp)->format('h:i A') : null,
                'isTrackingActive' => !is_null($activeSession),
                'latestPing' => $latestLocation ? [
                    'latitude' => $latestLocation->latitude,
                    'longitude' => $latestLocation->longitude,
                    'time' => \Carbon\Carbon::createFromTimestampMs($latestLocation->timestamp)->format('h:i A'),
                    'battery' => $latestLocation->battery_level ?? 85,
                ] : null,
                'visitsToday' => $visitsToday,
                'totalVisits' => $totalVisits,
            ];
        });

        // 2. Mobile App Live Visits & Audits (with photo proof & GPS)
        $empIds = $company->employees->pluck('id');
        $visits = \App\Models\FarmerVisit::whereIn('employee_id', $empIds)
            ->with(['employee:id,name', 'farmer:id,name'])
            ->latest('check_in_time')
            ->take(30)
            ->get()
            ->map(fn ($v) => [
                'id' => $v->id,
                'employee' => $v->employee?->name ?? 'Field Agent',
                'farmer' => $v->farmer?->name ?? 'Customer / Facility',
                'check_in_time' => $v->check_in_time ? \Carbon\Carbon::parse($v->check_in_time)->format('M d, Y h:i A') : null,
                'check_out_time' => $v->check_out_time ? \Carbon\Carbon::parse($v->check_out_time)->format('h:i A') : null,
                'check_in_lat' => $v->check_in_latitude,
                'check_in_lng' => $v->check_in_longitude,
                'distance_km' => $v->distance_from_previous_farmer_km,
                'notes' => $v->farm_condition_notes,
                'recommendations' => $v->recommendations,
            ]);

        // 3. Customers / Farmers registered by company's mobile field agents
        $farmers = \App\Models\User::where('company_id', $company->id)
            ->where('role', 'farmer')
            ->with('farmerProfile')
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($f) => [
                'id' => $f->id,
                'name' => $f->name,
                'phone' => $f->phone,
                'status' => $f->status,
                'acres' => $f->farmerProfile?->land_size_acres ?? 0,
                'village' => $f->farmerProfile?->village ?? 'N/A',
                'district' => $f->farmerProfile?->district ?? 'N/A',
                'crop' => $f->farmerProfile?->crop_types ? implode(', ', $f->farmerProfile->crop_types) : 'Vetiver',
                'kyc' => $f->farmerProfile?->kyc_status ?? 'pending',
                'created_at' => $f->created_at->format('M d, Y'),
            ]);

        // 4. Tasks & Work Orders
        $tasks = \App\Models\Task::whereIn('assigned_to', $empIds)
            ->with(['assignedTo:id,name', 'customer:id,name'])
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'work_order_code' => $t->work_order_code ?? 'TSK-'.$t->id,
                'title' => $t->title,
                'assigned_to' => $t->assignedTo?->name ?? 'Unassigned',
                'customer' => $t->customer?->name ?? 'Client Facility',
                'priority' => $t->priority,
                'status' => $t->status,
                'due_date' => $t->due_date ? \Carbon\Carbon::parse($t->due_date)->format('M d, Y') : 'No Date',
                'otp_verified' => (bool)$t->otp_verified,
            ]);

        // 5. Financials & Payouts
        $payments = \App\Models\Payment::whereIn('employee_id', $empIds)
            ->with('employee:id,name')
            ->latest()
            ->take(30)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'employee' => $p->employee?->name ?? 'Staff',
                'amount' => $p->amount,
                'payment_type' => $p->payment_type,
                'status' => $p->status,
                'month_year' => $p->month_year,
                'payment_date' => $p->payment_date ? \Carbon\Carbon::parse($p->payment_date)->format('M d, Y') : null,
                'notes' => $p->notes,
            ]);

        return Inertia::render('Superadmin/CompanyDetail', [
            'company' => [
                'id' => $company->id,
                'name' => $company->name,
                'slug' => $company->slug,
                'code' => $company->code,
                'industry' => $company->industry,
                'email' => $company->email,
                'phone' => $company->phone,
                'address' => $company->address,
                'plan' => $company->plan,
                'status' => $company->status,
                'max_employees' => $company->max_employees,
                'subscription_expires_at' => $company->subscription_expires_at ? $company->subscription_expires_at->format('M d, Y') : null,
                'admin' => $company->admins->first() ? [
                    'id' => $company->admins->first()->id,
                    'name' => $company->admins->first()->name,
                    'email' => $company->admins->first()->email,
                    'phone' => $company->admins->first()->phone,
                ] : null,
            ],
            'stats' => [
                'totalEmployees' => $company->employees->count(),
                'activeTrackingNow' => $employees->where('isTrackingActive', true)->count(),
                'checkedInToday' => $employees->where('hasCheckedIn', true)->count(),
                'totalVisits' => \App\Models\FarmerVisit::whereIn('employee_id', $empIds)->count(),
                'totalCustomers' => \App\Models\User::where('company_id', $company->id)->where('role', 'farmer')->count(),
                'totalTasks' => \App\Models\Task::whereIn('assigned_to', $empIds)->count(),
                'totalPayouts' => \App\Models\Payment::whereIn('employee_id', $empIds)->sum('amount'),
            ],
            'employees' => $employees,
            'visits' => $visits,
            'farmers' => $farmers,
            'tasks' => $tasks,
            'payments' => $payments,
        ]);
    }

    public function impersonate($id)
    {
        $company = Company::with('admins')->findOrFail($id);
        $admin = $company->admins->first();

        if (! $admin) {
            return back()->with('error', 'This company has no active Client Admin account to impersonate.');
        }

        // Log in as client admin
        \Illuminate\Support\Facades\Auth::login($admin);

        return redirect('/admin/dashboard')->with('success', "Switched into {$company->name} Client Admin Portal.");
    }
}
