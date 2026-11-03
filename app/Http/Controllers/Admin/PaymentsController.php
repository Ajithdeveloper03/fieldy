<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\User;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentsController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->query('month', Carbon::now()->format('F Y'));
        $status = $request->query('status', '');
        $empId = $request->query('employee_id', '');
        $companyId = auth()->user()?->company_id;
        $industryKey = IndustryContext::current();

        $query = Payment::with('employee:id,name')
            ->when($companyId, fn ($q) => $q->whereHas('employee', fn ($e) => $e->where('company_id', $companyId)))
            ->when($month, fn ($q) => $q->where('month_year', $month))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->when($empId, fn ($q) => $q->where('employee_id', $empId));

        $query = IndustryContext::scope($query, $industryKey);

        $payments = $query->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'employee' => ['id' => $p->employee?->id, 'name' => $p->employee?->name ?? 'Unknown'],
                'amount' => $p->amount,
                'payment_type' => $p->payment_type,
                'status' => $p->status,
                'payment_date' => $p->payment_date?->format('M d, Y'),
                'month_year' => $p->month_year,
                'notes' => $p->notes,
            ]);

        // If no records in DB for this service vertical, supply curated catalog payroll
        if ($payments->isEmpty()) {
            $catalogPayments = collect(IndustryCatalog::payments($industryKey));
            if ($status) {
                $catalogPayments = $catalogPayments->filter(fn ($p) => $p['status'] === $status)->values();
            }
            if ($empId) {
                $catalogPayments = $catalogPayments->filter(fn ($p) => (string) $p['employee_id'] === (string) $empId)->values();
            }

            $payments = $catalogPayments->map(fn ($p) => [
                'id' => $p['id'],
                'employee' => ['id' => $p['employee_id'], 'name' => $p['employee_name']],
                'amount' => $p['amount'],
                'payment_type' => $p['payment_type'],
                'status' => $p['status'],
                'payment_date' => $p['payment_date'],
                'month_year' => $p['month_year'],
                'notes' => $p['notes'],
                'is_sample' => true,
            ]);

            $totals = [
                'total_paid' => $payments->where('status', 'paid')->sum('amount'),
                'total_pending' => $payments->where('status', 'pending')->sum('amount'),
                'total' => $payments->sum('amount'),
                'count' => $payments->count(),
            ];

            $employees = collect(IndustryCatalog::staff($industryKey))->map(fn ($s) => [
                'id' => $s['id'],
                'name' => $s['name'],
            ]);
        } else {
            $basePaymentQuery = Payment::when($companyId, fn ($q) => $q->whereHas('employee', fn ($e) => $e->where('company_id', $companyId)))
                ->when($month, fn ($q) => $q->where('month_year', $month));
            $basePaymentQuery = IndustryContext::scope($basePaymentQuery, $industryKey);

            $totals = [
                'total_paid' => (clone $basePaymentQuery)->where('status', 'paid')->sum('amount'),
                'total_pending' => (clone $basePaymentQuery)->where('status', 'pending')->sum('amount'),
                'total' => (clone $basePaymentQuery)->sum('amount'),
                'count' => (clone $basePaymentQuery)->count(),
            ];

            $employees = User::where('role', 'employee')->where('status', 'active')
                ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
                ->select('id', 'name')->orderBy('name')->get();
        }

        $months = [
            Carbon::now()->format('F Y'),
            Carbon::now()->subMonth()->format('F Y'),
            Carbon::now()->subMonths(2)->format('F Y'),
        ];

        return Inertia::render('Admin/Payments', [
            'payments' => $payments,
            'totals' => $totals,
            'employees' => $employees,
            'months' => $months,
            'filters' => ['month' => $month, 'status' => $status, 'employee_id' => $empId],
        ]);
    }

    public function store(Request $request)
    {
        $industryKey = IndustryContext::current();

        $validated = $request->validate([
            'employee_id' => 'required',
            'amount' => 'required|numeric|min:1',
            'payment_type' => 'required|string',
            'payment_date' => 'nullable|date',
            'month_year' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $attributes = [
            ...$validated,
            'status' => 'pending',
        ];
        $attributes = IndustryContext::tag($attributes, 'payments', $industryKey);

        Payment::create($attributes);

        return redirect('/admin/payments')->with('success', 'Payment record created.');
    }

    public function markPaid(Request $request, $id)
    {
        $industryKey = IndustryContext::current();
        if ($id >= 500000) {
            return redirect('/admin/payments')->with('success', 'Sample payout marked as paid.');
        }

        $payment = Payment::findOrFail($id);
        $payment->update([
            'status' => 'paid',
            'payment_date' => now()->toDateString(),
        ]);

        return redirect('/admin/payments')->with('success', 'Payment marked as paid.');
    }
}
