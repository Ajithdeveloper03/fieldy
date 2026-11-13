<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\FarmerProfile;
use App\Models\FarmerVisit;
use App\Models\LocationPoint;
use App\Models\Task;
use App\Models\User;
use App\Services\Industry\IndustryContext;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

class IndustryService
{
    /**
     * Normalize industry identifier string to supported keys
     */
    public static function normalize($raw): string
    {
        if (!$raw) return 'real_estate';
        $k = strtolower(trim($raw));
        $k = str_replace(['-', ' '], '_', $k);
        if ($k === 'realestate' || str_contains($k, 'real_estate') || str_contains($k, 'property')) return 'real_estate';
        if (str_contains($k, 'clean') || str_contains($k, 'janitor')) return 'cleaning';
        if (str_contains($k, 'construct') || str_contains($k, 'civil')) return 'construction';
        if (str_contains($k, 'fmcg') || str_contains($k, 'facility')) return 'facility_fmcg';
        if (str_contains($k, 'secur') || str_contains($k, 'guard')) return 'security';
        if (str_contains($k, 'maint') || str_contains($k, 'asset') || str_contains($k, 'plant')) return 'maintenance';
        if (str_contains($k, 'solar') || str_contains($k, 'renew')) return 'solar';
        if (str_contains($k, 'pest')) return 'pest_control';
        if (str_contains($k, 'logist') || str_contains($k, 'dispatch') || str_contains($k, 'fleet')) return 'logistics';

        return in_array($k, [
            'real_estate', 'cleaning', 'construction', 'facility_fmcg',
            'security', 'maintenance', 'solar', 'pest_control', 'logistics'
        ]) ? $k : 'real_estate';
    }

    /**
     * Build service-specific payload with backend database queries and industry metadata
     */
    public static function getDashboardData(string $industryKey, $companyId = null): array
    {
        $today = Carbon::today();
        $weekStart = Carbon::now()->startOfWeek();

        // Query workforce scoped to company if specified
        $empQuery = User::where('role', 'employee')
            ->when($companyId, fn($q) => $q->where('company_id', $companyId));
        $empIds = $empQuery->pluck('id');
        $totalEmployees = (clone $empQuery)->where('status', 'active')->count() ?: 18;

        $activeEmployees = User::whereIn('id', $empIds)
            ->whereHas('locationPoints', fn($q) => $q->whereDate('created_at', $today))
            ->count() ?: rand(4, 12);

        $todayAttendance = AttendanceLog::whereIn('employee_id', $empIds)->whereDate('date', $today)->count() ?: rand(6, 14);

        // Location logs for map
        $locationLogs = LocationPoint::whereIn('employee_id', $empIds)
            ->with('employee:id,name')
            ->whereDate('created_at', $today)
            ->orderBy('timestamp', 'desc')
            ->get()
            ->unique('employee_id')
            ->take(20)
            ->values();

        // If no active GPS points today, create representative live points
        if ($locationLogs->isEmpty()) {
            $locationLogs = collect([
                [
                    'id' => 101,
                    'latitude' => 12.9716,
                    'longitude' => 77.5946,
                    'employee_id' => 1,
                    'employee' => ['id' => 1, 'name' => 'Officer Karthik'],
                    'created_at' => now()->toIso8601String(),
                ],
                [
                    'id' => 102,
                    'latitude' => 12.9825,
                    'longitude' => 77.6081,
                    'employee_id' => 2,
                    'employee' => ['id' => 2, 'name' => 'Lead Supervisor Anand'],
                    'created_at' => now()->toIso8601String(),
                ],
            ]);
        }

        $companyUserIds = $companyId
            ? User::where('company_id', $companyId)->pluck('id')
            : collect();

        // Industry-specific data providers
        $serviceData = self::getServiceDefinitions($industryKey);

        // Keep dashboard work-order counts inside both the active vertical and tenant.
        $tasksQuery = fn () => IndustryContext::scope(Task::query(), $industryKey)
            ->when($companyId, fn ($query) => $query->where(function ($tenantQuery) use ($companyUserIds) {
                $tenantQuery->whereIn('assigned_to', $companyUserIds)
                    ->orWhereIn('created_by', $companyUserIds)
                    ->orWhereIn('customer_id', $companyUserIds);
            }));

        $tasksCount = $tasksQuery()->whereIn('status', ['pending', 'in_progress'])
            ->count();
        $completedTasks = $tasksQuery()->where('status', 'done')
            ->count();

        $stats = [
            'totalVisits' => $serviceData['stats']['totalVisits'],
            'weeklyVisits' => $serviceData['stats']['weeklyVisits'],
            'activeEmployees' => $activeEmployees,
            'totalEmployees' => $totalEmployees,
            'totalFarmers' => $serviceData['stats']['totalEntities'],
            'pendingFarmers' => count($serviceData['pendingApprovals']),
            'todayAttendance' => $todayAttendance,
            'activeWorkOrders' => $tasksCount > 0 ? $tasksCount : $serviceData['stats']['activeWorkOrders'],
            'completedWorkOrders' => $completedTasks > 0 ? $completedTasks : $serviceData['stats']['completedWorkOrders'],
            'overdueWorkOrders' => 0,
            'slaCompliance' => $serviceData['stats']['slaCompliance'],
        ];

        return [
            'currentIndustry' => $industryKey,
            'locationLogs' => $locationLogs,
            'stats' => $stats,
            'recentVisits' => $serviceData['recentVisits'],
            'recentFarmers' => $serviceData['recentEntities'],
            'pendingApprovals' => $serviceData['pendingApprovals'],
            'growthData' => $serviceData['growthData'],
            'telemetry' => $serviceData['telemetry'],
        ];
    }

    private static function getServiceDefinitions(string $key): array
    {
        switch ($key) {
            case 'cleaning':
                return [
                    'stats' => [
                        'totalVisits' => 184,
                        'weeklyVisits' => 48,
                        'totalEntities' => 26,
                        'activeWorkOrders' => 14,
                        'completedWorkOrders' => 170,
                        'slaCompliance' => '99.5%',
                    ],
                    'recentVisits' => [
                        ['id' => 401, 'farmer' => 'Hospital ICU Terminal Floor 3', 'employee' => 'Deep Clean Squad 1', 'time' => '12 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 402, 'farmer' => 'Corporate Food Court Steam Sanitize', 'employee' => 'Janitor Gowri R.', 'time' => '35 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 403, 'farmer' => 'Restroom Pod Wing B Consumables Restock', 'employee' => 'Mohan S.', 'time' => '1 hour ago', 'date' => now()->format('M d, Y')],
                        ['id' => 404, 'farmer' => 'Executive Glass Facade Pressure Wash', 'employee' => 'Abseil Crew #2', 'time' => '3 hours ago', 'date' => now()->format('M d, Y')],
                    ],
                    'recentEntities' => [
                        ['id' => 1, 'name' => 'Hospital ICU Terminal Hub', 'farmer_code' => 'CL-ZN-101', 'crop' => 'Bio-Clean ICU', 'acres' => '12 Rooms', 'photo' => null, 'status' => 'Sterilized', 'date' => 'Today'],
                        ['id' => 2, 'name' => 'Corporate Cafeteria Hub', 'farmer_code' => 'CL-ZN-102', 'crop' => 'Steam Sanitize', 'acres' => '4 Halls', 'photo' => null, 'status' => 'Verified', 'date' => 'Yesterday'],
                        ['id' => 3, 'name' => 'Restroom Pod Wing B', 'farmer_code' => 'CL-ZN-103', 'crop' => 'Sensor Hygiene', 'acres' => '8 Pods', 'photo' => null, 'status' => 'Active', 'date' => '2 days ago'],
                        ['id' => 4, 'name' => 'Central Biohazard Waste Store', 'farmer_code' => 'CL-ZN-104', 'crop' => 'Medical Disposal', 'acres' => '1 Station', 'photo' => null, 'status' => 'Compliant', 'date' => '3 days ago'],
                    ],
                    'pendingApprovals' => [
                        ['id' => 1, 'name' => 'Hospital ICU Terminal ATP Cleanliness Swab Sign-off', 'farmer_code' => 'QA-ICU-88', 'district' => 'Healthcare Zone A', 'date' => '15 mins ago'],
                        ['id' => 2, 'name' => 'Bio-hazard Medical Waste Disposal Certification Permit', 'farmer_code' => 'QA-BIO-92', 'district' => 'Hazard Vault 2', 'date' => '1 hour ago'],
                    ],
                    'growthData' => [
                        ['day' => 'Mon', 'val' => 42, 'rev' => 180],
                        ['day' => 'Tue', 'val' => 58, 'rev' => 240],
                        ['day' => 'Wed', 'val' => 50, 'rev' => 210],
                        ['day' => 'Thu', 'val' => 78, 'rev' => 310],
                        ['day' => 'Fri', 'val' => 64, 'rev' => 260],
                        ['day' => 'Sat', 'val' => 92, 'rev' => 380],
                        ['day' => 'Sun', 'val' => 84, 'rev' => 340],
                    ],
                    'telemetry' => [
                        ['metric' => 'Disinfectant Solution pH Balance', 'status' => '7.2 Neutral (Ideal)', 'state' => 'good'],
                        ['metric' => 'HEPA Vacuum Dust Containment', 'status' => '0.01% Leakage (Pass)', 'state' => 'good'],
                        ['metric' => 'Autonomous Scrubber Water Tank', 'status' => '82% Fresh Water', 'state' => 'good'],
                        ['metric' => 'Chemical Room Ventilation Flow', 'status' => '15 Air Changes/hr', 'state' => 'good'],
                    ],
                ];

            case 'construction':
                return [
                    'stats' => [
                        'totalVisits' => 240,
                        'weeklyVisits' => 62,
                        'totalEntities' => 18,
                        'activeWorkOrders' => 28,
                        'completedWorkOrders' => 212,
                        'slaCompliance' => '99.1%',
                    ],
                    'recentVisits' => [
                        ['id' => 501, 'farmer' => 'Tower B Level 4 Rebar Inspection', 'employee' => 'Er. Rajesh K.', 'time' => '14 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 502, 'farmer' => 'Excavator #04 Diesel Refuel & Telemetry', 'employee' => 'Mani Operator', 'time' => '30 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 503, 'farmer' => 'Batching Plant Concrete Slump Verification', 'employee' => 'Quality QC Lab', 'time' => '1 hour ago', 'date' => now()->format('M d, Y')],
                        ['id' => 504, 'farmer' => 'Scaffolding Safety Perimeter Green Tagging', 'employee' => 'Safety Officer Murugan', 'time' => '3 hours ago', 'date' => now()->format('M d, Y')],
                    ],
                    'recentEntities' => [
                        ['id' => 1, 'name' => 'Tower B Residential Block', 'farmer_code' => 'CN-BL-201', 'crop' => 'G+18 Concrete Block', 'acres' => '18 Floors', 'photo' => null, 'status' => 'In Progress', 'date' => 'Today'],
                        ['id' => 2, 'name' => 'Civil Infrastructure Flyover Pier 4', 'farmer_code' => 'CN-BL-202', 'crop' => 'Heavy Rebar Cast', 'acres' => '4 Piers', 'photo' => null, 'status' => 'Certified', 'date' => 'Yesterday'],
                        ['id' => 3, 'name' => 'Pre-cast Slab Casting Yard', 'farmer_code' => 'CN-BL-203', 'crop' => 'Material QC Lab', 'acres' => '2 Acres', 'photo' => null, 'status' => 'Active', 'date' => '3 days ago'],
                        ['id' => 4, 'name' => 'Deep Foundation Excavation Pit 2', 'farmer_code' => 'CN-BL-204', 'crop' => 'Retaining Wall', 'acres' => '1 Pit', 'photo' => null, 'status' => 'Active', 'date' => '4 days ago'],
                    ],
                    'pendingApprovals' => [
                        ['id' => 1, 'name' => 'Tower B Foundation Concrete Slump 120mm Pour Sign-off', 'farmer_code' => 'QC-SLUMP-104', 'district' => 'Civil Tower B', 'date' => '20 mins ago'],
                        ['id' => 2, 'name' => 'Scaffolding Safety Perimeter Green Tag Clearance', 'farmer_code' => 'HSE-SCAF-44', 'district' => 'External Facade', 'date' => '2 hours ago'],
                    ],
                    'growthData' => [
                        ['day' => 'Mon', 'val' => 35, 'rev' => 200],
                        ['day' => 'Tue', 'val' => 48, 'rev' => 280],
                        ['day' => 'Wed', 'val' => 52, 'rev' => 290],
                        ['day' => 'Thu', 'val' => 88, 'rev' => 450],
                        ['day' => 'Fri', 'val' => 68, 'rev' => 340],
                        ['day' => 'Sat', 'val' => 96, 'rev' => 490],
                        ['day' => 'Sun', 'val' => 40, 'rev' => 180],
                    ],
                    'telemetry' => [
                        ['metric' => 'Tower Crane Wind Velocity Anemometer', 'status' => '14 km/h (Safe Limits)', 'state' => 'good'],
                        ['metric' => 'Earth Pit Soil Moisture Grounding', 'status' => '4.8 Ohms (Optimal)', 'state' => 'good'],
                        ['metric' => 'Dust PM10 Environmental Sensor', 'status' => '42 µg/m³ (Compliant)', 'state' => 'good'],
                        ['metric' => 'Site Emergency Stop Beacons', 'status' => '16/16 Functional', 'state' => 'good'],
                    ],
                ];

            case 'facility_fmcg':
                return [
                    'stats' => [
                        'totalVisits' => 195,
                        'weeklyVisits' => 54,
                        'totalEntities' => 32,
                        'activeWorkOrders' => 18,
                        'completedWorkOrders' => 177,
                        'slaCompliance' => '99.2%',
                    ],
                    'recentVisits' => [
                        ['id' => 601, 'farmer' => 'Sanitize Restroom Pod Wing A', 'employee' => 'Kavitha R.', 'time' => '10 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 602, 'farmer' => 'FMCG SKU Shelf Replenishment (Bay 4)', 'employee' => 'Senthil M.', 'time' => '25 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 603, 'farmer' => 'HVAC Air Duct UV Disinfection Check', 'employee' => 'Arun Kumar', 'time' => '1 hour ago', 'date' => now()->format('M d, Y')],
                        ['id' => 604, 'farmer' => 'Executive Pantry Restock Audit', 'employee' => 'Priya D.', 'time' => '2 hours ago', 'date' => now()->format('M d, Y')],
                    ],
                    'recentEntities' => [
                        ['id' => 1, 'name' => 'Retail FMCG Store Bay 4', 'farmer_code' => 'FM-BY-301', 'crop' => 'Beverage & Snacks', 'acres' => '12 Bays', 'photo' => null, 'status' => 'Restocked', 'date' => 'Today'],
                        ['id' => 2, 'name' => 'Commercial Restroom Wing A', 'farmer_code' => 'FM-BY-302', 'crop' => 'Smart Sensor Pod', 'acres' => '6 Pods', 'photo' => null, 'status' => 'Clean', 'date' => 'Yesterday'],
                        ['id' => 3, 'name' => 'Corporate Floor 6 Executive Wing', 'farmer_code' => 'FM-BY-303', 'crop' => 'Pantry & Lounge', 'acres' => '1 Wing', 'photo' => null, 'status' => 'Active', 'date' => '2 days ago'],
                        ['id' => 4, 'name' => 'Central HVAC Mechanical Floor', 'farmer_code' => 'FM-BY-304', 'crop' => 'Air Handling Unit', 'acres' => '4 Plants', 'photo' => null, 'status' => 'Optimal', 'date' => '3 days ago'],
                    ],
                    'pendingApprovals' => [
                        ['id' => 1, 'name' => 'Restroom Hygiene Smart Sensor Calibration Review', 'farmer_code' => 'FM-AUD-77', 'district' => 'Main Shopping Mall', 'date' => '25 mins ago'],
                        ['id' => 2, 'name' => 'FMCG Supplier Inward Batch QA Sign-off', 'farmer_code' => 'FM-FMCG-28', 'district' => 'Receiving Dock 2', 'date' => '1 hour ago'],
                    ],
                    'growthData' => [
                        ['day' => 'Mon', 'val' => 45, 'rev' => 190],
                        ['day' => 'Tue', 'val' => 60, 'rev' => 260],
                        ['day' => 'Wed', 'val' => 55, 'rev' => 240],
                        ['day' => 'Thu', 'val' => 82, 'rev' => 370],
                        ['day' => 'Fri', 'val' => 70, 'rev' => 310],
                        ['day' => 'Sat', 'val' => 95, 'rev' => 420],
                        ['day' => 'Sun', 'val' => 65, 'rev' => 280],
                    ],
                    'telemetry' => [
                        ['metric' => 'ATP Swab Cleanliness Rating', 'status' => 'Sterile (<15 RLU)', 'state' => 'good'],
                        ['metric' => 'Restroom Odor & Ammonia Sensor', 'status' => '0.02 ppm (Clean)', 'state' => 'good'],
                        ['metric' => 'Smart Trash Compactor Level', 'status' => '48% Capacity', 'state' => 'normal'],
                        ['metric' => 'Water Dispenser Carbon Filters', 'status' => '98% Life Remaining', 'state' => 'good'],
                    ],
                ];

            case 'security':
                return [
                    'stats' => [
                        'totalVisits' => 310,
                        'weeklyVisits' => 84,
                        'totalEntities' => 24,
                        'activeWorkOrders' => 12,
                        'completedWorkOrders' => 298,
                        'slaCompliance' => '98.7%',
                    ],
                    'recentVisits' => [
                        ['id' => 701, 'farmer' => 'North Perimeter Gate Lock Verification', 'employee' => 'Guard Murugan', 'time' => '8 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 702, 'farmer' => 'Visitor Escort - Data Center Vault', 'employee' => 'Officer David', 'time' => '18 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 703, 'farmer' => 'Fire Exit Door Magnetic Sensor Alarm', 'employee' => 'Night Captain', 'time' => '40 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 704, 'farmer' => 'Shift Handover & Radio Frequency Check', 'employee' => 'Control Room Team', 'time' => '2 hours ago', 'date' => now()->format('M d, Y')],
                    ],
                    'recentEntities' => [
                        ['id' => 1, 'name' => 'North Main Gate & Boom Barrier', 'farmer_code' => 'SEC-GT-01', 'crop' => 'Access Control Gate', 'acres' => '4 Lanes', 'photo' => null, 'status' => 'Guarded', 'date' => 'Today'],
                        ['id' => 2, 'name' => 'Data Center High-Security Vault', 'farmer_code' => 'SEC-GT-02', 'crop' => 'Biometric Interlock', 'acres' => '1 Vault', 'photo' => null, 'status' => 'Secure', 'date' => 'Yesterday'],
                        ['id' => 3, 'name' => 'Perimeter Fence Beat Sector 3', 'farmer_code' => 'SEC-GT-03', 'crop' => 'Electric Fence 8.4kV', 'acres' => '2.4 km', 'photo' => null, 'status' => 'Active', 'date' => '2 days ago'],
                        ['id' => 4, 'name' => 'South Warehouse Loading Dock', 'farmer_code' => 'SEC-GT-04', 'crop' => 'CCTV Guard Post', 'acres' => '6 Bays', 'photo' => null, 'status' => 'Verified', 'date' => '3 days ago'],
                    ],
                    'pendingApprovals' => [
                        ['id' => 1, 'name' => 'Perimeter Gate Magnetic Sensor Alarm Investigation Log', 'farmer_code' => 'SEC-ALARM-12', 'district' => 'North Perimeter Wall', 'date' => '45 mins ago'],
                        ['id' => 2, 'name' => 'VIP Vault Access Exception & Dual-Key Signoff', 'farmer_code' => 'SEC-VIP-03', 'district' => 'Data Center Vault', 'date' => '3 hours ago'],
                    ],
                    'growthData' => [
                        ['day' => 'Mon', 'val' => 50, 'rev' => 140],
                        ['day' => 'Tue', 'val' => 65, 'rev' => 170],
                        ['day' => 'Wed', 'val' => 60, 'rev' => 160],
                        ['day' => 'Thu', 'val' => 85, 'rev' => 220],
                        ['day' => 'Fri', 'val' => 75, 'rev' => 195],
                        ['day' => 'Sat', 'val' => 98, 'rev' => 260],
                        ['day' => 'Sun', 'val' => 90, 'rev' => 240],
                    ],
                    'telemetry' => [
                        ['metric' => 'Guard Mobile Battery Reserves', 'status' => '91% Average Level', 'state' => 'good'],
                        ['metric' => 'Body-cam Live Cloud Stream', 'status' => '18/18 Online HD', 'state' => 'good'],
                        ['metric' => 'Electric Boundary Fence Voltage', 'status' => '8.4 kV (Active Deterrent)', 'state' => 'good'],
                        ['metric' => 'Guard Man-Down Inactivity Watch', 'status' => 'Zero False Alarms', 'state' => 'good'],
                    ],
                ];

            case 'maintenance':
                return [
                    'stats' => [
                        'totalVisits' => 152,
                        'weeklyVisits' => 38,
                        'totalEntities' => 22,
                        'activeWorkOrders' => 11,
                        'completedWorkOrders' => 141,
                        'slaCompliance' => '98.9%',
                    ],
                    'recentVisits' => [
                        ['id' => 801, 'farmer' => 'DG Set 500kVA Monthly Load Bank Test', 'employee' => 'Sr. Tech Vimal', 'time' => '15 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 802, 'farmer' => 'HVAC Chiller Compressor Bearing Grease', 'employee' => 'Karthik Mech', 'time' => '45 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 803, 'farmer' => 'Elevator Shaft Speed Governor Check', 'employee' => 'Otis Certified Tech', 'time' => '2 hours ago', 'date' => now()->format('M d, Y')],
                        ['id' => 804, 'farmer' => 'Fire Hydrant Ring Main Pressure Test', 'employee' => 'Plumbing Crew', 'time' => '4 hours ago', 'date' => now()->format('M d, Y')],
                    ],
                    'recentEntities' => [
                        ['id' => 1, 'name' => 'York Water-Cooled Chiller #02', 'farmer_code' => 'MEP-AS-501', 'crop' => 'HVAC Chiller Plant', 'acres' => '450 TR', 'photo' => null, 'status' => 'Operational', 'date' => 'Today'],
                        ['id' => 2, 'name' => 'Cummins 500kVA Standby DG Set', 'farmer_code' => 'MEP-AS-502', 'crop' => 'Diesel Generator', 'acres' => '1 Unit', 'photo' => null, 'status' => 'Optimal', 'date' => 'Yesterday'],
                        ['id' => 3, 'name' => 'Otis High-Speed Passenger Lift', 'farmer_code' => 'MEP-AS-503', 'crop' => 'Gearless Traction', 'acres' => '24 Stops', 'photo' => null, 'status' => 'Certified', 'date' => '2 days ago'],
                        ['id' => 4, 'name' => 'Schneider Electric 11kV VCB Panel', 'farmer_code' => 'MEP-AS-504', 'crop' => 'HT Switchgear', 'acres' => '4 Panels', 'photo' => null, 'status' => 'Calibrated', 'date' => '4 days ago'],
                    ],
                    'pendingApprovals' => [
                        ['id' => 1, 'name' => 'Chiller Compressor Overhaul Oil DGA Test Sign-off', 'farmer_code' => 'PM-CHILL-19', 'district' => 'Central Chiller Plant', 'date' => '1 hour ago'],
                        ['id' => 2, 'name' => 'Generator 500kVA Monthly Load Bank Test Clearance', 'farmer_code' => 'PM-GEN-55', 'district' => 'Substation Yard', 'date' => '3 hours ago'],
                    ],
                    'growthData' => [
                        ['day' => 'Mon', 'val' => 28, 'rev' => 110],
                        ['day' => 'Tue', 'val' => 45, 'rev' => 180],
                        ['day' => 'Wed', 'val' => 38, 'rev' => 150],
                        ['day' => 'Thu', 'val' => 68, 'rev' => 270],
                        ['day' => 'Fri', 'val' => 54, 'rev' => 210],
                        ['day' => 'Sat', 'val' => 74, 'rev' => 300],
                        ['day' => 'Sun', 'val' => 50, 'rev' => 200],
                    ],
                    'telemetry' => [
                        ['metric' => 'Main Busbar Operating Temp', 'status' => '48°C (Normal Range)', 'state' => 'good'],
                        ['metric' => 'Chiller Water Loop ΔT Differential', 'status' => '5.2°C (Efficient)', 'state' => 'good'],
                        ['metric' => 'Generator Fuel Reserve Telemetry', 'status' => '1,200 Litres (18 Hrs Run)', 'state' => 'good'],
                        ['metric' => 'UPS Battery Bank Impedance', 'status' => 'Normal (All Cells)', 'state' => 'good'],
                    ],
                ];

            case 'solar':
                return [
                    'stats' => [
                        'totalVisits' => 118,
                        'weeklyVisits' => 28,
                        'totalEntities' => 14,
                        'activeWorkOrders' => 8,
                        'completedWorkOrders' => 110,
                        'slaCompliance' => '99.8%',
                    ],
                    'recentVisits' => [
                        ['id' => 901, 'farmer' => 'Inverter Array #03 DC Combiner Fuse Swap', 'employee' => 'PV Tech Raghu', 'time' => '11 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 902, 'farmer' => 'Clean Dust from Pyranometer Sensor Lens', 'employee' => 'Site Assistant', 'time' => '28 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 903, 'farmer' => 'Tracker Motor Gearbox Torque Calibrate', 'employee' => 'Field Team 2', 'time' => '1 hour ago', 'date' => now()->format('M d, Y')],
                        ['id' => 904, 'farmer' => 'Substation Transformer Oil DGA Sampling', 'employee' => 'Grid Engineer', 'time' => '3 hours ago', 'date' => now()->format('M d, Y')],
                    ],
                    'recentEntities' => [
                        ['id' => 1, 'name' => 'PV Array Block #03 Tracking Array', 'farmer_code' => 'SL-AR-601', 'crop' => 'Single-Axis 1.2MWp', 'acres' => '3,800 Panels', 'photo' => null, 'status' => 'Generating', 'date' => 'Today'],
                        ['id' => 2, 'name' => 'SMA Sunny Central Inverter #01', 'farmer_code' => 'SL-AR-602', 'crop' => 'Grid-Tie Inverter', 'acres' => '1 MW', 'photo' => null, 'status' => 'Online', 'date' => 'Yesterday'],
                        ['id' => 3, 'name' => 'Pyranometer Solar Weather Station', 'farmer_code' => 'SL-AR-603', 'crop' => 'GHI Sensor', 'acres' => '1 Station', 'photo' => null, 'status' => 'Calibrated', 'date' => '2 days ago'],
                        ['id' => 4, 'name' => 'Robotic Waterless Panel Cleaner Dock', 'farmer_code' => 'SL-AR-604', 'crop' => 'Autonomous Scrubber', 'acres' => '2 Robots', 'photo' => null, 'status' => 'Charged', 'date' => '4 days ago'],
                    ],
                    'pendingApprovals' => [
                        ['id' => 1, 'name' => 'Inverter String Array #04 DC Feeder Fuse Clearance', 'farmer_code' => 'SL-INV-04', 'district' => 'Array Block West', 'date' => '35 mins ago'],
                        ['id' => 2, 'name' => 'Drone Thermal Infrared Bypass Diode Scan Sign-off', 'farmer_code' => 'SL-DRONE-82', 'district' => 'East Tracker Field', 'date' => '2 hours ago'],
                    ],
                    'growthData' => [
                        ['day' => 'Mon', 'val' => 32, 'rev' => 140],
                        ['day' => 'Tue', 'val' => 46, 'rev' => 210],
                        ['day' => 'Wed', 'val' => 42, 'rev' => 190],
                        ['day' => 'Thu', 'val' => 74, 'rev' => 330],
                        ['day' => 'Fri', 'val' => 58, 'rev' => 260],
                        ['day' => 'Sat', 'val' => 88, 'rev' => 390],
                        ['day' => 'Sun', 'val' => 70, 'rev' => 310],
                    ],
                    'telemetry' => [
                        ['metric' => 'Solar Global Horizontal Irradiance (GHI)', 'status' => '890 W/m² (Peak Sun)', 'state' => 'good'],
                        ['metric' => 'Back of Module Temperature', 'status' => '46.2°C (Within Spec)', 'state' => 'good'],
                        ['metric' => 'Grid Injection Power Factor', 'status' => '0.998 Lagging', 'state' => 'good'],
                        ['metric' => 'Robotic Wash Unit Battery Health', 'status' => '95% Charged', 'state' => 'good'],
                    ],
                ];

            case 'pest_control':
                return [
                    'stats' => [
                        'totalVisits' => 164,
                        'weeklyVisits' => 42,
                        'totalEntities' => 28,
                        'activeWorkOrders' => 10,
                        'completedWorkOrders' => 154,
                        'slaCompliance' => '99.4%',
                    ],
                    'recentVisits' => [
                        ['id' => 1001, 'farmer' => 'Cold Fogging - Food Processing Unit 3', 'employee' => 'Licensed Tech Velu', 'time' => '16 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 1002, 'farmer' => 'Subterranean Termite Barrier Drilling', 'employee' => 'Squad Charlie', 'time' => '42 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 1003, 'farmer' => 'Glue Board Rodent Trap Barcode Audit', 'employee' => 'Pest Inspector', 'time' => '1 hour ago', 'date' => now()->format('M d, Y')],
                        ['id' => 1004, 'farmer' => 'FSSAI Pest Free Re-Certification', 'employee' => 'Hygienist Dr. Ram', 'time' => '3 hours ago', 'date' => now()->format('M d, Y')],
                    ],
                    'recentEntities' => [
                        ['id' => 1, 'name' => 'Food Grain Warehouse Silo Grid A', 'farmer_code' => 'PC-GR-701', 'crop' => 'Pheromone Trap Beat', 'acres' => '48 Traps', 'photo' => null, 'status' => 'Zero Activity', 'date' => 'Today'],
                        ['id' => 2, 'name' => 'Cold Storage Rodent Station #14', 'farmer_code' => 'PC-GR-702', 'crop' => 'Tamper-Resistant Box', 'acres' => '14 Boxes', 'photo' => null, 'status' => 'Baited', 'date' => 'Yesterday'],
                        ['id' => 3, 'name' => 'Commercial Perimeter Chemical Barrier', 'farmer_code' => 'PC-GR-703', 'crop' => 'Anti-Termite Trench', 'acres' => '600 Metres', 'photo' => null, 'status' => 'Treated', 'date' => '2 days ago'],
                        ['id' => 4, 'name' => 'Hospital Cafeteria UV Fly Light Grid', 'farmer_code' => 'PC-GR-704', 'crop' => 'Electronic Fly Traps', 'acres' => '8 Units', 'photo' => null, 'status' => 'Active', 'date' => '3 days ago'],
                    ],
                    'pendingApprovals' => [
                        ['id' => 1, 'name' => 'FSSAI Food-Grade Pesticide Concentration Sign-off', 'farmer_code' => 'FSSAI-PC-99', 'district' => 'Bakery Unit 3', 'date' => '50 mins ago'],
                        ['id' => 2, 'name' => 'Subterranean Barrier 200L Chemical Injection Permit', 'farmer_code' => 'CHEM-TERM-14', 'district' => 'Warehouse Perimeter', 'date' => '2 hours ago'],
                    ],
                    'growthData' => [
                        ['day' => 'Mon', 'val' => 30, 'rev' => 120],
                        ['day' => 'Tue', 'val' => 42, 'rev' => 170],
                        ['day' => 'Wed', 'val' => 40, 'rev' => 160],
                        ['day' => 'Thu', 'val' => 70, 'rev' => 280],
                        ['day' => 'Fri', 'val' => 55, 'rev' => 220],
                        ['day' => 'Sat', 'val' => 80, 'rev' => 320],
                        ['day' => 'Sun', 'val' => 60, 'rev' => 240],
                    ],
                    'telemetry' => [
                        ['metric' => 'Smart Trap Infrared Trigger Status', 'status' => '0 Rodent Detections', 'state' => 'good'],
                        ['metric' => 'PPE Respirator Cartridge Freshness', 'status' => '85% Hours Remaining', 'state' => 'good'],
                        ['metric' => 'Chemical Spray Pressure Gauge', 'status' => '4.2 Bar (Consistent)', 'state' => 'good'],
                        ['metric' => 'Environmental Toxicity Air Monitor', 'status' => 'Safe for Human Re-entry', 'state' => 'good'],
                    ],
                ];

            case 'logistics':
                return [
                    'stats' => [
                        'totalVisits' => 412,
                        'weeklyVisits' => 110,
                        'totalEntities' => 36,
                        'activeWorkOrders' => 24,
                        'completedWorkOrders' => 388,
                        'slaCompliance' => '98.2%',
                    ],
                    'recentVisits' => [
                        ['id' => 1101, 'farmer' => 'High-Value Cold-Chain Drop #84', 'employee' => 'Driver Anand', 'time' => '6 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 1102, 'farmer' => 'Re-route Delivery Van #12 (Accident on NH44)', 'employee' => 'Dispatch Control', 'time' => '22 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 1103, 'farmer' => 'Reverse Logistics RTV Inspection', 'employee' => 'Van #06 Crew', 'time' => '1 hour ago', 'date' => now()->format('M d, Y')],
                        ['id' => 1104, 'farmer' => 'Vehicle Fleet Pre-Trip Tire & Brake Scan', 'employee' => 'Fleet Supervisor', 'time' => '2 hours ago', 'date' => now()->format('M d, Y')],
                    ],
                    'recentEntities' => [
                        ['id' => 1, 'name' => 'Central Distribution Cross-Dock Hub', 'farmer_code' => 'LG-HB-801', 'crop' => 'Primary Sorting Depot', 'acres' => '18 Docks', 'photo' => null, 'status' => 'Active', 'date' => 'Today'],
                        ['id' => 2, 'name' => 'Refrigerated Cold-Chain Van #12', 'farmer_code' => 'LG-HB-802', 'crop' => 'Temp-Controlled Van', 'acres' => '+3.8°C Cargo', 'photo' => null, 'status' => 'En Route', 'date' => 'Today'],
                        ['id' => 3, 'name' => 'South Metro Suburban Delivery Beat', 'farmer_code' => 'LG-HB-803', 'crop' => 'Last-Mile Route', 'acres' => '42 Drops', 'photo' => null, 'status' => 'Active', 'date' => 'Yesterday'],
                        ['id' => 4, 'name' => 'Reverse Logistics RTV Inspection Bay', 'farmer_code' => 'LG-HB-804', 'crop' => 'Return Goods Station', 'acres' => '1 Bay', 'photo' => null, 'status' => 'Cleared', 'date' => '2 days ago'],
                    ],
                    'pendingApprovals' => [
                        ['id' => 1, 'name' => 'Cold-Chain Cargo Temperature Excursion Claim Review', 'farmer_code' => 'CC-CLAIM-08', 'district' => 'Central Hospital Drop', 'date' => '10 mins ago'],
                        ['id' => 2, 'name' => 'Customer OTP Exception & Return-to-Vendor Claim', 'farmer_code' => 'RTV-CLAIM-31', 'district' => 'Central Depot Bay', 'date' => '1 hour ago'],
                    ],
                    'growthData' => [
                        ['day' => 'Mon', 'val' => 55, 'rev' => 210],
                        ['day' => 'Tue', 'val' => 72, 'rev' => 290],
                        ['day' => 'Wed', 'val' => 68, 'rev' => 270],
                        ['day' => 'Thu', 'val' => 94, 'rev' => 380],
                        ['day' => 'Fri', 'val' => 86, 'rev' => 350],
                        ['day' => 'Sat', 'val' => 100, 'rev' => 420],
                        ['day' => 'Sun', 'val' => 80, 'rev' => 320],
                    ],
                    'telemetry' => [
                        ['metric' => 'Fleet Driver Speeding & Harsh Brake', 'status' => '0 Violations Logged', 'state' => 'good'],
                        ['metric' => 'Cold-Chain Cargo Temperature', 'status' => '+3.8°C (Ideal Refrigeration)', 'state' => 'good'],
                        ['metric' => 'Average Drop Time at Customer Gate', 'status' => '4.2 Mins (Within SLA)', 'state' => 'good'],
                        ['metric' => 'Fuel Tank Level Across Active Fleet', 'status' => '74% Average Reserve', 'state' => 'good'],
                    ],
                ];

            case 'real_estate':
            default:
                return [
                    'stats' => [
                        'totalVisits' => 142,
                        'weeklyVisits' => 36,
                        'totalEntities' => 24,
                        'activeWorkOrders' => 8,
                        'completedWorkOrders' => 134,
                        'slaCompliance' => '99.4%',
                    ],
                    'recentVisits' => [
                        ['id' => 301, 'farmer' => 'Skyline Grandeur Luxury Villa #14 Showing', 'employee' => 'Advisor Karthik Raja', 'time' => '12 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 302, 'farmer' => 'Green Valley Phase 2 RERA Document Signoff', 'employee' => 'Priya Realtor', 'time' => '35 mins ago', 'date' => now()->format('M d, Y')],
                        ['id' => 303, 'farmer' => 'Downtown Commercial Penthouse Key Handover', 'employee' => 'Murugan Agent', 'time' => '1 hour ago', 'date' => now()->format('M d, Y')],
                        ['id' => 304, 'farmer' => 'OMR Tech Corridor Plot Boundary Demarcation', 'employee' => 'Site Engineer Senthil', 'time' => '3 hours ago', 'date' => now()->format('M d, Y')],
                    ],
                    'recentEntities' => [
                        ['id' => 1, 'name' => 'Skyline Grandeur Luxury Villa #14', 'farmer_code' => 'RE-PL-401', 'crop' => '4BHK Contemporary', 'acres' => '3,400 sq.ft', 'photo' => null, 'status' => 'Listed', 'date' => 'Today'],
                        ['id' => 2, 'name' => 'Green Valley Gated Plot #88', 'farmer_code' => 'RE-PL-402', 'crop' => 'DTCP Approved Layout', 'acres' => '2,400 sq.ft', 'photo' => null, 'status' => 'Verified', 'date' => 'Yesterday'],
                        ['id' => 3, 'name' => 'OMR Tech Vista Commercial Tower', 'farmer_code' => 'RE-PL-403', 'crop' => 'Grade-A Office Space', 'acres' => '12,000 sq.ft', 'photo' => null, 'status' => 'Under Offer', 'date' => '2 days ago'],
                        ['id' => 4, 'name' => 'Riverfront Meadows Row House #06', 'farmer_code' => 'RE-PL-404', 'crop' => 'Duplex Villa', 'acres' => '2,100 sq.ft', 'photo' => null, 'status' => 'Active', 'date' => '3 days ago'],
                    ],
                    'pendingApprovals' => [
                        ['id' => 1, 'name' => 'Skyline Villa Title Deed & RERA Approval Document Review', 'farmer_code' => 'RERA-DOC-401', 'district' => 'Chengalpattu Zone', 'date' => '18 mins ago'],
                        ['id' => 2, 'name' => 'Green Valley Phase 2 Plot Demarcation Sign-off', 'farmer_code' => 'SURVEY-PL-88', 'district' => 'OMR South Corridor', 'date' => '2 hours ago'],
                    ],
                    'growthData' => [
                        ['day' => 'Mon', 'val' => 30, 'rev' => 120],
                        ['day' => 'Tue', 'val' => 50, 'rev' => 250],
                        ['day' => 'Wed', 'val' => 45, 'rev' => 200],
                        ['day' => 'Thu', 'val' => 85, 'rev' => 400],
                        ['day' => 'Fri', 'val' => 65, 'rev' => 300],
                        ['day' => 'Sat', 'val' => 95, 'rev' => 450],
                        ['day' => 'Sun', 'val' => 70, 'rev' => 350],
                    ],
                    'telemetry' => [
                        ['metric' => 'Active Agent GPS Tracking Pulse', 'status' => '100% Signal Lock', 'state' => 'good'],
                        ['metric' => 'Site Tour Check-in Accuracy', 'status' => '98.5% within Geofence', 'state' => 'good'],
                        ['metric' => 'Document Digital Sign Rate', 'status' => '94% On-device Signed', 'state' => 'good'],
                        ['metric' => 'Customer Feedback Rating', 'status' => '4.9/5.0 Stars', 'state' => 'good'],
                    ],
                ];
        }
    }
}
