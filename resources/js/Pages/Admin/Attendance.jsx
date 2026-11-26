import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import AdminLayout from './AdminLayout';
import { withBase } from '../../basePath';

const timestampFormat = new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
});
const formatTimestamp = value => value ? timestampFormat.format(new Date(value)) : '—';

export default function Attendance({ logs, employees, filters }) {
    const { t } = useTranslation();
    const path = withBase('/admin/attendance');
    const { data, setData, get, processing, errors } = useForm({
        employee_id: filters.employee_id ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
    });

    function applyFilters(event) {
        event.preventDefault();
        get(path, { preserveScroll: true, replace: true });
    }

    return (
        <AdminLayout>
            <Head title={t('Attendance History')} />
            <div className="space-y-5">
                <div className="hp-bento-card space-y-4">
                    <div>
                        <h1 className="text-2xl font-bold text-hp-dark">{t('Attendance History')}</h1>
                        <p className="text-sm text-hp-muted">{t('Check-in and check-out times in IST')}</p>
                    </div>
                    <form onSubmit={applyFilters} className="flex flex-wrap items-end gap-3">
                        <label className="min-w-48 text-xs font-semibold text-hp-dark">
                            {t('Employee')}
                            <select className="hp-input mt-1" value={data.employee_id} onChange={event => setData('employee_id', event.target.value)}>
                                <option value="">{t('All Employees')}</option>
                                {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                            </select>
                        </label>
                        <label className="text-xs font-semibold text-hp-dark">
                            {t('From Date')}
                            <input type="date" className="hp-input mt-1" value={data.from} onChange={event => setData('from', event.target.value)} />
                        </label>
                        <label className="text-xs font-semibold text-hp-dark">
                            {t('To Date')}
                            <input type="date" className="hp-input mt-1" min={data.from || undefined} value={data.to} onChange={event => setData('to', event.target.value)} />
                        </label>
                        <button type="submit" className="hp-btn hp-btn-primary" disabled={processing}>{t('Filter')}</button>
                        <Link href={path} className="hp-btn hp-btn-secondary">{t('Clear')}</Link>
                    </form>
                    {Object.values(errors).map(error => <p key={error} className="text-sm text-hp-danger">{error}</p>)}
                </div>
                <div className="hp-bento-card !p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="hp-table min-w-[720px]">
                            <thead>
                                <tr>
                                    {['Employee', 'Attendance Date', 'Check-in', 'Check-out', 'Status'].map(label =>
                                        <th key={label} scope="col">{t(label)}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {logs.data.map(log => (
                                    <tr key={log.id}>
                                        <td>
                                            <p className="font-semibold">{log.name}{log.archived ? ` (${t('Removed')})` : ''}</p>
                                            {log.code && <p className="text-xs text-hp-muted">{log.code}</p>}
                                        </td>
                                        <td>{log.date}</td>
                                        <td>{formatTimestamp(log.check_in)}</td>
                                        <td>{log.check_in && !log.check_out ? t('Not recorded') : formatTimestamp(log.check_out)}</td>
                                        <td>{log.status ? t(log.status.replaceAll('_', ' ')) : '—'}</td>
                                    </tr>
                                ))}
                                {!logs.data.length && <tr><td colSpan={5} className="text-center py-12 text-hp-muted">{t('No attendance records found.')}</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    {logs.last_page > 1 && (
                        <nav className="flex items-center justify-between gap-3 border-t border-hp-border p-4" aria-label={t('Attendance pages')}>
                            <span className="text-sm text-hp-muted">{logs.from}–{logs.to} / {logs.total}</span>
                            <div className="flex gap-2">
                                {logs.prev_page_url && <Link className="hp-btn hp-btn-sm hp-btn-outline" href={withBase(logs.prev_page_url)}>{t('Previous')}</Link>}
                                {logs.next_page_url && <Link className="hp-btn hp-btn-sm hp-btn-outline" href={withBase(logs.next_page_url)}>{t('Next')}</Link>}
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
