import React from 'react';
import AdminLayout from '../AdminLayout';
import { Link } from '@inertiajs/react';
import { 
    ArrowLeft, Map, Smartphone, FileText, CheckCircle2, Navigation, 
    Image as ImageIcon, Briefcase, Building2,
    Sparkles, Phone, Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../../hooks/useIndustry';

export default function FarmerDetail({ farmer = {}, visits = [] }) {
    const { t } = useTranslation();
    const { vocab, industry } = useIndustry();

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Back button */}
                <div>
                    <Link href="/admin/farmers" className="hp-pill">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t(`Back to ${vocab.entity.plural} Directory`)}
                    </Link>
                </div>

                {/* HERO CARD */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-18 h-18 rounded-2xl bg-hp-hover border border-hp-border overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                {farmer.farmer_photo ? (
                                    <img src={farmer.farmer_photo} alt={farmer.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="font-bold text-hp-dark text-3xl">{String(farmer.name || 'E').charAt(0)}</span>
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">{farmer.name}</h1>
                                    <span className="hp-chip hp-chip-gray font-mono">{farmer.farmer_code || `ID-${farmer.id}`}</span>
                                    <span className="hp-chip hp-chip-success hp-chip-dot">
                                        {t('Active & Verified')}
                                    </span>
                                    <span className="hp-chip hp-chip-info">{industry.shortName}</span>
                                </div>
                                <p className="text-sm text-hp-muted flex items-center gap-1.5">
                                    <Map className="w-4 h-4 text-hp-muted" /> {farmer.village || farmer.district || 'Main Hub'}
                                </p>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="hp-chip hp-chip-primary">
                                        {farmer.crop_stage || farmer.soil_type || vocab.entity.types[0]}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                            {farmer.phone && (
                                <button 
                                    type="button" 
                                    onClick={() => window.location.href = `tel:${farmer.phone}`}
                                    className="hp-btn hp-btn-secondary !rounded-full"
                                >
                                    <Phone className="w-4 h-4 mr-1 text-hp-primary" />
                                    <span>{t('Contact POC')}</span>
                                </button>
                            )}
                            <Link 
                                href="/admin/tasks"
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                <span>{t(vocab.task.newLabel)}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t(vocab.entity.size)}</span>
                        <p className="font-bold text-2xl text-hp-dark">{farmer.land_acres || '-'} <span className="text-xs font-normal text-hp-muted">{vocab.entity.sizeUnit}</span></p>
                        <p className="text-xs text-hp-muted mt-1">{t('Total designated capacity')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t(vocab.entity.type)}</span>
                        <p className="font-bold text-lg text-hp-dark truncate">
                            {farmer.soil_type || farmer.customer_category || vocab.entity.types[0]}
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{t('Assigned classification')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Operational Status')}</span>
                        <p className="font-bold text-lg text-hp-success capitalize">{farmer.crop_stage || t('Fully Operational')}</p>
                        <p className="text-xs text-hp-muted mt-1">{t('Online on platform')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Site Contact')}</span>
                        <p className="font-bold text-base text-hp-dark flex items-center gap-1.5 truncate">
                            <Smartphone className="w-4 h-4 text-hp-primary shrink-0" />
                            <span>{farmer.phone || '-'}</span>
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{t('Primary contact number')}</p>
                    </div>
                </div>

                {/* 2-COLUMN DETAILS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-6">
                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm flex items-center gap-2 mb-4">
                                <Navigation className="w-4 h-4 text-hp-primary" /> {t('Geofence Coordinates')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-hp-hover/60 border border-hp-border rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-hp-muted uppercase mb-1">Latitude</p>
                                    <p className="text-xs font-bold text-hp-dark font-mono">{farmer.land_latitude || '12.9716° N'}</p>
                                </div>
                                <div className="p-3 bg-hp-hover/60 border border-hp-border rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-hp-muted uppercase mb-1">Longitude</p>
                                    <p className="text-xs font-bold text-hp-dark font-mono">{farmer.land_longitude || '80.2446° E'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm flex items-center gap-2 mb-4 pb-3 border-b border-hp-border">
                                <Briefcase className="w-4 h-4 text-hp-primary" /> {t(`${vocab.entity.singular} Attributes`)}
                            </h3>
                            <div className="space-y-3.5 text-xs">
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hp-muted uppercase font-bold">{t('Type')}</span>
                                    <span className="font-bold text-hp-dark capitalize">{farmer.crop_stage || vocab.entity.types[0]}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hp-muted uppercase font-bold">{t('Highlights')}</span>
                                    <span className="font-bold text-hp-dark capitalize">{farmer.soil_type || 'Standard Operations'}</span>
                                </div>
                                <div className="flex justify-between items-center py-1">
                                    <span className="text-hp-muted uppercase font-bold">{t('Capacity')}</span>
                                    <span className="hp-chip hp-chip-primary !h-5 !text-[11px]">{farmer.land_acres || 1} {vocab.entity.sizeUnit}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-1 lg:col-span-2 space-y-6">
                        {/* Visits Log */}
                        <div className="hp-bento-card">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hp-border">
                                <h3 className="hp-card-title flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-hp-primary" /> {t(`Recent ${vocab.visit.plural} Log`)}
                                </h3>
                                <span className="hp-chip hp-chip-gray">
                                    {visits.length} {t('Completed')}
                                </span>
                            </div>

                            {visits.length === 0 ? (
                                <p className="text-xs text-hp-muted text-center py-8">{t(`No ${vocab.visit.plural.toLowerCase()} recorded yet.`)}</p>
                            ) : (
                                <div className="space-y-3">
                                    {visits.map((visit) => (
                                        <div key={visit.id} className="p-4 rounded-xl border border-hp-border bg-white hover:border-hp-primary/40 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </span>
                                                    <span className="font-bold text-sm text-hp-dark">{visit.employee_name || 'Staff Member'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-hp-muted">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span>{visit.date} ({visit.check_in} – {visit.check_out})</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-hp-dark leading-relaxed">
                                                {visit.notes || 'Service performed and verified.'}
                                            </p>
                                            {visit.recommendations && (
                                                <p className="text-xs text-hp-muted leading-relaxed mt-2 pt-2 border-t border-hp-border">
                                                    <strong>{t(vocab.visit.recommendations)}:</strong> {visit.recommendations}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Media */}
                        <div className="hp-bento-card">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hp-border">
                                <h3 className="hp-card-title flex items-center gap-2">
                                    <ImageIcon className="w-5 h-5 text-hp-primary" /> {t('Verification Documents & Site Visuals')}
                                </h3>
                                <span className="hp-chip hp-chip-success">
                                    {t('Verified')}
                                </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="border border-hp-border rounded-xl p-3 bg-hp-hover/60">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Compliance Permit')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border flex items-center justify-center p-2 text-center text-xs text-hp-muted font-medium">
                                        <span>{vocab.approval.doc}</span>
                                    </div>
                                </div>
                                
                                <div className="border border-hp-border rounded-xl p-3 bg-hp-hover/60">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Lead Officer')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border flex items-center justify-center font-bold text-lg text-hp-dark">
                                        {farmer.name}
                                    </div>
                                </div>

                                <div className="border border-hp-border rounded-xl p-3 bg-hp-hover/60">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Field Photo')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border">
                                        <img 
                                            src="/images/image2.jpg" 
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
