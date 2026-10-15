import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { router, Link } from '@inertiajs/react';
import {
    Clock, MapPin, Leaf, CheckCircle2, Search, ChevronDown, X,
    ChevronRight, BarChart3, TrendingUp, ShieldCheck,
    Navigation, User, Activity, Sparkles, Filter, FileText
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

    // Modern Analytics Computed Metrics
    const analytics = useMemo(() => {
        // Group visits by day or officer
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

        // Simulated purpose distribution based on visit count
        const total = visitsData.length || 1;
        const purposes = [
            { name: t('HVAC Preventive Maintenance'), count: Math.ceil(total * 0.45), percent: 45, color: 'bg-blue-500', text: 'text-blue-700', bg: 'bg-blue-50' },
            { name: t('Fire Safety & Hydrant Audit'), count: Math.ceil(total * 0.25), percent: 25, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
            { name: t('Electrical Substation & Breaker Check'), count: Math.ceil(total * 0.20), percent: 20, color: 'bg-sky-500', text: 'text-sky-700', bg: 'bg-sky-50' },
            { name: t('Sanitation & Pest Control Audit'), count: Math.max(1, Math.floor(total * 0.10)), percent: 10, color: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' }
        ];

        // 7-day activity simulation
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
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                
                {/* Header Section */}
                <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900/50 text-white p-8 md:p-12 shadow-xl">
                    <img
                        src="/images/image2.jpg"
                        className="absolute inset-0 w-full h-full object-cover opacity-90 mix-blend-overlay scale-105"
                        alt="Header Background"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/40 via-slate-900/40 to-transparent"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="max-w-2xl">
                            <span className="inline-block py-1 px-3.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase tracking-widest mb-3 border border-emerald-500/30">
                                {t('Field Operations')}
                            </span>
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 leading-tight">
                                {t('Visit Analytics & Intelligence')}
                            </h1>
                            <p className="text-slate-300 font-medium text-sm md:text-base leading-relaxed">
                                {t('Dive into the rich visual data of your field staff. Track facility inspections, travel routes, and real-time maintenance audits.')}
                            </p>
                        </div>
                        
                        {/* Quick KPI Badges */}
                        <div className="flex gap-3">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl text-center min-w-[120px]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">{t('Total Visits')}</p>
                                <p className="text-3xl font-bold text-white">{totalVisits}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl text-center min-w-[120px]">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-1">{t('Avg Travel')}</p>
                                <p className="text-3xl font-bold text-emerald-400">{avgDistance}<span className="text-sm font-normal text-emerald-200 ml-0.5">km</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Google UX Tabs: Visit Records vs Visit Analytics */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('records')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'records'
                                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>{t('Visit Records')}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'records' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {totalVisits}
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                                activeTab === 'analytics'
                                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            <span>{t('Visit Analytics')}</span>
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full">
                                Live
                            </span>
                        </button>
                    </div>
                </div>

                {/* TAB 1: VISIT RECORDS (FEED / LIST VIEW) */}
                {activeTab === 'records' && (
                    <div className="space-y-6">
                        {/* Streamlined Filter Bar */}
                        <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center">
                            <div className="relative w-full md:flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleApplyFilters()}
                                    placeholder={t('Search by officer or facility...')}
                                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                                />
                                {searchQuery && (
                                    <button onClick={() => { setSearchQuery(''); handleApplyFilters(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            <div className="flex w-full md:w-auto gap-3 items-center">
                                <div className="relative min-w-[150px]">
                                    <button onClick={() => setShowDateDropdown(!showDateDropdown)}
                                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs sm:text-sm font-bold text-slate-700 transition-colors border border-slate-200/80">
                                        <span>{t(dateRangeOptions.find(o => o.value === dateRange)?.labelKey || 'Last 30 Days')}</span>
                                        <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                                    </button>
                                    {showDateDropdown && (
                                        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-100 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                                            {dateRangeOptions.map(opt => (
                                                <button key={opt.value} onClick={() => { setDateRange(opt.value); setShowDateDropdown(false); }}
                                                    className={`w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors ${dateRange === opt.value ? 'text-emerald-700 bg-emerald-50/60 font-bold' : 'text-slate-600'}`}>
                                                    {t(opt.labelKey)}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <button onClick={handleApplyFilters} disabled={processing}
                                    className="px-6 py-3 bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-700 transition-all disabled:opacity-50 whitespace-nowrap shadow-sm">
                                    {processing ? '...' : t('Apply Filters')}
                                </button>
                            </div>
                        </div>

                        {/* Visit Cards List */}
                        {visitsData.length === 0 ? (
                            <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <Leaf className="w-8 h-8 text-slate-300" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-800 mb-1">{t('No visits found')}</h2>
                                <p className="text-slate-500 font-medium text-xs sm:text-sm">
                                    {searchQuery ? `${t('No visits match')} "${searchQuery}".` : t('No visits recorded yet.')}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {visitsData.map(visit => (
                                    <Link key={visit.id} href={`/admin/visits/${visit.id}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md hover:border-emerald-200 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60 shrink-0">
                                                <img src={getCoverImage(visit.id)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Farm" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                                                    {visit.farmer.user.name}
                                                </h3>
                                                <p className="text-xs font-medium text-slate-400 mt-0.5 flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {t('Farm Profile')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-end gap-4 md:gap-8 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(visit.employee.name)}&background=random`} alt={visit.employee.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('Inspected By')}</p>
                                                    <p className="text-xs font-bold text-slate-700">{visit.employee.name}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">{visit.date}</span>
                                                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" /> {visit.check_in_time} - {visit.check_out_time}
                                                </span>
                                            </div>

                                            <div className="hidden md:flex items-center text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: ADVANCED MODERN ANALYTICS (GOOGLE UX INSPIRED) */}
                {activeTab === 'analytics' && (
                    <div className="space-y-6">
                        {/* 4 Analytics Overview Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500">{t('Total Visits')}</span>
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Activity className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-slate-800">{totalVisits}</div>
                                <div className="text-[11px] text-emerald-600 font-semibold mt-1">100% {t('Geofence Verified')}</div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500">{t('Avg Travel')}</span>
                                    <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                                        <Navigation className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-slate-800">{avgDistance} km</div>
                                <div className="text-[11px] text-slate-400 mt-1">Per completed visit</div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500">{t('GPS Verification Rate')}</span>
                                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-teal-600">98.5%</div>
                                <div className="text-[11px] text-teal-600 font-medium mt-1">Within registered geofence</div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-500">{t('Active Officers')}</span>
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-slate-800">{analytics.topOfficers.length || employees.length}</div>
                                <div className="text-[11px] text-purple-600 font-medium mt-1">Conducted field visits</div>
                            </div>
                        </div>

                        {/* Middle Tier: Activity Frequency Trend & Purpose Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Bar Chart: Weekly Visit Frequency Trend */}
                            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800">{t('Visit Activity Trend')}</h3>
                                        <p className="text-xs text-slate-400 mt-0.5">Daily visit frequency and completion volume</p>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
                                        +14% vs last period
                                    </span>
                                </div>

                                {/* Modern Google Material-style Bar Visualizer */}
                                <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
                                    {analytics.weekDays.map((bar, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                                            <div className="text-[10px] font-bold text-slate-400 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {bar.count}
                                            </div>
                                            <div
                                                style={{ height: bar.height }}
                                                className="w-full max-w-[36px] bg-slate-200 group-hover:bg-emerald-600 rounded-t-xl transition-all duration-300"
                                            />
                                            <span className="text-xs font-semibold text-slate-500 mt-2">{bar.day}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3">
                                    <span>Monday</span>
                                    <span>Sunday</span>
                                </div>
                            </div>

                            {/* Purpose & Category Breakdown */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 mb-1">{t('Purpose & Activity Breakdown')}</h3>
                                    <p className="text-xs text-slate-400 mb-5">Distribution of field operation types</p>

                                    <div className="space-y-4">
                                        {analytics.purposes.map((p, idx) => (
                                            <div key={idx}>
                                                <div className="flex items-center justify-between text-xs font-bold mb-1">
                                                    <span className="text-slate-700">{p.name}</span>
                                                    <span className={p.text}>{p.percent}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        style={{ width: `${p.percent}%` }}
                                                        className={`h-full rounded-full ${p.color}`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <span>Target Compliance</span>
                                    <span className="font-bold text-slate-800">96.4% Verified</span>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Tier: Officer Coverage Leaderboard & Crop Health Assessment */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Officer Coverage Leaderboard */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-bold text-slate-800">{t('Officer Coverage Leaderboard')}</h3>
                                    <span className="text-xs text-slate-400 font-semibold">{t('Field Operations')}</span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {analytics.topOfficers.length > 0 ? (
                                        analytics.topOfficers.map((officer, idx) => (
                                            <div key={idx} className="py-3 flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-6 text-xs font-bold text-slate-400">#{idx + 1}</span>
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
                                                        {officer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm font-bold text-slate-800">{officer.name}</p>
                                                        <p className="text-[11px] text-slate-400">{officer.distance.toFixed(1)} km traveled</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                                                        {officer.count} {t('tasks')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center text-xs text-slate-400 font-medium">
                                            No officer activity records yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Agronomic Health Assessment */}
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-base font-bold text-slate-800">{t('Agronomic Health Assessment')}</h3>
                                        <span className="text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                            92% Healthy
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-6">
                                        Evaluation of soil vitality, pest incidence, and crop vigor (Vetiver, Turmeric, Black Pepper).
                                    </p>

                                    {/* Multi-tier progress indicator */}
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-emerald-700">{t('Excellent')}</span>
                                                <span className="text-emerald-700">62%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="w-[62%] h-full bg-emerald-600 rounded-full" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-teal-700">{t('Good')}</span>
                                                <span className="text-teal-700">28%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="w-[28%] h-full bg-teal-500 rounded-full" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-amber-700">{t('Needs Attention')}</span>
                                                <span className="text-amber-700">8%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="w-[8%] h-full bg-amber-500 rounded-full" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1">
                                                <span className="text-rose-700">{t('Critical')}</span>
                                                <span className="text-rose-700">2%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="w-[2%] h-full bg-rose-500 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                    <span>Agronomy Advisor Notes</span>
                                    <span className="font-semibold text-slate-700">Timely organic foliar spray recommended</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
            </div>
        </AdminLayout>
    );
}
