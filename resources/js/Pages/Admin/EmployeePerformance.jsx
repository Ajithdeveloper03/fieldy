import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    UserCheck, Star, Trophy, Search, Filter, ChevronDown, Download, X, CheckCircle2,
    Home, ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../Components/AlertSystem';

export default function EmployeePerformance({ employees = [], period = '' }) {
    const { t } = useTranslation();
    const alertSystem = useAlert ? useAlert() : {};
    const triggerInfo = alertSystem?.triggerInfo;

    const [searchQuery, setSearchQuery] = useState('');
    const [regionFilter, setRegionFilter] = useState('all');
    const [showRegionDropdown, setShowRegionDropdown] = useState(false);

    const regions = ['all', ...Array.from(new Set(employees.map(e => e.region).filter(Boolean)))];

    const filteredData = useMemo(() => {
        return employees.filter(e => {
            const matchSearch = String(e.name || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchRegion = regionFilter === 'all' || e.region === regionFilter;
            return matchSearch && matchRegion;
        });
    }, [searchQuery, regionFilter, employees]);

    const handleExport = () => {
        if (triggerInfo) {
            triggerInfo(t('Exporting performance report. Download will begin shortly.'));
        } else {
            alert('Exporting performance report...');
        }
    };

    return (
        <AdminLayout>
            <Head title="Performance Analytics - Fieldy Admin" />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/admin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Home</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">Performance Analytics</span>
                </div>

                {/* Hostinger hPanel Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-hp-border)]">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {t('Performance Analytics')}
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                            {t('Monthly performance scoring for')} {period || 'Current Cycle'}
                        </p>
                    </div>
                    <button 
                        onClick={handleExport} 
                        className="hp-btn hp-btn-secondary inline-flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>{t('Export Report')}</span>
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="hp-card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-hp-gray-500)]" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('Search by officer name...')} 
                            className="hp-input pl-9 pr-8"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')} 
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] p-0.5"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="flex w-full md:w-auto gap-2">
                        <div className="relative">
                            <button 
                                onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                                className={`hp-btn hp-btn-secondary inline-flex items-center gap-2 ${
                                    regionFilter !== 'all' ? 'border-[var(--color-hp-primary)] text-[var(--color-hp-primary)]' : ''
                                }`}
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>{regionFilter === 'all' ? t('All Regions') : regionFilter}</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            {showRegionDropdown && (
                                <div className="absolute top-full mt-1 right-0 min-w-[150px] bg-white border border-[var(--color-hp-border)] rounded-lg shadow-lg z-30 py-1 overflow-hidden">
                                    {regions.map(r => (
                                        <button 
                                            key={r} 
                                            onClick={() => { setRegionFilter(r); setShowRegionDropdown(false); }}
                                            className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[var(--color-hp-gray-100)] transition-colors ${
                                                regionFilter === r ? 'text-[var(--color-hp-primary)] bg-[var(--color-hp-primary-light)]' : 'text-[var(--color-hp-dark)]'
                                            }`}
                                        >
                                            {r === 'all' ? t('All Regions') : r}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                    {/* Performance Leaderboard */}
                    <div className="col-span-1 lg:col-span-2 hp-card overflow-hidden">
                        <div className="hp-card-header flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[var(--color-hp-primary)]" />
                                <h2 className="hp-card-title">{t('Performance Leaderboard')}</h2>
                            </div>
                            <span className="text-xs font-semibold text-[var(--color-hp-gray-500)]">
                                {filteredData.length} Officers
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="hp-table">
                                <thead>
                                    <tr>
                                        <th>{t('Officer Name')}</th>
                                        <th className="text-center">{t('Visits (Month)')}</th>
                                        <th className="text-center">{t('Attendance')}</th>
                                        <th className="text-right">{t('Total Score')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-[var(--color-hp-gray-500)] text-xs">
                                                {t('No officers match your search.')}
                                            </td>
                                        </tr>
                                    )}
                                    {filteredData.map((e, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="font-semibold text-xs text-[var(--color-hp-dark)]">{e.name}</div>
                                                <div className="text-[11px] text-[var(--color-hp-gray-500)] mt-0.5 font-mono">{e.employee_code}</div>
                                            </td>
                                            <td className="text-center text-xs text-[var(--color-hp-gray-700)]">
                                                {e.visits_month} / {e.target_visits}
                                            </td>
                                            <td className="text-center text-xs text-[var(--color-hp-gray-700)]">
                                                {e.attendance_rate}%
                                            </td>
                                            <td className="text-right">
                                                <span className="hp-chip hp-chip-success font-bold">
                                                    {e.score} {t('pts')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Behavior Matrix */}
                    <div className="col-span-1 hp-card overflow-hidden">
                        <div className="hp-card-header flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <h2 className="hp-card-title">{t('Behavior Matrix')}</h2>
                        </div>
                        
                        <div className="p-4 space-y-3">
                            {filteredData.slice(0, 6).map((officer, i) => (
                                <div key={i} className="p-3 rounded-lg border border-[var(--color-hp-border)] bg-[var(--color-hp-gray-50)] hover:border-[var(--color-hp-gray-400)] transition-colors">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <p className="font-semibold text-xs text-[var(--color-hp-dark)]">{officer.name}</p>
                                        <div className="flex items-center bg-white px-2 py-0.5 rounded text-[11px] border border-[var(--color-hp-border)]">
                                            <Star className="w-3 h-3 text-amber-500 mr-1 fill-amber-500" />
                                            <span className="font-bold text-[var(--color-hp-dark)]">{officer.avg_rating || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-[var(--color-hp-gray-600)] mt-2">
                                        <span>{t('Total Visits:')} <strong className="text-[var(--color-hp-dark)]">{officer.total_visits}</strong></span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            officer.score < 50 ? 'text-rose-700 bg-rose-50' : 'text-emerald-700 bg-emerald-50'
                                        }`}>
                                            {t('Score:')} {officer.score}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
