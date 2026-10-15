export type CustomerType = 'both' | 'crop' | 'fertilizer';

export interface Farmer {
  id: string;
  name: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  farmArea: string;
  cropType: string;
  customerType: CustomerType;
  cropDetails?: string;
  fertilizerDetails?: string;
  recentOrder?: string;
  photo?: string;
}

export interface Visit {
  id: string;
  farmerId: string;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'upcoming';
  visitFrequency: string;
  previousVisitDate?: string;
  remarks?: string;
  report?: {
    cropCondition: string;
    notes: string;
    photos: string[];
    recommendations: string;
  }
}

export const mockFarmers: Farmer[] = [
  {
    id: 'f1',
    name: 'Metro Corporate Tower A',
    phone: '+91 98765 43210',
    address: 'Commercial Business District, Tower A, Sector 4',
    latitude: 10.9930,
    longitude: 76.8220,
    farmArea: '45,000 Sq. Ft',
    cropType: 'HVAC & Electrical Maintenance',
    customerType: 'both',
    cropDetails: 'Chilled Water HVAC System (4 AHUs) + High-Tension Substation',
    fertilizerDetails: 'Quarterly Air Filter Replacement & Refrigerant Top-up',
    recentOrder: 'HVAC Filter Replacements & Sensor Calibration (Completed)',
    photo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'f2',
    name: 'Apex Logistics Park',
    phone: '+91 87654 32109',
    address: 'National Highway Cargo Zone, Block B, Warehouse 3',
    latitude: 10.6620,
    longitude: 77.0060,
    farmArea: '120,000 Sq. Ft',
    cropType: 'Fire Safety & Industrial Cleaning',
    customerType: 'fertilizer',
    cropDetails: 'Automated Fire Sprinkler Grid & Smoke Detection System',
    fertilizerDetails: 'Industrial Heavy Duty Scrubber Consumables & Degreasers',
    recentOrder: 'Fire Extinguisher Hydrostatic Recertification (In Progress)',
    photo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'f3',
    name: 'Grand Horizon Mall',
    phone: '+91 76543 21098',
    address: 'Central Retail District, Main Atrium & Basement Levels',
    latitude: 10.8170,
    longitude: 77.0140,
    farmArea: '85,000 Sq. Ft',
    cropType: 'Integrated Facility Management',
    customerType: 'crop',
    cropDetails: 'Escalators, Elevators, Central Cooling, Security Access Control',
    fertilizerDetails: 'Housekeeping Chemicals & Restroom Sanitation Supplies',
    recentOrder: 'Monthly Elevator Safety Inspection (Passed)',
    photo: 'https://images.unsplash.com/photo-1519643381401-22c77e60520e?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'f4',
    name: 'TechPark Innovation Hub',
    phone: '+91 65432 10987',
    address: 'Cyber Heights, Block D, Software Park Phase 2',
    latitude: 11.0260,
    longitude: 77.1260,
    farmArea: '60,000 Sq. Ft',
    cropType: 'BMS & Energy Management',
    customerType: 'both',
    cropDetails: 'Building Management System (BMS) & UPS Power Backup 500kVA',
    fertilizerDetails: 'Battery Bank Testing & Clean Agent Fire Suppression',
    recentOrder: 'UPS Battery Bank Impedance Testing (Completed)',
    photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'f5',
    name: 'Skyline Luxury Residences',
    phone: '+91 94444 12345',
    address: 'Park Avenue Enclave, Clubhouse & Residential Towers',
    latitude: 10.5840,
    longitude: 77.2480,
    farmArea: '90,000 Sq. Ft',
    cropType: 'Plumbing, Water Treatment & Landscaping',
    customerType: 'fertilizer',
    cropDetails: 'Sewage Treatment Plant (STP) & RO Water Purification Grid',
    fertilizerDetails: 'STP Bio-Cultures & Water Softening Salt Pellets',
    recentOrder: 'STP Water Quality Testing & Chlorine Dosing (Delivered)',
    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'f6',
    name: 'Apollo Medical Research Center',
    phone: '+91 94555 67890',
    address: 'Healthcare Boulevard, Diagnostic Wing & Cleanrooms',
    latitude: 10.7870,
    longitude: 79.1378,
    farmArea: '35,000 Sq. Ft',
    cropType: 'Cleanroom HVAC & Bio-Hazard Waste Management',
    customerType: 'both',
    cropDetails: 'HEPA Positive Pressure Filtration & Medical Gas Pipeline',
    fertilizerDetails: 'Hospital Grade Disinfectants & Autoclave Consumables',
    recentOrder: 'HEPA Filter DOP Leak Testing (Certified)',
    photo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=150&auto=format&fit=crop&q=80',
  }
];

export const mockVisits: Visit[] = [
  {
    id: 'v1',
    farmerId: 'f1',
    date: 'Aug 12, 2025',
    time: '10:30 AM',
    status: 'pending',
    visitFrequency: 'Every 15 Days',
    previousVisitDate: 'Jul 28, 2025',
    remarks: 'Routine preventive maintenance on AHU-4 and chiller temperature logging.',
  },
  {
    id: 'v2',
    farmerId: 'f2',
    date: 'Aug 12, 2025',
    time: '01:00 PM',
    status: 'pending',
    visitFrequency: 'Every 30 Days',
    previousVisitDate: 'Jul 12, 2025',
    remarks: 'Fire sprinkler pump flow test and diesel generator load testing.',
  },
  {
    id: 'v3',
    farmerId: 'f3',
    date: 'Aug 12, 2025',
    time: '03:30 PM',
    status: 'upcoming',
    visitFrequency: 'Every 15 Days',
    previousVisitDate: 'Jul 28, 2025',
    remarks: 'Escalator comb plate alignment and emergency stop audit.',
  },
  {
    id: 'v4',
    farmerId: 'f4',
    date: 'Aug 05, 2025',
    time: '11:00 AM',
    status: 'completed',
    visitFrequency: 'Every 15 Days',
    previousVisitDate: 'Jul 20, 2025',
    remarks: 'UPS load bank test and main electrical breaker thermal scan.',
    report: {
      cropCondition: 'Optimal / Green',
      notes: 'Main distribution breaker thermography normal. Temperatures within 38°C SLA limits.',
      photos: ['https://example.com/photo1.jpg'],
      recommendations: 'Replace secondary air intake filters on Floor 2 next week.'
    }
  }
];

export const getVisitWithFarmer = (visitId: string) => {
  const cleanId = String(visitId || "");
  const visit =
    mockVisits.find(
      (v) =>
        v.id === cleanId ||
        v.id === `v${cleanId}` ||
        v.id.replace("v", "") === cleanId
    ) || mockVisits[0];

  const farmer =
    mockFarmers.find((f) => f.id === visit?.farmerId) || mockFarmers[0];

  return { ...visit, farmer };
};

export const getTodayVisits = () => {
  const today = 'Aug 12, 2025';
  return mockVisits
    .filter(v => v.date === today)
    .map(v => ({ ...v, farmer: mockFarmers.find(f => f.id === v.farmerId) }));
};

export const dashboardStats = {
  totalVisits: 3,
  completed: 2,
  pending: 1,
  adminTarget: {
    monthlyGoal: 50,
    currentProgress: 35,
    message: "You're 70% towards your monthly goal!"
  },
  attendance: {
    clockIn: '08:45 AM',
    status: 'Present',
    location: 'Coimbatore Hub'
  }
};

export const employeeProfile = {
  name: 'Ramesh Kumar',
  role: 'Field Officer',
  id: 'EMP1008',
  phone: '+91 98765 43210',
  email: 'ramesh.kumar@infinity.com',
  department: 'Field Operations'
};
