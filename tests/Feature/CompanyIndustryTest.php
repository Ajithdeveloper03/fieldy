<?php

namespace Tests\Feature;

use App\Models\Company;
use App\Models\User;
use App\Services\Industry\IndustryContext;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CompanyIndustryTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_create_a_company_with_a_reference_industry(): void
    {
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
                'name' => 'Sunrise Solar',
                'code' => 'SUNSOL',
                'industry' => 'solar',
                'email' => 'contact@sunrise.test',
                'phone' => '9000000002',
                'plan' => 'professional',
                'max_employees' => 50,
                'admin_name' => 'Solar Admin',
                'admin_email' => 'admin@sunrise.test',
                'admin_phone' => '9000000003',
                'admin_password' => 'secret123',
            ])
            ->assertSessionHasNoErrors();

        $company = Company::where('code', 'SUNSOL')->firstOrFail();

        $this->assertSame('solar', $company->industry);
        $this->assertDatabaseHas('users', [
            'email' => 'admin@sunrise.test',
            'company_id' => $company->id,
            'role' => 'admin',
        ]);
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
