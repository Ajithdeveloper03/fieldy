import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    CheckCircle, XCircle, Map, User, Smartphone, 
    AlertTriangle, ShieldCheck, MapPin, Search, Filter, ChevronDown, X, Building2
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
            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="hp-chip hp-chip-warning hp-chip-dot">{t('Approvals')}</span>
                            <span className="hp-chip hp-chip-gray">{farmers.length} {t('Pending')}</span>
                        </div>
                        <h1 className="hp-page-title">{t('Pending Facility Approvals')}</h1>
                        <p className="text-sm text-hp-muted mt-1">{t('Review board for new facility onboarding & location verification.')}</p>
                    </div>
                </div>

                {flash?.success && (
                    <div className="hp-card p-4 border-l-4 border-l-hp-success bg-hp-success-light/30">
                        <p className="text-sm font-bold text-hp-dark">{flash.success}</p>
                    </div>
                )}

                {/* Filter Toolbar */}
                <div className="hp-card p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-muted pointer-events-none" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('Search by facility name, contact, or location...')} 
                            className="hp-input !pl-10 text-sm"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-hp-muted hover:text-hp-dark">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex w-full md:w-auto gap-2">
                        <button 
                            onClick={() => setActiveCategory('all')}
                            className={`hp-btn hp-btn-sm ${activeCategory === 'all' ? 'hp-btn-primary' : 'hp-btn-secondary'}`}
                        >
                            {t('Awaiting Review')} ({farmers.length})
                        </button>
                        <button 
                            onClick={() => setActiveCategory('docs')}
                            className={`hp-btn hp-btn-sm ${activeCategory === 'docs' ? 'hp-btn-primary' : 'hp-btn-secondary'}`}
                        >
                            {t('Missing Documents')}
                        </button>
                    </div>
                </div>

                {/* Table Card */}
                <div className="hp-card overflow-hidden">
                    {filteredFarmers.length === 0 ? (
                        <div className="p-16 text-center text-hp-muted text-sm">
                            <div className="hp-icon-tile !w-12 !h-12 mx-auto mb-3">
                                <CheckCircle className="w-6 h-6 text-hp-success" />
                            </div>
                            <p className="font-bold text-hp-dark text-base">{t('All caught up!')}</p>
                            <p className="text-xs text-hp-muted mt-1">{searchQuery ? `${t('No facilities match')} "${searchQuery}".` : t('No facilities currently awaiting administrative approval.')}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="hp-table min-w-[760px]">
                                <thead>
                                    <tr>
                                        <th>{t('Facility / Client')}</th>
                                        <th>{t('Contact')}</th>
                                        <th>{t('Location')}</th>
                                        <th>{t('Area & Status')}</th>
                                        <th className="text-right">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFarmers.map(farmer => (
                                        <tr key={farmer.id} className="hover:bg-hp-hover transition-colors">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-hp-hover border border-hp-border flex items-center justify-center font-bold text-xs shrink-0">
                                                        {(farmer.name || 'F').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-hp-dark">{farmer.name}</p>
                                                        <p className="text-[11px] text-hp-muted">{t('Registered by:')} {farmer.registered_by || 'Field Staff'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-xs text-hp-dark flex items-center gap-1 font-medium">
                                                    <Smartphone className="w-3.5 h-3.5 text-hp-muted" /> {farmer.phone}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-xs text-hp-muted flex items-center gap-1 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-hp-muted" /> {farmer.village}, {farmer.district}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-xs text-hp-dark">{farmer.land_acres || '–'} Sq. Ft</span>
                                                    <span className="hp-chip hp-chip-warning !h-5 !text-[10px]">
                                                        {farmer.kyc_status || 'Pending'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/pending-farmers/${farmer.id}`}
                                                        className="hp-btn hp-btn-sm hp-btn-secondary"
                                                    >
                                                        {t('View')}
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleApprove(farmer.id, farmer.name)}
                                                        disabled={processing !== null}
                                                        className="hp-btn hp-btn-sm hp-btn-primary"
                                                    >
                                                        {processing === farmer.id + '_approve' ? t('Approving...') : t('Approve')}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleReject(farmer.id, farmer.name)}
                                                        disabled={processing !== null}
                                                        className="hp-btn hp-btn-sm hp-btn-secondary hover:!text-hp-danger hover:!border-hp-danger"
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
            </div>
        </AdminLayout>
    );
}
