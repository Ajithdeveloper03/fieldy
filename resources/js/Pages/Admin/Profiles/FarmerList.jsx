import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Map, Leaf, ChevronRight, Search, Phone, Plus, Filter, ChevronDown, CheckCircle2, 
    Clock, AlertCircle, MapPin, Building2, Sparkles, LayoutGrid, ListFilter, ArrowUpRight,
    X, ShieldCheck, Download, AlertTriangle, ArrowRight, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const kycBadge = (status) => {
    if (status === 'verified') return 'hp-chip hp-chip-success hp-chip-dot';
    if (status === 'rejected') return 'hp-chip hp-chip-danger';
    return 'hp-chip hp-chip-warning';
};

export default function FarmerList({ farmers = [], districts = [], filters = {} }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [district, setDistrict] = useState(filters.district || '');
    const [kyc, setKyc] = useState(filters.kyc || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [viewMode, setViewMode] = useState('grid'); 
    const [showExpiryAlert, setShowExpiryAlert] = useState(true); 

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/farmers', { search, district, kyc, category: category === 'all' ? '' : category }, { preserveState: true, replace: true });
    };

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        router.get('/admin/farmers', { search, district, kyc, category: cat === 'all' ? '' : cat }, { preserveState: true, replace: true });
    };

    const handleDistrictChange = (d) => {
        const nd = district === d ? '' : d;
        setDistrict(nd);
        router.get('/admin/farmers', { search, district: nd, kyc, category: category === 'all' ? '' : category }, { preserveState: true, replace: true });
    };

    const verifiedCount = farmers.filter(f => f.kyc_status === 'verified').length;
    const pendingCount = farmers.filter(f => f.kyc_status === 'pending' || !f.kyc_status).length;
    const getCoverImage = (id) => `/images/image${(id % 12) + 1}.jpg`;

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">

                {flash?.success && (
                    <div className="hp-bento-card !p-4 border-l-4 border-l-hp-success bg-hp-success-light/30">
                        <p className="text-sm font-bold text-hp-dark">{flash.success}</p>
                    </div>
                )}

                {/* ══════════ HOSTINGER SLA EXPIRY ALERT BANNER (Reference Image 3) ══════════ */}
                {showExpiryAlert && (
                    <div className="hp-alert-banner">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-rose-200/80 text-rose-700 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-4 h-4" />
                            </span>
                            <div className="text-sm">
                                <span className="font-bold text-rose-950">
                                    {t('Your SLA contract for Metro Plaza Complex (FAC-004) will expire soon.')}{' '}
                                </span>
                                <span className="text-rose-800">
                                    {t('You have 18 days to renew this SLA contract to maintain uninterrupted technician dispatch and GPS patrol.')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/payments')}
                                className="hp-btn hp-btn-sm !bg-rose-700 hover:!bg-rose-800 !text-white !rounded-full text-xs font-bold shadow-xs"
                            >
                                {t('Renew SLA')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowExpiryAlert(false)}
                                className="p-1.5 text-rose-400 hover:text-rose-700 rounded-md transition-colors"
                                title={t('Dismiss')}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ══════════ HOSTINGER HERO CARD (Soft Lavender/Slate Gradient) ══════════ */}
                <div className="hp-card-gradient-slate rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {t('Client Accounts & Sites')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {farmers.length} {t('Managed Facilities')}
                                </span>
                                <span className="hp-chip hp-chip-success">
                                    {t('99.2% Dispatch Uptime')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t('Facility & Commercial Accounts Directory')}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t('Centralized registry for facility management, construction, security, cleaning, solar, and logistics client accounts.')}
                            </p>

                            {/* Hostinger Pill Search Bar */}
                            <form onSubmit={handleSearch} className="mt-5 max-w-lg">
                                <div className="hp-search-pill-bar !bg-white !shadow-xs">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t('Search by Facility Name, Code, Phone, or District...')}
                                        className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                    />
                                    {search && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setSearch(''); router.get('/admin/farmers', { district, kyc, category: category === 'all' ? '' : category }, { preserveState: true, replace: true }); }}
                                            className="p-1 text-hp-muted hover:text-hp-dark"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button 
                                        type="submit"
                                        className="w-7 h-7 rounded-full bg-hp-primary text-white flex items-center justify-center hover:bg-hp-primary-hover shrink-0"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Top Action Buttons (Hostinger Image 3 style) */}
                        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/farmers')}
                                className="hp-btn hp-btn-secondary !rounded-full !bg-white !border-slate-300"
                            >
                                <Download className="w-4 h-4 mr-1 text-hp-muted" />
                                <span>{t('Export CSV')}</span>
                            </button>
                            <Link 
                                href="/admin/farmers/register" 
                                className="hp-btn hp-btn-primary !rounded-full shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                <span>{t('Onboard Facility')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS (With subtle gradient tints) ══════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card hover:border-slate-300">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total Facilities')}</span>
                            <span className="w-7 h-7 rounded-lg bg-orange-50 text-hp-primary flex items-center justify-center">
                                <Building2 className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{farmers.length}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Active commercial sites')}</p>
                    </div>

                    <div className="hp-metric-pill-card hover:border-emerald-200">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Verified Contracts')}</span>
                            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{verifiedCount}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('SLA binding agreements')}</p>
                    </div>

                    <div className="hp-metric-pill-card hover:border-amber-200">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Pending Verification')}</span>
                            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-amber-600">{pendingCount}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('In onboarding review')}</p>
                    </div>

                    <div className="hp-metric-pill-card hover:border-indigo-200">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Avg Audit Score')}</span>
                            <span className="hp-chip hp-chip-success !h-5 !text-[11px]">4.9 / 5.0</span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">99.1%</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Facility health benchmark')}</p>
                    </div>
                </div>

                {/* ══════════ HOSTINGER IMAGE 3: BUSINESS NETWORK CAPACITY HEADER ══════════ */}
                <div className="bg-white border border-hp-border rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0 font-bold">
                            <Building2 className="w-5 h-5 text-slate-700" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-hp-dark">{t('Enterprise Facility Fleet')}</h3>
                                <span className="hp-chip hp-chip-gray !h-5 !text-[11px]">{t('Live SLA')}</span>
                            </div>
                            <p className="text-xs text-hp-muted">{t('Automated dispatch & work order allocation coverage')}</p>
                        </div>
                    </div>

                    {/* Progress capacity meter (From Hostinger Image 3: 34% resource usage) */}
                    <div className="flex items-center gap-4 flex-1 max-w-md">
                        <div className="w-full">
                            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                                <span className="text-hp-muted">{t('Network Capacity Allocation')}</span>
                                <span className="text-hp-dark font-bold">64% {t('Utilized')}</span>
                            </div>
                            <div className="hp-meter-track">
                                <div className="hp-meter-fill" style={{ width: '64%' }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/pending-farmers')}
                            className="hp-btn hp-btn-sm hp-btn-secondary !rounded-full"
                        >
                            <span>{t('Approval Queue')}</span>
                            <span className="w-5 h-5 rounded-full bg-hp-primary text-white text-[10px] font-bold flex items-center justify-center">12</span>
                        </button>
                    </div>
                </div>

                {/* ══════════ HOSTINGER SEGMENTED CATEGORIES & CONTROLS ══════════ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Category Tabs */}
                    <div className="hp-segmented-bar overflow-x-auto max-w-full">
                        {[
                            { id: 'all', label: 'All Facilities' },
                            { id: 'crop', label: 'Hard FM (HVAC/Mech)' },
                            { id: 'fertilizer', label: 'Soft FM (Janitorial)' },
                            { id: 'both', label: 'Integrated IFM' },
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`hp-segmented-item ${category === cat.id ? 'is-active-primary' : ''}`}
                            >
                                {t(cat.label)}
                            </button>
                        ))}
                    </div>

                    {/* View Switcher & District Dropdown */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {districts.length > 0 && (
                            <div className="relative">
                                <select
                                    value={district}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    className="hp-pill !h-9 text-xs font-semibold appearance-none !pr-8 cursor-pointer"
                                >
                                    <option value="">{t('All Districts')}</option>
                                    {districts.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 text-hp-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                        )}

                        <div className="flex items-center bg-hp-hover border border-hp-border rounded-lg p-0.5">
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
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-xs text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                                title={t('List View')}
                            >
                                <ListFilter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ DIRECTORY CONTENT ══════════ */}
                {farmers.length === 0 ? (
                    <div className="hp-bento-card text-center py-20">
                        <div className="hp-icon-tile !w-14 !h-14 mx-auto mb-3">
                            <Building2 className="w-6 h-6 text-hp-muted" />
                        </div>
                        <h2 className="text-base font-bold text-hp-dark mb-1">{t('No facilities found')}</h2>
                        <p className="text-sm text-hp-muted max-w-sm mx-auto">{t('Try adjusting your search filters or onboard a new facility.')}</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Hostinger 3/4-Column Bento Marketplace Cards Grid (Reference Images 4 & 5) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {farmers.map((farm) => (
                            <div 
                                key={farm.id}
                                className="hp-bento-card group flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Visual Box / Thumbnail */}
                                    <div className="hp-card-visual h-40 mb-4 flex items-center justify-center relative">
                                        <img 
                                            src={farm.farmer_photo || getCoverImage(farm.id)} 
                                            alt={farm.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => { e.target.src = getCoverImage(farm.id); }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                                        
                                        {/* Floating Status Badges */}
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                            <span className={kycBadge(farm.kyc_status)}>
                                                {t(farm.kyc_status === 'verified' ? 'Verified' : 'Pending')}
                                            </span>
                                        </div>

                                        <div className="absolute top-3 right-3">
                                            <span className="hp-chip hp-chip-gray !bg-white/90 font-mono text-[11px] backdrop-blur-sm">
                                                {farm.farmer_code || `FAC-${farm.id}`}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <p className="text-xs font-bold text-white/90 truncate">
                                                {farm.land_acres ? `${farm.land_acres} Sq. Ft / Units` : 'Standard Facility'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Facility Info */}
                                    <div className="space-y-1.5">
                                        <h3 className="font-bold text-base text-hp-dark group-hover:text-hp-primary transition-colors line-clamp-1">
                                            {farm.name}
                                        </h3>
                                        <p className="text-xs text-hp-muted flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-hp-muted shrink-0" />
                                            <span className="truncate">{farm.village || 'Commercial Zone'}, {farm.district || 'Metro'}</span>
                                        </p>
                                        <p className="text-xs font-medium text-hp-dark pt-1">
                                            {farm.customer_category === 'fertilizer' ? t('Soft FM (Housekeeping)') : farm.customer_category === 'both' ? t('Integrated IFM') : t('Hard FM (HVAC/MEP)')}
                                        </p>
                                    </div>
                                </div>

                                {/* Hostinger Bottom Outline Action Button */}
                                <div className="mt-5 pt-3 border-t border-hp-border">
                                    <Link 
                                        href={`/admin/farmers/${farm.id}`}
                                        className="hp-btn hp-btn-outline w-full !rounded-xl !h-10 text-sm font-semibold"
                                    >
                                        <span>{t('Manage Facility')}</span>
                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <div className="hp-bento-card !p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="hp-table min-w-[700px]">
                                <thead>
                                    <tr>
                                        <th>{t('Facility / Client')}</th>
                                        <th>{t('Service Scope / Area')}</th>
                                        <th>{t('Location')}</th>
                                        <th>{t('KYC / SLA Status')}</th>
                                        <th className="text-right">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {farmers.map(farm => (
                                        <tr key={farm.id} className="cursor-pointer hover:bg-hp-hover/60 transition-colors" onClick={() => router.visit(`/admin/farmers/${farm.id}`)}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-hp-hover border border-hp-border overflow-hidden flex items-center justify-center font-bold text-xs shrink-0">
                                                        {farm.farmer_photo ? (
                                                            <img src={farm.farmer_photo} alt={farm.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            String(farm.name || 'F').charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-hp-dark">{farm.name}</p>
                                                        <p className="text-[11px] font-mono text-hp-muted">{farm.farmer_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-xs font-bold text-hp-dark">
                                                    {farm.land_acres || '–'} {t('Sq. Ft / Units')}
                                                </span>
                                                <p className="text-[11px] text-hp-muted mt-0.5">
                                                    {farm.customer_category === 'fertilizer' ? t('Soft FM Services') : 'Hard FM (HVAC/Electrical)'}
                                                </p>
                                            </td>
                                            <td>
                                                <span className="text-xs text-hp-dark flex items-center gap-1 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-hp-muted" /> {farm.village}, {farm.district}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={kycBadge(farm.kyc_status)}>
                                                    {t(farm.kyc_status || 'Pending')}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <Link href={`/admin/farmers/${farm.id}`} className="hp-btn hp-btn-sm hp-btn-outline">
                                                    {t('Manage')} <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
