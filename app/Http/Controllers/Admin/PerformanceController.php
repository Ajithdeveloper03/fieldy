<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\EmployeePerformanceService;
use App\Services\Industry\IndustryContext;
use Carbon\CarbonImmutable;
use Inertia\Inertia;

class PerformanceController extends Controller
{
    public function index(EmployeePerformanceService $performance)
    {
        $now = CarbonImmutable::now();
        $query = User::where('role', 'employee')->where('status', 'active')
            ->where('company_id', auth()->user()->company_id)->with('employeeDetail');

        if (IndustryContext::hasColumn('users')) {
            $query = IndustryContext::scope($query, IndustryContext::current());
        }

        $employees = $query->orderBy('name')->get()->map(fn (User $employee) => [
            'id' => $employee->id,
            'name' => $employee->name,
            'employee_code' => $employee->employeeDetail?->employee_code,
            'region' => $employee->employeeDetail?->assigned_region,
            ...$performance->summarize($employee, $now->startOfMonth(), $now),
        ])->sortByDesc(fn ($employee) => $employee['score'] ?? -1)->values();

        return Inertia::render('Admin/EmployeePerformance', [
            'employees' => $employees,
            'period' => $now->format('F Y'),
        ]);
    }
}
