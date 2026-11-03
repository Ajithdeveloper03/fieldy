<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmerVisit;
use App\Models\User;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $days = $request->query('days', '30');
        $employeeId = $request->query('employee_id', '');
        $companyId = auth()->user()?->company_id;
        $industryKey = IndustryContext::current();

        $query = FarmerVisit::with(['employee:id,name', 'farmer:id,name'])
            ->when($companyId, fn ($q, $cid) => $q->whereHas('employee', fn ($e) => $e->where('company_id', $cid)))
            ->orderBy('created_at', 'desc');

        $query = IndustryContext::scope($query, $industryKey);

        if ($days !== 'all') {
            $query->whereDate('created_at', '>=', Carbon::now()->subDays((int) $days));
        }

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('farmer', fn ($sub) => $sub->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('employee', fn ($sub) => $sub->where('name', 'like', "%{$search}%"));
            });
        }

        $visits = $query->paginate(20)->through(fn ($v) => [
            'id' => $v->id,
            'farmer' => ['user' => ['name' => $v->farmer?->name ?? 'Unknown Site']],
            'employee' => ['name' => $v->employee?->name ?? 'Unknown Staff'],
            'distance_from_previous_farmer_km' => $v->distance_from_previous_farmer_km ?? 0,
            'check_in_time' => $v->check_in_time ? Carbon::parse($v->check_in_time)->format('h:i A') : 'N/A',
            'check_out_time' => $v->check_out_time ? Carbon::parse($v->check_out_time)->format('h:i A') : 'N/A',
            'date' => $v->created_at?->format('M d, Y') ?? 'N/A',
            'farm_condition_notes' => $v->farm_condition_notes ?? 'Service completed.',
            'recommendations' => $v->recommendations ?? 'No recommendations.',
            'media' => [],
        ]);

        // If no visits recorded in DB for this service vertical, supply curated catalog visits
        if ($visits->isEmpty()) {
            $catalogVisits = collect(IndustryCatalog::visits($industryKey));
            if ($employeeId) {
                $catalogVisits = $catalogVisits->filter(fn ($v) => (string) $v['staff_id'] === (string) $employeeId)->values();
            }
            if ($search) {
                $catalogVisits = $catalogVisits->filter(fn ($v) => stripos($v['entity_name'], $search) !== false || stripos($v['staff_name'], $search) !== false)->values();
            }

            $items = $catalogVisits->map(fn ($v) => [
                'id' => $v['id'],
                'farmer' => ['user' => ['name' => $v['entity_name']]],
                'employee' => ['name' => $v['staff_name']],
                'distance_from_previous_farmer_km' => $v['distance_km'],
                'check_in_time' => $v['check_in'],
                'check_out_time' => $v['check_out'],
                'date' => $v['date'],
                'farm_condition_notes' => $v['notes'],
                'recommendations' => $v['recommendations'],
                'media' => [],
                'is_sample' => true,
            ]);

            // Construct paginated array shape
            $visits = [
                'data' => $items->values()->all(),
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 20,
                'total' => $items->count(),
                'links' => [],
            ];

            $employees = collect(IndustryCatalog::staff($industryKey))->map(fn ($s) => [
                'id' => $s['id'],
                'name' => $s['name'],
            ]);
        } else {
            $employees = User::where('role', 'employee')->select('id', 'name')->orderBy('name')->get();
        }

        return Inertia::render('Admin/Visits', [
            'visits' => $visits,
            'employees' => $employees,
            'filters' => ['search' => $search, 'days' => $days, 'employee_id' => $employeeId],
        ]);
    }

    public function show($id)
    {
        $industryKey = IndustryContext::current();

        $catalogVisit = IndustryCatalog::visit($industryKey, $id);
        if ($catalogVisit) {
            return Inertia::render('Admin/VisitDetail', [
                'visit' => [
                    'id' => $catalogVisit['id'],
                    'farmer' => ['user' => ['name' => $catalogVisit['entity_name']]],
                    'employee' => ['name' => $catalogVisit['staff_name']],
                    'distance_from_previous_farmer_km' => $catalogVisit['distance_km'],
                    'check_in_time' => $catalogVisit['check_in'],
                    'check_out_time' => $catalogVisit['check_out'],
                    'date' => $catalogVisit['date'],
                    'farm_condition_notes' => $catalogVisit['notes'],
                    'recommendations' => $catalogVisit['recommendations'],
                    'media' => [],
                    'is_sample' => true,
                ],
            ]);
        }

        $visit = FarmerVisit::with(['employee:id,name', 'farmer:id,name'])->findOrFail($id);

        return Inertia::render('Admin/VisitDetail', [
            'visit' => [
                'id' => $visit->id,
                'farmer' => ['user' => ['name' => $visit->farmer?->name ?? 'Unknown Site']],
                'employee' => ['name' => $visit->employee?->name ?? 'Unknown Staff'],
                'distance_from_previous_farmer_km' => $visit->distance_from_previous_farmer_km ?? 0,
                'check_in_time' => $visit->check_in_time ? Carbon::parse($visit->check_in_time)->format('h:i A') : 'N/A',
                'check_out_time' => $visit->check_out_time ? Carbon::parse($visit->check_out_time)->format('h:i A') : 'N/A',
                'date' => $visit->created_at?->format('M d, Y') ?? 'N/A',
                'farm_condition_notes' => $visit->farm_condition_notes ?? 'No notes provided.',
                'recommendations' => $visit->recommendations ?? 'No recommendations.',
                'media' => [],
            ],
        ]);
    }
}
