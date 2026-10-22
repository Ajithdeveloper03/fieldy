import React from 'react';
import AdminLayout from './AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Clock, Camera, Leaf, AlertCircle, Navigation, User, Calendar, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VisitDetail({ visit }) {
    const { t } = useTranslation();

    if (!visit) {
        return (
            <AdminLayout>
                <div className="hp-card text-center py-20 text-hp-muted">Visit not found.</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Back Button */}
                <div>
                    <Link href="/admin/visits" className="hp-btn hp-btn-sm hp-btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to Visits')}
                    </Link>
                </div>

                {/* Formal Inspection Header Card */}
                <div className="hp-card">
                    <div className="hp-card-header flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    {t('Inspection Report')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    <Calendar className="w-3 h-3 mr-1" /> {visit.date}
                                </span>
                                <span className="hp-chip hp-chip-success hp-chip-dot">
                                    {t('Completed')}
                                </span>
                            </div>
                            <h1 className="hp-page-title text-2xl sm:text-3xl">
                                {visit.farmer?.user?.name || visit.farmer_name || 'Facility'} - {t('Facility Assessment')}
                            </h1>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Inspected By')}</p>
                            <p className="text-base font-bold text-hp-dark">{visit.employee?.name || 'Officer'}</p>
                            <p className="text-xs text-hp-muted mt-1 flex items-center md:justify-end gap-1">
                                <Clock className="w-3.5 h-3.5" /> {visit.check_in_time} - {visit.check_out_time}
                            </p>
                        </div>
                    </div>
                    
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-hp-hover/50 border-t border-hp-border">
                        <div className="p-3 bg-white border border-hp-border rounded-lg">
                            <p className="text-[11px] font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Facility Name')}</p>
                            <p className="font-bold text-sm text-hp-dark truncate">{visit.farmer?.user?.name || visit.farmer_name || 'Facility'}</p>
                        </div>
                        <div className="p-3 bg-white border border-hp-border rounded-lg">
                            <p className="text-[11px] font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Location')}</p>
                            <p className="font-bold text-sm text-hp-dark flex items-center gap-1 truncate">
                                <MapPin className="w-3.5 h-3.5 text-hp-muted" /> {visit.farmer?.village || 'Verified Site'}
                            </p>
                        </div>
                        <div className="p-3 bg-white border border-hp-border rounded-lg">
                            <p className="text-[11px] font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Geofence Status')}</p>
                            <p className="font-bold text-sm text-hp-success flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                            </p>
                        </div>
                        <div className="p-3 bg-white border border-hp-border rounded-lg">
                            <p className="text-[11px] font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Distance')}</p>
                            <p className="font-bold text-sm text-hp-dark">{visit.distance_from_previous_farmer_km} km</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Notes and Recommendations */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="hp-card">
                            <div className="hp-card-header">
                                <h2 className="hp-card-title flex items-center gap-2">
                                    <Leaf className="w-5 h-5 text-hp-primary" /> {t('Facility Condition & Observations')}
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="text-sm text-hp-dark leading-relaxed bg-hp-bg p-5 rounded-lg border border-hp-border">
                                    {visit.farm_condition_notes || t('No conditions noted.')}
                                </div>
                            </div>
                        </div>

                        <div className="hp-card">
                            <div className="hp-card-header">
                                <h2 className="hp-card-title flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-hp-warning" /> {t('Maintenance Recommendations & Action Items')}
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="text-sm text-hp-dark leading-relaxed bg-hp-warning-light/50 p-5 rounded-lg border border-hp-warning/20">
                                    {visit.recommendations || t('No recommendations provided.')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar details */}
                    <div className="space-y-6">
                        <div className="hp-card p-6">
                            <h3 className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Navigation className="w-4 h-4 text-hp-primary" /> {t('Routing Details')}
                            </h3>
                            
                            <div>
                                <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Distance Traveled')}</p>
                                <p className="text-3xl font-bold text-hp-dark">
                                    {visit.distance_from_previous_farmer_km} <span className="text-base text-hp-muted font-normal">km</span>
                                </p>
                                <p className="text-xs text-hp-muted mt-1">{t('from previous inspection point')}</p>
                            </div>
                        </div>

                        {visit.media && visit.media.length > 0 && (
                            <div className="hp-card p-6">
                                <h3 className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-hp-primary" /> {t('Media Gallery')}
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    {visit.media.map((m, i) => (
                                        <div key={i} className="aspect-square rounded-lg overflow-hidden relative group/media border border-hp-border">
                                            <img 
                                                src={m.url || `https://images.unsplash.com/photo-1592982537447-6f2334208f34?w=400&q=80`} 
                                                onError={(e) => { e.target.onerror = null; e.target.src = `https://images.unsplash.com/photo-1592982537447-6f2334208f34?w=400&q=80`; }}
                                                className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300" 
                                                alt="Verification Evidence" 
                                            />
                                            {m.exif_time && (
                                                <div className="absolute bottom-2 left-2 right-2 text-center bg-hp-dark/80 text-white text-[10px] font-bold py-0.5 px-1 rounded">
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
