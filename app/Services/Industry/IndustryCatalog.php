<?php

namespace App\Services\Industry;

use Carbon\Carbon;

/**
 * Sample-data catalog for every service vertical.
 *
 * Used by admin pages when the active vertical has no real database records yet, so each
 * page shows content that strictly belongs to the selected service (never real-estate data
 * inside e.g. the Security vertical). All records are deterministic (stable IDs / values)
 * so list → detail navigation works.
 *
 * ID ranges (never collide with real DB ids in practice):
 *   entities 900000 + v*1000 + n, staff 800000 + v*1000 + n, visits 700000 + v*1000 + n,
 *   tasks 600000 + v*1000 + n, payments 500000 + v*1000 + n
 */
class IndustryCatalog
{
    public const KEYS = [
        'real_estate', 'facility_fmcg', 'construction', 'security', 'cleaning',
        'maintenance', 'solar', 'pest_control', 'logistics',
    ];

    private const FIRST = ['Karthik', 'Priya', 'Arun', 'Divya', 'Senthil', 'Kavitha', 'Ramesh', 'Lakshmi', 'Vignesh', 'Meena', 'Suresh', 'Anitha', 'Manoj', 'Deepa', 'Prakash', 'Revathi'];
    private const LAST = ['Kumar', 'Raja', 'Murugan', 'Subramanian', 'Natarajan', 'Krishnan', 'Pandian', 'Selvam', 'Rajan', 'Ganesh', 'Velu', 'Mani'];

    private const PLACES = [
        ['Anna Nagar', 'Chennai', 13.0850, 80.2101], ['T. Nagar', 'Chennai', 13.0418, 80.2341],
        ['OMR Sholinganallur', 'Chennai', 12.9010, 80.2279], ['Guindy Industrial Estate', 'Chennai', 13.0067, 80.2206],
        ['Ambattur', 'Chennai', 13.1143, 80.1548], ['Porur', 'Chennai', 13.0382, 80.1565],
        ['Whitefield', 'Bengaluru', 12.9698, 77.7500], ['Electronic City', 'Bengaluru', 12.8452, 77.6602],
        ['Peenya', 'Bengaluru', 13.0285, 77.5197], ['Hosur Road', 'Bengaluru', 12.9141, 77.6411],
        ['Coimbatore SIDCO', 'Coimbatore', 10.9601, 76.9614], ['Sriperumbudur', 'Kanchipuram', 12.9675, 79.9419],
    ];

    /** Per-vertical definitions. */
    private static function defs(): array
    {
        return [
            'real_estate' => [
                'entity_prefix' => 'PRP', 'staff_prefix' => 'AGT', 'visit_prefix' => 'SV', 'size_unit' => 'sq.ft',
                'entities' => [
                    ['Skyline Villa Plot #14', 'Villa Plot', 2400, ['Gated community', 'DTCP approved']],
                    ['Green Valley Phase 2 – Block A', 'Apartment Tower', 48000, ['RERA registered', '96 units']],
                    ['Downtown Commercial Penthouse', 'Commercial', 5200, ['Sea view', 'Ready to occupy']],
                    ['OMR Tech Corridor Plot #7', 'Residential Plot', 1800, ['Corner plot', 'Clear title']],
                    ['Lakeview Row Houses', 'Row House', 3100, ['Club house', 'Phase 1']],
                    ['ECR Beach Villas #3', 'Villa', 4200, ['Private pool', 'Premium']],
                    ['Ambattur Industrial Shed', 'Warehouse', 12000, ['Lease', 'Truck access']],
                    ['Porur Garden Apartments', 'Apartment Tower', 36000, ['Under construction', '72 units']],
                ],
                'roles' => ['Property Advisor', 'Senior Sales Agent', 'Site Executive', 'Relationship Manager'],
                'customers' => ['Buyer', 'Investor', 'Tenant'],
                'visit_types' => ['Site Tour', 'Client Showing', 'Documentation', 'Key Handover', 'Boundary Survey'],
                'visit_notes' => ['Buyer walked through model villa; liked the layout.', 'Plot boundary stones verified with layout map.', 'Client requested revised payment schedule.', 'Documents checked; RERA certificate shared with buyer.'],
                'visit_recs' => ['Schedule second visit with family', 'Share bank loan pre-approval options', 'Send updated price sheet', 'Book registration slot'],
                'tasks' => [
                    ['Client showing – Skyline Villa Plot #14', 'Walk buyer through the plot and model villa.', 'high'],
                    ['RERA document sign-off – Green Valley Ph 2', 'Collect signatures on allotment documents.', 'medium'],
                    ['Key handover – Downtown Penthouse', 'Hand over keys and record meter readings.', 'urgent'],
                    ['Boundary demarcation – OMR Plot #7', 'Verify survey stones with site engineer.', 'low'],
                    ['Follow-up visit – Lakeview Row Houses', 'Second visit for interested investor.', 'medium'],
                ],
                'alerts' => [
                    ['critical', 'Agent GPS disabled during client showing', 'GPS turned off 400 m outside the Skyline Villa geofence.'],
                    ['high', 'Agent stationary before scheduled showing', 'No movement for 45 minutes before the OMR plot visit.'],
                    ['info', 'Project geofences synced', 'All site boundaries verified successfully.'],
                ],
                'payment_types' => ['salary', 'commission', 'incentive', 'travel_allowance'],
                'approval_doc' => 'Title deed & RERA certificate',
            ],
            'facility_fmcg' => [
                'entity_prefix' => 'BAY', 'staff_prefix' => 'FMS', 'visit_prefix' => 'HA', 'size_unit' => 'sq.ft',
                'entities' => [
                    ['Phoenix Mall – Restroom Wing A', 'Restroom Block', 1800, ['12 cubicles', 'Smart odour sensor']],
                    ['Bay 4 – FMCG Personal Care Aisle', 'Retail Aisle', 2400, ['86 SKUs', 'Planogram v3']],
                    ['Tidel Park – Executive Pantry L5', 'Pantry', 900, ['Coffee & snacks', 'Daily restock']],
                    ['Express Avenue – Food Court Wing', 'Food Court', 6200, ['18 outlets', 'High footfall']],
                    ['DLF IT Park – Lobby & Reception', 'Common Area', 4500, ['24x7 housekeeping']],
                    ['Bay 9 – Beverages & Dairy Chiller', 'Retail Aisle', 1600, ['Cold chain', '42 SKUs']],
                    ['Olympia Tech – Restroom Wing C', 'Restroom Block', 1500, ['10 cubicles', 'ATP audited']],
                    ['Central Warehouse – Consumables Store', 'Store Room', 3200, ['Housekeeping stock']],
                ],
                'roles' => ['Housekeeping Associate', 'Shift Supervisor', 'FMCG Merchandiser', 'Hygiene Auditor'],
                'customers' => ['Facility Client', 'Store Manager'],
                'visit_types' => ['Hygiene Audit', 'Shelf Replenishment', 'Restroom Sanitisation', 'Pantry Restock', 'ATP Swab Test'],
                'visit_notes' => ['Restroom sanitised; odour sensor at 0.02 ppm.', 'Shelf gaps filled for 14 SKUs in Bay 4.', 'Pantry restocked; coffee beans low next week.', 'ATP swab passed at 12 RLU.'],
                'visit_recs' => ['Increase restroom rounds during lunch peak', 'Raise PO for disinfectant refills', 'Re-face planogram for promo SKUs', 'Replace hand-dryer filter'],
                'tasks' => [
                    ['Sanitise Restroom Wing A', 'Deep clean, restock soap and towels, log sensor reading.', 'high'],
                    ['FMCG SKU replenishment – Bay 4', 'Fill shelf gaps and update stock count.', 'medium'],
                    ['Executive pantry restock audit', 'Check pantry consumables and refill.', 'low'],
                    ['HVAC duct UV sanitisation – Food Court', 'Run UV sanitisation on food court ducts.', 'medium'],
                    ['ATP swab test – Restroom Wing C', 'Swab high-touch surfaces and record RLU.', 'urgent'],
                ],
                'alerts' => [
                    ['critical', 'Restroom ammonia sensor above limit', 'Wing A sensor reads 0.9 ppm – immediate cleaning required.'],
                    ['high', 'Shelf out-of-stock – Bay 9', '6 dairy SKUs out of stock for over 2 hours.'],
                    ['info', 'Housekeeping roster complete', 'All 38 staff clocked in for the morning shift.'],
                ],
                'payment_types' => ['salary', 'shift_allowance', 'overtime', 'incentive'],
                'approval_doc' => 'Facility checklist & hygiene SOP',
            ],
            'construction' => [
                'entity_prefix' => 'SITE', 'staff_prefix' => 'ENG', 'visit_prefix' => 'INS', 'size_unit' => 'sq.m',
                'entities' => [
                    ['Tower B – Residential High-rise', 'High-rise Tower', 18500, ['G+22 floors', 'Level 4 slab in progress']],
                    ['Block C – Foundation & Basement', 'Foundation', 6200, ['Raft foundation', 'Curing']],
                    ['Metro Viaduct Pier P-14', 'Infrastructure', 1200, ['Pier cap', 'Night pour']],
                    ['Warehouse Shed – Sriperumbudur', 'Industrial Shed', 9800, ['PEB structure', 'Roofing']],
                    ['Hospital Annex – Wing 2', 'Institutional', 7400, ['G+6', 'MEP rough-in']],
                    ['Internal Road Package R3', 'Road Works', 3600, ['Bituminous', 'Phase 2']],
                    ['Batching Plant Yard', 'Site Facility', 2200, ['60 m³/hr plant']],
                    ['Tower A – Finishing Works', 'High-rise Tower', 17200, ['Façade', 'Handover Q1']],
                ],
                'roles' => ['Site Engineer', 'Safety Officer', 'Site Supervisor', 'QC Engineer'],
                'customers' => ['Project Owner', 'Main Contractor'],
                'visit_types' => ['Rebar Inspection', 'Concrete Slump Test', 'Safety Audit', 'Progress Survey', 'Scaffold Tagging'],
                'visit_notes' => ['Rebar spacing verified on Level 4 slab.', 'Slump test 100 mm – within spec.', 'Two workers without harness – corrected on site.', 'Scaffold tagged safe after inspection.'],
                'visit_recs' => ['Increase curing duration by 2 days', 'Toolbox talk on working at height', 'Replace damaged scaffold couplers', 'Order additional cube moulds'],
                'tasks' => [
                    ['Rebar inspection – Tower B Level 4', 'Check bar spacing, cover and lap lengths.', 'high'],
                    ['Concrete slump verification – Block C', 'Test slump for each transit mixer.', 'urgent'],
                    ['Scaffolding safety tagging – Tower A', 'Inspect and tag all scaffold bays.', 'medium'],
                    ['Excavator #04 daily log', 'Record engine hours and refuelling.', 'low'],
                    ['PPE compliance walk – Hospital Annex', 'Check hard hats, vests and harnesses.', 'medium'],
                ],
                'alerts' => [
                    ['critical', 'Worker left site geofence during shift', 'Labour ID L-221 exited Tower B perimeter without check-out.'],
                    ['high', 'Crane wind speed approaching limit', 'Anemometer reads 38 km/h – prepare to stop lifting.'],
                    ['info', 'Concrete cubes passed 28-day test', 'Block C cubes achieved M30 strength.'],
                ],
                'payment_types' => ['salary', 'site_allowance', 'overtime', 'safety_bonus'],
                'approval_doc' => 'Building permit & structural drawings',
            ],
            'security' => [
                'entity_prefix' => 'CHK', 'staff_prefix' => 'GRD', 'visit_prefix' => 'PTL', 'size_unit' => 'tags',
                'entities' => [
                    ['North Perimeter Gate', 'Main Gate', 4, ['Boom barrier', 'CCTV covered']],
                    ['Data Centre Vault Entry', 'Restricted Zone', 6, ['Biometric access', 'Armed post']],
                    ['Parking Basement B2', 'Parking Zone', 8, ['NFC tags', 'Night patrol']],
                    ['East Fence Watch Tower', 'Watch Tower', 3, ['Electric fence', 'Thermal camera']],
                    ['Main Lobby Reception Desk', 'Reception', 2, ['Visitor management']],
                    ['Warehouse Loading Dock', 'Loading Bay', 5, ['Vehicle check', 'Seal verification']],
                    ['South Emergency Exit', 'Emergency Exit', 2, ['Magnetic door sensor']],
                    ['Rooftop Utility Area', 'Utility Zone', 3, ['Restricted', 'Hourly scan']],
                ],
                'roles' => ['Security Guard', 'Patrol Supervisor', 'Gate Officer', 'Control Room Operator'],
                'customers' => ['Site Client', 'Facility Head'],
                'visit_types' => ['Perimeter Patrol', 'NFC Checkpoint Scan', 'Incident Response', 'Visitor Escort', 'Shift Handover'],
                'visit_notes' => ['All 6 checkpoint tags scanned on time.', 'Gate lock verified; boom barrier working.', 'False alarm at fire exit – sensor reset.', 'Visitor escorted to vault and logged out.'],
                'visit_recs' => ['Replace weak battery on tag #4', 'Add extra night round at loading dock', 'Repair fence light near tower', 'Refresh visitor badge stock'],
                'tasks' => [
                    ['North perimeter gate lock verification', 'Verify locks and boom barrier at shift start.', 'high'],
                    ['Visitor escort – Data Centre Vault', 'Escort auditor team and log entry/exit.', 'urgent'],
                    ['Night patrol round – Basement B2', 'Scan all NFC checkpoints every 2 hours.', 'medium'],
                    ['Fire exit sensor check – South Exit', 'Test magnetic sensor and alarm.', 'medium'],
                    ['Shift handover & radio check', 'Complete handover log and radio test.', 'low'],
                ],
                'alerts' => [
                    ['critical', 'SOS panic button pressed', 'Guard at Loading Dock triggered duress beacon.'],
                    ['high', 'Missed checkpoint scan', 'East Watch Tower not scanned for 75 minutes.'],
                    ['info', 'All body-cams online', '18/18 body-cams streaming.'],
                ],
                'payment_types' => ['salary', 'night_shift_allowance', 'overtime', 'incentive'],
                'approval_doc' => 'Post orders & site security agreement',
            ],
            'cleaning' => [
                'entity_prefix' => 'ZONE', 'staff_prefix' => 'JAN', 'visit_prefix' => 'CR', 'size_unit' => 'sq.ft',
                'entities' => [
                    ['Apollo Hospital – ICU Floor 3', 'Healthcare Zone', 8200, ['Terminal cleaning', 'Bio-waste']],
                    ['Corporate Cafeteria – Tower 1', 'Food Zone', 5400, ['Steam sanitise', '3 shifts']],
                    ['Restroom Hub 2 – Level 1', 'Restroom', 1200, ['QR feedback', 'Hourly rounds']],
                    ['Glass Façade – West Side', 'Specialised', 15000, ['Rope access', 'Monthly']],
                    ['Office Floors 4–8', 'Office Zone', 42000, ['Night cleaning']],
                    ['Main Lobby & Entrance', 'Common Area', 3800, ['Wet scrub', 'Auto scrubber']],
                    ['Kitchen Exhaust & Hood', 'Food Zone', 600, ['Degreasing', 'Weekly']],
                    ['Clinic OPD Waiting Area', 'Healthcare Zone', 2600, ['High-touch disinfection']],
                ],
                'roles' => ['Janitor', 'Cleaning Supervisor', 'Deep Clean Specialist', 'Scrubber Operator'],
                'customers' => ['Facility Client', 'Admin Manager'],
                'visit_types' => ['Deep Clean', 'Steam Sanitisation', 'QR Washroom Audit', 'Bio-waste Pickup', 'Façade Wash'],
                'visit_notes' => ['ICU terminal clean done; swab passed.', 'Cafeteria steam sanitised after lunch.', 'Washroom QR score 4.8/5.', 'Bio-waste bags sealed and handed to vendor.'],
                'visit_recs' => ['Add mid-day round in Restroom Hub 2', 'Reorder hospital-grade disinfectant', 'Replace scrubber pads', 'Schedule façade wash before monsoon'],
                'tasks' => [
                    ['ICU terminal floor sterilisation', 'Terminal clean of ICU Floor 3 with swab test.', 'urgent'],
                    ['Cafeteria steam sanitise – Tower 1', 'Steam sanitise tables and serving counters.', 'high'],
                    ['Restroom consumables restock – Hub 2', 'Refill soap, tissue and towels.', 'medium'],
                    ['Glass façade pressure wash', 'Rope-access wash of west façade.', 'low'],
                    ['Lobby wet scrub', 'Auto scrubber run on lobby floor.', 'medium'],
                ],
                'alerts' => [
                    ['critical', 'Spill reported in main lobby', 'Slip hazard reported via QR code – send wet scrub team.'],
                    ['high', 'Washroom feedback below threshold', 'Restroom Hub 2 rated 2.1/5 in the last hour.'],
                    ['info', 'Bio-waste pickup completed', 'All hospital bio-waste collected and logged.'],
                ],
                'payment_types' => ['salary', 'shift_allowance', 'overtime', 'incentive'],
                'approval_doc' => 'Cleaning scope & SLA agreement',
            ],
            'maintenance' => [
                'entity_prefix' => 'AST', 'staff_prefix' => 'TEC', 'visit_prefix' => 'WO', 'size_unit' => 'kVA/TR',
                'entities' => [
                    ['DG Set 500 kVA – Unit 1', 'Diesel Generator', 500, ['Cummins', 'Monthly load test']],
                    ['HVAC Chiller #2', 'Chiller', 300, ['Carrier screw chiller', 'Vibration sensor']],
                    ['Passenger Elevator L3', 'Elevator', 13, ['Otis', 'Quarterly certification']],
                    ['Main LT Panel – Substation', 'Electrical Panel', 2000, ['Thermography', 'Busbar']],
                    ['Fire Hydrant Ring Main', 'Fire System', 8, ['Pressure test', 'Jockey pump']],
                    ['UPS Battery Bank 200 kVA', 'UPS', 200, ['Impedance test']],
                    ['Cooling Tower CT-1', 'Cooling Tower', 400, ['Water treatment']],
                    ['STP Blower Unit', 'STP', 15, ['Bearing check']],
                ],
                'roles' => ['MEP Technician', 'Electrical Supervisor', 'HVAC Technician', 'Plumber'],
                'customers' => ['Facility Client', 'Plant Manager'],
                'visit_types' => ['Preventive Maintenance', 'Breakdown Repair', 'Load Bank Test', 'Thermography Scan', 'Calibration'],
                'visit_notes' => ['DG load bank test passed at 100% load.', 'Chiller bearing greased; vibration 2.1 mm/s.', 'Elevator governor tested and certified.', 'Hydrant pressure held at 8 bar.'],
                'visit_recs' => ['Replace DG air filter next PM', 'Order spare compressor bearings', 'Re-tighten busbar joints', 'Flush cooling tower basin'],
                'tasks' => [
                    ['DG Set 500 kVA monthly load bank test', 'Run load bank test and record readings.', 'high'],
                    ['Chiller #2 compressor bearing grease', 'Grease bearings and log vibration.', 'medium'],
                    ['Elevator L3 speed governor check', 'Test governor and safety gear.', 'urgent'],
                    ['Fire hydrant ring main pressure test', 'Hold pressure test at 8 bar.', 'medium'],
                    ['LT panel thermography scan', 'Scan for hotspots and record temperatures.', 'low'],
                ],
                'alerts' => [
                    ['critical', 'Chiller #2 vibration spike', 'Vibration reached 7.8 mm/s – risk of bearing failure.'],
                    ['high', 'DG fuel level low', 'Generator fuel at 18% – refill needed today.'],
                    ['info', 'Elevator certification renewed', 'Passenger Elevator L3 certified safe.'],
                ],
                'payment_types' => ['salary', 'on_call_allowance', 'overtime', 'incentive'],
                'approval_doc' => 'Asset register & AMC contract',
            ],
            'solar' => [
                'entity_prefix' => 'ARR', 'staff_prefix' => 'PVT', 'visit_prefix' => 'AUD', 'size_unit' => 'kWp',
                'entities' => [
                    ['Array Block #01 – East Field', 'Tracker Array', 1500, ['Single-axis tracker', 'Inverter INV-01']],
                    ['Array Block #03 – Central', 'Fixed-tilt Array', 1200, ['String inverter', 'Combiner box CB-3']],
                    ['Array Block #04 – West Field', 'Tracker Array', 1500, ['Gearbox service due']],
                    ['Rooftop Plant – Warehouse A', 'Rooftop', 450, ['Net metering']],
                    ['Inverter Station INV-02', 'Inverter Station', 2500, ['Central inverter']],
                    ['33 kV Substation & Transformer', 'Substation', 12000, ['Grid evacuation']],
                    ['Weather Station WS-1', 'Telemetry', 1, ['Pyranometer', 'Anemometer']],
                    ['Array Block #07 – South Field', 'Fixed-tilt Array', 1000, ['Robotic cleaning']],
                ],
                'roles' => ['PV Technician', 'Plant Engineer', 'Drone Pilot', 'Electrical Supervisor'],
                'customers' => ['Plant Owner', 'Asset Manager'],
                'visit_types' => ['Array Audit', 'Inverter Inspection', 'Drone Thermography', 'Panel Cleaning', 'Tracker Calibration'],
                'visit_notes' => ['Combiner fuse replaced on string 12.', 'Drone scan found 0 hotspots.', 'Pyranometer lens cleaned; GHI 890 W/m².', 'Tracker gearbox torque calibrated.'],
                'visit_recs' => ['Schedule robotic cleaning after dust storm', 'Replace 2 bypass diodes on string 8', 'Order spare DC fuses', 'Sample transformer oil next month'],
                'tasks' => [
                    ['Inverter Array #03 DC combiner fuse swap', 'Replace blown fuses and check string current.', 'urgent'],
                    ['Clean pyranometer sensor lens', 'Clean lens and verify irradiance reading.', 'low'],
                    ['Tracker motor gearbox torque calibration', 'Calibrate torque on Array Block #04.', 'high'],
                    ['Drone thermography scan – East Field', 'Infrared scan for hotspots.', 'medium'],
                    ['Transformer oil DGA sampling', 'Collect oil sample for lab analysis.', 'medium'],
                ],
                'alerts' => [
                    ['critical', 'Inverter INV-02 tripped', 'Central inverter offline – 2.5 MW generation lost.'],
                    ['high', 'String current mismatch – Block #03', 'String 12 producing 40% below peers.'],
                    ['info', 'Robotic cleaning cycle complete', '94% of panel area cleaned overnight.'],
                ],
                'payment_types' => ['salary', 'site_allowance', 'overtime', 'performance_bonus'],
                'approval_doc' => 'Grid connectivity & commissioning certificate',
            ],
            'pest_control' => [
                'entity_prefix' => 'GRID', 'staff_prefix' => 'EXT', 'visit_prefix' => 'TRT', 'size_unit' => 'stations',
                'entities' => [
                    ['Food Processing Unit 3', 'Food Facility', 48, ['FSSAI audited', 'Rodent grid']],
                    ['Central Warehouse – Ambattur', 'Warehouse', 64, ['Termite barrier', 'Glue boards']],
                    ['Hotel Grand – Kitchen Block', 'Hospitality', 22, ['Gel baiting', 'Monthly']],
                    ['Residential Society – Lakeview', 'Residential', 30, ['Mosquito fogging']],
                    ['Pharma Plant – Clean Room Perimeter', 'Pharma Facility', 36, ['Zero tolerance']],
                    ['School Campus – Porur', 'Institution', 18, ['Eco-friendly chemicals']],
                    ['Rice Mill Godown', 'Storage', 40, ['Fumigation']],
                    ['IT Park Food Court', 'Food Facility', 26, ['Night treatment']],
                ],
                'roles' => ['Pest Control Technician', 'Licensed Applicator', 'Field Supervisor', 'Hygiene Inspector'],
                'customers' => ['Client Facility', 'Quality Manager'],
                'visit_types' => ['Cold Fogging', 'Bait Station Check', 'Termite Treatment', 'Fumigation', 'Compliance Audit'],
                'visit_notes' => ['All 48 bait stations scanned – no activity.', 'Termite barrier drilled and injected 200 L.', 'Cold fogging done; area cleared after 2 hrs.', 'Glue board catch logged at dock door.'],
                'visit_recs' => ['Seal gap under dock door', 'Increase bait checks to weekly', 'Re-treat kitchen drain lines', 'Renew FSSAI pest certificate'],
                'tasks' => [
                    ['Cold fogging – Food Processing Unit 3', 'Fog production area after shift end.', 'high'],
                    ['Termite barrier drilling – Warehouse', 'Drill and inject perimeter barrier.', 'medium'],
                    ['Bait station barcode audit', 'Scan every station and log activity.', 'low'],
                    ['FSSAI pest-free re-certification', 'Inspect and issue compliance certificate.', 'urgent'],
                    ['Gel baiting – Hotel kitchen', 'Apply gel bait in kitchen cracks.', 'medium'],
                ],
                'alerts' => [
                    ['critical', 'Rodent activity in clean room perimeter', 'Smart trap triggered at Pharma Plant station #12.'],
                    ['high', 'Chemical stock below minimum', 'Pyrethroid stock at 6 L – reorder required.'],
                    ['info', 'Certificate issued', 'Zero-infestation certificate issued for Food Unit 3.'],
                ],
                'payment_types' => ['salary', 'chemical_handling_allowance', 'overtime', 'incentive'],
                'approval_doc' => 'Service contract & chemical MSDS',
            ],
            'logistics' => [
                'entity_prefix' => 'HUB', 'staff_prefix' => 'DRV', 'visit_prefix' => 'DRP', 'size_unit' => 'drops/day',
                'entities' => [
                    ['Ambattur Fulfilment Centre', 'Fulfilment Hub', 420, ['Cross-dock', '24x7']],
                    ['Guindy City Depot', 'Last-mile Depot', 180, ['EV fleet']],
                    ['Apollo Hospital – Cold Chain Drop', 'Customer Drop', 12, ['+2 to +8°C', 'Priority']],
                    ['Whitefield Micro Hub', 'Micro Hub', 140, ['Bike couriers']],
                    ['Sriperumbudur Factory Pickup', 'Pickup Point', 30, ['Reverse logistics']],
                    ['Electronic City Returns Centre', 'Returns Hub', 90, ['RTV inspection']],
                    ['T. Nagar Retail Cluster', 'Customer Drop', 65, ['Narrow lanes', 'Time slots']],
                    ['Hosur Road Line-haul Yard', 'Line-haul Yard', 260, ['Trailer parking']],
                ],
                'roles' => ['Delivery Driver', 'Fleet Supervisor', 'Dispatch Coordinator', 'Loader'],
                'customers' => ['Consignee', 'Shipper'],
                'visit_types' => ['Delivery Drop', 'Pickup', 'Return / RTV', 'Cold-chain Drop', 'Vehicle Inspection'],
                'visit_notes' => ['Drop completed; ePOD OTP verified.', 'Cold-chain cargo at +3.8°C on arrival.', 'Return pickup inspected; 2 items damaged.', 'Pre-trip check passed; tyres OK.'],
                'visit_recs' => ['Re-route via ring road during peak', 'Add second van for T. Nagar cluster', 'Replace data logger battery', 'Schedule vehicle service'],
                'tasks' => [
                    ['Re-route Van #12 (accident on NH44)', 'Re-plan route and inform customers of new ETA.', 'urgent'],
                    ['Cold-chain drop – Apollo Hospital', 'Deliver vaccine cartons, verify temperature log.', 'high'],
                    ['Reverse pickup & RTV inspection', 'Collect returns and inspect items.', 'medium'],
                    ['Pre-trip safety & tyre scan – fleet', 'Check tyres, lights and OBD faults.', 'low'],
                    ['Line-haul dispatch – Hosur Road', 'Load and seal trailer for overnight run.', 'medium'],
                ],
                'alerts' => [
                    ['critical', 'Cold-chain temperature breach', 'Van #08 cargo at +11°C – above safe range.'],
                    ['high', 'Harsh braking detected', 'Van #12 logged 3 harsh brakes on NH44.'],
                    ['info', 'All morning drops completed', '182 drops delivered with ePOD.'],
                ],
                'payment_types' => ['salary', 'trip_allowance', 'fuel_reimbursement', 'incentive'],
                'approval_doc' => 'Hub agreement & route permit',
            ],
        ];
    }

    public static function index(string $key): int
    {
        $i = array_search($key, self::KEYS, true);

        return $i === false ? 0 : $i;
    }

    public static function def(string $key): array
    {
        $defs = self::defs();

        return $defs[$key] ?? $defs['real_estate'];
    }

    private static function name(int $v, int $n): string
    {
        return self::FIRST[($v * 3 + $n) % count(self::FIRST)] . ' ' . self::LAST[($v * 5 + $n * 7) % count(self::LAST)];
    }

    private static function phone(int $v, int $n): string
    {
        return '98' . str_pad((string) (40000000 + $v * 1000003 + $n * 7919), 8, '0', STR_PAD_LEFT);
    }

    private static function place(int $v, int $n): array
    {
        return self::PLACES[($v * 2 + $n) % count(self::PLACES)];
    }

    /** Sites / assets / zones etc. for the vertical (what the "entities" pages list). */
    public static function entities(string $key): array
    {
        $v = self::index($key);
        $d = self::def($key);
        $out = [];
        foreach ($d['entities'] as $n => [$name, $type, $size, $attrs]) {
            [$area, $city, $lat, $lng] = self::place($v, $n);
            $status = $n >= count($d['entities']) - 2 ? 'pending' : 'approved';
            $out[] = [
                'id' => 900000 + $v * 1000 + $n + 1,
                'code' => $d['entity_prefix'] . '-' . str_pad((string) (101 + $n), 4, '0', STR_PAD_LEFT),
                'name' => $name,
                'type' => $type,
                'size' => $size,
                'size_unit' => $d['size_unit'],
                'attributes' => $attrs,
                'area' => $area,
                'city' => $city,
                'address' => $area . ', ' . $city,
                'latitude' => round($lat + ($n * 0.0031), 6),
                'longitude' => round($lng + ($n * 0.0027), 6),
                'contact_name' => self::name($v + 4, $n),
                'contact_role' => $d['customers'][$n % count($d['customers'])],
                'contact_phone' => self::phone($v + 9, $n),
                'status' => $status,
                'approval_status' => $status,
                'kyc_status' => $status === 'approved' ? 'verified' : 'pending',
                'document' => $d['approval_doc'],
                'assigned_staff_id' => 800000 + $v * 1000 + ($n % 8) + 1,
                'joined' => Carbon::now()->subDays(20 + $n * 9)->format('M d, Y'),
                'submitted_at' => Carbon::now()->subHours(3 + $n * 5)->format('M d, Y h:i A'),
                'is_sample' => true,
            ];
        }

        return $out;
    }

    public static function entity(string $key, $id): ?array
    {
        foreach (self::entities($key) as $e) {
            if ((string) $e['id'] === (string) $id) {
                return $e;
            }
        }

        return null;
    }

    /** Field workforce for the vertical. */
    public static function staff(string $key): array
    {
        $v = self::index($key);
        $d = self::def($key);
        $out = [];
        for ($n = 0; $n < 8; $n++) {
            [$area, $city] = self::place($v, $n + 3);
            $name = self::name($v, $n);
            $out[] = [
                'id' => 800000 + $v * 1000 + $n + 1,
                'code' => $d['staff_prefix'] . '-' . str_pad((string) (201 + $n), 4, '0', STR_PAD_LEFT),
                'name' => $name,
                'role' => $d['roles'][$n % count($d['roles'])],
                'region' => $area . ', ' . $city,
                'phone' => self::phone($v, $n),
                'email' => strtolower(str_replace(' ', '.', $name)) . '@fieldy.demo',
                'status' => $n === 7 ? 'inactive' : 'active',
                'online' => $n < 5,
                'joined' => Carbon::now()->subMonths(2 + $n)->format('M d, Y'),
                'is_sample' => true,
            ];
        }

        return $out;
    }

    public static function staffMember(string $key, $id): ?array
    {
        foreach (self::staff($key) as $s) {
            if ((string) $s['id'] === (string) $id) {
                return $s;
            }
        }

        return null;
    }

    /** Completed field visits (site visits / audits / patrols / drops …). */
    public static function visits(string $key, int $count = 16): array
    {
        $v = self::index($key);
        $d = self::def($key);
        $entities = self::entities($key);
        $staff = self::staff($key);
        $out = [];
        for ($n = 0; $n < $count; $n++) {
            $e = $entities[$n % count($entities)];
            $s = $staff[($n * 3) % 7];
            $start = Carbon::today()->subDays(intdiv($n, 3))->setTime(9 + ($n % 8), ($n * 13) % 60);
            $mins = 25 + ($n * 11) % 70;
            $out[] = [
                'id' => 700000 + $v * 1000 + $n + 1,
                'code' => $d['visit_prefix'] . '-' . str_pad((string) (3001 + $n), 5, '0', STR_PAD_LEFT),
                'type' => $d['visit_types'][$n % count($d['visit_types'])],
                'entity_id' => $e['id'],
                'entity_name' => $e['name'],
                'entity_code' => $e['code'],
                'address' => $e['address'],
                'latitude' => $e['latitude'],
                'longitude' => $e['longitude'],
                'staff_id' => $s['id'],
                'staff_name' => $s['name'],
                'date' => $start->format('M d, Y'),
                'date_raw' => $start->toDateString(),
                'check_in' => $start->format('h:i A'),
                'check_out' => $start->copy()->addMinutes($mins)->format('h:i A'),
                'duration_minutes' => $mins,
                'time_ago' => $start->diffForHumans(),
                'notes' => $d['visit_notes'][$n % count($d['visit_notes'])],
                'recommendations' => $d['visit_recs'][$n % count($d['visit_recs'])],
                'status' => $n % 7 === 6 ? 'flagged' : 'completed',
                'rating' => [5, 4, 5, 4, 3, 5, 4][$n % 7],
                'otp_verified' => $n % 5 !== 4,
                'distance_km' => $key === 'construction'
                    ? round(1.8 + (($n * 37) % 120) / 10, 1)
                    : round(0.05 + (($n * 37) % 90) / 1000, 3),
                'is_sample' => true,
            ];
        }

        return $out;
    }

    public static function visit(string $key, $id): ?array
    {
        foreach (self::visits($key) as $vis) {
            if ((string) $vis['id'] === (string) $id) {
                return $vis;
            }
        }

        return null;
    }

    /** Sample work orders / tasks (shape matches TasksController output). */
    public static function tasks(string $key): array
    {
        $v = self::index($key);
        $d = self::def($key);
        $staff = self::staff($key);
        $entities = self::entities($key);
        $statuses = ['in_progress', 'pending', 'pending', 'done', 'in_progress'];
        $out = [];
        foreach ($d['tasks'] as $n => [$title, $desc, $priority]) {
            $due = Carbon::today()->addDays($n - 1);
            $out[] = [
                'id' => 600000 + $v * 1000 + $n + 1,
                'work_order_code' => strtoupper(substr($key, 0, 2)) . '-' . str_pad((string) (5001 + $n), 5, '0', STR_PAD_LEFT),
                'title' => $title,
                'description' => $desc,
                'industry' => $key,
                'assigned_to' => ['id' => $staff[$n]['id'], 'name' => $staff[$n]['name']],
                'customer' => ['id' => $entities[$n]['id'], 'name' => $entities[$n]['name']],
                'created_by' => 'Admin',
                'due_date' => $due->format('M d, Y'),
                'due_date_raw' => $due->toDateString(),
                'priority' => $priority,
                'status' => $statuses[$n % count($statuses)],
                'ai_suggestions' => null,
                'customer_otp' => (string) (4000 + $v * 97 + $n * 13),
                'otp_verified' => $statuses[$n % count($statuses)] === 'done',
                'points_awarded' => 30 + $n * 5,
                'overdue' => $n === 0 && $statuses[0] !== 'done',
                'is_sample' => true,
            ];
        }

        return $out;
    }

    /** Alerts for the vertical (shape matches AlertsController output). */
    public static function alerts(string $key): array
    {
        $v = self::index($key);
        $d = self::def($key);
        $entities = self::entities($key);
        $ago = [12, 47, 140];
        $out = [];
        foreach ($d['alerts'] as $n => [$type, $title, $message]) {
            $out[] = [
                'id' => 400000 + $v * 1000 + $n + 1,
                'type' => $type,
                'title' => $title,
                'message' => $message,
                'location' => $entities[$n]['name'] . ' – ' . $entities[$n]['area'],
                'timestamp' => Carbon::now()->subMinutes($ago[$n] ?? 60)->toDateTimeString(),
                'resolved' => $type === 'info',
            ];
        }

        return $out;
    }

    /** Sample payroll / payouts for the vertical's workforce. */
    public static function payments(string $key): array
    {
        $v = self::index($key);
        $d = self::def($key);
        $out = [];
        foreach (self::staff($key) as $n => $s) {
            $type = $d['payment_types'][$n % count($d['payment_types'])];
            $amount = $type === 'salary' ? 18000 + $n * 1500 : 1200 + $n * 450;
            $status = $n % 3 === 0 ? 'pending' : 'paid';
            $out[] = [
                'id' => 500000 + $v * 1000 + $n + 1,
                'employee_id' => $s['id'],
                'employee_name' => $s['name'],
                'employee_code' => $s['code'],
                'amount' => $amount,
                'payment_type' => $type,
                'status' => $status,
                'payment_date' => $status === 'paid' ? Carbon::today()->subDays($n + 1)->format('M d, Y') : null,
                'month_year' => Carbon::now()->format('F Y'),
                'notes' => null,
                'is_sample' => true,
            ];
        }

        return $out;
    }

    /** Live GPS positions for the vertical's online workforce. */
    public static function livePositions(string $key): array
    {
        $entities = self::entities($key);
        $out = [];
        foreach (self::staff($key) as $n => $s) {
            if (! $s['online']) {
                continue;
            }
            $e = $entities[$n % count($entities)];
            $out[] = [
                'id' => $s['id'],
                'employee_id' => $s['id'],
                'employee' => ['id' => $s['id'], 'name' => $s['name']],
                'name' => $s['name'],
                'role' => $s['role'],
                'latitude' => $e['latitude'] + 0.0012 * ($n % 3),
                'longitude' => $e['longitude'] - 0.0009 * ($n % 2),
                'current_site' => $e['name'],
                'battery' => 92 - $n * 9,
                'speed_kmh' => $n % 2 ? 0 : 18 + $n * 3,
                'last_seen' => Carbon::now()->subMinutes($n * 2)->toIso8601String(),
                'created_at' => Carbon::now()->subMinutes($n * 2)->toIso8601String(),
                'is_sample' => true,
            ];
        }

        return $out;
    }
}

