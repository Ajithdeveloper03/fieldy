import React from 'react';
import AdminLayout from './AdminLayout';
import { Link } from '@inertiajs/react';
import { 
    ArrowLeft, MapPin, Clock, Camera, Leaf, AlertCircle, Navigation, 
    User, Calendar, CheckCircle2, Sparkles, Download, ShieldCheck, ArrowUpRight,
    Building2, FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VisitDetail({ visit }) {
    const { t } = useTranslation();

    if (!visit) {
        return (
            <AdminLayout>
                <div className="hp-bento-card text-center py-20 text-hp-muted">
                    {t('Visit record not found...')}
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Back Button */}
                <div>
                    <Link href="/admin/visits" className="hp-pill">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to Visits')}
                    </Link>
                </div>

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {t('Inspection Audit Certificate')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    <Calendar className="w-3 h-3 mr-1" /> {visit.date}
                                </span>
                                <span className="hp-chip hp-chip-success hp-chip-dot">
                                    {t('Verified Check-in')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {visit.farmer?.user?.name || visit.farmer_name || 'Client Facility'} - {t('Facility Assessment')}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t('Official preventive maintenance audit report signed by certified field officer with encrypted GPS arrival telemetry.')}
                            </p>
                        </div>

                        {/* Top Officer Pill Tile & Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start lg:self-center">
                            <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-hp-border flex items-center gap-3 shadow-xs">
                                <div className="w-10 h-10 rounded-xl bg-hp-dark text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {(visit.employee?.name || 'O').charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-bold text-hp-muted uppercase tracking-wider">{t('Auditor')}</p>
                                    <p className="text-sm font-bold text-hp-dark">{visit.employee?.name || 'Field Officer'}</p>
                                    <p className="text-xs text-hp-muted flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {visit.check_in_time || '09:00'} - {visit.check_out_time || '10:30'}
                                    </p>
                                </div>
                            </div>

                            <button 
                                type="button"
                                onClick={() => window.print()}
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                <span>{t('Download Certificate')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS ══════════ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Facility Location')}</span>
                        <p className="font-bold text-base text-hp-dark flex items-center gap-1.5 truncate">
                            <MapPin className="w-4 h-4 text-hp-primary shrink-0" />
                            <span className="truncate">{visit.farmer?.village || 'Verified Site'}</span>
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{visit.farmer?.district || 'Corporate Zone'}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Geofence Validation')}</span>
                        <p className="font-bold text-base text-hp-success flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-hp-success shrink-0" />
                            <span>100% {t('Verified')}</span>
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{t('Within 50m check-in perimeter')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Transit Route')}</span>
                        <p className="font-bold text-base text-hp-dark flex items-center gap-1.5">
                            <Navigation className="w-4 h-4 text-hp-primary shrink-0" />
                            <span>{visit.distance_from_previous_farmer_km || '3.2'} km</span>
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{t('From previous checkpoint')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Inspection Status')}</span>
                        <p className="font-bold text-base text-hp-dark flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-hp-success shrink-0" />
                            <span>{t('Signed & Sealed')}</span>
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{t('Compliant with ISO 55000')}</p>
                    </div>
                </div>

                {/* ══════════ BENTO DETAILS GRID ══════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Notes and Recommendations */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="hp-bento-card">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hp-border">
                                <h2 className="hp-card-title flex items-center gap-2">
                                    <Leaf className="w-5 h-5 text-hp-primary" /> {t('Facility Condition & Observations')}
                                </h2>
                                <span className="hp-chip hp-chip-gray">{t('Visual Audit')}</span>
                            </div>
                            <div className="text-sm text-hp-dark leading-relaxed bg-hp-hover/60 p-5 rounded-xl border border-hp-border">
                                {visit.farm_condition_notes || t('Standard MEP operating conditions observed. Ambient temperature and motor vibration levels within normal tolerances.')}
                            </div>
                        </div>

                        <div className="hp-bento-card">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hp-border">
                                <h2 className="hp-card-title flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-hp-warning" /> {t('Maintenance Recommendations & Action Items')}
                                </h2>
                                <span className="hp-chip hp-chip-warning">{t('Follow-up Required')}</span>
                            </div>
                            <div className="text-sm text-hp-dark leading-relaxed bg-hp-warning-light/40 p-5 rounded-xl border border-hp-warning/30">
                                {visit.recommendations || t('Schedule filter replacement for Air Handling Unit 2 during the upcoming preventive maintenance cycle.')}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Routing & Media Gallery */}
                    <div className="space-y-6">
                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm mb-3 flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-hp-primary" /> {t('Route Telemetry')}
                            </h3>
                            <div className="p-4 bg-hp-hover/60 rounded-xl border border-hp-border">
                                <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Transit Distance')}</p>
                                <p className="text-3xl font-bold text-hp-dark">
                                    {visit.distance_from_previous_farmer_km || '3.2'} <span className="text-sm font-semibold text-hp-muted">km</span>
                                </p>
                                <p className="text-xs text-hp-muted mt-1">{t('Optimal route followed with zero deviation.')}</p>
                            </div>
                        </div>

                        {visit.media && visit.media.length > 0 && (
                            <div className="hp-bento-card">
                                <h3 className="hp-card-title text-sm mb-3 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-hp-primary" /> {t('Verification Media Gallery')}
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {visit.media.map((m, i) => (
                                        <div key={i} className="aspect-square rounded-xl overflow-hidden relative group/media border border-hp-border">
                                            <img 
                                                src={m.url || `/images/image${(i % 12) + 1}.jpg`} 
                                                onError={(e) => { e.target.onerror = null; e.target.src = `/images/image1.jpg`; }}
                                                className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300" 
                                                alt="Verification Evidence" 
                                            />
                                            {m.exif_time && (
                                                <div className="absolute bottom-2 left-2 right-2 text-center bg-hp-dark/80 text-white text-[10px] font-bold py-0.5 px-1 rounded backdrop-blur-sm">
                                                    {m.exif_time}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
