import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    Shield, MapPin, ChevronRight, Search, Filter, Plus, ChevronDown, CheckCircle2, 
    Circle, Phone, Briefcase, Sparkles, LayoutGrid, ListFilter, ArrowUpRight, X,
    Battery, Wifi, UserCheck, ShieldCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EmployeeList({ employees = [], regions = [], filters = {} }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [region, setRegion] = useState(filters.region || 'all');
    const [viewMode, setViewMode] = useState('grid'); 

    const formatDesignation = (designation) => {
        if (!designation) return 'Field Service Officer';
        return designation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        router.get('/admin/employees', { search, region: region === 'all' ? '' : region }, { preserveState: true, replace: true });
    };

    const handleRegionChange = (r) => {
        setRegion(r);
        router.get('/admin/employees', { search, region: r === 'all' ? '' : r }, { preserveState: true, replace: true });
    };

    const activeCount = employees.filter(e => e.status === 'active' || e.isOnline).length;
    const totalStaff = employees.length;

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">

                {flash?.success && (
                    <div className="hp-bento-card !p-4 border-l-4 border-l-hp-success bg-hp-success-light/30 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-hp-dark">{flash.success}</p>
                            {flash.generated_password && (
                                <p className="text-xs text-hp-muted mt-1">
                                    <strong>Generated Password: </strong>
                                    <span className="bg-white px-2 py-0.5 rounded border border-hp-border font-mono font-bold text-hp-dark ml-1">{flash.generated_password}</span>
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {t('Workforce Management')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {totalStaff} {t('Field Staff')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t('Employees & Field Technicians Directory')}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t('Manage certified field technicians, MEP specialists, HVAC auditors, and dispatch workforce credentials.')}
                            </p>

                            {/* Hostinger Pill Search Bar */}
                            <form onSubmit={handleSearch} className="mt-5 max-w-lg">
                                <div className="hp-search-pill-bar">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={t('Search by Technician Name, EMP ID, or Phone...')}
                                        className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                    />
                                    {search && (
                                        <button 
                                            type="button" 
                                            onClick={() => { setSearch(''); router.get('/admin/employees', { region: region === 'all' ? '' : region }, { preserveState: true, replace: true }); }}
                                            className="p-1 text-hp-muted hover:text-hp-dark"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button 
                                        type="submit"
                                        className="w-7 h-7 rounded-full bg-hp-primary text-white flex items-center justify-center hover:bg-hp-primary-hover shrink-0"
                                    >
                                        <Search className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Top Action */}
                        <div className="shrink-0 self-start lg:self-center">
                            <Link 
                                href="/admin/employees/create" 
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                <span>{t('Register Technician')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS (TLD Style) ══════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total Technicians')}</span>
                            <Briefcase className="w-3.5 h-3.5 text-hp-primary" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{totalStaff}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Across all zones')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('On Duty Now')}</span>
                            <span className="w-2 h-2 rounded-full bg-hp-success animate-ping"></span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-success">{activeCount}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Streaming GPS logs')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('SLA Compliance')}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-hp-primary" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">98.8%</div>
                        <p className="text-xs text-hp-success font-medium mt-1">Tier-1 certified</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Regions Covered')}</span>
                            <MapPin className="w-3.5 h-3.5 text-hp-info" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">{regions.length || 4}</div>
                        <p className="text-xs text-hp-muted mt-1">{t('Active operational zones')}</p>
                    </div>
                </div>

                {/* ══════════ HOSTINGER SEGMENTED REGION PILLS & VIEW CONTROLS ══════════ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Region Segmented Tabs */}
                    <div className="hp-segmented-bar overflow-x-auto max-w-full">
                        {['all', ...regions].map((r) => (
                            <button
                                key={r}
                                onClick={() => handleRegionChange(r)}
                                className={`hp-segmented-item ${region === r ? 'is-active-primary' : ''}`}
                            >
                                {r === 'all' ? t('All Regions') : r}
                            </button>
                        ))}
                    </div>

                    {/* View Switcher */}
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
                            onClick={() => setViewMode('list')}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-xs text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                            title={t('List View')}
                        >
                            <ListFilter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ══════════ DIRECTORY CONTENT ══════════ */}
                {employees.length === 0 ? (
                    <div className="hp-bento-card text-center py-20">
                        <div className="hp-icon-tile !w-14 !h-14 mx-auto mb-3">
                            <UserCheck className="w-6 h-6 text-hp-muted" />
                        </div>
                        <h2 className="text-base font-bold text-hp-dark mb-1">{t('No staff members found')}</h2>
                        <p className="text-sm text-hp-muted max-w-sm mx-auto">{t('Try adjusting your search filters or register a new field officer.')}</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    /* Hostinger 3/4-Column Bento Marketplace Cards Grid (Reference Images 2, 4 & 5) */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {employees.map((emp) => (
                            <div 
                                key={emp.id}
                                className="hp-bento-card group flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top Visual Box / Avatar Header */}
                                    <div className="hp-card-visual h-32 mb-4 p-4 flex flex-col justify-between relative bg-gradient-to-br from-hp-hover to-hp-bg">
                                        <div className="flex items-start justify-between">
                                            <div className="w-12 h-12 rounded-2xl bg-hp-dark text-white font-bold text-base flex items-center justify-center shadow-md">
                                                {emp.name?.charAt(0) || 'O'}
                                            </div>
                                            <span className={`hp-chip !bg-white/90 backdrop-blur-sm ${emp.status === 'active' || emp.isOnline ? 'hp-chip-success hp-chip-dot' : 'hp-chip-gray'}`}>
                                                {emp.status === 'active' || emp.isOnline ? t('On Duty') : t('Offline')}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-hp-muted">
                                            <span className="font-mono font-bold bg-white/80 px-2 py-0.5 rounded border border-hp-border text-hp-dark">
                                                {emp.employee_code || `EMP-${emp.id}`}
                                            </span>
                                            <span className="flex items-center gap-1 font-semibold text-hp-dark">
                                                <Battery className="w-3.5 h-3.5 text-hp-primary" /> {emp.battery || 90}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Officer Info */}
                                    <div className="space-y-1.5">
                                        <h3 className="font-bold text-base text-hp-dark group-hover:text-hp-primary transition-colors line-clamp-1">
                                            {emp.name}
                                        </h3>
                                        <p className="text-xs text-hp-muted flex items-center gap-1">
                                            <MapPin className="w-3.5 h-3.5 text-hp-muted shrink-0" />
                                            <span className="truncate">{emp.region || 'Assigned Zone'}</span>
                                        </p>
                                        <p className="text-xs font-medium text-hp-dark pt-1">
                                            {formatDesignation(emp.designation)}
                                        </p>
                                        {emp.phone && (
                                            <p className="text-xs text-hp-muted flex items-center gap-1 pt-0.5">
                                                <Phone className="w-3 h-3 text-hp-muted" /> {emp.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Hostinger Bottom Outline Action Button */}
                                <div className="mt-5 pt-3 border-t border-hp-border">
                                    <Link 
                                        href={`/admin/employees/${emp.id}`}
                                        className="hp-btn hp-btn-outline w-full !rounded-xl !h-10 text-sm font-semibold"
                                    >
                                        <span>{t('View Profile')}</span>
                                        <ArrowUpRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Table View */
                    <div className="hp-bento-card !p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="hp-table min-w-[700px]">
                                <thead>
                                    <tr>
                                        <th>{t('Officer & ID')}</th>
                                        <th>{t('Role / Designation')}</th>
                                        <th>{t('Region / Zone')}</th>
                                        <th>{t('Phone')}</th>
                                        <th>{t('Status')}</th>
                                        <th className="text-right">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id} className="cursor-pointer hover:bg-hp-hover/60 transition-colors" onClick={() => router.visit(`/admin/employees/${emp.id}`)}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-hp-hover border border-hp-border flex items-center justify-center font-bold text-xs shrink-0 text-hp-dark">
                                                        {emp.name?.charAt(0) || 'O'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-hp-dark">{emp.name}</p>
                                                        <p className="text-[11px] font-mono text-hp-muted">{emp.employee_code || `EMP-${emp.id}`}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="text-xs font-semibold text-hp-dark">
                                                    {formatDesignation(emp.designation)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-xs text-hp-dark flex items-center gap-1 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-hp-muted" /> {emp.region || 'HQ Zone'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-xs text-hp-muted font-mono">
                                                    {emp.phone || '–'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`hp-chip ${emp.status === 'active' || emp.isOnline ? 'hp-chip-success hp-chip-dot' : 'hp-chip-gray'}`}>
                                                    {emp.status === 'active' || emp.isOnline ? t('On Duty') : t('Offline')}
                                                </span>
                                            </td>
                                            <td className="text-right">
                                                <Link href={`/admin/employees/${emp.id}`} className="hp-btn hp-btn-sm hp-btn-outline">
                                                    {t('Profile')} <ArrowUpRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </AdminLayout>
    );
}