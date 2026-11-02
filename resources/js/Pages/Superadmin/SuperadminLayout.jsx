import React, { useState, useRef, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { 
    LayoutDashboard, Building2, Users2, BarChart3, 
    ShieldCheck, LogOut, ExternalLink, Activity, 
    Layers, ChevronRight, ChevronDown, Menu, X, Sparkles, Home, Crown, CheckCircle2
} from 'lucide-react';
import { INDUSTRIES, getIndustryById } from '../../data/industriesConfig';

export default function SuperadminLayout({ children, activeIndustry = null, onSelectIndustry = null }) {
    const { url, props } = usePage();
    const user = props.auth?.user || { name: 'Platform Owner', email: 'superadmin@fieldy.in', role: 'superadmin' };
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
    const tenantDropdownRef = useRef(null);

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
        { label: 'Platform Overview', href: '/superadmin/dashboard', icon: LayoutDashboard },
        { label: 'Client Companies', href: '/superadmin/companies', icon: Building2 },
        { label: 'Cross-Company Employees', href: '/superadmin/employees', icon: Users2 },
        { label: 'Platform Analytics', href: '/superadmin/analytics', icon: BarChart3 },
        { label: 'Plans & Add-ons', href: '/superadmin/subscriptions', icon: Crown },
    ];

    const isActive = (path) => url.startsWith(path);

    return (
        <div className="min-h-screen bg-[var(--color-hp-bg)] text-[var(--color-hp-dark)] flex flex-col antialiased">
            {/* Hostinger hPanel Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-[var(--color-hp-dark)] text-white border-b border-[#2C2D30] px-4 sm:px-6 h-14 flex items-center justify-between">
                {/* Left: Mobile trigger & Logo */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-1.5 rounded-md text-[var(--color-hp-gray-400)] hover:text-white hover:bg-white/10"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    <Link href="/superadmin/dashboard" className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[var(--color-hp-primary)] flex items-center justify-center text-white font-bold text-sm shadow-xs">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-base tracking-tight text-white">FIELDY</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--color-hp-primary)]/20 text-[var(--color-hp-primary)] border border-[var(--color-hp-primary)]/30">
                            Superadmin
                        </span>
                    </Link>
                </div>

                {/* Right: Client view dropdown & User menu */}
                <div className="flex items-center gap-3">
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
                                {currentActiveObj ? `Tenant: ${currentActiveObj.shortName}` : 'Client Tenant View'}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-white/80 transition-transform duration-200 ${tenantDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {tenantDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-[340px] bg-white text-[var(--color-hp-dark)] border border-[var(--color-hp-border)] rounded-xl shadow-2xl overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-3.5 py-2.5 bg-[var(--color-hp-gray-100)] border-b border-[var(--color-hp-border)] flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-[var(--color-hp-primary)]" />
                                        <span className="text-[11px] font-bold tracking-wider text-[var(--color-hp-gray-700)] uppercase">Switch Tenant Portal</span>
                                    </div>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-hp-primary)]/10 text-[var(--color-hp-primary)] border border-[var(--color-hp-primary)]/20">{INDUSTRIES.length} Verticals</span>
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
                                            <div className="text-xs font-bold truncate">Global Platform Overview</div>
                                            <div className="text-[10px] text-[var(--color-hp-gray-500)] truncate">Multi-tenant orchestrator & master telemetry</div>
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
                                                        {ind.name}
                                                    </div>
                                                    <div className="text-[10px] text-[var(--color-hp-gray-500)] truncate">
                                                        {ind.badge}
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
                            href="/admin/logout"
                            method="post"
                            as="button"
                            className="p-1.5 rounded-md text-[var(--color-hp-gray-400)] hover:text-rose-400 hover:bg-white/10 transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Layout Body: Sidebar + Main Content */}
            <div className="flex-1 flex flex-col md:flex-row">
                {/* Hostinger Clean White Sidebar */}
                <aside className={`
                    ${mobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-60 bg-white border-r border-[var(--color-hp-border)] shrink-0 z-30
                `}>
                    <div className="p-3 space-y-1">
                        <div className="px-3 pt-3 pb-1.5 text-[10px] font-bold tracking-wider text-[var(--color-hp-gray-500)] uppercase">
                            Platform Management
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
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all text-left ${
                                        active
                                            ? 'bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] border-l-2 border-[var(--color-hp-primary)]'
                                            : 'text-[var(--color-hp-gray-700)] hover:text-[var(--color-hp-dark)] hover:bg-[var(--color-hp-gray-100)]'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? 'text-[var(--color-hp-primary)]' : 'text-[var(--color-hp-gray-500)]'}`} />
                                    <span className="flex-1">{item.label}</span>
                                    {active && <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-primary)]" />}
                                </button>
                            );
                        })}

                        <div className="pt-4 px-3 pb-1.5 text-[10px] font-bold tracking-wider text-[var(--color-hp-gray-500)] uppercase border-t border-[var(--color-hp-border)] mt-4 flex items-center justify-between">
                            <span>Tenant Portals</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-hp-primary/10 text-hp-primary font-bold">{INDUSTRIES.length} Industries</span>
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
                                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-colors text-left group ${
                                            isSelected
                                                ? 'bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] border-l-2 border-[var(--color-hp-primary)] font-bold'
                                                : 'text-[var(--color-hp-gray-700)] hover:text-[var(--color-hp-dark)] hover:bg-[var(--color-hp-gray-100)]'
                                        }`}
                                    >
                                        <IndIcon className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--color-hp-primary)]' : 'text-[var(--color-hp-gray-500)] group-hover:text-[var(--color-hp-primary)]'} transition-colors`} />
                                        <span className="flex-1 truncate">{ind.shortName}</span>
                                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-hp-primary)]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 bg-[var(--color-hp-bg)]">
                    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
