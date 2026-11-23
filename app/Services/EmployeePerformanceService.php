<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\FarmerVisit;
use App\Models\Task;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class EmployeePerformanceService
{
    public function summarize(User $employee, CarbonImmutable $start, CarbonImmutable $end): array
    {
        $startDate = $start->toDateString();
        $endDate = $end->toDateString();

        $tasks = Task::where('assigned_to', $employee->id)->where('status', '<>', 'cancelled')
            ->where(function ($query) use ($start, $end, $startDate, $endDate) {
                $query->whereBetween('due_date', [$startDate, $endDate])
                    ->orWhereBetween('completed_at', [$start, $end])
                    ->orWhere(fn ($undated) => $undated->whereNull('due_date')
                        ->whereBetween('created_at', [$start, $end]));
            })->get();
        $done = $tasks->filter(fn ($task) => $task->status === 'done'
            && (! $task->completed_at || $task->completed_at->lte($end)));
        $deadlines = $tasks->filter(fn ($task) => $task->due_date
            && ($task->due_date->toDateString() < $endDate || ! $end->isToday())
            && ($task->status !== 'done' || $task->completed_at));
        $onTimeTasks = $deadlines->filter(fn ($task) => $task->completed_at
            && $task->completed_at->lte($end)
            && $task->completed_at->toDateString() <= $task->due_date->toDateString())->count();

        $visits = FarmerVisit::where('employee_id', $employee->id)
            ->whereBetween('check_in_time', [$start, $end])->get();
        $completedVisits = $visits->filter(fn ($visit) => $visit->check_out_time
            && $visit->check_out_time <= $end->toDateTimeString());
        $visitDays = $visits->groupBy(fn ($visit) => $visit->farmer_id.'|'.substr($visit->check_in_time, 0, 10));
        $schedules = DB::table('visit_schedules')->where('employee_id', $employee->id)
            ->whereBetween('scheduled_date', [$startDate, $endDate])
            ->where(fn ($query) => $query->where('scheduled_date', '<', $endDate)
                ->orWhere('status', 'completed')->orWhere('status', 'missed')
                ->orWhereIn('farmer_id', $visits->filter(fn ($visit) => str_starts_with($visit->check_in_time, $endDate))->pluck('farmer_id')))
            ->get()->unique(fn ($schedule) => $schedule->farmer_id.'|'.$schedule->scheduled_date);
        $onTimeVisits = $schedules->filter(fn ($schedule) => $visitDays
            ->has($schedule->farmer_id.'|'.$schedule->scheduled_date))->count();

        $attendance = AttendanceLog::where('employee_id', $employee->id)
            ->whereBetween('date', [$startDate, $endDate])->whereNotNull('check_in_timestamp')->get();
        $closedShifts = $attendance->filter(fn ($log) => $log->check_out_timestamp
            && $log->check_out_timestamp->gte($log->check_in_timestamp)
            && $log->check_out_timestamp->lte($end));
        $finishedShifts = $attendance->filter(fn ($log) => $log->date->toDateString() < $endDate
            || ! $end->isToday() || $closedShifts->contains($log));
        $late = $attendance->where('is_late', true)->count();
        $early = $closedShifts->where('is_early_checkout', true)->count();
        $missing = $finishedShifts->count() - $closedShifts->count();
        $hours = $closedShifts->sum(fn ($log) => (float) $log->total_hours > 0
            ? (float) $log->total_hours
            : $log->check_in_timestamp->diffInMinutes($log->check_out_timestamp) / 60);

        $rating = DB::table('farmer_reviews')->whereIn('visit_id', $completedVisits->modelKeys())->avg('rating');
        // Each available rate contributes equally. Missing schedules or shifts contribute no rate.
        $rates = array_filter([
            $this->rate($done->count(), $tasks->count()),
            $this->rate($onTimeTasks, $deadlines->count()),
            $this->rate($onTimeVisits, $schedules->count()),
            $this->rate($completedVisits->count(), $visits->count()),
            $this->rate($attendance->count() - $late, $attendance->count()),
            $this->rate($closedShifts->count() - $early, $finishedShifts->count()),
        ], fn ($value) => $value !== null);

        return [
            'tasks_total' => $tasks->count(),
            'tasks_done' => $done->count(),
            'tasks_due' => $deadlines->count(),
            'tasks_on_time' => $onTimeTasks,
            'visits_total' => $visits->count(),
            'visits_done' => $completedVisits->count(),
            'visits_scheduled' => $schedules->count(),
            'visits_on_time' => $onTimeVisits,
            'check_ins' => $attendance->count(),
            'check_outs' => $closedShifts->count(),
            'late_check_ins' => $late,
            'early_check_outs' => $early,
            'missing_check_outs' => $missing,
            'hours_worked' => round($hours, 1),
            'rating' => $rating !== null ? round($rating, 1) : null,
            'score' => $rates ? (int) round(array_sum($rates) / count($rates)) : null,
        ];
    }

    private function rate(int $count, int $total): ?float
    {
        return $total > 0 ? $count * 100 / $total : null;
    }
}
