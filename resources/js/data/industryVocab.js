/**
 * Per-service vocabulary used by every admin page so that wording, field labels and
 * dropdown options strictly match the selected service vertical.
 *
 * Keys mirror app/Services/Industry/IndustryCatalog.php on the backend.
 */
const V = {
    real_estate: {
        entity: { singular: 'Property', plural: 'Properties', code: 'Property ID', type: 'Property Type', size: 'Area', sizeUnit: 'sq.ft', attributes: 'Highlights', types: ['Villa Plot', 'Residential Plot', 'Villa', 'Row House', 'Apartment Tower', 'Commercial', 'Warehouse'] },
        staff: { singular: 'Agent', plural: 'Agents', code: 'Agent ID', roles: ['Property Advisor', 'Senior Sales Agent', 'Site Executive', 'Relationship Manager'] },
        customer: { singular: 'Buyer', plural: 'Buyers', contactRoles: ['Buyer', 'Investor', 'Tenant'] },
        visit: { singular: 'Site Visit', plural: 'Site Visits', verb: 'Showing completed at', types: ['Site Tour', 'Client Showing', 'Documentation', 'Key Handover', 'Boundary Survey'], notes: 'Visit Notes', recommendations: 'Next Steps' },
        task: { singular: 'Task', plural: 'Daily Tasks', newLabel: 'New Task' },
        approval: { plural: 'Pending Approvals', doc: 'Title deed & RERA certificate', approve: 'Approve Listing', reject: 'Reject Listing' },
        finance: { group: 'Sales & Finance', scores: 'Agent Scores', payments: 'Payments', paymentTypes: ['salary', 'commission', 'incentive', 'travel_allowance'] },
        monitor: { title: 'Live GPS Map', onDuty: 'Agents on Duty', atSite: 'At property' },
        alerts: { title: 'Alerts' },
        score: { metric: 'Showings', target: 'Monthly showing target' },
    },
    facility_fmcg: {
        entity: { singular: 'Facility Bay', plural: 'Facility Bays', code: 'Bay ID', type: 'Bay Type', size: 'Floor Area', sizeUnit: 'sq.ft', attributes: 'Bay Details', types: ['Restroom Block', 'Retail Aisle', 'Pantry', 'Food Court', 'Common Area', 'Store Room'] },
        staff: { singular: 'Housekeeping Staff', plural: 'Staff & Crew', code: 'Staff ID', roles: ['Housekeeping Associate', 'Shift Supervisor', 'FMCG Merchandiser', 'Hygiene Auditor'] },
        customer: { singular: 'Facility Client', plural: 'Facility Clients', contactRoles: ['Facility Client', 'Store Manager'] },
        visit: { singular: 'Hygiene Audit', plural: 'Hygiene Audits', verb: 'Audit completed at', types: ['Hygiene Audit', 'Shelf Replenishment', 'Restroom Sanitisation', 'Pantry Restock', 'ATP Swab Test'], notes: 'Audit Findings', recommendations: 'Corrective Actions' },
        task: { singular: 'Shift Task', plural: 'Shifts & Audits', newLabel: 'New Shift Task' },
        approval: { plural: 'Pending Audits', doc: 'Facility checklist & hygiene SOP', approve: 'Approve Bay', reject: 'Reject Bay' },
        finance: { group: 'Payroll & Finance', scores: 'Crew Scores', payments: 'Payroll', paymentTypes: ['salary', 'shift_allowance', 'overtime', 'incentive'] },
        monitor: { title: 'Live Crew Map', onDuty: 'Crew on Shift', atSite: 'At bay' },
        alerts: { title: 'Hygiene & Stock Alerts' },
        score: { metric: 'Audits', target: 'Monthly audit target' },
    },
    construction: {
        entity: { singular: 'Project Site', plural: 'Project Sites', code: 'Site ID', type: 'Site Type', size: 'Built-up Area', sizeUnit: 'sq.m', attributes: 'Site Details', types: ['High-rise Tower', 'Foundation', 'Infrastructure', 'Industrial Shed', 'Institutional', 'Road Works', 'Site Facility'] },
        staff: { singular: 'Site Engineer', plural: 'Site Engineers', code: 'Engineer ID', roles: ['Site Engineer', 'Safety Officer', 'Site Supervisor', 'QC Engineer'] },
        customer: { singular: 'Project Owner', plural: 'Project Owners', contactRoles: ['Project Owner', 'Main Contractor'] },
        visit: { singular: 'Site Inspection', plural: 'Site Inspections', verb: 'Inspection completed at', types: ['Rebar Inspection', 'Concrete Slump Test', 'Safety Audit', 'Progress Survey', 'Scaffold Tagging'], notes: 'Inspection Findings', recommendations: 'Corrective Actions' },
        task: { singular: 'Work Order', plural: 'Daily Work Orders', newLabel: 'New Work Order' },
        approval: { plural: 'Pending Site Permits', doc: 'Building permit & structural drawings', approve: 'Approve Site', reject: 'Reject Site' },
        finance: { group: 'Payroll & Finance', scores: 'Engineer Scores', payments: 'Payroll', paymentTypes: ['salary', 'site_allowance', 'overtime', 'safety_bonus'] },
        monitor: { title: 'Live Site Map', onDuty: 'Engineers on Site', atSite: 'At site' },
        alerts: { title: 'Site Safety Alerts' },
        score: { metric: 'Inspections', target: 'Monthly inspection target' },
    },
    security: {
        entity: { singular: 'Checkpoint', plural: 'Checkpoints', code: 'Checkpoint ID', type: 'Post Type', size: 'NFC Tags', sizeUnit: 'tags', attributes: 'Post Details', types: ['Main Gate', 'Restricted Zone', 'Parking Zone', 'Watch Tower', 'Reception', 'Loading Bay', 'Emergency Exit', 'Utility Zone'] },
        staff: { singular: 'Security Guard', plural: 'Security Guards', code: 'Guard ID', roles: ['Security Guard', 'Patrol Supervisor', 'Gate Officer', 'Control Room Operator'] },
        customer: { singular: 'Site Client', plural: 'Site Clients', contactRoles: ['Site Client', 'Facility Head'] },
        visit: { singular: 'Patrol Round', plural: 'Patrol Beats', verb: 'Patrol completed at', types: ['Perimeter Patrol', 'NFC Checkpoint Scan', 'Incident Response', 'Visitor Escort', 'Shift Handover'], notes: 'Patrol Log', recommendations: 'Follow-up Actions' },
        task: { singular: 'Patrol Task', plural: 'Today Patrol Beats', newLabel: 'New Patrol Task' },
        approval: { plural: 'Pending Incident Reports', doc: 'Post orders & site security agreement', approve: 'Approve Checkpoint', reject: 'Reject Checkpoint' },
        finance: { group: 'Payroll & Finance', scores: 'Guard Scores', payments: 'Payroll', paymentTypes: ['salary', 'night_shift_allowance', 'overtime', 'incentive'] },
        monitor: { title: 'Live Guard Map', onDuty: 'Guards on Patrol', atSite: 'At post' },
        alerts: { title: 'Security Incidents' },
        score: { metric: 'Patrols', target: 'Monthly patrol target' },
    },
    cleaning: {
        entity: { singular: 'Clean Zone', plural: 'Clean Zones', code: 'Zone ID', type: 'Zone Type', size: 'Area', sizeUnit: 'sq.ft', attributes: 'Zone Details', types: ['Healthcare Zone', 'Food Zone', 'Restroom', 'Specialised', 'Office Zone', 'Common Area'] },
        staff: { singular: 'Janitor', plural: 'Janitor Staff', code: 'Janitor ID', roles: ['Janitor', 'Cleaning Supervisor', 'Deep Clean Specialist', 'Scrubber Operator'] },
        customer: { singular: 'Facility Client', plural: 'Facility Clients', contactRoles: ['Facility Client', 'Admin Manager'] },
        visit: { singular: 'Cleaning Round', plural: 'Cleaning Rounds', verb: 'Cleaning completed at', types: ['Deep Clean', 'Steam Sanitisation', 'QR Washroom Audit', 'Bio-waste Pickup', 'Façade Wash'], notes: 'Round Notes', recommendations: 'Follow-up Actions' },
        task: { singular: 'Cleaning Task', plural: 'Today Cleaning Rounds', newLabel: 'New Cleaning Task' },
        approval: { plural: 'Pending QA Reviews', doc: 'Cleaning scope & SLA agreement', approve: 'Approve Zone', reject: 'Reject Zone' },
        finance: { group: 'Payroll & Finance', scores: 'Janitor Scores', payments: 'Payroll', paymentTypes: ['salary', 'shift_allowance', 'overtime', 'incentive'] },
        monitor: { title: 'Live Janitor Map', onDuty: 'Janitors on Shift', atSite: 'At zone' },
        alerts: { title: 'Cleaning Alerts' },
        score: { metric: 'Rounds', target: 'Monthly round target' },
    },
    maintenance: {
        entity: { singular: 'Equipment Asset', plural: 'Machinery Assets', code: 'Asset ID', type: 'Asset Type', size: 'Capacity', sizeUnit: 'kVA/TR', attributes: 'Asset Details', types: ['Diesel Generator', 'Chiller', 'Elevator', 'Electrical Panel', 'Fire System', 'UPS', 'Cooling Tower', 'STP'] },
        staff: { singular: 'Technician', plural: 'MEP Technicians', code: 'Technician ID', roles: ['MEP Technician', 'Electrical Supervisor', 'HVAC Technician', 'Plumber'] },
        customer: { singular: 'Facility Client', plural: 'Facility Clients', contactRoles: ['Facility Client', 'Plant Manager'] },
        visit: { singular: 'Work Order', plural: 'Work Orders', verb: 'Work order closed at', types: ['Preventive Maintenance', 'Breakdown Repair', 'Load Bank Test', 'Thermography Scan', 'Calibration'], notes: 'Technician Report', recommendations: 'Recommended Actions' },
        task: { singular: 'PM Task', plural: 'Preventive Work Orders', newLabel: 'New Work Order' },
        approval: { plural: 'Pending Work Orders', doc: 'Asset register & AMC contract', approve: 'Approve Asset', reject: 'Reject Asset' },
        finance: { group: 'Payroll & Finance', scores: 'Technician Scores', payments: 'Payroll', paymentTypes: ['salary', 'on_call_allowance', 'overtime', 'incentive'] },
        monitor: { title: 'Live Technician Map', onDuty: 'Technicians on Duty', atSite: 'At asset' },
        alerts: { title: 'Equipment Alerts' },
        score: { metric: 'Work Orders', target: 'Monthly work order target' },
    },
    solar: {
        entity: { singular: 'PV Array Block', plural: 'PV Array Blocks', code: 'Array ID', type: 'Array Type', size: 'Capacity', sizeUnit: 'kWp', attributes: 'Array Details', types: ['Tracker Array', 'Fixed-tilt Array', 'Rooftop', 'Inverter Station', 'Substation', 'Telemetry'] },
        staff: { singular: 'Solar Technician', plural: 'Solar Technicians', code: 'Technician ID', roles: ['PV Technician', 'Plant Engineer', 'Drone Pilot', 'Electrical Supervisor'] },
        customer: { singular: 'Plant Owner', plural: 'Plant Owners', contactRoles: ['Plant Owner', 'Asset Manager'] },
        visit: { singular: 'Array Audit', plural: 'Array Audits', verb: 'Audit completed at', types: ['Array Audit', 'Inverter Inspection', 'Drone Thermography', 'Panel Cleaning', 'Tracker Calibration'], notes: 'Audit Findings', recommendations: 'Recommended Actions' },
        task: { singular: 'Field Task', plural: 'Today Field Maintenance', newLabel: 'New Field Task' },
        approval: { plural: 'Pending Inverter Alarms', doc: 'Grid connectivity & commissioning certificate', approve: 'Approve Array', reject: 'Reject Array' },
        finance: { group: 'Payroll & Finance', scores: 'Technician Scores', payments: 'Payroll', paymentTypes: ['salary', 'site_allowance', 'overtime', 'performance_bonus'] },
        monitor: { title: 'Live Field Map', onDuty: 'Technicians on Site', atSite: 'At array' },
        alerts: { title: 'Plant Alerts' },
        score: { metric: 'Audits', target: 'Monthly audit target' },
    },
    pest_control: {
        entity: { singular: 'Client Site', plural: 'Bait Grids', code: 'Grid ID', type: 'Facility Type', size: 'Bait Stations', sizeUnit: 'stations', attributes: 'Treatment Details', types: ['Food Facility', 'Warehouse', 'Hospitality', 'Residential', 'Pharma Facility', 'Institution', 'Storage'] },
        staff: { singular: 'Exterminator', plural: 'Field Exterminators', code: 'Technician ID', roles: ['Pest Control Technician', 'Licensed Applicator', 'Field Supervisor', 'Hygiene Inspector'] },
        customer: { singular: 'Client', plural: 'Clients', contactRoles: ['Client Facility', 'Quality Manager'] },
        visit: { singular: 'Treatment', plural: 'Treatment Beats', verb: 'Treatment completed at', types: ['Cold Fogging', 'Bait Station Check', 'Termite Treatment', 'Fumigation', 'Compliance Audit'], notes: 'Treatment Report', recommendations: 'Recommendations' },
        task: { singular: 'Treatment Task', plural: 'Today Treatment Beats', newLabel: 'New Treatment Task' },
        approval: { plural: 'Pending Treatment Permits', doc: 'Service contract & chemical MSDS', approve: 'Approve Site', reject: 'Reject Site' },
        finance: { group: 'Payroll & Finance', scores: 'Technician Scores', payments: 'Payroll', paymentTypes: ['salary', 'chemical_handling_allowance', 'overtime', 'incentive'] },
        monitor: { title: 'Live Technician Map', onDuty: 'Exterminators on Duty', atSite: 'At client site' },
        alerts: { title: 'Pest Activity Alerts' },
        score: { metric: 'Treatments', target: 'Monthly treatment target' },
    },
    logistics: {
        entity: { singular: 'Route Hub', plural: 'Route Hubs', code: 'Hub ID', type: 'Hub Type', size: 'Capacity', sizeUnit: 'drops/day', attributes: 'Hub Details', types: ['Fulfilment Hub', 'Last-mile Depot', 'Customer Drop', 'Micro Hub', 'Pickup Point', 'Returns Hub', 'Line-haul Yard'] },
        staff: { singular: 'Driver', plural: 'Fleet Drivers', code: 'Driver ID', roles: ['Delivery Driver', 'Fleet Supervisor', 'Dispatch Coordinator', 'Loader'] },
        customer: { singular: 'Consignee', plural: 'Consignees', contactRoles: ['Consignee', 'Shipper'] },
        visit: { singular: 'Delivery Drop', plural: 'Delivery Drops', verb: 'Drop completed at', types: ['Delivery Drop', 'Pickup', 'Return / RTV', 'Cold-chain Drop', 'Vehicle Inspection'], notes: 'Drop Notes', recommendations: 'Follow-up Actions' },
        task: { singular: 'Delivery Task', plural: 'Today Delivery Drops', newLabel: 'New Delivery Task' },
        approval: { plural: 'Pending Exceptions', doc: 'Hub agreement & route permit', approve: 'Approve Hub', reject: 'Reject Hub' },
        finance: { group: 'Payroll & Finance', scores: 'Driver Scores', payments: 'Payroll', paymentTypes: ['salary', 'trip_allowance', 'fuel_reimbursement', 'incentive'] },
        monitor: { title: 'Live Fleet Map', onDuty: 'Drivers on Route', atSite: 'At hub' },
        alerts: { title: 'Fleet Alerts' },
        score: { metric: 'Drops', target: 'Monthly drop target' },
    },
};

export const INDUSTRY_VOCAB = V;

export const getVocab = (id) => V[id] || V.real_estate;

/** "night_shift_allowance" → "Night Shift Allowance" */
export const humanize = (s) => String(s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

