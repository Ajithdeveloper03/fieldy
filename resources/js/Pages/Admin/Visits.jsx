import React, { useState } from 'react';
import { asset, withBase } from '../../basePath';
import AdminLayout from './AdminLayout';
import { router, Link } from '@inertiajs/react';
import {
    MapPin, CheckCircle2, Search, X,
    BarChart3, ShieldCheck,
    Navigation, Sparkles, FileText, ArrowRight,
    Calendar, LayoutGrid, ListFilter, ArrowUpRight,
    Download, Film
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import CardPhotoBackdrop from '../../Components/CardPhotoBackdrop';
import ClientReportTabs from '../../Components/ClientReportTabs';
import useIndustry from '../../hooks/useIndustry';

export default function Visits({ visits = {}, employees = [], filters = {}, analytics = {}, reportTabs }) {
    const { t } = useTranslation();
    const { vocab, labels, industry } = useIndustry();
    const isConstruction = industry.id === 'construction';

    const [activeTab, setActiveTab] = useState('records');
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [dateRange, setDateRange] = useState(filters.days || '30');
    const [reportDate, setReportDate] = useState(filters.date || '');
    const [employeeId, setEmployeeId] = useState(filters.employee_id ?? '');

    const visitsData = visits.data || [];
    const totalVisits = visits.total ?? visitsData.length;
    const avgDistance = Number(analytics.avgDistance || 0).toFixed(1);
    const completed = analytics.completed ?? 0;
    const dailyPeak = Math.max(1, ...(analytics.days || []).map(day => day.count));

    const handleApplyFilters = (changes = {}) => {
        router.get(withBase('/admin/visits'), {
            industry: industry.id, search: searchQuery, days: dateRange, date: reportDate,
            employee_id: employeeId, ...changes,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const dateRangeOptions = [
        { labelKey: 'Last 7 Days', value: '7' },
        { labelKey: 'Last 30 Days', value: '30' },
        { labelKey: 'Last 3 Months', value: '90' },
        { labelKey: 'All Time', value: 'all' }
    ];

    const getCoverImage = (id) => {
        if (isConstruction) {
            const scene = (((Number(id) || 1) - 1) % 4) + 1;
            return asset(`/images/construction-site-${scene}.svg`);
        }

        return asset(`/images/image${((Number(id) || 1) % 12) + 1}.jpg`);
    };

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">

                {/* HERO CARD */}
                <div className="hp-card-gradient-slate relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
                    <CardPhotoBackdrop photoKey={industry.id} variant="right" opacity={0.28} />
                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {industry.shortName}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {totalVisits} {t(labels.navVisits || vocab.visit.plural)}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t(labels.recentVisitsTitle || `${vocab.visit.plural} Logs`)}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {isConstruction
                                    ? t('Track structural inspections, concrete tests, safety audits, and site engineer visits.')
                                    : t('Track verified {{visits}}, check-in timestamps, location arrivals, and {{staff}} routes.', { visits: vocab.visit.plural.toLowerCase(), staff: vocab.staff.singular.toLowerCase() })}
                            </p>

                            {/* Search Bar */}
                            <form 
                                onSubmit={(e) => { e.preventDefault(); handleApplyFilters(); }}
                                className="mt-5 max-w-lg"
                            >
                                <div className="hp-search-pill-bar !bg-white !shadow-xs">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('Search by {{entity}}, {{staff}} name, or notes...', { entity: vocab.entity.singular.toLowerCase(), staff: vocab.staff.singular.toLowerCase() })}
                                        className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                    />
                                    {searchQuery && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setSearchQuery(''); handleApplyFilters({ search: '' }); }}
                                            className="p-1 text-hp-muted hover:text-hp-dark"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button 
                                        type="submit"
                                        className="w-7 h-7 rounded-full bg-hp-primary text-white flex items-center justify-center hover:bg-hp-primary-hover shrink-0"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Mode & Dispatch Actions */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 self-start lg:self-center">
                            <div className="hp-segmented-bar self-start sm:self-auto">
                                <button
                                    onClick={() => setActiveTab('records')}
                                    className={`hp-segmented-item ${activeTab === 'records' ? 'is-active-primary' : ''}`}
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>{t(labels.navVisits || vocab.visit.plural)}</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('analytics')}
                                    className={`hp-segmented-item ${activeTab === 'analytics' ? 'is-active-primary' : ''}`}
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span>{t('Analytics')}</span>
                                </button>
                            </div>

                            <button 
                                onClick={() => router.visit(`/admin/tasks?industry=${industry.id}`)}
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                <span>{t(vocab.task.newLabel)}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* METRIC CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card relative overflow-hidden">
                        <CardPhotoBackdrop photoKey="engineer" variant="corner" opacity={0.24} />
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total {{visits}}', { visits: vocab.visit.plural })}</span>
                                <span className="hp-chip hp-chip-primary !h-5 !text-[11px]">{reportDate || t(dateRange === 'all' ? 'All Time' : `${dateRange}d`)}</span>
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{totalVisits}</div>
                            <p className="text-xs text-hp-success font-medium mt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> {completed} {t('Completed')}
                            </p>
                        </div>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t(isConstruction ? 'Avg Travel Between Sites' : 'Avg Transit Distance')}</span>
                            <Navigation className="w-3.5 h-3.5 text-hp-primary" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{avgDistance} <span className="text-sm font-semibold text-hp-muted">km</span></div>
                        <p className="text-xs text-hp-muted mt-1">{t(isConstruction ? 'Between project sites' : `Between ${vocab.entity.plural.toLowerCase()}`)}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Completion Rate')}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-hp-success" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-success">{totalVisits > 0 ? Math.round(completed * 100 / totalVisits) : 0}%</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Visits with a recorded check-out')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Active {{staffPlural}}', { staffPlural: vocab.staff.plural })}</span>
                            <span className="w-2 h-2 rounded-full bg-hp-success animate-ping"></span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{employees.length}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('On field duty')}</p>
                    </div>
                </div>

                {/* DATE RANGE & VIEW TOGGLES */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mr-1">{t('Cycle')}:</span>
                        {dateRangeOptions.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => { setDateRange(opt.value); setReportDate(''); handleApplyFilters({ days: opt.value, date: '' }); }}
                                className={`hp-pill !h-8 !text-xs ${!reportDate && dateRange === opt.value ? '!bg-hp-dark !text-white !border-hp-dark' : ''}`}
                            >
                                {t(opt.labelKey)}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <label className="text-xs text-hp-muted">
                            {t('Report Date (IST)')}
                            <input type="date" className="hp-input mt-1" value={reportDate} onChange={event => {
                                setReportDate(event.target.value);
                                handleApplyFilters({ date: event.target.value });
                            }} />
                        </label>
                        <label className="text-xs text-hp-muted">
                            {t('Employee')}
                            <select className="hp-input mt-1" value={employeeId} onChange={event => {
                                setEmployeeId(event.target.value);
                                handleApplyFilters({ employee_id: event.target.value });
                            }}>
                                <option value="">{t('All Employees')}</option>
                                {employees.map(employee => <option key={employee.id} value={employee.id}>{employee.name}</option>)}
                            </select>
                        </label>
                    </div>

                    {activeTab === 'records' && (
                        <div className="flex items-center bg-hp-hover border border-hp-border rounded-lg p-0.5 self-start sm:self-auto">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                                title={t('Grid View')}
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                                title={t('Table View')}
                            >
                                <ListFilter className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* TAB CONTENT: RECORDS */}
                {activeTab === 'records' && (
                    <>
                        {visitsData.length === 0 ? (
                            <div className="hp-bento-card text-center py-20">
                                <div className="hp-icon-tile !w-14 !h-14 mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-hp-muted" />
                                </div>
                                <h3 className="text-base font-bold text-hp-dark">{t('No {{visits}} found', { visits: vocab.visit.plural.toLowerCase() })}</h3>
                                <p className="text-xs text-hp-muted mt-1 max-w-sm mx-auto">
                                    {t('Try adjusting your search terms or expanding the cycle date range.')}
                                </p>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {visitsData.map((visit) => (
                                    <div 
                                        key={visit.id}
                                        className="hp-bento-card group flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="hp-card-visual h-44 mb-4 flex items-center justify-center relative">
                                                <img 
                                                    src={visit.media?.find((m) => m.category === 'image')?.preview_url || getCoverImage(visit.id)} 
                                                    alt={vocab.entity.singular}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                                <div className="absolute inset-0 bg-black/35" />
                                                
                                                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                                    <span className="hp-chip hp-chip-success !bg-white/90 !text-hp-success backdrop-blur-sm">
                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> {t(visit.check_out_time ? 'Completed' : 'Open')}
                                                    </span>
                                                    {Array.isArray(visit.media) && visit.media.length > 0 && (
                                                        <span className="hp-chip !bg-slate-950/75 !text-white backdrop-blur-sm">
                                                            <Film className="w-3 h-3 mr-1" /> {visit.media.length}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="absolute bottom-3 left-3 right-3 text-white">
                                                    <p className="text-xs text-white/80 flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" /> {visit.date || '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-bold text-base text-hp-dark group-hover:text-hp-primary transition-colors line-clamp-1">
                                                        {visit.farmer?.user?.name || visit.farmer_name || `${vocab.entity.singular} #${visit.id}`}
                                                    </h3>
                                                    <span className="hp-chip hp-chip-gray shrink-0 font-mono text-[11px]">
                                                        {visit.farmer?.farmer_code || `ID-${visit.id}`}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-hp-muted flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-hp-muted shrink-0" />
                                                    <span className="truncate">{visit.farmer?.village || (isConstruction ? 'Project Site' : 'Designated Beat')}</span>
                                                </p>

                                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-hp-hover border border-hp-border mt-3">
                                                    <div className="w-7 h-7 rounded-lg bg-hp-primary text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                        {(visit.employee?.name || 'S').charAt(0)}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-bold text-hp-dark truncate">{visit.employee?.name || vocab.staff.singular}</p>
                                                        <p className="text-[11px] text-hp-muted truncate">{visit.distance_from_previous_farmer_km || '1.8'} km {t(isConstruction ? 'between sites' : 'transit')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-3 border-t border-hp-border flex items-center gap-2">
                                            <Link 
                                                href={`/admin/visits/${visit.id}?industry=${industry.id}`}
                                                className="hp-btn hp-btn-outline flex-1 !rounded-xl !h-10 text-sm font-semibold"
                                            >
                                                <span>{t('View {{visit}} Report', { visit: vocab.visit.singular })}</span>
                                                <ArrowUpRight className="w-4 h-4 ml-1" />
                                            </Link>
                                            {!visit.is_sample && visit.dossier_url && (
                                                <a
                                                    href={visit.dossier_url}
                                                    download={`fieldy-visit-report-${visit.id}.html`}
                                                    className="hp-btn hp-btn-primary !rounded-xl !h-10 !px-3"
                                                    title={t('Download Dossier')}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hp-bento-card !p-0 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="hp-table min-w-[750px]">
                                        <thead>
                                            <tr>
                                                <th>{t(vocab.entity.singular)}</th>
                                                <th>{t(vocab.staff.singular)}</th>
                                                <th>{t('Date & Time')}</th>
                                                <th>{t(isConstruction ? 'Travel Distance' : 'Transit')}</th>
                                                <th>{t('Status')}</th>
                                                <th className="text-right">{t('Action')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visitsData.map((visit) => (
                                                <tr key={visit.id} className="hover:bg-hp-hover/60 transition-colors">
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-hp-hover border border-hp-border overflow-hidden shrink-0">
                                                                <img src={getCoverImage(visit.id)} alt="" className="w-full h-full object-cover" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-sm text-hp-dark">
                                                                    {visit.farmer?.user?.name || visit.farmer_name || vocab.entity.singular}
                                                                </p>
                                                                <p className="text-xs text-hp-muted">{visit.farmer?.village || (isConstruction ? 'Project Site' : 'Verified Site')}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <p className="font-bold text-sm text-hp-dark">{visit.employee?.name || vocab.staff.singular}</p>
                                                    </td>
                                                    <td>
                                                        <p className="text-xs font-semibold text-hp-dark">{visit.date}</p>
                                                        <p className="text-xs text-hp-muted">{t('Check-out')}: {visit.check_out_time || '—'}</p>
                                                    </td>
                                                    <td>
                                                        <span className="font-semibold text-xs text-hp-dark">
                                                            {visit.distance_from_previous_farmer_km || '0'} km
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="hp-chip hp-chip-success hp-chip-dot">
                                                            {t(visit.check_out_time ? 'Completed' : 'Open')}
                                                        </span>
                                                    </td>
                                                    <td className="text-right">
                                                        <Link
                                                            href={`/admin/visits/${visit.id}?industry=${industry.id}`}
                                                            className="hp-btn hp-btn-sm hp-btn-outline"
                                                        >
                                                            {t('Details')} <ArrowUpRight className="w-3.5 h-3.5" />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'records' && visits.last_page > 1 && (
                    <nav className="flex items-center justify-between gap-3" aria-label={t('Report Pages')}>
                        <span className="text-sm text-hp-muted">{visits.from}–{visits.to} / {visits.total}</span>
                        <div className="flex gap-2">
                            {visits.prev_page_url && <Link preserveScroll className="hp-btn hp-btn-sm hp-btn-outline" href={withBase(visits.prev_page_url)}>{t('Previous')}</Link>}
                            {visits.next_page_url && <Link preserveScroll className="hp-btn hp-btn-sm hp-btn-outline" href={withBase(visits.next_page_url)}>{t('Next')}</Link>}
                        </div>
                    </nav>
                )}

                {activeTab === 'analytics' && (
                    <>
                        <div className="grid gap-5 lg:grid-cols-2">
                            <section className="hp-bento-card">
                                <h2 className="hp-card-title mb-4">{t(reportDate ? 'Visits on Selected Date' : 'Visits in the Last 7 Days')}</h2>
                                <div className="space-y-3">
                                    {(analytics.days || []).map(day => (
                                        <div key={day.date} className="grid grid-cols-[4rem_1fr_2rem] items-center gap-3 text-sm">
                                            <span>{day.label}</span>
                                            <div className="h-2 rounded-full bg-hp-hover"><div className="h-full rounded-full bg-hp-primary" style={{ width: `${day.count * 100 / dailyPeak}%` }} /></div>
                                            <span className="text-right font-semibold">{day.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section className="hp-bento-card">
                                <h2 className="hp-card-title mb-4">{t('Visits by Employee')}</h2>
                                {(analytics.officers || []).map(officer => (
                                    <div key={officer.id} className="flex items-center justify-between border-b border-hp-border py-2 text-sm">
                                        <span>{officer.name || t('Employee')}</span><span className="font-semibold">{officer.count}</span>
                                    </div>
                                ))}
                                {!analytics.officers?.length && <p className="text-sm text-hp-muted">{t('No records found.')}</p>}
                            </section>
                        </div>
                        <ClientReportTabs data={reportTabs} title={t(labels.recentVisitsTitle || 'Recent Site Visits & Reports')} />
                    </>
                )}

            </div>
        </AdminLayout>
    );
}
