import React from 'react';
import AdminLayout from './AdminLayout';
import { useTranslation } from 'react-i18next';
import { AlertCircle, TriangleAlert, Info, Bell, CheckCircle, ShieldAlert } from 'lucide-react';

export default function Alerts({ alerts = [] }) {
    const { t } = useTranslation();

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

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="hp-chip hp-chip-danger hp-chip-dot">{t('System Monitor')}</span>
                        </div>
                        <h1 className="hp-page-title">{t('Alerts & Notifications')}</h1>
                        <p className="text-sm text-hp-muted mt-1">
                            {t('Audit log of emergency events, geofence violations, and field dispatch notifications.')}
                        </p>
                    </div>
                </div>

                <div className="hp-card overflow-hidden">
                    <div className="hp-card-header">
                        <h2 className="hp-card-title flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-hp-primary" /> {t('Active Incident Stream')}
                        </h2>
                        <span className="hp-chip hp-chip-gray">{alerts.length} {t('Logs')}</span>
                    </div>

                    <div className="divide-y divide-hp-border">
                        {alerts.length === 0 ? (
                            <div className="text-center py-16 px-4">
                                <div className="hp-icon-tile !w-12 !h-12 mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-hp-success" />
                                </div>
                                <h3 className="text-sm font-bold text-hp-dark">{t('All systems operating normally')}</h3>
                                <p className="text-xs text-hp-muted mt-1">{t('No active alerts or emergency notices at this time.')}</p>
                            </div>
                        ) : (
                            alerts.map(alert => (
                                <div key={alert.id} className="p-4 sm:p-5 flex items-start gap-4 hover:bg-hp-hover transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-hp-bg border border-hp-border flex items-center justify-center shrink-0">
                                        {getAlertIcon(alert.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-sm font-bold text-hp-dark">{t(alert.title)}</h3>
                                                {getAlertBadge(alert.type)}
                                            </div>
                                            <span className="text-xs text-hp-muted">{alert.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-hp-muted leading-relaxed">{t(alert.message)}</p>
                                        {alert.resolved && (
                                            <span className="hp-chip hp-chip-success mt-2">
                                                {t('Resolved')}
                                            </span>
                                        )}
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
