import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SuperadminLayout from './SuperadminLayout';
import { 
    Building2, Users2, MapPin, Activity, 
    ArrowUpRight, TrendingUp, ShieldCheck, 
    Plus, Sparkles, CheckCircle2, AlertTriangle, Layers,
    Home, ChevronRight
} from 'lucide-react';

export default function SuperadminDashboard({ stats, companies = [], planBreakdown = {} }) {
    const statCards = [
        {
            title: 'Client Companies',
            value: stats?.totalCompanies ?? 0,
            subtext: `${stats?.activeCompanies ?? 0} Active Tenancies`,
            icon: Building2,
            iconBg: 'bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)]',
        },
        {
            title: 'Field Workforce',
            value: stats?.totalEmployees ?? 0,
            subtext: `${stats?.activeTrackingToday ?? 0} active GPS sessions`,
            icon: Users2,
            iconBg: 'bg-emerald-50 text-emerald-600',
        },
        {
            title: "Today's Field Visits",
            value: stats?.todayVisits ?? 0,
            subtext: `${stats?.totalVisits ?? 0} Lifetime Audits`,
            icon: MapPin,
            iconBg: 'bg-amber-50 text-amber-600',
        },
        {
            title: 'Customer Accounts',
            value: stats?.totalFarmers ?? 0,
            subtext: `${stats?.totalAdmins ?? 0} Client Admins`,
            icon: ShieldCheck,
            iconBg: 'bg-sky-50 text-sky-600',
        },
    ];

    return (
        <SuperadminLayout>
            <Head title="Superadmin Platform Overview" />

            <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/superadmin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Superadmin</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">Platform Overview</span>
                </div>

                {/* Hostinger hPanel Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--color-hp-border)]">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            Global Platform Dashboard
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                            Cross-company intelligence, tenant metrics, and platform health.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/superadmin/companies"
                            className="hp-btn hp-btn-primary inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Register New Company</span>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={idx}
                                className="hp-card p-5"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-[var(--color-hp-gray-600)]">
                                        {card.title}
                                    </span>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                                    {card.value}
                                </div>
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-hp-gray-500)]">
                                    <Activity className="w-3.5 h-3.5 text-[var(--color-hp-primary)]" />
                                    <span>{card.subtext}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Plan Distribution and Platform Usage */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Subscription Plans Breakdown */}
                    <div className="hp-card p-5 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-hp-border)]">
                                <div>
                                    <h2 className="text-sm font-bold text-[var(--color-hp-dark)]">Subscription Tiers</h2>
                                    <p className="text-[11px] text-[var(--color-hp-gray-500)]">Tenants by pricing tier</p>
                                </div>
                                <Layers className="w-4 h-4 text-[var(--color-hp-primary)]" />
                            </div>
                            <div className="mt-4 space-y-2.5">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-hp-gray-50)] border border-[var(--color-hp-border)]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--color-hp-primary)]"></span>
                                        <span className="text-xs font-semibold text-[var(--color-hp-dark)]">Enterprise</span>
                                    </div>
                                    <span className="text-xs font-bold text-[var(--color-hp-primary)] bg-[var(--color-hp-primary-light)] px-2 py-0.5 rounded">
                                        {planBreakdown?.enterprise ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-hp-gray-50)] border border-[var(--color-hp-border)]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                        <span className="text-xs font-semibold text-[var(--color-hp-dark)]">Professional</span>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                        {planBreakdown?.professional ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-hp-gray-50)] border border-[var(--color-hp-border)]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                        <span className="text-xs font-semibold text-[var(--color-hp-dark)]">Starter</span>
                                    </div>
                                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                        {planBreakdown?.starter ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-[var(--color-hp-border)]">
                            <Link
                                href="/superadmin/companies"
                                className="text-xs font-semibold text-[var(--color-hp-primary)] hover:underline flex items-center justify-between"
                            >
                                <span>Manage Plan Allocations</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Company Activity Leaderboard */}
                    <div className="lg:col-span-2 hp-card overflow-hidden">
                        <div className="hp-card-header flex items-center justify-between">
                            <div>
                                <h2 className="hp-card-title">Active Companies</h2>
                                <p className="text-[11px] text-[var(--color-hp-gray-500)] mt-0.5">Workforce and live operations across tenants</p>
                            </div>
                            <Link
                                href="/superadmin/companies"
                                className="text-xs font-semibold text-[var(--color-hp-primary)] hover:underline flex items-center gap-1"
                            >
                                <span>View All</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="hp-table">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Plan</th>
                                        <th className="text-center">Employees</th>
                                        <th className="text-center">Today's Visits</th>
                                        <th className="text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((comp) => (
                                        <tr key={comp.id}>
                                            <td className="pr-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-md bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] flex items-center justify-center font-bold text-xs">
                                                        {comp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-xs text-[var(--color-hp-dark)] leading-snug">{comp.name}</p>
                                                        <p className="text-[11px] text-[var(--color-hp-gray-500)]">{comp.industry || 'Field Ops'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-xs capitalize font-semibold px-2 py-0.5 rounded bg-[var(--color-hp-gray-100)] text-[var(--color-hp-gray-700)]">
                                                    {comp.plan}
                                                </span>
                                            </td>
                                            <td className="text-center font-semibold text-xs text-[var(--color-hp-dark)]">
                                                {comp.employees_count} <span className="text-[11px] text-[var(--color-hp-gray-500)] font-normal">/ {comp.max_employees}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                    {comp.visits_today} visits
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`hp-chip ${comp.status === 'active' ? 'hp-chip-success' : 'hp-chip-danger'}`}>
                                                    {comp.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </SuperadminLayout>
    );
}
