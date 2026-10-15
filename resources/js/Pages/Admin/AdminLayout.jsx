import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutDashboard, Users, FileCheck2, ShieldAlert, 
    Settings, MapPin, Search, Bell, PlusCircle, Globe, Briefcase, Building2,
    ChevronLeft, ChevronRight, Wallet, ClipboardList
} from 'lucide-react';
import { useAlert } from '../../Components/AlertSystem';
import { useTranslation } from 'react-i18next';
import Chatbot from '../../Components/Chatbot';

export default function AdminLayout({ children }) {
    const { url } = usePage();
    const { triggerCritical } = useAlert();
    const { t, i18n } = useTranslation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchInputRef = React.useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
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
        
        if (cleanPath.startsWith('/admin/live-monitor')) {
            return [
                { label: t('Operations', 'Operations'), href: '/admin/live-monitor' },
                { label: t('Live Monitor', 'Live Monitor'), href: '/admin/live-monitor' }
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
    const NavItem = ({ href, icon: Icon, label, badge, alert }) => {
        const active = isActive(href);
        return (
            <Link 
                href={href} 
                className={`cursor-pointer flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'} py-3 transition-all duration-200 font-medium text-sm border-l-4 ${
                    active 
                    ? 'border-orange-500 bg-orange-50/50 text-orange-600' 
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                } relative`}
            >
                <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center w-full' : ''}`}>
                    <Icon className={`w-5 h-5 ${isSidebarCollapsed ? '' : 'mr-3'} ${active ? 'text-orange-500' : 'text-gray-400'}`} />
                    {!isSidebarCollapsed && <span>{t(label)}</span>}
                </div>
                {!isSidebarCollapsed && badge && (
                    <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                        {badge}
                    </span>
                )}
                {alert && (
                    <span className={`absolute ${isSidebarCollapsed ? 'top-2 right-2' : 'right-3 top-3.5'} h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white animate-pulse`}></span>
                )}
            </Link>
        );
    };

    return (
        <div className="flex h-screen bg-[#f8f9fa] text-gray-800 font-sans overflow-hidden">
            
            <aside className={`hidden md:flex ${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex-col z-20 shadow-sm transition-all duration-300 relative`}>
                <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute -right-3 top-8 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-slate-800 hover:border-orange-300 shadow-sm transition-colors z-50 cursor-pointer"
                >
                    {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                <div className="h-20 flex items-center justify-center border-b border-gray-50/50 overflow-hidden px-3">
                    <Link href="/admin/dashboard" className="flex items-center justify-center w-full">
                        {isSidebarCollapsed ? (
                            <img src="/images/logo.png" alt="Fieldy" className="h-8 w-8 object-contain drop-shadow-sm" />
                        ) : (
                            <img src="/images/logo.png" alt="Fieldy" className="h-12 w-auto max-w-[180px] object-contain drop-shadow-sm" />
                        )}
                    </Link>
                </div>
                <nav className="flex-1 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
                    <div className={`px-4 pt-2 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${isSidebarCollapsed ? 'text-center px-0' : ''}`}>
                        {isSidebarCollapsed ? '•' : t('Main Menu')}
                    </div>
                    <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
                    <NavItem href="/admin/visits" icon={FileCheck2} label="Analytics & Visits" />
                    <NavItem href="/admin/monitor" icon={ShieldAlert} label="Live Monitor" alert={true} />
                    
                    <div className={`px-4 pt-6 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${isSidebarCollapsed ? 'text-center px-0' : ''}`}>
                        {isSidebarCollapsed ? '•' : t('Features')}
                    </div>
                    <NavItem href="/admin/employees" icon={Briefcase} label={t("Employees / Technicians")} />
                    <NavItem href="/admin/farmers" icon={Building2} label={t("Facilities / Clients")} />
                    <NavItem href="/admin/pending-farmers" icon={PlusCircle} label={t("Pending Facilities")} badge="12" />
                    <NavItem href="/admin/tasks" icon={ClipboardList} label={t("Tasks & Schedule")} />
                    
                    <div className={`px-4 pt-6 pb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${isSidebarCollapsed ? 'text-center px-0' : ''}`}>
                        {isSidebarCollapsed ? '•' : t('General')}
                    </div>
                    <NavItem href="/admin/performance" icon={MapPin} label="Performance" />
                    <NavItem href="/admin/alerts" icon={Bell} label="Alerts & Notifications" />
                </nav>
            </aside>
            {/* Main Canvas */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#f8f9fa] relative">
                {/* Top Navigation Bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 sticky top-0">
                    {/* Left: Breadcrumb */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-400">
                            <Link href="/admin/dashboard" className="hover:text-slate-700 transition-colors">
                                {t('Admin')}
                            </Link>
                            {getBreadcrumbs().map((crumb, idx) => (
                                <React.Fragment key={idx}>
                                    <span className="text-slate-300">/</span>
                                    {idx === getBreadcrumbs().length - 1 ? (
                                        <span className="text-slate-800 font-bold">{crumb.label}</span>
                                    ) : (
                                        <Link href={crumb.href} className="hover:text-slate-700 transition-colors">
                                            {crumb.label}
                                        </Link>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                    {/* Right: Search, Actions, Profile */}
                    <div className="flex items-center space-x-6">
                        <div className="relative group hidden md:block">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                placeholder={t('Search... (Ctrl+K)')} 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                className="block w-64 pl-10 pr-14 py-2 border border-gray-200 bg-gray-50 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm font-medium"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-[10px] font-bold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 bg-white shadow-sm hidden sm:block">Ctrl K</span>
                            </div>
                            {searchQuery && isSearchFocused && (
                                <div className="absolute top-full mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
                                    {isSearching ? (
                                        <div className="px-4 py-4 text-sm text-gray-500 text-center font-medium">{t('Searching...')}</div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="max-h-64 overflow-y-auto">
                                            {searchResults.map((result, idx) => (
                                                <Link href={result.url} key={idx} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer flex items-center justify-between block w-full text-left" onClick={() => setIsSearchFocused(false)}>
                                                    <span className="text-sm font-bold text-gray-900">{result.name}</span>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t(result.type)}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-4 py-4 text-sm text-gray-500 text-center font-medium">{t('No matches found.')}</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={testAlert}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition"
                            title={t('Test Emergency Alert')}
                        >
                            <ShieldAlert className="w-5 h-5" />
                        </button>

                        <button 
                            onClick={toggleLanguage}
                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-slate-800 hover:border-orange-200 hover:bg-slate-50 transition"
                            title={t('Toggle Language')}
                        >
                            <Globe className="w-5 h-5" />
                        </button>

                        <Link href="/admin/alerts" className="relative w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                        </Link>
                        
                        <div className="flex items-center pl-2 border-l border-gray-200 cursor-pointer group">
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-orange-500 transition-all bg-white p-0.5">
                                <img src="/images/logo.png" alt="Profile" className="w-full h-full object-cover rounded-full" />
                            </div>
                            <div className="ml-3 hidden md:block">
                                <p className="text-sm font-bold text-gray-900 leading-tight">{t('Super Admin')}</p>
                                <p className="text-xs font-semibold text-gray-500">{t('HQ Operations')}</p>
                            </div>
                        </div>
                    </div>
                </header>
                
                {/* Dashboard / View Content */}
                <div className="flex-1 overflow-auto p-4 md:p-8 pb-24 md:pb-8 max-w-[1600px] mx-auto w-full z-10">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation (Material Design 3) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around items-center px-2 py-2 z-50 pb-safe shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                <Link href="/admin/dashboard" className="flex flex-col items-center justify-center p-2 w-16 group">
                    <div className={`px-4 py-1 rounded-full transition-all duration-300 ${isActive('/admin/dashboard') ? 'bg-orange-100' : 'group-hover:bg-gray-100'}`}>
                        <LayoutDashboard className={`w-5 h-5 ${isActive('/admin/dashboard') ? 'text-orange-600' : 'text-gray-500'}`} />
                    </div>
                    <span className={`text-[10px] mt-1 font-bold ${isActive('/admin/dashboard') ? 'text-orange-600' : 'text-gray-500'}`}>{t('Dashboard')}</span>
                </Link>
                <Link href="/admin/farmers" className="flex flex-col items-center justify-center p-2 w-16 group">
                    <div className={`px-4 py-1 rounded-full transition-all duration-300 ${isActive('/admin/farmers') ? 'bg-orange-100' : 'group-hover:bg-gray-100'}`}>
                        <Users className={`w-5 h-5 ${isActive('/admin/farmers') ? 'text-orange-600' : 'text-gray-500'}`} />
                    </div>
                    <span className={`text-[10px] mt-1 font-bold ${isActive('/admin/farmers') ? 'text-orange-600' : 'text-gray-500'}`}>{t('Farmers')}</span>
                </Link>
                <Link href="/admin/monitor" className="flex flex-col items-center justify-center p-2 w-16 group relative">
                    <div className={`px-4 py-1 rounded-full transition-all duration-300 ${isActive('/admin/monitor') ? 'bg-orange-100' : 'group-hover:bg-gray-100'}`}>
                        <ShieldAlert className={`w-5 h-5 ${isActive('/admin/monitor') ? 'text-orange-600' : 'text-gray-500'}`} />
                    </div>
                    <span className="absolute top-1 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    <span className={`text-[10px] mt-1 font-bold ${isActive('/admin/monitor') ? 'text-orange-600' : 'text-gray-500'}`}>{t('Monitor')}</span>
                </Link>
                <Link href="/admin/tasks" className="flex flex-col items-center justify-center p-2 w-16 group">
                    <div className={`px-4 py-1 rounded-full transition-all duration-300 ${isActive('/admin/tasks') ? 'bg-orange-100' : 'group-hover:bg-gray-100'}`}>
                        <ClipboardList className={`w-5 h-5 ${isActive('/admin/tasks') ? 'text-orange-600' : 'text-gray-500'}`} />
                    </div>
                    <span className={`text-[10px] mt-1 font-bold ${isActive('/admin/tasks') ? 'text-orange-600' : 'text-gray-500'}`}>{t('Tasks')}</span>
                </Link>
            </nav>
            <Chatbot />
        </div>
    );
}