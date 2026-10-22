import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from './AdminLayout';
import { router, usePage } from '@inertiajs/react';
import {
    MapPin, FileCheck2, CheckCircle2, Maximize, Minimize, Briefcase, ArrowRight, ArrowUp,
    FileText, AlertCircle, Building2, Sparkles, ClipboardList, UserPlus, ShieldAlert,
    Wallet, ChevronRight, Activity, Search, Filter, Clock, TrendingUp, Lightbulb, X
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

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

export default function Dashboard({ locationLogs = [], stats = {}, recentVisits = [], recentFarmers = [], pendingApprovals = [], agriStats = {} }) {
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [showTip, setShowTip] = useState(true);
    const [activeAiTab, setActiveAiTab] = useState('dispatch');
    const { t } = useTranslation();
    const { props } = usePage();
    const firstName = (props.auth?.user?.name || 'Admin').split(' ')[0];

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
                        // Find if log for this employee already exists
                        const newLogs = [...prev];
                        const index = newLogs.findIndex(log => log.employee?.id === e.employeeId || log.employee_id === e.employeeId);
                        
                        const newLog = {
                            id: Date.now(), // temporary ID
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
        { label: t('Assign a task', 'Assign a task'), icon: ClipboardList, href: '/admin/tasks' },
        { label: t('Register facility', 'Register facility'), icon: Building2, href: '/admin/farmers/register' },
        { label: t('Add employee', 'Add employee'), icon: UserPlus, href: '/admin/employees/create' },
        { label: t('Open live monitor', 'Open live monitor'), icon: ShieldAlert, href: '/admin/monitor' },
        { label: t('Review payments', 'Review payments'), icon: Wallet, href: '/admin/payments' },
    ];

    const services = [
        {
            title: t('Facilities / Clients', 'Facilities / Clients'), sub: t('Registered facilities and clients', 'Registered facilities and clients'),
            value: stats?.totalFarmers ?? 0, icon: Building2, chip: { cls: 'hp-chip-info', label: t('Clients', 'Clients') }, href: '/admin/farmers',
        },
        {
            title: t('Active Field Staff', 'Active Field Staff'), sub: t('Technicians and inspectors on duty', 'Technicians and inspectors on duty'),
            value: stats?.activeEmployees ?? 0, icon: Briefcase, chip: { cls: 'hp-chip-success hp-chip-dot', label: t('On Duty', 'On Duty') }, href: '/admin/monitor',
        },
        {
            title: t('Work Orders', 'Work Orders'), sub: t('Active dispatches and schedules', 'Active dispatches and schedules'),
            value: stats?.activeWorkOrders ?? 8, icon: FileText, chip: { cls: 'hp-chip-primary', label: `SLA ${stats?.slaCompliance || '96.4%'}` }, href: '/admin/tasks',
        },
        {
            title: t('Total Service Visits', 'Total Service Visits'), sub: t('Audits, PM inspections and records', 'Audits, PM inspections and records'),
            value: stats?.totalVisits ?? 0, icon: FileCheck2, chip: { cls: 'hp-chip-gray', label: `${stats?.weeklyVisits ?? 0} ${t('Weekly')}` }, href: '/admin/visits',
        },
    ];

    const todos = [
        ...(pendingApprovals.length > 0 ? [{
            icon: AlertCircle, tone: 'warning', title: `${pendingApprovals.length} ${t('facilities awaiting approval', 'facilities awaiting approval')}`,
            sub: t('Review and verify newly submitted facilities', 'Review and verify newly submitted facilities'), cta: t('Review'), href: '/admin/pending-farmers',
        }] : []),
        {
            icon: ClipboardList, tone: 'primary', title: t('Plan tomorrow\u2019s dispatch', 'Plan tomorrow\u2019s dispatch'),
            sub: t('Assign field staff to open work orders', 'Assign field staff to open work orders'), cta: t('Open', 'Open'), href: '/admin/tasks',
        },
        {
            icon: Activity, tone: 'info', title: `${t('Today\'s Attendance')}: ${stats?.todayAttendance ?? 0}`,
            sub: t('Check who has checked in and their live location', 'Check who has checked in and their live location'), cta: t('Monitor', 'Monitor'), href: '/admin/monitor',
        },
    ];

    const toneTile = {
        warning: 'bg-hp-warning-light text-hp-warning',
        primary: 'bg-hp-primary-light text-hp-primary',
        info: 'bg-hp-info-light text-hp-info',
        success: 'bg-hp-success-light text-hp-success',
    };

    const combinedLogs = [
        ...recentVisits.map(v => ({ time: v.time, user: v.employee, event: t('Visited') + ' ' + v.farmer, type: 'success', icon: CheckCircle2 })),
        ...liveLocationLogs.slice(0, 5).map(l => ({ time: 'Just now', user: l.employee?.name || 'Officer', event: t('Location Pinged'), type: 'info', icon: MapPin }))
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
        <AdminLayout>

            {/* ══════════ HOME HERO — AI-first, hPanel style ══════════ */}
            <section className="hp-animate-in pt-2 lg:pt-6 pb-10">
                <div className="max-w-[760px] mx-auto text-center">
                    <p className="text-sm font-semibold text-hp-muted mb-2">{t(greetingFor(new Date().getHours()), greetingFor(new Date().getHours()))}, {firstName} 👋</p>
                    <h1 className="text-[28px] sm:text-[34px] leading-tight font-bold tracking-tight text-hp-dark">
                        {t('What would you like to', 'What would you like to')} <span className="hp-gradient-text">{t('get done today?', 'get done today?')}</span>
                    </h1>

                    <form
                        onSubmit={(e) => { e.preventDefault(); askAssistant(); }}
                        className="mt-7 bg-white border border-hp-border-strong rounded-2xl shadow-[var(--shadow-hp-md)] focus-within:border-hp-primary focus-within:shadow-[0_0_0_4px_rgba(242,106,16,.12),var(--shadow-hp-md)] transition-all text-left"
                    >
                        <div className="flex items-start gap-3 px-4 pt-4">
                            <Sparkles className="w-5 h-5 text-hp-primary mt-0.5 flex-shrink-0" />
                            <textarea
                                id="home-ai-prompt"
                                rows={2}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askAssistant(); } }}
                                placeholder={t('Ask Fieldy AI about tasks, staff, facilities or alerts…', 'Ask Fieldy AI about tasks, staff, facilities or alerts…')}
                                className="flex-1 resize-none bg-transparent text-[15px] text-hp-dark placeholder:text-hp-muted focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center justify-between px-4 pb-3 pt-1">
                            <span className="text-xs text-hp-muted">{t('Press Enter to send', 'Press Enter to send')}</span>
                            <button
                                type="submit"
                                disabled={!prompt.trim()}
                                className="w-9 h-9 rounded-full bg-hp-primary text-white flex items-center justify-center hover:bg-hp-primary-hover disabled:bg-hp-hover disabled:text-hp-muted transition-colors"
                                aria-label="Send"
                            >
                                <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.4} />
                            </button>
                        </div>
                    </form>

                    <div className="flex flex-wrap justify-center gap-2 mt-5">
                        {quickActions.map((a) => (
                            <button key={a.href} type="button" onClick={() => router.visit(a.href)} className="hp-pill">
                                <a.icon className="w-4 h-4" /> {a.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════ PROMO / TIP BANNER ══════════ */}
            {showTip && (
                <div className="hp-animate-in relative overflow-hidden rounded-xl mb-8 bg-hp-dark text-white">
                    <div className="absolute -right-10 -top-16 w-64 h-64 rounded-full bg-hp-primary/30 blur-3xl pointer-events-none" />
                    <div className="absolute right-40 -bottom-20 w-48 h-48 rounded-full bg-[#F7931E]/20 blur-3xl pointer-events-none" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 p-5 sm:p-6">
                        <span className="w-11 h-11 rounded-lg bg-hp-primary flex items-center justify-center flex-shrink-0">
                            <Lightbulb className="w-5 h-5 text-white" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-[15px]">{t('Track every technician in real time', 'Track every technician in real time')}</p>
                            <p className="text-sm text-white/70 mt-0.5">{t('Live Monitor shows GPS pings, geofence breaches and SOS alerts as they happen.', 'Live Monitor shows GPS pings, geofence breaches and SOS alerts as they happen.')}</p>
                        </div>
                        <button type="button" onClick={() => router.visit('/admin/monitor')} className="hp-btn hp-btn-primary self-start sm:self-auto">
                            {t('Open Live Monitor', 'Open Live Monitor')}
                        </button>
                        <button type="button" onClick={() => setShowTip(false)} className="absolute top-2 right-2 sm:static w-8 h-8 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10" aria-label="Dismiss">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════ YOUR BUSINESS ══════════ */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <section className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="hp-section-title">{t('Your business', 'Your business')}</h2>
                        <button type="button" onClick={() => router.visit('/admin/visits')} className="hp-btn hp-btn-sm hp-btn-text">
                            {t('View analytics', 'View analytics')} <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="hp-card overflow-hidden">
                        {services.map((s) => (
                            <div key={s.href} className="hp-row cursor-pointer group" onClick={() => router.visit(s.href)}>
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
                                    {t('Manage', 'Manage')}
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
                            <h2 className="hp-card-title">{t('Field coverage', 'Field coverage')}</h2>
                            <p className="text-sm text-hp-muted">{liveLocationLogs.length} {t('staff locations reported', 'staff locations reported')}</p>
                        </div>
                        <span className="hp-chip hp-chip-success hp-chip-dot">{t('Live', 'Live')}</span>
                    </div>
                    <div className="h-[420px] relative">
                        {isMapFullscreen ? createPortal(mapContent, document.body) : mapContent}
                    </div>
                </section>

                <section className="hp-card flex flex-col max-h-[502px]">
                    <div className="hp-card-header">
                        <div className="flex items-center gap-2.5">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-hp-primary opacity-60"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-hp-primary"></span>
                            </span>
                            <h2 className="hp-card-title">{t('Live Logs')}</h2>
                        </div>
                        <button type="button" onClick={() => router.visit('/admin/monitor')} className="hp-btn hp-btn-sm hp-btn-text">{t('View All')}</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {combinedLogs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center py-14 px-6">
                                <span className="hp-icon-tile !w-12 !h-12 mb-3"><Clock className="w-6 h-6" /></span>
                                <p className="text-sm font-bold text-hp-dark">{t('No live logs currently available.')}</p>
                                <p className="text-xs text-hp-muted mt-1">{t('Activity will appear here as staff check in.', 'Activity will appear here as staff check in.')}</p>
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

            {/* ══════════ PERFORMANCE ══════════ */}
            <section className="hp-card mb-8">
                <div className="hp-card-header flex-wrap">
                    <div>
                        <h2 className="hp-card-title">{t('Growth Trajectory', 'Growth Trajectory')}</h2>
                        <p className="text-sm text-hp-muted">{t('Facility onboarding & revenue (this week)', 'Facility onboarding & revenue (this week)')}</p>
                    </div>
                    <div className="flex items-center gap-5">
                        <span className="flex items-center gap-2 text-sm text-hp-gray"><span className="w-2.5 h-2.5 rounded-sm bg-hp-primary"></span>{t('New facilities', 'New facilities')}</span>
                        <span className="flex items-center gap-2 text-sm text-hp-gray"><span className="w-2.5 h-2.5 rounded-sm bg-hp-dark"></span>{t('Revenue', 'Revenue')}</span>
                        <span className="hp-chip hp-chip-success"><TrendingUp className="w-3.5 h-3.5" /> +18%</span>
                    </div>
                </div>
                <div className="hp-card-body">
                    <div className="relative h-56">
                        {[0, 25, 50, 75, 100].map(g => (
                            <div key={g} className="absolute left-0 right-0 border-t border-dashed border-hp-border" style={{ bottom: `${g}%` }} />
                        ))}
                        <div className="relative h-full flex justify-between items-end px-2 sm:px-8">
                            {GROWTH.map((item) => (
                                <div key={item.day} className="flex flex-col items-center h-full group">
                                    <div className="flex-1 flex items-end gap-1.5 relative">
                                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-hp-dark text-white text-[11px] font-bold px-2 py-1 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            {item.val} · ₹{item.rev}k
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

            {/* ══════════ RECENT ACTIVITIES ══════════ */}
            <section className="hp-card overflow-hidden mb-8">
                <div className="hp-card-header flex-wrap">
                    <h2 className="hp-card-title">{t('Recent Activities')}</h2>
                    <div className="flex items-center gap-2">
                        <div className="relative hidden sm:block">
                            <Search className="w-4 h-4 text-hp-muted absolute left-3 top-1/2 -translate-y-1/2" />
                            <input type="text" placeholder={t('Search')} className="hp-input !h-9 !w-56 !pl-9 !text-sm" />
                        </div>
                        <button type="button" className="hp-btn hp-btn-sm hp-btn-secondary !h-9">
                            <Filter className="w-4 h-4" /> {t('Filter')}
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="hp-table min-w-[560px]">
                        <thead>
                            <tr>
                                <th>{t('Activity')}</th>
                                <th>{t('Order ID')}</th>
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
                                            <span className="font-bold">{t('Farm Visit')}: {visit.farmer}</span>
                                        </div>
                                    </td>
                                    <td className="!text-hp-muted">VIS_{visit.id}</td>
                                    <td className="!text-hp-muted">{visit.date}</td>
                                    <td><span className="hp-chip hp-chip-success hp-chip-dot">{t('Completed')}</span></td>
                                    <td className="text-right"><ChevronRight className="w-4 h-4 text-hp-muted inline" /></td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="!py-12 text-center !text-hp-muted">{t('No recent activities found.')}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* ══════════ FACILITIES & APPROVALS ══════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="hp-card overflow-hidden">
                    <div className="hp-card-header">
                        <h2 className="hp-card-title">{t('Recently Onboarded Facilities')}</h2>
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
                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-hp-dark truncate">{farmer.name}</p>
                                <p className="text-xs text-hp-muted mt-0.5">{farmer.farmer_code}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-hp-dark">{farmer.crop || 'Integrated FM'}</p>
                                <p className="text-xs text-hp-muted">{farmer.acres} {t('Sq. Ft / Units')}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-hp-muted text-sm py-12">{t('No facilities onboarded yet.')}</div>
                    )}
                </section>

                <section className="hp-card overflow-hidden">
                    <div className="hp-card-header">
                        <h2 className="hp-card-title">{t('Pending Facility Approvals')}</h2>
                        <span className="hp-chip hp-chip-warning">{pendingApprovals.length} {t('Pending')}</span>
                    </div>
                    {pendingApprovals.length > 0 ? pendingApprovals.map((approval, i) => (
                        <div key={i} className="hp-row">
                            <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-hp-warning-light text-hp-warning">
                                <AlertCircle className="w-5 h-5" />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-hp-dark truncate">{approval.name}</p>
                                <p className="text-xs text-hp-muted mt-0.5">{approval.farmer_code} · {approval.district}</p>
                            </div>
                            <button type="button" onClick={() => router.visit(`/admin/pending-farmers`)} className="hp-btn hp-btn-sm hp-btn-primary">
                                {t('Review')}
                            </button>
                        </div>
                    )) : (
                        <div className="flex flex-col items-center text-center py-12 px-6">
                            <span className="w-12 h-12 rounded-full bg-hp-success-light text-hp-success flex items-center justify-center mb-3">
                                <CheckCircle2 className="w-6 h-6" />
                            </span>
                            <p className="text-sm font-bold text-hp-dark">{t('All caught up! No pending facility approvals.')}</p>
                        </div>
                    )}
                </section>
            </div>

            {/* ══════════ HOSTINGER IMAGE 4 REPLICA: AI OPERATIONS CO-PILOT ══════════ */}
            <div className="hp-card-gradient-dark-violet rounded-3xl p-6 sm:p-10 shadow-xl border border-indigo-500/20 text-white mt-10 relative overflow-hidden">
                {/* Glow orbs */}
                <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
                <div className="absolute left-1/3 -bottom-24 w-72 h-72 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

                <div className="relative space-y-8">
                    {/* Top Row: Award badge & Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-xl space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold text-xs">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    {t('Stevie® Award Winner 2026 · Field Tech AI')}
                                </span>
                            </div>
                            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
                                {t('Your Fieldy AI co-worker. Free with every plan.')}
                            </h2>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                                {t('Dispatch, fix schedules, audit photo proofs, and calculate payroll timesheets through conversational intelligence. 85% of dispatch workflows solved without manual lag.')}
                            </p>
                        </div>

                        <div className="shrink-0">
                            <button
                                type="button"
                                onClick={() => askAssistant('Show today dispatch optimization')}
                                className="hp-btn hp-btn-primary !rounded-full !h-11 px-6 font-bold text-sm shadow-md"
                            >
                                <Sparkles className="w-4 h-4 mr-1.5" />
                                <span>{t('Start a co-pilot chat')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Interactive Horizontal Tabs (Speed it up, Dispatch, Photo AI, Payroll, Signatures) */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
                        {[
                            { id: 'geofence', label: 'Speed it up (GPS)' },
                            { id: 'dispatch', label: 'Auto-Dispatch' },
                            { id: 'photo_ai', label: 'Photo Proof AI' },
                            { id: 'payroll', label: 'Timesheet Payroll' },
                            { id: 'signature', label: 'E-Signatures' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveAiTab(tab.id)}
                                className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-center transition-all ${
                                    activeAiTab === tab.id
                                        ? 'bg-violet-600/80 text-white shadow-md border border-violet-400/40'
                                        : 'bg-white/5 text-zinc-300 hover:bg-white/10 border border-white/5'
                                }`}
                            >
                                {t(tab.label)}
                            </button>
                        ))}
                    </div>

                    {/* Simulated Interactive Chat Box (Replicating Hostinger Image 4 Card) */}
                    <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-zinc-700/80 space-y-4 max-w-3xl">
                        {activeAiTab === 'geofence' && (
                            <>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                                        ADM
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-3 text-xs sm:text-sm text-zinc-200">
                                        "Did all 14 technicians clock in inside their designated facility geofences this morning?"
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pl-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="bg-violet-950/60 border border-violet-800/40 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-100 space-y-1">
                                        <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" /> 13 / 14 Verified on Site via GPS & Face Biometrics
                                        </p>
                                        <p className="text-zinc-300 text-xs">
                                            Officer Suresh was 180m outside Sector 4 boundary. An alert has been flagged in your live notifications log.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeAiTab === 'dispatch' && (
                            <>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                                        ADM
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-3 text-xs sm:text-sm text-zinc-200">
                                        "Urgent HVAC water chiller leak at Apex Tech Park. Who is nearest and certified?"
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pl-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="bg-violet-950/60 border border-violet-800/40 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-100 space-y-1">
                                        <p className="font-bold text-violet-300">
                                            Recommended: Karthik Raja (2.1 km away · Level 3 HVAC Certified)
                                        </p>
                                        <p className="text-zinc-300 text-xs">
                                            Estimated arrival time: 8 minutes. Automated job ticket dispatched with WhatsApp alert to client facility manager.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeAiTab === 'photo_ai' && (
                            <>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                                        ADM
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-3 text-xs sm:text-sm text-zinc-200">
                                        "Validate the completion photo uploaded for Solar Inverter #3 preventive inspection."
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pl-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="bg-violet-950/60 border border-violet-800/40 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-100 space-y-1">
                                        <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" /> Photo Proof Verified · EXIF GPS & Timestamp Match
                                        </p>
                                        <p className="text-zinc-300 text-xs">
                                            Inverter display readings: 415V / 50Hz within safe tolerances. Serial number tags match client asset master file.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeAiTab === 'payroll' && (
                            <>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                                        ADM
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-3 text-xs sm:text-sm text-zinc-200">
                                        "Calculate overtime and travel allowance for this week's cleaning & security crews."
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pl-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="bg-violet-950/60 border border-violet-800/40 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-100 space-y-1">
                                        <p className="font-bold text-indigo-300">
                                            Timesheet Summary Ready: 48 regular hours · 6.5 overtime hours · 142 km GPS mileage
                                        </p>
                                        <p className="text-zinc-300 text-xs">
                                            One-click payroll file ready for export to Tally, Zoho Books, or Excel format.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeAiTab === 'signature' && (
                            <>
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                                        ADM
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-3 text-xs sm:text-sm text-zinc-200">
                                        "Has client Metro Plaza signed off on the monthly pest control service sheet?"
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 pl-4">
                                    <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div className="bg-violet-950/60 border border-violet-800/40 rounded-2xl p-3.5 text-xs sm:text-sm text-zinc-100 space-y-1">
                                        <p className="font-bold text-emerald-400 flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" /> Signed on Glass by Mr. Rajesh (Facility Manager)
                                        </p>
                                        <p className="text-zinc-300 text-xs">
                                            Digital PDF certificate generated with cryptographic audit hash and delivered to client inbox.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Bottom floating dock / quick prompt pills (Hostinger Image 4 lower section) */}
                    <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-zinc-400 font-semibold">{t('Quick Operations Prompts:')}</span>
                            <button
                                type="button"
                                onClick={() => askAssistant('Run GPS geofence audit')}
                                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-zinc-200 transition-colors"
                            >
                                {t('Run GPS geofence audit')}
                            </button>
                            <button
                                type="button"
                                onClick={() => askAssistant('Export weekly overtime report')}
                                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-zinc-200 transition-colors"
                            >
                                {t('Export overtime timesheets')}
                            </button>
                            <button
                                type="button"
                                onClick={() => askAssistant('Check customer satisfaction score')}
                                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs text-zinc-200 transition-colors"
                            >
                                {t('Check CSAT index')}
                            </button>
                        </div>

                        {/* Floating bottom dock pill */}
                        <div className="inline-flex items-center bg-white/10 backdrop-blur-md rounded-full p-1 border border-white/10 text-xs self-start md:self-auto">
                            <button type="button" onClick={() => router.visit('/admin/tasks')} className="px-3 py-1 rounded-full hover:bg-white/15 text-zinc-200 font-semibold">{t('Jobs')}</button>
                            <button type="button" onClick={() => askAssistant('Open assistant')} className="px-3 py-1 rounded-full bg-violet-600 text-white font-bold">{t('Chat')}</button>
                            <button type="button" onClick={() => router.visit('/admin/performance')} className="px-3 py-1 rounded-full hover:bg-white/15 text-zinc-200 font-semibold">{t('Skills')}</button>
                            <button type="button" onClick={() => router.visit('/admin/visits')} className="px-3 py-1 rounded-full hover:bg-white/15 text-zinc-200 font-semibold">{t('Reports')}</button>
                            <button type="button" onClick={() => router.visit('/admin/subscriptions')} className="px-3 py-1 rounded-full hover:bg-white/15 text-zinc-200 font-semibold">{t('Modules')}</button>
                        </div>
                    </div>
                </div>
            </div>
            
        </AdminLayout>
    );
}
