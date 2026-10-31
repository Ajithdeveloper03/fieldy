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

                {/* ══════════ HOSTINGER RERA MANDATE EXPIRY ALERT BANNER (Reference Image 3) ══════════ */}
                {showExpiryAlert && (
                    <div className="hp-alert-banner">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-rose-200/80 text-rose-700 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-4 h-4" />
                            </span>
                            <div className="text-sm">
                                <span className="font-bold text-rose-950">
                                    {t('Your RERA marketing mandate for Skyline ECR Sea-View Villas (PROP-004) will expire soon.')}{' '}
                                </span>
                                <span className="text-rose-800">
                                    {t('You have 18 days to renew the developer sales agreement to maintain uninterrupted buyer site showings and advisor allocations.')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/payments')}
                                className="hp-btn hp-btn-sm !bg-rose-700 hover:!bg-rose-800 !text-white !rounded-full text-xs font-bold shadow-xs"
                            >
                                {t('Renew Mandate')}
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

                {/* ══════════ HERO CARD ══════════ */}
                <div className="hp-card-gradient-slate rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200/80">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {t('Properties')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {farmers.length} {t('total')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t('Properties Directory')}
                            </h1>
                            <p className="text-xs sm:text-sm text-hp-muted mt-1 leading-relaxed">
                                {t('View all plots, villas, apartments, and commercial projects.')}
                            </p>

                            {/* Hostinger Pill Search Bar */}
                            <form onSubmit={handleSearch} className="mt-4 max-w-md">
                                <div className="hp-search-pill-bar !bg-white !shadow-xs">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t('Search by property name, code, or city...')}
                                        className="w-full bg-transparent text-xs sm:text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
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

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2.5 shrink-0 self-start lg:self-center">
                            <button
                                type="button"
                                onClick={() => router.visit('/admin/farmers')}
                                className="hp-btn hp-btn-secondary !rounded-full !bg-white !border-slate-300"
                            >
                                <Download className="w-4 h-4 mr-1 text-hp-muted" />
                                <span>{t('Export')}</span>
                            </button>
                            <Link 
                                href="/admin/farmers/register" 
                                className="hp-btn hp-btn-primary !rounded-full shadow-sm"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                <span>{t('Add Property')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ══════════ METRIC CARDS ══════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="hp-metric-pill-card hover:border-slate-300">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total')}</span>
                            <span className="w-7 h-7 rounded-lg bg-orange-50 text-hp-primary flex items-center justify-center">
                                <Building2 className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-hp-dark">{farmers.length}</div>
                        <p className="text-xs text-hp-muted mt-0.5">{t('Properties listed')}</p>
                    </div>

                    <div className="hp-metric-pill-card hover:border-emerald-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Approved')}</span>
                            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{verifiedCount}</div>
                        <p className="text-xs text-hp-muted mt-0.5">{t('Verified and ready')}</p>
                    </div>

                    <div className="hp-metric-pill-card hover:border-amber-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Pending')}</span>
                            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                        <p className="text-xs text-hp-muted mt-0.5">{t('Needs review')}</p>
                    </div>

                    <div className="hp-metric-pill-card hover:border-indigo-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Rating')}</span>
                            <span className="hp-chip hp-chip-success !h-5 !text-[11px]">4.9 / 5</span>
                        </div>
                        <div className="text-2xl font-bold text-hp-dark">98%</div>
                        <p className="text-xs text-hp-muted mt-0.5">{t('Buyer satisfaction')}</p>
                    </div>
                </div>

                {/* ══════════ CATEGORIES & CONTROLS ══════════ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Category Tabs */}
                    <div className="hp-segmented-bar overflow-x-auto max-w-full">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'crop', label: 'Plots & Villas' },
                            { id: 'fertilizer', label: 'Commercial' },
                            { id: 'both', label: 'Apartments' },
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
                                    <option value="">{t('All Corridors / Districts')}</option>
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
                        <h2 className="text-base font-bold text-hp-dark mb-1">{t('No properties found')}</h2>
                        <p className="text-sm text-hp-muted max-w-sm mx-auto">{t('Try adjusting your search filters or onboard a new property project.')}</p>
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
                                                {t(farm.kyc_status === 'verified' ? 'RERA Verified' : 'Pending KYC')}
                                            </span>
                                        </div>

                                        <div className="absolute top-3 right-3">
                                            <span className="hp-chip hp-chip-gray !bg-white/90 font-mono text-[11px] backdrop-blur-sm">
                                                {farm.farmer_code || `PROP-${farm.id}`}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <p className="text-xs font-bold text-white/90 truncate">
                                                {farm.land_acres ? `${farm.land_acres} Acres / Plots` : 'Premium Real Estate Project'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Property Info */}
                                    <div className="space-y-1.5">
                                        <h3 className="font-bold text-base text-hp-dark group-hover:text-hp-primary transition-colors line-clamp-1">
                                            {farm.name}
                                        </h3>
                                        <p className="text-xs text-hp-muted flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-hp-muted shrink-0" />
                                            <span className="truncate">{farm.village || 'OMR / ECR Corridor'}, {farm.district || 'Chennai'}</span>
                                        </p>
                                        <p className="text-xs font-medium text-hp-dark pt-1">
                                            {farm.customer_category === 'fertilizer' ? t('Commercial & Office Tower') : farm.customer_category === 'both' ? t('Gated Apartments & Township') : t('Residential Plots & Villas')}
                                        </p>
                                    </div>
                                </div>

                                {/* Hostinger Bottom Outline Action Button */}
                                <div className="mt-5 pt-3 border-t border-hp-border">
                                    <Link 
                                        href={`/admin/farmers/${farm.id}`}
                                        className="hp-btn hp-btn-outline w-full !rounded-xl !h-10 text-sm font-semibold"
                                    >
                                        <span>{t('Manage Property')}</span>
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
                                        <th>{t('Property / Project')}</th>
                                        <th>{t('Asset Type / Extent')}</th>
                                        <th>{t('Corridor / Location')}</th>
                                        <th>{t('RERA / Title Status')}</th>
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
                                                            String(farm.name || 'P').charAt(0).toUpperCase()
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
                                                    {farm.land_acres || '–'} {t('Acres / Units')}
                                                </span>
                                                <p className="text-[11px] text-hp-muted mt-0.5">
                                                    {farm.customer_category === 'fertilizer' ? t('Commercial & Office Space') : 'Residential Plots & Villas'}
                                                </p>
                                            </td>
                                            <td>
                                                <span className="text-xs text-hp-dark flex items-center gap-1 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-hp-muted" /> {farm.village}, {farm.district}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={kycBadge(farm.kyc_status)}>
                                                    {t(farm.kyc_status === 'verified' ? 'RERA Verified' : (farm.kyc_status || 'Pending'))}
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
