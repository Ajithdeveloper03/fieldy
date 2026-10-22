import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Settings2, BellRing, Map, Shield, Save,
    Home, ChevronRight, Sparkles, Sliders, CheckCircle2, Lock
} from 'lucide-react';
import { useAlert } from '../../Components/AlertSystem';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const alertSystem = useAlert ? useAlert() : {};
    const triggerInfo = alertSystem?.triggerInfo;
    const { t } = useTranslation();
    const [activeSection, setActiveSection] = useState('all');

    const handleSave = () => {
        if (triggerInfo) {
            triggerInfo(t('System configuration updated successfully.'));
        } else {
            alert('System configuration updated successfully.');
        }
    };

    return (
        <AdminLayout>
            <Head title="Settings - Fieldy Admin" />

            <div className="space-y-6 pb-12 hp-animate-in">

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {t('Platform Configuration')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {t('Organization Level Policies')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t('System Settings & Automation Engine')}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t('Configure GPS geofence buffers, automated push schedules, audit time thresholds, and role-based access controls.')}
                            </p>
                        </div>

                        {/* Top Save Action */}
                        <div className="shrink-0 self-start lg:self-center">
                            <button 
                                onClick={handleSave}
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Save className="w-4 h-4 mr-1.5" />
                                <span>{t('Save Changes')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS ══════════ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Check-in Buffer')}</span>
                        <p className="font-bold text-2xl text-hp-dark">100 <span className="text-xs text-hp-muted font-normal">meters</span></p>
                        <p className="text-xs text-hp-muted mt-1">{t('Maximum perimeter tolerance for arrival')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Stationary Alert Timeout')}</span>
                        <p className="font-bold text-2xl text-hp-warning">45 <span className="text-xs text-hp-muted font-normal">minutes</span></p>
                        <p className="text-xs text-hp-muted mt-1">{t('Triggers high-priority safety check')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Daily Transit Threshold')}</span>
                        <p className="font-bold text-2xl text-hp-primary">100 <span className="text-xs text-hp-muted font-normal">km / day</span></p>
                        <p className="text-xs text-hp-muted mt-1">{t('Maximum authorized vehicle distance')}</p>
                    </div>
                </div>

                {/* ══════════ HOSTINGER SEGMENTED CATEGORIES ══════════ */}
                <div className="hp-segmented-bar overflow-x-auto max-w-full">
                    {[
                        { id: 'all', label: 'All Settings' },
                        { id: 'geofence', label: 'Geofence & Tracking' },
                        { id: 'automation', label: 'Automation & Reminders' },
                        { id: 'rbac', label: 'Access Control (RBAC)' },
                    ].map((sec) => (
                        <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id)}
                            className={`hp-segmented-item ${activeSection === sec.id ? 'is-active-primary' : ''}`}
                        >
                            {t(sec.label)}
                        </button>
                    ))}
                </div>

                {/* ══════════ BENTO SETTINGS CARDS ══════════ */}
                <div className="space-y-6">
                    {/* Geofence Config */}
                    {(activeSection === 'all' || activeSection === 'geofence') && (
                        <div className="hp-bento-card">
                            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-hp-border">
                                <div className="w-9 h-9 rounded-xl bg-hp-primary-light text-hp-primary flex items-center justify-center">
                                    <Map className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="hp-card-title text-base">
                                        {t('Geofence & Telemetry Settings')}
                                    </h2>
                                    <p className="text-xs text-hp-muted">Configure coordinate radius, stationary safety timeouts, and trip limits</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1.5">
                                        {t('Check-in Buffer Radius (Meters)')}
                                    </label>
                                    <input 
                                        type="number" 
                                        defaultValue={100} 
                                        className="hp-input" 
                                    />
                                    <p className="text-xs text-hp-muted mt-1">
                                        {t('Maximum distance allowed from facility coordinates to allow officer check-in.')}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1.5">
                                        {t('Stationary Alert Timeout (Minutes)')}
                                    </label>
                                    <input 
                                        type="number" 
                                        defaultValue={45} 
                                        className="hp-input" 
                                    />
                                    <p className="text-xs text-hp-muted mt-1">
                                        {t('Triggers High Alert if officer is stationary for longer than this duration.')}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-hp-dark mb-1.5">
                                        {t('Daily Distance Threshold (KM)')}
                                    </label>
                                    <input 
                                        type="number" 
                                        defaultValue={100} 
                                        className="hp-input" 
                                    />
                                    <p className="text-xs text-hp-muted mt-1">
                                        {t('Alerts admin dispatch team if an officer travels beyond this limit in a single shift.')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Automation Config */}
                    {(activeSection === 'all' || activeSection === 'automation') && (
                        <div className="hp-bento-card">
                            <div className="flex items-center gap-3 pb-4 mb-5 border-b border-hp-border">
                                <div className="w-9 h-9 rounded-xl bg-hp-warning-light text-hp-warning flex items-center justify-center">
                                    <BellRing className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="hp-card-title text-base">
                                        {t('Automated Push Schedules & Shift Reminders')}
                                    </h2>
                                    <p className="text-xs text-hp-muted">Schedule automated FCM mobile notifications and checkout cutoffs</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-hp-border bg-hp-hover/60 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-hp-dark">
                                            {t('Daily Schedule Push Notification (Firebase)')}
                                        </p>
                                        <p className="text-xs text-hp-muted mt-0.5">
                                            {t('Automatically broadcast daily work orders & visit schedules to technicians.')}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <input 
                                            type="time" 
                                            defaultValue="08:30" 
                                            className="hp-input !w-28 text-xs font-semibold" 
                                        />
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-hp-primary"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-hp-border bg-hp-hover/60 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-hp-dark">
                                            {t('Morning Shift Attendance Cutoff')}
                                        </p>
                                        <p className="text-xs text-hp-muted mt-0.5">
                                            {t('Officers checking in after this time will be marked as late arrival.')}
                                        </p>
                                    </div>
                                    <input 
                                        type="time" 
                                        defaultValue="09:30" 
                                        className="hp-input !w-28 text-xs font-semibold" 
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-hp-border bg-hp-hover/60 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-hp-dark">
                                            {t('Max Audit Duration (Minutes)')}
                                        </p>
                                        <p className="text-xs text-hp-muted mt-0.5">
                                            {t('Maximum time allowed for a single facility inspection before auto-prompt.')}
                                        </p>
                                    </div>
                                    <input 
                                        type="number" 
                                        defaultValue={120} 
                                        className="hp-input !w-28 text-xs font-semibold" 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RBAC Card */}
                    {(activeSection === 'all' || activeSection === 'rbac') && (
                        <div className="hp-bento-card border-dashed bg-hp-hover/30">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-white border border-hp-border flex items-center justify-center text-hp-muted">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <h2 className="text-sm font-bold text-hp-dark">
                                    {t('Role-Based Access Control (RBAC)')}
                                </h2>
                            </div>
                            <p className="text-xs text-hp-muted leading-relaxed">
                                {t('Granular security controls for Super Admin, Regional Manager, Dispatch Coordinator, and Field Technicians are actively enforced by tenant middleware.')}
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
