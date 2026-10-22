import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Link, usePage, router } from '@inertiajs/react';
import { Shield, MapPin, ChevronRight, Search, Filter, Plus, ChevronDown, CheckCircle2, Circle, Phone, Briefcase } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function EmployeeList({ employees = [], regions = [], filters = {} }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [region, setRegion] = useState(filters.region || '');
    const [viewMode, setViewMode] = useState('grid'); 

    const formatDesignation = (designation) => {
        if (!designation) return 'Field Officer';
        return designation.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/employees', { search, region }, { preserveState: true, replace: true });
    };

    const handleRegionChange = (r) => {
        const newRegion = region === r ? '' : r;
        setRegion(newRegion);
        router.get('/admin/employees', { search, region: newRegion }, { preserveState: true, replace: true });
    };

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">

                {flash?.success && (
                    <div className="hp-card p-4 border-l-4 border-l-hp-success bg-hp-success-light/30 flex justify-between items-center">
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

                {/* Page Title & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="hp-chip hp-chip-primary">{t('Workforce Directory')}</span>
                        </div>
                        <h1 className="hp-page-title">{t('Employees & Field Technicians')}</h1>
                        <p className="text-sm text-hp-muted mt-1">
                            {employees.length} {t('registered field officers, managers, and service technicians.')}
                        </p>
                    </div>

                    <Link href="/admin/employees/create" className="hp-btn hp-btn-primary">
                        <Plus className="w-4 h-4 mr-1" /> {t('Register Officer')}
                    </Link>
                </div>

                {/* Filter Toolbar */}
                <form onSubmit={handleSearch} className="hp-card p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-muted pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder={t('Search by EMP ID, Name, or Phone...')}
                            className="hp-input !pl-10 text-sm"
                        />
                    </div>

                    <div className="flex w-full md:w-auto gap-2 items-center">
                        <div className="flex items-center bg-hp-hover border border-hp-border rounded-lg p-0.5">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                                title={t('Grid View')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-hp-dark font-bold' : 'text-hp-muted hover:text-hp-dark'}`}
                                title={t('List View')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                            </button>
                        </div>

                        <div className="relative min-w-[150px]">
                            <select
                                value={region}
                                onChange={(e) => handleRegionChange(e.target.value)}
                                className="hp-input !h-10 !pr-8 appearance-none text-xs font-semibold cursor-pointer"
                            >
                                <option value="">{t('All Regions')}</option>
                                {regions.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-muted pointer-events-none" />
                        </div>

                        <button type="submit" className="hp-btn hp-btn-secondary !h-10">
                            <Search className="w-4 h-4 mr-1" /> {t('Search')}
                        </button>
                    </div>
                </form>

                {/* Empty State */}
                {employees.length === 0 ? (
                    <div className="hp-card p-16 text-center">
                        <div className="hp-icon-tile !w-14 !h-14 mx-auto mb-3">
                            <Shield className="w-6 h-6 text-hp-muted" />
                        </div>
                        <h2 className="text-base font-bold text-hp-dark mb-1">{t('No employees found')}</h2>
                        <p className="text-sm text-hp-muted">{t('Try adjusting your search or register a new employee.')}</p>
                    </div>
                ) : viewMode === 'list' ? (
                    /* List / Table View */
                    <div className="hp-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="hp-table min-w-[700px]">
                                <thead>
                                    <tr>
                                        <th>{t('Employee')}</th>
                                        <th>{t('Designation')}</th>
                                        <th>{t('Region')}</th>
                                        <th>{t('Reports To')}</th>
                                        <th>{t('Status')}</th>
                                        <th className="text-right">{t('Actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map(emp => (
                                        <tr key={emp.id} className="cursor-pointer" onClick={() => router.visit(`/admin/employees/${emp.id}`)}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-hp-dark text-white flex items-center justify-center font-bold text-xs shrink-0">
                                                        {emp.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-hp-dark">{emp.name}</p>
                                                        <p className="text-[11px] font-mono text-hp-muted">{emp.employee_code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="hp-chip hp-chip-gray">
                                                    {formatDesignation(emp.designation)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="text-xs text-hp-dark flex items-center gap-1 font-medium">
                                                    <MapPin className="w-3.5 h-3.5 text-hp-muted" /> {emp.region || 'HQ'}
                                                </span>
                                            </td>
                                            <td className="text-xs text-hp-muted font-medium">
                                                {emp.manager_name || 'Direct'}
                                            </td>
                                            <td>
                                                {emp.checked_in ? (
                                                    <span className="hp-chip hp-chip-success hp-chip-dot">Present</span>
                                                ) : (
                                                    <span className="hp-chip hp-chip-gray">Not Checked In</span>
                                                )}
                                            </td>
                                            <td className="text-right">
                                                <Link href={`/admin/employees/${emp.id}`} className="hp-btn hp-btn-sm hp-btn-outline">
                                                    {t('Manage')}
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* Grid Cards View — hPanel clean modular style */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {employees.map((emp) => (
                            <div 
                                key={emp.id} 
                                onClick={() => router.visit(`/admin/employees/${emp.id}`)}
                                className="hp-card p-5 cursor-pointer hover:border-hp-primary-border transition-all flex flex-col justify-between group"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-hp-dark text-white font-bold text-base flex items-center justify-center shrink-0">
                                            {emp.name.charAt(0)}
                                        </div>
                                        {emp.checked_in ? (
                                            <span className="hp-chip hp-chip-success hp-chip-dot !h-5 !text-[10px]">
                                                {t('Present')}
                                            </span>
                                        ) : (
                                            <span className="hp-chip hp-chip-gray !h-5 !text-[10px]">
                                                {t('Not Active')}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-base text-hp-dark group-hover:text-hp-primary transition-colors truncate">
                                        {emp.name}
                                    </h3>
                                    <p className="text-xs text-hp-muted mt-0.5">{formatDesignation(emp.designation)}</p>

                                    <div className="mt-4 pt-3 border-t border-hp-border flex items-center justify-between text-xs text-hp-muted">
                                        <span className="flex items-center gap-1 truncate">
                                            <MapPin className="w-3.5 h-3.5 text-hp-muted shrink-0" /> {emp.region || 'Headquarters'}
                                        </span>
                                        <span className="font-mono font-bold text-[11px] text-hp-dark">{emp.employee_code}</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-3 border-t border-hp-border flex items-center justify-between">
                                    <span className="text-xs text-hp-muted">Manager: <strong className="text-hp-dark">{emp.manager_name || 'Self'}</strong></span>
                                    <span className="hp-btn hp-btn-sm hp-btn-outline !h-8 !px-3">
                                        {t('View')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}