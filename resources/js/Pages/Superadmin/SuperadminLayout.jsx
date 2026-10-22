import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, Building2, Users2, BarChart3, 
    ShieldCheck, LogOut, ExternalLink, Activity, 
    Layers, ChevronRight, Menu, X, Sparkles, Home
} from 'lucide-react';

export default function SuperadminLayout({ children }) {
    const { url, props } = usePage();
    const user = props.auth?.user || { name: 'Platform Owner', email: 'superadmin@fieldy.in', role: 'superadmin' };
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { label: 'Platform Overview', href: '/superadmin/dashboard', icon: LayoutDashboard },
        { label: 'Client Companies', href: '/superadmin/companies', icon: Building2 },
        { label: 'Cross-Company Employees', href: '/superadmin/employees', icon: Users2 },
        { label: 'Platform Analytics', href: '/superadmin/analytics', icon: BarChart3 },
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

                {/* Right: Client view link & User menu */}
                <div className="flex items-center gap-3">
                    <a
                        href="/admin/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[var(--color-hp-gray-300)] hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5 text-[var(--color-hp-primary)]" />
                        <span>Client Tenant View</span>
                    </a>

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
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold transition-all ${
                                        active
                                            ? 'bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] border-l-2 border-[var(--color-hp-primary)]'
                                            : 'text-[var(--color-hp-gray-700)] hover:text-[var(--color-hp-dark)] hover:bg-[var(--color-hp-gray-100)]'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${active ? 'text-[var(--color-hp-primary)]' : 'text-[var(--color-hp-gray-500)]'}`} />
                                    <span className="flex-1">{item.label}</span>
                                    {active && <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-primary)]" />}
                                </Link>
                            );
                        })}

                        <div className="pt-4 px-3 pb-1.5 text-[10px] font-bold tracking-wider text-[var(--color-hp-gray-500)] uppercase border-t border-[var(--color-hp-border)] mt-4">
                            Tenant Portals
                        </div>
                        <a
                            href="/admin/dashboard"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[var(--color-hp-gray-700)] hover:text-[var(--color-hp-dark)] hover:bg-[var(--color-hp-gray-100)] transition-colors"
                        >
                            <ExternalLink className="w-4 h-4 text-[var(--color-hp-gray-500)]" />
                            <span className="flex-1">Client Admin View</span>
                        </a>
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
