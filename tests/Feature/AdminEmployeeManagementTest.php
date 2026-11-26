<?php

namespace Tests\Feature;

use App\Models\AttendanceLog;
use App\Models\Company;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AdminEmployeeManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_registration_saves_a_photo_that_only_the_tenant_can_access(): void
    {
        Storage::fake('local');
        $company = Company::create(['name' => 'Photo Team', 'slug' => 'photo-team', 'code' => 'PHOTO']);
        $otherCompany = Company::create(['name' => 'Other Team', 'slug' => 'other-team', 'code' => 'OTHER']);
        $admin = User::factory()->create(['role' => 'admin', 'company_id' => $company->id, 'phone' => '9000000041']);
        $otherAdmin = User::factory()->create(['role' => 'admin', 'company_id' => $otherCompany->id, 'phone' => '9000000042']);

        $this->actingAs($admin)->post('/admin/employees', [
            'name' => 'Photo Employee',
            'phone' => '9000000043',
            'photo' => UploadedFile::fake()->image('profile.png'),
        ])->assertSessionHasNoErrors()->assertRedirect('/admin/employees');

        $employee = User::where('phone', '9000000043')->firstOrFail();
        Storage::disk('local')->assertExists($employee->employeeDetail->photo_path);
        $this->get("/admin/employees/{$employee->id}/photo")->assertOk()->assertHeader('content-type', 'image/png');
        $this->actingAs($otherAdmin)->get("/admin/employees/{$employee->id}/photo")->assertNotFound();
    }

    public function test_employee_removal_preserves_attendance_and_limits_history_to_the_tenant(): void
    {
        $company = Company::create(['name' => 'Team A', 'slug' => 'team-a', 'code' => 'TEAM-A']);
        $otherCompany = Company::create(['name' => 'Team B', 'slug' => 'team-b', 'code' => 'TEAM-B']);
        $admin = User::factory()->create(['role' => 'admin', 'company_id' => $company->id, 'phone' => '9000000021']);
        $employee = User::factory()->create(['role' => 'employee', 'company_id' => $company->id, 'phone' => '9000000022']);
        $otherEmployee = User::factory()->create(['role' => 'employee', 'company_id' => $otherCompany->id, 'phone' => '9000000023']);

        foreach ([$employee, $otherEmployee] as $worker) {
            AttendanceLog::create([
                'employee_id' => $worker->id,
                'date' => '2026-11-26',
                'check_in_timestamp' => '2026-11-26 04:00:00',
                'check_out_timestamp' => '2026-11-26 12:00:00',
            ]);
        }

        $this->actingAs($admin)->delete("/admin/employees/{$otherEmployee->id}")->assertNotFound();
        $this->delete("/admin/employees/{$employee->id}")->assertRedirect('/admin/employees');
        $this->assertSoftDeleted($employee);

        $this->get('/admin/attendance?from=2026-11-26&to=2026-11-26')->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Attendance')
                ->has('logs.data', 1)
                ->where('logs.data.0.name', $employee->name)
                ->where('logs.data.0.archived', true)
                ->where('logs.data.0.check_out', '2026-11-26T12:00:00+00:00'));
    }

    public function test_admin_can_open_employee_edit_and_set_a_new_password(): void
    {
        $company = Company::create(['name' => 'Team C', 'slug' => 'team-c', 'code' => 'TEAM-C']);
        $admin = User::factory()->create(['role' => 'admin', 'company_id' => $company->id, 'phone' => '9000000025']);
        $employee = User::factory()->create([
            'role' => 'employee', 'company_id' => $company->id,
            'phone' => '9000000026', 'status' => 'active',
        ]);
        $employee->createToken('previous-session');

        $this->actingAs($admin)->get("/admin/employees/{$employee->id}/edit")->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Profiles/EmployeeDetail')
                ->where('editing', true)->missing('employee.password'));
        $this->put("/admin/employees/{$employee->id}", [
            'name' => $employee->name, 'email' => $employee->email, 'phone' => $employee->phone,
            'status' => 'active', 'password' => 'new-test-password',
        ])->assertSessionHasNoErrors()->assertRedirect("/admin/employees/{$employee->id}");

        $this->assertTrue(Hash::check('new-test-password', $employee->fresh()->password));
        $this->assertSame(0, $employee->tokens()->count());
    }
}
