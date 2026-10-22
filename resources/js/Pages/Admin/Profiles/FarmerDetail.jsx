import React from 'react';
import AdminLayout from '../AdminLayout';
import { Link } from '@inertiajs/react';
import { 
    ArrowLeft, Map, Smartphone, FileText, CheckCircle2, Leaf, Clock, Navigation, 
    Image as ImageIcon, Briefcase, FileSignature, CircleDollarSign, Building2,
    Sparkles, ShieldCheck, ArrowUpRight, Phone, Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FarmerDetail({ farmer = {}, visits = [] }) {
    const { t } = useTranslation();

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Back button */}
                <div>
                    <Link href="/admin/farmers" className="hp-pill">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to Directory')}
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
                                    <span className="hp-chip hp-chip-gray font-mono">{farmer.farmer_code || 'FAR-N/A'}</span>
                                    {farmer.kyc_status === 'verified' && (
                                        <span className="hp-chip hp-chip-success hp-chip-dot">
                                            {t('Verified Contract')}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-hp-muted flex items-center gap-1.5">
                                    <Map className="w-4 h-4 text-hp-muted" /> {farmer.village}, {farmer.district}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="hp-chip hp-chip-primary">
                                        {farmer.customer_category === 'fertilizer' ? t('Soft FM / Janitorial') : farmer.customer_category === 'both' ? t('Integrated IFM') : t('Hard FM / Engineering')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Hostinger Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                            <button 
                                type="button" 
                                onClick={() => window.location.href = `tel:${farmer.phone}`}
                                className="hp-btn hp-btn-secondary !rounded-full"
                            >
                                <Phone className="w-4 h-4 mr-1 text-hp-primary" />
                                <span>{t('Contact Manager')}</span>
                            </button>
                            <Link 
                                href="/admin/tasks"
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                <span>{t('Schedule Audit')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS ══════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Total Facility Area')}</span>
                        <p className="font-bold text-2xl text-hp-dark">{farmer.land_acres || '–'} <span className="text-xs font-normal text-hp-muted">{t('Sq. Ft / Units')}</span></p>
                        <p className="text-xs text-hp-muted mt-1">{t('Total covered floor space')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Primary Service Focus')}</span>
                        <p className="font-bold text-lg text-hp-dark truncate">
                            {Array.isArray(farmer.crop_types) ? farmer.crop_types.join(', ') : (farmer.crop_types || 'HVAC & MEP')}
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{t('Core contract deliverables')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('SLA Lifecycle')}</span>
                        <p className="font-bold text-lg text-hp-success capitalize">{farmer.crop_stage || t('Active SLA')}</p>
                        <p className="text-xs text-hp-muted mt-1">{t('Monthly PM cycles active')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Facility Contact')}</span>
                        <p className="font-bold text-base text-hp-dark flex items-center gap-1.5 truncate">
                            <Smartphone className="w-4 h-4 text-hp-primary shrink-0" />
                            <span>{farmer.phone || '–'}</span>
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{t('Designated site engineer')}</p>
                    </div>
                </div>

                {/* ══════════ 2-COLUMN BENTO DETAILS ══════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Coordinates & Specs */}
                    <div className="col-span-1 space-y-6">
                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm flex items-center gap-2 mb-4">
                                <Navigation className="w-4 h-4 text-hp-primary" /> {t('Facility Coordinates & Geofence')}
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
                        <div className="hp-bento-card">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hp-border">
                                <h3 className="hp-card-title flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-hp-primary" /> {t('Facility Service & Audit Log')}
                                </h3>
                                <span className="hp-chip hp-chip-gray">
                                    {visits.length} {t('Visits Logged')}
                                </span>
                            </div>

                            {visits.length === 0 ? (
                                <div className="text-center text-hp-muted text-xs py-10">
                                    {t('No service visits recorded yet for this facility.')}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {visits.map((visit) => (
                                        <div key={visit.id} className="p-4 bg-hp-hover/60 rounded-xl border border-hp-border">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <div>
                                                    <h4 className="text-sm font-bold text-hp-dark">Facility Preventive Maintenance</h4>
                                                    <p className="text-xs text-hp-muted">Inspected by {visit.employee_name || 'Assigned Officer'}</p>
                                                </div>
                                                <span className="hp-chip hp-chip-gray">
                                                    <Clock className="w-3 h-3 mr-1" /> {visit.date}
                                                </span>
                                            </div>
                                            <p className="text-xs text-hp-dark leading-relaxed">
                                                <strong>{t('Observations')}:</strong> {visit.notes || 'Routine check completed satisfactorily.'}
                                            </p>
                                            {visit.recommendations && (
                                                <p className="text-xs text-hp-muted leading-relaxed mt-2 pt-2 border-t border-hp-border">
                                                    <strong>{t('Recommendation')}:</strong> {visit.recommendations}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Documents & Media */}
                        <div className="hp-bento-card">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hp-border">
                                <h3 className="hp-card-title flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-hp-primary" /> {t('Verified Documents & Site Assets')}
                                </h3>
                                <span className={farmer.kyc_status === 'verified' ? 'hp-chip hp-chip-success' : 'hp-chip hp-chip-warning'}>
                                    {farmer.kyc_status || 'Pending'} KYC
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border border-hp-border rounded-xl p-3 bg-hp-hover/60">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Verification Contract')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border">
                                        <img 
                                            src={farmer.aadhaar_image || `https://placehold.co/600x400/f8fafc/94a3b8?text=Verification+Document`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=Verification+Document`; }}
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
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Commercial Site Aerial')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border">
                                        <img 
                                            src={(farmer.farm_photos && farmer.farm_photos[0]) || "/images/image2.jpg"} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `/images/image2.jpg`; }}
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
