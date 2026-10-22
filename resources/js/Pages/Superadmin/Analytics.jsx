import React from 'react';
import { Head, Link } from '@inertiajs/react';
import SuperadminLayout from './SuperadminLayout';
import { 
    BarChart3, TrendingUp, Calendar, 
    Building2, Activity, Users, MapPin, 
    ShieldAlert, Award, ArrowUpRight,
    Home, ChevronRight
} from 'lucide-react';

export default function Analytics({ visitTrends = [], topCompanies = [], summary = {} }) {
    const maxVisits = Math.max(...visitTrends.map(t => Math.max(t.visits || 0, t.checkins || 0)), 1);

    return (
        <SuperadminLayout>
            <Head title="Platform Analytics - Fieldy" />

            <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/superadmin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Superadmin</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">Platform Analytics</span>
                </div>

                {/* Hostinger hPanel Header */}
                <div className="pb-2 border-b border-[var(--color-hp-border)]">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                        Platform-Wide Analytics
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                        High-level operational trends, cross-company performance comparisons, and usage velocity.
                    </p>
                </div>

                {/* Top Stat Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="hp-card p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[var(--color-hp-gray-600)]">Lifetime Visits</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <MapPin className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {(summary.totalVisitsAllTime || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-[var(--color-hp-gray-500)] mt-1">Total customer visits registered platform-wide</p>
                    </div>

                    <div className="hp-card p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[var(--color-hp-gray-600)]">Total Check-in Logs</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <Calendar className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {(summary.totalAttendanceLogs || 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-[var(--color-hp-gray-500)] mt-1">Cumulative shifts logged by field agents</p>
                    </div>

                    <div className="hp-card p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[var(--color-hp-gray-600)]">Live GPS Tracking</span>
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] flex items-center justify-center">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-2 text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {summary.activeTrackingSessions ?? 0}
                        </div>
                        <p className="text-xs text-[var(--color-hp-gray-500)] mt-1">Active field routes streaming real-time telemetry</p>
                    </div>
                </div>

                {/* 7-Day Activity Trends (Custom SVG Bar Chart) */}
                <div className="hp-card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-hp-border)]">
                        <div>
                            <h2 className="text-sm font-bold text-[var(--color-hp-dark)]">7-Day Operational Velocity</h2>
                            <p className="text-xs text-[var(--color-hp-gray-500)]">Daily visit audits vs. agent shift check-ins across all client companies</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-[var(--color-hp-primary)]"></span>
                                <span className="text-[var(--color-hp-gray-700)] font-medium">Visits Completed</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                                <span className="text-[var(--color-hp-gray-700)] font-medium">Agent Check-ins</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-end gap-3 sm:gap-6 h-56 pt-4 px-2">
                        {visitTrends.map((trend, idx) => {
                            const visitHeight = Math.max(8, ((trend.visits || 0) / maxVisits) * 100);
                            const checkinHeight = Math.max(8, ((trend.checkins || 0) / maxVisits) * 100);

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                                        {/* Visits Bar */}
                                        <div
                                            style={{ height: `${visitHeight}%` }}
                                            className="w-1/2 max-w-[24px] rounded-t bg-[var(--color-hp-primary)] hover:opacity-90 transition-all flex items-start justify-center pt-1"
                                            title={`${trend.visits} visits`}
                                        >
                                            <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                {trend.visits}
                                            </span>
                                        </div>
                                        {/* Check-ins Bar */}
                                        <div
                                            style={{ height: `${checkinHeight}%` }}
                                            className="w-1/2 max-w-[24px] rounded-t bg-emerald-500 hover:opacity-90 transition-all flex items-start justify-center pt-1"
                                            title={`${trend.checkins} check-ins`}
                                        >
                                            <span className="text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                {trend.checkins}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[11px] font-medium text-[var(--color-hp-gray-600)] truncate">
                                        {trend.date}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Companies Activity Comparison */}
                <div className="hp-card overflow-hidden">
                    <div className="hp-card-header">
                        <h2 className="hp-card-title">Company Operational Volume</h2>
                        <p className="text-xs text-[var(--color-hp-gray-500)] mt-0.5">Tenants ranked by all-time field visits and customer registrations</p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="hp-table">
                            <thead>
                                <tr>
                                    <th>Rank & Company</th>
                                    <th className="text-center">Tier</th>
                                    <th className="text-center">Workforce</th>
                                    <th className="text-center">Facilities Tracked</th>
                                    <th className="text-center">Visits Recorded</th>
                                    <th className="text-center">Tenant Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topCompanies.map((comp, idx) => (
                                    <tr key={idx}>
                                        <td className="pr-4">
                                            <div className="flex items-center gap-2.5">
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] ${
                                                    idx === 0 ? 'bg-amber-100 text-amber-800' :
                                                    idx === 1 ? 'bg-slate-200 text-slate-700' :
                                                    'bg-[var(--color-hp-gray-100)] text-[var(--color-hp-gray-600)]'
                                                }`}>
                                                    {idx + 1}
                                                </span>
                                                <p className="font-semibold text-xs text-[var(--color-hp-dark)]">{comp.name}</p>
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-[var(--color-hp-gray-100)] text-[var(--color-hp-gray-700)]">
                                                {comp.plan}
                                            </span>
                                        </td>
                                        <td className="text-center font-semibold text-xs text-[var(--color-hp-dark)]">
                                            {comp.employees} agents
                                        </td>
                                        <td className="text-center font-semibold text-xs text-[var(--color-hp-dark)]">
                                            {comp.farmers}
                                        </td>
                                        <td className="text-center">
                                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                {comp.visits} visits
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
        </SuperadminLayout>
    );
}
