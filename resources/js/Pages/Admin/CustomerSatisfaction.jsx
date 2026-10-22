import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Link, router } from '@inertiajs/react';
import { 
    Star, Search, Sparkles, ShieldCheck, HeartHandshake, CheckCircle2, 
    ThumbsUp, AlertTriangle, ArrowUpRight, MessageSquare, Building2, User,
    FileSignature, Camera, MapPin, Clock, Filter, ChevronDown, Check, ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CustomerSatisfaction() {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [industryFilter, setIndustryFilter] = useState('all');

    const METRICS = [
        { label: 'CSAT Index', val: '98.4%', sub: 'Customer Satisfaction Score', change: '+2.1% this month' },
        { label: 'Avg Rating', val: '4.9★', sub: 'Across 4,890 completed jobs', change: 'Top quartile' },
        { label: 'First-Time Fix', val: '96.2%', sub: 'Resolved on first dispatch', change: '+3.4% SLA benchmark' },
        { label: 'On-Glass Signatures', val: '100%', sub: 'Zero unsigned job sheets', change: 'Audit certified' },
        { label: 'Photo Proof Stamped', val: '99.8%', sub: 'GPS & timestamped audit trail', change: 'Zero disputes' },
        { label: 'SLA Response Time', val: '< 18 min', sub: 'Critical emergency dispatch', change: '-4m faster than target' },
    ];

    const REVIEWS = [
        {
            id: 'REV-101',
            client: 'Metro Central Logistics Hub',
            facilityCode: 'FAC-008',
            industry: 'Logistics & Warehousing',
            technician: 'Karthik Raja',
            task: 'HVAC Air Handling Unit Preventive Servicing',
            rating: 5,
            date: 'Today, 02:45 PM',
            comment: 'Technician arrived 12 minutes ahead of scheduled window. Digital checklist completed with all pressure readings and photographic evidence. Signed off on glass immediately.',
            signatureVerified: true,
            photosCount: 4,
            category: 'logistics'
        },
        {
            id: 'REV-102',
            client: 'Apex Grand IT Tech Park',
            facilityCode: 'FAC-004',
            industry: 'Facility Management',
            technician: 'Suresh Kumar',
            task: 'Fire Suppression & Emergency Exit System Audit',
            rating: 5,
            date: 'Today, 11:30 AM',
            comment: 'Thorough compliance audit in adherence to Emirates & local civil defense standards. Instant PDF service report received via WhatsApp before technician left site.',
            signatureVerified: true,
            photosCount: 6,
            category: 'fm'
        },
        {
            id: 'REV-103',
            client: 'SunPower Mega Solar Array',
            facilityCode: 'FAC-012',
            industry: 'Solar & Renewable',
            technician: 'Murugan Velu',
            task: 'Inverter Grid Synchronization & Photovoltaic Clean',
            rating: 4.8,
            date: 'Yesterday, 04:15 PM',
            comment: 'Very professional crew. Cleaning output restored generation by 7.4%. Highly satisfied with the prompt dispatch and live GPS tracking.',
            signatureVerified: true,
            photosCount: 5,
            category: 'solar'
        },
        {
            id: 'REV-104',
            client: 'Greenfield Residencies (3 towers)',
            facilityCode: 'FAC-019',
            industry: 'Cleaning & Janitorial',
            technician: 'Vigneshwaran P',
            task: 'Deep Sanitization & Water Reservoir Treatment',
            rating: 4.9,
            date: '21 Oct, 03:00 PM',
            comment: 'All chemical safety data sheets verified before treatment. Resident association acknowledged clean handover with customer e-signature.',
            signatureVerified: true,
            photosCount: 3,
            category: 'cleaning'
        }
    ];

    const filteredReviews = industryFilter === 'all' 
        ? REVIEWS 
        : REVIEWS.filter(r => r.category === industryFilter);

    return (
        <AdminLayout>
            <div className="space-y-8 pb-16 hp-animate-in">

                {/* ══════════ HOSTINGER IMAGE 2 REPLICA: HERO DOMAIN/SEARCH CONTAINER ══════════ */}
                <div className="hp-card-gradient-lavender rounded-3xl p-6 sm:p-10 shadow-xs border border-indigo-100 text-center relative overflow-hidden">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <span className="hp-chip hp-chip-primary !bg-white/80 !text-hp-primary shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 mr-1" /> {t('Customer Satisfaction & SLA Analytics')}
                        </span>
                        
                        <h1 className="text-2xl sm:text-4xl font-bold text-hp-dark tracking-tight">
                            {t('Search client satisfaction & audit reports')}
                        </h1>
                        <p className="text-xs sm:text-sm text-hp-muted">
                            {t('Monitor customer feedback, on-glass e-signatures, photo audits, and field performance ratings across all industry contracts.')}
                        </p>

                        {/* Hostinger Glowing Pill Search Bar (From Reference Image 2) */}
                        <div className="pt-2 max-w-xl mx-auto">
                            <div className="bg-white/95 rounded-full p-2 pl-5 flex items-center gap-3 shadow-md border-2 border-indigo-200/80 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-100 transition-all">
                                <Search className="w-4 h-4 text-indigo-500 shrink-0" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder={t('Search by client facility, technician name, or service order #...')}
                                    className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                />
                                <button
                                    type="button"
                                    className="w-8 h-8 rounded-full bg-hp-primary hover:bg-hp-primary-hover text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
                                >
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Hostinger Domain / Metric Pill Boxes Grid (Exact Image 2 Style) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4">
                            {METRICS.map((m, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-3 border border-indigo-100/70 shadow-xs text-left">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-indigo-700">{m.label}</span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    </div>
                                    <p className="text-lg font-bold text-hp-dark mt-1">{m.val}</p>
                                    <p className="text-[10px] text-hp-muted truncate">{m.change}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER IMAGE 2: 3 BENTO HIGHLIGHT CARDS ══════════ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Bento 1: Violet Gradient Retention Card */}
                    <div className="hp-card-gradient-lavender rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-xs border border-indigo-200/70">
                        <div className="space-y-3">
                            <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                %
                            </span>
                            <h3 className="text-2xl font-bold text-hp-dark">
                                98.8% {t('Annual Client Retention Rate')}
                            </h3>
                            <p className="text-xs text-hp-muted leading-relaxed">
                                {t('Facilities on Fieldy automated dispatch renew service agreements 3.2x higher than traditional paper systems.')}
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-indigo-100 flex items-center justify-between text-xs font-bold text-indigo-900">
                            <span>{t('Zero Contract Breaches')}</span>
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                    </div>

                    {/* Bento 2: Center Image Card with Proof Metrics */}
                    <div className="rounded-3xl overflow-hidden relative min-h-[220px] shadow-xs border border-hp-border group">
                        <img 
                            src="/images/image4.jpg" 
                            alt="Technician Signoff" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
                        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="hp-chip hp-chip-success !bg-emerald-500/90 !text-white text-[11px]">
                                    {t('100% Signed On Glass')}
                                </span>
                            </div>
                            <h4 className="text-2xl font-bold">4,890+ {t('Work Orders Verified')}</h4>
                            <p className="text-xs text-white/80">
                                {t('Complete with GPS geofence stamp, photo proof, and digital customer signature.')}
                            </p>
                        </div>
                    </div>

                    {/* Bento 3: Deep Midnight Card with Instant Action */}
                    <div className="hp-card-gradient-charcoal rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-md border border-zinc-700 text-white">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm">
                                    <Sparkles className="w-5 h-5" />
                                </span>
                                <ArrowUpRight className="w-5 h-5 text-zinc-400" />
                            </div>
                            <h3 className="text-2xl font-bold">
                                {t('Automated SLA Escalation Hub')}
                            </h3>
                            <p className="text-xs text-zinc-300 leading-relaxed">
                                {t('If a client rates any completed service under 4 stars, an emergency re-inspection task is automatically dispatched to the supervisor.')}
                            </p>
                        </div>
                        <div className="pt-4 mt-4 border-t border-zinc-700/80 flex items-center justify-between text-xs font-semibold text-zinc-300">
                            <span>{t('Active Auto-Routing')}</span>
                            <span className="text-orange-400 font-bold">{t('Instant SLA Guard')}</span>
                        </div>
                    </div>
                </div>

                {/* ══════════ INDUSTRY FILTER & CLIENT REVIEWS LEDGER ══════════ */}
                <div className="space-y-4 pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold text-hp-dark tracking-tight">
                                {t('Recent Client Sign-Offs & Customer Feedback')}
                            </h2>
                            <p className="text-xs text-hp-muted">
                                {t('Real-time feed of digital job sheet completions and customer satisfaction ratings.')}
                            </p>
                        </div>

                        {/* Industry Segmented Pills */}
                        <div className="hp-segmented-bar overflow-x-auto max-w-full">
                            {[
                                { id: 'all', label: 'All Industries' },
                                { id: 'fm', label: 'Facility Management' },
                                { id: 'logistics', label: 'Logistics' },
                                { id: 'solar', label: 'Solar & Energy' },
                                { id: 'cleaning', label: 'Cleaning' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setIndustryFilter(tab.id)}
                                    className={`hp-segmented-item ${industryFilter === tab.id ? 'is-active-primary' : ''}`}
                                >
                                    {t(tab.label)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredReviews.map((rev) => (
                            <div key={rev.id} className="hp-bento-card space-y-4 hover:border-slate-300 transition-all">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center font-bold text-hp-primary shrink-0">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-hp-dark">{rev.client}</h4>
                                            <p className="text-xs text-hp-muted">{rev.facilityCode} · {rev.industry}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shrink-0">
                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-bold text-amber-700">{rev.rating}</span>
                                    </div>
                                </div>

                                <p className="text-xs text-hp-dark/90 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                                    "{rev.comment}"
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-hp-border text-xs text-hp-muted">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 font-semibold text-hp-dark">
                                            <User className="w-3.5 h-3.5 text-hp-muted" /> {rev.technician}
                                        </span>
                                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                                            <FileSignature className="w-3.5 h-3.5" /> {t('Signed on Glass')}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-mono text-hp-muted">{rev.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
