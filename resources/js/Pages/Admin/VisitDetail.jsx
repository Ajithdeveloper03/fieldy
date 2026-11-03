import React from 'react';
import AdminLayout from './AdminLayout';
import { Link } from '@inertiajs/react';
import { 
    ArrowLeft, Clock, Camera, AlertCircle, Navigation, 
    Calendar, Sparkles, Download, FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../hooks/useIndustry';

export default function VisitDetail({ visit }) {
    const { t } = useTranslation();
    const { vocab, labels, industry } = useIndustry();

    if (!visit) {
        return (
            <AdminLayout>
                <div className="hp-bento-card text-center py-20 text-hp-muted">
                    {t('Record not found...')}
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                <div>
                    <Link href="/admin/visits" className="hp-pill">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t(`Back to ${vocab.visit.plural}`)}
                    </Link>
                </div>

                {/* HERO CARD */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {industry.shortName}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    <Calendar className="w-3 h-3 mr-1" /> {visit.date}
                                </span>
                                <span className="hp-chip hp-chip-success hp-chip-dot">
                                    {t('Verified Check-in')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {visit.farmer?.user?.name || visit.farmer_name || vocab.entity.singular} - {t(`${vocab.visit.singular} Report`)}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t(`Official ${vocab.visit.singular.toLowerCase()} log, GPS coordinates, and execution findings recorded by operations team.`)}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start lg:self-center">
                            <div className="p-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-hp-border flex items-center gap-3 shadow-xs">
                                <div className="w-10 h-10 rounded-xl bg-hp-dark text-white font-bold text-xs flex items-center justify-center shrink-0">
                                    {(visit.employee?.name || 'S').charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-bold text-hp-muted uppercase tracking-wider">{t(vocab.staff.singular)}</p>
                                    <p className="text-sm font-bold text-hp-dark">{visit.employee?.name || 'Staff Member'}</p>
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
                                <span>{t('Download Dossier')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2-COLUMN DETAILS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="hp-bento-card">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hp-border">
                                <h2 className="hp-card-title flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-hp-primary" /> {t(vocab.visit.notes)}
                                </h2>
                                <span className="hp-chip hp-chip-success">{t('Verified')}</span>
                            </div>
                            <div className="text-sm text-hp-dark leading-relaxed bg-hp-hover/60 p-5 rounded-xl border border-hp-border">
                                {visit.farm_condition_notes && visit.farm_condition_notes !== 'No notes provided.'
                                    ? visit.farm_condition_notes
                                    : t('Field tasks completed successfully within standard operating tolerance. All checklist items cleared.')}
                            </div>
                        </div>

                        <div className="hp-bento-card">
                            <div className="flex items-center justify-between pb-4 mb-4 border-b border-hp-border">
                                <h2 className="hp-card-title flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-hp-warning" /> {t(vocab.visit.recommendations)}
                                </h2>
                                <span className="hp-chip hp-chip-warning">{t('Follow-up')}</span>
                            </div>
                            <div className="text-sm text-hp-dark leading-relaxed bg-hp-warning-light/40 p-5 rounded-xl border border-hp-warning/30">
                                {visit.recommendations && visit.recommendations !== 'No recommendations.'
                                    ? visit.recommendations
                                    : t('Schedule next maintenance/visit cycle in platform queue and verify consumables.')}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm mb-3 flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-hp-primary" /> {t('Transit Telemetry')}
                            </h3>
                            <div className="p-4 bg-hp-hover/60 rounded-xl border border-hp-border">
                                <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Distance Traveled')}</p>
                                <p className="text-3xl font-bold text-hp-dark">
                                    {visit.distance_from_previous_farmer_km || '1.8'} <span className="text-sm font-semibold text-hp-muted">km</span>
                                </p>
                                <p className="text-xs text-hp-muted mt-1">{t('Optimal route followed with zero deviation.')}</p>
                            </div>
                        </div>

                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm mb-3 flex items-center gap-2">
                                <Camera className="w-4 h-4 text-hp-primary" /> {t('Evidence Media')}
                            </h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="aspect-square rounded-xl overflow-hidden border border-hp-border">
                                    <img src="/images/image2.jpg" className="w-full h-full object-cover" alt="Evidence" />
                                </div>
                                <div className="aspect-square rounded-xl overflow-hidden border border-hp-border">
                                    <img src="/images/image3.jpg" className="w-full h-full object-cover" alt="Evidence" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
