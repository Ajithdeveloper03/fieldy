import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Download, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from './AdminLayout';
import { withBase } from '../../basePath';
import useIndustry from '../../hooks/useIndustry';

const ratio = (count, total) => total ? `${count}/${total}` : '—';

function csvCell(value) {
    const text = String(value ?? '');
    const safeText = typeof value === 'string' && /^[\s\uFEFF]*[=+@-]|^[\t\r\n]/.test(text) ? "'" + text : text;
    return '"' + safeText.replaceAll('"', '""') + '"';
}

export default function EmployeePerformance({ employees = [], period = '' }) {
    const { t } = useTranslation();
    const { vocab } = useIndustry();
    const [search, setSearch] = useState('');
    const [region, setRegion] = useState('');
    const term = search.trim().toLowerCase();
    const regions = [...new Set(employees.map(employee => employee.region).filter(Boolean))].sort();
    const filtered = employees.filter(employee =>
        (!region || employee.region === region) &&
        [employee.name, employee.employee_code, employee.region].some(value => value?.toLowerCase().includes(term))
    );
    const columns = [
        [t(vocab.staff.singular), employee => employee.name],
        [t('Employee Code'), employee => employee.employee_code],
        [t('Assigned Sector'), employee => employee.region],
        [t('Tasks Completed'), employee => ratio(employee.tasks_done, employee.tasks_total)],
        [t('Tasks On Time'), employee => ratio(employee.tasks_on_time, employee.tasks_due)],
        [t('Visits Completed'), employee => ratio(employee.visits_done, employee.visits_total)],
        [t('Scheduled Visits On Date'), employee => ratio(employee.visits_on_time, employee.visits_scheduled)],
        [t('Check-ins'), employee => employee.check_ins],
        [t('Late Check-ins'), employee => employee.late_check_ins],
        [t('Check-outs'), employee => employee.check_outs],
        [t('Early Check-outs'), employee => employee.early_check_outs],
        [t('Missing Check-outs'), employee => employee.missing_check_outs],
        [t('Hours Worked'), employee => employee.hours_worked],
        [t('Client Rating'), employee => employee.rating],
        [t('Score / 100'), employee => employee.score],
    ];

    function exportReport() {
        const rows = [columns.map(([label]) => label), ...filtered.map(employee => columns.map(([, value]) => value(employee)))];
        const csv = rows.map(row => row.map(csvCell).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = `employee-performance-${period}.csv`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    return (
        <AdminLayout>
            <Head title={t('Employee Performance')} />
            <div className="space-y-6 pb-12 hp-animate-in">
                <section className="hp-card-gradient-slate rounded-3xl p-6 sm:p-8 border border-slate-200">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm text-hp-muted">{period}</p>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark">{t('Employee Performance')}</h1>
                            <p className="mt-2 text-sm text-hp-muted">
                                {t('Scores average the available rates for task completion, task deadlines and visit dates, completed visits, on-time check-ins, and proper check-outs.')}
                            </p>
                        </div>
                        <button className="hp-btn hp-btn-secondary" disabled={!filtered.length} onClick={exportReport}>
                            <Download className="w-4 h-4 mr-1" /> {t('Export CSV')}
                        </button>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-3">
                        <div className="hp-search-pill-bar w-full sm:max-w-sm">
                            <Search className="w-4 h-4 text-hp-muted shrink-0" />
                            <input
                                aria-label={t('Search employees')}
                                className="w-full bg-transparent text-sm outline-none"
                                placeholder={t('Search by name, code or area')}
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                            />
                        </div>
                        <select aria-label={t('Assigned Sector')} className="hp-pill" value={region} onChange={event => setRegion(event.target.value)}>
                            <option value="">{t('All Sectors')}</option>
                            {regions.map(value => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </div>
                </section>
                <section className="hp-bento-card !p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="hp-table min-w-max">
                            <thead>
                                <tr>
                                    {columns.map(([label]) => <th scope="col" key={label}>{label}</th>)}
                                    <th scope="col">{t('Action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(employee => (
                                    <tr key={employee.id}>
                                        {columns.map(([label, value]) => <td key={label}>{value(employee) ?? '—'}</td>)}
                                        <td>
                                            <Link href={withBase(`/admin/employees/${employee.id}`)} className="hp-btn hp-btn-sm hp-btn-outline">
                                                {t('Profile')} <ArrowUpRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {!filtered.length && (
                                    <tr>
                                        <td colSpan={columns.length + 1} className="text-center py-12 text-hp-muted">
                                            {t('No employees found for this view.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}
