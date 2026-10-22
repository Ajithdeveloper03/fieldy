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
        },
        {
            title: 'Field Workforce',
            value: stats?.totalEmployees ?? 0,
            subtext: `${stats?.activeTrackingToday ?? 0} active GPS sessions`,
            icon: Users2,
        },
        {
            title: "Today's Field Visits",
            value: stats?.todayVisits ?? 0,
            subtext: `${stats?.totalVisits ?? 0} Lifetime Audits`,
            icon: MapPin,
        },
        {
            title: 'Customer Accounts',
            value: stats?.totalFarmers ?? 0,
            subtext: `${stats?.totalAdmins ?? 0} Client Admins`,
            icon: ShieldCheck,
        },
    ];

    return (
        <SuperadminLayout>
            <Head title="Superadmin Platform Overview" />

            <div className="space-y-6 pb-12 hp-animate-in">

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> Multi-Tenant Orchestrator
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    Global Cloud Health 100%
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                Global Platform Control & Tenant Fleet
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                High-level telemetry, active tenant companies, subscription allocation tiers, and aggregate workforce telemetry across all organizations.
                            </p>
                        </div>

                        {/* Register Action */}
                        <div className="shrink-0 self-start lg:self-center">
                            <Link
                                href="/superadmin/companies"
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                <span>Register New Company</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS ══════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        return (
                            <div key={idx} className="hp-metric-pill-card">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{card.title}</span>
                                    <Icon className="w-3.5 h-3.5 text-hp-primary" />
                                </div>
                                <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{card.value}</div>
                                <p className="text-xs text-hp-muted mt-1">{card.subtext}</p>
                            </div>
                        );
                    })}
                </div>

                {/* ══════════ PLAN DISTRIBUTION & TENANT LEADERBOARD ══════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Subscription Plans Breakdown */}
                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between pb-3 border-b border-hp-border">
                            <div>
                                <h2 className="hp-card-title text-sm">Subscription Tiers</h2>
                                <p className="text-xs text-hp-muted">Tenants by pricing tier</p>
                            </div>
                            <Layers className="w-4 h-4 text-hp-primary" />
                        </div>
                        <div className="mt-4 space-y-2.5">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-hp-hover/60 border border-hp-border">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-hp-primary"></span>
                                    <span className="text-xs font-bold text-hp-dark">Enterprise</span>
                                </div>
                                <span className="hp-chip hp-chip-primary !h-5 !text-[11px]">
                                    {planBreakdown?.enterprise ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-hp-hover/60 border border-hp-border">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-xs font-bold text-hp-dark">Professional</span>
                                </div>
                                <span className="hp-chip hp-chip-success !h-5 !text-[11px]">
                                    {planBreakdown?.professional ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-hp-hover/60 border border-hp-border">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                    <span className="text-xs font-bold text-hp-dark">Starter</span>
                                </div>
                                <span className="hp-chip hp-chip-warning !h-5 !text-[11px]">
                                    {planBreakdown?.starter ?? 0}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-hp-border">
                            <Link
                                href="/superadmin/companies"
                                className="hp-btn hp-btn-outline w-full !rounded-xl !h-9 text-xs"
                            >
                                <span>Manage Plan Allocations</span>
                                <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Company Activity Leaderboard */}
                    <div className="lg:col-span-2 hp-bento-card !p-0 overflow-hidden">
                        <div className="p-4 border-b border-hp-border flex items-center justify-between bg-white">
                            <div>
                                <h2 className="hp-card-title text-sm">Active Companies</h2>
                                <p className="text-xs text-hp-muted mt-0.5">Workforce and live operations across tenants</p>
                            </div>
                            <Link
                                href="/superadmin/companies"
                                className="hp-btn hp-btn-sm hp-btn-outline"
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
                                        <tr key={comp.id} className="hover:bg-hp-hover/60 transition-colors">
                                            <td className="pr-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-hp-primary-light text-hp-primary flex items-center justify-center font-bold text-xs shrink-0">
                                                        {comp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xs text-hp-dark leading-snug">{comp.name}</p>
                                                        <p className="text-[11px] text-hp-muted">{comp.industry || 'Field Ops'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="hp-chip hp-chip-gray !h-5 !text-[11px] capitalize">
                                                    {comp.plan}
                                                </span>
                                            </td>
                                            <td className="text-center font-bold text-xs text-hp-dark">
                                                {comp.employees_count} <span className="text-[11px] text-hp-muted font-normal">/ {comp.max_employees}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className="hp-chip hp-chip-success !h-5 !text-[11px]">
                                                    {comp.visits_today} visits
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`hp-chip ${comp.status === 'active' ? 'hp-chip-success hp-chip-dot' : 'hp-chip-danger'}`}>
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
