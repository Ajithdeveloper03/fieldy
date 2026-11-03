<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Industry\IndustryCatalog;
use App\Services\Industry\IndustryContext;
use Inertia\Inertia;

class AlertsController extends Controller
{
    public function index()
    {
        $industryKey = IndustryContext::current();
        $alerts = IndustryCatalog::alerts($industryKey);

        return Inertia::render('Admin/Alerts', [
            'alerts' => $alerts,
        ]);
    }
}
