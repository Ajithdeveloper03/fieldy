<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FarmerVisit;
use App\Models\MediaFile;
use App\Models\User;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use App\Services\ClientReportService;
use Carbon\Carbon;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VisitController extends Controller
{
    public function index(Request $request, ClientReportService $reports)
    {
        $filters = $request->validate([
            'search' => 'nullable|string|max:120',
            'days' => 'nullable|in:7,30,90,all',
            'date' => 'nullable|date_format:Y-m-d',
            'employee_id' => 'nullable|integer|min:1',
        ]);
        $search = $filters['search'] ?? '';
        $days = $filters['days'] ?? '30';
        $employeeId = isset($filters['employee_id']) ? (int) $filters['employee_id'] : null;
        $date = $filters['date'] ?? null;
        $admin = $request->user();
        $industryKey = IndustryContext::current();

        $with = ['employee:id,name', 'farmer:id,name'];
        if (MediaFile::tableReady()) {
            $with[] = 'mediaFiles.uploader:id,name';
        }

        $query = $reports->visits($admin, $industryKey);
        $today = CarbonImmutable::today(ClientReportService::TIMEZONE);
        if ($date) {
            $reports->visitDate($query, CarbonImmutable::parse($date, ClientReportService::TIMEZONE));
        } elseif ($days !== 'all') {
            $query->whereRaw(ClientReportService::VISIT_TIME.' >= ?', [$today->subDays((int) $days - 1)->utc()->toDateTimeString()]);
        }

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        if ($search) {
            $likeSearch = \App\Support\SqlSafe::likeTerm($search);
            if ($likeSearch !== '') {
                $query->where(function ($q) use ($likeSearch) {
                    $q->whereHas('farmer', fn ($sub) => $sub->where('name', 'like', $likeSearch))
                      ->orWhereHas('employee', fn ($sub) => $sub->where('name', 'like', $likeSearch))
                      ->orWhere('farm_condition_notes', 'like', $likeSearch);
                });
            }
        }

        $visits = fn () => (clone $query)->with($with)->orderByRaw(ClientReportService::VISIT_TIME.' DESC')
            ->orderByDesc('id')->paginate(20)->withQueryString()->through(fn ($v) => [
            'id' => $v->id,
            'farmer' => ['user' => ['name' => $v->farmer?->name ?? 'Unknown Site']],
            'employee' => ['name' => $v->employee?->name ?? 'Unknown Staff'],
            'distance_from_previous_farmer_km' => $v->distance_from_previous_farmer_km ?? 0,
            'check_in_time' => $reports->formatTime($v->check_in_time),
            'check_out_time' => $reports->formatTime($v->check_out_time),
            'date' => $reports->formatTime($v->check_in_time ?? $v->created_at),
            'farm_condition_notes' => $v->farm_condition_notes,
            'recommendations' => $v->recommendations,
            'media' => MediaFile::tableReady()
                ? $v->mediaFiles->map(fn (MediaFile $m) => $m->toPayload(false))->values()->all()
                : [],
            'dossier_url' => url("/admin/visits/{$v->id}/dossier"),
        ]);

        $employees = IndustryContext::scope($reports->users($admin)->withTrashed()->where('role', 'employee'), $industryKey)
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Visits', [
            'currentIndustry' => $industryKey,
            'visits' => $visits,
            'employees' => $employees,
            'filters' => ['search' => $search, 'days' => $days, 'employee_id' => $employeeId, 'date' => $date],
            'analytics' => fn () => $this->analytics($query, $reports, $today, $date),
            'reportTabs' => fn () => $reports->tabs($admin, $industryKey, $query, $date, $employeeId),
        ]);
    }

    private function analytics($query, ClientReportService $reports, CarbonImmutable $today, ?string $date): array
    {
        $totals = (clone $query)->selectRaw(
            'COUNT(*) AS total, COUNT(check_out_time) AS completed, AVG(distance_from_previous_farmer_km) AS avg_distance'
        )->first();
        $officers = (clone $query)->selectRaw('employee_id, COUNT(*) AS total')
            ->with('employee:id,name')->groupBy('employee_id')->orderByDesc('total')->limit(5)->get()
            ->map(fn ($row) => ['id' => $row->employee_id, 'name' => $row->employee?->name, 'count' => (int) $row->total]);
        $dates = $date ? [CarbonImmutable::parse($date, ClientReportService::TIMEZONE)]
            : array_map(fn ($offset) => $today->subDays($offset), range(6, 0));

        return [
            'total' => (int) $totals->total,
            'completed' => (int) $totals->completed,
            'avgDistance' => round((float) $totals->avg_distance, 1),
            'officers' => $officers,
            'days' => array_map(fn ($day) => [
                'date' => $day->toDateString(),
                'label' => $day->format('d M'),
                'count' => $reports->visitDate(clone $query, $day)->count(),
            ], $dates),
        ];
    }

    public function show(Request $request, $id)
    {
        $industryKey = IndustryContext::current();
        $companyId = auth()->user()?->company_id;

        $catalogVisit = ! $companyId ? IndustryCatalog::visit($industryKey, $id) : null;
        if ($catalogVisit) {
            return Inertia::render('Admin/VisitDetail', [
                'currentIndustry' => $industryKey,
                'visit' => [
                    'id' => $catalogVisit['id'],
                    'farmer' => [
                        'user' => ['name' => $catalogVisit['entity_name']],
                        'farmer_code' => $catalogVisit['entity_code'] ?? null,
                        'village' => $catalogVisit['address'] ?? null,
                    ],
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

        $with = ['employee:id,name', 'farmer:id,name'];
        if (MediaFile::tableReady()) {
            $with[] = 'mediaFiles.uploader:id,name';
        }

        $visit = FarmerVisit::with($with)
            ->when($companyId, fn ($q, $cid) => $q->whereHas('employee', fn ($e) => $e->where('company_id', $cid)))
            ->findOrFail($id);

        return Inertia::render('Admin/VisitDetail', [
            'currentIndustry' => $industryKey,
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
                'media' => MediaFile::tableReady()
                    ? $visit->mediaFiles->map(fn (MediaFile $m) => $m->toPayload(false))->values()->all()
                    : [],
                'dossier_url' => url("/admin/visits/{$visit->id}/dossier"),
            ],
        ]);
    }
}
