import React from 'react';
import AdminLayout from './AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Settings2, BellRing, Map, Shield, Save,
    Home, ChevronRight
} from 'lucide-react';
import { useAlert } from '../../Components/AlertSystem';
import { useTranslation } from 'react-i18next';

export default function Settings() {
    const alertSystem = useAlert ? useAlert() : {};
    const triggerInfo = alertSystem?.triggerInfo;
    const { t } = useTranslation();

    const handleSave = () => {
        if (triggerInfo) {
            triggerInfo('System configuration updated successfully.');
        } else {
            alert('System configuration updated successfully.');
        }
    };

    return (
        <AdminLayout>
            <Head title="Settings - Fieldy Admin" />

            <div className="max-w-4xl mx-auto space-y-6 pb-12">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/admin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Home</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">Settings</span>
                </div>

                {/* Hostinger hPanel Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-hp-border)]">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {t('Settings')}
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                            {t('Manage automations, geofencing, and RBAC.')}
                        </p>
                    </div>
                    <button 
                        onClick={handleSave}
                        className="hp-btn hp-btn-primary inline-flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>{t('Save Changes')}</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Geofence Config */}
                    <div className="hp-card p-6">
                        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-[var(--color-hp-border)]">
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-hp-gray-100)] flex items-center justify-center text-[var(--color-hp-dark)]">
                                <Map className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[var(--color-hp-dark)]">
                                    {t('Geofence & Location Settings')}
                                </h2>
                                <p className="text-xs text-[var(--color-hp-gray-500)]">Configure coordinate radius and trip limits</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                    {t('Check-in Buffer Radius (Meters)')}
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue={100} 
                                    className="hp-input" 
                                />
                                <p className="text-[11px] text-[var(--color-hp-gray-500)] mt-1">
                                    {t('Maximum distance allowed from farm coordinates to allow check-in.')}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                    {t('Stationary Alert Timeout (Minutes)')}
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue={45} 
                                    className="hp-input" 
                                />
                                <p className="text-[11px] text-[var(--color-hp-gray-500)] mt-1">
                                    {t('Triggers High Alert if officer is stationary for too long.')}
                                </p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                    {t('Daily Distance Threshold (KM)')}
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue={100} 
                                    className="hp-input" 
                                />
                                <p className="text-[11px] text-[var(--color-hp-gray-500)] mt-1">
                                    {t('Alerts admin if an officer travels beyond this limit in a day.')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Automation Config */}
                    <div className="hp-card p-6">
                        <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-[var(--color-hp-border)]">
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] flex items-center justify-center">
                                <BellRing className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-[var(--color-hp-dark)]">
                                    {t('Automation & Reminders')}
                                </h2>
                                <p className="text-xs text-[var(--color-hp-gray-500)]">Schedule push alerts and checkout cutoffs</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-[var(--color-hp-border)] bg-[var(--color-hp-gray-50)] gap-3">
                                <div>
                                    <p className="text-xs font-bold text-[var(--color-hp-dark)]">
                                        {t('Daily Schedule Push Notification (Firebase)')}
                                    </p>
                                    <p className="text-[11px] text-[var(--color-hp-gray-500)] mt-0.5">
                                        {t('Automatically send daily visit schedules to officers.')}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <input 
                                        type="time" 
                                        defaultValue="08:30" 
                                        className="hp-input w-28 text-xs py-1" 
                                    />
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--color-hp-primary)]"></div>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-[var(--color-hp-border)] bg-[var(--color-hp-gray-50)] gap-3">
                                <div>
                                    <p className="text-xs font-bold text-[var(--color-hp-dark)]">
                                        {t('Morning Attendance Cutoff')}
                                    </p>
                                    <p className="text-[11px] text-[var(--color-hp-gray-500)] mt-0.5">
                                        {t('Officers checking in after this time will be marked late.')}
                                    </p>
                                </div>
                                <input 
                                    type="time" 
                                    defaultValue="09:30" 
                                    className="hp-input w-28 text-xs py-1" 
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-[var(--color-hp-border)] bg-[var(--color-hp-gray-50)] gap-3">
                                <div>
                                    <p className="text-xs font-bold text-[var(--color-hp-dark)]">
                                        {t('Max Visit Duration (Minutes)')}
                                    </p>
                                    <p className="text-[11px] text-[var(--color-hp-gray-500)] mt-0.5">
                                        {t('Maximum time allowed for a farm visit before auto-checkout or alert.')}
                                    </p>
                                </div>
                                <input 
                                    type="number" 
                                    defaultValue={120} 
                                    className="hp-input w-24 text-xs py-1" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* RBAC */}
                    <div className="hp-card p-6 bg-[var(--color-hp-gray-50)] border-dashed">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-white border border-[var(--color-hp-border)] flex items-center justify-center text-[var(--color-hp-gray-500)]">
                                <Shield className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-[var(--color-hp-dark)]">
                                {t('Role & Permission Management (RBAC)')}
                            </h2>
                        </div>
                        <p className="text-xs text-[var(--color-hp-gray-600)]">
                            {t('Settings for Super Admin, Regional Manager, and Auditor access controls will be configured here.')}
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
