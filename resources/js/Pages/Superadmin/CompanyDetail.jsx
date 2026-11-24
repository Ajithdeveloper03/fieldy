import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SuperadminLayout from './SuperadminLayout';
import CardPhotoBackdrop from '../../Components/CardPhotoBackdrop';
import { getIndustryById } from '../../data/industriesConfig';
import {
    Building2, Users, MapPin, Calendar,
    ClipboardList, Wallet, ArrowLeft, ExternalLink,
    Smartphone, CheckCircle2, AlertCircle, Clock,
    Navigation, ShieldCheck, FileText, ChevronRight,
    Home, Lightbulb
} from 'lucide-react';

export default function CompanyDetail({ company, stats = {}, employees = [], visits = [], farmers = [], tasks = [], payments = [] }) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('employees'); // 'employees' | 'visits' | 'customers' | 'tasks' | 'payments'

    const handleImpersonate = () => {
        if (confirm(`${t('Do you want to switch into the Client Admin Portal of')} "${company.name}"?`)) {
            router.post(`/superadmin/companies/${company.id}/impersonate`);
        }
    };

    const tabs = [
        { id: 'employees', label: t('Field Workforce (Mobile Apps)'), count: employees.length, icon: Users },
        { id: 'visits', label: t('Field Audits & Visits'), count: visits.length, icon: MapPin },
        { id: 'customers', label: t('Registered Clients / Facilities'), count: farmers.length, icon: Building2 },
        { id: 'tasks', label: t('Tasks & Work Orders'), count: tasks.length, icon: ClipboardList },
        { id: 'payments', label: t('Staff Payments & Payouts'), count: payments.length, icon: Wallet },
    ];

    return (
        <SuperadminLayout>
            <Head title={`${company.name} - ${t('Company Intelligence')} - Fieldy`} />

            <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/superadmin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>{t('Superadmin')}</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <Link href="/superadmin/companies" className="hover:text-[var(--color-hp-primary)] transition-colors">
                        {t('Companies')}
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">{company.name}</span>
                </div>

                {/* Company Header Card */}
                <div className="hp-card relative overflow-hidden p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <CardPhotoBackdrop photoKey={company.industry} variant="right" opacity={0.26} />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] border border-[var(--color-hp-primary)]/20 flex items-center justify-center font-bold text-2xl shrink-0">
                            {company.name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                                    {company.name}
                                </h1>
                                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[var(--color-hp-gray-100)] text-[var(--color-hp-gray-700)]">
                                    {company.code || t('NO-CODE')}
                                </span>
                                <span className={`hp-chip ${company.status === 'active' ? 'hp-chip-success' : 'hp-chip-danger'}`}>
                                    {t(company.status)}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-hp-gray-600)] mt-1.5">
                                <span>{t(getIndustryById(company.industry).name)}</span>
                                <span>•</span>
                                <span>{company.email}</span>
                                {company.phone && (
                                    <>
                                        <span>•</span>
                                        <span>{company.phone}</span>
                                    </>
                                )}
                                <span>•</span>
                                <span className="text-[var(--color-hp-primary)] font-semibold uppercase">{t(company.plan)} {t('Tier')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-2.5">
                        <button
                            onClick={handleImpersonate}
                            className="hp-btn hp-btn-primary inline-flex items-center gap-2"
                        >
                            <ExternalLink className="w-4 h-4" />
                            <span>{t('Launch Client Admin View')}</span>
                        </button>
                    </div>
                </div>

                {/* Quick Metrics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div className="hp-card p-3.5">
                        <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider">{t('Field Agents')}</span>
                        <div className="mt-1 text-2xl font-bold text-[var(--color-hp-dark)]">{stats.totalEmployees ?? 0}</div>
                        <span className="text-[11px] text-[var(--color-hp-gray-500)]">{t('Limit')}: {company.max_employees}</span>
                    </div>
                    <div className="hp-card p-3.5">
                        <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider">{t('Live GPS')}</span>
                        <div className="mt-1 text-2xl font-bold text-emerald-600">{stats.activeTrackingNow ?? 0}</div>
                        <span className="text-[11px] text-[var(--color-hp-gray-500)]">{t('Active tracking')}</span>
                    </div>
                    <div className="hp-card p-3.5">
                        <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider">{t('Attendance')}</span>
                        <div className="mt-1 text-2xl font-bold text-[var(--color-hp-primary)]">{stats.checkedInToday ?? 0}</div>
                        <span className="text-[11px] text-[var(--color-hp-gray-500)]">{t('Checked in today')}</span>
                    </div>
                    <div className="hp-card p-3.5">
                        <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider">{t('Field Audits')}</span>
                        <div className="mt-1 text-2xl font-bold text-amber-600">{stats.totalVisits ?? 0}</div>
                        <span className="text-[11px] text-[var(--color-hp-gray-500)]">{t('Visits completed')}</span>
                    </div>
                    <div className="hp-card p-3.5">
                        <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider">{t('Accounts')}</span>
                        <div className="mt-1 text-2xl font-bold text-sky-600">{stats.totalCustomers ?? 0}</div>
                        <span className="text-[11px] text-[var(--color-hp-gray-500)]">{t('Facilities registered')}</span>
                    </div>
                    <div className="hp-card p-3.5">
                        <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider">{t('Disbursements')}</span>
                        <div className="mt-1 text-2xl font-bold text-[var(--color-hp-dark)]">₹{Math.round(stats.totalPayouts || 0).toLocaleString()}</div>
                        <span className="text-[11px] text-[var(--color-hp-gray-500)]">{t('Ledger total')}</span>
                    </div>
                </div>

                {/* Main Content with Tabs */}
                <div className="hp-card overflow-hidden">
                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-1 border-b border-[var(--color-hp-border)] px-4 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-3.5 py-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                                        isActive
                                            ? 'border-[var(--color-hp-primary)] text-[var(--color-hp-primary)]'
                                            : 'border-transparent text-[var(--color-hp-gray-600)] hover:text-[var(--color-hp-dark)]'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{tab.label}</span>
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                                        isActive ? 'bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)]' : 'bg-[var(--color-hp-gray-100)] text-[var(--color-hp-gray-600)]'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Tab 1: Field Workforce & Mobile Telemetry */}
                    {activeTab === 'employees' && (
                        <div className="overflow-x-auto">
                            <table className="hp-table">
                                <thead>
                                    <tr>
                                        <th>{t('Field Officer')}</th>
                                        <th>{t('Designation & Region')}</th>
                                        <th className="text-center">{t('Shift Attendance')}</th>
                                        <th className="text-center">{t('Live GPS Stream')}</th>
                                        <th className="text-center">{t('Coordinates')}</th>
                                        <th className="text-center">{t('Visits (Today / Lifetime)')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp) => (
                                        <tr key={emp.id}>
                                            <td>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-[var(--color-hp-gray-100)] border border-[var(--color-hp-border)] flex items-center justify-center font-bold text-xs text-[var(--color-hp-dark)]">
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-xs text-[var(--color-hp-dark)]">{emp.name}</p>
                                                        <p className="text-[11px] text-[var(--color-hp-gray-500)]">{emp.phone} • {emp.employee_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="font-medium text-xs text-[var(--color-hp-dark)] capitalize">{t((emp.designation || '').replace('_', ' '))}</p>
                                                <p className="text-[11px] text-[var(--color-hp-gray-500)]">{emp.region}</p>
                                            </td>
                                            <td className="text-center">
                                                {emp.hasCheckedIn ? (
                                                    <div>
                                                        <span className="hp-chip hp-chip-success inline-flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> {t('Checked In')}
                                                        </span>
                                                        <p className="text-[11px] text-[var(--color-hp-gray-500)] mt-0.5">{emp.checkInTime} {emp.checkOutTime ? `— ${emp.checkOutTime}` : ''}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-[var(--color-hp-gray-400)]">{t('Absent / Not Checked In')}</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {emp.isTrackingActive ? (
                                                    <span className="hp-chip hp-chip-success inline-flex items-center gap-1 font-semibold">
                                                        <Navigation className="w-3 h-3" /> {t('Active Route')}
                                                    </span>
                                                ) : (
                                                    <span className="hp-chip hp-chip-gray">{t('Idle / Offline')}</span>
                                                )}
                                            </td>
                                            <td className="text-center text-xs">
                                                {emp.latestPing ? (
                                                    <div>
                                                        <p className="font-mono text-xs text-[var(--color-hp-dark)]">
                                                            {Number(emp.latestPing.latitude).toFixed(4)}, {Number(emp.latestPing.longitude).toFixed(4)}
                                                        </p>
                                                        <div className="flex items-center justify-center gap-1.5 text-[10px] text-[var(--color-hp-gray-500)] mt-0.5">
                                                            <span>{emp.latestPing.time}</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[var(--color-hp-gray-400)] text-xs">{t('No pings today')}</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                    {emp.visitsToday} {t('today')}
                                                </span>
                                                <p className="text-[11px] text-[var(--color-hp-gray-500)] mt-0.5">{emp.totalVisits} {t('lifetime')}</p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 2: Field Visits & Audits */}
                    {activeTab === 'visits' && (
                        <div className="overflow-x-auto">
                            <table className="hp-table">
                                <thead>
                                    <tr>
                                        <th>{t('Visit Time')}</th>
                                        <th>{t('Field Agent')}</th>
                                        <th>{t('Facility / Customer')}</th>
                                        <th>{t('GPS Coordinates')}</th>
                                        <th>{t('Audit Notes & Recommendations')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visits.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="py-12 text-center text-[var(--color-hp-gray-500)] text-xs">
                                                {t('No field visits recorded yet for this company.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        visits.map((v) => (
                                            <tr key={v.id}>
                                                <td>
                                                    <p className="font-semibold text-xs text-[var(--color-hp-dark)]">{v.check_in_time}</p>
                                                    {v.check_out_time && (
                                                        <p className="text-[11px] text-[var(--color-hp-gray-500)]">{t('Out')}: {v.check_out_time}</p>
                                                    )}
                                                </td>
                                                <td className="font-medium text-xs text-[var(--color-hp-dark)]">
                                                    {v.employee}
                                                </td>
                                                <td className="font-semibold text-xs text-[var(--color-hp-primary)]">
                                                    {v.farmer}
                                                </td>
                                                <td className="text-xs font-mono text-[var(--color-hp-gray-600)]">
                                                    {v.check_in_lat && v.check_in_lng ? (
                                                        <span>{Number(v.check_in_lat).toFixed(4)}, {Number(v.check_in_lng).toFixed(4)}</span>
                                                    ) : t('N/A')}
                                                </td>
                                                <td className="text-xs text-[var(--color-hp-gray-700)] max-w-md">
                                                    <p className="line-clamp-2">{v.notes || t('No remarks recorded')}</p>
                                                    {v.recommendations && (
                                                        <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 line-clamp-1">
                                                            <Lightbulb className="w-3 h-3 shrink-0" />
                                                            <span className="truncate">{v.recommendations}</span>
                                                        </p>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 3: Customers / Facilities */}
                    {activeTab === 'customers' && (
                        <div className="overflow-x-auto">
                            <table className="hp-table">
                                <thead>
                                    <tr>
                                        <th>{t('Client / Facility')}</th>
                                        <th>{t('Phone')}</th>
                                        <th>{t('Location')}</th>
                                        <th className="text-center">{t('Facility Size')}</th>
                                        <th className="text-center">{t('KYC Status')}</th>
                                        <th className="text-center">{t('Status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {farmers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-[var(--color-hp-gray-500)] text-xs">
                                                {t('No clients registered under this company yet.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        farmers.map((f) => (
                                            <tr key={f.id}>
                                                <td className="font-semibold text-xs text-[var(--color-hp-dark)]">
                                                    {f.name}
                                                    <p className="text-[11px] text-[var(--color-hp-gray-500)] font-normal">{f.crop}</p>
                                                </td>
                                                <td className="text-xs text-[var(--color-hp-gray-600)]">{f.phone}</td>
                                                <td className="text-xs text-[var(--color-hp-gray-600)]">
                                                    {f.village}, {f.district}
                                                </td>
                                                <td className="text-center font-bold text-xs text-[var(--color-hp-dark)]">
                                                    {f.acres} {t('Acres')}
                                                </td>
                                                <td className="text-center">
                                                    <span className={`hp-chip ${f.kyc === 'verified' ? 'hp-chip-success' : 'hp-chip-warning'}`}>
                                                        {t(f.kyc)}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`hp-chip ${f.status === 'active' ? 'hp-chip-success' : 'hp-chip-gray'}`}>
                                                        {t(f.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 4: Tasks & Work Orders */}
                    {activeTab === 'tasks' && (
                        <div className="overflow-x-auto">
                            <table className="hp-table">
                                <thead>
                                    <tr>
                                        <th>{t('Code & Task')}</th>
                                        <th>{t('Assigned Agent')}</th>
                                        <th>{t('Target Facility')}</th>
                                        <th className="text-center">{t('Due Date')}</th>
                                        <th className="text-center">{t('Priority')}</th>
                                        <th className="text-center">{t('Status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-[var(--color-hp-gray-500)] text-xs">
                                                {t('No tasks assigned for this company yet.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        tasks.map((task) => (
                                            <tr key={task.id}>
                                                <td>
                                                    <span className="text-[10px] font-mono font-bold text-[var(--color-hp-primary)] uppercase bg-[var(--color-hp-primary-light)] px-1.5 py-0.5 rounded">
                                                        {task.work_order_code}
                                                    </span>
                                                    <p className="font-semibold text-xs text-[var(--color-hp-dark)] mt-0.5">{task.title}</p>
                                                </td>
                                                <td className="font-medium text-xs text-[var(--color-hp-dark)]">
                                                    {task.assigned_to}
                                                </td>
                                                <td className="text-xs text-[var(--color-hp-gray-600)]">
                                                    {task.customer}
                                                </td>
                                                <td className="text-center text-xs text-[var(--color-hp-gray-600)]">
                                                    {task.due_date}
                                                </td>
                                                <td className="text-center">
                                                    <span className={`hp-chip ${
                                                        task.priority === 'urgent' ? 'hp-chip-danger' :
                                                        task.priority === 'high' ? 'hp-chip-warning' :
                                                        'hp-chip-gray'
                                                    }`}>
                                                        {t(task.priority)}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`hp-chip ${
                                                        task.status === 'done' || task.status === 'completed'
                                                            ? 'hp-chip-success'
                                                            : 'hp-chip-warning'
                                                    }`}>
                                                        {t((task.status || '').replace('_', ' '))}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 5: Staff Payments & Payouts */}
                    {activeTab === 'payments' && (
                        <div className="overflow-x-auto">
                            <table className="hp-table">
                                <thead>
                                    <tr>
                                        <th>{t('Field Agent')}</th>
                                        <th>{t('Amount')}</th>
                                        <th>{t('Payment Type')}</th>
                                        <th>{t('Month / Cycle')}</th>
                                        <th className="text-center">{t('Disbursement Date')}</th>
                                        <th className="text-center">{t('Status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-[var(--color-hp-gray-500)] text-xs">
                                                {t('No payment records logged for this company yet.')}
                                            </td>
                                        </tr>
                                    ) : (
                                        payments.map((p) => (
                                            <tr key={p.id}>
                                                <td className="font-semibold text-xs text-[var(--color-hp-dark)]">
                                                    {p.employee}
                                                </td>
                                                <td className="font-bold text-xs text-emerald-700">
                                                    ₹{Number(p.amount).toLocaleString()}
                                                </td>
                                                <td className="text-xs capitalize text-[var(--color-hp-gray-700)]">
                                                    {t(p.payment_type)}
                                                </td>
                                                <td className="text-xs text-[var(--color-hp-gray-600)]">
                                                    {p.month_year}
                                                </td>
                                                <td className="text-center text-xs text-[var(--color-hp-gray-600)]">
                                                    {p.payment_date || t('Pending')}
                                                </td>
                                                <td className="text-center">
                                                    <span className={`hp-chip ${p.status === 'paid' ? 'hp-chip-success' : 'hp-chip-warning'}`}>
                                                        {t(p.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </SuperadminLayout>
    );
}
