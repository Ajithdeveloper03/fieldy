import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SuperadminLayout from './SuperadminLayout';
import { 
    Users, Search, Filter, Building2, 
    MapPin, CheckCircle2, Clock, Smartphone,
    ChevronRight, Shield, ShieldCheck, Activity,
    Home
} from 'lucide-react';

export default function EmployeesMonitor({ employees, companies = [], filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedCompany, setSelectedCompany] = useState(filters.company_id || '');

    const handleFilterChange = (compId, searchQuery) => {
        router.get('/superadmin/employees', {
            company_id: compId || undefined,
            search: searchQuery || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const employeeList = employees?.data || [];

    return (
        <SuperadminLayout>
            <Head title="Cross-Company Employee Tracking & Analytics - Fieldy" />

            <div className="space-y-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/superadmin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Superadmin</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">Cross-Company Workforce</span>
                </div>

                {/* Hostinger hPanel Header */}
                <div className="pb-2 border-b border-[var(--color-hp-border)]">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                        Cross-Company Workforce Intelligence
                    </h1>
                    <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                        Monitor active field staff, live GPS sessions, and daily operational milestones across all client companies.
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="hp-card p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
                        {/* Search */}
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)]" />
                            <input
                                type="text"
                                placeholder="Search employee name, phone..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    handleFilterChange(selectedCompany, e.target.value);
                                }}
                                className="hp-input pl-9"
                            />
                        </div>

                        {/* Company Dropdown filter */}
                        <div className="relative w-full sm:max-w-xs">
                            <select
                                value={selectedCompany}
                                onChange={(e) => {
                                    setSelectedCompany(e.target.value);
                                    handleFilterChange(e.target.value, search);
                                }}
                                className="hp-input pr-8"
                            >
                                <option value="">All Client Companies</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-xs text-[var(--color-hp-gray-600)] font-medium self-end sm:self-auto">
                        Showing <span className="font-bold text-[var(--color-hp-dark)]">{employeeList.length}</span> Field Agents
                    </div>
                </div>

                {/* Table */}
                <div className="hp-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="hp-table">
                            <thead>
                                <tr>
                                    <th>Field Agent</th>
                                    <th>Client Company</th>
                                    <th>Role / Designation</th>
                                    <th className="text-center">Attendance Today</th>
                                    <th className="text-center">Live Tracking</th>
                                    <th className="text-center">Visits Today</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-[var(--color-hp-gray-500)] text-xs">
                                            No field employees found for this query.
                                        </td>
                                    </tr>
                                ) : (
                                    employeeList.map((emp) => (
                                        <tr key={emp.id}>
                                            {/* Employee */}
                                            <td>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-full bg-[var(--color-hp-gray-100)] border border-[var(--color-hp-border)] flex items-center justify-center font-bold text-xs text-[var(--color-hp-dark)]">
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-xs text-[var(--color-hp-dark)]">{emp.name}</p>
                                                        <p className="text-[11px] text-[var(--color-hp-gray-500)]">{emp.phone}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Company */}
                                            <td>
                                                {emp.company ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Building2 className="w-3.5 h-3.5 text-[var(--color-hp-primary)] shrink-0" />
                                                        <span className="font-medium text-xs text-[var(--color-hp-dark)] truncate">{emp.company.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[var(--color-hp-gray-500)] text-xs">Unassigned</span>
                                                )}
                                            </td>

                                            {/* Role / Region */}
                                            <td>
                                                <p className="font-medium text-xs text-[var(--color-hp-dark)] capitalize">{(emp.designation || '').replace('_', ' ')}</p>
                                                <p className="text-[11px] text-[var(--color-hp-gray-500)]">{emp.assigned_region}</p>
                                            </td>

                                            {/* Attendance */}
                                            <td className="text-center">
                                                {emp.isCheckedInToday ? (
                                                    <span className="hp-chip hp-chip-success inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>In at {emp.checkInTime}</span>
                                                    </span>
                                                ) : (
                                                    <span className="hp-chip hp-chip-gray">
                                                        Not Checked In
                                                    </span>
                                                )}
                                            </td>

                                            {/* Tracking */}
                                            <td className="text-center">
                                                {emp.isTrackingActive ? (
                                                    <span className="hp-chip hp-chip-success inline-flex items-center gap-1 font-semibold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <span>GPS Active</span>
                                                    </span>
                                                ) : (
                                                    <span className="hp-chip hp-chip-gray">
                                                        Idle / Off
                                                    </span>
                                                )}
                                            </td>

                                            {/* Visits */}
                                            <td className="text-center">
                                                <span className="text-xs font-bold text-[var(--color-hp-dark)] bg-[var(--color-hp-gray-100)] px-2.5 py-0.5 rounded">
                                                    {emp.visitsToday}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </SuperadminLayout>
    );
}
