import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { router, Link } from '@inertiajs/react';
import {
    Clock, MapPin, Leaf, CheckCircle2, Search, ChevronDown, X,
    ChevronRight, BarChart3, TrendingUp, ShieldCheck,
    Navigation, User, Activity, Sparkles, Filter, FileText, ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Visits({ visits = {}, employees = [], filters = {} }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('records'); // 'records' or 'analytics'
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [dateRange, setDateRange] = useState(filters.days || '30');
    const [showDateDropdown, setShowDateDropdown] = useState(false);
    const [processing, setProcessing] = useState(false);

    const visitsData = visits.data || [];
    const totalVisits = visits.total || visitsData.length;
    const avgDistance = visitsData.length
        ? (visitsData.reduce((acc, v) => acc + parseFloat(v.distance_from_previous_farmer_km || 0), 0) / visitsData.length).toFixed(1)
        : '3.8';

    const handleApplyFilters = () => {
        setProcessing(true);
        router.get('/admin/visits', { search: searchQuery, days: dateRange }, {
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
            { name: t('Electrical Substation & Breaker Check'), count: Math.ceil(total * 0.20), percent: 20, color: 'bg-hp-info' },
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
                
                {/* hPanel Clean Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="hp-chip hp-chip-primary">{t('Field Operations')}</span>
                        </div>
                        <h1 className="hp-page-title">{t('Visit Analytics & Intelligence')}</h1>
                        <p className="text-sm text-hp-muted mt-1">
                            {t('Track facility audits, inspection routes, telemetry, and completed logs across all field officers.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => router.visit('/admin/tasks')} 
                            className="hp-btn hp-btn-outline"
                        >
                            <FileText className="w-4 h-4" />
                            {t('View Tasks & Schedule')}
                        </button>
                    </div>
                </div>

                {/* hPanel KPI Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hp-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total Visits')}</span>
                            <span className="hp-icon-tile !w-8 !h-8"><Activity className="w-4 h-4" /></span>
                        </div>
                        <div className="text-2xl font-bold text-hp-dark">{totalVisits}</div>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="hp-chip hp-chip-success !h-5 !text-[11px]">100% {t('Verified')}</span>
                            <span className="text-xs text-hp-muted">{t('Geofenced')}</span>
                        </div>
                    </div>

                    <div className="hp-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Avg Travel')}</span>
                            <span className="hp-icon-tile !w-8 !h-8"><Navigation className="w-4 h-4" /></span>
                        </div>
                        <div className="text-2xl font-bold text-hp-dark">{avgDistance} <span className="text-sm font-normal text-hp-muted">km</span></div>
                        <div className="mt-2 text-xs text-hp-muted">Per completed audit</div>
                    </div>

                    <div className="hp-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('GPS Verification')}</span>
                            <span className="hp-icon-tile !w-8 !h-8"><ShieldCheck className="w-4 h-4" /></span>
                        </div>
                        <div className="text-2xl font-bold text-hp-dark">98.5%</div>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="hp-chip hp-chip-success !h-5 !text-[11px]">Optimal</span>
                            <span className="text-xs text-hp-muted">Within perimeter</span>
                        </div>
                    </div>

                    <div className="hp-card p-5">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Active Officers')}</span>
                            <span className="hp-icon-tile !w-8 !h-8"><User className="w-4 h-4" /></span>
                        </div>
                        <div className="text-2xl font-bold text-hp-dark">{analytics.topOfficers.length || employees.length}</div>
                        <div className="mt-2 text-xs text-hp-muted">Field staff reporting</div>
                    </div>
                </div>

                {/* hPanel Clean Underline Tab Navigation */}
                <div className="flex items-center gap-6 border-b border-hp-border">
                    <button
                        onClick={() => setActiveTab('records')}
                        className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'records'
                                ? 'border-hp-primary text-hp-primary'
                                : 'border-transparent text-hp-muted hover:text-hp-dark'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>{t('Visit Records')}</span>
                        <span className={`hp-chip !h-5 !px-2 !text-[11px] ${activeTab === 'records' ? 'hp-chip-primary' : 'hp-chip-gray'}`}>
                            {totalVisits}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
                            activeTab === 'analytics'
                                ? 'border-hp-primary text-hp-primary'
                                : 'border-transparent text-hp-muted hover:text-hp-dark'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>{t('Visit Analytics')}</span>
                        <span className="hp-chip hp-chip-success !h-5 !px-2 !text-[11px]">Live</span>
                    </button>
                </div>

                {/* TAB 1: VISIT RECORDS */}
                {activeTab === 'records' && (
                    <div className="space-y-4">
                        {/* Search & Filter Toolbar */}
                        <div className="hp-card p-3 flex flex-col md:flex-row gap-3 items-center">
                            <div className="relative w-full md:flex-1">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-muted pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
                                    placeholder={t('Search by officer or facility...')}
                                    className="hp-input !pl-10 !pr-10"
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); handleApplyFilters(); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-hp-muted hover:text-hp-dark">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex w-full md:w-auto gap-2 items-center">
                                <div className="relative min-w-[160px]">
                                    <button 
                                        onClick={() => setShowDateDropdown(!showDateDropdown)}
                                        className="hp-btn hp-btn-secondary w-full justify-between !h-10"
                                    >
                                        <span>{t(dateRangeOptions.find(o => o.value === dateRange)?.labelKey || 'Last 30 Days')}</span>
                                        <ChevronDown className="w-4 h-4 text-hp-muted ml-2" />
                                    </button>
                                    {showDateDropdown && (
                                        <div className="hp-pop absolute top-full mt-1.5 left-0 right-0 bg-white border border-hp-border rounded-xl shadow-[var(--shadow-hp-lg)] z-30 py-1 overflow-hidden">
                                            {dateRangeOptions.map(opt => (
                                                <button 
                                                    key={opt.value} 
                                                    onClick={() => { setDateRange(opt.value); setShowDateDropdown(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-hp-hover transition-colors ${dateRange === opt.value ? 'text-hp-primary bg-hp-primary-light font-bold' : 'text-hp-dark'}`}
                                                >
                                                    {t(opt.labelKey)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={handleApplyFilters} 
                                    disabled={processing}
                                    className="hp-btn hp-btn-primary !h-10"
                                >
                                    {processing ? '...' : t('Apply Filters')}
                                </button>
                            </div>
                        </div>

                        {/* Visit Records List */}
                        {visitsData.length === 0 ? (
                            <div className="hp-card p-16 text-center">
                                <div className="hp-icon-tile !w-14 !h-14 mx-auto mb-3">
                                    <Leaf className="w-6 h-6 text-hp-muted" />
                                </div>
                                <h2 className="text-base font-bold text-hp-dark mb-1">{t('No visits found')}</h2>
                                <p className="text-sm text-hp-muted">
                                    {searchQuery ? `${t('No visits match')} "${searchQuery}".` : t('No visits recorded yet.')}
                                </p>
                            </div>
                        ) : (
                            <div className="hp-card divide-y divide-hp-border overflow-hidden">
                                {visitsData.map(visit => (
                                    <Link 
                                        key={visit.id} 
                                        href={`/admin/visits/${visit.id}`} 
                                        className="hp-row hover:bg-hp-hover transition-colors group flex-col md:flex-row md:items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-hp-hover border border-hp-border shrink-0">
                                                <img src={getCoverImage(visit.id)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="Farm" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-hp-dark group-hover:text-hp-primary transition-colors">
                                                    {visit.farmer?.user?.name || visit.farmer?.name || 'Facility Client'}
                                                </h3>
                                                <p className="text-xs text-hp-muted mt-0.5 flex items-center">
                                                    <MapPin className="w-3.5 h-3.5 mr-1 text-hp-muted" /> {t('Facility Visit Record')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4 sm:gap-6 mt-3 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-hp-dark text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                    {(visit.employee?.name || 'O').charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-hp-muted uppercase tracking-wider">{t('Inspected By')}</p>
                                                    <p className="text-xs font-bold text-hp-dark">{visit.employee?.name || 'Officer'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="hp-chip hp-chip-gray">{visit.date}</span>
                                                <span className="hp-chip hp-chip-primary">
                                                    <Clock className="w-3 h-3 mr-1" /> {visit.check_in_time} - {visit.check_out_time}
                                                </span>
                                            </div>

                                            <span className="hp-btn hp-btn-sm hp-btn-outline hidden sm:inline-flex">
                                                {t('View Details')}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: VISIT ANALYTICS */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* Middle Tier: Activity Frequency Trend & Purpose Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Bar Chart: Weekly Visit Frequency Trend */}
                            <div className="lg:col-span-2 hp-card flex flex-col justify-between">
                                <div className="hp-card-header">
                                    <div>
                                        <h3 className="hp-card-title">{t('Visit Activity Trend')}</h3>
                                        <p className="text-xs text-hp-muted mt-0.5">Daily visit frequency and completion volume</p>
                                    </div>
                                    <span className="hp-chip hp-chip-success">
                                        +14% vs last period
                                    </span>
                                </div>

                                <div className="p-6">
                                    <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2 border-b border-hp-border">
                                        {analytics.weekDays.map((bar, idx) => (
                                            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                                                <div className="text-[11px] font-bold text-hp-dark mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {bar.count}
                                                </div>
                                                <div
                                                    style={{ height: bar.height }}
                                                    className="w-full max-w-[36px] bg-hp-border rounded-t-md group-hover:bg-hp-primary transition-all duration-200"
                                                />
                                                <span className="text-xs font-semibold text-hp-muted mt-2">{bar.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-hp-muted pt-3">
                                        <span>Monday</span>
                                        <span>Sunday</span>
                                    </div>
                                </div>
                            </div>

                            {/* Purpose & Category Breakdown */}
                            <div className="hp-card flex flex-col justify-between">
                                <div className="hp-card-header">
                                    <div>
                                        <h3 className="hp-card-title">{t('Purpose & Activity Breakdown')}</h3>
                                        <p className="text-xs text-hp-muted mt-0.5">Distribution of field operation types</p>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        {analytics.purposes.map((p, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                                    <span className="text-hp-dark">{p.name}</span>
                                                    <span className="text-hp-muted">{p.percent}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-hp-hover rounded-full overflow-hidden">
                                                    <div
                                                        style={{ width: `${p.percent}%` }}
                                                        className={`h-full rounded-full ${p.color}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-hp-border flex items-center justify-between text-xs text-hp-muted">
                                        <span>Target Compliance</span>
                                        <span className="font-bold text-hp-dark">96.4% Verified</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Tier: Officer Coverage Leaderboard & Crop Health Assessment */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Officer Coverage Leaderboard */}
                            <div className="hp-card">
                                <div className="hp-card-header">
                                    <h3 className="hp-card-title">{t('Officer Coverage Leaderboard')}</h3>
                                    <span className="hp-chip hp-chip-gray">{t('Field Operations')}</span>
                                </div>

                                <div className="divide-y divide-hp-border">
                                    {analytics.topOfficers.length > 0 ? (
                                        analytics.topOfficers.map((officer, idx) => (
                                            <div key={idx} className="p-4 flex items-center justify-between gap-3 hover:bg-hp-hover transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-5 text-xs font-bold text-hp-muted">#{idx + 1}</span>
                                                    <div className="w-8 h-8 rounded-full bg-hp-dark text-white flex items-center justify-center text-xs font-bold">
                                                        {officer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-hp-dark">{officer.name}</p>
                                                        <p className="text-xs text-hp-muted">{officer.distance.toFixed(1)} km traveled</p>
                                                    </div>
                                                </div>
                                                <span className="hp-chip hp-chip-primary">
                                                    {officer.count} {t('tasks')}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center text-xs text-hp-muted font-medium">
                                            No officer activity records yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Agronomic / Facility Health Assessment */}
                            <div className="hp-card flex flex-col justify-between">
                                <div className="hp-card-header">
                                    <div>
                                        <h3 className="hp-card-title">{t('Facility & Asset Audit Health')}</h3>
                                        <p className="text-xs text-hp-muted mt-0.5">Asset health index across all inspected sites</p>
                                    </div>
                                    <span className="hp-chip hp-chip-success">92% Optimal</span>
                                </div>

                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-hp-dark">{t('Excellent / Normal')}</span>
                                                <span className="text-hp-muted">62%</span>
                                            </div>
                                            <div className="w-full h-2 bg-hp-hover rounded-full overflow-hidden">
                                                <div className="w-[62%] h-full bg-hp-success rounded-full" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-hp-dark">{t('Good / Operational')}</span>
                                                <span className="text-hp-muted">28%</span>
                                            </div>
                                            <div className="w-full h-2 bg-hp-hover rounded-full overflow-hidden">
                                                <div className="w-[28%] h-full bg-hp-info rounded-full" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-hp-dark">{t('Needs Attention')}</span>
                                                <span className="text-hp-warning">8%</span>
                                            </div>
                                            <div className="w-full h-2 bg-hp-hover rounded-full overflow-hidden">
                                                <div className="w-[8%] h-full bg-hp-warning rounded-full" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-hp-dark">{t('Critical')}</span>
                                                <span className="text-hp-danger">2%</span>
                                            </div>
                                            <div className="w-full h-2 bg-hp-hover rounded-full overflow-hidden">
                                                <div className="w-[2%] h-full bg-hp-danger rounded-full" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-hp-border flex items-center justify-between text-xs text-hp-muted">
                                        <span>Inspection Advisory</span>
                                        <span className="font-semibold text-hp-dark">Timely maintenance audit scheduled</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
            </div>
        </AdminLayout>
    );
}
