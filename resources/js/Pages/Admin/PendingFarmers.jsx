import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    CheckCircle, XCircle, Map, User, Smartphone, 
    AlertTriangle, ShieldCheck, MapPin, Search, Filter, ChevronDown, X
} from 'lucide-react';
import { useAlert } from '../../Components/AlertSystem';
import { useTranslation } from 'react-i18next';

export default function PendingFarmers({ farmers = [] }) {
    const { triggerInfo, triggerSuccess } = useAlert();
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [processing, setProcessing] = useState(null);

    const filteredFarmers = useMemo(() => {
        return farmers.filter(f => {
            const q = searchQuery.toLowerCase();
            return String(f.name || '').toLowerCase().includes(q) ||
                   String(f.phone || '').includes(q) ||
                   String(f.district || '').toLowerCase().includes(q) ||
                   String(f.village || '').toLowerCase().includes(q);
        });
    }, [farmers, searchQuery]);

    const handleApprove = (id, name) => {
        if (processing) return;
        setProcessing(id + '_approve');
        router.post(`/admin/pending-farmers/${id}/approve`, {}, {
            onSuccess: () => { triggerSuccess(`${t('Facility')} ${name} ${t('approved successfully!')}`); setProcessing(null); },
            onError: () => setProcessing(null),
        });
    };

    const handleReject = (id, name) => {
        if (processing) return;
        if (!confirm(t('Are you sure you want to reject') + ` ${name}?`)) return;
        setProcessing(id + '_reject');
        router.post(`/admin/pending-farmers/${id}/reject`, {}, {
            onSuccess: () => { triggerInfo(`${t('Facility')} ${name} ${t('application rejected.')}`); setProcessing(null); },
            onError: () => setProcessing(null),
        });
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-semibold text-slate-800">{t('Pending Facility Approvals')}</h1>
                    <p className="text-slate-500 mt-1 text-sm font-medium">{t('Review board for new facility onboarding & location verification.')}</p>
                </div>
                <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg flex items-center font-bold text-sm">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    {farmers.length} {t('Pending')}
                </div>
            </div>

            {flash?.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-medium">{flash.success}</div>
            )}

            {/* Filter Bar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('Search by facility name, contact, or location...')} 
                        className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    />
                    {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>}
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <button onClick={() => setActiveCategory('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeCategory === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}>
                        {t('Awaiting Review')} ({farmers.length})
                    </button>
                    <button onClick={() => setActiveCategory('docs')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeCategory === 'docs' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}>
                        {t('Missing Documents')}
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                {filteredFarmers.length === 0 && (
                    <div className="p-12 text-center text-gray-500 text-sm">
                        {searchQuery ? `${t('No facilities match')} "${searchQuery}".` : t('No pending facilities. All caught up!')}
                    </div>
                )}
                {filteredFarmers.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Facility / Client')}</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Contact')}</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Location')}</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Covered Area & KYC')}</th>
                                    <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredFarmers.map(farmer => (
                                    <tr key={farmer.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                                    {(farmer.name || 'F').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900">{farmer.name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{t('By:')} {farmer.registered_by}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-600 flex items-center">
                                                <Smartphone className="w-4 h-4 mr-2 text-gray-400" /> {farmer.phone}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="text-sm text-gray-600 flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" /> {farmer.village}, {farmer.district}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium text-gray-900">{farmer.land_acres || '–'}</span> {t('Sq. Ft / Units')}
                                                <span className="mx-2 text-gray-300">|</span>
                                                <span className="capitalize">{farmer.kyc_status}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Link
                                                    href={`/admin/pending-farmers/${farmer.id}`}
                                                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                                >
                                                    {t('View')}
                                                </Link>
                                                <button 
                                                    onClick={() => handleApprove(farmer.id, farmer.name)}
                                                    disabled={processing !== null}
                                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {processing === farmer.id + '_approve' ? t('Approving...') : t('Approve')}
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(farmer.id, farmer.name)}
                                                    disabled={processing !== null}
                                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {processing === farmer.id + '_reject' ? t('Rejecting...') : t('Reject')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
