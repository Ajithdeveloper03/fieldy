import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Building2, ArrowLeft, CheckCircle2, UploadCloud, MapPin, FileText, Image as ImageIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../../hooks/useIndustry';

export default function FarmerRegistrationForm({ employees = [] }) {
    const { t } = useTranslation();
    const { vocab, industry } = useIndustry();
    const [docName, setDocName] = useState('');
    const [imgName, setImgName] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        land_address: '',
        village: '',
        district: '',
        soil_type: vocab.entity.types?.[0] || 'Home',
        land_size_acres: '',
        irrigation_type: 'Sq.ft',
        phone: '',
        assignment_mode: 'all',
        assigned_to: '',
        aadhaar_image: null,
        farmer_photo: null,
    });

    const PROJECT_TYPES = ['Home', 'Corporate', 'Hospital', 'Commercial', 'Industrial', 'Infrastructure'];
    const AREA_UNITS = ['Sq.ft', 'Sq.m', 'Cent', 'Acre'];

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/farmers', { forceFormData: true });
    };

    return (
        <AdminLayout>
            <Head title={`${t('Add')} ${vocab.entity.singular} - ${industry.name}`} />

            <div className="max-w-3xl mx-auto space-y-6 pb-12 hp-animate-in">
                <div className="flex items-center gap-4">
                    <Link href="/admin/farmers" className="hp-btn hp-btn-sm hp-btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back')}
                    </Link>
                    <div>
                        <h1 className="hp-page-title">{t(`Add ${vocab.entity.singular}`)}</h1>
                        <p className="text-sm text-hp-muted mt-0.5">{t(`Register a new ${vocab.entity.singular.toLowerCase()} for ${industry.shortName}.`)}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="hp-card p-6 sm:p-8 space-y-6">
                    {Object.keys(errors).length > 0 && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1">
                            <p className="font-bold">{t('Please fix the following before saving:')}</p>
                            {Object.values(errors).map((err, i) => (
                                <p key={i}>• {err}</p>
                            ))}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                {t('Project Site Name / Title')} *
                            </label>
                            <input
                                type="text"
                                required
                                className="hp-input"
                                placeholder="e.g. Skyline Corporate Tower, Anna Nagar"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-hp-danger text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                <MapPin className="w-3.5 h-3.5 inline mr-1" /> {t('Location / Site Area')} *
                            </label>
                            <input
                                type="text"
                                required
                                className="hp-input"
                                placeholder="e.g. T. Nagar, OMR, Guindy"
                                value={data.village}
                                onChange={(e) => setData('village', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                {t('City')} *
                            </label>
                            <input
                                type="text"
                                required
                                className="hp-input"
                                placeholder="e.g. Chennai, Bengaluru, Coimbatore"
                                value={data.district}
                                onChange={(e) => setData('district', e.target.value)}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                {t('Full Site Address')}
                            </label>
                            <input
                                type="text"
                                className="hp-input"
                                placeholder="Plot No., Street, Landmark"
                                value={data.land_address}
                                onChange={(e) => setData('land_address', e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                <Building2 className="w-3.5 h-3.5 inline mr-1" /> {t('Project Type')} *
                            </label>
                            <select
                                className="hp-input font-semibold"
                                value={data.soil_type}
                                onChange={(e) => setData('soil_type', e.target.value)}
                            >
                                {PROJECT_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                {t('Total Area')} *
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="hp-input flex-1"
                                    placeholder="e.g. 2400"
                                    value={data.land_size_acres}
                                    onChange={(e) => setData('land_size_acres', e.target.value)}
                                />
                                <select
                                    className="hp-input w-28 font-semibold"
                                    value={data.irrigation_type}
                                    onChange={(e) => setData('irrigation_type', e.target.value)}
                                >
                                    {AREA_UNITS.map((u) => (
                                        <option key={u} value={u}>{u}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                {t('Site Contact Phone (Optional)')}
                            </label>
                            <input
                                type="tel"
                                className="hp-input"
                                placeholder="e.g. 9840123456"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                            {errors.phone && <p className="text-hp-danger text-xs mt-1">{errors.phone}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                {t('Assign Project Site To')}
                            </label>
                            <select
                                className="hp-input"
                                value={data.assignment_mode}
                                onChange={(e) => setData({ ...data, assignment_mode: e.target.value, assigned_to: '' })}
                            >
                                <option value="all">{t('All Employees')}</option>
                                <option value="individual">{t('One Employee')}</option>
                            </select>
                            {data.assignment_mode === 'individual' && (
                                <div className="mt-3">
                                    <select
                                        required
                                        className="hp-input"
                                        value={data.assigned_to}
                                        onChange={(e) => setData('assigned_to', e.target.value)}
                                    >
                                        <option value="">{t('Select Employee')}</option>
                                        {employees.map((employee) => (
                                            <option key={employee.id} value={employee.id}>{employee.name}</option>
                                        ))}
                                    </select>
                                    {errors.assigned_to && <p className="text-hp-danger text-xs mt-1">{errors.assigned_to}</p>}
                                </div>
                            )}
                            <p className="text-[11px] text-hp-muted mt-1.5">{t('The assigned site will appear in the selected employee’s mobile app.')}</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                {t('Project Documents')}
                            </label>
                            <label className="border border-dashed border-hp-border rounded-xl p-5 flex flex-col items-center justify-center bg-hp-bg hover:border-hp-primary cursor-pointer transition-colors text-center">
                                <FileText className="w-7 h-7 text-hp-primary mb-2" />
                                <span className="font-bold text-hp-dark text-xs">
                                    {docName || t('Upload Permit / Drawing PDF')}
                                </span>
                                <span className="text-[11px] text-hp-muted mt-0.5">PDF, PNG, JPG up to 10MB</span>
                                <input
                                    type="file"
                                    accept=".pdf,image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            setData('aadhaar_image', f);
                                            setDocName(f.name);
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">
                                {t('Site Image')}
                            </label>
                            <label className="border border-dashed border-hp-border rounded-xl p-5 flex flex-col items-center justify-center bg-hp-bg hover:border-hp-primary cursor-pointer transition-colors text-center">
                                <ImageIcon className="w-7 h-7 text-hp-primary mb-2" />
                                <span className="font-bold text-hp-dark text-xs">
                                    {imgName || t('Upload Site Photo')}
                                </span>
                                <span className="text-[11px] text-hp-muted mt-0.5">PNG, JPG up to 10MB</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            setData('farmer_photo', f);
                                            setImgName(f.name);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-hp-border">
                        <Link href="/admin/farmers" className="hp-btn hp-btn-secondary">{t('Cancel')}</Link>
                        <button type="submit" disabled={processing} className="hp-btn hp-btn-primary">
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            {processing ? t('Saving...') : t(`Save ${vocab.entity.singular}`)}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
