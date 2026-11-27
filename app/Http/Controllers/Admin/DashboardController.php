<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\IndustryService;
use App\Services\ClientReportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(ClientReportService $reports)
    {
        $user = auth()->user();
        $companyId = $user?->company_id;

        // Active service vertical (query param → session → company default)
        $industryKey = \App\Services\Industry\IndustryContext::current();

        // Fetch industry-specific backend data
        $payload = IndustryService::getDashboardData($industryKey, $companyId);

        return Inertia::render('Admin/Dashboard', [
            ...$payload,
            'reportTabs' => fn () => $reports->tabs($user, $industryKey, $reports->visits($user, $industryKey)),
        ]);
    }

    public function companyLogo(Request $request)
    {
        $company = $request->user()->company;
        $disk = Storage::disk('local');
        abort_unless($company?->hasUploadedLogo() && $disk->exists($company->logo), 404);

        return $disk->response($company->logo, headers: [
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function completeOnboardingTour(Request $request)
    {
        $user = $request->user();
        $company = $user?->company;

        if ($company) {
            $settings = is_array($company->settings) ? $company->settings : [];
            $settings['onboarding_tour_completed'] = true;
            $company->settings = $settings;
            $company->save();
        }

        return response()->json(['ok' => true]);
    }
}
