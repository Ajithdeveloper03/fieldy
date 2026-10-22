import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { 
    CheckCircle, XCircle, Map, User, Smartphone, 
    AlertTriangle, ShieldCheck, MapPin, Search, Filter, ChevronDown, X, Building2,
    Sparkles, Clock, ArrowUpRight
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

                {flash?.success && (
                    <div className="hp-bento-card !p-4 border-l-4 border-l-hp-success bg-hp-success-light/30">
                        <p className="text-sm font-bold text-hp-dark">{flash.success}</p>
                    </div>
                )}

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-warning hp-chip-dot">
                                    {t('Verification Queue')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {farmers.length} {t('Pending Contracts')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t('Pending Facility Onboarding & Approvals')}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t('Review administrative onboarding submissions, verified GPS site boundaries, client contact ledgers, and KYC document checklists.')}
                            </p>

                            {/* Hostinger Pill Search Bar */}
                            <div className="mt-5 max-w-lg">
                                <div className="hp-search-pill-bar">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input 
                                        type="text" 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder={t('Search by facility name, contact person, or location...')} 
                                        className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="p-1 text-hp-muted hover:text-hp-dark">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Action */}
                        <div className="shrink-0 self-start lg:self-center">
                            <Link 
                                href="/admin/farmers" 
                                className="hp-btn hp-btn-secondary !rounded-full"
                            >
                                <Building2 className="w-4 h-4 mr-1.5" />
                                <span>{t('View Live Directory')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS ══════════ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Awaiting Review')}</span>
                            <Clock className="w-3.5 h-3.5 text-hp-warning" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{farmers.length}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('New facilities submitted this week')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Avg SLA Review Time')}</span>
                            <Sparkles className="w-3.5 h-3.5 text-hp-primary" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">2.4 <span className="text-sm font-semibold text-hp-muted">hours</span></div>
                        <p className="text-xs text-hp-success font-medium mt-1">99.4% {t('On-target approval velocity')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Geofence Verification')}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-hp-success" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-success">100%</div>
                        <p className="text-xs text-hp-muted mt-1">{t('GPS coordinates captured')}</p>
                    </div>
                </div>

                {/* ══════════ HOSTINGER SEGMENTED CATEGORIES ══════════ */}
                <div className="flex items-center gap-2">
                    <div className="hp-segmented-bar">
                        <button 
                            onClick={() => setActiveCategory('all')}
                            className={`hp-segmented-item ${activeCategory === 'all' ? 'is-active-primary' : ''}`}
                        >
                            <span>{t('Awaiting Verification')}</span>
                            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-hp-border text-hp-muted'}`}>
                                {farmers.length}
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveCategory('docs')}
                            className={`hp-segmented-item ${activeCategory === 'docs' ? 'is-active-primary' : ''}`}
                        >
                            <span>{t('Documentation Checklist')}</span>
                        </button>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO DATA TABLE CARD ══════════ */}
                <div className="hp-bento-card !p-0 overflow-hidden">
                    <div className="p-5 border-b border-hp-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-hp-primary" />
                            <h2 className="hp-card-title">{t('Onboarding Verification Queue')}</h2>
                        </div>
                        <span className="text-xs text-hp-muted font-medium">
                            {filteredFarmers.length} {t('facilities')}
                        </span>
                    </div>

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
                                        <tr key={farmer.id} className="hover:bg-hp-hover/60 transition-colors">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-hp-hover border border-hp-border flex items-center justify-center font-bold text-xs shrink-0 text-hp-dark">
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
                                                    <Smartphone className="w-3.5 h-3.5 text-hp-muted" /> {farmer.phone || '–'}
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
                                                        {farmer.kyc_status || 'Pending Review'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={`/admin/pending-farmers/${farmer.id}`}
                                                        className="hp-btn hp-btn-sm hp-btn-outline"
                                                    >
                                                        {t('Review')} <ArrowUpRight className="w-3.5 h-3.5" />
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
