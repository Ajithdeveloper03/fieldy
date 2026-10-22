import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Map, Smartphone, FileText, CheckCircle2, Leaf, Clock, Navigation, Image as ImageIcon, Briefcase, FileSignature, CircleDollarSign, Building2 } from 'lucide-react';
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
                    <Link href="/admin/pending-farmers" className="hp-btn hp-btn-sm hp-btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to Pending Approvals')}
                    </Link>
                </div>

                {/* Hero Header Card */}
                <div className="hp-card">
                    <div className="hp-card-header flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-hp-hover border border-hp-border overflow-hidden flex items-center justify-center shrink-0">
                                {farmer.farmer_photo ? (
                                    <img src={farmer.farmer_photo} alt={farmer.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-hp-dark text-2xl">{String(farmer.name || 'F').charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="hp-page-title text-2xl sm:text-3xl">{farmer.name}</h1>
                                    <span className="hp-chip hp-chip-gray font-mono">{farmer.farmer_code || 'FAR-PENDING'}</span>
                                    <span className="hp-chip hp-chip-warning">Awaiting Approval</span>
                                </div>
                                <p className="text-sm text-hp-muted mt-1 flex items-center gap-1.5">
                                    <Map className="w-4 h-4 text-hp-muted" /> {farmer.village}, {farmer.district}
                                </p>
                            </div>
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={handleReject} 
                                disabled={processing} 
                                className="hp-btn hp-btn-secondary hover:!text-hp-danger hover:!border-hp-danger"
                            >
                                {t('Reject')}
                            </button>
                            <button 
                                onClick={handleApprove} 
                                disabled={processing} 
                                className="hp-btn hp-btn-primary"
                            >
                                {processing ? t('Approving...') : t('Approve Facility')}
                            </button>
                        </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-hp-border border-t border-hp-border">
                        <div className="p-4 text-center">
                            <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Total Facility Area')}</p>
                            <p className="font-bold text-lg text-hp-dark">{farmer.land_acres || '–'} {t('Sq. Ft / Units')}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Primary Service Focus')}</p>
                            <p className="font-bold text-lg text-hp-dark truncate">{farmer.crop_types?.length > 0 ? farmer.crop_types.join(', ') : 'HVAC & MEP'}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('SLA Lifecycle')}</p>
                            <p className="font-bold text-lg text-hp-dark capitalize">{farmer.crop_stage || t('Under Review')}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Facility Contact')}</p>
                            <p className="font-bold text-sm text-hp-dark flex items-center justify-center gap-1 mt-1">
                                <Smartphone className="w-4 h-4 text-hp-primary" /> {farmer.phone}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Coordinates & Specifications */}
                    <div className="col-span-1 space-y-6">
                        <div className="hp-card p-6">
                            <h3 className="hp-card-title flex items-center gap-2 mb-4">
                                <Navigation className="w-4 h-4 text-hp-primary" /> {t('Registered Coordinates')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-hp-bg border border-hp-border rounded-lg text-center">
                                    <p className="text-[10px] font-bold text-hp-muted uppercase mb-1">Latitude</p>
                                    <p className="text-xs font-bold text-hp-dark">{farmer.land_latitude || 'N/A'}</p>
                                </div>
                                <div className="p-3 bg-hp-bg border border-hp-border rounded-lg text-center">
                                    <p className="text-[10px] font-bold text-hp-muted uppercase mb-1">Longitude</p>
                                    <p className="text-xs font-bold text-hp-dark">{farmer.land_longitude || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="hp-card p-6">
                            <h3 className="hp-card-title flex items-center gap-2 mb-4 pb-3 border-b border-hp-border">
                                <Briefcase className="w-4 h-4 text-hp-primary" /> {t('Facility Specification')}
                            </h3>
                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hp-muted uppercase font-bold">{t('Structure / Flooring')}</span>
                                    <span className="font-bold text-hp-dark capitalize">{farmer.soil_type || 'Reinforced Concrete'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hp-muted uppercase font-bold">{t('Utility / Fire System')}</span>
                                    <span className="font-bold text-hp-dark capitalize">{farmer.irrigation_type || 'Centralised Sprinkler'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hp-muted uppercase font-bold">{t('Spares & Consumables')}</span>
                                    <span className="hp-chip hp-chip-primary !h-5 !text-[11px]">{farmer.seed_bags_required || 0} Units</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-hp-border">
                                    <span className="text-hp-muted uppercase font-bold">{t('Annual Budget')}</span>
                                    <span className="font-bold text-hp-dark text-sm">₹{farmer.planned_investment || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Submitted Documents & Verification */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        <div className="hp-card">
                            <div className="hp-card-header">
                                <h3 className="hp-card-title flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-hp-primary" /> {t('Uploaded Verification Documents')}
                                </h3>
                                <span className="hp-chip hp-chip-warning">Pending Review</span>
                            </div>
                            
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border border-hp-border rounded-lg p-3 bg-hp-bg">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Verification ID')}</p>
                                    <div className="aspect-[4/3] rounded-md overflow-hidden bg-hp-hover border border-hp-border">
                                        <img 
                                            src={farmer.aadhaar_image || `https://placehold.co/600x400/f8fafc/94a3b8?text=ID+Document`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=ID+Document`; }}
                                            className="w-full h-full object-cover" 
                                            alt="Verification"
                                        />
                                    </div>
                                </div>
                                
                                <div className="border border-hp-border rounded-lg p-3 bg-hp-bg">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Facility Officer Photo')}</p>
                                    <div className="aspect-[4/3] rounded-md overflow-hidden bg-hp-hover border border-hp-border">
                                        <img 
                                            src={farmer.farmer_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random&size=400`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random&size=400`; }}
                                            className="w-full h-full object-cover" 
                                            alt="Officer"
                                        />
                                    </div>
                                </div>

                                <div className="border border-hp-border rounded-lg p-3 bg-hp-bg">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Facility Photo')}</p>
                                    <div className="aspect-[4/3] rounded-md overflow-hidden bg-hp-hover border border-hp-border">
                                        <img 
                                            src={(farmer.farm_photos && farmer.farm_photos[0]) || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80"} 
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
