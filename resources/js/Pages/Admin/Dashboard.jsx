import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from './AdminLayout';
import { router, usePage } from '@inertiajs/react';
import {
    MapPin, FileCheck2, CheckCircle2, Maximize, Minimize, Briefcase, ArrowRight, ArrowUp,
    FileText, AlertCircle, Building2, Sparkles, ClipboardList, UserPlus, ShieldAlert,
    Wallet, ChevronRight, Activity, Search, Filter, Clock, TrendingUp, Lightbulb, X, Layers
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';
import { getIndustryById } from '../../data/industriesConfig';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const markerIcon = L.divIcon({
    className: 'custom-icon',
    html: `
        <div style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="white"/><circle cx="12" cy="12" r="7.5" fill="#F26A10"/><circle cx="12" cy="12" r="3" fill="white"/></svg>
        </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

const GROWTH = [
    { day: 'Mon', val: 30, rev: 120 },
    { day: 'Tue', val: 50, rev: 250 },
    { day: 'Wed', val: 45, rev: 200 },
    { day: 'Thu', val: 85, rev: 400 },
    { day: 'Fri', val: 65, rev: 300 },
    { day: 'Sat', val: 95, rev: 450 },
    { day: 'Sun', val: 70, rev: 350 },
];

const greetingFor = (h) => (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');

export default function Dashboard({ currentIndustry: initialIndustry, locationLogs = [], stats = {}, recentVisits = [], recentFarmers = [], pendingApprovals = [], agriStats = {}, growthData = [], telemetry = [] }) {
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [showTip, setShowTip] = useState(true);
    const [activeAiTab, setActiveAiTab] = useState('dispatch');
    const { t } = useTranslation();
    const { props, url } = usePage();
    const firstName = (props.auth?.user?.name || 'Admin').split(' ')[0];

    // Determine current industry from prop, query parameter or page props
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const industryKey = initialIndustry || props.currentIndustry || urlParams?.get('industry') || 'real_estate';
    const currentIndustry = getIndustryById(industryKey);
    const labels = currentIndustry.adminLabels;
    const IndIcon = currentIndustry.icon || Building2;

    const [liveLocationLogs, setLiveLocationLogs] = useState(locationLogs);
    
    useEffect(() => {
        setLiveLocationLogs(locationLogs);
    }, [locationLogs]);

    // WebSocket real-time update instead of full page polling
    useEffect(() => {
        if (window.Echo) {
            window.Echo.channel('live-tracking')
                .listen('LocationUpdated', (e) => {
                    setLiveLocationLogs(prev => {
                        const newLogs = [...prev];
                        const index = newLogs.findIndex(log => log.employee?.id === e.employeeId || log.employee_id === e.employeeId);
                        
                        const newLog = {
                            id: Date.now(),
                            latitude: e.latitude,
                            longitude: e.longitude,
                            employee_id: e.employeeId,
                            employee: prev[index]?.employee || { id: e.employeeId, name: 'Officer' }
                        };

                        if (index !== -1) {
                            newLogs[index] = newLog;
                        } else {
                            newLogs.push(newLog);
                        }
                        return newLogs;
                    });
                });
        }
        
        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('live-tracking');
            }
        };
    }, []);

    const askAssistant = (text) => {
        const q = (text ?? prompt).trim();
        if (!q) return;
        window.dispatchEvent(new CustomEvent('fieldy:ask', { detail: { text: q } }));
        setPrompt('');
    };

    const quickActions = [
        { label: t(labels.todayTasksTitle || 'New Task'), icon: ClipboardList, href: '/admin/tasks' },
        { label: t(labels.addEntityAction || 'Add Property'), icon: IndIcon, href: '/admin/farmers/register' },
        { label: t(`Add ${labels.navAgents || 'Agent'}`), icon: UserPlus, href: '/admin/employees/create' },
        { label: t('Live Map'), icon: ShieldAlert, href: '/admin/monitor' },
        { label: t('Payments'), icon: Wallet, href: '/admin/payments' },
    ];

    const services = [
        {
            title: t(labels.entityTitle),
            sub: t(labels.entitySub),
            value: stats?.totalFarmers ?? 0,
            icon: IndIcon,
            chip: { cls: 'hp-chip-info', label: t(labels.entityListedChip) },
            href: '/admin/farmers',
        },
        {
            title: t(labels.agentDutyTitle),
            sub: t(labels.agentDutySub),
            value: stats?.activeEmployees ?? 0,
            icon: Briefcase,
            chip: { cls: 'hp-chip-success hp-chip-dot', label: t('Online') },
            href: '/admin/monitor',
        },
        {
            title: t(labels.todayTasksTitle),
            sub: t(labels.todayTasksSub),
            value: stats?.activeWorkOrders ?? 8,
            icon: FileText,
            chip: { cls: 'hp-chip-primary', label: `${stats?.slaCompliance || '96.4%'}` },
            href: '/admin/tasks',
        },
        {
            title: t(labels.completedTasksTitle),
            sub: t(labels.completedTasksSub),
            value: stats?.totalVisits ?? 0,
            icon: FileCheck2,
            chip: { cls: 'hp-chip-gray', label: `${stats?.weeklyVisits ?? 0} ${t('this week')}` },
            href: '/admin/visits',
        },
    ];

    const todos = [
        ...(pendingApprovals.length > 0 ? [{
            icon: AlertCircle,
            tone: 'warning',
            title: `${pendingApprovals.length} ${t(labels.todosApprovalTitle)}`,
            sub: t(labels.todosApprovalSub),
            cta: t('Review'),
            href: '/admin/pending-farmers',
        }] : []),
        {
            icon: ClipboardList,
            tone: 'primary',
            title: t(labels.todosAssignTitle),
            sub: t(labels.todosAssignSub),
            cta: t('Assign'),
            href: '/admin/tasks',
        },
        {
            icon: Activity,
            tone: 'info',
            title: `${t('Checked In Today')}: ${stats?.todayAttendance ?? 0}`,
            sub: t('View agent locations and arrivals on map'),
            cta: t('View Map'),
            href: '/admin/monitor',
        },
    ];

    const toneTile = {
        warning: 'bg-hp-warning-light text-hp-warning',
        primary: 'bg-hp-primary-light text-hp-primary',
        info: 'bg-hp-info-light text-hp-info',
        success: 'bg-hp-success-light text-hp-success',
    };

    const combinedLogs = [
        ...recentVisits.map(v => ({ time: v.time, user: v.employee, event: `${t('Finished visit at')} ${v.farmer}`, type: 'success', icon: CheckCircle2 })),
        ...liveLocationLogs.slice(0, 5).map(l => ({ time: 'Just now', user: l.employee?.name || 'Agent', event: t('Arrived at field site'), type: 'info', icon: MapPin }))
    ].slice(0, 6);

    const mapContent = (
        <div className={`bg-white overflow-hidden ${isMapFullscreen ? 'fixed inset-0 z-[99999] w-screen h-screen' : 'relative w-full h-full'}`}>
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMapFullscreen(!isMapFullscreen);
                }}
                className="absolute top-3 right-3 z-[500] hp-icon-btn !bg-white border border-hp-border shadow-[var(--shadow-hp-md)]"
                title={isMapFullscreen ? t('Exit fullscreen', 'Exit fullscreen') : t('Fullscreen', 'Fullscreen')}
            >
                {isMapFullscreen ? <Minimize className="w-[18px] h-[18px]" /> : <Maximize className="w-[18px] h-[18px]" />}
            </button>
            <MapContainer
                center={liveLocationLogs.length > 0 ? [parseFloat(liveLocationLogs[0].latitude), parseFloat(liveLocationLogs[0].longitude)] : [12.9716, 77.5946]}
                zoom={10}
                style={{ width: '100%', height: '100%', zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; Google Maps'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                />
                {liveLocationLogs.map((log) => (
                    <Marker
                        key={log.id}
                        position={[parseFloat(log.latitude), parseFloat(log.longitude)]}
                        icon={markerIcon}
                    />
                ))}
            </MapContainer>
        </div>
    );

    return (
        <AdminLayout currentIndustry={currentIndustry}>

            {/* ══════════ HOME HERO — AI-first, hPanel style ══════════ */}
            <section className="hp-animate-in pt-2 lg:pt-6 pb-8">
                <div className="max-w-[760px] mx-auto text-center">
                    <p className="text-sm font-semibold text-hp-muted mb-2">{t(greetingFor(new Date().getHours()))}, {firstName} 👋</p>
                    <h1 className="text-[26px] sm:text-[32px] leading-tight font-bold tracking-tight text-hp-dark">
                        {t('What would you like to')} <span className="hp-gradient-text">{t('do today?')}</span>
                    </h1>

                    <form
                        onSubmit={(e) => { e.preventDefault(); askAssistant(); }}
                        className="mt-6 bg-white border border-hp-border-strong rounded-2xl shadow-[var(--shadow-hp-md)] focus-within:border-hp-primary focus-within:shadow-[0_0_0_4px_rgba(242,106,16,.12),var(--shadow-hp-md)] transition-all text-left"
                    >
                        <div className="flex items-start gap-3 px-4 pt-3.5">
                            <Sparkles className="w-5 h-5 text-hp-primary mt-0.5 flex-shrink-0" />
                            <textarea
                                id="home-ai-prompt"
                                rows={2}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAssistant(); } }}
                                placeholder={t(labels.searchPlaceholder)}
                                className="flex-1 resize-none bg-transparent text-[14px] text-hp-dark placeholder:text-hp-muted focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center justify-between px-4 pb-3 pt-1">
                            <span className="text-xs text-hp-muted">{t('Press Enter to search')}</span>
                            <button
                                type="submit"
                                disabled={!prompt.trim()}
                                className="w-8 h-8 rounded-full bg-hp-primary text-white flex items-center justify-center hover:bg-hp-primary-hover disabled:bg-hp-hover disabled:text-hp-muted transition-colors"
                                aria-label="Send"
                            >
                                <ArrowUp className="w-4 h-4" strokeWidth={2.4} />
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        {quickActions.map((a, idx) => (
                            <button key={idx} type="button" onClick={() => router.visit(a.href)} className="hp-pill text-xs">
                                <a.icon className="w-3.5 h-3.5" /> {a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ PROMO / TIP BANNER ══════════ */}
            {showTip && (
                <div className="hp-animate-in relative overflow-hidden rounded-xl mb-6 bg-hp-dark text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-hp-primary flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-4 h-4 text-white" />
                        </span>
                        <div>
                            <p className="font-bold text-sm">{t(labels.bannerTitle)}</p>
                            <p className="text-xs text-white/70">{t(labels.bannerSub)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button type="button" onClick={() => router.visit('/admin/monitor')} className="hp-btn hp-btn-sm hp-btn-primary !h-8 text-xs">
                            {t('Open Map')}
                        </button>
                        <button type="button" onClick={() => setShowTip(false)} className="w-8 h-8 rounded-md flex items-center justify-center text-white/60 hover:text-white" aria-label="Dismiss">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════ YOUR BUSINESS OVERVIEW ══════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <section className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="hp-section-title">{t('Overview')}</h2>
                        <button type="button" onClick={() => router.visit('/admin/visits')} className="hp-btn hp-btn-sm hp-btn-text">
                            {t('All visits')} <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="hp-card overflow-hidden">
                        {services.map((s, idx) => (
                            <div key={idx} className="hp-row cursor-pointer group" onClick={() => router.visit(s.href)}>
                                <span className="hp-icon-tile"><s.icon className="w-5 h-5" /></span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-[15px] font-bold text-hp-dark">{s.title}</p>
                                        <span className={`hp-chip ${s.chip.cls}`}>{s.chip.label}</span>
                                    </div>
                                    <p className="text-sm text-hp-muted mt-0.5 truncate">{s.sub}</p>
                                </div>
                                <p className="text-2xl font-bold text-hp-dark tabular-nums mr-2 hidden sm:block">{s.value}</p>
                                <button type="button" onClick={(e) => { e.stopPropagation(); router.visit(s.href); }} className="hp-btn hp-btn-sm hp-btn-outline">
                                    {t('Open')}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* To-dos */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="hp-section-title">{t('To-dos', 'To-dos')}</h2>
                        <span className="hp-chip hp-chip-primary">{todos.length}</span>
                    </div>
                    <div className="hp-card overflow-hidden">
                        {todos.map((todo, i) => (
                            <div key={i} className="flex items-start gap-3 p-4 border-t border-hp-border first:border-t-0">
                                <span className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${toneTile[todo.tone]}`}>
                                    <todo.icon className="w-[18px] h-[18px]" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-hp-dark">{todo.title}</p>
                                    <p className="text-xs text-hp-muted mt-0.5">{todo.sub}</p>
                                </div>
                                <button type="button" onClick={() => router.visit(todo.href)} className="hp-btn hp-btn-sm hp-btn-secondary">{todo.cta}</button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ══════════ FIELD OPERATIONS: MAP + LIVE LOGS ══════════ */}
            <div className={`grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8 ${isMapFullscreen ? '' : ''}`}>
                <section className="xl:col-span-2 hp-card overflow-hidden flex flex-col">
                    <div className="hp-card-header">
                        <div>
                            <h2 className="hp-card-title">{t(labels.agentDutyTitle || 'Agent Live Locations')}</h2>
                            <p className="text-xs text-hp-muted">{liveLocationLogs.length} {t('personnel online on map')}</p>
                        </div>
                        <span className="hp-chip hp-chip-success hp-chip-dot">{t('Live')}</span>
                    </div>
                    <div className="h-[420px] relative">
                        {isMapFullscreen ? createPortal(mapContent, document.body) : mapContent}
                    </div>
                </section>

                <section className="hp-card flex flex-col max-h-[502px]">
                    <div className="hp-card-header">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hp-primary opacity-60"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-hp-primary"></span>
                            </span>
                            <h2 className="hp-card-title">{t('Recent Activity')}</h2>
                        </div>
                        <button type="button" onClick={() => router.visit('/admin/monitor')} className="hp-btn hp-btn-sm hp-btn-text">{t('View All')}</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {combinedLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-14 px-6">
                                <span className="hp-icon-tile !w-12 !h-12 mb-3"><Clock className="w-6 h-6" /></span>
                                <p className="text-sm font-bold text-hp-dark">{t('No recent activity')}</p>
                                <p className="text-xs text-hp-muted mt-1">{t('Check-ins will show up here.')}</p>
                            </div>
                        ) : combinedLogs.map((log, i) => (
                            <div key={i} className="flex items-start gap-3 px-5 py-3.5 border-t border-hp-border first:border-t-0 hover:bg-[#FCFBFA] transition-colors">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.type === 'success' ? toneTile.success : toneTile.info}`}>
                                    <log.icon className="w-4 h-4" />
                                </span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center gap-2">
                                        <p className="text-sm font-bold text-hp-dark truncate">{log.user}</p>
                                        <span className="text-xs text-hp-muted flex-shrink-0">{log.time}</span>
                                    </div>
                                    <p className="text-xs text-hp-muted mt-0.5 truncate">{log.event}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* ══════════ PERFORMANCE CHART ══════════ */}
            <section className="hp-card mb-8">
                <div className="hp-card-header flex-wrap">
                    <div>
                        <h2 className="hp-card-title">{t(labels.chartTitle)}</h2>
                        <p className="text-xs text-hp-muted">{t(labels.chartSub)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-xs text-hp-gray"><span className="w-2.5 h-2.5 rounded-sm bg-hp-primary"></span>{t(labels.chartMetric1)}</span>
                        <span className="flex items-center gap-1.5 text-xs text-hp-gray"><span className="w-2.5 h-2.5 rounded-sm bg-hp-dark"></span>{t(labels.chartMetric2)}</span>
                        <span className="hp-chip hp-chip-success"><TrendingUp className="w-3.5 h-3.5" /> +18%</span>
                    </div>
                </div>
                <div className="hp-card-body">
                    <div className="relative h-52">
                        {[0, 25, 50, 75, 100].map(g => (
                            <div key={g} className="absolute left-0 right-0 border-t border-dashed border-hp-border" style={{ bottom: `${g}%` }} />
                        ))}
                        <div className="relative h-full flex justify-between items-end px-2 sm:px-8">
                            {((growthData && growthData.length > 0) ? growthData : GROWTH).map((item) => (
                                <div key={item.day} className="flex flex-col items-center h-full group">
                                    <div className="flex-1 flex items-end gap-1.5 relative">
                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-hp-dark text-white text-[11px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            {item.val} {labels.chartMetric1} · {item.rev} {labels.chartMetric2}
                                        </div>
                                        <div className="w-3.5 sm:w-5 rounded-t-md bg-hp-primary group-hover:bg-hp-primary-hover transition-all duration-300" style={{ height: `${item.val}%` }} />
                                        <div className="w-3.5 sm:w-5 rounded-t-md bg-hp-dark/85 group-hover:bg-hp-dark transition-all duration-300" style={{ height: `${(item.rev / 500) * 100}%` }} />
                                    </div>
                                    <span className="text-xs font-semibold text-hp-muted mt-3">{item.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════ RECENT LOGS & VISITS ══════════ */}
            <section className="hp-card overflow-hidden mb-8">
                <div className="hp-card-header flex-wrap">
                    <h2 className="hp-card-title">{t(labels.recentVisitsTitle)}</h2>
                    <button type="button" onClick={() => router.visit('/admin/visits')} className="hp-btn hp-btn-sm hp-btn-text">
                        {t('View All')} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="hp-table min-w-[560px]">
                        <thead>
                            <tr>
                                <th>{t('Record & Assignee')}</th>
                                <th>{t('ID')}</th>
                                <th>{t('Date')}</th>
                                <th>{t('Status')}</th>
                                <th className="text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentVisits.length > 0 ? recentVisits.map((visit, i) => (
                                <tr key={i} className="cursor-pointer" onClick={() => visit.id && router.visit(`/admin/visits/${visit.id}`)}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <span className="hp-icon-tile !w-9 !h-9"><FileText className="w-4 h-4" /></span>
                                            <div>
                                                <span className="font-bold block text-sm">{visit.farmer}</span>
                                                <span className="text-xs text-hp-muted">Assignee: {visit.employee}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="!text-hp-muted font-mono text-xs">LOG-{String(visit.id).padStart(4, '0')}</td>
                                    <td className="!text-hp-muted text-xs">{visit.date}</td>
                                    <td><span className="hp-chip hp-chip-success hp-chip-dot">{t('Completed')}</span></td>
                                    <td className="text-right"><ChevronRight className="w-4 h-4 text-hp-muted inline" /></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="!py-12 text-center !text-hp-muted">{t('No activity records found yet.')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ══════════ ENTITIES & PENDING APPROVALS ══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="hp-card overflow-hidden">
                    <div className="hp-card-header">
                        <h2 className="hp-card-title">{t(labels.recentEntityTitle)}</h2>
                        <button type="button" onClick={() => router.visit('/admin/farmers')} className="hp-btn hp-btn-sm hp-btn-text">
                            {t('View All')} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                    {recentFarmers.length > 0 ? recentFarmers.map((farmer, i) => (
                        <div key={i} onClick={() => router.visit(`/admin/farmers/${farmer.id}`)} className="hp-row cursor-pointer">
                            <img
                                src={farmer.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=FFF1E6&color=D95A07&bold=true`}
                                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=FFF1E6&color=D95A07&bold=true`; }}
                                alt={farmer.name}
                                className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-hp-dark truncate">{farmer.name}</p>
                                <p className="text-xs text-hp-muted font-mono">{farmer.farmer_code}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-semibold text-hp-dark">{farmer.crop && farmer.crop !== 'Vetiver' ? farmer.crop : currentIndustry.badge}</p>
                                <p className="text-xs text-hp-muted">{farmer.acres || '1'} {t('Units')}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-hp-muted text-sm py-12">{t('No entities onboarded yet.')}</div>
                    )}
                </section>

                <section className="hp-card overflow-hidden">
                    <div className="hp-card-header">
                        <h2 className="hp-card-title">{t(labels.pendingTitle)}</h2>
                        <span className="hp-chip hp-chip-warning">{pendingApprovals.length} {t('Pending')}</span>
                    </div>
                    {pendingApprovals.length > 0 ? pendingApprovals.map((approval, i) => (
                        <div key={i} className="hp-row">
                            <span className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-hp-warning-light text-hp-warning">
                                <AlertCircle className="w-4 h-4" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-hp-dark truncate">{approval.name}</p>
                                <p className="text-xs text-hp-muted">{approval.farmer_code} · {approval.district}</p>
                            </div>
                            <button type="button" onClick={() => router.visit(`/admin/pending-farmers`)} className="hp-btn hp-btn-sm hp-btn-primary">
                                {t('Review')}
                            </button>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center text-center py-12 px-6">
                            <span className="w-10 h-10 rounded-full bg-hp-success-light text-hp-success flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-5 h-5" />
                            </span>
                            <p className="text-sm font-bold text-hp-dark">{t('All caught up! No pending items.')}</p>
                        </div>
                    )}
                </section>
            </div>

            {/* ══════════ INDUSTRY AI ASSISTANT BANNER ══════════ */}
            <div className="hp-card-gradient-dark-violet rounded-2xl p-5 sm:p-7 shadow-lg border border-indigo-500/20 text-white mt-8 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs">
                                <Sparkles className="w-3 h-3 text-amber-400" /> {currentIndustry.shortName} AI Assistant
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                            {t(labels.aiHelpTitle)}
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-300 mt-1">
                            {t(labels.aiHelpSub)}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => askAssistant(`Show ${currentIndustry.shortName} today summary`)}
                        className="hp-btn hp-btn-primary !rounded-full !h-10 px-5 font-bold text-xs shrink-0 self-start sm:self-auto"
                    >
                        <Sparkles className="w-4 h-4 mr-1.5" />
                        <span>{t('Ask Assistant')}</span>
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                    <button
                        type="button"
                        onClick={() => askAssistant(`Which ${labels.navAgents || 'agents'} are on duty today?`)}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-zinc-200 transition-colors"
                    >
                        {labels.agentDutyTitle || t('Who is on duty?')}
                    </button>
                    <button
                        type="button"
                        onClick={() => askAssistant('Any pending approvals or checklists?')}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-zinc-200 transition-colors"
                    >
                        {labels.pendingTitle || t('Pending approvals')}
                    </button>
                    <button
                        type="button"
                        onClick={() => askAssistant(`Today ${labels.completedTasksTitle || 'completed visits'}`)}
                        className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-zinc-200 transition-colors"
                    >
                        {labels.completedTasksTitle || t('Completed tasks today')}
                    </button>
                </div>
            </div>
            
        </AdminLayout>
    );
}
