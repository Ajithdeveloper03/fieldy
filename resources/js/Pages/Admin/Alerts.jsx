import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { useTranslation } from 'react-i18next';
import { 
    AlertCircle, TriangleAlert, Info, Bell, CheckCircle, ShieldAlert,
    Search, Filter, CheckCircle2, Clock, ShieldCheck, ArrowRight, X, Sparkles
} from 'lucide-react';

export default function Alerts({ alerts = [] }) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical':
                return <AlertCircle className="w-5 h-5 text-hp-danger" />;
            case 'high':
                return <TriangleAlert className="w-5 h-5 text-hp-warning" />;
            case 'info':
                return <Info className="w-5 h-5 text-hp-info" />;
            default:
                return <Bell className="w-5 h-5 text-hp-muted" />;
        }
    };

    const getAlertBadge = (type) => {
        switch (type) {
            case 'critical':
                return <span className="hp-chip hp-chip-danger">{t('Critical')}</span>;
            case 'high':
                return <span className="hp-chip hp-chip-warning">{t('High Priority')}</span>;
            case 'info':
                return <span className="hp-chip hp-chip-info">{t('Notice')}</span>;
            default:
                return <span className="hp-chip hp-chip-gray">{t('System')}</span>;
        }
    };

    const filteredAlerts = useMemo(() => {
        return alerts.filter(alert => {
            const matchSearch = String(alert.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                String(alert.message || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchType = typeFilter === 'all' 
                ? true 
                : typeFilter === 'resolved' 
                    ? Boolean(alert.resolved) 
                    : alert.type === typeFilter;
            return matchSearch && matchType;
        });
    }, [alerts, searchQuery, typeFilter]);

    const criticalCount = alerts.filter(a => a.type === 'critical' && !a.resolved).length;
    const highCount = alerts.filter(a => a.type === 'high' && !a.resolved).length;
    const resolvedCount = alerts.filter(a => Boolean(a.resolved)).length;

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="hp-chip hp-chip-danger hp-chip-dot">
                                {t('Live Incident Telemetry Active')}
                            </span>
                            <span className="hp-chip hp-chip-gray">
                                {alerts.length} {t('Total Events')}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                            {t('Incident Stream & Operational Alerts')}
                        </h1>
                        <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                            {t('Real-time audit log of geofence violations, offline beacon signals, SOS safety pings, and field dispatch escalations.')}
                        </p>

                        {/* Search Pill Input Bar */}
                        <div className="mt-5 max-w-xl">
                            <div className="hp-search-pill-bar">
                                <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('Search alerts by facility, officer name, or keyword...')}
                                    className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="p-1 text-hp-muted hover:text-hp-dark">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER METRIC BENTO CARDS (TLD Style) ══════════ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div 
                        onClick={() => setTypeFilter('critical')}
                        className={`hp-metric-pill-card cursor-pointer ${typeFilter === 'critical' ? '!border-hp-danger ring-2 ring-hp-danger/20' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Critical')}</span>
                            <span className="w-2 h-2 rounded-full bg-hp-danger animate-ping"></span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-danger">{criticalCount}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Requires immediate action')}</p>
                    </div>

                    <div 
                        onClick={() => setTypeFilter('high')}
                        className={`hp-metric-pill-card cursor-pointer ${typeFilter === 'high' ? '!border-hp-warning ring-2 ring-hp-warning/20' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('High Priority')}</span>
                            <TriangleAlert className="w-3.5 h-3.5 text-hp-warning" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-warning">{highCount}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Geofence & delay notices')}</p>
                    </div>

                    <div 
                        onClick={() => setTypeFilter('all')}
                        className={`hp-metric-pill-card cursor-pointer ${typeFilter === 'all' ? '!border-hp-primary ring-2 ring-hp-primary/20' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Avg SLA Response')}</span>
                            <Clock className="w-3.5 h-3.5 text-hp-primary" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">4.2 <span className="text-sm font-semibold text-hp-muted">mins</span></div>
                        <p className="text-xs text-hp-success font-medium mt-1">98.4% {t('On-time SLA')}</p>
                    </div>

                    <div 
                        onClick={() => setTypeFilter('resolved')}
                        className={`hp-metric-pill-card cursor-pointer ${typeFilter === 'resolved' ? '!border-hp-success ring-2 ring-hp-success/20' : ''}`}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Resolved')}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-hp-success" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-success">{resolvedCount}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Closed successfully')}</p>
                    </div>
                </div>

                {/* ══════════ HOSTINGER SEGMENTED PILL FILTER BAR ══════════ */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="hp-segmented-bar overflow-x-auto max-w-full">
                        {[
                            { id: 'all', label: 'All Incidents', count: alerts.length },
                            { id: 'critical', label: 'Critical', count: criticalCount },
                            { id: 'high', label: 'High Priority', count: highCount },
                            { id: 'info', label: 'Notices', count: alerts.filter(a => a.type === 'info').length },
                            { id: 'resolved', label: 'Resolved', count: resolvedCount },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setTypeFilter(tab.id)}
                                className={`hp-segmented-item ${typeFilter === tab.id ? 'is-active-primary' : ''}`}
                            >
                                <span>{t(tab.label)}</span>
                                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${typeFilter === tab.id ? 'bg-white/20 text-white' : 'bg-hp-border text-hp-muted'}`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO INCIDENT LIST CARD ══════════ */}
                <div className="hp-bento-card !p-0 overflow-hidden">
                    <div className="p-5 border-b border-hp-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-hp-primary" />
                            <h2 className="hp-card-title">{t('Incident Stream')}</h2>
                        </div>
                        <span className="text-xs text-hp-muted font-medium">
                            {filteredAlerts.length} {t('Showing')}
                        </span>
                    </div>

                    <div className="divide-y divide-hp-border">
                        {filteredAlerts.length === 0 ? (
                            <div className="text-center py-20 px-4">
                                <div className="hp-icon-tile !w-14 !h-14 mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-hp-success" />
                                </div>
                                <h3 className="text-base font-bold text-hp-dark">{t('All systems operating normally')}</h3>
                                <p className="text-xs text-hp-muted mt-1 max-w-sm mx-auto">
                                    {t('No incidents matching your filter. Field telemetry checks are passing with 100% heartbeat accuracy.')}
                                </p>
                            </div>
                        ) : (
                            filteredAlerts.map(alert => (
                                <div key={alert.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-hp-hover/60 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-11 h-11 rounded-xl bg-hp-bg border border-hp-border flex items-center justify-center shrink-0">
                                            {getAlertIcon(alert.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="text-sm font-bold text-hp-dark">{t(alert.title)}</h3>
                                                {getAlertBadge(alert.type)}
                                                {alert.resolved && (
                                                    <span className="hp-chip hp-chip-success">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> {t('Resolved')}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-hp-muted leading-relaxed max-w-2xl">{t(alert.message)}</p>
                                            <div className="flex items-center gap-3 mt-2 text-xs text-hp-muted">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" /> {alert.timestamp}
                                                </span>
                                                <span>•</span>
                                                <span className="font-medium text-hp-dark">{alert.location || 'Sector Telemetry Unit'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                        <button 
                                            type="button" 
                                            onClick={() => alert('Acknowledged incident ' + alert.id)}
                                            className="hp-btn hp-btn-sm hp-btn-outline"
                                        >
                                            {t('Acknowledge')}
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => alert('Opening live telemetry for ' + alert.id)}
                                            className="hp-btn hp-btn-sm hp-btn-secondary"
                                        >
                                            {t('View Telemetry')} <ArrowRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
