import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { Map, Leaf, ChevronRight, Search, Phone, Plus, Filter, ChevronDown, CheckCircle2, Clock, AlertCircle, MapPin, Building2 } from 'lucide-react';
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
    const [category, setCategory] = useState(filters.category || 'crop');
    const [viewMode, setViewMode] = useState('grid'); 

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/farmers', { search, district, kyc, category }, { preserveState: true, replace: true });
    };

    const handleDistrictChange = (d) => {
        const nd = district === d ? '' : d;
        setDistrict(nd);
        router.get('/admin/farmers', { search, district: nd, kyc, category }, { preserveState: true, replace: true });
    };

    const handleCategoryChange = (cat) => {
        setCategory(cat);
        router.get('/admin/farmers', { search, district, kyc, category: cat }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">

                {flash?.success && (
                    <div className="hp-card p-4 border-l-4 border-l-hp-success bg-hp-success-light/30">
                        <p className="text-sm font-bold text-hp-dark">{flash.success}</p>
                    </div>
                )}

                {/* Page Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="hp-chip hp-chip-primary">{t('Client Accounts')}</span>
                        </div>
                        <h1 className="hp-page-title">{t('Facility & Client Directory')}</h1>
                        <p className="text-sm text-hp-muted mt-1">
                            {farmers.length} {t('registered client facilities, commercial sites, and service contracts.')}
                        </p>
                    </div>

                    <Link href="/admin/farmers/register" className="hp-btn hp-btn-primary">
                        <Plus className="w-4 h-4 mr-1" /> {t('Onboard Facility')}
                    </Link>
                </div>

                {/* hPanel Underline Categories */}
                <div className="flex items-center gap-6 border-b border-hp-border">
                    <button
                        onClick={() => handleCategoryChange('crop')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${category === 'crop' ? 'border-hp-primary text-hp-primary' : 'border-transparent text-hp-muted hover:text-hp-dark'}`}
                    >
                        {t('Hard FM (HVAC & Mechanical)')}
                    </button>
                    <button
                        onClick={() => handleCategoryChange('fertilizer')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${category === 'fertilizer' ? 'border-hp-primary text-hp-primary' : 'border-transparent text-hp-muted hover:text-hp-dark'}`}
                    >
                        {t('Soft FM (Housekeeping & Cleaning)')}
                    </button>
                    <button
                        onClick={() => handleCategoryChange('both')}
                        className={`pb-3 text-sm font-bold border-b-2 transition-colors ${category === 'both' ? 'border-hp-primary text-hp-primary' : 'border-transparent text-hp-muted hover:text-hp-dark'}`}
                    >
                        {t('Integrated Facility Management (IFM)')}
                    </button>
                </div>

                {/* Filter Toolbar */}
                <form onSubmit={handleSearch} className="hp-card p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-muted pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('Search by FAR ID, Name, or Phone...')}
                            className="hp-input !pl-10 text-sm"
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-2 items-center">
                        <div className="flex items-center bg-hp-hover border border-hp-border rounded-lg p-0.5">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                                title={t('Grid View')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                                title={t('List View')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="relative min-w-[150px]">
                            <select
                                value={district}
                                onChange={(e) => handleDistrictChange(e.target.value)}
                                className="hp-input !h-10 !pr-8 appearance-none text-xs font-semibold cursor-pointer"
                            >
                                <option value="">{t('All Districts')}</option>
                                {districts.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-muted pointer-events-none" />
                        </div>

                        <select 
                            value={kyc} 
                            onChange={e => { setKyc(e.target.value); router.get('/admin/farmers', { search, district, kyc: e.target.value, category }, { preserveState: true, replace: true }); }}
                            className="hp-input !h-10 text-xs font-semibold min-w-[120px]"
                        >
                            <option value="">{t('All KYC / SLA')}</option>
                            <option value="verified">{t('Verified')}</option>
                            <option value="pending">{t('Pending')}</option>
                            <option value="rejected">{t('Rejected')}</option>
                        </select>

                        <button type="submit" className="hp-btn hp-btn-secondary !h-10">
                            <Search className="w-4 h-4 mr-1" /> {t('Search')}
                        </button>
                    </div>
                </form>

                {/* Empty State */}
                {farmers.length === 0 ? (
                    <div className="hp-card p-16 text-center">
                        <div className="hp-icon-tile !w-14 !h-14 mx-auto mb-3">
                            <Building2 className="w-6 h-6 text-hp-muted" />
                        </div>
                        <h2 className="text-base font-bold text-hp-dark mb-1">{t('No facilities found')}</h2>
                        <p className="text-sm text-hp-muted">{t('Try adjusting your search filters or onboard a new facility.')}</p>
                    </div>
                ) : viewMode === 'list' ? (
                    /* Table View */
                    <div className="hp-card overflow-hidden">
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
                                        <tr key={farm.id} className="cursor-pointer" onClick={() => router.visit(`/admin/farmers/${farm.id}`)}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-hp-hover border border-hp-border overflow-hidden flex items-center justify-center font-bold text-xs shrink-0">
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
                                                    {Array.isArray(farm.crop_types) && farm.crop_types.length > 0
                                                        ? farm.crop_types.join(', ')
                                                        : (farm.customer_category === 'fertilizer' ? t('Soft FM Services') : 'Hard FM (HVAC/Electrical)')}
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
                                                    {t('Manage')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Grid Cards View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {farmers.map((farm) => (
                            <div 
                                key={farm.id} 
                                onClick={() => router.visit(`/admin/farmers/${farm.id}`)}
                                className="hp-card p-5 cursor-pointer hover:border-hp-primary-border transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-hp-hover border border-hp-border overflow-hidden flex items-center justify-center shrink-0">
                                            {farm.farmer_photo ? (
                                                <img src={farm.farmer_photo} alt={farm.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="font-bold text-hp-dark text-base">{farm.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <span className={kycBadge(farm.kyc_status)}>
                                            {t(farm.kyc_status || 'Pending')}
                                        </span>
                                    </div>

                                    <h3 className="font-bold text-base text-hp-dark group-hover:text-hp-primary transition-colors truncate">
                                        {farm.name}
                                    </h3>
                                    <p className="text-xs text-hp-muted mt-0.5 truncate">
                                        {farm.customer_category === 'fertilizer' ? t('Soft FM') : 'Hard FM (HVAC/Mechanical)'}
                                    </p>

                                    <div className="mt-4 pt-3 border-t border-hp-border flex items-center justify-between text-xs text-hp-muted">
                                        <span className="flex items-center gap-1 truncate">
                                            <MapPin className="w-3.5 h-3.5 text-hp-muted shrink-0" /> {farm.village || farm.district}
                                        </span>
                                        <span className="font-mono font-bold text-[11px] text-hp-dark">{farm.farmer_code}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-hp-border flex items-center justify-between">
                                    <span className="text-xs text-hp-muted">{farm.land_acres || '–'} Sq. Ft</span>
                                    <span className="hp-btn hp-btn-sm hp-btn-outline !h-8 !px-3">
                                        {t('View')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
