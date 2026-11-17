import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { useForm, Link } from '@inertiajs/react';
import {
    Shield, User, ArrowLeft, ArrowRight, Save, AlertCircle,
    KeyRound, Check, CheckCircle2, Smartphone
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../../hooks/useIndustry';

export default function EmployeeRegistrationForm() {
    const { t } = useTranslation();
    const { vocab, industry } = useIndustry();
    const [step, setStep] = useState(0);
    const [clientError, setClientError] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        emergency_phone: '',
        assigned_region: '',
    });

    const steps = [
        { id: 'personal', label: t('Personal Details'), icon: User },
        { id: 'assignment', label: t('Beat & Territory'), icon: Shield },
        { id: 'review', label: t('Review & Login'), icon: KeyRound },
    ];

    const isLast = step === steps.length - 1;

    const validateStep = () => {
        if (step === 0) {
            if (!data.name.trim()) { setClientError(t('Please enter the full name.')); return false; }
            if (!data.phone.trim()) { setClientError(t('Please enter the mobile number.')); return false; }
            if (!/^\d{10}$/.test(data.phone.trim())) { setClientError(t('Enter a valid 10-digit mobile number.')); return false; }
        }
        setClientError('');
        return true;
    };

    const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, steps.length - 1)); };
    const back = () => { setClientError(''); setStep((s) => Math.max(s - 1, 0)); };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isLast) { next(); return; }
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
                        <h1 className="hp-page-title">{t(`Onboard New ${vocab.staff.singular}`)}</h1>
                        <p className="text-sm text-hp-muted mt-0.5">{t(`Add a new certified ${vocab.staff.singular.toLowerCase()} to your ${industry.name} field operations workforce.`)}</p>
                    </div>
                </div>

                {/* Stepper */}
                <div className="hp-card p-4 sm:p-5">
                    <div className="flex items-center">
                        {steps.map((s, idx) => {
                            const Icon = s.icon;
                            const done = idx < step;
                            const active = idx === step;
                            return (
                                <React.Fragment key={s.id}>
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border text-sm font-bold transition-colors ${
                                            done ? 'bg-hp-success text-white border-hp-success'
                                                : active ? 'bg-hp-primary text-white border-hp-primary'
                                                    : 'bg-white text-hp-muted border-hp-border'
                                        }`}>
                                            {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                        </span>
                                        <span className={`text-xs sm:text-sm font-bold truncate ${active ? 'text-hp-dark' : 'text-hp-muted'}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={`flex-1 h-0.5 mx-2 sm:mx-3 rounded ${idx < step ? 'bg-hp-success' : 'bg-hp-border'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* Form Card */}
                <div className="hp-card">
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

                        {clientError && (
                            <div className="flex items-center gap-2 text-sm font-semibold text-hp-danger bg-hp-danger-light/40 border border-hp-danger-border rounded-lg px-3 py-2">
                                <AlertCircle className="w-4 h-4 shrink-0" /> {clientError}
                            </div>
                        )}

                        {/* STEP 1: Personal */}
                        {step === 0 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="hp-card-title flex items-center gap-2">
                                        <User className="w-5 h-5 text-hp-primary" />
                                        {t(`${vocab.staff.singular} Personal Details`)}
                                    </h2>
                                    <p className="text-xs text-hp-muted mt-0.5">{t(`Basic identity of the ${vocab.staff.singular.toLowerCase()}.`)}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t(`${vocab.staff.singular} Full Name`)}</label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Karthik Sundaram"
                                            className="hp-input"
                                        />
                                        {errors.name && <p className="text-hp-danger text-xs font-bold mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Mobile Number (App Login ID)')}</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="10-digit mobile number"
                                            className="hp-input"
                                        />
                                        {errors.phone && <p className="text-hp-danger text-xs font-bold mt-1">{errors.phone}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Assignment */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="hp-card-title flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-hp-primary" />
                                        {t('Operational Beat & Territory Assignment')}
                                    </h2>
                                    <p className="text-xs text-hp-muted mt-0.5">{t('Territory beat allocation and field emergency contact.')}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Emergency SOS Contact Phone')}</label>
                                        <input
                                            type="text"
                                            value={data.emergency_phone}
                                            onChange={(e) => setData('emergency_phone', e.target.value)}
                                            placeholder="Alternate emergency contact phone"
                                            className="hp-input"
                                        />
                                        {errors.emergency_phone && <p className="text-hp-danger text-xs font-bold mt-1">{errors.emergency_phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Assigned Operations Zone / Region')}</label>
                                        <input
                                            type="text"
                                            value={data.assigned_region}
                                            onChange={(e) => setData('assigned_region', e.target.value)}
                                            placeholder="e.g. Metro Central Beat"
                                            className="hp-input"
                                        />
                                        {errors.assigned_region && <p className="text-hp-danger text-xs font-bold mt-1">{errors.assigned_region}</p>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Review */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div>
                                    <h2 className="hp-card-title flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-hp-primary" />
                                        {t('Review & Create Login Credentials')}
                                    </h2>
                                    <p className="text-xs text-hp-muted mt-0.5">{t(`Confirm the details below. App login credentials are generated automatically on submit.`)}</p>
                                </div>

                                <div className="rounded-xl border border-hp-border divide-y divide-hp-border overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs text-hp-muted">{t(`${vocab.staff.singular} Name`)}</span>
                                        <span className="text-sm font-bold text-hp-dark">{data.name || '—'}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs text-hp-muted">{t('Mobile Number')}</span>
                                        <span className="text-sm font-bold text-hp-dark font-mono">{data.phone || '—'}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs text-hp-muted">{t('Emergency SOS Contact Phone')}</span>
                                        <span className="text-sm font-bold text-hp-dark font-mono">{data.emergency_phone || '—'}</span>
                                    </div>
                                    <div className="flex items-center justify-between px-4 py-3">
                                        <span className="text-xs text-hp-muted">{t('Assigned Operations Zone / Region')}</span>
                                        <span className="text-sm font-bold text-hp-dark">{data.assigned_region || '—'}</span>
                                    </div>
                                </div>

                                <div className="bg-hp-primary-light/40 border border-hp-primary-border rounded-lg p-4 flex items-start gap-3">
                                    <KeyRound className="w-5 h-5 text-hp-primary shrink-0 mt-0.5" />
                                    <div className="space-y-1">
                                        <h4 className="text-xs font-bold text-hp-dark uppercase tracking-wider">{t(`Automatic ${vocab.staff.singular} App Credentials`)}</h4>
                                        <p className="text-xs text-hp-muted flex items-center gap-1.5">
                                            <Smartphone className="w-3.5 h-3.5" />
                                            {t('App Login ID')}: <span className="font-mono font-bold text-hp-dark">{data.phone ? `${data.phone}@fieldy.io` : 'mobile@fieldy.io'}</span>
                                        </p>
                                        <p className="text-xs text-hp-muted">{t('A temporary secure password will be generated automatically and shown once after onboarding.')}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-3 pt-4 border-t border-hp-border">
                            <div>
                                {step > 0 && (
                                    <button type="button" onClick={back} className="hp-btn hp-btn-secondary">
                                        <ArrowLeft className="w-4 h-4 mr-1.5" /> {t('Back')}
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3">
                                <Link href="/admin/employees" className="hp-btn hp-btn-text">{t('Cancel')}</Link>
                                {!isLast ? (
                                    <button type="button" onClick={next} className="hp-btn hp-btn-primary">
                                        {t('Next')} <ArrowRight className="w-4 h-4 ml-1.5" />
                                    </button>
                                ) : (
                                    <button type="submit" disabled={processing} className="hp-btn hp-btn-primary">
                                        <Save className="w-4 h-4 mr-1.5" />
                                        {processing ? t('Onboarding...') : t(`Onboard ${vocab.staff.singular}`)}
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
