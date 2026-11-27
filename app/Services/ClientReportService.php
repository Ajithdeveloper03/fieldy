<?php

namespace App\Services;

use App\Models\FarmerVisit;
use App\Models\Payment;
use App\Models\Task;
use App\Models\User;
use App\Services\Industry\IndustryContext;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;

class ClientReportService
{
    public const TIMEZONE = 'Asia/Kolkata';
    public const VISIT_TIME = 'COALESCE(check_in_time, created_at)';

    public function users(User $admin): Builder
    {
        return User::query()->when(! $admin->isSuperAdmin() || $admin->company_id,
            fn ($query) => $query->where('company_id', $admin->company_id));
    }

    public function visits(User $admin, string $industry): Builder
    {
        $employees = $this->users($admin)->withTrashed()->where('role', 'employee')->select('id');

        return IndustryContext::scope(FarmerVisit::whereIn('employee_id', $employees), $industry);
    }

    public function visitDate(Builder $query, CarbonImmutable $day): Builder
    {
        return $query->whereRaw(self::VISIT_TIME.' >= ?', [$day->startOfDay()->utc()->toDateTimeString()])
            ->whereRaw(self::VISIT_TIME.' < ?', [$day->startOfDay()->addDay()->utc()->toDateTimeString()]);
    }

    public function tabs(User $admin, string $industry, Builder $visits, ?string $date = null, ?int $employeeId = null): array
    {
        $day = $date ? CarbonImmutable::parse($date, self::TIMEZONE) : CarbonImmutable::today(self::TIMEZONE);
        $workers = IndustryContext::scope($this->users($admin)->where('role', 'employee'), $industry)
            ->when($employeeId, fn ($query) => $query->whereKey($employeeId));
        $workerIds = (clone $workers)->select('id');
        $sites = IndustryContext::scope($this->users($admin)->where('role', 'farmer'), $industry);
        $companyUserIds = $this->users($admin)->withTrashed()->select('id');
        $tasks = IndustryContext::scope(Task::where(function ($query) use ($companyUserIds) {
            $query->whereIn('created_by', $companyUserIds)->orWhereIn('assigned_to', $companyUserIds);
        }), $industry)->when($employeeId, fn ($query) => $query->where('assigned_to', $employeeId));
        $payments = Payment::whereIn('employee_id', $workerIds);

        return [
            'date' => $day->toDateString(),
            'counts' => [
                'employees' => (clone $workers)->count(),
                'visits' => (clone $visits)->reorder()->count(),
                'sites' => (clone $sites)->count(),
                'tasks' => (clone $tasks)->count(),
                'payments' => (clone $payments)->count(),
            ],
            'employees' => $workers->with([
                'employeeDetail',
                'attendanceLogs' => fn ($query) => $query->whereDate('date', $day->toDateString())->latest('check_in_timestamp')->limit(1),
                'locationPoints' => fn ($query) => $query
                    ->where('timestamp', '>=', $day->startOfDay()->getTimestampMs())
                    ->where('timestamp', '<', $day->startOfDay()->addDay()->getTimestampMs())
                    ->latest('timestamp')->limit(1),
            ])->withExists(['trackingSessions as tracking_active' => fn ($query) => $query->where('status', 'active')])
                ->withCount([
                    'farmerVisits as lifetime_visits' => fn ($query) => IndustryContext::scope($query, $industry),
                    'farmerVisits as day_visits' => fn ($query) => $this->visitDate(IndustryContext::scope($query, $industry), $day),
                ])->orderBy('name')->limit(20)->get()
                ->map(function (User $worker) use ($day) {
                    $attendance = $worker->attendanceLogs->first();
                    $ping = $worker->locationPoints->first();

                    return [
                        'id' => $worker->id, 'name' => $worker->name, 'phone' => $worker->phone,
                        'code' => $worker->employeeDetail?->employee_code,
                        'designation' => $worker->employeeDetail?->designation,
                        'region' => $worker->employeeDetail?->assigned_region,
                        'check_in' => $attendance?->check_in_timestamp?->copy()->timezone(self::TIMEZONE)->format('h:i A'),
                        'check_out' => $attendance?->check_out_timestamp?->copy()->timezone(self::TIMEZONE)->format('h:i A'),
                        'tracking' => $day->isToday() && $worker->tracking_active,
                        'latitude' => $ping?->latitude, 'longitude' => $ping?->longitude,
                        'ping_time' => $ping ? CarbonImmutable::createFromTimestampMs($ping->timestamp, self::TIMEZONE)->format('h:i A') : null,
                        'day_visits' => $worker->day_visits,
                        'lifetime_visits' => $worker->lifetime_visits,
                    ];
                }),
            'visits' => (clone $visits)->reorder()->with(['employee:id,name', 'farmer:id,name'])
                ->orderByRaw(self::VISIT_TIME.' DESC')->limit(20)->get()->map(fn ($visit) => [
                    'id' => $visit->id, 'site' => $visit->farmer?->name, 'employee' => $visit->employee?->name,
                    'check_in' => $this->formatTime($visit->check_in_time),
                    'check_out' => $this->formatTime($visit->check_out_time),
                ]),
            'sites' => $sites->with('farmerProfile')->latest('id')->limit(20)->get()->map(fn ($site) => [
                'id' => $site->id, 'name' => $site->name, 'code' => $site->farmerProfile?->farmer_code,
                'region' => $site->farmerProfile?->district, 'status' => $site->status,
            ]),
            'tasks' => $tasks->with('assignedTo:id,name')->latest('id')->limit(20)->get()->map(fn ($task) => [
                'id' => $task->id, 'title' => $task->title, 'employee' => $task->assignedTo?->name,
                'status' => $task->status, 'due' => $task->due_date?->toDateString(),
            ]),
            'payments' => $payments->with('employee:id,name')->latest('id')->limit(20)->get()->map(fn ($payment) => [
                'id' => $payment->id, 'employee' => $payment->employee?->name, 'amount' => $payment->amount,
                'status' => $payment->status, 'date' => $payment->payment_date?->toDateString(),
            ]),
        ];
    }

    public function formatTime($value): ?string
    {
        return $value ? CarbonImmutable::parse($value)->timezone(self::TIMEZONE)->format('d M Y, h:i A') : null;
    }
}
