import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { Map, Leaf, ChevronRight, Search, Phone, Plus, Filter, ChevronDown, CheckCircle2, Clock, AlertCircle, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
const kycBadge = (status) => {
    if (status === 'verified') return 'bg-green-50 text-green-700 border-green-200';
    if (status === 'rejected') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-amber-50 text-amber-600 border-amber-100';
};
const kycIcon = (status) => {
    if (status === 'verified') return <CheckCircle2 className="w-3 h-3" />;
    if (status === 'rejected') return <AlertCircle className="w-3 h-3" />;
    return <Clock className="w-3 h-3" />;
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
            {flash?.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium">
                    {flash.success}
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-slate-800">{t('Facility Directory')}</h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">{farmers.length} {t('registered client facilities, commercial sites, and service contracts.')}</p>
                </div>
                <Link href="/admin/farmers/register" className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center transition-all shadow-md shadow-slate-900/10">
                    <Plus className="w-5 h-5 mr-1" /> {t('Onboard Facility')}
                </Link>
            </div>
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => handleCategoryChange('crop')}
                    className={`pb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${category === 'crop' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    {t('Hard FM (HVAC & Mechanical)')}
                </button>
                <button
                    onClick={() => handleCategoryChange('fertilizer')}
                    className={`pb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${category === 'fertilizer' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    {t('Soft FM (Housekeeping & Cleaning)')}
                </button>
                <button
                    onClick={() => handleCategoryChange('both')}
                    className={`pb-4 px-2 text-sm font-semibold transition-colors border-b-2 ${category === 'both' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
                >
                    {t('Integrated Facility Management (IFM)')}
                </button>
            </div>
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={t('Search by FAR ID, Name, or Phone...')}
                        className="cursor-pointer w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                    />
                </div>
                <div className="flex w-full md:w-auto gap-3 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                    {/* Grid / List Toggle */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 mr-2">
                        <button
                            type="button"
                            onClick={() => setViewMode('grid')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                            title={t('Grid View')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                            title={t('List View')}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                        </button>
                    </div>
                    <div className="relative">
                        <select
                            value={district}
                            onChange={(e) => handleDistrictChange(e.target.value)}
                            className="appearance-none cursor-pointer bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl px-4 py-2 pr-8 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        >
                            <option value="">{t('All Districts')}</option>
                            {districts.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    <select value={kyc} onChange={e => { setKyc(e.target.value); router.get('/admin/farmers', { search, district, kyc: e.target.value }, { preserveState: true, replace: true }); }}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">
                        <option value="">{t('All KYC')}</option>
                        <option value="verified">{t('Verified')}</option>
                        <option value="pending">{t('Pending')}</option>
                        <option value="rejected">{t('Rejected')}</option>
                    </select>
                    <button type="submit" className="flex items-center px-4 py-2 bg-green-600 border border-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition whitespace-nowrap">
                        <Search className="w-4 h-4 mr-2" /> {t('Search')}
                    </button>
                </div>
            </form>

            {farmers.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Leaf className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-semibold">{t('No farmers found')}</p>
                    <p className="text-sm mt-1">{t('Try adjusting your search or register a new farmer.')}</p>
                </div>
            ) : viewMode === 'list' ? (
                <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-100">
                                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('Facility / Client')}</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('Service Scope / Area')}</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('Location')}</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('KYC / SLA Status')}</th>
                                    <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {farmers.map(farm => (
                                    <tr key={farm.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden flex items-center justify-center text-white font-bold text-sm">
                                                    {farm.farmer_photo ? (
                                                        <img src={farm.farmer_photo} alt={farm.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        String(farm.name || 'F').charAt(0).toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-heading font-semibold text-sm text-slate-800">{farm.name}</p>
                                                    <p className="text-[10px] font-mono text-gray-500 mt-0.5">{farm.farmer_code}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-bold text-slate-700">
                                                {farm.land_acres || '–'} {t('Sq. Ft / Units')}
                                            </span>
                                            <p className="text-[10px] font-medium text-sky-700 mt-0.5">
                                                {Array.isArray(farm.crop_types) && farm.crop_types.length > 0
                                                    ? farm.crop_types.join(', ')
                                                    : (farm.customer_category === 'fertilizer' ? t('Soft FM Services') : 'Hard FM (HVAC/Electrical)')}
                                            </p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-xs font-medium text-gray-600 flex items-center">
                                                <MapPin className="w-3 h-3 mr-1" /> {farm.village}, {farm.district}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className={`inline-flex flex-row items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${kycBadge(farm.kyc_status)}`}>
                                                {kycIcon(farm.kyc_status)} <span className="ml-0.5">{t(farm.kyc_status)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link href={`/admin/farmers/${farm.id}`} className="text-sm font-bold text-green-600 hover:text-green-700 transition-colors">
                                                {t('View')}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {farmers.map((farm) => (
                        <Link key={farm.id} href={`/admin/farmers/${farm.id}`} className="cursor-pointer group relative h-72 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col">
                            {farm.farmer_photo ? (
                                <img src={farm.farmer_photo} alt={farm.name} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" />
                            ) : (
                                <img src={`/images/image${(farm.id % 12) + 1}.jpg`} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
                            
                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider backdrop-blur-md text-white shadow-sm border border-white/20 ${farm.customer_category === 'fertilizer' ? 'bg-amber-600/80' : 'bg-sky-600/80'}`}>
                                    {farm.customer_category === 'fertilizer' ? t('Soft FM') : (Array.isArray(farm.crop_types) && farm.crop_types.length ? farm.crop_types.join(', ') : 'Hard FM (HVAC)')}
                                </span>
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-slate-900/60 backdrop-blur-md text-white shadow-sm border border-white/20`}>
                                    {kycIcon(farm.kyc_status)} {t(farm.kyc_status)}
                                </div>
                            </div>
                            
                            <div className="absolute bottom-5 left-5 right-5 z-10">
                                <h3 className="font-heading font-bold text-2xl text-white mb-1 group-hover:text-sky-300 transition-colors">{farm.name}</h3>
                                <p className="text-xs font-medium text-slate-300 flex items-center mb-4">
                                    <MapPin className="w-3 h-3 mr-1" /> {farm.village}, {farm.district}
                                </p>
                                
                                <div className="flex items-center justify-between border-t border-white/20 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                            {farm.farmer_photo ? (
                                                <img src={farm.farmer_photo} alt={farm.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(farm.name)}&background=random`} alt={farm.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">{farm.land_acres || '–'} {t('Sq. Ft')}</p>
                                            <p className="text-[10px] font-mono text-sky-400 mt-0.5">{farm.farmer_code}</p>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-sky-500 transition-colors">
                                        <ChevronRight className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
