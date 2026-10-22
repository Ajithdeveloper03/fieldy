import React from 'react';
import AdminLayout from '../AdminLayout';
import { useForm, Link } from '@inertiajs/react';
import { Shield, User, Phone, MapPin, ArrowLeft, Save, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EmployeeRegistrationForm() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        emergency_phone: '',
        assigned_region: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/admin/employees');
    };

    return (
        <AdminLayout>
            <div className="max-w-3xl mx-auto space-y-6 pb-12 hp-animate-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/employees" className="hp-btn hp-btn-sm hp-btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back')}
                    </Link>
                    <div>
                        <h1 className="hp-page-title">{t('Register Field Officer')}</h1>
                        <p className="text-sm text-hp-muted mt-0.5">{t('Add a new field technician or inspector to your workforce.')}</p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="hp-card">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
                        
                        {/* Personal Info */}
                        <div>
                            <div className="mb-4">
                                <h2 className="hp-card-title flex items-center gap-2">
                                    <User className="w-5 h-5 text-hp-primary" />
                                    {t('Personal & Contact Information')}
                                </h2>
                                <p className="text-xs text-hp-muted mt-0.5">{t('Used for app login and mobile telemetry.')}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Full Name')}</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g. Anand Kumar"
                                        className="hp-input"
                                    />
                                    {errors.name && <p className="text-hp-danger text-xs font-bold mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Mobile Number (Login ID)')}</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="10-digit mobile number"
                                        className="hp-input"
                                    />
                                    {errors.phone && <p className="text-hp-danger text-xs font-bold mt-1">{errors.phone}</p>}
                                </div>
                            </div>
                        </div>

                        <hr className="border-hp-border" />

                        {/* Operational Info */}
                        <div>
                            <div className="mb-4">
                                <h2 className="hp-card-title flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-hp-primary" />
                                    {t('Operational & Zone Assignment')}
                                </h2>
                                <p className="text-xs text-hp-muted mt-0.5">{t('Routing boundaries and safety contacts.')}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Emergency Contact Phone')}</label>
                                    <input
                                        type="text"
                                        value={data.emergency_phone}
                                        onChange={(e) => setData('emergency_phone', e.target.value)}
                                        placeholder="Alternate contact phone"
                                        className="hp-input"
                                    />
                                    {errors.emergency_phone && <p className="text-hp-danger text-xs font-bold mt-1">{errors.emergency_phone}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Assigned Region / Zone')}</label>
                                    <input
                                        type="text"
                                        value={data.assigned_region}
                                        onChange={(e) => setData('assigned_region', e.target.value)}
                                        placeholder="e.g. Coimbatore South"
                                        className="hp-input"
                                    />
                                    {errors.assigned_region && <p className="text-hp-danger text-xs font-bold mt-1">{errors.assigned_region}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Notice */}
                        <div className="bg-hp-primary-light/40 border border-hp-primary-border rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-hp-primary shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-hp-dark uppercase tracking-wider">{t('Automatic Credentials Provisioning')}</h4>
                                <p className="text-xs text-hp-muted mt-0.5">{t('A temporary high-entropy password will be generated automatically and displayed upon registration.')}</p>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-hp-border">
                            <Link href="/admin/employees" className="hp-btn hp-btn-secondary">
                                {t('Cancel')}
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="hp-btn hp-btn-primary"
                            >
                                <Save className="w-4 h-4 mr-1.5" />
                                {processing ? t('Registering...') : t('Register Officer')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
