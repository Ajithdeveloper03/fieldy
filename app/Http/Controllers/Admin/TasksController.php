<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TasksController extends Controller
{
    public function index()
    {
        $companyId = auth()->user()->company_id;

        $tasks = Task::with(['assignedTo:id,name', 'customer:id,name', 'createdBy:id,name'])
            ->when($companyId, fn ($q) => $q->whereHas('assignedTo', fn ($u) => $u->where('company_id', $companyId)))
            ->orderByRaw("FIELD(status, 'in_progress', 'pending', 'done', 'cancelled')")
            ->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'work_order_code' => $t->work_order_code ?: 'WO-' . str_pad($t->id, 5, '0', STR_PAD_LEFT),
                'title' => $t->title,
                'description' => $t->description,
                'industry' => $t->industry ?: 'facility_management',
                'assigned_to' => $t->assignedTo ? ['id' => $t->assignedTo->id, 'name' => $t->assignedTo->name] : null,
                'customer' => $t->customer ? ['id' => $t->customer->id, 'name' => $t->customer->name] : null,
                'created_by' => $t->createdBy?->name,
                'due_date' => $t->due_date?->format('M d, Y'),
                'due_date_raw' => $t->due_date?->toDateString(),
                'priority' => $t->priority,
                'status' => $t->status,
                'ai_suggestions' => $t->ai_suggestions,
                'checklist' => $t->checklist ?: [
                    ['id' => 1, 'text' => 'Verify site safety checklist & PPE gear', 'done' => true],
                    ['id' => 2, 'text' => 'Conduct physical inspection & diagnostics', 'done' => false],
                    ['id' => 3, 'text' => 'Upload before-and-after work photos', 'done' => false],
                    ['id' => 4, 'text' => 'Verify customer OTP confirmation (dummy: 4821)', 'done' => false],
                ],
                'safety_requirements' => $t->safety_requirements ?: ['High-visibility vest', 'Insulated gloves', 'Safety goggles', 'Hard hat'],
                'customer_otp' => $t->customer_otp ?: '4821',
                'otp_verified' => (bool)$t->otp_verified,
                'points_awarded' => $t->points_awarded ?: 35,
                'overdue' => $t->due_date && $t->due_date->isPast() && $t->status !== 'done',
            ]);

        $employees = User::where('role', 'employee')->where('status', 'active')
            ->select('id', 'name')->orderBy('name')->get();

        $customers = User::where('role', 'farmer')
            ->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/TaskManagement', [
            'tasks' => $tasks,
            'employees' => $employees,
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'customer_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,urgent',
            'ai_suggestions' => 'nullable|string',
        ]);

        $task = Task::create([
            ...$validated,
            'industry' => $validated['industry'] ?? 'facility_management',
            'work_order_code' => 'WO-' . strtoupper(bin2hex(random_bytes(3))),
            'created_by' => auth()->id(),
            'status' => 'pending',
            'customer_otp' => '4821',
            'points_awarded' => 40,
            'checklist' => [
                ['id' => 1, 'text' => 'Verify site safety checklist & PPE gear', 'done' => false],
                ['id' => 2, 'text' => 'Execute service order & replace components', 'done' => false],
                ['id' => 3, 'text' => 'Take photo evidence of completed work', 'done' => false],
                ['id' => 4, 'text' => 'Perform customer OTP sign-off', 'done' => false],
            ]
        ]);

        return redirect('/admin/tasks')->with('success', 'Work Order created successfully.');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'customer_id' => 'nullable|exists:users,id',
            'due_date' => 'nullable|date',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'status' => 'sometimes|required|in:pending,in_progress,done,cancelled',
            'otp_verified' => 'nullable|boolean',
        ]);

        $task = Task::findOrFail($id);
        $task->update($validated);

        return redirect('/admin/tasks')->with('success', 'Work order updated successfully.');
    }

    public function destroy($id)
    {
        Task::findOrFail($id)->delete();

        return redirect('/admin/tasks')->with('success', 'Work order removed.');
    }
}
