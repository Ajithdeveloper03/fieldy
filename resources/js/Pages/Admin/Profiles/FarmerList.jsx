import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Search, Plus, ChevronDown, 
    Clock, MapPin, Building2, Sparkles, LayoutGrid, ListFilter, ArrowUpRight,
    X, ShieldCheck, Download
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../../hooks/useIndustry';

const kycBadge = (status) => {
    if (status === 'verified') return 'hp-chip hp-chip-success hp-chip-dot';
    if (status === 'rejected') return 'hp-chip hp-chip-danger';
    return 'hp-chip hp-chip-warning';
};

export default function FarmerList({ farmers = [], districts = [], filters = {} }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const { vocab, labels, industry } = useIndustry();
    const ActiveIcon = industry.icon || Building2;

    const [search, setSearch] = useState(filters.search || '');
    const [district, setDistrict] = useState(filters.district || '');
    const [kyc, setKyc] = useState(filters.kyc || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [viewMode, setViewMode] = useState('grid'); 

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

    const verifiedCount = farmers.filter(f => f.kyc_status === 'verified' || f.approval_status === 'approved').length;
    const pendingCount = farmers.filter(f => f.approval_status === 'pending' || f.kyc_status === 'pending').length;
    const getCoverImage = (id) => `/images/image${((id || 1) % 12) + 1}.jpg`;

    // Category options tailored to the active service
    const categoryOptions = [
        { id: 'all', label: 'All' },
        ...(vocab.entity.types.slice(0, 3).map(type => ({ id: type, label: type })))
    ];

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">

                {flash?.success && (
                    <div className="hp-bento-card !p-4 border-l-4 border-l-hp-success bg-hp-success-light/30">
                        <p className="text-sm font-bold text-hp-dark">{flash.success}</p>
                    </div>
                )}

                {/* HERO CARD */}
                <div className="hp-card-gradient-slate rounded-2xl p-5 sm:p-7 shadow-xs border border-slate-200/80">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {t(vocab.entity.plural)}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {farmers.length} {t('total')}
                                </span>
                                <span className="hp-chip hp-chip-info">
                                    {industry.shortName}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t(labels.navDirectory || `${vocab.entity.plural} Directory`)}
                            </h1>
                            <p className="text-xs sm:text-sm text-hp-muted mt-1 leading-relaxed">
                                {t(labels.entitySub || `View and manage all registered ${vocab.entity.plural.toLowerCase()} for ${industry.name}.`)}
                            </p>

                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="mt-4 max-w-md">
                                <div className="hp-search-pill-bar !bg-white !shadow-xs">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t(`Search by ${vocab.entity.singular.toLowerCase()} name, code, or area...`)}
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
                                <span>{t(labels.addEntityAction || `Add ${vocab.entity.singular}`)}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="hp-metric-pill-card hover:border-slate-300">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total')}</span>
                            <span className="w-7 h-7 rounded-lg bg-orange-50 text-hp-primary flex items-center justify-center">
                                <ActiveIcon className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-hp-dark">{farmers.length}</div>
                        <p className="text-xs text-hp-muted mt-0.5">{t(vocab.entity.plural)} {t('registered')}</p>
                    </div>

                    <div className="hp-metric-pill-card hover:border-emerald-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Approved')}</span>
                            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <ShieldCheck className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-emerald-600">{verifiedCount}</div>
                        <p className="text-xs text-hp-muted mt-0.5">{t('Verified and operational')}</p>
                    </div>

                    <div className="hp-metric-pill-card hover:border-amber-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Pending')}</span>
                            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock className="w-3.5 h-3.5" />
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                        <p className="text-xs text-hp-muted mt-0.5">{t('Needs review / audit')}</p>
                    </div>

                    <div className="hp-metric-pill-card hover:border-indigo-200">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Compliance')}</span>
                            <span className="hp-chip hp-chip-success !h-5 !text-[11px]">{industry.complianceRate || '99%'}</span>
                        </div>
                        <div className="text-2xl font-bold text-hp-dark">99.2%</div>
                        <p className="text-xs text-hp-muted mt-0.5">{t('SLA Adherence')}</p>
                    </div>
                </div>

                {/* CATEGORIES & CONTROLS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="hp-segmented-bar overflow-x-auto max-w-full">
                        {categoryOptions.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryChange(cat.id)}
                                className={`hp-segmented-item ${category === cat.id ? 'is-active-primary' : ''}`}
                            >
                                {t(cat.label)}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        {districts.length > 0 && (
                            <div className="relative">
                                <select
                                    value={district}
                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                    className="hp-pill !h-9 text-xs font-semibold appearance-none !pr-8 cursor-pointer"
                                >
                                    <option value="">{t('All Areas / Cities')}</option>
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

                {/* DIRECTORY CONTENT */}
                {farmers.length === 0 ? (
                    <div className="hp-bento-card text-center py-20">
                        <div className="hp-icon-tile !w-14 !h-14 mx-auto mb-3">
                            <ActiveIcon className="w-6 h-6 text-hp-muted" />
                        </div>
                        <h2 className="text-base font-bold text-hp-dark mb-1">{t(`No ${vocab.entity.plural.toLowerCase()} found`)}</h2>
                        <p className="text-sm text-hp-muted max-w-sm mx-auto">{t(`Try adjusting your search filters or onboard a new ${vocab.entity.singular.toLowerCase()}.`)}</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {farmers.map((farm) => (
                            <div 
                                key={farm.id}
                                className="hp-bento-card group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="hp-card-visual h-40 mb-4 flex items-center justify-center relative">
                                        <img 
                                            src={farm.farmer_photo || getCoverImage(farm.id)} 
                                            alt={farm.name} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => { e.target.src = getCoverImage(farm.id); }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                                        
                                        <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                            <span className={kycBadge(farm.kyc_status)}>
                                                {t(farm.kyc_status === 'verified' ? 'Verified' : 'Pending Review')}
                                            </span>
                                        </div>

                                        <div className="absolute top-3 right-3">
                                            <span className="hp-chip hp-chip-gray !bg-white/90 font-mono text-[11px] backdrop-blur-sm">
                                                {farm.farmer_code || `ID-${farm.id}`}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-3 left-3 right-3 text-white">
                                            <p className="text-xs font-bold text-white/90 truncate">
                                                {farm.land_acres ? `${farm.land_acres} ${vocab.entity.sizeUnit}` : (farm.soil_type || industry.shortName)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <h3 className="font-bold text-base text-hp-dark group-hover:text-hp-primary transition-colors line-clamp-1">
                                            {farm.name}
                                        </h3>
                                        <p className="text-xs text-hp-muted flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-hp-muted shrink-0" />
                                            <span className="truncate">{farm.village || farm.district || 'Main Hub'}</span>
                                        </p>
                                        <p className="text-xs font-medium text-hp-dark pt-1 truncate">
                                            {farm.soil_type || farm.customer_category || vocab.entity.types[0]}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-hp-border">
                                    <Link 
                                        href={`/admin/farmers/${farm.id}`}
                                        className="hp-btn hp-btn-outline w-full !rounded-xl !h-10 text-sm font-semibold"
                                    >
                                        <span>{t(`Manage ${vocab.entity.singular}`)}</span>
                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="hp-bento-card !p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="hp-table min-w-[700px]">
                                <thead>
                                    <tr>
                                        <th>{t(vocab.entity.singular)}</th>
                                        <th>{t(`${vocab.entity.type} / ${vocab.entity.size}`)}</th>
                                        <th>{t('Location')}</th>
                                        <th>{t('Status')}</th>
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
                                                            String(farm.name || 'E').charAt(0).toUpperCase()
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
                                                    {farm.land_acres ? `${farm.land_acres} ${vocab.entity.sizeUnit}` : '-'}
                                                </span>
                                                <p className="text-[11px] text-hp-muted mt-0.5">
                                                    {farm.soil_type || farm.customer_category || vocab.entity.types[0]}
                                                </p>
                                            </td>
                                            <td>
                                                <span className="text-xs text-hp-dark flex items-center gap-1 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-hp-muted" /> {farm.village || farm.district || 'Assigned Beat'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={kycBadge(farm.kyc_status)}>
                                                    {t(farm.kyc_status === 'verified' ? 'Verified' : (farm.kyc_status || 'Pending'))}
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
