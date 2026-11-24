import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { withBase } from '../../basePath';
import {
    LayoutDashboard, Building2, Users2, BarChart3, Crown, Zap,
    LogOut, Layers, ChevronRight, ChevronDown, Menu, X, Home, CheckCircle2, Globe
} from 'lucide-react';
import { INDUSTRIES, getIndustryById } from '../../data/industriesConfig';
import ThemeCustomizerPopover from '../../Components/ThemeCustomizerPopover';
import SessionInactivityGuard from '../../Components/SessionInactivityGuard';
import { attachLiquidPointerTracking } from '../../lib/dashboardTheme';

export default function SuperadminLayout({ children, activeIndustry = null, onSelectIndustry = null }) {
    const { url, props } = usePage();
    const { t, i18n } = useTranslation();
    const user = props.auth?.user || { name: 'Platform Owner', email: 'superadmin@fieldy.in', role: 'superadmin' };
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
    const tenantDropdownRef = useRef(null);
    const shellRef = useRef(null);

    useEffect(() => attachLiquidPointerTracking(shellRef.current), []);

    const isTamil = i18n.language === 'ta' || (i18n.language || '').startsWith('ta');
    const toggleLanguage = () => {
        i18n.changeLanguage(isTamil ? 'en' : 'ta');
    };

    const currentActiveObj = activeIndustry ? getIndustryById(activeIndustry) : null;

    const handleChooseIndustry = (indId) => {
        setTenantDropdownOpen(false);
        if (onSelectIndustry) {
            onSelectIndustry(indId);
        } else if (indId) {
            router.visit(`/admin/dashboard?industry=${indId}`);
        } else {
            router.visit('/superadmin/dashboard');
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (tenantDropdownRef.current && !tenantDropdownRef.current.contains(e.target)) {
                setTenantDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const navItems = [
        { label: 'Platform Overview', href: '/superadmin/dashboard', icon: LayoutDashboard, color: '#0D9488' },
        { label: 'Client Companies', href: '/superadmin/companies', icon: Building2, color: '#2563EB' },
        { label: 'Cross-Company Employees', href: '/superadmin/employees', icon: Users2, color: '#7C3AED' },
        { label: 'Platform Analytics', href: '/superadmin/analytics', icon: BarChart3, color: '#0284C7' },
        { label: 'Plans & Add-ons', href: '/superadmin/subscriptions', icon: Crown, color: '#C8553D' },
    ];

    const isActive = (path) => url.startsWith(path);

    return (
        <div ref={shellRef} className="min-h-screen hp-liquid-shell text-[var(--color-hp-dark)] flex flex-col antialiased relative">
            {/* Liquid Morphism Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-2xl text-white border-b border-white/15 px-4 sm:px-6 h-16 flex items-center justify-between shadow-lg">
                {/* Left: Mobile trigger & Logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <Link href="/superadmin/dashboard" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[var(--color-hp-primary)] flex items-center justify-center text-white font-bold text-sm shadow-md ring-1 ring-white/30">
                            <Zap className="w-4 h-4 fill-current" />
                        </div>
                        <span className="font-extrabold text-base tracking-tight text-white">FIELDY</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/35">
                            {t('Superadmin')}
                        </span>
                    </Link>
                </div>

                {/* Right: Language Switcher, Theme Customizer, Client view dropdown & User menu */}
                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        title={t('Toggle Language')}
                        className="hp-dark-trigger inline-flex items-center gap-1.5 h-9 px-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-xs font-bold text-white transition-all cursor-pointer"
                    >
                        <Globe className="w-3.5 h-3.5 text-white" />
                        <span>{isTamil ? 'EN' : 'தமிழ்'}</span>
                    </button>

                    <ThemeCustomizerPopover darkTrigger />

                    <div className="relative" ref={tenantDropdownRef}>
                        <button
                            id="client-tenant-dropdown-btn"
                            type="button"
                            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-xs cursor-pointer ${
                                currentActiveObj
                                    ? 'bg-[var(--color-hp-primary)] text-white border border-[var(--color-hp-primary)] ring-2 ring-white/20'
                                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
                            }`}
                        >
                            <Layers className="w-3.5 h-3.5 text-white" />
                            <span className="max-w-[170px] truncate">
                                {currentActiveObj ? `${t('Tenant')}: ${t(currentActiveObj.shortName)}` : t('Client Tenant View')}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${tenantDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {tenantDropdownOpen && (
                            <div className="hp-pop absolute right-0 top-full mt-2 w-[340px] bg-white text-[var(--color-hp-dark)] border border-[var(--color-hp-border)] rounded-xl shadow-2xl overflow-hidden z-[60]">
                                <div className="px-3.5 py-2.5 bg-[var(--color-hp-gray-100)] border-b border-[var(--color-hp-border)] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-[var(--color-hp-primary)]" />
                                        <span className="text-[11px] font-bold tracking-wider text-[var(--color-hp-gray-700)] uppercase">{t('Switch Tenant Portal')}</span>
                                    </div>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-hp-primary)]/10 text-[var(--color-hp-primary)] border border-[var(--color-hp-primary)]/20">
                                        {INDUSTRIES.length} {t('Verticals')}
                                    </span>
                                </div>
                                <div className="max-h-[420px] overflow-y-auto p-1.5 space-y-0.5">
                                    {/* Option to return to Global Overview */}
                                    <button
                                        type="button"
                                        onClick={() => handleChooseIndustry(null)}
                                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors text-left ${
                                            !activeIndustry
                                                ? 'bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] font-bold'
                                                : 'hover:bg-[var(--color-hp-gray-100)] text-[var(--color-hp-dark)]'
                                        }`}
                                    >
                                        <div className="w-7 h-7 rounded-md bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-700">
                                            <Home className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs font-bold truncate">{t('Global Platform Overview')}</div>
                                            <div className="text-[10px] text-[var(--color-hp-gray-500)] truncate">{t('Multi-tenant orchestrator & master telemetry')}</div>
                                        </div>
                                        {!activeIndustry && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-hp-primary)] shrink-0" />}
                                    </button>

                                    <div className="my-1 border-t border-[var(--color-hp-border)]" />

                                    {/* 8 Industry Verticals */}
                                    {INDUSTRIES.map((ind) => {
                                        const IndIcon = ind.icon;
                                        const isSelected = activeIndustry === ind.id;
                                        return (
                                            <button
                                                key={ind.id}
                                                type="button"
                                                onClick={() => handleChooseIndustry(ind.id)}
                                                className={`w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors text-left ${
                                                    isSelected
                                                        ? 'bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] font-bold'
                                                        : 'hover:bg-[var(--color-hp-gray-100)] text-[var(--color-hp-dark)]'
                                                }`}
                                            >
                                                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${ind.accentBg}`}>
                                                    <IndIcon className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-xs font-bold truncate">
                                                        {t(ind.name)}
                                                    </div>
                                                    <div className="text-[10px] text-[var(--color-hp-gray-500)] truncate">
                                                        {t(ind.badge)}
                                                    </div>
                                                </div>
                                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-hp-primary)] shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
                        <div className="w-7 h-7 rounded-full bg-[var(--color-hp-primary)]/20 border border-[var(--color-hp-primary)]/40 flex items-center justify-center text-[var(--color-hp-primary)] font-bold text-xs">
                            {user.name.charAt(0)}
                        </div>
                        <span className="hidden md:inline-block text-xs font-medium text-white truncate max-w-[120px]">
                            {user.name}
                        </span>
                        <Link
                            href={withBase('/admin/logout')}
                            method="post"
                            as="button"
                            className="p-1.5 rounded-md text-[var(--color-hp-gray-400)] hover:text-rose-400 hover:bg-white/10 transition-colors"
                            title={t('Sign out')}
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Layout Body: Liquid Glass Sidebar + Main Content */}
            <div className="flex-1 flex flex-col md:flex-row relative z-10">
                {/* Liquid Morphism Sidebar */}
                <aside className={`
                    ${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 hp-liquid-sidebar shrink-0 z-30
                `}>
                    <div className="p-3.5 space-y-1">
                        <div className="px-3 pt-3 pb-1.5 text-[10px] font-bold tracking-wider text-[var(--color-hp-gray-500)] uppercase">
                            {t('Platform Management')}
                        </div>

                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <button
                                    key={item.href}
                                    type="button"
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        if (item.href === '/superadmin/dashboard') {
                                            handleChooseIndustry(null);
                                        } else {
                                            router.visit(item.href);
                                        }
                                    }}
                                    className={`hp-nav-item w-full text-left !h-11 ${active ? 'is-active' : ''}`}
                                >
                                    <span className="hp-liquid-icon-badge !w-9 !h-9" style={{ '--glass-tint': item.color }}>
                                        <Icon className="w-[18px] h-[18px]" style={{ color: item.color }} />
                                    </span>
                                    <span className="flex-1 text-sm font-bold truncate" style={active ? { color: item.color } : undefined}>{t(item.label)}</span>
                                    {active && <ChevronRight className="w-4 h-4" style={{ color: item.color }} />}
                                </button>
                            );
                        })}

                        <div className="pt-4 px-3 pb-1.5 text-[10px] font-bold tracking-wider text-[var(--color-hp-gray-500)] uppercase border-t border-white/60 mt-4 flex items-center justify-between">
                            <span>{t('Tenant Portals')}</span>
                            <span className="hp-chip hp-chip-primary !h-5 !text-[9px] !px-2">{INDUSTRIES.length} {t('Industries')}</span>
                        </div>

                        <div className="space-y-0.5">
                            {INDUSTRIES.map((ind) => {
                                const IndIcon = ind.icon;
                                const isSelected = activeIndustry === ind.id;
                                return (
                                    <button
                                        key={ind.id}
                                        type="button"
                                        onClick={() => {
                                            setMobileMenuOpen(false);
                                            handleChooseIndustry(ind.id);
                                        }}
                                        className={`hp-nav-item w-full text-left !h-10 !px-2.5 ${isSelected ? 'is-active' : ''}`}
                                    >
                                        <span className="hp-liquid-icon-badge !w-7 !h-7 !rounded-lg shrink-0">
                                            <IndIcon className="w-3.5 h-3.5" style={{ color: 'var(--hp-icon-override, var(--color-hp-primary))' }} />
                                        </span>
                                        <span className="flex-1 text-sm font-semibold truncate">{t(ind.shortName)}</span>
                                        {isSelected && <span className="w-2 h-2 rounded-full bg-[var(--color-hp-primary)]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>

            <SessionInactivityGuard />
        </div>
    );
}
