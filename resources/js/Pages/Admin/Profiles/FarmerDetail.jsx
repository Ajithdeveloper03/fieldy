import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, Map, Smartphone, FileText, CheckCircle2, Navigation, 
    Image as ImageIcon, Briefcase, Building2,
    Sparkles, Phone, Calendar, Edit3, Trash2, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../../hooks/useIndustry';

export default function FarmerDetail({ farmer = {}, visits = [] }) {
    const { t } = useTranslation();
    const { vocab, industry } = useIndustry();
    const [showEditModal, setShowEditModal] = useState(false);

    const editForm = useForm({
        name: farmer.name || '',
        village: farmer.village || '',
        district: farmer.district || '',
        land_address: farmer.land_address || '',
        soil_type: farmer.soil_type || 'Home',
        land_size_acres: farmer.land_acres || '',
        irrigation_type: farmer.area_unit || 'Sq.ft',
        phone: farmer.phone || '',
        approval_status: farmer.approval_status || 'approved',
        farmer_photo: null,
        aadhaar_image: null,
    });

    const handleUpdate = (e) => {
        e.preventDefault();
        editForm.post(`/admin/farmers/${farmer.id}`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setShowEditModal(false),
        });
    };

    const handleDelete = () => {
        if (confirm(`Delete project site "${farmer.name}" permanently?`)) {
            router.delete(`/admin/farmers/${farmer.id}`);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Back button */}
                <div>
                    <Link href="/admin/farmers" className="hp-pill">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to {{entities}} Directory', { entities: vocab.entity.plural })}
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
                        <div className="flex items-center gap-2.5 flex-wrap shrink-0 self-start lg:self-center">
                            {!farmer.is_sample && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(true)}
                                        className="hp-btn hp-btn-secondary !rounded-full"
                                    >
                                        <Edit3 className="w-4 h-4 mr-1" />
                                        <span>{t('Edit')}</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="hp-btn hp-btn-secondary !rounded-full text-rose-600 hover:bg-rose-50"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        <span>{t('Delete')}</span>
                                    </button>
                                </>
                            )}
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
                        <p className="font-bold text-2xl text-hp-dark">{farmer.land_acres || '-'} <span className="text-xs font-normal text-hp-muted">{farmer.area_unit || vocab.entity.sizeUnit}</span></p>
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
                                    <p className="text-[10px] font-bold text-hp-muted uppercase mb-1">{t('Latitude')}</p>
                                    <p className="text-xs font-bold text-hp-dark font-mono">{farmer.land_latitude || '12.9716° N'}</p>
                                </div>
                                <div className="p-3 bg-hp-hover/60 border border-hp-border rounded-xl text-center">
                                    <p className="text-[10px] font-bold text-hp-muted uppercase mb-1">{t('Longitude')}</p>
                                    <p className="text-xs font-bold text-hp-dark font-mono">{farmer.land_longitude || '80.2446° E'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm flex items-center gap-2 mb-4 pb-3 border-b border-hp-border">
                                <Briefcase className="w-4 h-4 text-hp-primary" /> {t('{{entity}} Attributes', { entity: vocab.entity.singular })}
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
                                    <FileText className="w-5 h-5 text-hp-primary" /> {t('Recent {{visits}} Log', { visits: vocab.visit.plural })}
                                </h3>
                                <span className="hp-chip hp-chip-gray">
                                    {visits.length} {t('Completed')}
                                </span>
                            </div>

                            {visits.length === 0 ? (
                                <p className="text-xs text-hp-muted text-center py-8">{t('No {{visits}} recorded yet.', { visits: vocab.visit.plural.toLowerCase() })}</p>
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
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Project Documents')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border flex items-center justify-center p-2 text-center text-xs text-hp-muted font-medium">
                                        {farmer.aadhaar_image ? (
                                            <a href={farmer.aadhaar_image} target="_blank" rel="noreferrer" className="text-hp-primary font-bold hover:underline">
                                                {t('Open Uploaded Document')}
                                            </a>
                                        ) : (
                                            <span>{vocab.approval.doc}</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="border border-hp-border rounded-xl p-3 bg-hp-hover/60">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Full Site Address')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border flex items-center justify-center p-3 text-center font-semibold text-xs text-hp-dark">
                                        {farmer.land_address || farmer.village || farmer.district || farmer.name}
                                    </div>
                                </div>

                                <div className="border border-hp-border rounded-xl p-3 bg-hp-hover/60">
                                    <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-2">{t('Site Image')}</p>
                                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-hp-bg border border-hp-border flex items-center justify-center">
                                        {farmer.farmer_photo ? (
                                            <img
                                                src={farmer.farmer_photo}
                                                className="w-full h-full object-cover"
                                                alt={farmer.name}
                                            />
                                        ) : (
                                            <Building2 className="w-8 h-8 text-hp-muted" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {showEditModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs">
                        <div className="w-full max-w-lg hp-card shadow-xl overflow-hidden">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-hp-border">
                                <h3 className="text-base font-bold text-hp-dark">{t('Edit {{entity}}', { entity: vocab.entity.singular })}</h3>
                                <button type="button" onClick={() => setShowEditModal(false)} className="p-1 text-hp-muted hover:text-hp-dark">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1">{t('Project Site Name / Title')} *</label>
                                    <input type="text" required className="hp-input" value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark mb-1">{t('Location / Site Area')}</label>
                                        <input type="text" className="hp-input" value={editForm.data.village} onChange={(e) => editForm.setData('village', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark mb-1">{t('City')}</label>
                                        <input type="text" className="hp-input" value={editForm.data.district} onChange={(e) => editForm.setData('district', e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1">{t('Full Site Address')}</label>
                                    <input type="text" className="hp-input" value={editForm.data.land_address} onChange={(e) => editForm.setData('land_address', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark mb-1">{t('Project Type')}</label>
                                        <select className="hp-input" value={editForm.data.soil_type} onChange={(e) => editForm.setData('soil_type', e.target.value)}>
                                            {['Home', 'Corporate', 'Hospital', 'Commercial', 'Industrial', 'Infrastructure', ...vocab.entity.types].filter((v, i, a) => a.indexOf(v) === i).map((tp) => (
                                                <option key={tp} value={tp}>{tp}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark mb-1">{t('Total Area')}</label>
                                        <div className="flex gap-1.5">
                                            <input type="number" step="0.01" className="hp-input flex-1" value={editForm.data.land_size_acres} onChange={(e) => editForm.setData('land_size_acres', e.target.value)} />
                                            <select className="hp-input w-24" value={editForm.data.irrigation_type} onChange={(e) => editForm.setData('irrigation_type', e.target.value)}>
                                                {['Sq.ft', 'Sq.m', 'Cent', 'Acre'].map((u) => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark mb-1">{t('Contact Phone')}</label>
                                        <input type="tel" className="hp-input" value={editForm.data.phone} onChange={(e) => editForm.setData('phone', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark mb-1">{t('Status')}</label>
                                        <select className="hp-input" value={editForm.data.approval_status} onChange={(e) => editForm.setData('approval_status', e.target.value)}>
                                            <option value="approved">{t('Verified')}</option>
                                            <option value="pending">{t('Pending Review')}</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark mb-1">{t('Update Site Photo')}</label>
                                        <input type="file" accept="image/*" className="text-xs" onChange={(e) => editForm.setData('farmer_photo', e.target.files?.[0] || null)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark mb-1">{t('Update Document')}</label>
                                        <input type="file" accept=".pdf,image/*" className="text-xs" onChange={(e) => editForm.setData('aadhaar_image', e.target.files?.[0] || null)} />
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-hp-border flex justify-end gap-2">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="hp-btn hp-btn-secondary">{t('Cancel')}</button>
                                    <button type="submit" disabled={editForm.processing} className="hp-btn hp-btn-primary">
                                        {editForm.processing ? t('Saving...') : t('Save Changes')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}
