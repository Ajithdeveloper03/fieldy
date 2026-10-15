import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from './AdminLayout';
import { router } from '@inertiajs/react';
import { 
    Users, Activity, MapPin, FileCheck2, 
    TrendingUp, TrendingDown, Clock, ChevronRight, CheckCircle2, ShieldAlert, Maximize, Minimize,
    Wallet, PiggyBank, Briefcase, ArrowRight, MoreHorizontal, Filter, Search, FileText, PieChart, Activity as ActivityIcon, Leaf, Map, AlertCircle, Building2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});
import { useTranslation } from 'react-i18next';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '1.5rem'
};

// Map styling removed as OpenFreeMap uses its own style url

export default function Dashboard({ locationLogs = [], stats = {}, recentVisits = [], recentFarmers = [], pendingApprovals = [], agriStats = {} }) {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const { t } = useTranslation();

    const [liveLocationLogs, setLiveLocationLogs] = useState(locationLogs);
    
    useEffect(() => {
        setLiveLocationLogs(locationLogs);
    }, [locationLogs]);

    // WebSocket real-time update instead of full page polling
    useEffect(() => {
        if (window.Echo) {
            window.Echo.channel('live-tracking')
                .listen('LocationUpdated', (e) => {
                    setLiveLocationLogs(prev => {
                        // Find if log for this employee already exists
                        const newLogs = [...prev];
                        const index = newLogs.findIndex(log => log.employee?.id === e.employeeId || log.employee_id === e.employeeId);
                        
                        const newLog = {
                            id: Date.now(), // temporary ID
                            latitude: e.latitude,
                            longitude: e.longitude,
                            employee_id: e.employeeId,
                            employee: prev[index]?.employee || { id: e.employeeId, name: 'Officer' }
                        };

                        if (index !== -1) {
                            newLogs[index] = newLog;
                        } else {
                            newLogs.push(newLog);
                        }
                        return newLogs;
                    });
                });
        }
        
        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('live-tracking');
            }
        };
    }, []);

    // MapLibre doesn't require script loading hook

    const mapContent = (
        <div className={`transition-all duration-300 ease-in-out bg-white overflow-hidden shadow-sm ${isMapFullscreen ? 'fixed top-0 left-0 right-0 bottom-0 z-[99999] w-[100vw] h-[100vh] m-0 p-0 rounded-none' : 'relative w-full h-full rounded-[2rem]'}`}>
            
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    setIsMapFullscreen(!isMapFullscreen);
                }}
                className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-md border border-gray-200 p-2.5 rounded-xl shadow-sm hover:text-slate-800 transition-colors"
            >
                {isMapFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>

            <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center">
                <MapContainer
                    center={liveLocationLogs.length > 0 ? [parseFloat(liveLocationLogs[0].latitude), parseFloat(liveLocationLogs[0].longitude)] : [12.9716, 77.5946]}
                    zoom={10}
                    style={{ width: '100%', height: '100%', zIndex: 0 }}
                >
                    <TileLayer
                        attribution='&copy; Google Maps'
                        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    />
                    {liveLocationLogs.map((log) => (
                        <Marker
                            key={log.id}
                            position={[parseFloat(log.latitude), parseFloat(log.longitude)]}
                            icon={L.divIcon({
                                className: 'custom-icon',
                                html: `
                                    <div style="width: 32px; height: 32px; background: transparent; display: flex; align-items: center; justify-content: center;">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="white"/><circle cx="12" cy="12" r="8" fill="#10B981"/></svg>
                                    </div>
                                `,
                                iconSize: [32, 32],
                                iconAnchor: [16, 16],
                            })}
                        />
                    ))}
                </MapContainer>
            </div>
            
        </div>
    );

    return (
        <AdminLayout>

            <div className="relative rounded-[2.5rem] overflow-hidden mb-8 shadow-xl shadow-green-900/20">

                
                <img
                    src="/images/image11.jpg"
                    alt="Organic farm background"
                    className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                    style={{ filter: 'brightness(0.90) saturate(1.3)' }}
                />

              
                <div className="absolute inset-0 bg-green-900/30"></div>

                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize: '40px 40px' }}></div>

                {/* Leaf watermarks */}
                {/* <div className="absolute top-6 right-32 opacity-20 text-white pointer-events-none">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-5 8"/></svg>
                </div>
                <div className="absolute bottom-4 right-8 opacity-10 text-white pointer-events-none">
                    <svg width="140" height="140" viewBox="0 0 24 24" fill="currentColor"><path d="M17 8C8 10 5.9 16.17 3.82 21L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-5 8"/></svg>
                </div> */}

                {/* Banner Content — above all absolute layers */}
                <div className="relative z-10 p-8 md:p-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        {/* Greeting */}
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30 shadow-lg bg-white p-1">
                                    <img src="/images/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-green-200 text-sm font-bold tracking-wide">{t('Good morning, Super Admin')}</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                                {t('Overview')}
                                <span className="block text-lg font-medium text-green-300 mt-1">{t('Here is the summary of overall data')}</span>
                            </h1>
                        </div>
                        {/* Quick metrics */}
                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center px-5 py-2.5 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl text-sm font-bold text-white shadow-sm">
                                <Activity className="w-4 h-4 mr-2 text-green-300" /> {t('Today\'s Attendance')}: {stats?.todayAttendance ?? 0}
                            </div>
                            <div className="flex items-center px-5 py-2.5 bg-white text-green-900 rounded-2xl text-sm font-bold shadow-lg">
                                <FileCheck2 className="w-4 h-4 mr-2 text-emerald-600" /> {t('Today\'s Field Visits')}: {stats?.totalVisits ?? 0}
                            </div>
                        </div>
                    </div>


                </div>
            </div>

            {/* ══════════ STAT CARDS ROW ══════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

                {/* Card 1: Facilities */}
                <div onClick={() => router.visit('/admin/farmers')} className="group relative bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
                    <div className="flex flex-col mb-4">
                        <div className="w-10 h-10 bg-sky-700 rounded-full flex items-center justify-center shadow-lg shadow-sky-700/30 group-hover:scale-110 transition-transform mb-4">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-base font-semibold text-slate-700 tracking-tight">{t('Total Facilities')}</p>
                        <p className="text-xs font-normal text-slate-500 mt-1">{t('Easily track and manage all registered facilities and clients...')}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.totalFarmers ?? 0}</p>
                    </div>
                </div>

                {/* Card 2: Active Officers */}
                <div onClick={() => router.visit('/admin/live-monitor')} className="group relative bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
                    <div className="flex flex-col mb-4">
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center shadow-lg shadow-slate-900/10 group-hover:scale-110 transition-transform mb-4">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-base font-semibold text-slate-700 tracking-tight">{t('Active Field Staff')}</p>
                        <p className="text-xs font-normal text-slate-500 mt-1">{t('Monitor currently active technicians and inspectors...')}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.activeEmployees ?? 0}</p>
                    </div>
                </div>

                {/* Card 3: Total Service Visits */}
                <div onClick={() => router.visit('/admin/visits')} className="group relative bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer">
                    <div className="flex flex-col mb-4">
                        <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-teal-600/30 group-hover:scale-110 transition-transform mb-4">
                            <FileCheck2 className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-base font-semibold text-slate-700 tracking-tight">{t('Total Service Visits')}</p>
                        <p className="text-xs font-normal text-slate-500 mt-1">{t('Review facility audits, PM inspections, and maintenance records...')}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.totalVisits ?? 0}</p>
                        <span className="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full">
                            {stats?.weeklyVisits ?? 0} {t('Weekly Visits')}
                        </span>
                    </div>
                </div>

            </div>

            {/* ══════════ CRM ANALYTICS TIER ══════════ */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm mb-6 mt-2">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Growth Trajectory</h2>
                        <p className="text-sm font-medium text-slate-500 mt-1">Farmer Onboarding & Revenue (This Week)</p>
                    </div>
                    <button className="bg-slate-50 px-4 py-2 rounded-full border border-gray-100 hover:bg-slate-100 transition-colors">
                        <span className="text-sm font-bold text-slate-600">This Week</span>
                    </button>
                </div>
                
                <div className="flex justify-between items-end h-56 px-2 md:px-10">
                    {[
                        { day: "Mon", val: 30, rev: 120 },
                        { day: "Tue", val: 50, rev: 250 },
                        { day: "Wed", val: 45, rev: 200 },
                        { day: "Thu", val: 85, rev: 400 },
                        { day: "Fri", val: 65, rev: 300 },
                        { day: "Sat", val: 95, rev: 450 },
                        { day: "Sun", val: 70, rev: 350 },
                    ].map((item, index) => (
                        <div key={index} className="flex flex-col items-center group">
                            {/* Bar Container */}
                            <div className="w-8 md:w-12 h-full flex flex-row items-end justify-center gap-1 overflow-hidden relative">
                                {/* Value 1: Farmers */}
                                <div className="w-full bg-emerald-50 rounded-t-xl overflow-hidden h-full relative group-hover:-translate-y-2 transition-transform duration-300">
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl" style={{ height: `${item.val}%` }}></div>
                                </div>
                                {/* Value 2: Revenue */}
                                <div className="w-full bg-blue-50 rounded-t-xl overflow-hidden h-full relative group-hover:-translate-y-2 transition-transform duration-300 delay-75">
                                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl" style={{ height: `${(item.rev / 500) * 100}%` }}></div>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-wider">{item.day}</span>
                        </div>
                    ))}
                </div>
                
                {/* Legend */}
                <div className="flex justify-center items-center gap-8 mt-8 pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30"></div>
                        <span className="text-sm font-semibold text-slate-600">New Farmers</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-sm shadow-blue-500/30"></div>
                        <span className="text-sm font-semibold text-slate-600">Revenue Generation</span>
                    </div>
                </div>
            </div>
            {/* Middle Tier: Analytical Chart & Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* Interactive Map (Replaces Bar Chart) */}
                <div className="lg:col-span-2 shadow-sm border border-gray-100 flex flex-col relative rounded-[2rem] h-[500px]">
                    {isMapFullscreen ? (
                        createPortal(mapContent, document.body)
                    ) : (
                        mapContent
                    )}
                </div>

                {/* Event Stream Drawer Widget */}
                <div className={`bg-white rounded-[2rem] border border-gray-100 flex flex-col shadow-sm transition-all duration-300 ${!drawerOpen && !isMapFullscreen ? 'hidden' : 'flex'}`}>
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="relative flex h-2 w-2 mr-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-600 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-700"></span>
                            </span>
                            <h2 className="text-base sm:text-lg font-semibold text-slate-800 leading-none">{t('Live Logs')}</h2>
                        </div>
                        <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-900 transition-colors" />
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        {(() => {
                            const combinedLogs = [
                                ...recentVisits.map(v => ({ time: v.time, user: v.employee, event: t('Visited') + ' ' + v.farmer, type: 'success', icon: CheckCircle2 })),
                                ...liveLocationLogs.slice(0, 5).map(l => ({ time: 'Just now', user: l.employee?.name || 'Officer', event: t('Location Pinged'), type: 'info', icon: MapPin }))
                            ].slice(0, 5);

                            if (combinedLogs.length === 0) {
                                return <div className="text-center text-gray-400 text-sm mt-4">{t('No live logs currently available.')}</div>;
                            }

                            return combinedLogs.map((log, i) => (
                                <div key={i} className="flex items-start p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <div className={`p-2.5 rounded-xl mr-3 shadow-sm ${log.type === 'success' ? 'bg-slate-50 text-slate-800' : log.type === 'critical' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500 border border-gray-100 group-hover:border-gray-200'}`}>
                                        <log.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className="text-sm font-semibold text-slate-800">{log.user}</p>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {log.time}
                                            </span>
                                        </div>
                                        <p className={`text-xs font-medium ${log.type === 'critical' ? 'text-red-500' : 'text-gray-500'}`}>{log.event}</p>
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>



            {/* Bottom Tier: Map & Recent Activities */}
            <div className={`flex flex-col lg:flex-row gap-6 ${isMapFullscreen ? 'h-0 overflow-hidden' : ''}`}>
                


                {/* Recent Activities Table Widget */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col w-full">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800 leading-none">{t('Recent Activities')}</h2>
                        <div className="flex space-x-2">
                            <div className="relative hidden sm:block">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input type="text" placeholder={t('Search')} className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                            </div>
                            <button className="flex items-center px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
                                <Filter className="w-3 h-3 mr-1" /> {t('Filter')}
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[500px]">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t('Activity')}</th>
                                    <th className="py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t('Order ID')}</th>
                                    <th className="py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t('Date')}</th>
                                    <th className="py-4 px-6 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{t('Status')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentVisits.length > 0 ? (
                                    recentVisits.map((visit, i) => (
                                        <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                            <td className="py-4 px-6 text-sm font-semibold text-slate-800 flex items-center">
                                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center mr-3 group-hover:bg-white transition-colors">
                                                    <FileText className="w-4 h-4 text-gray-500" />
                                                </div>
                                                {t('Farm Visit')}: {visit.farmer}
                                            </td>
                                            <td className="py-4 px-6 text-xs font-medium text-gray-500">VIS_{visit.id}</td>
                                            <td className="py-4 px-6 text-xs font-medium text-gray-500">{visit.date}</td>
                                            <td className="py-4 px-6">
                                                <span className={`flex items-center text-xs font-semibold text-slate-800`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 bg-slate-800`}></span>
                                                    {t('Completed')}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-400 font-medium text-sm">
                                            {t('No recent activities found.')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Mobile Data Tier: Facilities & Approvals */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 ${isMapFullscreen ? 'hidden' : ''}`}>
                
                {/* Recent Facilities Widget */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800 leading-none flex items-center">
                            <Building2 className="w-5 h-5 mr-2 text-sky-600" /> {t('Recently Onboarded Facilities')}
                        </h2>
                        <button onClick={() => router.visit('/admin/farmers')} className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center transition-colors">
                            {t('View All')} <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                    </div>
                    <div className="p-4 space-y-3">
                        {recentFarmers.length > 0 ? (
                            recentFarmers.map((farmer, i) => (
                                <div key={i} onClick={() => router.visit(`/admin/farmers/${farmer.id}`)} className="flex items-center p-3 rounded-2xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 mr-4 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={farmer.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random`; }}
                                            alt={farmer.name} 
                                            className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{farmer.name}</p>
                                        <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">{farmer.farmer_code}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-semibold text-slate-700">{farmer.crop || 'Integrated FM'}</p>
                                        <p className="text-xs font-medium text-gray-500">{farmer.acres} {t('Sq. Ft / Units')}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 text-sm py-8">{t('No facilities onboarded yet.')}</div>
                        )}
                    </div>
                </div>

                {/* Pending Approvals Widget */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                        <h2 className="text-base sm:text-lg font-semibold text-slate-800 leading-none flex items-center">
                            <AlertCircle className="w-5 h-5 mr-2 text-amber-500" /> {t('Pending Facility Approvals')}
                        </h2>
                        <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-1 rounded-lg">
                            {pendingApprovals.length} {t('Pending')}
                        </span>
                    </div>
                    <div className="p-4 space-y-3">
                        {pendingApprovals.length > 0 ? (
                            pendingApprovals.map((approval, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/50 border border-orange-100/50 hover:bg-orange-50 transition-colors">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-semibold text-slate-800">{approval.name}</p>
                                        <div className="flex items-center mt-1 space-x-2">
                                            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{approval.farmer_code}</span>
                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                            <span className="text-xs font-medium text-gray-600">{approval.district}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => router.visit(`/admin/pending-farmers`)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:text-sky-600 hover:border-sky-200 transition-colors shadow-sm">
                                        {t('Review')}
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-400 text-sm py-8 flex flex-col items-center">
                                <CheckCircle2 className="w-8 h-8 text-sky-400 mb-2 opacity-50" />
                                {t('All caught up! No pending facility approvals.')}
                            </div>
                        )}
                    </div>
                </div>

            </div>
            
        </AdminLayout>
    );
}
