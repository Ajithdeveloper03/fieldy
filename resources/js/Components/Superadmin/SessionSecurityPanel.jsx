import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import {
    ShieldCheck, Activity, Clock, LogIn, PauseCircle, RefreshCw,
    Lock, Globe, AlertTriangle, CheckCircle2, UserCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { withBase } from '../../basePath';
import CardPhotoBackdrop from '../CardPhotoBackdrop';

const formatDuration = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    if (m >= 60) {
        const h = Math.floor(m / 60);
        return `${h}h ${m % 60}m`;
    }
    return m > 0 ? `${m}m ${rem}s` : `${rem}s`;
};

const formatClock = (secs) => {
    const s = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
};

const EVENT_META = {
    login: { label: 'Login', chip: 'hp-chip-success', icon: LogIn },
    impersonate: { label: 'Portal Launch', chip: 'hp-chip-info', icon: UserCheck },
    logout: { label: 'Logout', chip: 'hp-chip-gray', icon: Clock },
    login_failed: { label: 'Login Blocked', chip: 'hp-chip-danger', icon: AlertTriangle },
    page_activity: { label: 'Activity', chip: 'hp-chip-primary', icon: Activity },
    activity_resumed: { label: 'Resumed', chip: 'hp-chip-success', icon: CheckCircle2 },
    session_extended: { label: 'Extended', chip: 'hp-chip-info', icon: RefreshCw },
    inactivity_detected: { label: 'Idle', chip: 'hp-chip-warning', icon: PauseCircle },
    inactivity_logout: { label: 'Idle Timeout', chip: 'hp-chip-danger', icon: Clock },
    sql_injection_blocked: { label: 'SQLi Blocked', chip: 'hp-chip-danger', icon: ShieldCheck },
};

export default function SessionSecurityPanel({ scopeLabel = 'Platform-Wide' }) {
    const { props } = usePage();
    const { t } = useTranslation();
    const security = props.sessionSecurity || {};

    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'logins' | 'activities' | 'inactivities' | 'security'
    const [events, setEvents] = useState([]);
    const [summary, setSummary] = useState({
        loginsToday: 0,
        failedLoginsToday: 0,
        activeEventsToday: 0,
        inactivityEventsToday: 0,
        blockedSqliCount: 0,
        remainingSeconds: security.timeoutSeconds || 900,
        timeoutSeconds: security.timeoutSeconds || 900,
        loginAt: security.loginAt || null,
        ipAddress: security.ipAddress || '—',
    });
    const [loading, setLoading] = useState(true);
    const [liveTick, setLiveTick] = useState(() => window.__FIELDY_SESSION_STATE__ || {
        isIdle: false,
        idleSeconds: 0,
        remainingSeconds: security.timeoutSeconds || 900,
        timeoutSeconds: security.timeoutSeconds || 900,
        activeTotalSeconds: 0,
        idleTotalSeconds: 0,
    });

    const fetchFeed = useCallback(async () => {
        try {
            const url = withBase('/portal/session/feed');
            const res = await fetch(url, {
                credentials: 'same-origin',
                headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
            });
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data.events)) setEvents(data.events);
            if (data.summary) setSummary((prev) => ({ ...prev, ...data.summary }));
        } catch {
            // ignore network hiccups
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchFeed();
        const poll = window.setInterval(fetchFeed, 20000);
        const onRefresh = () => void fetchFeed();
        const onTick = (e) => {
            if (e?.detail) setLiveTick(e.detail);
        };
        window.addEventListener('fieldy:session-refresh', onRefresh);
        window.addEventListener('fieldy:session-tick', onTick);
        return () => {
            window.clearInterval(poll);
            window.removeEventListener('fieldy:session-refresh', onRefresh);
            window.removeEventListener('fieldy:session-tick', onTick);
        };
    }, [fetchFeed]);

    const filteredEvents = useMemo(() => {
        if (activeTab === 'all') return events;
        if (activeTab === 'logins') {
            return events.filter((e) => ['login', 'logout', 'login_failed', 'impersonate'].includes(e.event_type));
        }
        if (activeTab === 'activities') {
            return events.filter((e) => ['page_activity', 'activity_resumed', 'session_extended'].includes(e.event_type));
        }
        if (activeTab === 'inactivities') {
            return events.filter((e) => ['inactivity_detected', 'inactivity_logout'].includes(e.event_type));
        }
        return events.filter((e) => ['sql_injection_blocked', 'login_failed', 'inactivity_logout'].includes(e.event_type));
    }, [events, activeTab]);

    const handleExtendNow = () => {
        window.dispatchEvent(new CustomEvent('fieldy:extend-session'));
    };

    const loginTimeFormatted = useMemo(() => {
        if (!summary.loginAt) return t('Active now');
        const d = new Date(summary.loginAt);
        if (Number.isNaN(d.getTime())) return t('Active now');
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, [summary.loginAt, t]);

    return (
        <section className="hp-animate-in mb-8">
            <div className="hp-card overflow-hidden">
                {/* Header Strip with subtle Indian corporate backdrop */}
                <div className="relative overflow-hidden p-5 sm:p-6 border-b border-hp-border">
                    <CardPhotoBackdrop photoKey="manager" variant="right" opacity={0.22} />
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`hp-chip ${liveTick.isIdle ? 'hp-chip-warning' : 'hp-chip-success'} hp-chip-dot`}>
                                    {liveTick.isIdle ? t('Session Idle') : t('Session Active')}
                                </span>
                                <span className="hp-chip hp-chip-primary">
                                    <ShieldCheck className="w-3 h-3" /> {t('SQL Injection Shield Active')}
                                </span>
                            </div>
                            <h2 className="hp-card-title mt-1">
                                {t('Session Activities, Inactivity Guard & Login Security')}
                            </h2>
                            <p className="text-xs sm:text-sm text-hp-muted mt-0.5">
                                {t('Real-time login audit trail, automatic inactivity timeout protection, and parameterized SQLi defense')} ({t(scopeLabel)}).
                            </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start lg:self-center">
                            <button
                                type="button"
                                onClick={handleExtendNow}
                                className="hp-btn hp-btn-sm hp-btn-primary cursor-pointer"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>{t('Extend Session')}</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => void fetchFeed()}
                                className="hp-btn hp-btn-sm hp-btn-outline cursor-pointer"
                                title={t('Refresh Audit Log')}
                            >
                                <Activity className="w-3.5 h-3.5" />
                                <span>{t('Refresh')}</span>
                            </button>
                        </div>
                    </div>

                    {/* 4 Compact Live Session & Security Cards */}
                    <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                        {/* 1. Active vs Idle Presence */}
                        <div className="rounded-2xl bg-white/90 border border-hp-border p-3.5">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-hp-muted">
                                <span>{t('Live Presence')}</span>
                                <Activity className={`w-3.5 h-3.5 ${liveTick.isIdle ? 'text-amber-500' : 'text-emerald-600'}`} />
                            </div>
                            <div className={`text-lg font-extrabold mt-1 ${liveTick.isIdle ? 'text-amber-600' : 'text-emerald-700'}`}>
                                {liveTick.isIdle ? t('Idle') : t('Active')}
                            </div>
                            <p className="text-[11px] text-hp-muted mt-0.5 truncate">
                                {t('Active')}: {formatDuration(liveTick.activeTotalSeconds)} • {t('Idle')}: {formatDuration(liveTick.idleTotalSeconds)}
                            </p>
                        </div>

                        {/* 2. Auto-Logout Inactivity Countdown */}
                        <div className="rounded-2xl bg-white/90 border border-hp-border p-3.5">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-hp-muted">
                                <span>{t('Idle Auto-Logout')}</span>
                                <Clock className="w-3.5 h-3.5 text-hp-primary" />
                            </div>
                            <div className="text-lg font-mono font-extrabold text-hp-dark mt-1 tabular-nums">
                                {formatClock(liveTick.remainingSeconds)}
                            </div>
                            <p className="text-[11px] text-hp-muted mt-0.5 truncate">
                                {t('Server enforced')} ({Math.round((liveTick.timeoutSeconds || 900) / 60)}m)
                            </p>
                        </div>

                        {/* 3. Login & Session IP */}
                        <div className="rounded-2xl bg-white/90 border border-hp-border p-3.5">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-hp-muted">
                                <span>{t('Logins Today')}</span>
                                <LogIn className="w-3.5 h-3.5 text-sky-600" />
                            </div>
                            <div className="text-lg font-extrabold text-hp-dark mt-1 tabular-nums">
                                {summary.loginsToday}
                                <span className="text-xs font-semibold text-hp-muted ml-1.5">({loginTimeFormatted})</span>
                            </div>
                            <p className="text-[11px] text-hp-muted mt-0.5 flex items-center gap-1 truncate">
                                <Globe className="w-3 h-3 shrink-0" /> IP: {summary.ipAddress}
                            </p>
                        </div>

                        {/* 4. SQL Injection Shield */}
                        <div className="rounded-2xl bg-white/90 border border-hp-border p-3.5">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-hp-muted">
                                <span>{t('SQLi Protection')}</span>
                                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <div className="text-lg font-extrabold text-emerald-700 mt-1 flex items-center gap-1.5">
                                <span>{t('Protected')}</span>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {summary.blockedSqliCount} {t('blocked')}
                                </span>
                            </div>
                            <p className="text-[11px] text-hp-muted mt-0.5 truncate">
                                {t('Native PDO + Request WAF + Rate Limit')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs + Audit Table */}
                <div className="p-4 sm:px-6 border-b border-hp-border flex flex-wrap items-center justify-between gap-3 bg-hp-gray-50/60">
                    <div className="flex items-center flex-wrap gap-1.5">
                        {[
                            { id: 'all', label: t('All Events'), count: events.length },
                            { id: 'logins', label: t('Logins'), count: summary.loginsToday + (summary.failedLoginsToday || 0) },
                            { id: 'activities', label: t('Activities'), count: summary.activeEventsToday },
                            { id: 'inactivities', label: t('Inactivities'), count: summary.inactivityEventsToday },
                            { id: 'security', label: t('Security'), count: summary.blockedSqliCount + (summary.failedLoginsToday || 0) },
                        ].map((tab) => {
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                        active
                                            ? 'bg-hp-dark text-white border-hp-dark'
                                            : 'bg-white text-hp-muted border-hp-border hover:text-hp-dark'
                                    }`}
                                >
                                    <span>{tab.label}</span>
                                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-hp-gray-100 text-hp-dark'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                    <span className="text-xs text-hp-muted font-medium">
                        {filteredEvents.length} {t('entries')}
                    </span>
                </div>

                <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                    <table className="hp-table min-w-[640px]">
                        <thead>
                            <tr>
                                <th>{t('Event')}</th>
                                <th>{t('User')}</th>
                                <th>{t('Type')}</th>
                                <th>{t('IP / Path')}</th>
                                <th className="text-right">{t('Time')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-hp-muted text-xs">
                                        {t('Loading session audit trail...')}
                                    </td>
                                </tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-hp-muted text-xs">
                                        {t('No matching session events recorded yet.')}
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map((ev) => {
                                    const meta = EVENT_META[ev.event_type] || { label: ev.event_type, chip: 'hp-chip-gray', icon: Activity };
                                    const EvIcon = meta.icon;
                                    return (
                                        <tr key={ev.id}>
                                            <td>
                                                <div className="flex items-center gap-2.5">
                                                    <span className="w-7 h-7 rounded-lg bg-hp-gray-100 text-hp-dark flex items-center justify-center shrink-0">
                                                        <EvIcon className="w-3.5 h-3.5" />
                                                    </span>
                                                    <span className="font-semibold text-xs text-hp-dark">{ev.label}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="text-xs font-bold text-hp-dark">{ev.user_name}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-hp-muted">{ev.user_role}</div>
                                            </td>
                                            <td>
                                                <span className={`hp-chip ${meta.chip}`}>{t(meta.label)}</span>
                                            </td>
                                            <td className="font-mono text-[11px] text-hp-muted">
                                                <div>{ev.ip_address || '—'}</div>
                                                {ev.route_path && <div className="truncate max-w-[180px] opacity-80">{ev.route_path}</div>}
                                            </td>
                                            <td className="text-right text-xs text-hp-muted whitespace-nowrap">
                                                <div className="font-semibold text-hp-dark">{ev.time_ago}</div>
                                                <div className="text-[10px]">{ev.timestamp}</div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}
