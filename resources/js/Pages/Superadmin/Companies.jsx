import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import SuperadminLayout from './SuperadminLayout';
import { 
    Building2, Plus, Search, Shield, 
    Users, Phone, Mail, MapPin, 
    CheckCircle2, XCircle, MoreVertical, 
    X, Edit3, Power, AlertCircle, ShieldAlert,
    Home, ChevronRight
} from 'lucide-react';

export default function Companies({ companies = [] }) {
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        industry: 'Agriculture & Field Operations',
        email: '',
        phone: '',
        address: '',
        plan: 'professional',
        max_employees: 50,
        subscription_expires_at: '',
        // Client Admin details
        admin_name: '',
        admin_email: '',
        admin_phone: '',
        admin_password: '',
    });

    const filteredCompanies = companies.filter((c) => 
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.code && c.code.toLowerCase().includes(search.toLowerCase()))
    );

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
        if (confirm('Are you sure you want to toggle the active status of this company?')) {
            router.post(`/superadmin/companies/${id}/toggle-status`);
        }
    };

    return (
        <SuperadminLayout>
            <Head title="Client Companies Management - Fieldy" />

            <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/superadmin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Superadmin</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">Client Companies</span>
                </div>

                {/* Hostinger hPanel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-hp-border)]">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            Client Companies
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                            Register, manage tenancies, configure limits, and provision client admins.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="hp-btn hp-btn-primary inline-flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Onboard Client Company</span>
                    </button>
                </div>

                {/* Search and Filters Bar */}
                <div className="hp-card p-3 sm:p-4 flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)]" />
                        <input
                            type="text"
                            placeholder="Search company name, code, email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="hp-input pl-9"
                        />
                    </div>
                    <div className="text-xs text-[var(--color-hp-gray-600)] font-medium">
                        Total: <span className="font-bold text-[var(--color-hp-dark)]">{filteredCompanies.length}</span> Companies
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
                                                {company.code || 'NO-CODE'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`hp-chip ${company.status === 'active' ? 'hp-chip-success' : 'hp-chip-danger'}`}>
                                        {company.status}
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

                                {/* Limits & Tier */}
                                <div className="mt-3.5 p-3 rounded-lg bg-[var(--color-hp-gray-50)] border border-[var(--color-hp-border)] space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--color-hp-gray-600)]">Subscription Tier</span>
                                        <span className="font-bold uppercase tracking-wider text-[var(--color-hp-primary)] text-[10px] bg-[var(--color-hp-primary-light)] px-2 py-0.5 rounded">
                                            {company.plan}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-[var(--color-hp-gray-600)]">Workforce Quota</span>
                                        <span className="font-semibold text-[var(--color-hp-dark)]">
                                            {company.employees_count} / {company.max_employees} agents
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
                                    <div className="mt-2.5 text-[11px] text-[var(--color-hp-gray-600)] flex items-center justify-between bg-[var(--color-hp-gray-50)] px-2.5 py-1.5 rounded border border-[var(--color-hp-border)]">
                                        <span>Admin:</span>
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
                                    <span>Inspect Data</span>
                                </Link>

                                <button
                                    onClick={() => handleToggleStatus(company.id)}
                                    className={`hp-btn hp-btn-sm inline-flex items-center justify-center ${
                                        company.status === 'active'
                                            ? 'text-rose-600 border border-rose-200 hover:bg-rose-50'
                                            : 'text-emerald-700 border border-emerald-200 hover:bg-emerald-50'
                                    }`}
                                    title={company.status === 'active' ? 'Suspend Tenant' : 'Activate Tenant'}
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
                        <div className="w-full max-w-2xl hp-card shadow-xl overflow-hidden my-8">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-hp-border)]">
                                <div className="flex items-center gap-2 text-[var(--color-hp-dark)] font-bold text-base">
                                    <Building2 className="w-5 h-5 text-[var(--color-hp-primary)]" />
                                    <span>Onboard New Client Company</span>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="p-1 rounded-md text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] hover:bg-[var(--color-hp-gray-100)] transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCompany} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                                <div className="text-xs font-bold text-[var(--color-hp-primary)] uppercase tracking-wider pb-1 border-b border-[var(--color-hp-border)]">
                                    1. Company Information
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Company Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g. Acme Agro Corp"
                                            className="hp-input"
                                        />
                                        {errors.name && <p className="text-rose-600 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Company Code / Prefix</label>
                                        <input
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            placeholder="e.g. ACME"
                                            className="hp-input font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Official Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="contact@acme.com"
                                            className="hp-input"
                                        />
                                        {errors.email && <p className="text-rose-600 text-xs mt-1">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Official Phone</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="+91 9876543210"
                                            className="hp-input"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Subscription Plan</label>
                                        <select
                                            value={data.plan}
                                            onChange={(e) => setData('plan', e.target.value)}
                                            className="hp-input"
                                        >
                                            <option value="starter">Starter (Up to 15 agents)</option>
                                            <option value="professional">Professional (Up to 50 agents)</option>
                                            <option value="enterprise">Enterprise (Custom/Unlimited)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Max Field Agents Allowed</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={data.max_employees}
                                            onChange={(e) => setData('max_employees', parseInt(e.target.value) || 1)}
                                            className="hp-input"
                                        />
                                    </div>
                                </div>

                                <div className="text-xs font-bold text-[var(--color-hp-primary)] uppercase tracking-wider pt-3 pb-1 border-b border-[var(--color-hp-border)]">
                                    2. Primary Client Admin Account
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Admin Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.admin_name}
                                            onChange={(e) => setData('admin_name', e.target.value)}
                                            placeholder="Admin Manager Name"
                                            className="hp-input"
                                        />
                                        {errors.admin_name && <p className="text-rose-600 text-xs mt-1">{errors.admin_name}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Admin Login Phone *</label>
                                        <input
                                            type="tel"
                                            required
                                            value={data.admin_phone}
                                            onChange={(e) => setData('admin_phone', e.target.value)}
                                            placeholder="9000000000"
                                            className="hp-input"
                                        />
                                        {errors.admin_phone && <p className="text-rose-600 text-xs mt-1">{errors.admin_phone}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Admin Login Email *</label>
                                        <input
                                            type="email"
                                            required
                                            value={data.admin_email}
                                            onChange={(e) => setData('admin_email', e.target.value)}
                                            placeholder="admin@client.com"
                                            className="hp-input"
                                        />
                                        {errors.admin_email && <p className="text-rose-600 text-xs mt-1">{errors.admin_email}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">Temporary Password *</label>
                                        <input
                                            type="text"
                                            required
                                            value={data.admin_password}
                                            onChange={(e) => setData('admin_password', e.target.value)}
                                            placeholder="Secure password (min 6 chars)"
                                            className="hp-input"
                                        />
                                        {errors.admin_password && <p className="text-rose-600 text-xs mt-1">{errors.admin_password}</p>}
                                    </div>
                                </div>

                                {/* Submit & Cancel */}
                                <div className="pt-4 border-t border-[var(--color-hp-border)] flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="hp-btn hp-btn-secondary"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="hp-btn hp-btn-primary"
                                    >
                                        {processing ? 'Provisioning...' : 'Provision Client Company'}
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
