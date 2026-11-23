import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Check,
    ChevronDown,
    Clock,
    Globe,
    LogIn,
    MapPin,
    Menu,
    Search,
    ShieldCheck,
    Sparkles,
    WifiOff,
    X,
    Zap,
} from 'lucide-react';
import {
    LiquidAlertsIcon,
    LiquidAnalyticsIcon,
    LiquidCrownIcon,
    LiquidRadarIcon,
    LiquidSitesIcon,
    LiquidSparkIcon,
    LiquidTasksIcon,
    LiquidTeamIcon,
    LiquidTrophyIcon,
    LiquidVisitsIcon,
} from '../Components/LiquidIcons';
import { asset, withBase } from '../basePath';

const HERO_CENTER_MODULES = [
    { id: 'gps', label: 'Live GPS Map', icon: LiquidRadarIcon },
    { id: 'orders', label: 'Work Orders', icon: LiquidTasksIcon },
    { id: 'attendance', label: 'Shift Roster', icon: LiquidTeamIcon },
];

const SOLUTIONS = [
    {
        id: 'facility',
        name: 'Facility & Housekeeping',
        short: 'Facility',
        color: '#059669',
        canvasBg: '#ECFDF5',
        headline: 'Spotless sites with verified supervisor rounds',
        summary:
            'Monitor multi-site housekeeping crews, restroom & lobby checklists, material consumption, and client SLA scores in real time.',
        image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
        bullets: [
            'Geo-fenced floor inspection checklists',
            'Before & after cleaning photo proof per zone',
            'Shift attendance & supervisor audit scores',
        ],
    },
    {
        id: 'telecom',
        name: 'Telecom & Fiber Maintenance',
        short: 'Telecom',
        color: '#0284C7',
        canvasBg: '#F0F9FF',
        headline: 'Faster fiber restoration & tower uptime',
        summary:
            'Dispatch linemen to tower outages, splice points, and customer installations with exact GPS coordinates and equipment logs.',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
        bullets: [
            'Tower & fiber node asset mapping',
            'Outage SLA countdown & escalation alerts',
            'OTDR & splice photo documentation',
        ],
    },
    {
        id: 'solar',
        name: 'Solar & Clean Energy O&M',
        short: 'Solar O&M',
        color: '#D97706',
        canvasBg: '#FFFBEB',
        headline: 'Maximize inverter uptime across remote plants',
        summary:
            'Coordinate panel cleaning crews, preventive inverter servicing, and thermal fault inspections across distributed solar sites.',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
        bullets: [
            'Preventive maintenance schedules per plant',
            'String & inverter serial number tracking',
            'Offline-ready logging for remote solar farms',
        ],
    },
    {
        id: 'hvac',
        name: 'HVAC & Elevator Servicing',
        short: 'HVAC & Lifts',
        color: '#4F46E5',
        canvasBg: '#EEF2FF',
        headline: 'Zero-miss AMC visits and rapid breakdown response',
        summary:
            'Automate recurring AMC schedules, spare-part usage notes, and emergency breakdown dispatch for commercial buildings.',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
        bullets: [
            'Automated AMC visit calendar & reminders',
            'Emergency breakdown routing to nearest tech',
            'Client signature & service report PDFs',
        ],
    },
    {
        id: 'security',
        name: 'Security Guard & Patrol',
        short: 'Security',
        color: '#E11D48',
        canvasBg: '#FFF1F2',
        headline: 'Accountable night patrols with live SOS protection',
        summary:
            'Verify checkpoint patrols, night-shift wakefulness checks, incident photos, and instant emergency SOS alerts from any post.',
        image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&q=80',
        bullets: [
            'Geo-fenced guard post check-ins',
            'Real-time incident & visitor reporting',
            'One-tap SOS panic alert with live GPS',
        ],
    },
    {
        id: 'agri',
        name: 'Agri & Field Advisory',
        short: 'Agriculture',
        color: '#16A34A',
        canvasBg: '#F0FDF4',
        headline: 'Empower agronomists across rural farm territories',
        summary:
            'Register farms, log crop health inspections, capture pest photos, and track field officer coverage across villages.',
        image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
        bullets: [
            'Farmer & plot directory with GPS pins',
            'Crop advisory visit forms & photo logs',
            'Territory-wise officer performance metrics',
        ],
    },
    {
        id: 'coldchain',
        name: 'Cold Chain & Pharma Logistics',
        short: 'Cold Chain',
        color: '#7C3AED',
        canvasBg: '#F5F3FF',
        headline: 'Audit-ready cold delivery and temperature logs',
        summary:
            'Keep pharma and perishable deliveries compliant with timestamped handover proofs, route visibility, and exception alerts.',
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
        bullets: [
            'Verified pharmacy & warehouse drop-offs',
            'Temperature & seal photo capture',
            'Instant delay & route deviation alerts',
        ],
    },
    {
        id: 'utilities',
        name: 'Water, Pest & Civic Utilities',
        short: 'Utilities',
        color: '#EA580C',
        canvasBg: '#FFF7ED',
        headline: 'Streamlined municipal & pest control operations',
        summary:
            'Manage meter readings, valve inspections, and scheduled pest treatments with complete geographic accountability.',
        image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
        bullets: [
            'Zone-wise job batching & route sheets',
            'Chemical & material usage logs',
            'Citizen & client compliance certificates',
        ],
    },
];

const WORKFLOW_STEPS = [
    {
        step: '01',
        title: 'Configure Sites & Teams',
        description:
            'Sign in to the Fieldy Web Portal, onboard client sites, set geo-fences, and schedule recurring or urgent work orders.',
        accent: '#4F46E5',
        canvasBg: '#EEF2FF',
        icon: LiquidSitesIcon,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
    },
    {
        step: '02',
        title: 'Execute on Android App',
        description:
            'Field staff clock in with selfie + GPS, follow checklists, capture watermarked photo proof, and close visits on the move.',
        accent: '#059669',
        canvasBg: '#ECFDF5',
        icon: LiquidVisitsIcon,
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=900&q=80',
    },
    {
        step: '03',
        title: 'Monitor Live & Export',
        description:
            'Watch live GPS routes, act on instant SOS or SLA alerts, and download payroll & client proof reports in one click.',
        accent: '#EA580C',
        canvasBg: '#FFF7ED',
        icon: LiquidAnalyticsIcon,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    },
];

const PRICING_PLANS = [
    {
        name: 'Starter',
        subtitle: 'For growing local field teams',
        monthly: 2499,
        yearly: 1999,
        accent: '#0284C7',
        canvasBg: '#F0F9FF',
        popular: false,
        features: [
            'Up to 15 active field employees',
            'Live GPS tracking & route playback',
            'Selfie attendance & shift sheets',
            'Work order dispatch & photo proof',
            'Android mobile app + Web Admin',
            'Email & WhatsApp support',
        ],
    },
    {
        name: 'Growth',
        subtitle: 'Most popular for multi-site fleets',
        monthly: 6999,
        yearly: 5599,
        accent: '#EA580C',
        canvasBg: '#FFF7ED',
        popular: true,
        features: [
            'Up to 60 active field employees',
            'Geo-fenced sites & SLA breach alerts',
            'Custom industry checklists & forms',
            'Real-time SOS emergency center',
            'Leaderboard & PDF/CSV exports',
            'Priority onboarding & phone support',
        ],
    },
    {
        name: 'Enterprise',
        subtitle: 'For pan-India & multi-tenant orgs',
        monthly: null,
        yearly: null,
        accent: '#059669',
        canvasBg: '#ECFDF5',
        popular: false,
        features: [
            'Unlimited field staff & client sites',
            'Multi-tenant Superadmin portal',
            'Custom branding & industry presets',
            'Dedicated API integrations & webhooks',
            '99.9% uptime SLA & audit logs',
            'Dedicated account success manager',
        ],
    },
];

const FAQS = [
    {
        q: 'How fast can our team go live with Fieldy?',
        a: 'Most teams launch in under 30 minutes. Log in to the Web Admin Portal, add your sites and field staff, share the Android APK, and start tracking live visits immediately.',
    },
    {
        q: 'Does Fieldy adapt to our specific industry?',
        a: 'Yes. Fieldy ships with dedicated terminology, KPIs, checklists, and workflows for 9+ field verticals including Facility Management, Telecom, Solar O&M, HVAC, Security Patrols, Cold Chain, Utilities, and Agriculture.',
    },
    {
        q: 'How is GPS and battery usage managed on employee phones?',
        a: 'Location tracking runs strictly while an employee is clocked in On-Duty and uses adaptive sync intervals so batteries comfortably last a full 10–12 hour shift.',
    },
    {
        q: 'Is our company data isolated from other organizations?',
        a: 'Strictly yes. Fieldy enforces multi-tenant isolation at both the database and API layers, with role-based permissions for Superadmins, Company Admins, and Field Staff.',
    },
    {
        q: 'Can we upgrade or add more field seats anytime?',
        a: 'Yes. Scale your team up or down at any billing cycle with zero downtime and full preservation of all visit logs, attendance sheets, and photo proofs.',
    },
];

export default function Landing() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeHeroModule, setActiveHeroModule] = useState('orders');
    const [activeSolutionId, setActiveSolutionId] = useState(SOLUTIONS[0].id);
    const [billingCycle, setBillingCycle] = useState('yearly');
    const [openFaq, setOpenFaq] = useState(0);

    const activeSolution = SOLUTIONS.find((s) => s.id === activeSolutionId) || SOLUTIONS[0];
    const loginHref = withBase('/admin/login');

    return (
        <>
            <Head title="Fieldy — Smart Field Operations & Workforce Platform" />

            <div className="min-h-screen bg-white text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
                {/* 1. EXACT DEEP-INDIGO TOP NAVIGATION BAR */}
                <header className="sticky top-0 z-50 bg-[#0D044F] border-b border-white/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
                        {/* Left: Original Fieldy Logo */}
                        <a
                            href="#top"
                            className="inline-flex items-center bg-white rounded-xl px-3 py-1.5 shadow-[0_6px_18px_-6px_rgba(0,0,0,0.45)] hover:scale-[1.02] transition-transform"
                        >
                            <img
                                src={asset('/images/logo.png')}
                                alt="Fieldy"
                                className="h-8 w-auto object-contain"
                            />
                        </a>

                        {/* Center Links */}
                        <nav className="hidden md:flex items-center gap-7">
                            {[
                                { label: 'Features', href: '#features' },
                                { label: 'Solutions', href: '#solutions' },
                                { label: 'Pricing', href: '#pricing' },
                                { label: 'Workflow', href: '#workflow' },
                                { label: 'Industries', href: '#solutions' },
                                { label: 'FAQ', href: '#faq' },
                            ].map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    className="text-[15px] font-semibold text-white/90 hover:text-orange-300 transition-colors"
                                >
                                    {item.label}
                                </a>
                            ))}
                        </nav>

                        {/* Right Actions: Translucent Glass Outlined Pill + Solid White Log in Pill */}
                        <div className="hidden md:flex items-center gap-3">
                            <a
                                href="#pricing"
                                className="h-10 px-5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/25 text-white text-[15px] font-semibold inline-flex items-center justify-center transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.28)]"
                            >
                                Sign up
                            </a>
                            <Link
                                href={loginHref}
                                className="h-10 px-5 rounded-xl bg-white hover:bg-orange-50 text-[#0D044F] text-[15px] font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-[0_6px_18px_-6px_rgba(0,0,0,0.45),inset_0_1px_0_#ffffff]"
                            >
                                Log in
                            </Link>
                        </div>

                        {/* Mobile Controls */}
                        <div className="flex md:hidden items-center gap-2">
                            <Link
                                href={loginHref}
                                className="h-9 px-4 rounded-lg bg-white text-[#0D044F] text-sm font-bold inline-flex items-center justify-center"
                            >
                                Log in
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 text-white inline-flex items-center justify-center"
                                aria-label="Menu"
                            >
                                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {mobileMenuOpen && (
                        <div className="md:hidden border-t border-white/10 bg-[#120761] px-4 py-4 space-y-1 shadow-xl">
                            {[
                                { label: 'Features', href: '#features' },
                                { label: 'Solutions', href: '#solutions' },
                                { label: 'Workflow', href: '#workflow' },
                                { label: 'Pricing', href: '#pricing' },
                                { label: 'FAQ', href: '#faq' },
                            ].map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-4 py-3 rounded-xl text-base font-semibold text-white/95 hover:bg-white/10"
                                >
                                    {item.label}
                                </a>
                            ))}
                            <div className="pt-2">
                                <Link
                                    href={loginHref}
                                    className="w-full h-11 rounded-xl bg-[#F97316] text-white font-bold text-base inline-flex items-center justify-center gap-2"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Log in to Admin Portal
                                </Link>
                            </div>
                        </div>
                    )}
                </header>

                <main id="top">
                    {/* ANNOUNCEMENT RIBBON BAR */}
                    <div className="bg-[#180E63] border-b border-white/10 px-4 py-3 text-center">
                        <p className="text-sm sm:text-base font-medium text-indigo-100/95">
                            Introducing{' '}
                            <a
                                href="#features"
                                className="text-orange-300 hover:text-orange-200 underline underline-offset-4 font-bold transition-colors"
                            >
                                Fieldy AI 
                            </a>
                            , the liquid glass command center for live GPS field operations.
                        </p>
                    </div>

                    {/* 2. EXACT CANVA-STYLE ROYAL INDIGO HERO SECTION + 7-CARD OVERLAPPING DECK */}
                    <section className="relative overflow-hidden bg-[#140874] pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
                        {/* Subtle Solid Blurred Atmospheric Depth Orbs (Zero Gradients) */}
                        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                            <div className="hp-orb-float absolute top-6 left-1/5 w-[420px] h-[420px] rounded-full bg-orange-500/18 blur-3xl" />
                            <div
                                className="hp-orb-float absolute bottom-0 right-1/4 w-[420px] h-[420px] rounded-full bg-violet-500/20 blur-3xl"
                                style={{ animationDelay: '-5s' }}
                            />
                            <div
                                className="hp-orb-float absolute bottom-4 left-1/2 -translate-x-1/2 w-[520px] h-[240px] rounded-full bg-indigo-500/22 blur-3xl"
                                style={{ animationDelay: '-9s' }}
                            />
                        </div>

                        <div className="relative z-10 max-w-[1440px] mx-auto px-3 sm:px-6">
                            {/* Giant Centered Monumental Wordmark: Fieldy ops */}
                            <div className="text-center select-none hp-animate-in">
                                <h1 className="inline-flex items-baseline justify-center gap-2 sm:gap-4 text-white leading-none">
                                    <span
                                        className="text-[4.85rem] sm:text-[7.25rem] lg:text-[8.75rem] font-normal tracking-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.35)]"
                                        style={{ fontFamily: "'Pacifico', cursive" }}
                                    >
                                        Fieldy
                                    </span>
                                    <span className="text-[4.25rem] sm:text-[6.4rem] lg:text-[7.75rem] font-light tracking-[-0.04em] text-orange-300">
                                        ops
                                    </span>
                                </h1>
                            </div>

                            {/* EXACT 7-CARD SYMMETRICAL OVERLAPPING COVERFLOW FAN */}
                            <div className="relative mt-4 sm:mt-2 flex items-center justify-center">
                                {/* CARD 1 — FAR LEFT EDGE (Mobile Field App Photo) */}
                                <div className="hidden xl:block relative z-10 -mr-10 w-[170px] h-[212px] rounded-[22px] bg-[#0284C7] border-2 border-sky-300/75 shadow-2xl overflow-hidden shrink-0 hover:-translate-y-2 transition-transform duration-300">
                                    <img
                                        src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&q=80"
                                        alt="Field technician with mobile device"
                                        className="w-full h-full object-cover opacity-90"
                                    />
                                    <div className="absolute inset-x-3 bottom-3 bg-white/90 backdrop-blur-md rounded-xl px-2.5 py-1.5 text-xs font-extrabold text-slate-900 shadow">
                                        Field App
                                    </div>
                                </div>

                                {/* CARD 2 — MID LEFT (Vibrant Orange Brand / Industry Presets + Node Handles) */}
                                <div className="hidden md:flex relative z-20 -mr-10 w-[200px] lg:w-[215px] h-[230px] lg:h-[242px] rounded-[24px] bg-[#F97316] border-2 border-orange-200/85 shadow-2xl overflow-hidden shrink-0 p-4 flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
                                    {/* Top Geometric Emblem + Node Line */}
                                    <div className="flex items-start justify-between">
                                        <div className="w-16 h-16 rounded-2xl bg-[#EA580C] border border-white/25 flex items-center justify-center shadow-inner">
                                            <MapPin className="w-9 h-9 text-amber-100" strokeWidth={2.3} />
                                        </div>
                                        {/* Vector Anchor Handle Visual */}
                                        <div className="flex flex-col items-center pt-4 pr-1">
                                            <span className="w-3 h-3 rounded-full bg-white border-2 border-indigo-500 shadow" />
                                            <span className="w-0.5 h-20 bg-indigo-400/90" />
                                            <span className="w-3 h-3 rounded-full bg-white border-2 border-indigo-500 shadow" />
                                        </div>
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-[48px] font-extrabold leading-none text-red-800/90 tracking-tight">
                                                9+
                                            </div>
                                            <div className="text-xs font-extrabold uppercase tracking-wider text-amber-950/85 mt-0.5">
                                                Industries
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 3 — INNER LEFT (Stacked White Site Photo Proof Mini-Cards) */}
                                <div className="hidden sm:flex relative z-30 -mr-9 w-[225px] lg:w-[250px] h-[260px] lg:h-[278px] rounded-[26px] bg-[#EA580C] border-2 border-orange-200/90 shadow-2xl overflow-hidden shrink-0 p-3.5 items-end justify-center gap-2 hover:-translate-y-2 transition-transform duration-300">
                                    {/* Left peeking mini card */}
                                    <div className="w-[76px] h-[202px] rounded-2xl bg-white p-2 shadow-lg flex flex-col justify-between shrink-0 -ml-4">
                                        <span className="text-[10px] font-black uppercase tracking-tight text-orange-600 leading-tight">
                                            SITE
                                            <br />
                                            PROOF
                                        </span>
                                        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100">
                                            <img
                                                src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=300&q=80"
                                                alt="Solar site proof"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    {/* Center crisp white mini card */}
                                    <div className="w-[96px] h-[220px] rounded-2xl bg-white p-2.5 shadow-xl flex flex-col justify-between shrink-0">
                                        <div>
                                            <div className="text-xs font-black uppercase tracking-tight text-orange-600 leading-none">
                                                VERIFIED
                                            </div>
                                            <div className="text-xs font-black uppercase tracking-tight text-amber-500 leading-tight">
                                                VISIT
                                            </div>
                                        </div>
                                        <div className="w-full h-28 rounded-xl overflow-hidden bg-amber-50 border border-amber-200">
                                            <img
                                                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=300&q=80"
                                                alt="Housekeeping proof"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    {/* Right peeking mini card */}
                                    <div className="w-[76px] h-[202px] rounded-2xl bg-amber-100 p-2 shadow-lg flex flex-col justify-between shrink-0 -mr-4">
                                        <span className="text-[10px] font-black uppercase tracking-tight text-emerald-700 leading-tight">
                                            GPS
                                            <br />
                                            STAMP
                                        </span>
                                        <div className="w-full h-24 rounded-xl overflow-hidden bg-white">
                                            <img
                                                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80"
                                                alt="HVAC inspection"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CARD 4 — CENTER FRONT HERO CARD (Interactive Berry-Magenta Liquid Glass Modules Switcher) */}
                                <div className="relative z-40 w-[300px] sm:w-[330px] h-[296px] sm:h-[322px] rounded-[28px] bg-[#BE185D] border-2 border-orange-200/95 shadow-[0_28px_70px_-12px_rgba(0,0,0,0.65),inset_0_1.5px_0_rgba(255,255,255,0.55)] shrink-0 p-4 sm:p-5 flex flex-col justify-center gap-3">
                                    {HERO_CENTER_MODULES.map((mod) => {
                                        const ModIcon = mod.icon;
                                        const isOn = activeHeroModule === mod.id;
                                        return (
                                            <button
                                                key={mod.id}
                                                type="button"
                                                onClick={() => setActiveHeroModule(mod.id)}
                                                className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer text-left ${
                                                    isOn
                                                        ? 'bg-white/25 backdrop-blur-xl border border-white/45 shadow-[0_10px_24px_-8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.6)]'
                                                        : 'bg-transparent border border-transparent hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    <span className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md">
                                                        <ModIcon className="w-7 h-7" />
                                                    </span>
                                                    <span className="text-[19px] sm:text-[21px] font-bold text-white tracking-tight truncate">
                                                        {mod.label}
                                                    </span>
                                                </div>

                                                {isOn && (
                                                    <span className="w-14 h-8 rounded-full bg-[#F97316] p-1 flex items-center justify-end shrink-0 shadow-inner border border-white/40">
                                                        <span className="w-6 h-6 rounded-full bg-white text-[#EA580C] flex items-center justify-center shadow">
                                                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                                        </span>
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* CARD 5 — INNER RIGHT (Royal Purple Wireframe GPS Globe + Floating White Sparkle Search Pill) */}
                                <div className="hidden sm:flex relative z-30 -ml-9 w-[225px] lg:w-[250px] h-[260px] lg:h-[278px] rounded-[26px] bg-[#7E22CE] border-2 border-sky-300/85 shadow-2xl overflow-hidden shrink-0 items-center justify-center p-5 hover:-translate-y-2 transition-transform duration-300">
                                    {/* Wireframe Latitude/Longitude Globe SVG */}
                                    <svg
                                        viewBox="0 0 200 200"
                                        className="w-48 h-48 text-fuchsia-300/35"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <circle cx="100" cy="100" r="88" stroke="currentColor" strokeWidth="2" />
                                        <ellipse cx="100" cy="100" rx="56" ry="88" stroke="currentColor" strokeWidth="1.75" />
                                        <ellipse cx="100" cy="100" rx="26" ry="88" stroke="currentColor" strokeWidth="1.5" />
                                        <line x1="12" y1="100" x2="188" y2="100" stroke="currentColor" strokeWidth="1.75" />
                                        <path d="M22 64 C60 76, 140 76, 178 64" stroke="currentColor" strokeWidth="1.5" />
                                        <path d="M22 136 C60 124, 140 124, 178 136" stroke="currentColor" strokeWidth="1.5" />
                                    </svg>

                                    {/* Floating Crisp White Search Pill */}
                                    <div className="absolute inset-x-5 h-13 rounded-2xl bg-white/95 backdrop-blur-xl border border-white shadow-xl px-4 flex items-center gap-2.5">
                                        <div className="relative flex items-center justify-center text-[#5B21B6]">
                                            <Search className="w-4 h-4" strokeWidth={2.5} />
                                            <Sparkles className="w-2.5 h-2.5 absolute -top-1.5 -right-1.5 text-orange-500" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-700 truncate">
                                            Find sites & staff
                                        </span>
                                    </div>
                                </div>

                                {/* CARD 6 — MID RIGHT (Electric Violet Collaboration Card + Floating Emerald "Arjun" Cursor Badge) */}
                                <div className="hidden md:flex relative z-20 -ml-10 w-[200px] lg:w-[215px] h-[230px] lg:h-[242px] rounded-[24px] bg-[#6D28D9] border-2 border-sky-300/80 shadow-2xl overflow-hidden shrink-0 items-end justify-start p-4 hover:-translate-y-2 transition-transform duration-300">
                                    {/* Inner Tilted Lavender Surface */}
                                    <div className="w-[160px] h-[174px] rounded-2xl bg-[#A855F7] border-r-8 border-white p-4 flex flex-col justify-end shadow-lg">
                                        <div className="text-[28px] font-extrabold leading-tight text-violet-100/90">
                                            Site
                                            <br />
                                            Check
                                        </div>
                                    </div>

                                    {/* Floating Green Live Cursor Badge */}
                                    <div className="absolute top-5 right-3 flex items-start gap-1 hp-float-card">
                                        <svg
                                            viewBox="0 0 20 20"
                                            className="w-4 h-4 text-emerald-400 mt-4 -mr-1 drop-shadow"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path d="M3 2l14 7-6 2-2 6L3 2z" />
                                        </svg>
                                        <span className="px-3.5 py-1 rounded-full bg-emerald-500 text-white text-sm font-extrabold shadow-lg border border-white/40">
                                            Arjun
                                        </span>
                                    </div>
                                </div>

                                {/* CARD 7 — FAR RIGHT EDGE (Royal Blue Live Dispatch Reply Card) */}
                                <div className="hidden xl:flex relative z-10 -ml-10 w-[170px] h-[212px] rounded-[22px] bg-[#2563EB] border-2 border-sky-300/75 shadow-2xl overflow-hidden shrink-0 p-4 flex-col justify-between hover:-translate-y-2 transition-transform duration-300">
                                    <div className="space-y-1.5 pt-2 pl-4">
                                        <div className="text-xs font-semibold text-blue-100/90 leading-snug">
                                            Assign morning AMC checklist to Site B?
                                        </div>
                                    </div>
                                    <div className="bg-white/95 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-lg">
                                        Got it! Checked in.
                                    </div>
                                </div>
                            </div>

                            {/* Clean Hero Bottom Action Row (Orange + Frosted Glass) */}
                            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                                <Link
                                    href={loginHref}
                                    className="h-14 px-8 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-base sm:text-lg inline-flex items-center gap-2.5 border border-orange-300/50 shadow-[0_14px_34px_-8px_rgba(249,115,22,0.6),inset_0_1.5px_0_rgba(255,255,255,0.45)] transition-transform hover:-translate-y-0.5 active:scale-95"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Log in to Fieldy Portal
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a
                                    href="#features"
                                    className="h-14 px-7 rounded-full bg-white/14 hover:bg-white/22 backdrop-blur-2xl border border-white/35 text-white font-bold text-base sm:text-lg inline-flex items-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] transition-all hover:-translate-y-0.5"
                                >
                                    Explore Features
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* 3. ASYMMETRIC CANVA-STYLE BENTO GRID FEATURES */}
                    <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-22 lg:py-26">
                        <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-orange-200 text-sm font-bold">
                                <Sparkles className="w-4 h-4" />
                                Core Field Capabilities
                            </span>
                            <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                                Everything your field team needs, in one workspace
                            </h2>
                            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">
                                Designed for speed on the ground and total visibility at headquarters.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                            {/* Bento 1 (Large 7 cols) */}
                            <div className="lg:col-span-7 rounded-[28px] bg-[#EEF2FF] border border-indigo-100 p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <span className="hp-liquid-icon-badge !w-12 !h-12">
                                            <LiquidRadarIcon className="w-7 h-7" />
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-white text-indigo-700 text-sm font-bold border border-indigo-200/80">
                                            Live GPS Radar
                                        </span>
                                    </div>
                                    <h3 className="text-3xl sm:text-[2.1rem] font-extrabold text-slate-900 leading-tight">
                                        See every technician and site live on the map
                                    </h3>
                                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                                        Real-time 3-second coordinate sync, full route playback, battery telemetry, and automatic site geo-fence check-ins.
                                    </p>
                                </div>
                                <div className="mt-7 rounded-2xl overflow-hidden border-4 border-white shadow-lg aspect-[16/9]">
                                    <img
                                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1100&q=80"
                                        alt="Live GPS map and route tracking"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Bento 2 (5 cols) */}
                            <div className="lg:col-span-5 rounded-[28px] bg-[#ECFDF5] border border-emerald-100 p-8 sm:p-10 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="hp-liquid-icon-badge !w-12 !h-12">
                                            <LiquidVisitsIcon className="w-7 h-7" />
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-white text-emerald-700 text-sm font-bold border border-emerald-200/80">
                                            Photo Proof
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-slate-900 leading-tight">
                                        Watermarked before & after site proof
                                    </h3>
                                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                                        Every visit captures GPS-stamped photos, digital customer signatures, and instant PDF/CSV audit exports.
                                    </p>
                                </div>
                                <div className="mt-7 rounded-2xl overflow-hidden border-4 border-white shadow-lg aspect-[4/3]">
                                    <img
                                        src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80"
                                        alt="On-site photo verification"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Bento 3 (5 cols — Vibrant Warm Orange Canvas) */}
                            <div className="lg:col-span-5 rounded-[28px] bg-[#FFF7ED] border border-orange-200/80 p-8 sm:p-10 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="hp-liquid-icon-badge !w-12 !h-12">
                                            <LiquidTeamIcon className="w-7 h-7" />
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-white text-[#EA580C] text-sm font-bold border border-orange-200">
                                            Selfie Attendance
                                        </span>
                                    </div>
                                    <h3 className="text-3xl font-extrabold text-slate-900 leading-tight">
                                        Zero proxy punches with selfie + GPS clock-in
                                    </h3>
                                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                                        Verify shift starts, duty duration, and overtime automatically with payroll-ready attendance sheets.
                                    </p>
                                </div>
                                <div className="mt-7 space-y-3">
                                    {[
                                        'Live selfie + coordinate stamp on clock-in',
                                        'Automated daily & monthly shift registers',
                                        'One-tap Off-Duty privacy protection',
                                    ].map((pt) => (
                                        <div
                                            key={pt}
                                            className="bg-white rounded-xl px-4 py-3.5 border border-orange-200/80 flex items-center gap-3 text-sm sm:text-base font-bold text-slate-800 shadow-2xs"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-[#EA580C] text-white flex items-center justify-center shrink-0">
                                                <Check className="w-3.5 h-3.5" />
                                            </span>
                                            {pt}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bento 4 (7 cols) */}
                            <div className="lg:col-span-7 rounded-[28px] bg-[#F0F9FF] border border-sky-100 p-8 sm:p-10 flex flex-col justify-between">
                                <div className="space-y-4 max-w-2xl">
                                    <div className="flex items-center gap-3">
                                        <span className="hp-liquid-icon-badge !w-12 !h-12">
                                            <LiquidTasksIcon className="w-7 h-7" />
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-white text-sky-700 text-sm font-bold border border-sky-200/80">
                                            Work Order Dispatch
                                        </span>
                                    </div>
                                    <h3 className="text-3xl sm:text-[2.1rem] font-extrabold text-slate-900 leading-tight">
                                        Assign jobs in seconds and hit every SLA
                                    </h3>
                                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                                        Route urgent breakdowns or recurring AMC checklists straight to the Fieldy Android app with live status tracking.
                                    </p>
                                </div>
                                <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {[
                                        { title: 'Smart Dispatch', sub: 'Assign by zone & skill', color: '#EA580C', icon: Zap },
                                        { title: 'Instant SOS', sub: 'One-tap panic beacon', color: '#E11D48', icon: LiquidAlertsIcon },
                                        { title: 'Multi-Tenant', sub: 'Strict org isolation', color: '#7C3AED', icon: LiquidSitesIcon },
                                    ].map((card) => {
                                        const CardIcon = card.icon;
                                        return (
                                            <div key={card.title} className="bg-white rounded-2xl p-5 border border-sky-100 shadow-2xs">
                                                <div className="hp-liquid-icon-badge !w-11 !h-11 mb-3.5">
                                                    <CardIcon className="w-6 h-6" style={{ color: card.color }} />
                                                </div>
                                                <div className="text-base font-extrabold text-slate-900">{card.title}</div>
                                                <div className="text-sm text-slate-600 mt-1">{card.sub}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 4. CANVA-STYLE TABBED INDUSTRY SOLUTIONS */}
                    <section id="solutions" className="bg-[#FFF9F4] border-y border-orange-100 py-22 lg:py-26">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-4xl mx-auto mb-12 space-y-4">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-[#EA580C] border border-orange-200 text-sm font-bold">
                                    9+ Verticals Ready Out of the Box
                                </span>
                                <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                                    Tailored for every field industry
                                </h2>
                                <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">
                                    Pick your vertical — Fieldy adapts terminology, checklists, and KPIs automatically.
                                </p>
                            </div>

                            {/* Centered Industry Pill Tabs */}
                            <div className="flex flex-wrap justify-center gap-2.5 mb-12">
                                {SOLUTIONS.map((sol) => {
                                    const active = sol.id === activeSolution.id;
                                    return (
                                        <button
                                            key={sol.id}
                                            type="button"
                                            onClick={() => setActiveSolutionId(sol.id)}
                                            className={`px-5 py-3 rounded-full text-sm sm:text-base font-bold transition-all cursor-pointer border ${
                                                active
                                                    ? 'text-white border-transparent shadow-md'
                                                    : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300'
                                            }`}
                                            style={active ? { backgroundColor: sol.color } : undefined}
                                        >
                                            {sol.short}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Editorial Split Showcase Card */}
                            <div
                                className="rounded-[32px] p-7 sm:p-12 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-10 items-center transition-colors"
                                style={{ backgroundColor: activeSolution.canvasBg }}
                            >
                                <div className="lg:col-span-6 space-y-6">
                                    <span
                                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-sm font-extrabold border border-slate-200/80 shadow-2xs"
                                        style={{ color: activeSolution.color }}
                                    >
                                        <span
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{ backgroundColor: activeSolution.color }}
                                        />
                                        {activeSolution.name}
                                    </span>

                                    <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                                        {activeSolution.headline}
                                    </h3>

                                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                                        {activeSolution.summary}
                                    </p>

                                    <ul className="space-y-3 pt-1">
                                        {activeSolution.bullets.map((b) => (
                                            <li key={b} className="flex items-center gap-3 text-base sm:text-lg font-bold text-slate-800">
                                                <span
                                                    className="w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0"
                                                    style={{ backgroundColor: activeSolution.color }}
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                </span>
                                                {b}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="pt-3 flex flex-wrap gap-3.5">
                                        <Link
                                            href={loginHref}
                                            className="hp-btn hp-btn-primary !h-13 !px-7 !text-base"
                                            style={{ backgroundColor: activeSolution.color }}
                                        >
                                            Open {activeSolution.short} Portal
                                            <ArrowRight className="w-5 h-5" />
                                        </Link>
                                        <a href="#pricing" className="hp-btn hp-btn-secondary !h-13 !px-6 !text-base">
                                            View Plans
                                        </a>
                                    </div>
                                </div>

                                <div className="lg:col-span-6">
                                    <div className="rounded-[24px] overflow-hidden border-4 border-white shadow-xl aspect-[16/10] bg-slate-200">
                                        <img
                                            key={activeSolution.id}
                                            src={activeSolution.image}
                                            alt={activeSolution.name}
                                            className="w-full h-full object-cover hp-animate-in"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 5. 3-STEP VISUAL WORKFLOW */}
                    <section id="workflow" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-22 lg:py-26">
                        <div className="text-center max-w-4xl mx-auto mb-16 space-y-4">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF7ED] text-[#EA580C] border border-orange-200 text-sm font-bold">
                                Launch in Under 30 Minutes
                            </span>
                            <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                                From dispatch to verified proof in 3 steps
                            </h2>
                            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">
                                Launch your entire field operation in under 30 minutes with Web Admin + Android APK.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
                            {WORKFLOW_STEPS.map((item) => {
                                const StepIcon = item.icon;
                                return (
                                    <div
                                        key={item.step}
                                        className="rounded-[28px] p-7 border border-slate-200/80 flex flex-col justify-between"
                                        style={{ backgroundColor: item.canvasBg }}
                                    >
                                        <div>
                                            <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-md aspect-[16/10] mb-6">
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <span
                                                    className="absolute top-3 left-3 px-3.5 py-1.5 rounded-full text-sm font-extrabold text-white shadow"
                                                    style={{ backgroundColor: item.accent }}
                                                >
                                                    STEP {item.step}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3.5 mb-3">
                                                <span className="hp-liquid-icon-badge !w-12 !h-12 shrink-0">
                                                    <StepIcon className="w-6 h-6" />
                                                </span>
                                                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                                                    {item.title}
                                                </h3>
                                            </div>
                                            <p className="text-base sm:text-[17px] text-slate-700 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 6. CANVA-STYLE TRANSPARENT PRICING */}
                    <section id="pricing" className="bg-[#F7F8FC] border-y border-slate-200/70 py-22 lg:py-26">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center max-w-4xl mx-auto mb-14 space-y-4">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-orange-200 text-sm font-bold text-[#EA580C]">
                                    <LiquidCrownIcon className="w-4 h-4" />
                                    Simple, Transparent Pricing
                                </span>
                                <h2 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-900 leading-[1.08]">
                                    Plans that grow with your field force
                                </h2>
                                <p className="text-slate-600 text-lg sm:text-xl leading-relaxed">
                                    Every plan includes the Liquid Glass Web Admin Portal and Fieldy Android App.
                                </p>

                                {/* Billing Cycle Toggle */}
                                <div className="inline-flex items-center p-1.5 rounded-full bg-white border border-slate-200 shadow-xs mt-5">
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('monthly')}
                                        className={`px-6 py-2.5 rounded-full text-sm sm:text-base font-bold transition-colors cursor-pointer ${
                                            billingCycle === 'monthly'
                                                ? 'bg-slate-900 text-white'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setBillingCycle('yearly')}
                                        className={`px-6 py-2.5 rounded-full text-sm sm:text-base font-bold transition-colors cursor-pointer flex items-center gap-2.5 ${
                                            billingCycle === 'yearly'
                                                ? 'bg-[#EA580C] text-white'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Yearly
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-500 text-white">
                                            Save 20%
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-stretch">
                                {PRICING_PLANS.map((plan) => {
                                    const price = billingCycle === 'yearly' ? plan.yearly : plan.monthly;
                                    return (
                                        <div
                                            key={plan.name}
                                            className={`bg-white rounded-[28px] p-8 sm:p-9 flex flex-col justify-between relative border ${
                                                plan.popular
                                                    ? 'border-2 border-[#EA580C] shadow-xl'
                                                    : 'border-slate-200/90 shadow-xs'
                                            }`}
                                        >
                                            {plan.popular && (
                                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-[#EA580C] text-white text-xs font-extrabold tracking-wide shadow">
                                                    MOST POPULAR
                                                </span>
                                            )}

                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                                    <h3 className="text-2xl sm:text-[26px] font-extrabold text-slate-900">{plan.name}</h3>
                                                    <span
                                                        className="px-3 py-1 rounded-full text-xs font-bold"
                                                        style={{ backgroundColor: plan.canvasBg, color: plan.accent }}
                                                    >
                                                        {plan.popular ? 'Best Value' : 'Full Suite'}
                                                    </span>
                                                </div>
                                                <p className="text-base text-slate-600 mb-7">{plan.subtitle}</p>

                                                <div className="mb-7 pb-7 border-b border-slate-100">
                                                    {price !== null ? (
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-5xl font-extrabold text-slate-900">
                                                                ₹{price.toLocaleString('en-IN')}
                                                            </span>
                                                            <span className="text-base font-semibold text-slate-500">
                                                                / month
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-5xl font-extrabold text-slate-900">
                                                                Custom
                                                            </span>
                                                            <span className="text-base font-semibold text-slate-500">
                                                                / enterprise
                                                            </span>
                                                        </div>
                                                    )}
                                                    <p className="text-sm font-medium text-slate-500 mt-2">
                                                        {price !== null
                                                            ? billingCycle === 'yearly'
                                                                ? 'Billed annually · Cancel anytime'
                                                                : 'Billed monthly · Upgrade anytime'
                                                            : 'Volume licensing, custom SLA & integrations'}
                                                    </p>
                                                </div>

                                                <ul className="space-y-3.5 mb-9">
                                                    {plan.features.map((feat) => (
                                                        <li key={feat} className="flex items-start gap-3 text-base font-semibold text-slate-700">
                                                            <span
                                                                className="w-6 h-6 rounded-full text-white flex items-center justify-center shrink-0 mt-0.5"
                                                                style={{ backgroundColor: plan.accent }}
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                            </span>
                                                            <span>{feat}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <Link
                                                href={loginHref}
                                                className="hp-btn hp-btn-primary w-full !h-13 !text-base justify-center"
                                                style={{ backgroundColor: plan.accent }}
                                            >
                                                {price !== null ? `Get started with ${plan.name}` : 'Open Enterprise Portal'}
                                                <ArrowUpRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* 7. TRUST & SECURITY STRIP */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-22 pb-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: ShieldCheck, color: '#4F46E5', bg: '#EEF2FF', title: 'Multi-Tenant Security', desc: 'Strict tenant isolation & role controls' },
                                { icon: WifiOff, color: '#EA580C', bg: '#FFF7ED', title: 'Field-Resilient App', desc: 'Reliable in low-signal & remote sites' },
                                { icon: Clock, color: '#059669', bg: '#ECFDF5', title: 'Real-Time Sync', desc: 'Live telemetry updates under 3 seconds' },
                                { icon: Globe, color: '#E11D48', bg: '#FFF1F2', title: 'Multi-Language Ready', desc: 'Built-in English & regional translation' },
                            ].map((item) => {
                                const TrustIcon = item.icon;
                                return (
                                    <div
                                        key={item.title}
                                        className="rounded-3xl p-7 border border-slate-200/80"
                                        style={{ backgroundColor: item.bg }}
                                    >
                                        <div className="hp-liquid-icon-badge !w-12 !h-12 mb-4">
                                            <TrustIcon className="w-6 h-6" style={{ color: item.color }} />
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">{item.title}</h3>
                                        <p className="text-sm sm:text-base text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 8. MINIMALIST CANVA-STYLE FAQ ACCORDION */}
                    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-18 lg:py-22">
                        <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 text-center mb-12">
                            Frequently asked questions
                        </h2>

                        <div className="divide-y divide-slate-200 border-y border-slate-200">
                            {FAQS.map((item, idx) => {
                                const isOpen = openFaq === idx;
                                return (
                                    <div key={item.q}>
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                                            className="w-full py-6 flex items-center justify-between gap-4 text-left cursor-pointer group"
                                        >
                                            <span className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#EA580C] transition-colors">
                                                {item.q}
                                            </span>
                                            <ChevronDown
                                                className={`w-6 h-6 text-slate-500 shrink-0 transition-transform duration-200 ${
                                                    isOpen ? 'rotate-180 text-[#EA580C]' : ''
                                                }`}
                                            />
                                        </button>
                                        {isOpen && (
                                            <div className="pb-6 text-base sm:text-lg text-slate-600 leading-relaxed">
                                                {item.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* 9. BOLD CENTERED FINAL CTA BANNER (SOLID COLOR, ZERO GRADIENTS) */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-22">
                        <div className="rounded-[32px] bg-[#140874] text-white px-6 py-16 sm:px-14 sm:py-20 text-center relative overflow-hidden shadow-2xl">
                            <div className="pointer-events-none absolute -top-20 -left-20 w-80 h-80 rounded-full bg-orange-500/25 blur-3xl" />
                            <div className="pointer-events-none absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-indigo-400/25 blur-3xl" />

                            <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                                <h2 className="text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight leading-[1.08]">
                                    Ready to transform your field operations?
                                </h2>
                                <p className="text-indigo-100/95 text-lg sm:text-xl leading-relaxed">
                                    Log in to your Fieldy Admin or Superadmin portal and start tracking live routes, visits, and proof today.
                                </p>
                                <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
                                    <Link
                                        href={loginHref}
                                        className="h-14 px-8 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white font-extrabold text-base sm:text-lg inline-flex items-center gap-2.5 border border-orange-300/50 shadow-[0_14px_34px_-8px_rgba(249,115,22,0.55),inset_0_1.5px_0_rgba(255,255,255,0.45)] transition-transform hover:-translate-y-0.5 active:scale-95"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        Log in to Fieldy Portal
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                    <a
                                        href="#features"
                                        className="h-14 px-7 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-xl border border-white/30 text-white font-bold text-base sm:text-lg inline-flex items-center gap-2 transition-colors"
                                    >
                                        Explore features
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* 10. CLEAN EDITORIAL FOOTER */}
                <footer className="border-t border-slate-200 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="text-xl font-extrabold text-slate-900">Fieldy</div>
                            <div className="text-sm text-slate-500">Field Workforce & Site Operations Cloud</div>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-base font-semibold text-slate-600">
                            <a href="#features" className="hover:text-[#EA580C] transition-colors">Features</a>
                            <a href="#solutions" className="hover:text-[#EA580C] transition-colors">Solutions</a>
                            <a href="#workflow" className="hover:text-[#EA580C] transition-colors">How It Works</a>
                            <a href="#pricing" className="hover:text-[#EA580C] transition-colors">Pricing</a>
                            <a href="#faq" className="hover:text-[#EA580C] transition-colors">FAQ</a>
                            <Link
                                href={loginHref}
                                className="hp-btn hp-btn-primary !h-10 !px-5 !text-sm"
                                style={{ backgroundColor: '#EA580C' }}
                            >
                                <LogIn className="w-4 h-4" />
                                Log in
                            </Link>
                        </div>

                        <div className="text-sm text-slate-500 font-medium">
                            © {new Date().getFullYear()} Fieldy. All rights reserved.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
