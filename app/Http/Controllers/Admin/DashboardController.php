<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Services\IndustryService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $companyId = $user?->company_id;

        // Active service vertical (query param → session → company default)
        $industryKey = \App\Services\Industry\IndustryContext::current();

        // Fetch industry-specific backend data
        $payload = IndustryService::getDashboardData($industryKey, $companyId);

        return Inertia::render('Admin/Dashboard', $payload);
    }
}
