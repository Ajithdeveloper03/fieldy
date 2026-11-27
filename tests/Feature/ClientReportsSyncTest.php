<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\FarmerVisit;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ClientReportsSyncTest extends TestCase
{
    use RefreshDatabase;

    public function test_mobile_and_admin_replace_the_same_employee_photo(): void
    {
        Storage::fake('local');
        [$admin, $employee] = $this->team('Photo', 1);
        $headers = ['Authorization' => 'Bearer '.$employee->createToken('mobile')->plainTextToken, 'Accept' => 'application/json'];

        $this->post('/api/v1/employee/profile/photo', ['photo' => UploadedFile::fake()->image('mobile.png')], $headers)
            ->assertOk()->assertJsonStructure(['avatar_version']);
        $first = $employee->fresh()->employeeDetail->photo_path;
        Storage::disk('local')->assertExists($first);

        $this->actingAs($admin, 'web')->get("/admin/employees/{$employee->id}/photo")->assertOk()->assertHeader('content-type', 'image/png');
        $this->post("/admin/employees/{$employee->id}/photo", ['photo' => UploadedFile::fake()->image('web.jpg')])
            ->assertRedirect("/admin/employees/{$employee->id}");
        $replacement = $employee->fresh()->employeeDetail->photo_path;
        $this->assertNotSame($first, $replacement);
        Storage::disk('local')->assertMissing($first);
        Storage::disk('local')->assertExists($replacement);

        $this->post('/admin/logout')->assertRedirect('/admin/login');
        auth()->forgetGuards();
        $this->get('/api/v1/employee/profile/photo', $headers)->assertOk()->assertHeader('content-type', 'image/jpeg');
        auth()->shouldUse('web');
        $this->get('/api/v1/auth/me', $headers)->assertOk()->assertJsonPath('user.avatar_version', basename($replacement));
    }

    public function test_single_day_reports_and_dashboard_tabs_use_tenant_data(): void
    {
        [$admin, $employee, $site] = $this->team('Report', 2);
        [, $otherEmployee, $otherSite] = $this->team('Other', 3);
        foreach ([
            [$employee, $site, '2026-11-26 20:30:00'],
            [$employee, $site, '2026-11-27 20:30:00'],
            [$otherEmployee, $otherSite, '2026-11-27 06:00:00'],
        ] as [$worker, $project, $time]) {
            FarmerVisit::create([
                'employee_id' => $worker->id, 'farmer_id' => $project->id,
                'industry' => 'construction', 'check_in_time' => $time, 'check_out_time' => $time,
            ]);
        }

        $this->actingAs($admin)->get("/admin/visits?date=2026-11-27&employee_id={$employee->id}")->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Visits')
                ->has('visits.data', 1)->where('analytics.total', 1)->where('analytics.completed', 1)
                ->where('analytics.days.0.count', 1)->where('reportTabs.counts.employees', 1)
                ->where('reportTabs.employees.0.day_visits', 1));
        $this->get('/admin/dashboard')->assertOk()
            ->assertInertia(fn ($page) => $page->where('reportTabs.counts.visits', 2)
                ->where('reportTabs.counts.sites', 1));
    }

    public function test_task_cancellation_appears_as_cancelled_in_web_and_mobile(): void
    {
        [$admin, $employee] = $this->team('Tasks', 4);
        $task = Task::create([
            'title' => 'Concrete inspection', 'created_by' => $admin->id,
            'assigned_to' => $employee->id, 'industry' => 'construction', 'status' => 'pending',
        ]);
        $this->actingAs($admin)->put("/admin/tasks/{$task->id}", ['status' => 'cancelled'])->assertRedirect();
        $this->get('/admin/alerts')->assertOk()->assertInertia(fn ($page) => $page
            ->where('alerts.0.title', 'Work Order Cancelled by Admin: '.$admin->name)
            ->where('alerts.0.message', $admin->name.' cancelled work order "Concrete inspection".'));

        $this->actingAs($employee)->getJson('/api/v1/employee/notifications', ['X-User-Phone' => $employee->phone])
            ->assertOk()->assertJsonFragment(['title' => 'Work Order Cancelled', 'message' => 'Concrete inspection was cancelled.']);
    }

    private function team(string $name, int $number): array
    {
        $company = Company::create(['name' => $name, 'slug' => strtolower($name), 'code' => strtoupper($name), 'industry' => 'construction']);

        return collect(['admin', 'employee', 'farmer'])->map(fn ($role, $index) => User::factory()->create([
            'company_id' => $company->id, 'role' => $role, 'status' => 'active', 'industry' => 'construction',
            'phone' => "9000000{$number}0{$index}",
        ]))->all();
    }
}
