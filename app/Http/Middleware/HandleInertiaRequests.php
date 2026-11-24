<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $company = $user?->company;

        $companyPayload = null;
        if ($company) {
            $settings = is_array($company->settings) ? $company->settings : [];
            $hasExplicitTourFlag = array_key_exists('onboarding_tour_completed', $settings);
            if ($hasExplicitTourFlag) {
                $tourCompleted = (bool) $settings['onboarding_tour_completed'];
            } else {
                // Legacy companies that already have employees/sites won't be interrupted;
                // brand-new or empty companies trigger the guided tour on first launch.
                $hasExistingRecords = $company->employees()->exists() || $company->farmers()->exists();
                $tourCompleted = $hasExistingRecords;
            }

            $companyPayload = [
                'id' => $company->id,
                'name' => $company->name,
                'slug' => $company->slug,
                'plan' => $company->plan,
                'industry' => \App\Services\IndustryService::normalize($company->industry),
                'tour_completed' => $tourCompleted,
            ];
        }

        $hasSession = $request->hasSession();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'company_id' => $user->company_id,
                    'company' => $companyPayload,
                ] : null,
            ],
            'flash' => [
                'success' => fn () => $hasSession ? $request->session()->get('success') : null,
                'error' => fn () => $hasSession ? $request->session()->get('error') : null,
                'session_notice' => fn () => $hasSession ? $request->session()->get('session_notice') : null,
                'generated_password' => fn () => $hasSession ? $request->session()->get('generated_password') : null,
                'generated_login_id' => fn () => $hasSession ? $request->session()->get('generated_login_id') : null,
                'generated_name' => fn () => $hasSession ? $request->session()->get('generated_name') : null,
                'launched_company_id' => fn () => $hasSession ? $request->session()->get('launched_company_id') : null,
            ],
            'sessionSecurity' => $user ? [
                'loginAt' => $hasSession ? $request->session()->get('security.login_at', now()->toIso8601String()) : now()->toIso8601String(),
                'lastActivityAt' => $hasSession ? (int) $request->session()->get('security.last_activity_at', time()) : time(),
                'timeoutSeconds' => (int) config('session.inactivity_timeout', \App\Http\Middleware\TrackSessionActivity::DEFAULT_IDLE_TIMEOUT),
                'warningSeconds' => 120,
                'ipAddress' => $request->ip(),
                'actionsCount' => $hasSession ? (int) $request->session()->get('security.actions_count', 1) : 1,
                'sqlGuardActive' => true,
            ] : null,
            // Active service vertical — persisted in session so every admin page stays on the selected service.
            'currentIndustry' => $user ? \App\Services\Industry\IndustryContext::current() : null,
        ];
    }
}
