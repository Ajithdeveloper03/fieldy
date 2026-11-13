export type ServiceKey =
  | "real_estate"
  | "facility_fmcg"
  | "construction"
  | "security"
  | "cleaning"
  | "maintenance"
  | "solar"
  | "pest_control"
  | "logistics";

export interface ServiceEntity {
  id: string | number;
  code: string;
  name: string;
  type: string;
  size: number | string;
  sizeUnit: string;
  address: string;
  area: string;
  city: string;
  contactName: string;
  contactRole: string;
  contactPhone: string;
  status: "verified" | "pending" | "flagged";
  image: any;
  attributes: string[];
}

export interface ServiceVisit {
  id: string | number;
  code: string;
  type: string;
  entityName: string;
  site?: string;
  time: string;
  status: "Completed" | "In Progress" | "Pending";
  image: any;
  address: string;
  notes: string;
  rating?: number;
  otpRequired?: boolean;
}

export interface ServiceTask {
  id: string | number;
  workOrderCode: string;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Urgent" | "Low";
  status: "Pending" | "In Progress" | "Completed";
  due: string;
  points: number;
  targetEntity: string;
  facility?: string;
  aiDiagnostic: string;
  checklist: string[];
}

export interface ServiceDefinition {
  key: ServiceKey;
  serviceKey: ServiceKey;
  name: string;
  label: string;
  shortName: string;
  tagline: string;
  badge: string;
  heroImage: string;
  themeColor: string;
  color: string;
  accentColor: string;
  lightBg: string;
  borderTint: string;
  gradient: [string, string, string];
  vocab: {
    entity: string;
    entities: string;
    entitySingular: string;
    staffRole: string;
    customerRole: string;
    visit: string;
    visits: string;
    visitSingular: string;
    task: string;
    tasks: string;
    taskSingular: string;
    report: string;
    sizeUnit: string;
    approvalDoc: string;
    telemetryLabel: string;
  };
  kpis: {
    primaryNumber: string;
    primaryLabel: string;
    secondaryNumber: string;
    secondaryLabel: string;
    efficiencyRate: string;
    points: string;
  };
  telemetryCard: {
    title1: string;
    metric1: string;
    sub1: string;
    status1: string;
    status1Color: string;
    title2: string;
    metric2: string;
    sub2: string;
    status2: string;
    status2Color: string;
    primaryTitle: string;
    primaryMetric: string;
    secondaryTitle: string;
    secondaryMetric: string;
  };
  sampleEntities: ServiceEntity[];
  sampleVisits: ServiceVisit[];
  sampleTasks: ServiceTask[];
  quickActions: Array<{
    title: string;
    subtitle: string;
    icon: string;
    route: string;
    color: string;
    bg: string;
  }>;
}

const RAW_SERVICES_CONFIG: Record<ServiceKey, any> = {
  real_estate: {
    key: "real_estate",
    name: "Real Estate & Housing",
    tagline: "Property tours, site visits & land checks",
    badge: "REAL ESTATE",
    heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
    themeColor: "#0284c7",
    accentColor: "#38bdf8",
    lightBg: "#f0f9ff",
    borderTint: "#bae6fd",
    gradient: ["#082f49", "#0c4a6e", "#0369a1"],
    vocab: {
      entity: "Property",
      entities: "Properties",
      entitySingular: "Plot / Unit",
      staffRole: "Property Advisor",
      customerRole: "Buyer / Investor",
      visit: "Site Showing",
      visits: "Client Tours",
      task: "Allotment Milestone",
      tasks: "Sales Orders",
      report: "Inspection Dossier",
      sizeUnit: "sq.ft",
      approvalDoc: "Title Deed & RERA Certificate",
      telemetryLabel: "Showing Pipeline",
    },
    kpis: {
      primaryNumber: "24",
      primaryLabel: "Active Listings",
      secondaryNumber: "8",
      secondaryLabel: "Tours Today",
      efficiencyRate: "92%",
      points: "640 PTS",
    },
    telemetryCard: {
      title1: "Skyline Villa #14",
      metric1: "3,200 sq.ft",
      sub1: "Client: Ramesh & Family",
      status1: "Showing at 11:30 AM",
      status1Color: "#0284c7",
      title2: "Green Valley Ph 2",
      metric2: "96 Units",
      sub2: "RERA Reg #4921",
      status2: "Allotment In Progress",
      status2Color: "#16a34a",
    },
    sampleEntities: [
      {
        id: "1",
        code: "PRP-0101",
        name: "Skyline Villa Plot #14",
        type: "Gated Villa Plot",
        size: 2400,
        sizeUnit: "sq.ft",
        address: "Anna Nagar West, Chennai",
        area: "Anna Nagar",
        city: "Chennai",
        contactName: "Karthik Subramanian",
        contactRole: "Prospective Buyer",
        contactPhone: "+91 98401 23456",
        status: "verified",
        image: require("../assets/images/image5.jpg"),
        attributes: ["DTCP Approved", "Corner Plot", "North Facing"],
      },
      {
        id: "2",
        code: "PRP-0102",
        name: "Green Valley Phase 2 – Block A",
        type: "Residential Apartment Tower",
        size: 48000,
        sizeUnit: "sq.ft",
        address: "OMR Sholinganallur, Chennai",
        area: "OMR IT Corridor",
        city: "Chennai",
        contactName: "Divya Natarajan",
        contactRole: "Investor",
        contactPhone: "+91 98402 34567",
        status: "verified",
        image: require("../assets/images/image2.jpg"),
        attributes: ["RERA Registered", "96 Units", "Clubhouse Included"],
      },
      {
        id: "3",
        code: "PRP-0103",
        name: "Downtown Commercial Penthouse",
        type: "Commercial Office Suite",
        size: 5200,
        sizeUnit: "sq.ft",
        address: "T. Nagar Commercial Hub, Chennai",
        area: "T. Nagar",
        city: "Chennai",
        contactName: "Senthil Kumar",
        contactRole: "Corporate Tenant",
        contactPhone: "+91 98403 45678",
        status: "pending",
        image: require("../assets/images/image6.jpg"),
        attributes: ["Sea View", "10 Car Parks", "Ready to Occupy"],
      },
    ],
    sampleVisits: [
      {
        id: "1",
        code: "SV-3001",
        type: "CLIENT SHOWING",
        entityName: "Skyline Villa Plot #14",
        time: "10:30 AM",
        status: "In Progress",
        image: require("../assets/images/image5.jpg"),
        address: "Anna Nagar West, Chennai",
        notes: "Buyer walked through model villa; requested revised payment plan.",
        rating: 5,
        otpRequired: true,
      },
      {
        id: "2",
        code: "SV-3002",
        type: "RERA BOUNDARY SURVEY",
        entityName: "Green Valley Ph 2",
        time: "02:00 PM",
        status: "Pending",
        image: require("../assets/images/image2.jpg"),
        address: "OMR Sholinganallur",
        notes: "Demarcation stones verification with site engineer.",
        otpRequired: true,
      },
    ],
    sampleTasks: [
      {
        id: "1",
        workOrderCode: "RE-5001",
        title: "Model Villa Walkthrough & Price Presentation",
        description: "Walk buyer through 3BHK duplex layout, showcase amenities, and explain bank financing schemes.",
        priority: "High",
        status: "In Progress",
        due: "Today, 11:30 AM",
        points: 40,
        targetEntity: "Skyline Villa Plot #14",
        aiDiagnostic: "Highlight 14% capital appreciation in sector over 24 months and clear DTCP clearance.",
        checklist: ["Check model villa cleanliness", "Present updated payment schedule", "Verify buyer Aadhaar KYC"],
      },
      {
        id: "2",
        workOrderCode: "RE-5002",
        title: "Allotment Letter & Agreement Sign-off",
        description: "Collect client signatures on RERA allotment agreement and submit copy to legal desk.",
        priority: "Urgent",
        status: "Pending",
        due: "Today, 4:00 PM",
        points: 50,
        targetEntity: "Green Valley Block A",
        aiDiagnostic: "Ensure Stamp Duty calculation matches the updated 2026 Tamil Nadu guideline rate.",
        checklist: ["Verify all initials on pages 1-18", "Collect PAN copy", "OTP customer confirmation"],
      },
    ],
    quickActions: [
      { title: "Schedule\nTour", subtitle: "Book showing", icon: "Calendar", route: "/(employee)/visits", color: "#0284c7", bg: "#e0f2fe" },
      { title: "Onboard\nProperty", subtitle: "Register plot", icon: "UserPlus", route: "/(employee)/register-site/step1", color: "#16a34a", bg: "#dcfce7" },
      { title: "Allotment\nOrders", subtitle: "Active deals", icon: "ClipboardCheck", route: "/(employee)/tasks", color: "#8b5cf6", bg: "#ede9fe" },
      { title: "Client\nDossier", subtitle: "RERA docs", icon: "FileText", route: "/(employee)/reports", color: "#f59e0b", bg: "#fef3c7" },
    ],
  },

  facility_fmcg: {
    key: "facility_fmcg",
    name: "Facility & FMCG Operations",
    tagline: "Property care, hygiene & store checks",
    badge: "FACILITY",
    heroImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80",
    themeColor: "#16a34a",
    accentColor: "#4ade80",
    lightBg: "#f0fdf4",
    borderTint: "#bbf7d0",
    gradient: ["#064e3b", "#065f46", "#047857"],
    vocab: {
      entity: "Facility Bay",
      entities: "Facility Bays",
      entitySingular: "Bay / Wing",
      staffRole: "Housekeeping Supervisor",
      customerRole: "Facility Client",
      visit: "Hygiene Audit",
      visits: "Sanitisation Rounds",
      task: "Work Order",
      tasks: "Hygiene Tasks",
      report: "Audit Certificate",
      sizeUnit: "sq.ft",
      approvalDoc: "Facility SLA & SOP Agreement",
      telemetryLabel: "Odour Sensor Telemetry",
    },
    kpis: {
      primaryNumber: "38",
      primaryLabel: "Staff On Duty",
      secondaryNumber: "14",
      secondaryLabel: "Bays Audited",
      efficiencyRate: "96%",
      points: "520 PTS",
    },
    telemetryCard: {
      title1: "Restroom Wing A (L2)",
      metric1: "0.02 ppm",
      sub1: "Smart Odour Sensor: Optimal",
      status1: "Audited 15m ago",
      status1Color: "#16a34a",
      title2: "FMCG Chiller Bay #4",
      metric2: "86 SKUs",
      sub2: "Planogram Restock: 98%",
      status2: "Cold Chain Active",
      status2Color: "#0284c7",
    },
    sampleEntities: [
      {
        id: "1",
        code: "BAY-0101",
        name: "Phoenix Mall – Restroom Wing A",
        type: "High-Footfall Restroom Hub",
        size: 1800,
        sizeUnit: "sq.ft",
        address: "Velachery Main Road, Chennai",
        area: "Velachery",
        city: "Chennai",
        contactName: "Priya Murugan",
        contactRole: "Facility Ops Head",
        contactPhone: "+91 98404 56789",
        status: "verified",
        image: require("../assets/images/image5.jpg"),
        attributes: ["12 Cubicles", "IoT Ammonia Sensor", "Auto Dosing Units"],
      },
      {
        id: "2",
        code: "BAY-0102",
        name: "Tidel Park – Executive Pantry L5",
        type: "Corporate Pantry & Lounge",
        size: 900,
        sizeUnit: "sq.ft",
        address: "Taramani High Road, Chennai",
        area: "Taramani",
        city: "Chennai",
        contactName: "Arun Krishnan",
        contactRole: "Site Admin Manager",
        contactPhone: "+91 98405 67890",
        status: "verified",
        image: require("../assets/images/image3.jpg"),
        attributes: ["Coffee Restock", "UV Cutlery Steriliser", "Waste Segregated"],
      },
    ],
    sampleVisits: [
      {
        id: "1",
        code: "HA-3001",
        type: "HYGIENE & ATP AUDIT",
        entityName: "Phoenix Mall – Restroom Wing A",
        time: "09:00 AM",
        status: "Completed",
        image: require("../assets/images/image5.jpg"),
        address: "Velachery Main Road",
        notes: "ATP swab passed at 12 RLU. Odour levels well below threshold.",
        rating: 5,
        otpRequired: true,
      },
      {
        id: "2",
        code: "HA-3002",
        type: "SHELF REPLENISHMENT",
        entityName: "Bay 4 – FMCG Personal Care",
        time: "11:30 AM",
        status: "In Progress",
        image: require("../assets/images/image1.jpg"),
        address: "Central Distribution Centre",
        notes: "Restocked 18 promotional SKUs. Facing completed.",
        otpRequired: true,
      },
    ],
    sampleTasks: [
      {
        id: "1",
        workOrderCode: "FM-5001",
        title: "Deep Sanitisation & Ammonia Sensor Reset",
        description: "Scrub floor tiles, replenish foam soap cartridges, and log IoT telemetry reading.",
        priority: "High",
        status: "In Progress",
        due: "Today, 1:00 PM",
        points: 40,
        targetEntity: "Phoenix Mall Wing A",
        aiDiagnostic: "Peak footfall expected between 1:00 PM and 3:00 PM. Pre-load consumables now.",
        checklist: ["Check soap dispensers", "Verify air freshener battery", "Log ATP surface swab"],
      },
    ],
    quickActions: [
      { title: "Hygiene\nAudit", subtitle: "Log swab test", icon: "ClipboardCheck", route: "/(employee)/tasks", color: "#16a34a", bg: "#dcfce7" },
      { title: "Onboard\nBay", subtitle: "New facility", icon: "UserPlus", route: "/(employee)/register-site/step1", color: "#0284c7", bg: "#e0f2fe" },
      { title: "Restock\nOrder", subtitle: "FMCG inventory", icon: "Boxes", route: "/(employee)/inventory", color: "#ca8a04", bg: "#fef08a" },
      { title: "Shift\nLogs", subtitle: "Roster review", icon: "History", route: "/(employee)/reports", color: "#7c3aed", bg: "#ede9fe" },
    ],
  },

  construction: {
    key: "construction",
    name: "Construction Management",
    tagline: "Site work, safety checks & progress",
    badge: "BUILD",
    heroImage: "https://images.unsplash.com/photo-1541888946425-d0fbb186156a?w=900&auto=format&fit=crop&q=80",
    themeColor: "#ea580c",
    accentColor: "#fb923c",
    lightBg: "#fff7ed",
    borderTint: "#fed7aa",
    gradient: ["#7c2d12", "#9a3412", "#c2410c"],
    vocab: {
      entity: "Project Site",
      entities: "Project Sites",
      entitySingular: "Site / Sector",
      staffRole: "Site Engineer",
      customerRole: "Project Owner",
      visit: "Site Inspection",
      visits: "Quality Audits",
      task: "Work Order",
      tasks: "Structural Tasks",
      report: "Inspection Certificate",
      sizeUnit: "sq.m",
      approvalDoc: "Structural Drawing & Building Permit",
      telemetryLabel: "Concrete Curing & Wind Telemetry",
    },
    kpis: {
      primaryNumber: "18",
      primaryLabel: "Active Piers",
      secondaryNumber: "4",
      secondaryLabel: "Pours Today",
      efficiencyRate: "94%",
      points: "580 PTS",
    },
    telemetryCard: {
      title1: "Tower B – Level 4 Slab",
      metric1: "110 mm Slump",
      sub1: "Transit Mixer #08 Ready",
      status1: "Pouring in 25 mins",
      status1Color: "#ea580c",
      title2: "Tower Crane #2 Anemometer",
      metric2: "22 km/h Wind",
      sub2: "Permissible Safe Limit: 38 km/h",
      status2: "Lifting Operations Safe",
      status2Color: "#16a34a",
    },
    sampleEntities: [
      {
        id: "1",
        code: "SITE-0101",
        name: "Tower B – Residential High-Rise",
        type: "G+22 High-Rise Structure",
        size: 18500,
        sizeUnit: "sq.m",
        address: "Whitefield Hope Farm, Bengaluru",
        area: "Whitefield",
        city: "Bengaluru",
        contactName: "Manoj Pandian",
        contactRole: "Project Director",
        contactPhone: "+91 98406 78901",
        status: "verified",
        image: require("../assets/images/image2.jpg"),
        attributes: ["Level 4 Slab In Progress", "M30 Mix Design", "Tower Crane Online"],
      },
      {
        id: "2",
        code: "SITE-0102",
        name: "Metro Viaduct Pier P-14",
        type: "Urban Infrastructure Pier",
        size: 1200,
        sizeUnit: "sq.m",
        address: "Electronic City Expressway, Bengaluru",
        area: "Electronic City",
        city: "Bengaluru",
        contactName: "Anitha Selvam",
        contactRole: "Chief Metro Engineer",
        contactPhone: "+91 98407 89012",
        status: "verified",
        image: require("../assets/images/image5.jpg"),
        attributes: ["Night Pour Scheduled", "Pier Cap Inspection", "Curing Sensors On"],
      },
    ],
    sampleVisits: [
      {
        id: "1",
        code: "INS-3001",
        type: "REBAR SPACING & COVER AUDIT",
        entityName: "Tower B – Level 4 Slab",
        time: "08:30 AM",
        status: "Completed",
        image: require("../assets/images/image2.jpg"),
        address: "Whitefield Hope Farm",
        notes: "Verified cover blocks (25mm) and top chair rebar alignment.",
        rating: 5,
        otpRequired: true,
      },
      {
        id: "2",
        code: "INS-3002",
        type: "CONCRETE SLUMP VERIFICATION",
        entityName: "Metro Viaduct Pier P-14",
        time: "11:45 AM",
        status: "In Progress",
        image: require("../assets/images/image5.jpg"),
        address: "Electronic City Expressway",
        notes: "Slump tested at 110mm; transit mixer cubes cast for 28-day testing.",
        otpRequired: true,
      },
    ],
    sampleTasks: [
      {
        id: "1",
        workOrderCode: "CN-5001",
        title: "Rebar Cover & Chair Inspection",
        description: "Check bar diameters, lap splice lengths, and chair spacing before concrete pour sign-off.",
        priority: "Urgent",
        status: "In Progress",
        due: "Today, 10:00 AM",
        points: 50,
        targetEntity: "Tower B Level 4",
        aiDiagnostic: "Ensure edge beam reinforcement ties are doubled to prevent shifting under boom vibration.",
        checklist: ["Check 25mm PVC cover blocks", "Verify 40D lap lengths", "Sign concrete pour card"],
      },
    ],
    quickActions: [
      { title: "Inspect\nRebar", subtitle: "Slump & cover", icon: "ClipboardCheck", route: "/(employee)/tasks", color: "#ea580c", bg: "#ffedd5" },
      { title: "Register\nSite", subtitle: "Onboard project", icon: "UserPlus", route: "/(employee)/register-site/step1", color: "#0284c7", bg: "#e0f2fe" },
      { title: "Daily\nLogs", subtitle: "Cube tests", icon: "FileText", route: "/(employee)/reports", color: "#16a34a", bg: "#dcfce7" },
      { title: "Site\nSOS", subtitle: "Safety hazard", icon: "AlertOctagon", route: "/(employee)/sos", color: "#ef4444", bg: "#fee2e2" },
    ],
  },

  security: {
    key: "security",
    name: "Security Guard Fleet & Patrol",
    tagline: "Guard patrols, checkpoint scans & alerts",
    badge: "SECURITY",
    heroImage: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=900&auto=format&fit=crop&q=80",
    themeColor: "#475569",
    accentColor: "#94a3b8",
    lightBg: "#f8fafc",
    borderTint: "#cbd5e1",
    gradient: ["#0f172a", "#1e293b", "#334155"],
    vocab: {
      entity: "Security Checkpoint",
      entities: "Checkpoints & Gates",
      entitySingular: "Checkpoint",
      staffRole: "Security Guard",
      customerRole: "Site Client",
      visit: "Patrol Beat",
      visits: "Checkpoint Scans",
      task: "Patrol Work Order",
      tasks: "Patrol Beats",
      report: "Incident Log",
      sizeUnit: "NFC tags",
      approvalDoc: "Post Orders & Security Agreement",
      telemetryLabel: "Guard Live Radar",
    },
    kpis: {
      primaryNumber: "28",
      primaryLabel: "NFC Scans",
      secondaryNumber: "100%",
      secondaryLabel: "Fence Armed",
      efficiencyRate: "99%",
      points: "490 PTS",
    },
    telemetryCard: {
      title1: "North Perimeter Gate",
      metric1: "NFC Tag #01",
      sub1: "Boom Barrier & CCTV Active",
      status1: "Scanned 4m ago",
      status1Color: "#16a34a",
      title2: "Vault Access Restricted",
      metric2: "Dual Biometric",
      sub2: "Armoured Door Interlock",
      status2: "0 Incidents",
      status2Color: "#0284c7",
    },
    sampleEntities: [
      {
        id: "1",
        code: "CHK-0101",
        name: "North Perimeter Gate",
        type: "Heavy Vehicle Access Point",
        size: 4,
        sizeUnit: "NFC tags",
        address: "Guindy Industrial Estate, Chennai",
        area: "Guindy",
        city: "Chennai",
        contactName: "Lakshmi Ganesh",
        contactRole: "Chief Security Officer",
        contactPhone: "+91 98408 90123",
        status: "verified",
        image: require("../assets/images/image1.jpg"),
        attributes: ["Boom Barrier Online", "Thermal CCTV Covered", "ANPR Camera"],
      },
      {
        id: "2",
        code: "CHK-0102",
        name: "Data Centre Vault Entry",
        type: "Level 4 Restricted Zone",
        size: 6,
        sizeUnit: "NFC tags",
        address: "OMR Cyber Park, Chennai",
        area: "OMR",
        city: "Chennai",
        contactName: "Vignesh Velu",
        contactRole: "Data Centre Manager",
        contactPhone: "+91 98409 01234",
        status: "verified",
        image: require("../assets/images/image3.jpg"),
        attributes: ["Biometric Verification", "Interlock Mantrap", "Armed Guard Post"],
      },
    ],
    sampleVisits: [
      {
        id: "1",
        code: "PTL-3001",
        type: "PERIMETER PATROL ROUND",
        entityName: "North Perimeter Gate",
        time: "07:00 AM",
        status: "Completed",
        image: require("../assets/images/image1.jpg"),
        address: "Guindy Industrial Estate",
        notes: "All 4 tags scanned on time. Fence tension verified.",
        rating: 5,
        otpRequired: true,
      },
    ],
    sampleTasks: [
      {
        id: "1",
        workOrderCode: "SEC-5001",
        title: "Perimeter Night Patrol & NFC Audit",
        description: "Perform scheduled walking round, scan all 6 RFID checkpoints, and log seal tags on dock gates.",
        priority: "Urgent",
        status: "In Progress",
        due: "Today, 11:00 PM",
        points: 45,
        targetEntity: "North Perimeter Gate",
        aiDiagnostic: "Check blind spot near boundary wall tower #3 due to tree foliage obstruction.",
        checklist: ["Scan NFC tag at post 1", "Verify emergency exit magnetic latch", "Conduct radio test with control room"],
      },
    ],
    quickActions: [
      { title: "Patrol\nScan", subtitle: "NFC checkpoints", icon: "Navigation", route: "/(employee)/tasks", color: "#475569", bg: "#f1f5f9" },
      { title: "Register\nGate", subtitle: "Add checkpoint", icon: "UserPlus", route: "/(employee)/register-site/step1", color: "#0284c7", bg: "#e0f2fe" },
      { title: "Incident\nReport", subtitle: "Log event", icon: "FileText", route: "/(employee)/reports", color: "#f59e0b", bg: "#fef3c7" },
      { title: "SOS\nDuress", subtitle: "Immediate panic", icon: "AlertOctagon", route: "/(employee)/sos", color: "#ef4444", bg: "#fee2e2" },
    ],
  },

  cleaning: {
    key: "cleaning",
    name: "Commercial Cleaning & Janitorial",
    tagline: "Daily cleaning, sanitation & hygiene",
    badge: "CLEAN",
    heroImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=900&auto=format&fit=crop&q=80",
    themeColor: "#059669",
    accentColor: "#34d399",
    lightBg: "#ecfdf5",
    borderTint: "#a7f3d0",
    gradient: ["#064e3b", "#065f46", "#047857"],
    vocab: {
      entity: "Clean Zone",
      entities: "Clean Zones",
      entitySingular: "Zone",
      staffRole: "Janitor / Clean Specialist",
      customerRole: "Facility Client",
      visit: "Cleaning Round",
      visits: "Sanitising Rounds",
      task: "Deep Clean Order",
      tasks: "Cleaning Tasks",
      report: "Sterility Certificate",
      sizeUnit: "sq.ft",
      approvalDoc: "Cleaning Scope & SLA Agreement",
      telemetryLabel: "QR Hygiene Telemetry",
    },
    kpis: {
      primaryNumber: "16",
      primaryLabel: "Zones Cleaned",
      secondaryNumber: "4.9★",
      secondaryLabel: "QR Clean Score",
      efficiencyRate: "97%",
      points: "460 PTS",
    },
    telemetryCard: {
      title1: "Apollo ICU Floor 3",
      metric1: "Terminal Sterilised",
      sub1: "Hospital Grade Hydrogen Peroxide",
      status1: "Cleared for Surgery",
      status1Color: "#16a34a",
      title2: "Corporate Food Court",
      metric2: "Steam Sanitised",
      sub2: "Grease Trap Cleared",
      status2: "Pass Rating: 99%",
      status2Color: "#0284c7",
    },
    sampleEntities: [
      {
        id: "1",
        code: "ZONE-0101",
        name: "Apollo Hospital – ICU Floor 3",
        type: "Healthcare Sterile Zone",
        size: 8200,
        sizeUnit: "sq.ft",
        address: "Greams Road, Thousand Lights, Chennai",
        area: "Greams Road",
        city: "Chennai",
        contactName: "Kavitha Natarajan",
        contactRole: "Infection Control Head",
        contactPhone: "+91 98410 12345",
        status: "verified",
        image: require("../assets/images/image4.jpg"),
        attributes: ["Terminal Disinfection", "Bio-waste QR Sealed", "Air HEPA Verified"],
      },
      {
        id: "2",
        code: "ZONE-0102",
        name: "Corporate Cafeteria – Tower 1",
        type: "Commercial Dining & Kitchen",
        size: 5400,
        sizeUnit: "sq.ft",
        address: "Ambattur Industrial Estate, Chennai",
        area: "Ambattur",
        city: "Chennai",
        contactName: "Meena Rajan",
        contactRole: "EHS Manager",
        contactPhone: "+91 98411 23456",
        status: "verified",
        image: require("../assets/images/image6.jpg"),
        attributes: ["High-Temp Steam Degreasing", "Kitchen Hood Clean", "Pest Seal"],
      },
    ],
    sampleVisits: [
      {
        id: "1",
        code: "CR-3001",
        type: "ICU TERMINAL STERILISATION",
        entityName: "Apollo Hospital – ICU Floor 3",
        time: "06:30 AM",
        status: "Completed",
        image: require("../assets/images/image4.jpg"),
        address: "Greams Road, Chennai",
        notes: "Terminal fogging and swab tests completed successfully.",
        rating: 5,
        otpRequired: true,
      },
    ],
    sampleTasks: [
      {
        id: "1",
        workOrderCode: "CLN-5001",
        title: "ICU Floor Terminal Fogging & Sterilisation",
        description: "Deploy ultra-low volume disinfectant fogger, sterilise high-touch medical railings, and seal bio-hazard bags.",
        priority: "Urgent",
        status: "In Progress",
        due: "Today, 8:00 AM",
        points: 50,
        targetEntity: "Apollo ICU Floor 3",
        aiDiagnostic: "Follow 15-minute contact dwell time for sporicidal disinfectant solution.",
        checklist: ["Check negative air pressure", "Seal HVAC return grilles", "Affix sterility green seal"],
      },
    ],
    quickActions: [
      { title: "Deep\nClean", subtitle: "Start round", icon: "ClipboardCheck", route: "/(employee)/tasks", color: "#059669", bg: "#d1fae5" },
      { title: "Add Clean\nZone", subtitle: "Onboard room", icon: "UserPlus", route: "/(employee)/register-site/step1", color: "#0284c7", bg: "#e0f2fe" },
      { title: "Bio-Waste\nLog", subtitle: "Manifest", icon: "FileText", route: "/(employee)/reports", color: "#ca8a04", bg: "#fef08a" },
      { title: "Chemical\nInventory", subtitle: "Restock MSDS", icon: "Boxes", route: "/(employee)/inventory", color: "#7c3aed", bg: "#ede9fe" },
    ],
  },

  maintenance: {
    key: "maintenance",
    name: "Asset & Equipment Maintenance",
    tagline: "Equipment checks, repairs & service",
    badge: "REPAIR",
    heroImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80",
    themeColor: "#2563eb",
    accentColor: "#60a5fa",
    lightBg: "#eff6ff",
    borderTint: "#bfdbfe",
    gradient: ["#1e3a8a", "#1e40af", "#1d4ed8"],
    vocab: {
      entity: "Machinery Asset",
      entities: "Assets & Machines",
      entitySingular: "Machine",
      staffRole: "MEP Technician",
      customerRole: "Plant Manager",
      visit: "Preventive Work Order",
      visits: "Service Orders",
      task: "Maintenance Ticket",
      tasks: "Maintenance Tickets",
      report: "Service Log",
      sizeUnit: "kVA / TR",
      approvalDoc: "Asset Register & AMC Contract",
      telemetryLabel: "Vibration & Thermal Telemetry",
    },
    kpis: {
      primaryNumber: "14",
      primaryLabel: "Assets Serviced",
      secondaryNumber: "2.1mm/s",
      secondaryLabel: "Chiller Vibration",
      efficiencyRate: "98%",
      points: "610 PTS",
    },
    telemetryCard: {
      title1: "DG Set 500 kVA (Cummins)",
      metric1: "100% Load",
      sub1: "Diesel Level: 92% • 415V Balanced",
      status1: "Standby Optimal",
      status1Color: "#16a34a",
      title2: "HVAC Screw Chiller #2",
      metric2: "2.1 mm/s",
      sub2: "Bearing Vibration within ISO spec",
      status2: "Running at 52 psi",
      status2Color: "#0284c7",
    },
    sampleEntities: [
      {
        id: "1",
        code: "AST-0101",
        name: "DG Set 500 kVA – Unit 1",
        type: "Industrial Diesel Generator",
        size: 500,
        sizeUnit: "kVA",
        address: "Ambattur SIDCO, Chennai",
        area: "Ambattur",
        city: "Chennai",
        contactName: "Suresh Mani",
        contactRole: "Plant MEP Head",
        contactPhone: "+91 98412 34567",
        status: "verified",
        image: require("../assets/images/image5.jpg"),
        attributes: ["Cummins Engine", "Load Bank Tested", "Automatic Transfer Switch"],
      },
      {
        id: "2",
        code: "AST-0102",
        name: "HVAC Screw Chiller #2",
        type: "Central Water-Cooled Chiller",
        size: 300,
        sizeUnit: "TR",
        address: "Tidel Cyber Park, Chennai",
        area: "Taramani",
        city: "Chennai",
        contactName: "Deepa Krishnan",
        contactRole: "Chief Engineer",
        contactPhone: "+91 98413 45678",
        status: "verified",
        image: require("../assets/images/image3.jpg"),
        attributes: ["Vibration Sensor Monitored", "Quarterly Descaling Done", "Carrier Brand"],
      },
    ],
    sampleVisits: [
      {
        id: "1",
        code: "WO-3001",
        type: "DG LOAD BANK INSPECTION",
        entityName: "DG Set 500 kVA – Unit 1",
        time: "10:00 AM",
        status: "Completed",
        image: require("../assets/images/image5.jpg"),
        address: "Ambattur SIDCO",
        notes: "Run at full 500 kVA load for 60 minutes. Exhaust temperature normal.",
        rating: 5,
        otpRequired: true,
      },
    ],
    sampleTasks: [
      {
        id: "1",
        workOrderCode: "MNT-5001",
        title: "Chiller Compressor Bearing Grease & Thermal Scan",
        description: "Apply polyurea grease to high-speed compressor bearings, inspect terminal lugs with FLIR infrared camera, and record delta T.",
        priority: "High",
        status: "In Progress",
        due: "Today, 3:30 PM",
        points: 45,
        targetEntity: "HVAC Chiller #2",
        aiDiagnostic: "Hotspot detected on phase B breaker contactor during yesterday's cycle. Re-torque to 18 Nm.",
        checklist: ["Lockout-tagout power feed", "Inspect oil level sight glass", "Record refrigerant suction pressure"],
      },
    ],
    quickActions: [
      { title: "Service\nOrder", subtitle: "Execute PM", icon: "ClipboardCheck", route: "/(employee)/tasks", color: "#2563eb", bg: "#dbeafe" },
      { title: "Register\nAsset", subtitle: "Onboard machine", icon: "UserPlus", route: "/(employee)/register-site/step1", color: "#16a34a", bg: "#dcfce7" },
      { title: "Spare\nParts", subtitle: "Boot stock", icon: "Boxes", route: "/(employee)/inventory", color: "#ca8a04", bg: "#fef08a" },
      { title: "Thermal\nLog", subtitle: "FLIR scans", icon: "FileText", route: "/(employee)/reports", color: "#7c3aed", bg: "#ede9fe" },
    ],
  },

  solar: {
    key: "solar",
    name: "Solar Farm Telemetry & Field PV",
    tagline: "Solar panels, inverter checks & power",
    badge: "SOLAR",
    heroImage: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=900&auto=format&fit=crop&q=80",
    themeColor: "#d97706",
    accentColor: "#fbbf24",
    lightBg: "#fffbeb",
    borderTint: "#fde68a",
    gradient: ["#78350f", "#92400e", "#b45309"],
    vocab: {
      entity: "PV Array Block",
      entities: "PV Array Blocks",
      entitySingular: "Array Block",
      staffRole: "Solar PV Technician",
      customerRole: "Plant Owner",
      visit: "Array Audit",
      visits: "String Audits",
      task: "PV Work Order",
      tasks: "Telemetry Tasks",
      report: "Generation Dossier",
      sizeUnit: "kWp",
      approvalDoc: "Grid Connectivity & Commissioning Cert",
      telemetryLabel: "Solar Inverter & Irradiance Telemetry",
    },
    kpis: {
      primaryNumber: "2.4 MW",
      primaryLabel: "Active Gen",
      secondaryNumber: "890 W/m²",
      secondaryLabel: "Peak Irradiance",
      efficiencyRate: "99.2%",
      points: "630 PTS",
    },
    telemetryCard: {
      title1: "Array Block #01 (East Field)",
      metric1: "1,500 kWp",
      sub1: "Single-Axis Tracker: Tracking at 24°",
      status1: "Inverter Online: 100%",
      status1Color: "#16a34a",
      title2: "Pyranometer Weather Station",
      metric2: "890 W/m²",
      sub2: "Cell Temp: 42°C • Wind: 14 km/h",
      status2: "Zero Hotspots Found",
      status2Color: "#0284c7",
    },
    sampleEntities: [
      {
        id: "1",
        code: "ARR-0101",
        name: "Array Block #01 – East Field",
        type: "Single-Axis Tracker PV Array",
        size: 1500,
        sizeUnit: "kWp",
        address: "Chettipalayam Solar Park, Coimbatore",
        area: "Chettipalayam",
        city: "Coimbatore",
        contactName: "Prakash Velu",
        contactRole: "Asset Director",
        contactPhone: "+91 98414 56789",
        status: "verified",
        image: require("../assets/images/image8.jpg"),
        attributes: ["Central Inverter INV-01", "Robotic Cleaning Enabled", "Bifacial Modules"],
      },
      {
        id: "2",
        code: "ARR-0102",
        name: "Array Block #03 – Central",
        type: "Fixed-Tilt Monocrystalline Array",
        size: 1200,
        sizeUnit: "kWp",
        address: "Kinathukadavu Solar Cluster, Coimbatore",
        area: "Kinathukadavu",
        city: "Coimbatore",
        contactName: "Revathi Kumar",
        contactRole: "Grid Operations Lead",
        contactPhone: "+91 98415 67890",
        status: "verified",
        image: require("../assets/images/image10.jpg"),
        attributes: ["String Combiner CB-03", "Drone Thermography Passed", "Substation Feed"],
      },
    ],
    sampleVisits: [
      {
        id: "1",
        code: "AUD-3001",
        type: "DRONE THERMAL HOTSPOT SCAN",
        entityName: "Array Block #01 – East Field",
        time: "11:00 AM",
        status: "Completed",
        image: require("../assets/images/image8.jpg"),
        address: "Chettipalayam Solar Park",
        notes: "IR drone flight scanned 3,200 panels. 0 bypass diode failures found.",
        rating: 5,
        otpRequired: true,
      },
    ],
    sampleTasks: [
      {
        id: "1",
        workOrderCode: "SLR-5001",
        title: "Inverter DC Combiner Box Fuse Swap",
        description: "Replace blown 1500V 20A gPV fuses on string 12, verify VOC voltage, and calibrate tracker motor gear torque.",
        priority: "Urgent",
        status: "In Progress",
        due: "Today, 1:30 PM",
        points: 50,
        targetEntity: "Array Block #01",
        aiDiagnostic: "VOC is 980V on string 12. Normal string peer voltage is 982V. Inverter PR will recover by 4.2%.",
        checklist: ["Check DC isolator turned OFF", "Measure string Voc with 1500V multimeter", "Tighten torque bolts to 8 Nm"],
      },
    ],
    quickActions: [
      { title: "Array\nAudit", subtitle: "Inspect string", icon: "ClipboardCheck", route: "/(employee)/tasks", color: "#d97706", bg: "#fef3c7" },
      { title: "Onboard\nBlock", subtitle: "Add array", icon: "UserPlus", route: "/(employee)/register-site/step1", color: "#0284c7", bg: "#e0f2fe" },
      { title: "Generation\nLog", subtitle: "PR report", icon: "FileText", route: "/(employee)/reports", color: "#16a34a", bg: "#dcfce7" },
      { title: "Drone\nScan", subtitle: "Thermal IR", icon: "Navigation", route: "/(employee)/map", color: "#7c3aed", bg: "#ede9fe" },
    ],
  },

  pest_control: {
    key: "pest_control",
    name: "Pest Control & Chemical Ops",
    tagline: "Pest check, spray & service logs",
    badge: "PEST CARE",
    heroImage: "https://images.unsplash.com/photo-1558904541-efa8c4a08931?w=900&auto=format&fit=crop&q=80",
    themeColor: "#b45309",
    accentColor: "#f59e0b",
    lightBg: "#fef3c7",
    borderTint: "#fde68a",
    gradient: ["#78350f", "#854d0e", "#a16207"],
    vocab: {
      entity: "Bait Station Grid",
      entities: "Bait Station Grids",
      entitySingular: "Bait Grid",
      staffRole: "Licensed Exterminator",
      customerRole: "Client Quality Manager",
      visit: "Treatment Beat",
      visits: "Treatment Beats",
      task: "Treatment Work Order",
      tasks: "Chemical Tasks",
      report: "FSSAI Certificate",
      sizeUnit: "stations",
      approvalDoc: "Service Contract & Chemical MSDS",
      telemetryLabel: "Smart Trap Telemetry",
    },
    kpis: {
      primaryNumber: "48",
      primaryLabel: "Bait Traps Active",
      secondaryNumber: "0",
      secondaryLabel: "Breaches / Month",
      efficiencyRate: "100%",
      points: "480 PTS",
    },
    telemetryCard: {
      title1: "Food Processing Unit 3",
      metric1: "48 Stations Clean",
      sub1: "Smart Barcode Checked 2h ago",
      status1: "Zero Activity Logged",
      status1Color: "#16a34a",
      title2: "Central Warehouse Ambattur",
      metric2: "Termite Barrier",
      sub2: "200L Imidacloprid Injected",
      status2: "5 Year Warranty Active",
      status2Color: "#0284c7",
    },
    sampleEntities: [
      {
        id: "1",
        code: "GRID-0101",
        name: "Food Processing Unit 3",
        type: "HACCP Certified Facility",
        size: 48,
        sizeUnit: "stations",
        address: "SIDCO Industrial Area, Ambattur",
        area: "Ambattur",
        city: "Chennai",
        contactName: "Ramesh Pandian",
        contactRole: "Quality Assurance Head",
        contactPhone: "+91 98416 78901",
        status: "verified",
        image: require("../assets/images/image6.jpg"),
        attributes: ["Zero Tolerance Zone", "Non-Toxic Gel Baiting", "FSSAI Logged"],
      },
    ],
    sampleVisits: [
      {
        id: "1",
        code: "TRT-3001",
        type: "BARCODE BAIT STATION AUDIT",
        entityName: "Food Processing Unit 3",
        time: "08:00 AM",
        status: "Completed",
        image: require("../assets/images/image6.jpg"),
        address: "SIDCO Industrial Area",
        notes: "All 48 perimeter stations scanned; glue boards refreshed.",
        rating: 5,
        otpRequired: true,
      },
    ],
    sampleTasks: [
      {
        id: "1",
        workOrderCode: "PST-5001",
        title: "Cold ULV Fogging & Chemical Barrier Application",
        description: "Apply micro-encapsulated pyrethroid barrier along exterior foundation and conduct misting in basement drains.",
        priority: "High",
        status: "In Progress",
        due: "Today, 6:00 PM",
        points: 40,
        targetEntity: "Food Processing Unit 3",
        aiDiagnostic: "Ventilate area for 120 minutes post-treatment before food preparation shifts resume.",
        checklist: ["Check respirator filter expiry", "Scan all bait barcodes", "Hand customer FSSAI completion certificate"],
      },
    ],
    quickActions: [
      { title: "Treat\nBeat", subtitle: "Scan bait traps", icon: "ClipboardCheck", route: "/(employee)/tasks", color: "#b45309", bg: "#fef3c7" },
      { title: "Register\nGrid", subtitle: "Map client site", icon: "UserPlus", route: "/(employee)/register-site/step1", color: "#0284c7", bg: "#e0f2fe" },
      { title: "Chemical\nStock", subtitle: "MSDS tracking", icon: "Boxes", route: "/(employee)/inventory", color: "#16a34a", bg: "#dcfce7" },
      { title: "FSSAI\nCert", subtitle: "Audit report", icon: "FileText", route: "/(employee)/reports", color: "#7c3aed", bg: "#ede9fe" },
    ],
  },

  logistics: {
    key: "logistics",
    name: "Logistics, Delivery & Fleet",
    tagline: "Delivery routes, cargo checks & drop-offs",
    badge: "LOGISTICS",
    heroImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=900&auto=format&fit=crop&q=80",
    themeColor: "#4f46e5",
    accentColor: "#818cf8",
    lightBg: "#eef2ff",
    borderTint: "#c7d2fe",
    gradient: ["#1e1b4b", "#312e81", "#3730a3"],
    vocab: {
      entity: "Route Hub",
      entities: "Route Hubs & Drops",
      entitySingular: "Hub / Depot",
      staffRole: "Delivery Fleet Driver",
      customerRole: "Consignee / Recipient",
      visit: "Delivery Drop",
      visits: "Delivery Drops",
      task: "Dispatch Order",
      tasks: "Drop Orders",
      report: "ePOD Manifest",
      sizeUnit: "drops/day",
      approvalDoc: "Hub Agreement & Route Permit",
      telemetryLabel: "Vehicle GPS & Cold-Chain Telemetry",
    },
    kpis: {
      primaryNumber: "32",
      primaryLabel: "Drops Today",
      secondaryNumber: "+3.8°C",
      secondaryLabel: "Cold Chain Temp",
      efficiencyRate: "99.4%",
      points: "680 PTS",
    },
    telemetryCard: {
      title1: "Apollo Hospital Cold Chain Drop",
      metric1: "+3.8°C",
      sub1: "Safe Vaccine Storage Window: +2 to +8°C",
      status1: "ETA: 18 mins",
      status1Color: "#16a34a",
      title2: "Ambattur Fulfilment Centre",
      metric2: "Van #12 Active",
      sub2: "Route Optimized: 14 Drops Remaining",
      status2: "GPS Synced",
      status2Color: "#0284c7",
    },
    sampleEntities: [
      {
        id: "1",
        code: "HUB-0101",
        name: "Ambattur Fulfilment Centre",
        type: "Regional Sorting & Cross-Dock Hub",
        size: 420,
        sizeUnit: "drops/day",
        address: "Ambattur Industrial Estate, Chennai",
        area: "Ambattur",
        city: "Chennai",
        contactName: "Senthil Rajan",
        contactRole: "Hub Operations Lead",
        contactPhone: "+91 98417 89012",
        status: "verified",
        image: require("../assets/images/image1.jpg"),
        attributes: ["24x7 Cross-Dock", "EV Fleet Charging", "Cold Storage Bay"],
      },
      {
        id: "2",
        code: "HUB-0102",
        name: "Apollo Hospital – Cold Chain Drop",
        type: "Medical Priority Consignee",
        size: 12,
        sizeUnit: "drops/day",
        address: "Greams Road, Thousand Lights, Chennai",
        area: "Greams Road",
        city: "Chennai",
        contactName: "Divya Selvam",
        contactRole: "Chief Pharmacist",
        contactPhone: "+91 98418 90123",
        status: "verified",
        image: require("../assets/images/image4.jpg"),
        attributes: ["Refrigerated Cargo", "Data Logger Synced", "OTP Verification"],
      },
    ],
    sampleVisits: [
      {
        id: "1",
        code: "DRP-3001",
        type: "COLD-CHAIN MEDICAL DROP",
        entityName: "Apollo Hospital – Cold Chain Drop",
        time: "09:15 AM",
        status: "Completed",
        image: require("../assets/images/image4.jpg"),
        address: "Greams Road, Chennai",
        notes: "Cargo delivered at +3.8°C; ePOD OTP sign-off completed.",
        rating: 5,
        otpRequired: true,
      },
    ],
    sampleTasks: [
      {
        id: "1",
        workOrderCode: "LOG-5001",
        title: "Priority Vaccine Cold-Chain Drop & OTP Proof of Delivery",
        description: "Transport insulated vaccine container, log digital temperature recorder reading, and obtain consignee 4-digit OTP.",
        priority: "Urgent",
        status: "In Progress",
        due: "Today, 11:30 AM",
        points: 50,
        targetEntity: "Apollo Hospital Drop",
        aiDiagnostic: "Optimal route via bypass saves 14 minutes avoiding flyover construction bottleneck.",
        checklist: ["Check data logger temperature (+2° to +8°C)", "Take package photo at delivery gate", "Collect customer OTP 4821"],
      },
    ],
    quickActions: [
      { title: "Delivery\nDrop", subtitle: "ePOD sign-off", icon: "Navigation", route: "/(employee)/visits", color: "#4f46e5", bg: "#eef2ff" },
      { title: "Register\nHub", subtitle: "Onboard stop", icon: "UserPlus", route: "/(employee)/register-site/step1", color: "#0284c7", bg: "#e0f2fe" },
      { title: "Vehicle\nCheck", subtitle: "Pre-trip OBD", icon: "ClipboardCheck", route: "/(employee)/tasks", color: "#16a34a", bg: "#dcfce7" },
      { title: "Trip\nClaims", subtitle: "Fuel & toll", icon: "Receipt", route: "/(employee)/expenses", color: "#ca8a04", bg: "#fef08a" },
    ],
  },
};

function enrichService(raw: any): ServiceDefinition {
  return {
    ...raw,
    serviceKey: raw.key,
    label: raw.name,
    shortName: raw.badge,
    heroImage: raw.heroImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=80",
    color: raw.themeColor,
    vocab: {
      ...raw.vocab,
      taskSingular: raw.vocab.task,
      visitSingular: raw.vocab.visit,
    },
    telemetryCard: {
      ...raw.telemetryCard,
      primaryTitle: raw.telemetryCard.title1,
      primaryMetric: raw.telemetryCard.metric1,
      secondaryTitle: raw.telemetryCard.title2,
      secondaryMetric: raw.telemetryCard.metric2,
    },
    sampleVisits: raw.sampleVisits.map((v: any) => ({
      ...v,
      site: v.site || v.entityName,
    })),
    sampleTasks: raw.sampleTasks.map((t: any) => ({
      ...t,
      facility: t.facility || t.targetEntity,
    })),
  };
}

export const SERVICES_CONFIG: Record<ServiceKey, ServiceDefinition> = (
  Object.keys(RAW_SERVICES_CONFIG) as ServiceKey[]
).reduce((acc, key) => {
  acc[key] = enrichService(RAW_SERVICES_CONFIG[key]);
  return acc;
}, {} as Record<ServiceKey, ServiceDefinition>);

