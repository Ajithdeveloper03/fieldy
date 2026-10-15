import React from 'react';
import AdminLayout from '../AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Map, Smartphone, FileText, CheckCircle2, Leaf, Clock, Navigation, Image as ImageIcon, Briefcase, FileSignature, CircleDollarSign } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FarmerDetail({ farmer = {}, visits = [] }) {
    const { t } = useTranslation();

    return (
        <AdminLayout>
            <div className="mb-6">
                <Link href="/admin/farmers" className="cursor-pointer inline-flex items-center text-sm font-bold text-gray-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
                </Link>
            </div>

            {/* Farm Hero Header */}
            <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-8 group cursor-pointer text-center relative">
                {/* Cover Image */}
                <div className="relative h-48 bg-slate-800">
                    <img src={`/images/image${(farmer.id % 12) + 1}.jpg`} alt="Cover" className="w-full h-full object-cover opacity-60 mix-blend-overlay group-hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent"></div>
                    <div className="absolute top-4 right-4 flex gap-2">
                        <span className="bg-slate-900/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-700/50 shadow-sm uppercase tracking-wider">
                            {farmer.farmer_code || 'N/A'}
                        </span>
                        {farmer.kyc_status === 'verified' && (
                            <span className="bg-green-600/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-lg border border-green-800/50 shadow-sm uppercase tracking-wider flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified Property
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Profile Avatar */}
                <div className="w-32 h-32 mx-auto rounded-[2rem] bg-white flex items-center justify-center border-4 border-white shadow-lg -mt-16 relative z-10 overflow-hidden group-hover:-translate-y-1 transition-transform">
                    {farmer.farmer_photo ? (
                        <img src={farmer.farmer_photo} alt={farmer.name} className="w-full h-full object-cover" />
                    ) : (
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name || 'Facility')}&background=random`} alt={farmer.name} className="w-full h-full object-cover" />
                    )}
                </div>
                
                <div className="px-6 pb-8 pt-4">
                    <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-slate-800">{farmer.name}</h1>
                    <p className="text-sm font-medium flex items-center justify-center mt-2 text-slate-500">
                        <Map className="w-4 h-4 mr-1.5 text-slate-400" /> {farmer.village}, {farmer.district}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${farmer.customer_category === 'fertilizer' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                            {farmer.customer_category === 'fertilizer' ? t('Soft FM / Janitorial') : farmer.customer_category === 'both' ? t('Integrated FM') : t('Hard FM / Engineering')}
                        </span>
                        {Array.isArray(farmer.crop_types) && farmer.crop_types.map((crop, idx) => (
                            <span key={idx} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                {crop}
                            </span>
                        ))}
                    </div>
                </div>
                
                {/* Approval Banner for Pending Farmers */}
                {farmer.approval_status === 'pending' && (
                    <div className="bg-amber-50 border-b border-amber-100 p-4 flex justify-between items-center">
                        <div className="flex items-center">
                            <FileSignature className="w-5 h-5 text-amber-600 mr-2" />
                            <p className="text-sm font-bold text-amber-900">{t('This facility is pending approval.')}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm">{t('Reject')}</button>
                            <button className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-sm">{t('Approve Facility')}</button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100 bg-white">
                    <div className="p-5 text-center hover:bg-gray-50 transition-colors">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('Total Facility Area')}</p>
                        <p className="font-heading font-bold text-2xl text-gray-900">{farmer.land_acres || '–'} {t('Sq. Ft / Units')}</p>
                    </div>
                    <div className="p-5 text-center hover:bg-gray-50 transition-colors">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('Primary Service Focus')}</p>
                        <p className="font-heading font-bold text-2xl text-slate-800">{Array.isArray(farmer.crop_types) ? farmer.crop_types.join(', ') : (farmer.crop_types || 'HVAC & MEP')}</p>
                    </div>
                    <div className="p-5 text-center hover:bg-gray-50 transition-colors">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('SLA Lifecycle')}</p>
                        <p className="font-heading font-bold text-xl text-gray-900 mt-1 capitalize">{farmer.crop_stage || t('Active SLA')}</p>
                    </div>
                    <div className="p-5 text-center hover:bg-gray-50 transition-colors">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('Facility Contact')}</p>
                        <p className="font-bold text-sm text-gray-900 flex items-center justify-center mt-2"><Smartphone className="w-4 h-4 mr-1 text-slate-700" /> {farmer.phone}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Geolocation Details */}
                <div className="col-span-1 space-y-8">
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-heading font-semibold text-slate-800 flex items-center mb-6">
                            <Navigation className="w-5 h-5 text-slate-700 mr-2" /> {t('Facility Coordinates')}
                        </h3>
                        <div className="relative h-48 rounded-2xl overflow-hidden mb-6 border border-gray-100 bg-gray-50 flex items-center justify-center">
                            {/* Abstract map representation */}
                            <div className="absolute inset-0 opacity-10 bg-black/5"></div>
                            <Map className="w-10 h-10 text-blue-400 relative z-10" />
                        </div>
                        <div className="flex justify-between space-x-4">
                            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Latitude</p>
                                <p className="text-sm font-semibold text-slate-800">{farmer.land_latitude || 'N/A'}</p>
                            </div>
                            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">{t('Longitude')}</p>
                                <p className="text-sm font-semibold text-slate-800">{farmer.land_longitude || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Facility & SLA Profile */}
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-heading font-semibold text-slate-800 flex items-center mb-6 border-b border-gray-50 pb-4">
                            <Briefcase className="w-5 h-5 text-blue-600 mr-2" /> {t('Facility Specification')}
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Building Structure / Flooring')}</span>
                                <span className="text-sm font-semibold text-slate-800 capitalize">{farmer.soil_type || 'Reinforced Concrete'}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('Fire & Water Utility')}</span>
                                <span className="text-sm font-semibold text-slate-800 capitalize">{farmer.irrigation_type || 'Centralised Sprinkler'}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 transition-colors">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('Consumables / Spares (Units)')}</span>
                                <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md">{farmer.seed_bags_required || 0} Units</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded-xl hover:bg-gray-50 transition-colors border-t border-gray-100 pt-3">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{t('Annual SLA Budget')}</span>
                                <span className="text-sm font-bold text-amber-600 flex items-center">
                                    <CircleDollarSign className="w-4 h-4 mr-1" /> ₹{farmer.planned_investment || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inspection History */}
                <div className="col-span-1 lg:col-span-2">
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm cursor-pointer hover:shadow-md transition-shadow h-full">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-heading font-bold text-gray-900 flex items-center">
                                <FileText className="w-5 h-5 text-orange-600 mr-2" /> {t('Facility Service & Audit Log')}
                            </h3>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 uppercase tracking-wider">
                                {farmer.total_visits || 0} Total Visits
                            </span>
                        </div>

                        <div className="space-y-6">
                            {visits.length === 0 ? (
                                <div className="text-center text-gray-500 py-10">No service visits recorded yet.</div>
                            ) : visits.map((visit, idx) => (
                                <div key={visit.id} className="flex items-start group">
                                    <div className="flex flex-col items-center mr-4">
                                        <div className={`w-10 h-10 rounded-xl ${idx === 0 ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-gray-50 border-gray-200 text-gray-400'} border flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors`}>
                                            <Briefcase className="w-5 h-5" />
                                        </div>
                                        {idx !== visits.length - 1 && <div className="w-px h-full bg-gray-200 mt-2"></div>}
                                    </div>
                                    <div className={`flex-1 bg-gray-50 border border-gray-100 rounded-2xl p-5 shadow-sm ${idx !== 0 ? 'opacity-70 group-hover:opacity-100' : ''} group-hover:border-blue-200 group-hover:shadow-md transition-all`}>
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-gray-900">Facility Inspection</h4>
                                                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">By {visit.employee_name}</p>
                                            </div>
                                            <span className={`text-xs font-bold flex items-center bg-white px-2 py-1 rounded-lg shadow-sm border border-gray-200 ${idx === 0 ? 'text-gray-500' : 'text-gray-400'}`}>
                                                <Clock className={`w-3 h-3 mr-1 ${idx === 0 ? 'text-blue-500' : 'text-gray-400'}`} /> {visit.date}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 leading-relaxed">
                                            <strong>Notes:</strong> {visit.notes || 'No notes.'}
                                        </p>
                                        {visit.recommendations && (
                                            <p className="text-sm text-gray-700 leading-relaxed mt-2 border-t border-gray-200 pt-2">
                                                <strong>Recommendations:</strong> {visit.recommendations}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Documents & Verification (KYC) */}
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow mt-8">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-heading font-bold text-gray-900 flex items-center">
                                <ImageIcon className="w-5 h-5 text-blue-600 mr-2" /> {t('Documents & Media')}
                            </h3>
                            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border uppercase tracking-wider ${farmer.kyc_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {farmer.kyc_status} KYC
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Aadhaar */}
                            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('Aadhaar Document')}</p>
                                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 relative group">
                                    <img 
                                        src={farmer.aadhaar_image || `https://placehold.co/600x400/f8fafc/94a3b8?text=Aadhaar+Document`} 
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/f8fafc/94a3b8?text=Aadhaar+Document`; }}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                    />
                                </div>
                            </div>
                            
                            {/* Facility In-charge Photo */}
                            <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('Facility Officer Photo')}</p>
                                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 relative group">
                                    <img 
                                        src={farmer.farmer_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random&size=400`} 
                                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random&size=400`; }}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                    />
                                </div>
                            </div>

                            {/* Facility Photos */}
                            {farmer.farm_photos && farmer.farm_photos.length > 0 ? farmer.farm_photos.map((photo, idx) => (
                                <div key={idx} className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('Facility Photo')} {idx + 1}</p>
                                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 relative group">
                                        <img 
                                            src={photo} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80`; }}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                        />
                                    </div>
                                </div>
                            )) : (
                                <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('Facility Photo')} 1</p>
                                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 relative group">
                                        <img 
                                            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80" 
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
