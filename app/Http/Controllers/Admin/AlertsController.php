<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AlertsController extends Controller
{
    public function index()
    {
        $alerts = [
            [
                'id' => 1,
                'type' => 'critical',
                'title' => 'Advisor GPS Disabled During Buyer Showing',
                'message' => 'Property Advisor Karthik S. disabled GPS 400m outside Casagrand ECR Sea-View Villas geofence.',
                'location' => 'ECR Luxury Corridor • Plot #14',
                'timestamp' => now()->subMinutes(15)->toDateTimeString(),
                'resolved' => false,
            ],
            [
                'id' => 2,
                'type' => 'high',
                'title' => 'Stationary Alert En Route to Site Visit',
                'message' => 'Advisor Arun Prakash has been stationary for 45 minutes prior to scheduled buyer showing at OMR IT City Plots.',
                'location' => 'OMR Kelambakkam Highway',
                'timestamp' => now()->subMinutes(45)->toDateTimeString(),
                'resolved' => false,
            ],
            [
                'id' => 3,
                'type' => 'info',
                'title' => 'RERA Geofence Boundary Synced',
                'message' => 'All 24 plotted township and luxury villa GPS perimeters verified with 100% accuracy.',
                'location' => 'Real Estate Command Center',
                'timestamp' => now()->subHours(2)->toDateTimeString(),
                'resolved' => true,
            ],
        ];

        return Inertia::render('Admin/Alerts', [
            'alerts' => $alerts,
        ]);
    }
}
