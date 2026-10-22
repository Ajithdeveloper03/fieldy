import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, Users, FileCheck2, ShieldAlert,
    Settings, MapPin, Search, Bell, PlusCircle, Globe, Briefcase, Building2,
    ChevronDown, ChevronRight, Wallet, ClipboardList, Menu, X, Star, Sparkles,
    PanelLeftClose, PanelLeftOpen, LogOut, HelpCircle, User, Crown
} from 'lucide-react';
import { useAlert } from '../../Components/AlertSystem';
import { useTranslation } from 'react-i18next';
import Chatbot from '../../Components/Chatbot';

/* ─────────────────────────────────────────────────────────────
   Navigation map — grouped like hPanel (Favorites → Home → groups)
   ───────────────────────────────────────────────────────────── */
const NAV_GROUPS = [
    {
        id: 'operations',
        label: 'Operations',
        items: [
            { href: '/admin/visits', icon: FileCheck2, label: 'Analytics & Visits' },
            { href: '/admin/monitor', icon: ShieldAlert, label: 'Live Monitor', dot: true },
            { href: '/admin/tasks', icon: ClipboardList, label: 'Tasks & Schedule' },
            { href: '/admin/alerts', icon: Bell, label: 'Alerts & Notifications' },
        ],
    },
    {
        id: 'directory',
        label: 'Directory',
        items: [
            { href: '/admin/employees', icon: Briefcase, label: 'Employees / Technicians' },
            { href: '/admin/farmers', icon: Building2, label: 'Facilities / Clients' },
            { href: '/admin/pending-farmers', icon: PlusCircle, label: 'Pending Facilities', badge: '12' },
        ],
    },
    {
        id: 'business',
        label: 'Business',
        items: [
            { href: '/admin/performance', icon: MapPin, label: 'Performance' },
            { href: '/admin/satisfaction', icon: Star, label: 'Customer Satisfaction' },
            { href: '/admin/payments', icon: Wallet, label: 'Payments & Financials' },
            { href: '/admin/subscriptions', icon: Crown, label: 'Plans & Add-ons' },
        ],
    },
];

const ALL_ITEMS = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Home' },
    ...NAV_GROUPS.flatMap(g => g.items),
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

const readStore = (key, fallback) => {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch {
        return fallback;
    }
};

export default function AdminLayout({ children }) {
    const { url, props } = usePage();
    const { triggerCritical } = useAlert();
    const { t, i18n } = useTranslation();

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => readStore('fieldy.sidebarCollapsed', false));
    const [collapsedGroups, setCollapsedGroups] = useState(() => readStore('fieldy.collapsedGroups', {}));
    const [favorites, setFavorites] = useState(() => readStore('fieldy.favorites', ['/admin/monitor', '/admin/tasks']));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = useRef(null);
    const profileRef = useRef(null);

    const user = props.auth?.user;
    const userName = user?.name || 'Client Admin';
    const companyName = user?.company?.name || 'Infinity Organics';

    /* Persist hPanel-style preferences across sessions */
    useEffect(() => { localStorage.setItem('fieldy.sidebarCollapsed', JSON.stringify(isSidebarCollapsed)); }, [isSidebarCollapsed]);
    useEffect(() => { localStorage.setItem('fieldy.collapsedGroups', JSON.stringify(collapsedGroups)); }, [collapsedGroups]);
    useEffect(() => { localStorage.setItem('fieldy.favorites', JSON.stringify(favorites)); }, [favorites]);

    /* Close mobile drawer on navigation */
    useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [url]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setProfileOpen(false);
                setMobileOpen(false);
            }
        };
        const handleClick = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClick);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClick);
        };
    }, []);

    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            setIsSearching(true);
            fetch(`/admin/search?q=${encodeURIComponent(searchQuery)}`)
                .then(res => res.json())
                .then(data => {
                    setSearchResults(data);
                    setIsSearching(false);
                })
                .catch(err => {
                    console.error(err);
                    setIsSearching(false);
                });
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const isActive = (path) => url.startsWith(path);
    const testAlert = () => {
        triggerCritical("OFFICER JOHN DOE - GPS DISABLED - SECTOR 4");
    };
    const toggleLanguage = () => {
        const nextLang = i18n.language === 'en' ? 'ta' : 'en';
        i18n.changeLanguage(nextLang);
    };
    const toggleGroup = (id) => setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleFavorite = (href) => setFavorites(prev => prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]);
    const openAssistant = () => window.dispatchEvent(new CustomEvent('fieldy:ask', { detail: {} }));
    const logout = () => router.post('/admin/logout');

    const getBreadcrumbs = () => {
        const cleanPath = url.split('?')[0];
        
        if (cleanPath === '/admin/dashboard' || cleanPath === '/admin') {
            return [{ label: t('Dashboard'), href: '/admin/dashboard' }];
        }
        
        if (cleanPath.startsWith('/admin/tasks')) {
            return [
                { label: t('Operations', 'Operations'), href: '/admin/tasks' },
                { label: t('Tasks & Schedule', 'Tasks & Schedule'), href: '/admin/tasks' }
            ];
        }
        
        if (cleanPath.startsWith('/admin/visits')) {
            if (cleanPath === '/admin/visits') {
                return [
                    { label: t('Field Operations', 'Field Operations'), href: '/admin/visits' },
                    { label: t('Visits & Analytics', 'Visits & Analytics'), href: '/admin/visits' }
                ];
            } else {
                return [
                    { label: t('Field Operations', 'Field Operations'), href: '/admin/visits' },
                    { label: t('Visits', 'Visits'), href: '/admin/visits' },
                    { label: t('Visit Details', 'Visit Details'), href: cleanPath }
                ];
            }
        }
        
        if (cleanPath.startsWith('/admin/monitor') || cleanPath.startsWith('/admin/live-monitor')) {
            return [
                { label: t('Operations', 'Operations'), href: '/admin/monitor' },
                { label: t('Live Monitor', 'Live Monitor'), href: '/admin/monitor' }
            ];
        }
        
        if (cleanPath.startsWith('/admin/pending-farmers')) {
            return [
                { label: t('Approvals', 'Approvals'), href: '/admin/pending-farmers' },
                { label: t('Pending Farmers', 'Pending Farmers'), href: '/admin/pending-farmers' }
            ];
        }
        
        if (cleanPath.startsWith('/admin/farmers')) {
            if (cleanPath === '/admin/farmers') {
                return [
                    { label: t('Directories', 'Directories'), href: '/admin/farmers' },
                    { label: t('Farmers', 'Farmers'), href: '/admin/farmers' }
                ];
            } else if (cleanPath.includes('/register')) {
                return [
                    { label: t('Directories', 'Directories'), href: '/admin/farmers' },
                    { label: t('Farmers', 'Farmers'), href: '/admin/farmers' },
                    { label: t('Register Farmer', 'Register Farmer'), href: cleanPath }
                ];
            } else {
                return [
                    { label: t('Directories', 'Directories'), href: '/admin/farmers' },
                    { label: t('Farmers', 'Farmers'), href: '/admin/farmers' },
                    { label: t('Farmer Profile', 'Farmer Profile'), href: cleanPath }
                ];
            }
        }
        
        if (cleanPath.startsWith('/admin/employees')) {
            if (cleanPath === '/admin/employees') {
                return [
                    { label: t('Directories', 'Directories'), href: '/admin/employees' },
                    { label: t('Employees', 'Employees'), href: '/admin/employees' }
                ];
            } else if (cleanPath.includes('/register')) {
                return [
                    { label: t('Directories', 'Directories'), href: '/admin/employees' },
                    { label: t('Employees', 'Employees'), href: '/admin/employees' },
                    { label: t('New Officer', 'New Officer'), href: cleanPath }
                ];
            } else {
                return [
                    { label: t('Directories', 'Directories'), href: '/admin/employees' },
                    { label: t('Employees', 'Employees'), href: '/admin/employees' },
                    { label: t('Employee Profile', 'Employee Profile'), href: cleanPath }
                ];
            }
        }
        
        if (cleanPath.startsWith('/admin/performance')) {
            return [
                { label: t('Management', 'Management'), href: '/admin/performance' },
                { label: t('Performance', 'Performance'), href: '/admin/performance' }
            ];
        }
        
        if (cleanPath.startsWith('/admin/payments')) {
            return [
                { label: t('Financials', 'Financials'), href: '/admin/payments' },
                { label: t('Payments', 'Payments'), href: '/admin/payments' }
            ];
        }
        
        if (cleanPath.startsWith('/admin/settings')) {
            return [
                { label: t('General', 'General'), href: '/admin/settings' },
                { label: t('Settings', 'Settings'), href: '/admin/settings' }
            ];
        }
        
        if (cleanPath.startsWith('/admin/alerts')) {
            return [
                { label: t('Operations', 'Operations'), href: '/admin/alerts' },
                { label: t('Alerts', 'Alerts'), href: '/admin/alerts' }
            ];
        }
        
        return [{ label: t('Dashboard'), href: '/admin/dashboard' }];
    };

    const cleanPath = url.split('?')[0];
    const isHome = cleanPath === '/admin/dashboard' || cleanPath === '/admin';
    const breadcrumbs = getBreadcrumbs();

    /* ─────────────── Sidebar item ─────────────── */
    const NavItem = ({ href, icon: Icon, label, badge, dot, collapsed, allowFavorite = true }) => {
        const active = isActive(href);
        const isFav = favorites.includes(href);
        return (
            <div className="relative group/nav">
                <Link
                    href={href}
                    title={collapsed ? t(label) : undefined}
                    className={`hp-nav-item ${active ? 'is-active' : ''} ${collapsed ? 'justify-center !px-0' : ''}`}
                >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${active ? '' : 'text-hp-muted group-hover/nav:text-hp-dark'}`} strokeWidth={1.9} />
                    {!collapsed && <span className="truncate flex-1">{t(label)}</span>}
                    {!collapsed && badge && (
                        <span className={`hp-chip !h-5 !px-1.5 !text-[11px] group-hover/nav:opacity-0 transition-opacity ${active ? 'bg-white text-hp-primary-hover' : 'hp-chip-primary'}`}>{badge}</span>
                    )}
                    {dot && (
                        <span className={`absolute ${collapsed ? 'top-2 right-3' : 'top-1/2 -translate-y-1/2 right-3 group-hover/nav:opacity-0'} h-2 w-2 rounded-full bg-hp-primary ring-2 ring-white transition-opacity`}>
                            <span className="absolute inset-0 rounded-full bg-hp-primary animate-ping opacity-60"></span>
                        </span>
                    )}
                </Link>
                {!collapsed && allowFavorite && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); toggleFavorite(href); }}
                        title={isFav ? t('Remove from favorites', 'Remove from favorites') : t('Add to favorites', 'Add to favorites')}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center transition-all opacity-0 group-hover/nav:opacity-100 hover:bg-white ${isFav ? 'text-hp-primary' : 'text-hp-muted hover:text-hp-dark'}`}
                    >
                        <Star className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                )}
            </div>
        );
    };

    const SidebarContent = ({ collapsed }) => {
        const favItems = ALL_ITEMS.filter(i => favorites.includes(i.href));
        return (
            <div className="flex flex-col h-full">
                <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${collapsed ? 'px-3' : 'px-4'}`}>
                    {/* Home */}
                    <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Home" collapsed={collapsed} allowFavorite={false} />

                    {/* Favorites */}
                    {favItems.length > 0 && (
                        <div className="mt-5">
                            {!collapsed ? (
                                <div className="flex items-center gap-1.5 px-3 mb-1.5 text-xs font-bold text-hp-muted">
                                    <Star className="w-3.5 h-3.5 text-hp-primary" fill="currentColor" /> {t('Favorites', 'Favorites')}
                                </div>
                            ) : <div className="h-px bg-hp-border mx-2 mb-3" />}
                            <div className="space-y-0.5">
                                {favItems.map(item => <NavItem key={`fav-${item.href}`} {...item} collapsed={collapsed} />)}
                            </div>
                        </div>
                    )}

                    {/* Collapsible groups */}
                    {NAV_GROUPS.map(group => {
                        const isClosed = !!collapsedGroups[group.id] && !collapsed;
                        return (
                            <div key={group.id} className="mt-5">
                                {!collapsed ? (
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.id)}
                                        className="w-full flex items-center justify-between px-3 mb-1.5 text-xs font-bold text-hp-muted hover:text-hp-dark transition-colors"
                                    >
                                        <span>{t(group.label)}</span>
                                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isClosed ? '-rotate-90' : ''}`} />
                                    </button>
                                ) : <div className="h-px bg-hp-border mx-2 mb-3" />}
                                <div className={`space-y-0.5 overflow-hidden transition-all duration-200 ${isClosed ? 'max-h-0 opacity-0' : 'max-h-[400px] opacity-100'}`}>
                                    {group.items.map(item => <NavItem key={item.href} {...item} collapsed={collapsed} />)}
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-5">
                        {collapsed && <div className="h-px bg-hp-border mx-2 mb-3" />}
                        <NavItem href="/admin/settings" icon={Settings} label="Settings" collapsed={collapsed} />
                    </div>
                </nav>

                {/* Footer: collapse control (desktop) */}
                <div className={`border-t border-hp-border py-3 ${collapsed ? 'px-3' : 'px-4'} hidden lg:block`}>
                    <button
                        type="button"
                        onClick={() => setIsSidebarCollapsed(!collapsed)}
                        className={`hp-nav-item w-full ${collapsed ? 'justify-center !px-0' : ''}`}
                        title={collapsed ? t('Expand menu', 'Expand menu') : undefined}
                    >
                        {collapsed ? <PanelLeftOpen className="w-5 h-5 text-hp-muted" /> : <PanelLeftClose className="w-5 h-5 text-hp-muted" />}
                        {!collapsed && <span>{t('Collapse menu', 'Collapse menu')}</span>}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-hp-bg text-hp-dark font-sans overflow-hidden">

            {/* ══════════ TOP BAR (full width, hPanel style) ══════════ */}
            <header className="h-16 flex-shrink-0 bg-white border-b border-hp-border flex items-center px-3 lg:px-0 z-40 relative">
                {/* Logo zone — aligned with sidebar width */}
                <div className={`flex items-center gap-1 lg:px-5 flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-[80px] lg:justify-center lg:!px-0' : 'lg:w-[264px]'}`}>
                    <button type="button" onClick={() => setMobileOpen(true)} className="hp-icon-btn lg:hidden" aria-label="Open menu">
                        <Menu className="w-5 h-5" />
                    </button>
                    <Link href="/admin/dashboard" className="flex items-center" aria-label="Fieldy home">
                        {isSidebarCollapsed ? (
                            <>
                                <img src="/images/logo.png" alt="Fieldy" className="h-9 w-auto object-contain lg:hidden" />
                                <span className="hidden lg:flex w-10 h-10 rounded-lg overflow-hidden items-center justify-center bg-white border border-hp-border">
                                    <img src="/images/logo.png" alt="Fieldy" className="h-10 max-w-none object-cover object-left" style={{ width: '88px', marginLeft: '6px' }} />
                                </span>
                            </>
                        ) : (
                            <img src="/images/logo.png" alt="Fieldy" className="h-9 w-auto object-contain" />
                        )}
                    </Link>
                </div>

                {/* Global search */}
                <div className="flex-1 flex items-center lg:pl-8 min-w-0">
                    <div className="relative w-full max-w-[520px] hidden md:block">
                        <Search className="h-[18px] w-[18px] text-hp-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            ref={searchInputRef}
                            id="global-search"
                            type="text"
                            placeholder={t('Search... (Ctrl+K)')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setIsSearchFocused(true)}
                            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                            className="hp-input !h-10 !pl-11 !pr-16 !bg-hp-hover !border-transparent hover:!border-hp-border-strong focus:!bg-white focus:!border-hp-primary"
                        />
                        <span className="hp-kbd absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">Ctrl K</span>
                        {searchQuery && isSearchFocused && (
                            <div className="hp-pop absolute top-full mt-2 w-full bg-white border border-hp-border rounded-xl shadow-[var(--shadow-hp-lg)] overflow-hidden z-50">
                                {isSearching ? (
                                    <div className="px-4 py-5 text-sm text-hp-muted text-center font-medium">{t('Searching...')}</div>
                                ) : searchResults.length > 0 ? (
                                    <div className="max-h-72 overflow-y-auto py-1.5">
                                        {searchResults.map((result, idx) => (
                                            <Link href={result.url} key={idx} className="mx-1.5 px-3 py-2.5 rounded-lg hover:bg-hp-hover cursor-pointer flex items-center justify-between" onClick={() => setIsSearchFocused(false)}>
                                                <span className="flex items-center gap-3 min-w-0">
                                                    <span className="hp-icon-tile !w-8 !h-8"><Search className="w-4 h-4" /></span>
                                                    <span className="text-sm font-semibold text-hp-dark truncate">{result.name}</span>
                                                </span>
                                                <span className="hp-chip hp-chip-gray">{t(result.type)}</span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-5 text-sm text-hp-muted text-center font-medium">{t('No matches found.')}</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1 lg:pr-6 flex-shrink-0">
                    <button type="button" onClick={openAssistant} className="hidden sm:inline-flex hp-btn hp-btn-sm hp-btn-secondary !rounded-full !h-9 !px-3.5 mr-1">
                        <Sparkles className="w-4 h-4 text-hp-primary" />
                        <span>{t('Ask Fieldy AI', 'Ask Fieldy AI')}</span>
                    </button>
                    <button type="button" onClick={() => searchInputRef.current?.focus()} className="hp-icon-btn md:hidden" aria-label="Search">
                        <Search className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={testAlert} className="hp-icon-btn hover:!text-hp-danger hover:!bg-hp-danger-light" title={t('Test Emergency Alert')}>
                        <ShieldAlert className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={toggleLanguage} className="hp-icon-btn hidden sm:inline-flex" title={t('Toggle Language')}>
                        <Globe className="w-5 h-5" />
                    </button>
                    <Link href="/admin/alerts" className="hp-icon-btn" title={t('Alerts & Notifications')}>
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-hp-danger ring-2 ring-white"></span>
                    </Link>

                    {/* Profile dropdown */}
                    <div className="relative ml-1" ref={profileRef}>
                        <button
                            type="button"
                            id="profile-menu-button"
                            onClick={() => setProfileOpen(!profileOpen)}
                            className={`flex items-center gap-2 h-10 pl-1 pr-2 rounded-full transition-colors ${profileOpen ? 'bg-hp-hover' : 'hover:bg-hp-hover'}`}
                        >
                            <span className="w-8 h-8 rounded-full bg-hp-dark text-white flex items-center justify-center text-sm font-bold">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-hp-muted hidden sm:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {profileOpen && (
                            <div className="hp-pop absolute right-0 top-full mt-2 w-72 bg-white border border-hp-border rounded-xl shadow-[var(--shadow-hp-lg)] overflow-hidden z-50">
                                <div className="p-4 flex items-center gap-3 border-b border-hp-border">
                                    <span className="w-11 h-11 rounded-full bg-hp-dark text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                                        {userName.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-hp-dark truncate">{userName}</p>
                                        <p className="text-xs text-hp-muted truncate">{user?.email || companyName}</p>
                                        <span className="hp-chip hp-chip-primary !h-5 !text-[11px] mt-1.5">{t('Client Admin', 'Client Admin')}</span>
                                    </div>
                                </div>
                                <div className="p-1.5">
                                    <div className="px-3 py-2 text-xs text-hp-muted">
                                        {t('Organization', 'Organization')}: <span className="font-bold text-hp-dark">{companyName}</span>
                                    </div>
                                    <Link href="/admin/settings" className="hp-nav-item"><User className="w-[18px] h-[18px] text-hp-muted" /> {t('Account settings', 'Account settings')}</Link>
                                    <button type="button" onClick={toggleLanguage} className="hp-nav-item w-full">
                                        <Globe className="w-[18px] h-[18px] text-hp-muted" /> {t('Language', 'Language')}
                                        <span className="ml-auto hp-chip hp-chip-gray">{i18n.language === 'ta' ? 'தமிழ்' : 'English'}</span>
                                    </button>
                                    <button type="button" onClick={openAssistant} className="hp-nav-item w-full"><HelpCircle className="w-[18px] h-[18px] text-hp-muted" /> {t('Help & support', 'Help & support')}</button>
                                    {user?.role === 'superadmin' && (
                                        <Link href="/superadmin/dashboard" className="hp-nav-item"><Crown className="w-[18px] h-[18px] text-hp-primary" /> {t('Superadmin Console', 'Superadmin Console')}</Link>
                                    )}
                                </div>
                                <div className="p-1.5 border-t border-hp-border">
                                    <button type="button" onClick={logout} className="hp-nav-item w-full hover:!text-hp-danger hover:!bg-hp-danger-light">
                                        <LogOut className="w-[18px] h-[18px]" /> {t('Log out', 'Log out')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                {/* ══════════ DESKTOP SIDEBAR ══════════ */}
                <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-hp-border transition-all duration-300 ${isSidebarCollapsed ? 'w-[80px]' : 'w-[264px]'}`}>
                    <SidebarContent collapsed={isSidebarCollapsed} />
                </aside>

                {/* ══════════ MOBILE DRAWER ══════════ */}
                <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-200 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="absolute inset-0 bg-hp-dark/40" onClick={() => setMobileOpen(false)} />
                    <aside className={`absolute left-0 top-0 bottom-0 w-[288px] max-w-[85vw] bg-white shadow-[var(--shadow-hp-lg)] flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="h-16 flex items-center justify-between px-4 border-b border-hp-border flex-shrink-0">
                            <img src="/images/logo.png" alt="Fieldy" className="h-9 w-auto object-contain" />
                            <button type="button" onClick={() => setMobileOpen(false)} className="hp-icon-btn" aria-label="Close menu"><X className="w-5 h-5" /></button>
                        </div>
                        <SidebarContent collapsed={false} />
                    </aside>
                </div>

                {/* ══════════ MAIN CANVAS ══════════ */}
                <main className="flex-1 min-w-0 overflow-y-auto relative" id="main-content">
                    <div className="max-w-[1320px] mx-auto w-full px-4 sm:px-6 lg:px-10 py-6 lg:py-8 pb-24">
                        {!isHome && (
                            <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm mb-4 hp-animate-in">
                                <Link href="/admin/dashboard" className="text-hp-muted hover:text-hp-primary font-medium transition-colors">{t('Home', 'Home')}</Link>
                                {breadcrumbs.map((crumb, idx) => (
                                    <React.Fragment key={idx}>
                                        <ChevronRight className="w-4 h-4 text-hp-border-strong" />
                                        {idx === breadcrumbs.length - 1 ? (
                                            <span className="text-hp-dark font-bold">{crumb.label}</span>
                                        ) : (
                                            <Link href={crumb.href} className="text-hp-muted hover:text-hp-primary font-medium transition-colors">{crumb.label}</Link>
                                        )}
                                    </React.Fragment>
                                ))}
                            </nav>
                        )}
                        {children}
                    </div>
                </main>
            </div>

            <Chatbot />
        </div>
    );
}