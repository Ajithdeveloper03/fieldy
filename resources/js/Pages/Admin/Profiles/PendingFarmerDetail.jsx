import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Link, router } from '@inertiajs/react';
import { 
    ArrowLeft, Map, Smartphone, FileText, CheckCircle2, Leaf, Clock, Navigation, 
    Image as ImageIcon, Briefcase, FileSignature, CircleDollarSign, Building2,
    Sparkles, ShieldCheck, ArrowUpRight, XCircle, Check
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PendingFarmerDetail({ farmer = {}, visits = [] }) {
    const { t } = useTranslation();
    const [processing, setProcessing] = useState(false);

    const handleApprove = () => {
        if (processing) return;
        setProcessing(true);
        router.post(`/admin/pending-farmers/${farmer.id}/approve`, {}, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleReject = () => {
        if (processing) return;
        if (!confirm(t('Are you sure you want to reject this application?'))) return;
        setProcessing(true);
        router.post(`/admin/pending-farmers/${farmer.id}/reject`, {}, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Back button */}
                <div>
                    <Link href="/admin/pending-farmers" className="hp-pill">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to Pending Approvals')}
                    </Link>
                </div>

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-18 h-18 rounded-2xl bg-hp-hover border border-hp-border overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                {farmer.farmer_photo ? (
                                    <img src={farmer.farmer_photo} alt={farmer.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-hp-dark text-3xl">{String(farmer.name || 'F').charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">{farmer.name}</h1>
                                    <span className="hp-chip hp-chip-gray font-mono">{farmer.farmer_code || 'FAR-PENDING'}</span>
                                    <span className="hp-chip hp-chip-warning hp-chip-dot">{t('Awaiting Approval')}</span>
                                </div>
                                <p className="text-sm text-hp-muted flex items-center gap-1.5">
                                    <Map className="w-4 h-4 text-hp-muted" /> {farmer.village}, {farmer.district}
                                </p>
                            </div>
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                            <button 
                                onClick={handleReject} 
                                disabled={processing} 
                                className="hp-btn hp-btn-secondary !rounded-full hover:!text-hp-danger hover:!border-hp-danger"
                            >
                                <XCircle className="w-4 h-4 mr-1" />
                                <span>{t('Reject')}</span>
                            </button>
                            <button 
                                onClick={handleApprove} 
                                disabled={processing} 
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Check className="w-4 h-4 mr-1" />
                                <span>{processing ? t('Approving...') : t('Approve Facility')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS ══════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Total Facility Area')}</span>
                        <p className="font-bold text-2xl text-hp-dark">{farmer.land_acres || '–'} <span className="text-xs font-normal text-hp-muted">Sq. Ft / Units</span></p>
                        <p className="text-xs text-hp-muted mt-1">{t('Reported by field onboarding agent')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Primary Service Focus')}</span>
                        <p className="font-bold text-lg text-hp-dark truncate">
                            {farmer.crop_types?.length > 0 ? farmer.crop_types.join(', ') : 'HVAC & MEP'}
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{t('Contract service requirements')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('SLA Lifecycle')}</span>
                        <p className="font-bold text-lg text-hp-warning capitalize">{farmer.crop_stage || t('Under Review')}</p>
                        <p className="text-xs text-hp-muted mt-1">{t('Requires admin signature')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Facility Contact')}</span>
                        <p className="font-bold text-base text-hp-dark flex items-center gap-1.5 truncate">
                            <Smartphone className="w-4 h-4 text-hp-primary shrink-0" />
                            <span>{farmer.phone || '–'}</span>
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{t('Designated point of contact')}</p>
                    </div>
                </div>

                {/* ══════════ 2-COLUMN BENTO DETAILS ══════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Geolocation & Specs */}
                    <div className="col-span-1 space-y-6">
                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm flex items-center gap-2 mb-4">
                                <Navigation className="w-4 h-4 text-hp-primary" /> {t('Facility Coordinates')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-hp-hover/60 border border-hp-border rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-hp-muted uppercase mb-1">Latitude</p>
                                    <p className="text-xs font-bold text-hp-dark font-mono">{farmer.land_latitude || '12.9716° N'}</p>
                                </div>
                                <div className="p-3 bg-hp-hover/60 border border-hp-border rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-hp-muted uppercase mb-1">Longitude</p>
                                    <p className="text-xs font-bold text-hp-dark font-mono">{farmer.land_longitude || '77.5946° E'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm flex items-center gap-2 mb-4 pb-3 border-b border-hp-border">
                                <Briefcase className="w-4 h-4 text-hp-primary" /> {t('Facility Specifications')}
                            </h3>
                            <div className="space-y-3.5 text-xs">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hp-muted uppercase font-bold">{t('Structure / Flooring')}</span>
                                    <span className="font-bold text-hp-dark capitalize">{farmer.soil_type || 'Industrial Concrete'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hp-muted uppercase font-bold">{t('Utility / Fire System')}</span>
                                    <span className="font-bold text-hp-dark capitalize">{farmer.irrigation_type || 'Wet Pipe Sprinkler'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hp-muted uppercase font-bold">{t('Initial Consumable Units')}</span>
                                    <span className="hp-chip hp-chip-primary !h-5 !text-[11px]">{farmer.seed_bags_required || 0} Units</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-hp-border">
                                    <span className="text-hp-muted uppercase font-bold">{t('Proposed Budget')}</span>
                                    <span className="font-bold text-hp-dark text-sm">₹{farmer.planned_investment || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Verification Documents & Media */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <div className="hp-bento-card">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hp-border">
                                <h3 className="hp-card-title flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-hp-primary" /> {t('Verification Documents & Photographs')}
                                </h3>
                                <span className="hp-chip hp-chip-warning">
                                    {farmer.kyc_status || 'Pending'} KYC
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border border-hp-border rounded-xl p-3 bg-hp-hover/60">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Verification Contract')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border">
                                        <img 
                                            src={farmer.aadhaar_image || `https://placehold.co/600x400/f8fafc/94a3b8?text=KYC+Document`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=KYC+Document`; }}
                                            className="w-full h-full object-cover" 
                                            alt="Verification"
                                        />
                                    </div>
                                </div>
                                
                                <div className="border border-hp-border rounded-xl p-3 bg-hp-hover/60">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Site Lead')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border">
                                        <img 
                                            src={farmer.farmer_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random&size=400`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random&size=400`; }}
                                            className="w-full h-full object-cover" 
                                            alt="Officer"
                                        />
                                    </div>
                                </div>

                                <div className="border border-hp-border rounded-xl p-3 bg-hp-hover/60">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Site Photo')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border">
                                        <img 
                                            src={(farmer.farm_photos && farmer.farm_photos[0]) || "/images/image3.jpg"} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `/images/image3.jpg`; }}
                                            className="w-full h-full object-cover" 
                                            alt="Site"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
