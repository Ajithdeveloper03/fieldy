import { asset, withBase, BASE } from '../../basePath';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, FileCheck2, ShieldAlert, ClipboardList,
    Briefcase, MapPin, Search, Bell, Globe, Building2, Sparkles,
    ChevronDown, ChevronRight, Menu, X, Star, Compass,
    PanelLeftClose, PanelLeftOpen, LogOut, HelpCircle, Layers
} from 'lucide-react';
import { useAlert } from '../../Components/AlertSystem';
import { useTranslation } from 'react-i18next';
import Chatbot from '../../Components/Chatbot';
import GuidedTour from '../../Components/GuidedTour';
import SessionInactivityGuard from '../../Components/SessionInactivityGuard';
import ThemeCustomizerPopover from '../../Components/ThemeCustomizerPopover';
import { attachLiquidPointerTracking } from '../../lib/dashboardTheme';
import { INDUSTRIES, getIndustryById } from '../../data/industriesConfig';
import { getVocab } from '../../data/industryVocab';

const readStore = (key, fallback) => {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch {
        return fallback;
    }
};

export default function AdminLayout({ children, currentIndustry: passedIndustry = null }) {
    const { url, props } = usePage();
    const { triggerCritical } = useAlert();
    const { t, i18n } = useTranslation();

    const user = props.auth?.user;
    const isSuperadmin = user?.role === 'superadmin';
    const userName = user?.name || (isSuperadmin ? 'Fieldy Platform Owner' : 'Admin');
    const companyName = user?.company?.name || 'Fieldy Operations';
    const companyId = user?.company?.id || user?.company_id || null;
    const companyTourCompleted = user?.company ? Boolean(user.company.tour_completed) : true;

    const tourDoneKey = companyId ? `fieldy_admin_tour_done_c${companyId}` : 'fieldy_admin_tour_done_platform';
    const tourStepKey = companyId ? `fieldy_admin_tour_step_c${companyId}` : 'fieldy_admin_tour_step_platform';

    // Active service vertical: page prop → server-shared (session-persisted) prop → real_estate
    const activeIndustryId = passedIndustry?.id || props.currentIndustry || 'real_estate';
    const currentIndustry = passedIndustry || getIndustryById(activeIndustryId);
    const labels = currentIndustry?.adminLabels || {};
    const vocab = getVocab(currentIndustry?.id);
    const ActiveIndIcon = currentIndustry?.icon || Building2;

    const [tutorialStep, setTutorialStep] = useState(() => {
        try {
            const activeSessionStep = sessionStorage.getItem(tourStepKey);
            if (activeSessionStep !== null) {
                const parsed = parseInt(activeSessionStep, 10);
                if (!Number.isNaN(parsed) && parsed >= 0) return parsed;
            }
            if (companyId && !companyTourCompleted && !localStorage.getItem(tourDoneKey)) {
                return 0;
            }
            return -1;
        } catch {
            return -1;
        }
    });

    // Trigger tour automatically when switching into a newly created company via Inertia navigation
    useEffect(() => {
        try {
            const activeSessionStep = sessionStorage.getItem(tourStepKey);
            if (activeSessionStep !== null) {
                const parsed = parseInt(activeSessionStep, 10);
                if (!Number.isNaN(parsed) && parsed >= 0) {
                    setTutorialStep(parsed);
                    return;
                }
            }
            if (companyId && !companyTourCompleted && !localStorage.getItem(tourDoneKey)) {
                setTutorialStep(0);
            }
        } catch {
            // ignore storage errors
        }
    }, [companyId, companyTourCompleted, tourDoneKey, tourStepKey]);

    const staffPluralLabel = t(labels.navAgents || vocab.staff.plural);
    const entityPluralLabel = t(labels.navEntities || vocab.entity.plural);
    const tasksMenuLabel = t(labels.todayTasksTitle || vocab.task.plural);
    const monitorMenuLabel = t(vocab.monitor.title);
    const visitsMenuLabel = t(labels.navVisits || vocab.visit.plural);

    const TUTORIAL_STEPS = useMemo(() => [
        {
            id: 'add-employees',
            target: 'nav-employees',
            groupId: 'directory',
            placement: 'right',
            href: '/admin/employees',
            title: t('Add {{staff}}', { staff: staffPluralLabel }),
            desc: t('Start by adding your field team here. Open {{menu}} in the sidebar to create mobile app logins for your staff.', { menu: staffPluralLabel }),
        },
        {
            id: 'add-sites',
            target: 'nav-farmers',
            groupId: 'directory',
            placement: 'right',
            href: '/admin/farmers',
            title: t('Add {{entities}}', { entities: entityPluralLabel }),
            desc: t('Register your work locations and geofences under {{menu}} so staff can check in when arriving on site.', { menu: entityPluralLabel }),
        },
        {
            id: 'assign-tasks',
            target: 'nav-tasks',
            groupId: 'operations',
            placement: 'right',
            href: '/admin/tasks',
            title: t('Assign Tasks'),
            desc: t('Open {{menu}} to schedule daily work orders, attach checklists, and assign jobs to your field team.', { menu: tasksMenuLabel }),
        },
        {
            id: 'live-monitor',
            target: 'nav-monitor',
            groupId: 'operations',
            placement: 'right',
            href: '/admin/monitor',
            title: t('Live GPS Tracking'),
            desc: t('Use {{menu}} to track live GPS locations, attendance check-ins, and route history on the map.', { menu: monitorMenuLabel }),
        },
        {
            id: 'visit-reports',
            target: 'nav-visits',
            groupId: 'operations',
            placement: 'right',
            href: '/admin/visits',
            title: t('Inspect Visit Reports'),
            desc: t('Open {{menu}} to view completed site visits, field notes, timestamps, and photo proof submitted from mobile.', { menu: visitsMenuLabel }),
        },
        {
            id: 'customize-theme',
            target: 'theme-customizer',
            groupId: null,
            placement: 'bottom',
            href: null,
            title: t('Customize Your Workspace'),
            desc: t('Personalize your liquid glass accent colors, icon colors, or switch between English and Tamil anytime from the top bar.'),
        },
    ], [t, staffPluralLabel, entityPluralLabel, tasksMenuLabel, monitorMenuLabel, visitsMenuLabel]);

    const persistTourCompletion = useCallback(() => {
        try {
            localStorage.setItem(tourDoneKey, '1');
            sessionStorage.removeItem(tourStepKey);
        } catch {
            // ignore
        }
        if (companyId) {
            const urlEndpoint = withBase('/admin/onboarding-tour/complete');
            if (window.axios) {
                window.axios.post(urlEndpoint).catch(() => {});
            } else {
                const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
                fetch(urlEndpoint, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                        'X-CSRF-TOKEN': token,
                    },
                    body: JSON.stringify({}),
                }).catch(() => {});
            }
        }
    }, [companyId, tourDoneKey, tourStepKey]);

    const handleStepChange = useCallback((nextStep) => {
        if (nextStep < 0 || nextStep >= TUTORIAL_STEPS.length) {
            setTutorialStep(-1);
            persistTourCompletion();
            return;
        }
        setTutorialStep(nextStep);
        try {
            sessionStorage.setItem(tourStepKey, String(nextStep));
        } catch {
            // ignore
        }
    }, [TUTORIAL_STEPS.length, persistTourCompletion, tourStepKey]);

    const closeTutorial = useCallback(() => {
        setTutorialStep(-1);
        persistTourCompletion();
    }, [persistTourCompletion]);

    const restartTutorial = useCallback(() => {
        setProfileOpen(false);
        try {
            localStorage.removeItem(tourDoneKey);
            sessionStorage.setItem(tourStepKey, '0');
        } catch {
            // ignore
        }
        setTutorialStep(0);
    }, [tourDoneKey, tourStepKey]);

    useEffect(() => {
        const onStartTour = () => restartTutorial();
        window.addEventListener('fieldy:start-tour', onStartTour);
        return () => window.removeEventListener('fieldy:start-tour', onStartTour);
    }, [restartTutorial]);

    // Construction tenants hide the finance pages (Payroll) and Settings from the shell.
    const isConstruction = currentIndustry?.id === 'construction';

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
    const shellRef = useRef(null);

    useEffect(() => attachLiquidPointerTracking(shellRef.current), []);

    const handlePrepareTourStep = useCallback((step) => {
        if (!step) return;
        const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
        if (step.groupId) {
            setCollapsedGroups((prev) => (prev[step.groupId] ? { ...prev, [step.groupId]: false } : prev));
            if (isDesktop) {
                setIsSidebarCollapsed(false);
            } else {
                setMobileOpen(true);
            }
        } else if (!isDesktop) {
            setMobileOpen(false);
        }
    }, []);

    /* Dynamic navigation groups adapted to the active industry */
    const navGroups = [
        {
            id: 'operations',
            label: labels.navFieldWork || 'Field Work',
            items: [
                { href: '/admin/visits', tourId: 'nav-visits', icon: FileCheck2, color: '#0D9488', label: labels.navVisits || vocab.visit.plural },
                { href: '/admin/monitor', tourId: 'nav-monitor', icon: ShieldAlert, color: '#2563EB', label: vocab.monitor.title, dot: true },
                { href: '/admin/tasks', tourId: 'nav-tasks', icon: ClipboardList, color: '#7C3AED', label: labels.todayTasksTitle || vocab.task.plural },
                { href: '/admin/alerts', tourId: 'nav-alerts', icon: Bell, color: '#DB2777', label: vocab.alerts.title },
            ],
        },
        {
            id: 'directory',
            label: labels.navDirectory || 'Properties & Team',
            items: [
                { href: '/admin/farmers', tourId: 'nav-farmers', icon: ActiveIndIcon, color: '#0284C7', label: labels.navEntities || vocab.entity.plural },
                { href: '/admin/employees', tourId: 'nav-employees', icon: Briefcase, color: '#059669', label: labels.navAgents || vocab.staff.plural },
            ],
        },
        {
            id: 'business',
            label: vocab.finance.group,
            items: [
                { href: '/admin/performance', tourId: 'nav-performance', icon: MapPin, color: '#D97706', label: vocab.finance.scores },
            ],
        },
    ];

    const allItems = [
        { href: '/admin/dashboard', icon: LayoutDashboard, color: '#C8553D', label: 'Home' },
        ...navGroups.flatMap(g => g.items),
    ];

    /* Persist preferences */
    useEffect(() => { localStorage.setItem('fieldy.sidebarCollapsed', JSON.stringify(isSidebarCollapsed)); }, [isSidebarCollapsed]);
    useEffect(() => { localStorage.setItem('fieldy.collapsedGroups', JSON.stringify(collapsedGroups)); }, [collapsedGroups]);
    useEffect(() => { localStorage.setItem('fieldy.favorites', JSON.stringify(favorites)); }, [favorites]);

    /* Close drawers on navigation */
    useEffect(() => {
        setMobileOpen(false);
        setProfileOpen(false);
    }, [url]);

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

    const pathWithoutBase = url.split('?')[0];
    const cleanPath = BASE && pathWithoutBase.startsWith(`${BASE}/`)
        ? pathWithoutBase.slice(BASE.length)
        : pathWithoutBase;
    const isActive = (path) => cleanPath.startsWith(path);
    const testAlert = () => {
        triggerCritical("SAFETY ALERT - GEOFENCE BREACH OR TELEMETRY EVENT LOGGED");
    };
    const isTamil = i18n.language === 'ta' || (i18n.language || '').startsWith('ta');
    const toggleLanguage = () => {
        i18n.changeLanguage(isTamil ? 'en' : 'ta');
    };
    const toggleGroup = (id) => setCollapsedGroups(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleFavorite = (href) => setFavorites(prev => prev.includes(href) ? prev.filter(h => h !== href) : [...prev, href]);
    const openAssistant = () => window.dispatchEvent(new CustomEvent('fieldy:ask', { detail: {} }));
    const logout = () => router.post(withBase('/admin/logout'));

    const getBreadcrumbs = () => {
        if (cleanPath === '/admin/dashboard' || cleanPath === '/admin') {
            return [{ label: t('Dashboard'), href: '/admin/dashboard' }];
        }
        if (cleanPath.startsWith('/admin/tasks')) return [{ label: t(labels.navFieldWork || 'Field Work'), href: '/admin/tasks' }, { label: t(labels.todayTasksTitle || vocab.task.plural), href: '/admin/tasks' }];
        if (cleanPath.startsWith('/admin/visits')) return [{ label: t(labels.navFieldWork || 'Field Work'), href: '/admin/visits' }, { label: t(labels.navVisits || vocab.visit.plural), href: '/admin/visits' }];
        if (cleanPath.startsWith('/admin/monitor')) return [{ label: t(labels.navFieldWork || 'Field Work'), href: '/admin/monitor' }, { label: t(vocab.monitor.title), href: '/admin/monitor' }];
        if (cleanPath.startsWith('/admin/farmers')) return [{ label: t(labels.navDirectory || 'Directory'), href: '/admin/farmers' }, { label: t(labels.navEntities || vocab.entity.plural), href: '/admin/farmers' }];
        if (cleanPath.startsWith('/admin/employees')) return [{ label: t(labels.navDirectory || 'Directory'), href: '/admin/employees' }, { label: t(labels.navAgents || vocab.staff.plural), href: '/admin/employees' }];
        if (cleanPath.startsWith('/admin/performance')) return [{ label: t(vocab.finance.group), href: '/admin/performance' }, { label: t(vocab.finance.scores), href: '/admin/performance' }];
        if (cleanPath.startsWith('/admin/payments')) return [{ label: t(vocab.finance.group), href: '/admin/payments' }, { label: t(vocab.finance.payments), href: '/admin/payments' }];
        if (cleanPath.startsWith('/admin/alerts')) return [{ label: t(labels.navFieldWork || 'Field Work'), href: '/admin/alerts' }, { label: t(vocab.alerts.title), href: '/admin/alerts' }];
        if (cleanPath.startsWith('/admin/settings')) return [{ label: t('Settings'), href: '/admin/settings' }];
        return [{ label: t('Dashboard'), href: '/admin/dashboard' }];
    };

    const isHome = cleanPath === '/admin/dashboard' || cleanPath === '/admin';
    const breadcrumbs = getBreadcrumbs();

    /* ─────────────── Sidebar item ─────────────── */
    const NavItem = ({ href, tourId, enableTour = false, icon: Icon, color = '#0D9488', label, badge, dot, collapsed, allowFavorite = true }) => {
        const active = isActive(href);
        const isFav = favorites.includes(href);
        return (
            <div className="relative group/nav">
                <Link
                    href={href}
                    data-tour={enableTour && tourId ? tourId : undefined}
                    onClick={() => {
                        if (enableTour && tourId && tutorialStep >= 0 && TUTORIAL_STEPS[tutorialStep]?.target === tourId) {
                            handleStepChange(tutorialStep + 1);
                        }
                    }}
                    title={collapsed ? t(label) : undefined}
                    className={`hp-nav-item ${active ? 'is-active' : ''} ${collapsed ? 'justify-center !px-0' : ''}`}
                    style={active ? { color } : undefined}
                >
                    <span className="hp-liquid-icon-badge" style={{ '--glass-tint': color }}>
                        <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color }} strokeWidth={active ? 2.3 : 2} />
                    </span>
                    {!collapsed && <span className="truncate flex-1">{t(label)}</span>}
                    {!collapsed && badge && (
                        <span className={`hp-chip !h-5 !px-1.5 !text-[11px] group-hover/nav:opacity-0 transition-opacity ${active ? 'bg-white text-hp-primary-hover' : 'hp-chip-primary'}`}>{badge}</span>
                    )}
                    {dot && (
                        <span className={`absolute ${collapsed ? 'top-2 right-3' : 'top-1/2 -translate-y-1/2 right-3 group-hover/nav:opacity-0'} h-2.5 w-2.5 rounded-full bg-cyan-500 ring-2 ring-white transition-opacity`}>
                            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-70"></span>
                        </span>
                    )}
                </Link>
                {!collapsed && allowFavorite && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); toggleFavorite(href); }}
                        title={isFav ? t('Remove from favorites') : t('Add to favorites')}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center transition-all opacity-0 group-hover/nav:opacity-100 hover:bg-white ${isFav ? 'text-hp-primary' : 'text-hp-muted hover:text-hp-dark'}`}
                    >
                        <Star className="w-4 h-4" fill={isFav ? 'currentColor' : 'none'} />
                    </button>
                )}
            </div>
        );
    };

    const SidebarContent = ({ collapsed }) => {
        const favItems = allItems.filter(i => favorites.includes(i.href));
        return (
            <div className="flex flex-col h-full">
                <nav className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${collapsed ? 'px-3' : 'px-4'}`}>
                    {/* Home */}
                    <NavItem href={`/admin/dashboard?industry=${currentIndustry.id}`} icon={LayoutDashboard} color="#C8553D" label="Home" collapsed={collapsed} allowFavorite={false} />

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
                    {navGroups.map(group => {
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
                                    {group.items.map(item => <NavItem key={item.href} {...item} enableTour collapsed={collapsed} />)}
                                </div>
                            </div>
                        );
                    })}
                </nav>

                {/* Footer: collapse control (desktop) */}
                <div className={`border-t border-hp-border py-3 ${collapsed ? 'px-3' : 'px-4'} hidden lg:block`}>
                    <button
                        type="button"
                        onClick={() => setIsSidebarCollapsed(!collapsed)}
                        className={`hp-nav-item w-full ${collapsed ? 'justify-center !px-0' : ''}`}
                        title={collapsed ? t('Expand menu') : undefined}
                    >
                        {collapsed ? <PanelLeftOpen className="w-5 h-5 text-hp-muted" /> : <PanelLeftClose className="w-5 h-5 text-hp-muted" />}
                        {!collapsed && <span>{t('Collapse menu')}</span>}
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div ref={shellRef} className="flex flex-col h-screen hp-liquid-shell text-hp-dark font-sans overflow-hidden relative">
            {/* ══════════ TOP BAR (Liquid Glass) ══════════ */}
            <header className="h-16 flex-shrink-0 hp-liquid-header flex items-center px-3 lg:px-0 z-40 relative">
                {/* Logo zone — aligned with sidebar width */}
                <div className={`flex items-center gap-1 lg:px-5 flex-shrink-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:w-[80px] lg:justify-center lg:!px-0' : 'lg:w-[264px]'}`}>
                    <button type="button" onClick={() => setMobileOpen(true)} className="hp-icon-btn lg:hidden" aria-label="Open menu">
                        <Menu className="w-5 h-5" />
                    </button>
                    <Link href={`/admin/dashboard?industry=${currentIndustry.id}`} className="flex items-center" aria-label="Fieldy home">
                        {isSidebarCollapsed ? (
                            <>
                            
                                <img src={asset('/images/logo.png')} alt="Fieldy" className="h-9 w-auto object-contain lg:hidden" />
                                <span className="hidden lg:flex w-10 h-10 rounded-lg overflow-hidden items-center justify-center bg-white border border-hp-border">
                                    <img src={asset('/images/logo.png')} alt="Fieldy" className="h-10 max-w-none object-cover object-left" style={{ width: '88px', marginLeft: '6px' }} />
                                </span>
                            </>
                        ) : (
                            <img src={asset('/images/logo.png')} alt="Fieldy" className="h-9 w-auto object-contain" />
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
                <div className="flex items-center gap-1.5 lg:pr-6 flex-shrink-0">
                    <button type="button" onClick={openAssistant} className="hidden xl:inline-flex hp-btn hp-btn-sm hp-btn-secondary !rounded-full !h-9 !px-3.5 mr-0.5">
                        <Sparkles className="w-4 h-4" style={{ color: 'var(--color-hp-primary)' }} />
                        <span>{t('Ask AI')}</span>
                    </button>
                    <button type="button" onClick={() => searchInputRef.current?.focus()} className="hp-icon-btn md:hidden" aria-label="Search">
                        <Search className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={testAlert} className="hp-icon-btn hover:!text-hp-danger hover:!bg-hp-danger-light" title={t('Test Emergency Alert')}>
                        <ShieldAlert className="w-5 h-5" />
                    </button>
                    {/* Live Liquid Glass Accent & Icon Color Customizer */}
                    <ThemeCustomizerPopover tourId="theme-customizer" />
                    <button
                        type="button"
                        onClick={toggleLanguage}
                        className="hp-pill !h-10 !px-3.5 !text-xs !font-bold"
                        title={t('Toggle Language')}
                    >
                        <Globe className="w-4 h-4" />
                        <span>{isTamil ? 'EN' : 'தமிழ்'}</span>
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
                            <span
                                className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold shadow-md"
                                style={{ backgroundColor: 'var(--color-hp-primary)' }}
                            >
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
                                        <span className="hp-chip hp-chip-primary !h-5 !text-[11px] mt-1.5">{t(currentIndustry.shortName)} {t('Admin')}</span>
                                    </div>
                                </div>
                                <div className="p-1.5">
                                    <div className="px-3 py-2 text-xs text-hp-muted">
                                        {t('Tenant Enterprise')}: <span className="font-bold text-hp-dark">{companyName}</span>
                                    </div>
                                    {isSuperadmin && (
                                        <Link href="/superadmin/dashboard" className="hp-nav-item font-semibold text-hp-primary">
                                            <Layers className="w-[18px] h-[18px] text-hp-primary" /> {t('Superadmin Portal')}
                                        </Link>
                                    )}
                                    {isSuperadmin && (
                                        <div className="px-3 pt-2 pb-1">
                                            <label className="block text-[11px] font-bold text-hp-muted mb-1">{t('Switch service')}</label>
                                            <select
                                                value={currentIndustry.id}
                                                onChange={(e) => router.visit(`${cleanPath}?industry=${e.target.value}`)}
                                                className="hp-input !h-9 !text-sm w-full"
                                            >
                                                {INDUSTRIES.map(ind => <option key={ind.id} value={ind.id}>{t(ind.shortName)}</option>)}
                                            </select>
                                        </div>
                                    )}
                                    <button type="button" onClick={toggleLanguage} className="hp-nav-item w-full">
                                        <Globe className="w-[18px] h-[18px] text-hp-muted" /> {t('Language')}
                                        <span className="ml-auto hp-chip hp-chip-gray">{isTamil ? 'தமிழ்' : 'English'}</span>
                                    </button>
                                    <button type="button" onClick={restartTutorial} className="hp-nav-item w-full">
                                        <Compass className="w-[18px] h-[18px] text-hp-muted" /> {t('Guided Tour')}
                                    </button>
                                    <button type="button" onClick={openAssistant} className="hp-nav-item w-full"><HelpCircle className="w-[18px] h-[18px] text-hp-muted" /> {t('Help & support')}</button>
                                </div>
                                <div className="p-1.5 border-t border-hp-border">
                                    <button type="button" onClick={logout} className="hp-nav-item w-full hover:!text-hp-danger hover:!bg-hp-danger-light">
                                        <LogOut className="w-[18px] h-[18px]" /> {t('Log out')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex flex-1 min-h-0 relative z-10">
                {/* ══════════ DESKTOP SIDEBAR (Liquid Glass) ══════════ */}
                <aside className={`hidden lg:flex flex-col flex-shrink-0 hp-liquid-sidebar transition-all duration-300 ${isSidebarCollapsed ? 'w-[80px]' : 'w-[264px]'}`}>
                    <SidebarContent collapsed={isSidebarCollapsed} />
                </aside>

                {/* ══════════ MOBILE DRAWER ══════════ */}
                <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-200 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className={`absolute left-0 top-0 bottom-0 w-[288px] max-w-[85vw] hp-liquid-sidebar !bg-white/90 shadow-[var(--shadow-hp-lg)] flex flex-col transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="h-16 flex items-center justify-between px-4 border-b border-hp-border flex-shrink-0">
                            <img src={asset('/images/logo.png')} alt="Fieldy" className="h-9 w-auto object-contain" />
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
                                <Link href={`/admin/dashboard?industry=${currentIndustry.id}`} className="text-hp-muted hover:text-hp-primary font-medium transition-colors">{t('Home', 'Home')}</Link>
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

            <SessionInactivityGuard />

            <GuidedTour
                steps={TUTORIAL_STEPS}
                activeStep={tutorialStep}
                onStepChange={handleStepChange}
                onComplete={closeTutorial}
                onPrepareStep={handlePrepareTourStep}
            />
        </div>
    );
}
