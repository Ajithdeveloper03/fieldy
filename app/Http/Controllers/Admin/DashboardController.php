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

        // Determine industry: query parameter or company default
        $rawIndustry = request()->query('industry');
        if (!$rawIndustry && $companyId) {
            $company = Company::find($companyId);
            $rawIndustry = $company?->industry;
        }

        $industryKey = IndustryService::normalize($rawIndustry ?: 'real_estate');

        // Fetch industry-specific backend data
        $payload = IndustryService::getDashboardData($industryKey, $companyId);

        return Inertia::render('Admin/Dashboard', $payload);
    }
}
