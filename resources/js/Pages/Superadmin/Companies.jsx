import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SuperadminLayout from './SuperadminLayout';
import { INDUSTRIES, getIndustryById } from '../../data/industriesConfig';
import {
    Building2, Plus, Shield, ShieldCheck, KeyRound, Eye, EyeOff, Globe,
    Users, Phone, Mail, MapPin,
    CheckCircle2, XCircle, MoreVertical,
    X, Edit3, Power, AlertCircle, ShieldAlert,
    Home, ChevronRight
} from 'lucide-react';

const CLIENT_INDUSTRY_IDS = [
    'real_estate', 'facility_fmcg', 'construction', 'security',
    'cleaning', 'maintenance', 'solar', 'pest_control',
];
const CLIENT_INDUSTRIES = INDUSTRIES.filter(({ id }) => CLIENT_INDUSTRY_IDS.includes(id));

export default function Companies({ companies = [] }) {
    const { t } = useTranslation();
    const [industryFilter, setIndustryFilter] = useState('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        industry: 'construction',
        email: '',
        phone: '',
        city: '',
        state: 'Tamil Nadu',
        address: '',
        gst_number: '',
        website: '',
        estimated_sites: 5,
        plan: 'professional',
        billing_cycle: 'annual',
        max_employees: 50,
        subscription_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        // Client Admin & Security Controls
        admin_name: '',
        admin_designation: 'Operations Director',
        admin_email: '',
        admin_phone: '',
        admin_password: '',
        force_password_reset: true,
        require_gps_geofence: true,
        require_selfie_verification: true,
    });

    const generateStrongPassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789@#&!';
        let pwd = 'Fld';
        for (let i = 0; i < 9; i++) {
            pwd += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setData('admin_password', pwd);
        setShowPassword(true);
    };

    const passwordStrength = (() => {
        const p = data.admin_password || '';
        if (p.length >= 10 && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p)) return { label: t('Strong'), color: 'text-emerald-600', bar: 'w-full bg-emerald-500' };
        if (p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p)) return { label: t('Good'), color: 'text-amber-600', bar: 'w-2/3 bg-amber-500' };
        return { label: t('Weak (min 8 chars, letters + numbers)'), color: 'text-rose-600', bar: 'w-1/3 bg-rose-500' };
    })();

    const filteredCompanies = industryFilter === 'all'
        ? companies
        : companies.filter((c) => c.industry === industryFilter);

    const handleCreateCompany = (e) => {
        e.preventDefault();
        post('/superadmin/companies', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            },
        });
    };

    const handleToggleStatus = (id) => {
        if (confirm(t('Are you sure you want to toggle the active status of this company?'))) {
            router.post(`/superadmin/companies/${id}/toggle-status`);
        }
    };

    return (
        <SuperadminLayout>
            <Head title={`${t('Client Companies')} - Fieldy`} />

            <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/superadmin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>{t('Superadmin')}</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">{t('Client Companies')}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-hp-border)]">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {t('Client Companies')}
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                            {t('Register, manage tenancies, configure limits, and provision client admins.')}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="hp-btn hp-btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{t('Onboard Client Company')}</span>
                    </button>
                </div>

                {/* Search and Filters Bar */}
                <div className="hp-card p-3 sm:p-4 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)] pointer-events-none" />
                        <select
                            value={industryFilter}
                            onChange={(e) => setIndustryFilter(e.target.value)}
                            className="hp-input pl-9 appearance-none cursor-pointer"
                        >
                            <option value="all">{t('All Company Types')}</option>
                            {CLIENT_INDUSTRIES.map((industry) => (
                                <option key={industry.id} value={industry.id}>{t(industry.name)}</option>
                            ))}
                        </select>
                        <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[var(--color-hp-gray-500)] pointer-events-none" />
                    </div>
                    <div className="text-xs text-[var(--color-hp-gray-600)] font-medium">
                        {t('Total')}: <span className="font-bold text-[var(--color-hp-dark)]">{filteredCompanies.length}</span> {t('Companies')}
                    </div>
                </div>

                {/* Companies Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCompanies.map((company) => (
                        <div
                            key={company.id}
                            className="hp-card p-5 flex flex-col justify-between"
                        >
                            <div>
                                {/* Card Header */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] flex items-center justify-center font-bold text-base">
                                            {company.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[var(--color-hp-dark)] text-sm leading-tight hover:text-[var(--color-hp-primary)] transition-colors">
                                                {company.name}
                                            </h3>
                                            <span className="text-[11px] font-mono text-[var(--color-hp-gray-500)]">
                                                {company.code || t('NO-CODE')}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`hp-chip ${company.status === 'active' ? 'hp-chip-success' : 'hp-chip-danger'}`}>
                                        {t(company.status)}
                                    </span>
                                </div>

                                {/* Details & Contact */}
                                <div className="mt-3.5 space-y-1.5 text-xs text-[var(--color-hp-gray-600)]">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)] shrink-0" />
                                        <span className="truncate">{company.email}</span>
                                    </div>
                                    {company.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)] shrink-0" />
                                            <span>{company.phone}</span>
                                        </div>
                                    )}
                                    {company.address && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)] shrink-0" />
                                            <span className="truncate">{company.address}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-2.5 flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                                    <Building2 className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)] shrink-0" />
                                    <span className="font-medium text-[var(--color-hp-dark)]">
                                        {t(getIndustryById(company.industry).name)}
                                    </span>
                                </div>

                                {/* Limits & Tier */}
                                <div className="mt-3.5 p-3 rounded-lg bg-white/40 border border-white/80 space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--color-hp-gray-600)]">{t('Subscription Tier')}</span>
                                        <span className="font-bold uppercase tracking-wider text-[var(--color-hp-primary)] text-[10px] bg-[var(--color-hp-primary-light)] px-2 py-0.5 rounded">
                                            {t(company.plan)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--color-hp-gray-600)]">{t('Workforce Quota')}</span>
                                        <span className="font-semibold text-[var(--color-hp-dark)]">
                                            {company.employees_count} / {company.max_employees} {t('agents')}
                                        </span>
                                    </div>
                                    {/* Capacity progress bar */}
                                    <div className="w-full bg-[var(--color-hp-gray-200)] h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="bg-[var(--color-hp-primary)] h-full rounded-full transition-all"
                                            style={{ width: `${Math.min(100, (company.employees_count / (company.max_employees || 1)) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Admin assigned */}
                                {company.admin && (
                                    <div className="mt-2.5 text-[11px] text-[var(--color-hp-gray-600)] flex items-center justify-between bg-white/40 px-2.5 py-1.5 rounded border border-white/80">
                                        <span>{t('Admin')}:</span>
                                        <span className="font-medium text-[var(--color-hp-dark)] truncate ml-1">{company.admin.name} ({company.admin.email})</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-4 pt-3 border-t border-[var(--color-hp-border)] flex items-center justify-between gap-2">
                                <Link
                                    href={`/superadmin/companies/${company.id}`}
                                    className="flex-1 hp-btn hp-btn-secondary hp-btn-sm inline-flex items-center justify-center gap-1.5"
                                >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>{t('Inspect Data')}</span>
                                </Link>

                                <button
                                    onClick={() => handleToggleStatus(company.id)}
                                    className={`hp-btn hp-btn-sm inline-flex items-center justify-center ${
                                        company.status === 'active'
                                            ? 'text-rose-600 border border-rose-200 hover:bg-rose-50'
                                            : 'text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                                    }`}
                                    title={company.status === 'active' ? t('Suspend Tenant') : t('Activate Tenant')}
                                >
                                    <Power className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Create Company Modal */}
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
                        <div className="w-full max-w-2xl hp-pop rounded-2xl overflow-hidden my-8">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-hp-border)]">
                                <div className="flex items-center gap-2 text-[var(--color-hp-dark)] font-bold text-base">
                                    <Building2 className="w-5 h-5 text-[var(--color-hp-primary)]" />
                                    <span>{t('Onboard New Client Company')}</span>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-1 rounded-md text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] hover:bg-[var(--color-hp-gray-100)] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCompany} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
                                {Object.keys(errors).length > 0 && (
                                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-1">
                                        <p className="font-bold">{t('Please fix the following validation errors:')}</p>
                                        {Object.values(errors).map((err, i) => (
                                            <p key={i}>• {err}</p>
                                        ))}
                                    </div>
                                )}

                                <div className="text-xs font-bold text-[var(--color-hp-primary)] uppercase tracking-wider pb-1 border-b border-[var(--color-hp-border)]">
                                    {t('1. Organization & Business Identity')}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Company Legal Name')} *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder={t('e.g. Sri Murugan Infra Pvt Ltd')}
                                            className="hp-input"
                                        />
                                        {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Tenant Prefix Code')} *</label>
                                        <input
                                            type="text"
                                            required
                                            maxLength={50}
                                            pattern="[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            placeholder={t('e.g. SMINF')}
                                            className="hp-input font-mono"
                                        />
                                        <p className="text-xs text-[var(--color-hp-gray-500)] mt-1">{t('Employee code example')}: {data.code.trim() || 'SMINF'}-EMP-0001</p>
                                        {errors.code && <p className="text-rose-600 text-xs mt-1">{errors.code}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Primary Service Vertical')} *</label>
                                        <select
                                            required
                                            value={data.industry}
                                            onChange={(e) => setData('industry', e.target.value)}
                                            className="hp-input"
                                        >
                                            {CLIENT_INDUSTRIES.map((industry) => (
                                                <option key={industry.id} value={industry.id}>{t(industry.name)}</option>
                                            ))}
                                        </select>
                                        {errors.industry && <p className="text-rose-600 text-xs mt-1">{errors.industry}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('GSTIN / Business Reg. ID')}</label>
                                        <input
                                            type="text"
                                            value={data.gst_number}
                                            onChange={(e) => setData('gst_number', e.target.value.toUpperCase())}
                                            placeholder={t('e.g. 33AABCU9603R1ZM')}
                                            className="hp-input font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('City')} *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.city}
                                            onChange={(e) => setData('city', e.target.value)}
                                            placeholder={t('e.g. Chennai, Trichy, Coimbatore')}
                                            className="hp-input"
                                        />
                                        {errors.city && <p className="text-rose-600 text-xs mt-1">{errors.city}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('State')}</label>
                                        <input
                                            type="text"
                                            value={data.state}
                                            onChange={(e) => setData('state', e.target.value)}
                                            placeholder={t('Tamil Nadu')}
                                            className="hp-input"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Headquarters / Registered Address')}</label>
                                    <input
                                        type="text"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder={t('No. 42, Anna Salai, Teynampet')}
                                        className="hp-input"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Official Email')} *</label>
                                        <input
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="ops@company.in"
                                            className="hp-input"
                                        />
                                        {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Official Phone')} *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+91 9840012345"
                                            className="hp-input"
                                        />
                                        {errors.phone && <p className="text-rose-600 text-xs mt-1">{errors.phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Estimated Project Sites')}</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.estimated_sites}
                                            onChange={(e) => setData('estimated_sites', parseInt(e.target.value) || 1)}
                                            className="hp-input"
                                        />
                                    </div>
                                </div>

                                <div className="text-xs font-bold text-[var(--color-hp-primary)] uppercase tracking-wider pt-2 pb-1 border-b border-[var(--color-hp-border)]">
                                    {t('2. Subscription Quota & Contract Term')}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Subscription Plan')}</label>
                                        <select
                                            value={data.plan}
                                            onChange={(e) => {
                                                const nextPlan = e.target.value;
                                                setData('plan', nextPlan);
                                                if (nextPlan === 'starter' && data.max_employees > 15) setData('max_employees', 15);
                                                if (nextPlan === 'professional' && data.max_employees > 50) setData('max_employees', 50);
                                            }}
                                            className="hp-input"
                                        >
                                            <option value="starter">{t('Starter (Up to 15 agents)')}</option>
                                            <option value="professional">{t('Professional (Up to 50 agents)')}</option>
                                            <option value="enterprise">{t('Enterprise (Custom/Unlimited)')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Max Field Agents Allowed')}</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={data.plan === 'starter' ? 15 : data.plan === 'professional' ? 50 : undefined}
                                            value={data.max_employees}
                                            onChange={(e) => setData('max_employees', parseInt(e.target.value) || 1)}
                                            className="hp-input"
                                        />
                                        {errors.max_employees && <p className="text-red-500 text-xs mt-1">{errors.max_employees}</p>}
                                        {((data.plan === 'starter' && data.max_employees > 15) || (data.plan === 'professional' && data.max_employees > 50)) && (
                                            <p className="text-red-500 text-xs mt-1">
                                                {data.plan === 'starter' ? t('Starter plan allows up to 15 agents max.') : t('Professional plan allows up to 50 agents max.')}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Billing Cycle')}</label>
                                        <select
                                            value={data.billing_cycle}
                                            onChange={(e) => setData('billing_cycle', e.target.value)}
                                            className="hp-input"
                                        >
                                            <option value="annual">{t('Annual Contract')}</option>
                                            <option value="monthly">{t('Monthly Retainer')}</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Subscription Valid Until')}</label>
                                        <input
                                            type="date"
                                            value={data.subscription_expires_at}
                                            onChange={(e) => setData('subscription_expires_at', e.target.value)}
                                            className="hp-input"
                                        />
                                    </div>
                                </div>

                                <div className="text-xs font-bold text-[var(--color-hp-primary)] uppercase tracking-wider pt-2 pb-1 border-b border-[var(--color-hp-border)] flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>{t('3. Primary Client Admin & Security Controls')}</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Admin Full Name')} *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.admin_name}
                                            onChange={(e) => setData('admin_name', e.target.value)}
                                            placeholder={t('e.g. Karthik Subramanian')}
                                            className="hp-input"
                                        />
                                        {errors.admin_name && <p className="text-rose-600 text-xs mt-1">{errors.admin_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Admin Role / Designation')}</label>
                                        <input
                                            type="text"
                                            value={data.admin_designation}
                                            onChange={(e) => setData('admin_designation', e.target.value)}
                                            placeholder={t('Operations Director')}
                                            className="hp-input"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Admin Login Phone')} *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={data.admin_phone}
                                            onChange={(e) => setData('admin_phone', e.target.value)}
                                            placeholder="9840012345"
                                            className="hp-input"
                                        />
                                        {errors.admin_phone && <p className="text-rose-600 text-xs mt-1">{errors.admin_phone}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">{t('Admin Login Email')} *</label>
                                        <input
                                            type="email"
                                            required
                                            value={data.admin_email}
                                            onChange={(e) => setData('admin_email', e.target.value)}
                                            placeholder="admin@company.in"
                                            className="hp-input"
                                        />
                                        {errors.admin_email && <p className="text-rose-600 text-xs mt-1">{errors.admin_email}</p>}
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)]">{t('Secure Admin Password')} *</label>
                                        <button
                                            type="button"
                                            onClick={generateStrongPassword}
                                            className="text-[11px] font-bold text-[var(--color-hp-primary)] hover:underline inline-flex items-center gap-1"
                                        >
                                            <KeyRound className="w-3 h-3" /> {t('Generate Strong Password')}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            value={data.admin_password}
                                            onChange={(e) => setData('admin_password', e.target.value)}
                                            placeholder={t('Min 8 characters with letters & numbers')}
                                            className="hp-input pr-10 font-mono"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)]"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-[var(--color-hp-gray-200)] rounded-full overflow-hidden">
                                            <div className={`h-full transition-all ${passwordStrength.bar}`} />
                                        </div>
                                        <span className={`text-[10px] font-bold ${passwordStrength.color}`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    {errors.admin_password && <p className="text-rose-600 text-xs mt-1">{errors.admin_password}</p>}
                                </div>

                                {/* Tenant Security Policies */}
                                <div className="p-3.5 rounded-xl bg-white/40 border border-white/80 space-y-2.5">
                                    <p className="text-[11px] font-bold text-[var(--color-hp-dark)] uppercase tracking-wider">{t('Security & Field Compliance Policies')}</p>
                                    <label className="flex items-center gap-2.5 text-xs text-[var(--color-hp-dark)] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.force_password_reset}
                                            onChange={(e) => setData('force_password_reset', e.target.checked)}
                                            className="rounded border-slate-300"
                                        />
                                        <span>{t('Force admin password rotation on initial onboarding sign-in')}</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 text-xs text-[var(--color-hp-dark)] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.require_gps_geofence}
                                            onChange={(e) => setData('require_gps_geofence', e.target.checked)}
                                            className="rounded border-slate-300"
                                        />
                                        <span>{t('Enforce live GPS geofence verification for field attendance & check-in')}</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 text-xs text-[var(--color-hp-dark)] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.require_selfie_verification}
                                            onChange={(e) => setData('require_selfie_verification', e.target.checked)}
                                            className="rounded border-slate-300"
                                        />
                                        <span>{t('Require live field photo proof before visit checkout & report submission')}</span>
                                    </label>
                                </div>

                                {/* Submit & Cancel */}
                                <div className="pt-4 border-t border-[var(--color-hp-border)] flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="hp-btn hp-btn-secondary"
                                    >
                                        {t('Cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="hp-btn hp-btn-primary"
                                    >
                                        {processing ? t('Provisioning...') : t('Provision Client Company')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </SuperadminLayout>
    );
}
