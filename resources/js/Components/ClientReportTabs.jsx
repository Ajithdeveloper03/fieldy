import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Building2, ClipboardList, MapPin, Users, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { withBase } from '../basePath';

const tabs = [
    { key: 'employees', label: 'Field Workforce (Mobile Apps)', icon: Users },
    { key: 'visits', label: 'Field Audits & Visits', icon: MapPin },
    { key: 'sites', label: 'Registered Clients / Facilities', icon: Building2 },
    { key: 'tasks', label: 'Tasks & Work Orders', icon: ClipboardList },
    { key: 'payments', label: 'Staff Payments & Payouts', icon: Wallet },
];

export default function ClientReportTabs({ data, title }) {
    const { t } = useTranslation();
    const [active, setActive] = useState('employees');
    if (!data) return null;

    const inspect = worker => withBase(`/admin/visits?employee_id=${worker.id}&date=${encodeURIComponent(data.date)}`);
    const columns = {
        employees: [
            ['Field Officer', worker => (
                <div className="flex items-center gap-2">
                    <span className="hp-icon-tile !h-8 !w-8 shrink-0">{worker.name?.[0]?.toUpperCase()}</span>
                    <div><Link className="font-bold text-hp-primary" href={inspect(worker)}>{worker.name}</Link><p className="text-xs text-hp-muted">{[worker.phone, worker.code].filter(Boolean).join(' · ')}</p></div>
                </div>
            )],
            ['Designation & Region', worker => <>{worker.designation || '—'}<p className="text-xs text-hp-muted">{worker.region}</p></>],
            ['Shift Attendance', worker => (
                <>
                    <span className={`hp-chip ${worker.check_in && !worker.check_out ? 'hp-chip-success' : 'hp-chip-gray'}`}>
                        {t(worker.check_out ? 'Checked Out' : worker.check_in ? 'Checked In' : 'No Check-in')}
                    </span>
                    {(worker.check_in || worker.check_out) && <p className="text-xs text-hp-muted">{[worker.check_in, worker.check_out].filter(Boolean).join(' → ')}</p>}
                </>
            )],
            ['Live GPS Stream', worker => <span className={`hp-chip ${worker.tracking ? 'hp-chip-success' : 'hp-chip-gray'}`}>{t(worker.tracking ? 'Active Route' : 'Inactive')}</span>],
            ['Coordinates', worker => worker.latitude != null && worker.longitude != null
                ? <><span className="font-mono">{Number(worker.latitude).toFixed(4)}, {Number(worker.longitude).toFixed(4)}</span><p className="text-xs text-hp-muted">{worker.ping_time}</p></>
                : '—'],
            ['Visits (Day / Lifetime)', worker => (
                <div className="flex flex-wrap items-center gap-2">
                    <span>{worker.day_visits} / {worker.lifetime_visits}</span>
                    <Link href={inspect(worker)} className="hp-btn hp-btn-sm hp-btn-outline">{t('Inspect')}</Link>
                </div>
            )],
        ],
        visits: [
            ['Project Site', row => <Link className="font-semibold text-hp-primary" href={withBase(`/admin/visits/${row.id}`)}>{row.site || t('Open Report')}</Link>],
            ['Employee', 'employee'], ['Check-in', 'check_in'], ['Check-out', 'check_out'],
        ],
        sites: [['Project Site', 'name'], ['Site Code', 'code'], ['Region', 'region'], ['Status', 'status']],
        tasks: [['Work Order', 'title'], ['Employee', 'employee'], ['Status', 'status'], ['Due Date', 'due']],
        payments: [['Employee', 'employee'], ['Amount', 'amount'], ['Status', 'status'], ['Payment Date', 'date']],
    }[active];
    const rows = data[active] || [];

    return (
        <section className="hp-card overflow-hidden mb-6">
            <div className="hp-card-header flex-wrap">
                <h2 className="hp-card-title">{title}</h2>
                <span className="text-xs text-hp-muted">{data.date} · IST</span>
            </div>
            <div className="flex overflow-x-auto border-b border-hp-border" aria-label={title}>
                {tabs.map(({ key, label, icon: Icon }) => (
                    <button key={key} type="button" onClick={() => setActive(key)} aria-pressed={active === key}
                        className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold ${active === key ? 'border-hp-primary text-hp-primary' : 'border-transparent text-hp-muted'}`}>
                        <Icon className="h-4 w-4" aria-hidden="true" /> {t(label)}
                        <span className="hp-chip hp-chip-gray !h-5">{data.counts?.[key] ?? 0}</span>
                    </button>
                ))}
            </div>
            <div className="overflow-x-auto">
                <table className="hp-table min-w-[640px]">
                    <thead><tr>{columns.map(([label]) => <th key={label} scope="col">{t(label)}</th>)}</tr></thead>
                    <tbody>
                        {rows.map(row => (
                            <tr key={row.id}>
                                {columns.map(([label, value]) => <td key={label}>{(typeof value === 'function' ? value(row) : row[value]) ?? '—'}</td>)}
                            </tr>
                        ))}
                        {!rows.length && <tr><td colSpan={columns.length} className="py-8 text-center text-hp-muted">{t('No records found.')}</td></tr>}
                    </tbody>
                </table>
            </div>
            {(data.counts?.[active] ?? 0) > rows.length && (
                <p className="border-t border-hp-border px-4 py-2 text-xs text-hp-muted">{rows.length} / {data.counts[active]}</p>
            )}
        </section>
    );
}
