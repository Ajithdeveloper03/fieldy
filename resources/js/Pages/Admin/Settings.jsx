import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Settings2, BellRing, Map, Shield, Save,
    Home, ChevronRight, Sparkles, Sliders, CheckCircle2, Lock
} from 'lucide-react';
import { useAlert } from '../../Components/AlertSystem';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../hooks/useIndustry';

export default function Settings() {
    const alertSystem = useAlert ? useAlert() : {};
    const triggerInfo = alertSystem?.triggerInfo;
    const { t } = useTranslation();
    const { vocab, labels, industry } = useIndustry();
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
            <Head title={`Settings - Fieldy ${industry.name}`} />

            <div className="space-y-6 pb-12 hp-animate-in">

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {industry.name} Configuration
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {t('Field Operational Policies')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t(`${industry.name} Operations & Dispatch Settings`)}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t(`Configure ${vocab.entity.singular.toLowerCase()} geofence radii, automated ${vocab.staff.singular.toLowerCase()} dispatch alerts, shift cutoffs, and regulatory compliance rules.`)}
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
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Geofence Tolerance')}</span>
                        <p className="font-bold text-2xl text-hp-dark">150 <span className="text-xs text-hp-muted font-normal">meters</span></p>
                        <p className="text-xs text-hp-muted mt-1">{t(`${vocab.entity.singular} boundary tolerance for GPS check-in`)}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Stationary Alert Timeout')}</span>
                        <p className="font-bold text-2xl text-hp-warning">30 <span className="text-xs text-hp-muted font-normal">minutes</span></p>
                        <p className="text-xs text-hp-muted mt-1">{t(`Alerts dispatcher if ${vocab.staff.singular.toLowerCase()} halts en route`)}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Standard Shift Window')}</span>
                        <p className="font-bold text-2xl text-hp-primary">9.0 <span className="text-xs text-hp-muted font-normal">hours</span></p>
                        <p className="text-xs text-hp-muted mt-1">{t('8h regular duty + 1h lunch/rest cutoff')}</p>
                    </div>
                </div>

                {/* ══════════ NAVIGATION TABS ══════════ */}
                <div className="flex items-center gap-2 border-b border-hp-border pb-3 overflow-x-auto">
                    {[
                        { id: 'all', label: t('All Settings') },
                        { id: 'geofence', label: t('Geofence & Tracking') },
                        { id: 'automation', label: t('Automations & Shifts') },
                        { id: 'rbac', label: t('Access & Security') },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSection(tab.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                                activeSection === tab.id
                                    ? 'bg-hp-primary text-white shadow-xs'
                                    : 'text-hp-muted hover:text-hp-dark hover:bg-hp-hover'
                            }`}
                        >
                            {tab.label}
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
                                        {t(`${vocab.entity.singular} Geofence & GPS Telemetry Settings`)}
                                    </h2>
                                    <p className="text-xs text-hp-muted">{t(`Configure ${vocab.entity.singular.toLowerCase()} perimeter radius, stationary warnings, and daily travel audit limits`)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1.5">
                                        {t(`${vocab.entity.singular} Check-In Radius (Meters)`)}
                                    </label>
                                    <input 
                                        type="number" 
                                        defaultValue={150} 
                                        className="hp-input" 
                                    />
                                    <p className="text-xs text-hp-muted mt-1">
                                        {t(`Maximum allowed distance from designated site coordinates to verify ${vocab.staff.singular.toLowerCase()} attendance.`)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1.5">
                                        {t('Stationary Idle Alert Timeout (Minutes)')}
                                    </label>
                                    <input 
                                        type="number" 
                                        defaultValue={30} 
                                        className="hp-input" 
                                    />
                                    <p className="text-xs text-hp-muted mt-1">
                                        {t(`Triggers high-priority alert if ${vocab.staff.singular.toLowerCase()} remains static without active work order.`)}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-hp-dark mb-1.5">
                                        {t('Daily Field Travel Distance Benchmark (KM)')}
                                    </label>
                                    <input 
                                        type="number" 
                                        defaultValue={80} 
                                        className="hp-input" 
                                    />
                                    <p className="text-xs text-hp-muted mt-1">
                                        {t(`Standard daily travel allowance baseline for ${industry.name} field beats.`)}
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
                                        {t('Automated Shift Rostering & Attendance Cutoffs')}
                                    </h2>
                                    <p className="text-xs text-hp-muted">{t(`Schedule automated dispatch notifications, morning check-in reminders, and shift cutoffs`)}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-hp-border bg-hp-hover/60 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-hp-dark">
                                            {t(`Daily ${vocab.visit.plural} Schedule Push (Firebase)`)}
                                        </p>
                                        <p className="text-xs text-hp-muted mt-0.5">
                                            {t(`Automatically dispatch morning route waypoints to active ${vocab.staff.plural.toLowerCase()}.`)}
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
                                            {t('Morning Shift Check-In Cutoff')}
                                        </p>
                                        <p className="text-xs text-hp-muted mt-0.5">
                                            {t('Officers checking in after this time are automatically marked as Late in attendance timesheets.')}
                                        </p>
                                    </div>
                                    <input 
                                        type="time" 
                                        defaultValue="09:15" 
                                        className="hp-input !w-28 text-xs font-semibold" 
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-hp-border bg-hp-hover/60 gap-4">
                                    <div>
                                        <p className="text-sm font-bold text-hp-dark">
                                            {t(`Standard ${vocab.visit.singular} Dwell Time (Minutes)`)}
                                        </p>
                                        <p className="text-xs text-hp-muted mt-0.5">
                                            {t(`Target completion window per ${vocab.visit.singular.toLowerCase()} on-site.`)}
                                        </p>
                                    </div>
                                    <input 
                                        type="number" 
                                        defaultValue={45} 
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
                                    {t('Role-Based Access Control (RBAC) & Multi-Tenant Isolation')}
                                </h2>
                            </div>
                            <p className="text-xs text-hp-muted leading-relaxed">
                                {t(`Granular permissions for Operations Manager, Dispatcher, Quality Auditor, and Field Staff are strictly enforced for ${industry.name}.`)}
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
