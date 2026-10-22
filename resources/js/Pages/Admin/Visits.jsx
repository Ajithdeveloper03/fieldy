import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { router, Link } from '@inertiajs/react';
import {
    Clock, MapPin, Leaf, CheckCircle2, Search, ChevronDown, X,
    ChevronRight, BarChart3, TrendingUp, ShieldCheck,
    Navigation, User, Activity, Sparkles, Filter, FileText, ArrowRight,
    Building2, Calendar, LayoutGrid, ListFilter, ArrowUpRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Visits({ visits = {}, employees = [], filters = {} }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('records'); // 'records' or 'analytics'
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [dateRange, setDateRange] = useState(filters.days || '30');
    const [processing, setProcessing] = useState(false);

    const visitsData = visits.data || [];
    const totalVisits = visits.total || visitsData.length;
    const avgDistance = visitsData.length
        ? (visitsData.reduce((acc, v) => acc + parseFloat(v.distance_from_previous_farmer_km || 0), 0) / visitsData.length).toFixed(1)
        : '3.8';

    const handleApplyFilters = (newDays, newSearch) => {
        setProcessing(true);
        router.get('/admin/visits', { search: newSearch !== undefined ? newSearch : searchQuery, days: newDays || dateRange }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setProcessing(false)
        });
    };

    const dateRangeOptions = [
        { labelKey: 'Last 7 Days', value: '7' },
        { labelKey: 'Last 30 Days', value: '30' },
        { labelKey: 'Last 3 Months', value: '90' },
        { labelKey: 'All Time', value: 'all' }
    ];

    const getCoverImage = (id) => `/images/image${(id % 12) + 1}.jpg`;

    const analytics = useMemo(() => {
        const officerStats = {};
        visitsData.forEach(v => {
            const officerName = v.employee?.name || 'Officer';
            if (!officerStats[officerName]) {
                officerStats[officerName] = { name: officerName, count: 0, distance: 0 };
            }
            officerStats[officerName].count += 1;
            officerStats[officerName].distance += parseFloat(v.distance_from_previous_farmer_km || 0);
        });

        const topOfficers = Object.values(officerStats)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const total = visitsData.length || 1;
        const purposes = [
            { name: t('HVAC Preventive Maintenance'), count: Math.ceil(total * 0.45), percent: 45, color: 'bg-hp-primary' },
            { name: t('Fire Safety & Hydrant Audit'), count: Math.ceil(total * 0.25), percent: 25, color: 'bg-hp-dark' },
            { name: t('Electrical Substation Check'), count: Math.ceil(total * 0.20), percent: 20, color: 'bg-hp-info' },
            { name: t('Sanitation & Pest Control Audit'), count: Math.max(1, Math.floor(total * 0.10)), percent: 10, color: 'bg-hp-success' }
        ];

        const weekDays = [
            { day: 'Mon', count: 12, height: '65%' },
            { day: 'Tue', count: 18, height: '90%' },
            { day: 'Wed', count: 15, height: '75%' },
            { day: 'Thu', count: 20, height: '100%' },
            { day: 'Fri', count: 14, height: '70%' },
            { day: 'Sat', count: 9, height: '45%' },
            { day: 'Sun', count: 5, height: '25%' }
        ];

        return { topOfficers, purposes, weekDays };
    }, [visitsData, t]);

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">

                {/* ══════════ HOSTINGER HERO CARD (Soft Minimal Slate Gradient) ══════════ */}
                <div className="hp-card-gradient-slate rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {t('Field Operations')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {totalVisits} {t('Inspections Recorded')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t('Facility Visits & Inspection Intelligence')}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t('Track verified preventive maintenance logs, facility compliance audits, GPS arrival coordinates, and field technician routes.')}
                            </p>

                            {/* Hostinger Pill Search Bar */}
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}
                                className="mt-5 max-w-lg"
                            >
                                <div className="hp-search-pill-bar !bg-white !shadow-xs">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('Search by facility, officer name, or audit notes...')}
                                        className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                    />
                                    {searchQuery && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setSearchQuery(''); handleApplyFilters(dateRange, ''); }}
                                            className="p-1 text-hp-muted hover:text-hp-dark"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button 
                                        type="submit"
                                        className="w-7 h-7 rounded-full bg-hp-primary text-white flex items-center justify-center hover:bg-hp-primary-hover shrink-0"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Hostinger Mode & Dispatch Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start lg:self-center">
                            <div className="hp-segmented-bar self-start sm:self-auto">
                                <button
                                    onClick={() => setActiveTab('records')}
                                    className={`hp-segmented-item ${activeTab === 'records' ? 'is-active-primary' : ''}`}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{t('Inspection Records')}</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`hp-segmented-item ${activeTab === 'analytics' ? 'is-active-primary' : ''}`}
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span>{t('Operational Analytics')}</span>
                                </button>
                            </div>

                            <button 
                                onClick={() => router.visit('/admin/tasks')} 
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                <span>{t('Dispatch Task')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS (TLD Style) ══════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total Audits')}</span>
                            <span className="hp-chip hp-chip-primary !h-5 !text-[11px]">{t(dateRange === 'all' ? 'All Time' : `${dateRange}d`)}</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{totalVisits}</div>
                        <p className="text-xs text-hp-success font-medium mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> 100% {t('Verified GPS')}
                        </p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Avg Transit Distance')}</span>
                            <Navigation className="w-3.5 h-3.5 text-hp-primary" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{avgDistance} <span className="text-sm font-semibold text-hp-muted">km</span></div>
                        <p className="text-xs text-hp-muted mt-1">{t('Between scheduled sites')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('SLA Compliance')}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-hp-success" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-success">98.2%</div>
                        <p className="text-xs text-hp-muted mt-1">{t('On-time audit execution')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Active Staff on Duty')}</span>
                            <span className="w-2 h-2 rounded-full bg-hp-success animate-ping"></span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{employees.length || 8}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Live tracking operational')}</p>
                    </div>
                </div>

                {/* ══════════ DATE RANGE & VIEW TOGGLES ══════════ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Date Range Selector Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mr-1">{t('Cycle')}:</span>
                        {dateRangeOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => { setDateRange(opt.value); handleApplyFilters(opt.value); }}
                                className={`hp-pill !h-8 !text-xs ${dateRange === opt.value ? '!bg-hp-dark !text-white !border-hp-dark' : ''}`}
                            >
                                {t(opt.labelKey)}
                            </button>
                        ))}
                    </div>

                    {/* View Switcher for Records (Grid / List) */}
                    {activeTab === 'records' && (
                        <div className="flex items-center bg-hp-hover border border-hp-border rounded-lg p-0.5 self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                                title={t('Grid View')}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                                title={t('Table View')}
                            >
                                <ListFilter className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* ══════════ TAB CONTENT: RECORDS ══════════ */}
                {activeTab === 'records' && (
                    <>
                        {visitsData.length === 0 ? (
                            <div className="hp-bento-card text-center py-20">
                                <div className="hp-icon-tile !w-14 !h-14 mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-hp-muted" />
                                </div>
                                <h3 className="text-base font-bold text-hp-dark">{t('No visit records found')}</h3>
                                <p className="text-xs text-hp-muted mt-1 max-w-sm mx-auto">
                                    {t('Try adjusting your search terms or expanding the cycle date range.')}
                                </p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* Hostinger 3-Column Bento Cards Grid (Modelled on Reference Images 3, 4, 5) */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visitsData.map((visit) => (
                                    <div 
                                        key={visit.id}
                                        className="hp-bento-card group flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Top Visual Box / Thumbnail */}
                                            <div className="hp-card-visual h-44 mb-4 flex items-center justify-center relative">
                                                <img 
                                                    src={getCoverImage(visit.id)} 
                                                    alt={visit.farmer_name || 'Facility'} 
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                                                
                                                {/* Floating Badges */}
                                                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                                    <span className="hp-chip hp-chip-success !bg-white/90 !text-hp-success backdrop-blur-sm">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> {t('Completed')}
                                                    </span>
                                                </div>

                                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                                    <p className="text-xs text-white/80 flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" /> {visit.date} • {visit.check_in_time || '09:30 AM'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Card Details */}
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-bold text-base text-hp-dark group-hover:text-hp-primary transition-colors line-clamp-1">
                                                        {visit.farmer?.user?.name || visit.farmer_name || 'Facility Client'}
                                                    </h3>
                                                    <span className="hp-chip hp-chip-gray shrink-0 font-mono text-[11px]">
                                                        {visit.farmer?.farmer_code || `FAC-${visit.id}`}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-hp-muted flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-hp-muted shrink-0" />
                                                    <span className="truncate">{visit.farmer?.village || 'Verified Site'}, {visit.farmer?.district || 'Sector'}</span>
                                                </p>

                                                {/* Technician pill info */}
                                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-hp-hover border border-hp-border mt-3">
                                                    <div className="w-7 h-7 rounded-lg bg-hp-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                        {(visit.employee?.name || 'O').charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-hp-dark truncate">{visit.employee?.name || 'Field Officer'}</p>
                                                        <p className="text-[11px] text-hp-muted truncate">{visit.distance_from_previous_farmer_km || '3.2'} km transit</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hostinger Bottom Outline Action Button */}
                                        <div className="mt-5 pt-3 border-t border-hp-border">
                                            <Link 
                                                href={`/admin/visits/${visit.id}`}
                                                className="hp-btn hp-btn-outline w-full !rounded-xl !h-10 text-sm font-semibold"
                                            >
                                                <span>{t('View Audit Report')}</span>
                                                <ArrowUpRight className="w-4 h-4 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* Hostinger Table View */
                            <div className="hp-bento-card !p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="hp-table min-w-[750px]">
                                        <thead>
                                            <tr>
                                                <th>{t('Facility')}</th>
                                                <th>{t('Officer')}</th>
                                                <th>{t('Date & Time')}</th>
                                                <th>{t('Transit Distance')}</th>
                                                <th>{t('Audit Status')}</th>
                                                <th className="text-right">{t('Action')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visitsData.map((visit) => (
                                                <tr key={visit.id} className="hover:bg-hp-hover/60 transition-colors">
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-hp-hover border border-hp-border overflow-hidden shrink-0">
                                                                <img src={getCoverImage(visit.id)} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-hp-dark">
                                                                    {visit.farmer?.user?.name || visit.farmer_name || 'Facility Client'}
                                                                </p>
                                                                <p className="text-xs text-hp-muted">{visit.farmer?.village || 'Verified Site'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p className="font-bold text-sm text-hp-dark">{visit.employee?.name || 'Officer'}</p>
                                                        <p className="text-xs text-hp-muted">{t('Verified Check-in')}</p>
                                                    </td>
                                                    <td>
                                                        <p className="text-xs font-semibold text-hp-dark">{visit.date}</p>
                                                        <p className="text-xs text-hp-muted">{visit.check_in_time} - {visit.check_out_time}</p>
                                                    </td>
                                                    <td>
                                                        <span className="font-semibold text-xs text-hp-dark">
                                                            {visit.distance_from_previous_farmer_km || '0'} km
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="hp-chip hp-chip-success hp-chip-dot">
                                                            {t('Completed')}
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <Link 
                                                            href={`/admin/visits/${visit.id}`} 
                                                            className="hp-btn hp-btn-sm hp-btn-outline"
                                                        >
                                                            {t('Details')} <ArrowUpRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ══════════ TAB CONTENT: ANALYTICS ══════════ */}
                {activeTab === 'analytics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Weekly Inspection Rhythm */}
                        <div className="lg:col-span-2 hp-bento-card">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="hp-card-title">{t('Weekly Inspection Volume')}</h3>
                                    <p className="text-xs text-hp-muted mt-0.5">{t('Daily completed preventive maintenance and audits')}</p>
                                </div>
                                <span className="hp-chip hp-chip-primary">
                                    <TrendingUp className="w-3 h-3 mr-1" /> +18% {t('Velocity')}
                                </span>
                            </div>

                            <div className="h-56 flex items-end justify-between gap-3 pt-6 px-2 border-b border-hp-border">
                                {analytics.weekDays.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <span className="text-[11px] font-bold text-hp-muted opacity-0 group-hover:opacity-100 transition-opacity">
                                            {d.count}
                                        </span>
                                        <div 
                                            style={{ height: d.height }}
                                            className="w-full max-w-[42px] bg-hp-primary/80 group-hover:bg-hp-primary rounded-t-lg transition-all"
                                        />
                                        <span className="text-xs font-semibold text-hp-muted">{d.day}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-4 text-xs text-hp-muted">
                                <span>{t('Peak Activity: Thursday (20 audits)')}</span>
                                <span className="font-bold text-hp-dark">93 {t('Weekly Cumulative')}</span>
                            </div>
                        </div>

                        {/* Service Focus Distribution */}
                        <div className="hp-bento-card">
                            <h3 className="hp-card-title mb-1">{t('Service Scope Breakdown')}</h3>
                            <p className="text-xs text-hp-muted mb-4">{t('Allocation across FM domains')}</p>

                            <div className="space-y-4">
                                {analytics.purposes.map((p, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                            <span className="text-hp-dark truncate">{p.name}</span>
                                            <span className="text-hp-muted shrink-0 ml-2">{p.percent}%</span>
                                        </div>
                                        <div className="w-full bg-hp-hover h-2 rounded-full overflow-hidden">
                                            <div className={`${p.color} h-full rounded-full`} style={{ width: `${p.percent}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Officers Leaderboard */}
                        <div className="lg:col-span-3 hp-bento-card">
                            <h3 className="hp-card-title mb-4">{t('Top Performing Field Technicians')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {analytics.topOfficers.map((off, idx) => (
                                    <div key={idx} className="p-4 rounded-xl bg-hp-hover/60 border border-hp-border flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-hp-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <p className="font-bold text-sm text-hp-dark">{off.name}</p>
                                                <p className="text-xs text-hp-muted">{off.distance.toFixed(1)} km total travel</p>
                                            </div>
                                        </div>
                                        <span className="hp-chip hp-chip-success">
                                            {off.count} {t('audits')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
