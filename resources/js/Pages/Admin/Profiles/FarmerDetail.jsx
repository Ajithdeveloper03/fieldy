import React from 'react';
import AdminLayout from '../AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Map, Smartphone, FileText, CheckCircle2, Leaf, Clock, Navigation, Image as ImageIcon, Briefcase, FileSignature, CircleDollarSign, Building2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FarmerDetail({ farmer = {}, visits = [] }) {
    const { t } = useTranslation();

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Back button */}
                <div>
                    <Link href="/admin/farmers" className="hp-btn hp-btn-sm hp-btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to Directory')}
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
                                    <span className="hp-chip hp-chip-gray font-mono">{farmer.farmer_code || 'FAR-N/A'}</span>
                                    {farmer.kyc_status === 'verified' && (
                                        <span className="hp-chip hp-chip-success hp-chip-dot">Verified Contract</span>
                                    )}
                                </div>
                                <p className="text-sm text-hp-muted mt-1 flex items-center gap-1.5">
                                    <Map className="w-4 h-4 text-hp-muted" /> {farmer.village}, {farmer.district}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="hp-chip hp-chip-primary">
                                {farmer.customer_category === 'fertilizer' ? t('Soft FM / Janitorial') : farmer.customer_category === 'both' ? t('Integrated FM') : t('Hard FM / Engineering')}
                            </span>
                            {Array.isArray(farmer.crop_types) && farmer.crop_types.map((crop, idx) => (
                                <span key={idx} className="hp-chip hp-chip-gray">
                                    {crop}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Pending Approval Banner */}
                    {farmer.approval_status === 'pending' && (
                        <div className="bg-hp-warning-light border-y border-hp-warning/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <FileSignature className="w-5 h-5 text-hp-warning shrink-0" />
                                <p className="text-sm font-bold text-hp-dark">{t('This facility is pending administrative contract verification.')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="hp-btn hp-btn-sm hp-btn-secondary">{t('Reject')}</button>
                                <button className="hp-btn hp-btn-sm hp-btn-primary">{t('Approve Facility')}</button>
                            </div>
                        </div>
                    )}

                    {/* Stats Strip */}
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-hp-border border-t border-hp-border">
                        <div className="p-4 text-center">
                            <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Total Facility Area')}</p>
                            <p className="font-bold text-lg text-hp-dark">{farmer.land_acres || '–'} {t('Sq. Ft / Units')}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Primary Service Focus')}</p>
                            <p className="font-bold text-lg text-hp-dark truncate">{Array.isArray(farmer.crop_types) ? farmer.crop_types.join(', ') : (farmer.crop_types || 'HVAC & MEP')}</p>
                        </div>
                        <div className="p-4 text-center">
                            <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('SLA Lifecycle')}</p>
                            <p className="font-bold text-lg text-hp-dark capitalize">{farmer.crop_stage || t('Active SLA')}</p>
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
                    {/* Left Column: Geolocation & Specs */}
                    <div className="col-span-1 space-y-6">
                        <div className="hp-card p-6">
                            <h3 className="hp-card-title flex items-center gap-2 mb-4">
                                <Navigation className="w-4 h-4 text-hp-primary" /> {t('Facility Coordinates')}
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
                                    <span className="text-hp-muted uppercase font-bold">{t('Annual SLA Budget')}</span>
                                    <span className="font-bold text-hp-dark text-sm">₹{farmer.planned_investment || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Service Audit Log & Documents */}
                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        {/* Service Log */}
                        <div className="hp-card">
                            <div className="hp-card-header">
                                <h3 className="hp-card-title flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-hp-primary" /> {t('Facility Service & Audit Log')}
                                </h3>
                                <span className="hp-chip hp-chip-gray">
                                    {farmer.total_visits || 0} Total Visits
                                </span>
                            </div>

                            <div className="p-6">
                                {visits.length === 0 ? (
                                    <div className="text-center text-hp-muted text-xs py-8">No service visits recorded yet.</div>
                                ) : (
                                    <div className="space-y-4">
                                        {visits.map((visit, idx) => (
                                            <div key={visit.id} className="p-4 bg-hp-bg rounded-lg border border-hp-border">
                                                <div className="flex items-center justify-between gap-2 mb-2">
                                                    <div>
                                                        <h4 className="text-sm font-bold text-hp-dark">Facility Inspection</h4>
                                                        <p className="text-xs text-hp-muted">Inspected by {visit.employee_name}</p>
                                                    </div>
                                                    <span className="hp-chip hp-chip-gray">
                                                        <Clock className="w-3 h-3 mr-1" /> {visit.date}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-hp-dark leading-relaxed">
                                                    <strong>Observations:</strong> {visit.notes || 'Routine check completed satisfactorily.'}
                                                </p>
                                                {visit.recommendations && (
                                                    <p className="text-xs text-hp-muted leading-relaxed mt-2 pt-2 border-t border-hp-border">
                                                        <strong>Recommendation:</strong> {visit.recommendations}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Documents & Media */}
                        <div className="hp-card">
                            <div className="hp-card-header">
                                <h3 className="hp-card-title flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-hp-primary" /> {t('Documents & Media')}
                                </h3>
                                <span className={`hp-chip ${farmer.kyc_status === 'verified' ? 'hp-chip-success' : 'hp-chip-warning'}`}>
                                    {farmer.kyc_status || 'Pending'} KYC
                                </span>
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
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Officer In-Charge')}</p>
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
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Facility Site Image')}</p>
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
