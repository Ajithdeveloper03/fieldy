import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { 
    Check, Sparkles, Shield, ArrowRight, CheckCircle2, Zap, Star, ShieldCheck,
    Smartphone, MapPin, Clock, Camera, FileCheck2, Users, FileSignature, 
    MessageSquare, Building2, Layers, Cpu, HelpCircle, ChevronRight, ArrowUpRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Subscriptions() {
    const { t } = useTranslation();
    const [selectedLevel, setSelectedLevel] = useState('field'); // 'workforce', 'field', 'pro'
    const [selectedTerm, setSelectedTerm] = useState('24'); // '24', '12', '1'
    const [activeServiceTab, setActiveServiceTab] = useState('all');

    const LEVELS = [
        {
            id: 'workforce',
            name: 'FIELDY WORKFORCE',
            tagline: t('Attendance, GPS & Shift Scheduling'),
            badge: t('Essential'),
            desc: t('Ideal for static & mobile crews needing biometric attendance, geofenced clock-in, overtime tracking & timesheet exports.'),
            prices: { '24': 299, '12': 499, '1': 699 },
            features: [
                'GPS Attendance & Geofencing',
                'Selfie Attendance & Face Recognition',
                'Multiple Sites & Geofences',
                'Shift Scheduling & Rotas',
                'Leave & Overtime Management',
                'Timesheets & Payroll Export (Tally/Excel)',
                'Employee Document Vault',
                'Offline Clock-in Sync'
            ]
        },
        {
            id: 'field',
            name: 'FIELDY FIELD',
            tagline: t('Field Visits, Tasks & Photo Proof'),
            badge: t('Most Popular'),
            popular: true,
            desc: t('Tailored for FMCG, facility inspection, solar, maintenance & field agents with live location, visit forms & audits.'),
            prices: { '24': 429, '12': 749, '1': 999 },
            features: [
                'Everything in FIELDY WORKFORCE',
                'Live Employee GPS Location & Breadcrumb Path',
                'Route & Mileage Travel History',
                'Field Visit & Audit Checklists',
                'Work & Task Dispatching',
                'Geo-tagged & Timestamped Photo Proof',
                'Custom Digital Inspection Forms',
                'Client & Facility Account Directory',
                'Expense & Fuel Claims'
            ]
        },
        {
            id: 'pro',
            name: 'FIELDY PRO',
            tagline: t('Full Service Management (Zoho FSM-Grade)'),
            badge: t('Enterprise Grade'),
            desc: t('Full service-management suite: requests, work orders, dispatch, crews, job sheets, customer e-signatures & WhatsApp API.'),
            prices: { '24': 799, '12': 1299, '1': 1699 },
            features: [
                'Everything in FIELDY FIELD',
                'Service Requests & Quotations/Estimates',
                'Dynamic Work Orders & Dispatch Board',
                'Crews & Multi-agent Team Scheduling',
                'Digital Job Sheets & Service Reports',
                'Customer On-Glass E-Signatures',
                'Client Asset & Preventive Maintenance Plans',
                'WhatsApp Work Order Automation',
                'Sales & Lead Pipeline Tracker',
                'Multi-Company / Multi-Branch Portal',
                'Open REST API & Webhooks'
            ]
        }
    ];

    const currentLevel = LEVELS.find(l => l.id === selectedLevel);

    const SERVICES = [
        {
            id: 'whatsapp',
            category: 'comms',
            name: 'WhatsApp Operations Hub',
            desc: 'Auto-dispatch job notifications, customer arrival alerts, and digital service reports via official WhatsApp Business API.',
            tag: 'Save up to 87%',
            status: 'AI Integrated',
            image: '/images/image1.jpg'
        },
        {
            id: 'route_opt',
            category: 'gps',
            name: 'Live Route Optimizer & Fuel Log',
            desc: 'AI-driven multi-stop route sequencing reduces travel distance by up to 28% with automated mileage & fuel reimbursement.',
            tag: 'Save up to 75%',
            status: 'Active',
            image: '/images/image2.jpg'
        },
        {
            id: 'face_kiosk',
            category: 'biometrics',
            name: 'Face Biometric Site Kiosk',
            desc: 'Convert any tablet into an offline biometric clock-in terminal with 0.2s anti-spoofing facial recognition and liveness check.',
            tag: 'Save up to 60%',
            status: 'Enterprise',
            image: '/images/image3.jpg'
        },
        {
            id: 'digital_jobsheets',
            category: 'fsm',
            name: 'Digital Job Sheets & Signatures',
            desc: 'Customer sign-off on glass, instant PDF service report generation, spare parts consumption, and client satisfaction scoring.',
            tag: 'Save up to 70%',
            status: 'FSM Core',
            image: '/images/image4.jpg'
        },
        {
            id: 'emirates_compliance',
            category: 'compliance',
            name: 'Emirates & ISO Compliance Suite',
            desc: 'Audit checklists aligned with UAE & international facility safety standards, automated non-conformance logging, and risk matrices.',
            tag: 'Save up to 80%',
            status: 'Certified',
            image: '/images/image5.jpg'
        },
        {
            id: 'multi_tenant',
            category: 'fsm',
            name: 'Multi-Company Tenant Sync',
            desc: 'Manage multiple subsidiaries, independent contractor networks, and localized branch policies under one master admin cockpit.',
            tag: 'Save up to 65%',
            status: 'Add-on',
            image: '/images/image6.jpg'
        }
    ];

    const filteredServices = activeServiceTab === 'all' 
        ? SERVICES 
        : SERVICES.filter(s => s.category === activeServiceTab);

    return (
        <AdminLayout>
            <div className="space-y-12 pb-16 hp-animate-in">

                {/* ══════════ TOP HERO SHOWCASE (IMAGE 1 TOP REPLICA) ══════════ */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <span className="hp-chip hp-chip-primary mb-2">
                                <Sparkles className="w-3 h-3 mr-1" /> {t('Fieldy Automation Matrix')}
                            </span>
                            <h1 className="text-3xl sm:text-4xl font-bold text-hp-dark tracking-tight">
                                {t('Your field force works. You don\'t have to.')}
                            </h1>
                            <p className="text-sm sm:text-base text-hp-muted mt-1 max-w-2xl">
                                {t('Set automated workflows once. Fieldy keeps tracking, dispatching, and verifying on site, on the road, or while you rest.')}
                            </p>
                        </div>
                    </div>

                    {/* 3 Showcase Bento Cards (Exact Image 1 Style) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                        {/* Card 1 */}
                        <div className="hp-bento-card relative overflow-hidden group">
                            <div className="h-52 rounded-xl overflow-hidden relative mb-4">
                                <img 
                                    src="/images/image1.jpg" 
                                    alt="Attendance Automation" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                                
                                {/* Floating Badges */}
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                                    <MapPin className="w-3.5 h-3.5 text-orange-400" />
                                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                                </div>

                                {/* Floating prompt snippet like Hostinger card */}
                                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-white/40">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-hp-dark leading-snug">
                                            {t('Geofenced auto punch-in verified via biometric face check across all 14 project sites.')}
                                        </p>
                                        <span className="w-6 h-6 rounded-full bg-hp-dark text-white flex items-center justify-center shrink-0">
                                            <Zap className="w-3 h-3 text-hp-primary" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-base text-hp-dark">{t('GPS Geofencing & Biometric Attendance')}</h3>
                            <p className="text-xs text-hp-muted mt-1 leading-relaxed">
                                {t('Automated clock-in, selfie verification, and shift rotation logs sent straight to timesheet payroll.')}
                            </p>
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-hp-border text-[11px] font-semibold text-hp-muted">
                                <span>{t('Recommended for:')}</span>
                                <span className="hp-chip hp-chip-gray !h-5">Jibble Alternative</span>
                                <span className="hp-chip hp-chip-gray !h-5">Truein Ready</span>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="hp-bento-card relative overflow-hidden group">
                            <div className="h-52 rounded-xl overflow-hidden relative mb-4">
                                <img 
                                    src="/images/image2.jpg" 
                                    alt="Work Orders & CRM" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                                
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                                    <FileCheck2 className="w-3.5 h-3.5 text-orange-400" />
                                    <FileSignature className="w-3.5 h-3.5 text-emerald-400" />
                                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-white/40">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-hp-dark leading-snug">
                                            {t('Instant dispatch to nearest HVAC technician with digital job sheet and customer signature pad.')}
                                        </p>
                                        <span className="w-6 h-6 rounded-full bg-hp-dark text-white flex items-center justify-center shrink-0">
                                            <Zap className="w-3 h-3 text-hp-primary" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-base text-hp-dark">{t('Zoho FSM-Grade Work Orders & Signatures')}</h3>
                            <p className="text-xs text-hp-muted mt-1 leading-relaxed">
                                {t('Auto-dispatch requests, digital estimates, service reports, and client customer signatures on glass.')}
                            </p>
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-hp-border text-[11px] font-semibold text-hp-muted">
                                <span>{t('Recommended for:')}</span>
                                <span className="hp-chip hp-chip-gray !h-5">Zoho FSM Match</span>
                                <span className="hp-chip hp-chip-gray !h-5">OptifyServe</span>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="hp-bento-card relative overflow-hidden group">
                            <div className="h-52 rounded-xl overflow-hidden relative mb-4">
                                <img 
                                    src="/images/image3.jpg" 
                                    alt="Live Telemetry" 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                                
                                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
                                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <Users className="w-3.5 h-3.5 text-purple-400" />
                                </div>

                                <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-md border border-white/40">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-hp-dark leading-snug">
                                            {t('Live GPS breadcrumb telemetry alerts admin if patrol route is deviated or officer battery drops < 15%.')}
                                        </p>
                                        <span className="w-6 h-6 rounded-full bg-hp-dark text-white flex items-center justify-center shrink-0">
                                            <Zap className="w-3 h-3 text-hp-primary" />
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <h3 className="font-bold text-base text-hp-dark">{t('Live GPS Tracking & Route History')}</h3>
                            <p className="text-xs text-hp-muted mt-1 leading-relaxed">
                                {t('Monitor live worker locations on interactive maps with real-time mileage, speed, and geofence safety alerts.')}
                            </p>
                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-hp-border text-[11px] font-semibold text-hp-muted">
                                <span>{t('Recommended for:')}</span>
                                <span className="hp-chip hp-chip-gray !h-5">TrackoField Match</span>
                                <span className="hp-chip hp-chip-gray !h-5">Emirates Compliance</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════ TIER SELECTOR & MATRIX (IMAGE 1 BOTTOM REPLICA) ══════════ */}
                <div className="space-y-6 pt-6">
                    <div className="text-center max-w-xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                            {t('One plan for any application. Change anytime')}
                        </h2>
                        <p className="text-xs sm:text-sm text-hp-muted mt-1">
                            {t('Pick the edition you want to deploy first. You can upgrade or switch anytime from the dashboard.')}
                        </p>
                    </div>

                    {/* Level Selector Buttons (WORKFORCE / FIELD / PRO) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                        {LEVELS.map((level) => {
                            const isSelected = selectedLevel === level.id;
                            return (
                                <button
                                    key={level.id}
                                    type="button"
                                    onClick={() => setSelectedLevel(level.id)}
                                    className={`p-4 rounded-2xl text-left border-2 transition-all relative ${
                                        isSelected 
                                            ? 'border-hp-primary bg-white shadow-md' 
                                            : 'border-hp-border bg-white/70 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-hp-primary' : 'text-hp-muted'}`}>
                                            {level.badge}
                                        </span>
                                        {level.popular && (
                                            <span className="hp-chip hp-chip-primary !h-5 !text-[10px]">
                                                {t('Recommended')}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-base font-bold text-hp-dark">{level.name}</h4>
                                    <p className="text-xs text-hp-muted mt-0.5 line-clamp-1">{level.tagline}</p>
                                </button>
                            );
                        })}
                    </div>

                    {/* Main Pricing & Feature Breakdown Split (Exact Hostinger Layout) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto">
                        
                        {/* Left Side: Term Radio Options (24 / 12 / 1 mo) */}
                        <div className="lg:col-span-6 space-y-3">
                            <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">
                                {t('Select Billing Term')}
                            </p>

                            {/* 24 Months Card */}
                            <div 
                                onClick={() => setSelectedTerm('24')}
                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative ${
                                    selectedTerm === '24'
                                        ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600/30'
                                        : 'border-hp-border bg-white hover:border-slate-300'
                                }`}
                            >
                                <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold">
                                    {t('Recommended')}
                                </span>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTerm === '24' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                            {selectedTerm === '24' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-hp-dark">24 {t('months')}</p>
                                            <p className="text-xs text-emerald-600 font-semibold">{t('Save 73% off standard rate')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-hp-muted line-through">₹ 1,599.00</p>
                                        <p className="text-xl font-bold text-hp-dark">₹ {currentLevel.prices['24']} <span className="text-xs font-normal text-hp-muted">/agent/mo</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* 12 Months Card */}
                            <div 
                                onClick={() => setSelectedTerm('12')}
                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                    selectedTerm === '12'
                                        ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600/30'
                                        : 'border-hp-border bg-white hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTerm === '12' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                            {selectedTerm === '12' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-hp-dark">12 {t('months')}</p>
                                            <p className="text-xs text-emerald-600 font-semibold">{t('Save 63% off standard rate')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-hp-muted line-through">₹ 1,599.00</p>
                                        <p className="text-xl font-bold text-hp-dark">₹ {currentLevel.prices['12']} <span className="text-xs font-normal text-hp-muted">/agent/mo</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* 1 Month Card */}
                            <div 
                                onClick={() => setSelectedTerm('1')}
                                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                                    selectedTerm === '1'
                                        ? 'border-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600/30'
                                        : 'border-hp-border bg-white hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedTerm === '1' ? 'border-indigo-600' : 'border-slate-300'}`}>
                                            {selectedTerm === '1' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />}
                                        </div>
                                        <div>
                                            <p className="text-base font-bold text-hp-dark">1 {t('month')}</p>
                                            <p className="text-xs text-hp-muted">{t('Flexible monthly billing')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-hp-muted line-through">₹ 1,599.00</p>
                                        <p className="text-xl font-bold text-hp-dark">₹ {currentLevel.prices['1']} <span className="text-xs font-normal text-hp-muted">/agent/mo</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Main CTA Button */}
                            <div className="pt-2">
                                <button
                                    type="button"
                                    className="w-full h-12 rounded-xl bg-hp-dark hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                                >
                                    <span>{t('Choose plan')}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                                <p className="text-center text-[11px] text-hp-muted mt-2">
                                    {t('Renews at standard rate. Instant activation for up to 100 field officers.')}
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Feature Checklist (Hostinger Image 1 Style) */}
                        <div className="lg:col-span-6 bg-white border border-hp-border rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                            
                            <div>
                                <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-3">
                                    {t('Setup & Management')}
                                </p>
                                <ul className="space-y-2.5 text-xs sm:text-sm text-hp-dark">
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{t('Ready out of the box — zero hardware required')}</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{t('No server maintenance or manual database tuning')}</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{t('Full geofence security & GPS encryption')}</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        <span>{t('Switch editions or upgrade seats anytime')}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-hp-border">
                                <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-3">
                                    {t('Included in')} {currentLevel.name}
                                </p>
                                <ul className="space-y-2.5 text-xs sm:text-sm text-hp-dark">
                                    {currentLevel.features.slice(0, 6).map((feat, i) => (
                                        <li key={i} className="flex items-center gap-2.5">
                                            <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-hp-border">
                                <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-3">
                                    {t('Enterprise Capabilities')}
                                </p>
                                <ul className="space-y-2.5 text-xs sm:text-sm text-hp-dark">
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-hp-primary shrink-0" />
                                        <span>{t('Multi-industry templates (FM, Security, Cleaning, Solar)')}</span>
                                    </li>
                                    <li className="flex items-center gap-2.5">
                                        <Check className="w-4 h-4 text-hp-primary shrink-0" />
                                        <span>{t('Works with WhatsApp & SMS dispatch triggers')}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="pt-4 border-t border-hp-border flex items-center justify-between text-xs text-hp-muted font-medium">
                                <span className="flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    {t('30-day money-back guarantee')}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    {t('24/7 dedicated support')}
                                </span>
                            </div>

                        </div>
                    </div>
                </div>

                {/* ══════════ MORE SERVICES & ADD-ONS MARKETPLACE (IMAGE 5 REPLICA) ══════════ */}
                <div className="space-y-6 pt-10 border-t border-hp-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-hp-dark tracking-tight">
                                {t('More services & operational add-ons')}
                            </h2>
                            <p className="text-xs sm:text-sm text-hp-muted mt-0.5">
                                {t('Expand your workforce capabilities with certified add-on modules and API connectors.')}
                            </p>
                        </div>
                    </div>

                    {/* Filter Pills (All, Attendance, FSM, Biometrics, WhatsApp) */}
                    <div className="hp-segmented-bar overflow-x-auto max-w-full">
                        {[
                            { id: 'all', label: 'All Modules' },
                            { id: 'gps', label: 'Attendance & GPS' },
                            { id: 'fsm', label: 'Service Management (Zoho FSM)' },
                            { id: 'biometrics', label: 'Biometrics & Face ID' },
                            { id: 'comms', label: 'WhatsApp & Communications' },
                            { id: 'compliance', label: 'Compliance & Audits' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveServiceTab(tab.id)}
                                className={`hp-segmented-item ${activeServiceTab === tab.id ? 'is-active-primary' : ''}`}
                            >
                                {t(tab.label)}
                            </button>
                        ))}
                    </div>

                    {/* Promo Hero Banner (From Image 5 Top: "Automate any business task...") */}
                    <div className="hp-card-gradient-charcoal rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md border border-zinc-700">
                        <div className="max-w-xl space-y-2">
                            <span className="hp-chip hp-chip-primary !bg-orange-500/20 !text-orange-400">
                                <Sparkles className="w-3 h-3 mr-1" /> {t('Operations Acceleration')}
                            </span>
                            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                {t('Automate any field service task with your own AI dispatcher')}
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-300">
                                {t('From emergency route optimization to customer SLA escalation handling — let Fieldy intelligent workflows run while you focus on growth.')}
                            </p>
                            <div className="pt-2 flex items-center gap-4">
                                <button
                                    type="button"
                                    className="hp-btn hp-btn-primary !rounded-full text-xs font-bold shadow-sm"
                                >
                                    {t('Claim operations deal')}
                                </button>
                                <span className="text-xs text-zinc-400">
                                    {t('From ₹ 569/mo · Instant deployment')}
                                </span>
                            </div>
                        </div>

                        <div className="w-full md:w-72 h-44 rounded-2xl overflow-hidden relative border border-zinc-700/80 shrink-0">
                            <img src="/images/image5.jpg" alt="AI Agent Dispatch" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                            <div className="absolute bottom-3 left-3 bg-white/95 text-hp-dark text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                99.4% {t('On-Time Dispatch Rate')}
                            </div>
                        </div>
                    </div>

                    {/* 3-Column Add-on Service Bento Cards Grid (Image 5 Bottom) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredServices.map((service) => (
                            <div 
                                key={service.id}
                                className="hp-bento-card group flex flex-col justify-between"
                            >
                                <div>
                                    {/* Thumbnail Visual */}
                                    <div className="hp-card-visual h-44 mb-4 flex items-center justify-center relative">
                                        <img 
                                            src={service.image} 
                                            alt={service.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                                        
                                        <div className="absolute top-3 right-3">
                                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] shadow-sm">
                                                {service.tag}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-3 left-3">
                                            <span className="hp-chip hp-chip-gray !bg-white/90 text-hp-dark font-mono text-[11px] backdrop-blur-sm">
                                                {service.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Service Description */}
                                    <div className="space-y-1.5">
                                        <h4 className="font-bold text-base text-hp-dark group-hover:text-hp-primary transition-colors">
                                            {service.name}
                                        </h4>
                                        <p className="text-xs text-hp-muted leading-relaxed">
                                            {service.desc}
                                        </p>
                                    </div>
                                </div>

                                {/* Bottom Button */}
                                <div className="mt-5 pt-3 border-t border-hp-border">
                                    <button 
                                        type="button"
                                        className="hp-btn hp-btn-outline w-full !rounded-xl !h-10 text-xs font-bold group-hover:bg-hp-primary group-hover:text-white group-hover:border-hp-primary transition-colors"
                                    >
                                        <span>{t('Explore module')}</span>
                                        <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
