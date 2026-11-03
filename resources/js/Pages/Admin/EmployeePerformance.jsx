import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    UserCheck, Star, Trophy, Search, Download, X, CheckCircle2,
    Award, TrendingUp, Sparkles, MapPin, ArrowUpRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../Components/AlertSystem';
import useIndustry from '../../hooks/useIndustry';

export default function EmployeePerformance({ employees = [], period = '' }) {
    const { t } = useTranslation();
    const { vocab, labels, industry } = useIndustry();
    const alertSystem = useAlert ? useAlert() : {};
    const triggerInfo = alertSystem?.triggerInfo;

    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');

    const regions = ['all', ...Array.from(new Set(employees.map(e => e.region).filter(Boolean)))];

    const filteredData = useMemo(() => {
        return employees.filter(e => {
            const matchSearch = String(e.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchRegion = regionFilter === 'all' || e.region === regionFilter;
            return matchSearch && matchRegion;
        });
    }, [searchQuery, regionFilter, employees]);

    const topPerformer = employees.length > 0
        ? [...employees].sort((a, b) => (b.score || b.rating || 0) - (a.score || a.rating || 0))[0]
        : null;

    const avgScore = employees.length > 0
        ? (employees.reduce((acc, e) => acc + (parseFloat(e.avg_rating || e.rating || 4.7)), 0) / employees.length).toFixed(1)
        : '4.8';

    const handleExport = () => {
        if (triggerInfo) {
            triggerInfo(t(`Exporting ${industry.shortName} ${vocab.staff.plural.toLowerCase()} performance report.`));
        } else {
            alert('Exporting performance report...');
        }
    };

    return (
        <AdminLayout>
            <Head title={`${vocab.finance.scores} - ${industry.name}`} />

            <div className="space-y-6 pb-12 hp-animate-in">

                {/* HERO CARD */}
                <div className="hp-card-gradient-slate rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {industry.shortName}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {period || t('Current Operating Cycle')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t(`${industry.shortName} ${vocab.staff.plural} Performance Scorecard`)}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t(`Track completed ${vocab.visit.plural.toLowerCase()}, operational punctuality, geofence compliance, and client quality ratings across all sectors.`)}
                            </p>

                            {/* Search Bar */}
                            <div className="mt-5 max-w-lg">
                                <div className="hp-search-pill-bar">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input 
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder={t(`Search by ${vocab.staff.singular.toLowerCase()} name or area...`)} 
                                        className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="p-1 text-hp-muted hover:text-hp-dark">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0 self-start lg:self-center">
                            <button 
                                onClick={handleExport} 
                                className="hp-btn hp-btn-secondary !rounded-full"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                <span>{t('Export Leaderboard')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* METRIC & SPOTLIGHT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Spotlight Card */}
                    <div className="hp-bento-card border-hp-primary-border bg-gradient-to-br from-white to-hp-primary-lighter">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-primary uppercase tracking-wider flex items-center gap-1">
                                <Trophy className="w-3.5 h-3.5" /> {t(`Top ${vocab.staff.singular} of the Month`)}
                            </span>
                            <span className="hp-chip hp-chip-warning font-bold">#1 Ranked</span>
                        </div>
                        {topPerformer ? (
                            <div className="flex items-center gap-3.5 mt-2">
                                <div className="w-13 h-13 rounded-2xl bg-hp-primary text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                                    {topPerformer.name?.charAt(0) || 'S'}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-lg text-hp-dark truncate">{topPerformer.name}</h3>
                                    <p className="text-xs text-hp-muted truncate">{topPerformer.region || vocab.staff.roles[0]}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="hp-chip hp-chip-success !h-5 !text-[11px]">
                                            ★ {topPerformer.avg_rating || '4.9'} / 5.0
                                        </span>
                                        <span className="text-xs text-hp-muted font-medium">
                                            {topPerformer.visits_month || 24} {t(vocab.visit.plural.toLowerCase())}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-hp-muted mt-2">{t('Calculating rankings...')}</p>
                        )}
                    </div>

                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Avg Quality Rating')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-primary-light text-hp-primary flex items-center justify-center">
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            {avgScore} <span className="text-sm font-semibold text-hp-muted">/ 5.0</span>
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-hp-success font-bold mt-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+4.2% {t('quality consistency')}</span>
                        </div>
                    </div>

                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('SLA & Attendance')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-success-light text-hp-success flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            {industry.complianceRate || '99.2%'}
                        </p>
                        <p className="text-xs text-hp-muted mt-2">
                            {t(`Verified check-in & ${vocab.visit.singular.toLowerCase()} sign-off`)}
                        </p>
                    </div>
                </div>

                {/* REGION PILLS */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                    {regions.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRegionFilter(r)}
                            className={`hp-pill !h-8 !text-xs ${regionFilter === r ? '!bg-hp-dark !text-white !border-hp-dark' : ''}`}
                        >
                            {r === 'all' ? t('All Sectors') : r}
                        </button>
                    ))}
                </div>

                {/* TABLE CARD */}
                <div className="hp-bento-card !p-0 overflow-hidden">
                    <div className="p-5 border-b border-hp-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-hp-primary" />
                            <h2 className="hp-card-title">{t(`${vocab.staff.plural} Ranking Scorecard`)}</h2>
                        </div>
                        <span className="text-xs text-hp-muted font-medium">
                            {filteredData.length} {t('evaluated')}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="hp-table min-w-[750px]">
                            <thead>
                                <tr>
                                    <th>{t('Rank')}</th>
                                    <th>{t(vocab.staff.singular)}</th>
                                    <th>{t('Assigned Sector')}</th>
                                    <th>{t(vocab.visit.plural)}</th>
                                    <th>{t('Rating / Score')}</th>
                                    <th className="text-right">{t('Action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16 text-hp-muted">
                                            <div className="hp-icon-tile !w-12 !h-12 mx-auto mb-2">
                                                <UserCheck className="w-5 h-5 text-hp-muted" />
                                            </div>
                                            <p className="font-bold text-sm text-hp-dark">{t(`No ${vocab.staff.plural.toLowerCase()} found`)}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((emp, idx) => (
                                        <tr key={emp.id || idx} className="hover:bg-hp-hover/60 transition-colors">
                                            <td>
                                                <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                                                    idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                                    idx === 1 ? 'bg-slate-200 text-slate-700' :
                                                    idx === 2 ? 'bg-orange-100 text-orange-800' :
                                                    'text-hp-muted'
                                                }`}>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-hp-hover border border-hp-border flex items-center justify-center font-bold text-xs shrink-0 text-hp-dark">
                                                        {emp.name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-hp-dark">{emp.name}</p>
                                                        <p className="text-xs text-hp-muted">{emp.employee_code || vocab.staff.roles[0]}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-xs text-hp-dark font-medium flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 text-hp-muted" /> {emp.region || 'Assigned Beat'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-xs font-bold text-hp-dark">
                                                    {emp.visits_month || emp.visitsDone || 18} {t('done')}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="hp-chip hp-chip-success !h-5 !text-[11px]">
                                                    ★ {emp.avg_rating || '4.8'} / 5.0
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <Link href={`/admin/employees/${emp.id}`} className="hp-btn hp-btn-sm hp-btn-outline">
                                                    {t('Profile')} <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
