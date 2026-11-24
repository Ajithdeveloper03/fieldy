import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SuperadminLayout from './SuperadminLayout';
import CardPhotoBackdrop from '../../Components/CardPhotoBackdrop';
import SessionSecurityPanel from '../../Components/Superadmin/SessionSecurityPanel';
import { getIndustryById } from '../../data/industriesConfig';
import {
    Building2, Users2, MapPin, Activity,
    ArrowUpRight, TrendingUp, ShieldCheck,
    Plus, Sparkles, CheckCircle2, AlertTriangle, Layers,
    Home, ChevronRight
} from 'lucide-react';

export default function SuperadminDashboard({ stats, companies = [], planBreakdown = {} }) {
    const { t } = useTranslation();

    const statCards = [
        {
            title: t('Client Companies'),
            value: stats?.totalCompanies ?? 0,
            subtext: `${stats?.activeCompanies ?? 0} ${t('Active Tenancies')}`,
            icon: Building2,
            color: '#0F766E',
        },
        {
            title: t('Field Workforce'),
            value: stats?.totalEmployees ?? 0,
            subtext: `${stats?.activeTrackingToday ?? 0} ${t('active GPS sessions')}`,
            icon: Users2,
            color: '#1D4ED8',
        },
        {
            title: t("Today's Field Visits"),
            value: stats?.todayVisits ?? 0,
            subtext: `${stats?.totalVisits ?? 0} ${t('Lifetime Audits')}`,
            icon: MapPin,
            color: '#7E22CE',
        },
        {
            title: t('Customer Accounts'),
            value: stats?.totalFarmers ?? 0,
            subtext: `${stats?.totalAdmins ?? 0} ${t('Client Admins')}`,
            icon: ShieldCheck,
            color: '#D97706',
        },
    ];

    return (
        <SuperadminLayout>
            <Head title={t('Superadmin Platform Overview')} />

            <div className="space-y-6 pb-12 hp-animate-in">

                {/* ══════════ HERO CARD ══════════ */}
                <div className="hp-hero-card relative overflow-hidden p-6 sm:p-8">
                    <CardPhotoBackdrop photoKey="office" variant="right" opacity={0.28} />
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3.5 h-3.5 mr-1" /> {t('Multi-Tenant Orchestrator')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {t('Global Cloud Health 100%')}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-hp-dark tracking-tight leading-tight">
                                {t('Global Platform Control & Tenant Fleet')}
                            </h1>
                            <p className="text-base sm:text-[17px] text-hp-muted mt-2 leading-relaxed">
                                {t('High-level telemetry, active tenant companies, subscription allocation tiers, and aggregate workforce telemetry across all organizations.')}
                            </p>
                        </div>

                        {/* Register Action */}
                        <div className="shrink-0 self-start lg:self-center">
                            <Link
                                href="/superadmin/companies"
                                className="hp-btn hp-btn-primary !rounded-full !h-12 !px-6 !text-base"
                            >
                                <Plus className="w-5 h-5 mr-1" />
                                <span>{t('Register New Company')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ══════════ BENTO METRIC CARDS ══════════ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((card, idx) => {
                        const Icon = card.icon;
                        const photoKey = idx === 0 ? 'team' : idx === 2 ? 'engineer' : null;
                        return (
                            <div key={idx} className="hp-metric-pill-card relative overflow-hidden p-5">
                                {photoKey && <CardPhotoBackdrop photoKey={photoKey} variant="corner" opacity={0.24} />}
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold text-hp-muted uppercase tracking-wide">{card.title}</span>
                                        <span className="hp-icon-tile !w-10 !h-10" style={{ '--glass-tint': card.color, color: card.color }}>
                                            <Icon className="w-5 h-5" />
                                        </span>
                                    </div>
                                    <div className="text-3xl sm:text-4xl font-extrabold text-hp-dark">{card.value}</div>
                                    <p className="text-sm text-hp-muted mt-1.5 font-medium">{card.subtext}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ══════════ PLAN DISTRIBUTION & TENANT LEADERBOARD ══════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Subscription Plans Breakdown */}
                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between pb-3.5 border-b border-hp-border">
                            <div>
                                <h2 className="hp-card-title">{t('Subscription Tiers')}</h2>
                                <p className="text-sm text-hp-muted mt-0.5">{t('Tenants by pricing tier')}</p>
                            </div>
                            <span className="hp-icon-tile !w-10 !h-10" style={{ '--glass-tint': '#7E22CE', color: '#7E22CE' }}>
                                <Layers className="w-5 h-5" />
                            </span>
                        </div>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-white/80">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-hp-primary"></span>
                                    <span className="text-base font-bold text-hp-dark">{t('Enterprise')}</span>
                                </div>
                                <span className="hp-chip hp-chip-primary">
                                    {planBreakdown?.enterprise ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-white/80">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                                    <span className="text-base font-bold text-hp-dark">{t('Professional')}</span>
                                </div>
                                <span className="hp-chip hp-chip-success">
                                    {planBreakdown?.professional ?? 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/40 border border-white/80">
                                <div className="flex items-center gap-2.5">
                                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                    <span className="text-base font-bold text-hp-dark">{t('Starter')}</span>
                                </div>
                                <span className="hp-chip hp-chip-warning">
                                    {planBreakdown?.starter ?? 0}
                                </span>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-hp-border">
                            <Link
                                href="/superadmin/companies"
                                className="hp-btn hp-btn-outline w-full !rounded-full !h-11 text-sm"
                            >
                                <span>{t('Manage Plan Allocations')}</span>
                                <ArrowUpRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                    </div>

                    {/* Company Activity Leaderboard */}
                    <div className="lg:col-span-2 hp-bento-card !p-0 overflow-hidden">
                        <div className="p-5 border-b border-hp-border flex items-center justify-between">
                            <div>
                                <h2 className="hp-card-title">{t('Active Companies')}</h2>
                                <p className="text-sm text-hp-muted mt-0.5">{t('Workforce and live operations across tenants')}</p>
                            </div>
                            <Link
                                href="/superadmin/companies"
                                className="hp-btn hp-btn-sm hp-btn-outline"
                            >
                                <span>{t('View All')}</span>
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="hp-table">
                                <thead>
                                    <tr>
                                        <th>{t('Company')}</th>
                                        <th>{t('Plan')}</th>
                                        <th className="text-center">{t('Employees')}</th>
                                        <th className="text-center">{t("Today's Visits")}</th>
                                        <th className="text-center">{t('Status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companies.map((comp) => (
                                        <tr key={comp.id} className="hover:bg-hp-hover/60 transition-colors">
                                            <td className="pr-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-hp-primary-light text-hp-primary flex items-center justify-center font-bold text-base shrink-0">
                                                        {comp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[15px] sm:text-base text-hp-dark leading-snug">{comp.name}</p>
                                                        <p className="text-sm text-hp-muted">{t(getIndustryById(comp.industry).shortName)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="hp-chip hp-chip-gray capitalize">
                                                    {t(comp.plan)}
                                                </span>
                                            </td>
                                            <td className="text-center font-bold text-[15px] text-hp-dark">
                                                {comp.employees_count} <span className="text-sm text-hp-muted font-normal">/ {comp.max_employees}</span>
                                            </td>
                                            <td className="text-center">
                                                <span className="hp-chip hp-chip-success">
                                                    {comp.visits_today} {t('visits')}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <span className={`hp-chip ${comp.status === 'active' ? 'hp-chip-success hp-chip-dot' : 'hp-chip-danger'}`}>
                                                    {t(comp.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ══════════ SESSION ACTIVITIES, INACTIVITY GUARD & LOGIN SECURITY ══════════ */}
                <SessionSecurityPanel scopeLabel="Platform-Wide" />

            </div>
        </SuperadminLayout>
    );
}
