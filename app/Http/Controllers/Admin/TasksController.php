<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TasksController extends Controller
{
    public function index()
    {
        $companyId = auth()->user()?->company_id;
        $industryKey = \App\Services\Industry\IndustryContext::current();

        $query = Task::with(['assignedTo:id,name', 'customer:id,name', 'createdBy:id,name'])
            ->when($companyId, fn ($q) => $q->where(function ($tasks) use ($companyId) {
                $tasks->whereHas('assignedTo', fn ($user) => $user->where('company_id', $companyId))
                    ->orWhereHas('createdBy', fn ($user) => $user->where('company_id', $companyId));
            }));

        $query = \App\Services\Industry\IndustryContext::scope($query, $industryKey);

        $tasks = $query->orderByRaw("CASE status 
                WHEN 'in_progress' THEN 1 
                WHEN 'pending' THEN 2 
                WHEN 'done' THEN 3 
                WHEN 'cancelled' THEN 4 
                ELSE 5 END")
            ->orderByRaw("CASE priority 
                WHEN 'urgent' THEN 1 
                WHEN 'high' THEN 2 
                WHEN 'medium' THEN 3 
                WHEN 'low' THEN 4 
                ELSE 5 END")
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'work_order_code' => $t->work_order_code ?: 'WO-' . str_pad($t->id, 5, '0', STR_PAD_LEFT),
                'title' => $t->title,
                'description' => $t->description,
                'industry' => $t->industry ?: $industryKey,
                'assigned_to' => $t->assignedTo ? ['id' => $t->assignedTo->id, 'name' => $t->assignedTo->name] : null,
                'customer' => $t->customer ? ['id' => $t->customer->id, 'name' => $t->customer->name] : null,
                'created_by' => $t->createdBy?->name,
                'due_date' => $t->due_date?->format('M d, Y'),
                'due_date_raw' => $t->due_date?->toDateString(),
                'priority' => $t->priority,
                'status' => $t->status,
                'ai_suggestions' => $t->ai_suggestions,
                'checklist' => $t->checklist ?: self::getDefaultChecklist($t->industry ?: $industryKey),
                'safety_requirements' => $t->safety_requirements ?: self::getDefaultSafety($t->industry ?: $industryKey),
                'customer_otp' => $t->customer_otp ?: '4821',
                'otp_verified' => (bool)$t->otp_verified,
                'points_awarded' => $t->points_awarded ?: 35,
                'overdue' => $t->due_date && $t->due_date->isPast() && $t->status !== 'done',
            ]);

        // If no tasks exist for this vertical in DB, load curated catalog work orders
        if ($tasks->isEmpty()) {
            $catalogTasks = collect(\App\Services\Industry\IndustryCatalog::tasks($industryKey))->map(fn ($t) => array_merge($t, [
                'checklist' => self::getDefaultChecklist($industryKey),
                'safety_requirements' => self::getDefaultSafety($industryKey),
            ]));
            $tasks = $catalogTasks;
        }

        // Assignment selects must only contain real database users. Catalog IDs are
        // display-only demo data and fail the foreign-key/exists validation on submit.
        $employees = User::where('role', 'employee')->where('status', 'active')
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
            ->select('id', 'name')->orderBy('name')->get();

        $customers = User::where('role', 'farmer')
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
            ->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/TaskManagement', [
            'tasks' => $tasks,
            'employees' => $employees,
            'customers' => $customers,
        ]);
    }

    public function store(Request $request)
    {
        $companyId = auth()->user()?->company_id;
        $assignedToRule = Rule::exists('users', 'id')->where('role', 'employee')->where('status', 'active');
        $customerRule = Rule::exists('users', 'id')->where('role', 'farmer');
        if ($companyId) {
            $assignedToRule->where('company_id', $companyId);
            $customerRule->where('company_id', $companyId);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string',
            'assigned_to' => ['nullable', 'integer', $assignedToRule],
            'customer_id' => ['nullable', 'integer', $customerRule],
            'due_date' => 'nullable|date',
            'priority' => 'required|in:low,medium,high,urgent',
            'ai_suggestions' => 'nullable|string',
        ]);

        $industry = \App\Services\IndustryService::normalize($validated['industry'] ?? 'real_estate');

        $task = Task::create([
            ...$validated,
            'industry' => $industry,
            'work_order_code' => strtoupper(substr($industry, 0, 2)) . '-' . strtoupper(bin2hex(random_bytes(3))),
            'created_by' => auth()->id(),
            'status' => 'pending',
            'customer_otp' => (string)rand(1000, 9999),
            'points_awarded' => 40,
            'checklist' => self::getDefaultChecklist($industry),
            'safety_requirements' => self::getDefaultSafety($industry),
        ]);

        return redirect($this->tasksUrl($request))->with('success', 'Site Task scheduled successfully.');
    }

    public function update(Request $request, $id)
    {
        $companyId = auth()->user()?->company_id;
        $assignedToRule = Rule::exists('users', 'id')->where('role', 'employee')->where('status', 'active');
        $customerRule = Rule::exists('users', 'id')->where('role', 'farmer');
        if ($companyId) {
            $assignedToRule->where('company_id', $companyId);
            $customerRule->where('company_id', $companyId);
        }

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'industry' => 'nullable|string',
            'assigned_to' => ['nullable', 'integer', $assignedToRule],
            'customer_id' => ['nullable', 'integer', $customerRule],
            'due_date' => 'nullable|date',
            'priority' => 'sometimes|required|in:low,medium,high,urgent',
            'status' => 'sometimes|required|in:pending,in_progress,done,cancelled',
            'otp_verified' => 'nullable|boolean',
        ]);

        $task = Task::findOrFail($id);
        $task->update($validated);

        return redirect($this->tasksUrl($request))->with('success', 'Work order updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        Task::findOrFail($id)->delete();

        return redirect($this->tasksUrl($request))->with('success', 'Work order removed.');
    }

    private function tasksUrl(Request $request): string
    {
        return $request->is('fieldy/*') ? '/fieldy/admin/tasks' : '/admin/tasks';
    }

    public static function getDefaultChecklist(string $industry): array
    {
        switch ($industry) {
            case 'cleaning':
                return [
                    ['id' => 1, 'text' => 'Verify protective PPE, gloves & disinfectant solution', 'done' => true],
                    ['id' => 2, 'text' => 'Perform deep clean / steam sanitize on targeted zone', 'done' => false],
                    ['id' => 3, 'text' => 'Restock hand towels, soap refills & biohazard bags', 'done' => false],
                    ['id' => 4, 'text' => 'Verify facility supervisor OTP check-in', 'done' => false],
                ];
            case 'construction':
                return [
                    ['id' => 1, 'text' => 'Mandatory geofence perimeter check & hard hat inspection', 'done' => true],
                    ['id' => 2, 'text' => 'Execute structural rebar or concrete slump verification', 'done' => false],
                    ['id' => 3, 'text' => 'Upload geo-tagged concrete casting & site photos', 'done' => false],
                    ['id' => 4, 'text' => 'Sign off structural QA checklist with site engineer', 'done' => false],
                ];
            case 'security':
                return [
                    ['id' => 1, 'text' => 'Clock-in at guard command post and stream body-cam live', 'done' => true],
                    ['id' => 2, 'text' => 'Execute perimeter patrol round and scan RFID/NFC checkpoints', 'done' => false],
                    ['id' => 3, 'text' => 'Check electric fence voltage and magnetic door sensors', 'done' => false],
                    ['id' => 4, 'text' => 'Complete shift log handover and radio check', 'done' => false],
                ];
            case 'facility_fmcg':
                return [
                    ['id' => 1, 'text' => 'Verify restroom smart sensor cleanliness and odor ppm', 'done' => true],
                    ['id' => 2, 'text' => 'Perform FMCG store shelf SKU replenishment in assigned bay', 'done' => false],
                    ['id' => 3, 'text' => 'Conduct HVAC air duct filter check', 'done' => false],
                    ['id' => 4, 'text' => 'Verify retail store manager confirmation sign-off', 'done' => false],
                ];
            case 'maintenance':
                return [
                    ['id' => 1, 'text' => 'Execute Lockout / Tagout (LOTO) electrical safety protocol', 'done' => true],
                    ['id' => 2, 'text' => 'Perform preventive maintenance lubrication & bearing checks', 'done' => false],
                    ['id' => 3, 'text' => 'Record motor vibration and thermography temperature scan', 'done' => false],
                    ['id' => 4, 'text' => 'Verify client maintenance lead work order completion sign-off', 'done' => false],
                ];
            case 'solar':
                return [
                    ['id' => 1, 'text' => 'Verify DC disconnect isolation and high-voltage gloves', 'done' => true],
                    ['id' => 2, 'text' => 'Inspect string inverter combiner boxes and DC fuses', 'done' => false],
                    ['id' => 3, 'text' => 'Clean pyranometer lens and record irradiance W/m²', 'done' => false],
                    ['id' => 4, 'text' => 'Log grid injection performance ratio sign-off', 'done' => false],
                ];
            case 'pest_control':
                return [
                    ['id' => 1, 'text' => 'Verify chemical MSDS dosage and applicator respirator', 'done' => true],
                    ['id' => 2, 'text' => 'Inspect and scan barcode on tamper-resistant bait stations', 'done' => false],
                    ['id' => 3, 'text' => 'Conduct barrier drilling or thermal cold fogging beat', 'done' => false],
                    ['id' => 4, 'text' => 'Issue FSSAI compliant zero-infestation clearance voucher', 'done' => false],
                ];
            case 'logistics':
                return [
                    ['id' => 1, 'text' => 'Complete pre-trip OBD-II vehicle diagnostic and tire scan', 'done' => true],
                    ['id' => 2, 'text' => 'Verify cold-chain cargo compartment temperature (+2 to +8°C)', 'done' => false],
                    ['id' => 3, 'text' => 'Navigate optimized delivery waypoint route to drop gate', 'done' => false],
                    ['id' => 4, 'text' => 'Obtain electronic proof of delivery (ePOD) OTP confirmation', 'done' => false],
                ];
            case 'real_estate':
            default:
                return [
                    ['id' => 1, 'text' => 'Verify GPS check-in inside project site geofence', 'done' => true],
                    ['id' => 2, 'text' => 'Conduct buyer walkthrough of plot / model villa', 'done' => false],
                    ['id' => 3, 'text' => 'Upload geo-tagged plot boundary & site progress photos', 'done' => false],
                    ['id' => 4, 'text' => 'Verify buyer OTP confirmation on site (Code: 4821)', 'done' => false],
                ];
        }
    }

    public static function getDefaultSafety(string $industry): array
    {
        switch ($industry) {
            case 'cleaning':
                return ['Nitrile Gloves', 'Face Mask', 'Color-Coded Microfiber Cloths', 'Disinfectant MSDS Sheet'];
            case 'construction':
                return ['Hard Hat (IS 2925)', 'Reflective Hi-Vis Vest', 'Steel Toe Safety Boots', 'Safety Harness'];
            case 'security':
                return ['Security Officer Badge', 'Body-Cam HD', 'NFC Patrol Scanner', 'Duress SOS Beacon'];
            case 'facility_fmcg':
                return ['Hygiene Face Shield', 'Anti-Slip Footwear', 'ATP Luminometer Kit', 'Stock Replenish Cart'];
            case 'maintenance':
                return ['Insulated High Voltage Gloves (11kV)', 'Safety Goggles', 'Lockout/Tagout Kit', 'Thermal Camera'];
            case 'solar':
                return ['Arc Flash Suit', 'UV Protection Glasses', 'Solar Irradiance Meter', 'Insulated Tool Kit'];
            case 'pest_control':
                return ['Half-Face Respirator Cartridge', 'Chemical Resistant Gloves', 'Eye Protection Goggles', 'MSDS Booklet'];
            case 'logistics':
                return ['Vehicle Telematics OBD Device', 'Cold-Chain Data Logger', 'Handheld OTP Scanner', 'Reflective Jacket'];
            case 'real_estate':
            default:
                return ['RERA Project Brochure', 'Laser Distance Meter', 'Plot Layout Map', 'Advisor ID Badge'];
        }
    }
}
