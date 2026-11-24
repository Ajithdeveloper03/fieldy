import React, { useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    AlertCircle, Calendar, Clock, ArrowUpRight, ArrowUp, ArrowDown, FileCheck2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getIndianPhoto } from '../CardPhotoBackdrop';

export default function VisualCommandDeck({
    currentIndustry,
    stats = {},
    resolvedKpis = [],
    effectiveIsTenant = false,
    growthData = [],
}) {
    const { t } = useTranslation();

    const cardPhoto = getIndianPhoto(currentIndustry?.id || 'real_estate');

    // 7-day normalized real data for Mini Bar Chart (Card 2) & Sparkline (Card 3)
    const chartPoints = useMemo(() => {
        const raw = Array.isArray(growthData) && growthData.length > 0
            ? growthData
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, val: 0, rev: 0 }));
        const maxVal = Math.max(1, ...raw.map((d) => Number(d.val || 0) + Number(d.rev || 0)));
        return raw.slice(-7).map((d) => {
            const visits = Number(d.val || 0);
            const tasks = Number(d.rev || 0);
            const combined = visits + tasks;
            return {
                day: d.day,
                visits,
                tasks,
                combined,
                barPct: combined > 0 ? Math.max(20, Math.round((combined / maxVal) * 100)) : 14,
                yRatio: combined > 0 ? combined / maxVal : 0.08,
            };
        });
    }, [growthData]);

    // SVG polyline coordinates for Card 3 sparkline
    const sparklineCoords = useMemo(() => {
        const w = 220;
        const h = 68;
        const padX = 12;
        const padY = 10;
        const n = Math.max(2, chartPoints.length);
        return chartPoints.map((pt, i) => {
            const x = padX + ((w - padX * 2) * i) / (n - 1);
            const y = h - padY - pt.yRatio * (h - padY * 2);
            return { x: Math.round(x), y: Math.round(y), val: pt.visits, day: pt.day };
        });
    }, [chartPoints]);

    const sparklinePath = sparklineCoords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const kpi0 = resolvedKpis[0] || { label: 'Assigned Tasks', value: '0 Tasks', trend: 'Today', href: '/admin/tasks' };
    const kpi1 = resolvedKpis[1] || { label: 'Attendance', value: '0 Present', trend: '0 Staff', href: '/admin/employees' };
    const kpi2 = resolvedKpis[2] || { label: 'Site Visits', value: '0 Visits', trend: '0 this week', href: '/admin/visits' };
    const kpi3 = resolvedKpis[3] || { label: 'Field Reports', value: '0 Reports', trend: 'Ready', href: '/admin/visits' };

    return (
        <section className="hp-animate-in mb-8 space-y-4">
            {/* Section Title */}
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-hp-primary">
                    {t(currentIndustry?.badge || 'Operations')}
                </p>
                <h2 className="hp-section-title mt-0.5">
                    {t(currentIndustry?.shortName || 'Field')} {t('Operations')}
                </h2>
                <p className="text-xs sm:text-sm text-hp-muted mt-0.5">
                    {t(currentIndustry?.tagline || '')}
                </p>
            </div>

            {/* ══════════ 4 VISUAL KPI BENTO CARDS ══════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* CARD 1: PHOTO-BACKED CARD */}
                <article
                    onClick={() => router.visit(kpi0.href || '/admin/tasks')}
                    className="relative rounded-[24px] bg-white border border-hp-border shadow-[var(--shadow-hp)] hover:border-hp-primary/60 transition-all overflow-hidden flex flex-col justify-between min-h-[218px] cursor-pointer group"
                >
                    <div className="relative z-10 p-5 pb-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-hp-muted">{t(kpi0.label)}</span>
                            <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-4 h-4" />
                            </span>
                        </div>
                        <p className="text-2xl font-extrabold text-hp-dark mt-2 tracking-tight">
                            {effectiveIsTenant ? kpi0.value : t(kpi0.value)}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-bold text-hp-primary mt-1">
                            <ArrowUp className="w-3.5 h-3.5" />
                            <span>{kpi0.trend}</span>
                        </div>
                    </div>

                    {/* Indian Workspace Photo fading softly at the bottom of Card 1 */}
                    <div className="relative h-24 w-full mt-auto overflow-hidden">
                        <img
                            src={cardPhoto}
                            alt={currentIndustry?.shortName || 'Indian field workspace'}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.72) 28%, rgba(255,255,255,0.08) 78%, rgba(255,255,255,0) 100%)',
                            }}
                        />
                    </div>
                </article>

                {/* CARD 2: MINI ROUNDED BAR CHART CARD */}
                <article
                    onClick={() => router.visit(kpi1.href || '/admin/employees')}
                    className="rounded-[24px] bg-white border border-hp-border shadow-[var(--shadow-hp)] hover:border-hp-primary/60 transition-all p-5 flex flex-col justify-between min-h-[218px] cursor-pointer"
                >
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-hp-muted">{t(kpi1.label)}</span>
                            <span className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0">
                                <Calendar className="w-4 h-4" />
                            </span>
                        </div>
                        <p className="text-2xl font-extrabold text-hp-dark mt-2 tracking-tight">
                            {effectiveIsTenant ? kpi1.value : t(kpi1.value)}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 mt-1">
                            <ArrowUp className="w-3.5 h-3.5" />
                            <span>{kpi1.trend}</span>
                        </div>
                    </div>

                    {/* Mini 7-day rounded bars */}
                    <div className="grid grid-cols-7 gap-2 items-end h-20 pt-3">
                        {chartPoints.map((pt, i) => (
                            <div key={pt.day + i} className="flex flex-col items-center justify-end h-full">
                                <div className="w-full flex-1 flex items-end justify-center">
                                    <div
                                        className="w-2.5 rounded-full transition-all duration-500"
                                        style={{
                                            height: `${pt.barPct}%`,
                                            backgroundColor: pt.combined > 0
                                                ? 'var(--color-hp-primary)'
                                                : 'rgba(var(--hp-accent-rgb, 15, 118, 110), 0.16)',
                                            opacity: pt.combined > 0 ? (i % 2 === 0 ? 0.92 : 0.6) : 1,
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] font-semibold text-hp-muted mt-1.5">{t(pt.day)}</span>
                            </div>
                        ))}
                    </div>
                </article>

                {/* CARD 3: MINI SVG SPARKLINE WITH NODES */}
                <article
                    onClick={() => router.visit(kpi2.href || '/admin/visits')}
                    className="rounded-[24px] bg-white border border-hp-border shadow-[var(--shadow-hp)] hover:border-hp-primary/60 transition-all p-5 flex flex-col justify-between min-h-[218px] cursor-pointer overflow-hidden"
                >
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-hp-muted">{t(kpi2.label)}</span>
                            <span className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4" />
                            </span>
                        </div>
                        <p className="text-2xl font-extrabold text-hp-dark mt-2 tracking-tight">
                            {effectiveIsTenant ? kpi2.value : t(kpi2.value)}
                        </p>
                        <div className="flex items-center gap-1 text-xs font-bold text-teal-600 mt-1">
                            <ArrowDown className="w-3.5 h-3.5 rotate-180" />
                            <span>{kpi2.trend}</span>
                        </div>
                    </div>

                    {/* Smooth Sparkline Curve + Hollow Nodes */}
                    <div className="mt-2 -mx-2">
                        <svg viewBox="0 0 220 68" className="w-full h-[74px]" fill="none" aria-hidden="true">
                            <path
                                d={sparklinePath}
                                stroke="var(--color-hp-primary)"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {sparklineCoords.map((p, idx) => (
                                <circle
                                    key={idx}
                                    cx={p.x}
                                    cy={p.y}
                                    r="3.6"
                                    fill="#ffffff"
                                    stroke="var(--color-hp-primary)"
                                    strokeWidth="2.2"
                                />
                            ))}
                        </svg>
                    </div>
                </article>

                {/* CARD 4: QUICK CHANNEL TILES + DARK PILL CTA */}
                <article className="rounded-[24px] bg-white border border-hp-border shadow-[var(--shadow-hp)] p-5 flex flex-col justify-between min-h-[218px]">
                    <div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-hp-muted truncate">{t(kpi3.label)}</span>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                                    <FileCheck2 className="w-3.5 h-3.5" />
                                </span>
                                <button
                                    type="button"
                                    onClick={() => router.visit(kpi3.href || '/admin/visits')}
                                    className="w-7 h-7 rounded-full bg-hp-gray-100 hover:bg-hp-dark hover:text-white text-hp-dark flex items-center justify-center transition-colors cursor-pointer"
                                    title={t('Open')}
                                >
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <p className="text-2xl font-extrabold text-hp-dark tracking-tight">
                                {effectiveIsTenant ? kpi3.value : t(kpi3.value)}
                            </p>
                            <span className="px-2.5 py-0.5 rounded-full bg-hp-gray-100 text-[11px] font-bold text-hp-muted">
                                {kpi3.trend}
                            </span>
                        </div>
                    </div>

                    {/* 3 Compact Vertical Channel Tiles + Dark Pill CTA */}
                    <div className="flex items-end gap-2 mt-3">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/employees')}
                            className="flex-1 rounded-2xl bg-hp-gray-50 hover:bg-hp-gray-100 border border-hp-border p-2.5 text-left transition-colors cursor-pointer"
                        >
                            <div className="text-sm font-extrabold text-hp-dark tabular-nums">{stats?.totalEmployees ?? 0}</div>
                            <div className="text-[10px] font-bold text-hp-muted truncate mt-2">{t('Staff')}</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/farmers')}
                            className="flex-1 rounded-2xl p-2.5 text-left text-white shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
                            style={{ backgroundColor: 'var(--color-hp-primary)' }}
                        >
                            <div className="text-sm font-extrabold tabular-nums">{stats?.totalFarmers ?? 0}</div>
                            <div className="text-[10px] font-bold text-white/90 truncate mt-2">{t('Sites')}</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/tasks')}
                            className="flex-1 rounded-2xl bg-hp-gray-50 hover:bg-hp-gray-100 border border-hp-border p-2.5 text-left transition-colors cursor-pointer"
                        >
                            <div className="text-sm font-extrabold text-hp-dark tabular-nums">{stats?.activeWorkOrders ?? 0}</div>
                            <div className="text-[10px] font-bold text-hp-muted truncate mt-2">{t('Tasks')}</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/employees/create')}
                            className="px-3.5 h-9 rounded-full bg-[#14172B] hover:bg-slate-800 text-white text-[11px] font-extrabold whitespace-nowrap shrink-0 shadow-md cursor-pointer transition-colors"
                        >
                            {t('Add Staff')}
                        </button>
                    </div>
                </article>
            </div>
        </section>
    );
}
