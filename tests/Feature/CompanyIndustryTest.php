<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Services\Industry\IndustryContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class CompanyIndustryTest extends TestCase
{
    use RefreshDatabase;

    public function test_construction_platform_dashboard_starts_empty_and_counts_new_work_orders(): void
    {
        $owner = User::factory()->create([
            'phone' => '9000000028', 'role' => 'superadmin', 'status' => 'active',
        ]);
        $this->actingAs($owner)
            ->get('/admin/dashboard?industry=construction')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Admin/Dashboard')
                ->where('currentIndustry', 'construction')
                ->where('stats.activeWorkOrders', 0)
                ->where('stats.totalEmployees', 0)
                ->where('stats.totalFarmers', 0)
                ->where('stats.totalVisits', 0)
                ->has('recentVisits', 0)
                ->has('recentFarmers', 0)
                ->has('locationLogs', 0)
                ->has('telemetry', 0));

        $this->post('/admin/tasks', [
            'title' => 'New concrete inspection',
            'industry' => 'construction',
            'priority' => 'medium',
        ])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('tasks', ['title' => 'New concrete inspection', 'industry' => 'construction']);

        $this->get('/admin/dashboard?industry=construction')->assertOk()
            ->assertInertia(fn ($page) => $page->where('stats.activeWorkOrders', 1));
    }

    public function test_superadmin_dashboard_renders_with_application_assets(): void
    {
        $superadmin = User::create([
            'name' => 'Platform Owner',
            'phone' => '9000000007',
            'email' => 'dashboard-owner@test.fieldy',
            'password' => Hash::make('password'),
            'role' => 'superadmin',
            'status' => 'active',
        ]);

        $this->actingAs($superadmin)
            ->get('/superadmin/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Superadmin/Dashboard')
                ->has('stats.totalCompanies'));
    }

    public function test_superadmin_can_create_a_company_with_a_reference_industry(): void
    {
        Storage::fake('local');
        $superadmin = User::create([
            'name' => 'Platform Owner',
            'phone' => '9000000001',
            'email' => 'owner@test.fieldy',
            'password' => Hash::make('password'),
            'role' => 'superadmin',
            'status' => 'active',
        ]);

        $this->actingAs($superadmin)
            ->post('/superadmin/companies', [
                'name' => 'Sunrise Infra',
                'logo' => UploadedFile::fake()->image('logo.png'),
                'code' => 'SUNINF',
                'industry' => 'construction',
                'email' => 'contact@sunrise.test',
                'phone' => '9000000002',
                'city' => 'Coimbatore',
                'gst_number' => '33ABCDE1234F1Z9',
                'website' => 'https://sunrise.test',
                'estimated_sites' => 12,
                'plan' => 'professional',
                'billing_cycle' => 'monthly',
                'max_employees' => 50,
                'admin_name' => 'Construction Admin',
                'admin_email' => 'Admin@Sunrise.test',
                'admin_phone' => '9000000003',
                'admin_password' => 'secret123',
            ])
            ->assertSessionHasNoErrors();

        $company = Company::where('code', 'SUNINF')->firstOrFail();

        $this->assertSame('construction', $company->industry);
        Storage::disk('local')->assertExists($company->logo);
        $this->assertDatabaseHas('users', [
            'email' => 'admin@sunrise.test',
            'company_id' => $company->id,
            'role' => 'admin',
        ]);

        $this->get('/admin/company-logo')->assertNotFound();
        $admin = User::where('email', 'admin@sunrise.test')->firstOrFail();
        $this->post('/admin/logout')->assertRedirect('/admin/login');
        $this->post('/admin/login', ['email' => 'Admin@Sunrise.test', 'password' => 'wrong-password'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
        $this->post('/admin/login', ['email' => 'Admin@Sunrise.test', 'password' => 'secret123'])
            ->assertSessionHasNoErrors()->assertRedirect('/admin/dashboard');
        $this->assertAuthenticatedAs($admin);
        $this->get('/admin/company-logo')->assertOk()->assertHeader('content-type', 'image/png');
        $this->get('/admin/dashboard')->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('auth.user.company.has_logo', true)
                ->where('auth.user.role', 'admin')
                ->where('auth.user.company.name', 'Sunrise Infra')
                ->where('auth.user.company.code', 'SUNINF')
                ->where('currentIndustry', 'construction')
                ->where('auth.user.company.email', 'contact@sunrise.test')
                ->where('auth.user.company.billing_cycle', 'monthly')
                ->where('auth.user.company.estimated_sites', 12)
                ->where('auth.user.company.gst_number', '33ABCDE1234F1Z9')
                ->missing('auth.user.password'));
    }

    public function test_client_dashboard_uses_company_type_even_with_a_stale_or_requested_industry(): void
    {
        $company = Company::create([
            'name' => 'Sunrise Solar',
            'slug' => 'sunrise-solar-test',
            'code' => 'SUNSOLTEST',
            'industry' => 'solar',
            'email' => 'contact@sunrise.test',
            'plan' => 'professional',
            'status' => 'active',
        ]);

        $admin = User::create([
            'company_id' => $company->id,
            'name' => 'Solar Admin',
            'phone' => '9000000004',
            'email' => 'admin@sunrise-dashboard.test',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->withSession([IndustryContext::SESSION_KEY => 'construction']);

        $this->post('/admin/login', [
            'email' => $admin->email,
            'password' => 'password',
        ])->assertRedirect('/admin/dashboard');

        $this->get('/admin/dashboard?industry=construction')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Dashboard')
                ->where('currentIndustry', 'solar'));
    }

    public function test_company_onboarding_rejects_industries_not_shown_in_the_reference(): void
    {
        $superadmin = User::create([
            'name' => 'Platform Owner',
            'phone' => '9000000005',
            'email' => 'owner-logistics@test.fieldy',
            'password' => Hash::make('password'),
            'role' => 'superadmin',
            'status' => 'active',
        ]);

        $this->actingAs($superadmin)
            ->from('/superadmin/companies')
            ->post('/superadmin/companies', [
                'name' => 'Dispatch Client',
                'industry' => 'logistics',
                'email' => 'contact@dispatch.test',
                'plan' => 'professional',
                'max_employees' => 50,
                'admin_name' => 'Dispatch Admin',
                'admin_email' => 'admin@dispatch.test',
                'admin_phone' => '9000000006',
                'admin_password' => 'secret123',
            ])
            ->assertSessionHasErrors('industry');

        $this->assertDatabaseMissing('companies', ['slug' => 'dispatch-client']);
    }
}
