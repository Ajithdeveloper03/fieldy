import React from 'react';
import AdminLayout from './AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Clock, Camera, Leaf, AlertCircle, Navigation, User, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function VisitDetail({ visit }) {
    const { t } = useTranslation();

    if (!visit) {
        return (
            <AdminLayout>
                <div className="text-center py-20 text-slate-500">Visit not found.</div>
            </AdminLayout>
        );
    }

    const getCoverImage = (id) => `/images/image${(id % 12) + 1}.jpg`;

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center justify-between">
                <Link href="/admin/visits" className="cursor-pointer inline-flex items-center text-sm font-bold text-gray-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to Visits')}
                </Link>
            </div>

            {/* Formal Report Header */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 mb-8">
                <div className="border-b border-slate-100 pb-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-md">
                                {t('Inspection Report')}
                            </span>
                            <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-md flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> {visit.date}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-slate-800">
                            {visit.farmer?.user?.name || visit.farmer_name || 'Facility'} - {t('Facility Assessment')}
                        </h1>
                    </div>
                    <div className="text-left md:text-right">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{t('Inspected By')}</p>
                        <p className="text-base sm:text-lg font-semibold text-slate-800">{visit.employee?.name || 'Officer'}</p>
                        <p className="text-xs font-medium text-slate-500 mt-1 flex items-center md:justify-end gap-1">
                            <Clock className="w-3 h-3" /> {visit.check_in_time} - {visit.check_out_time}
                        </p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{t('Facility Name')}</p>
                        <p className="font-semibold text-slate-800">{visit.farmer?.user?.name || visit.farmer_name || 'Facility'}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{t('Location')}</p>
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-slate-400" /> {visit.farmer?.village || 'Unknown'}
                        </p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{t('Status')}</p>
                        <p className="font-semibold text-emerald-600">{t('Completed')}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{t('Distance')}</p>
                        <p className="font-bold text-slate-800">{visit.distance_from_previous_farmer_km} km</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Notes and Recommendations */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Leaf className="w-48 h-48" />
                        </div>
                        <h2 className="text-xl font-heading font-bold text-slate-800 flex items-center mb-6 relative z-10">
                            <Leaf className="w-6 h-6 mr-3 text-emerald-500" /> {t('Facility Condition & Observations')}
                        </h2>
                        <div className="prose prose-slate max-w-none relative z-10 text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                            {visit.farm_condition_notes || t('No conditions noted.')}
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <AlertCircle className="w-48 h-48" />
                        </div>
                        <h2 className="text-xl font-heading font-bold text-slate-800 flex items-center mb-6 relative z-10">
                            <AlertCircle className="w-6 h-6 mr-3 text-amber-500" /> {t('Maintenance Recommendations & Action Items')}
                        </h2>
                        <div className="prose prose-slate max-w-none relative z-10 text-slate-600 leading-relaxed bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50">
                            {visit.recommendations || t('No recommendations provided.')}
                        </div>
                    </div>
                </div>

                {/* Sidebar details */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center">
                            <Navigation className="w-4 h-4 mr-2 text-blue-500" /> {t('Routing Details')}
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('Distance Traveled')}</p>
                                <p className="text-3xl font-heading font-bold text-slate-800">
                                    {visit.distance_from_previous_farmer_km} <span className="text-lg text-slate-500 font-medium">km</span>
                                </p>
                                <p className="text-xs text-slate-500 mt-1">{t('from previous inspection')}</p>
                            </div>
                        </div>
                    </div>

                    {visit.media && visit.media.length > 0 && (
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-6 flex items-center">
                                <Camera className="w-4 h-4 mr-2 text-blue-500" /> {t('Media Gallery')}
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {visit.media.map((m, i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group/media shadow-sm border border-slate-200">
                                        <img 
                                            src={m.url || `https://images.unsplash.com/photo-1592982537447-6f2334208f34?w=400&q=80`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://images.unsplash.com/photo-1592982537447-6f2334208f34?w=400&q=80`; }}
                                            className="w-full h-full object-cover group-hover/media:scale-110 transition-transform duration-500" 
                                            alt="Farm Verification" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity"></div>
                                        <div className="absolute bottom-3 left-3 right-3 text-center opacity-0 group-hover/media:opacity-100 transition-opacity">
                                            <p className="text-[10px] font-bold text-white">{m.exif_time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
