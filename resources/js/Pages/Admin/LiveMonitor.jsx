import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from './AdminLayout';
import { Head, router } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}
import {
    ShieldAlert, MapPin, Clock, Activity, Search,
    CheckCircle2, AlertTriangle, Wifi, WifiOff, Phone,
    Battery, Navigation, Calendar, ChevronDown, User,
    TrendingUp, Filter, RefreshCw, Eye, MessageSquare, Maximize, Minimize
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const getStatusStyle = (status) => {
    if (status === 'active') return { badge: 'bg-slate-100 text-green-700', dot: 'bg-green-400' };
    if (status === 'idle') return { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-400' };
    return { badge: 'bg-gray-100 text-gray-500', dot: 'bg-gray-300' };
};

const getActivityStyle = (type) => {
    if (type === 'checkin') return 'text-slate-800 bg-slate-50';
    if (type === 'visit') return 'text-slate-800 bg-slate-50';
    if (type === 'form') return 'text-orange-600 bg-orange-50';
    return 'text-gray-500 bg-gray-50';
};

const getBatteryColor = (level) => {
    if (level > 50) return 'text-slate-800';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
};

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '2rem'
};

// Map styling removed as OpenFreeMap uses its own style url

export default function LiveMonitor({ employees: propEmployees = [] }) {
    const { t } = useTranslation();
    
    const dummyEmployees = [
        {
            id: 1,
            name: "Muthusamy",
            role: "Field Officer",
            region: "Coimbatore",
            status: "active",
            currentLocation: "Farm #294 (Muthusamy)",
            latitude: 11.0168,
            longitude: 76.9558,
            lastSeen: "Just now",
            battery: 85,
            gps: "enabled",
            checkInTime: "08:30 AM",
            visitsDone: 4,
            visitsTarget: 6,
            activities: [
                { type: "checkin", action: "Marked Morning Attendance", time: "08:30 AM", location: "HQ Office" },
                { type: "visit", action: "Checked in at Farm #294", time: "09:40 AM", location: "Coimbatore South" },
                { type: "form", action: "Submitted Soil Quality Report", time: "10:15 AM", location: "Coimbatore South" }
            ]
        },
        {
            id: 2,
            name: "Karthikeyan",
            role: "Agronomy Expert",
            region: "Pollachi",
            status: "active",
            currentLocation: "En route to Farm #112",
            latitude: 10.6622,
            longitude: 77.0028,
            lastSeen: "2 mins ago",
            battery: 45,
            gps: "enabled",
            checkInTime: "09:00 AM",
            visitsDone: 2,
            visitsTarget: 5,
            activities: [
                { type: "checkin", action: "Started shift", time: "09:00 AM", location: "Pollachi Town" },
                { type: "visit", action: "Completed audit at Farm #098", time: "10:30 AM", location: "Pollachi North" }
            ]
        },
        {
            id: 3,
            name: "Anitha R",
            role: "Quality Inspector",
            region: "Tirupur",
            status: "offline",
            currentLocation: "Last known: Tirupur Main Market",
            latitude: 11.1085,
            longitude: 77.3411,
            lastSeen: "2 hours ago",
            battery: 12,
            gps: "disabled",
            checkInTime: "07:45 AM",
            visitsDone: 1,
            visitsTarget: 4,
            activities: [
                { type: "checkin", action: "Marked Morning Attendance", time: "07:45 AM", location: "Tirupur Base" },
                { type: "visit", action: "Market vendor inspection", time: "08:20 AM", location: "Tirupur Main Market" },
                { type: "break", action: "Turned OFF GPS. Red Alert Triggered.", time: "09:42 AM", location: "Unknown" }
            ]
        }
    ];

    const [employees, setEmployees] = useState(propEmployees);
    
    useEffect(() => {
        setEmployees(propEmployees);
    }, [propEmployees]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [regionFilter, setRegionFilter] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState(employees[0] || null);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [showRegionDropdown, setShowRegionDropdown] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    // MapLibre doesn't require script loading hook

    const regions = ['all', ...Array.from(new Set(employees.map(e => e.region)))];

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = String(emp.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(emp.region || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                String(emp.currentLocation || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
            const matchesRegion = regionFilter === 'all' || emp.region === regionFilter;
            return matchesSearch && matchesStatus && matchesRegion;
        });
    }, [searchQuery, statusFilter, regionFilter, employees]);

    const activeCount = employees.filter(e => e.status === 'active').length;
    const offlineCount = employees.filter(e => e.status === 'offline').length;
    const totalVisits = employees.reduce((sum, e) => sum + e.visitsDone, 0);

    const handleRefresh = () => {
        router.reload({ only: ['employees'], preserveScroll: true, preserveState: true, onSuccess: () => setLastRefreshed(new Date().toLocaleTimeString()) });
    };

    useEffect(() => {
        
        if (window.Echo) {
            window.Echo.channel('live-tracking')
                .listen('.LocationUpdated', (e) => {
                    setEmployees(prev => {
                        const newEmps = [...prev];
                        const index = newEmps.findIndex(emp => emp.id === e.employeeId);
                        if (index !== -1) {
                            newEmps[index] = {
                                ...newEmps[index],
                                latitude: e.latitude,
                                longitude: e.longitude,
                                lastSeen: 'Just now',
                                battery: e.batteryLevel,
                                gps: e.isGpsEnabled ? 'enabled' : 'disabled'
                            };
                            return newEmps;
                        }
                        return prev;
                    });
                    
                    // Also update selected employee if they are currently being viewed
                    setSelectedEmployee(prev => {
                        if (prev && prev.id === e.employeeId) {
                            return {
                                ...prev,
                                latitude: e.latitude,
                                longitude: e.longitude,
                                lastSeen: 'Just now',
                                battery: e.batteryLevel,
                                gps: e.isGpsEnabled ? 'enabled' : 'disabled'
                            };
                        }
                        return prev;
                    });
                    
                    setLastRefreshed(new Date().toLocaleTimeString());
                });
        }
        
        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('live-tracking');
            }
        };
    }, []);

    return (
        <AdminLayout>
            <Head title="Live Employee Monitor - Fieldy Admin" />

            {/* Page Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-slate-800">{t('Live Employee Monitor')}</h1>
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-green-700 text-xs font-semibold">
                            <span className="h-2 w-2 rounded-full bg-slate-800 animate-pulse"></span> LIVE
                        </span>
                    </div>
                    <p className="text-gray-500 font-medium">Real-time activity tracking for all field officers. Last refreshed: <strong>{lastRefreshed}</strong></p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
                </button>
            </div>

            {/* Summary KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg">
                    <p className="text-green-200 text-xs font-bold uppercase tracking-wider">Active Officers</p>
                    <p className="text-4xl font-extrabold mt-1">{activeCount}<span className="text-green-300 text-lg font-bold">/{employees.length}</span></p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Offline / No GPS</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-4xl font-extrabold text-gray-900">{offlineCount}</p>
                        {offlineCount > 0 && <AlertTriangle className="w-5 h-5 text-red-500 mb-1" />}
                    </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Visits Today</p>
                    <p className="text-4xl font-extrabold text-gray-900 mt-1">{totalVisits}</p>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{t('Active Geofence Pings')}</p>
                    <div className="flex items-end gap-2 mt-1">
                        <p className="text-4xl font-extrabold text-emerald-600">{employees.filter(e => e.isOnline).length}</p>
                        <Navigation className="w-5 h-5 text-emerald-500 mb-1" />
                    </div>
                </div>
            </div>

            {/* Main Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Employee List Panel */}
                <div className="lg:col-span-1 bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
                    
                    {/* Search + Filters */}
                    <div className="p-4 border-b border-gray-100 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search officers or location..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            {/* Status Filter Dropdown */}
                            <div className="relative flex-1">
                                <button
                                    onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowRegionDropdown(false); }}
                                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100"
                                >
                                    <span className="flex items-center gap-1"><Filter className="w-3 h-3" /> {statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                {showStatusDropdown && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
                                        {['all', 'active', 'idle', 'offline'].map(s => (
                                            <button key={s} onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); }}
                                                className={`w-full text-left px-4 py-2 text-xs font-bold capitalize hover:bg-gray-50 transition-colors ${statusFilter === s ? 'text-slate-800' : 'text-gray-700'}`}>
                                                {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {/* Region Filter Dropdown */}
                            <div className="relative flex-1">
                                <button
                                    onClick={() => { setShowRegionDropdown(!showRegionDropdown); setShowStatusDropdown(false); }}
                                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100"
                                >
                                    <span>{regionFilter === 'all' ? 'All Regions' : regionFilter}</span>
                                    <ChevronDown className="w-3 h-3" />
                                </button>
                                {showRegionDropdown && (
                                    <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
                                        {regions.map(r => (
                                            <button key={r} onClick={() => { setRegionFilter(r); setShowRegionDropdown(false); }}
                                                className={`w-full text-left px-4 py-2 text-xs font-bold capitalize hover:bg-gray-50 transition-colors ${regionFilter === r ? 'text-slate-800' : 'text-gray-700'}`}>
                                                {r === 'all' ? 'All Regions' : r}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Employee Card List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                        {filteredEmployees.length === 0 && (
                            <div className="p-8 text-center text-gray-400 text-sm font-medium">No officers match your search.</div>
                        )}
                        {filteredEmployees.map(emp => {
                            const style = getStatusStyle(emp.status);
                            const isSelected = selectedEmployee?.id === emp.id;
                            return (
                                <button
                                    key={emp.id}
                                    onClick={() => setSelectedEmployee(emp)}
                                    className={`w-full text-left p-4 transition-colors ${isSelected ? 'bg-slate-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={`relative w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${emp.status === 'active' ? 'bg-slate-800' : 'from-gray-400 to-gray-500'}`}>
                                            {emp.name.charAt(0)}
                                            <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${style.dot}`}></span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-bold text-sm text-gray-900 truncate">{emp.name}</p>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ml-1 flex-shrink-0 ${style.badge}`}>
                                                    {emp.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium truncate">{emp.currentLocation}</p>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="flex items-center text-[10px] font-bold text-gray-400">
                                                    <Clock className="w-3 h-3 mr-1" />{emp.lastSeen}
                                                </span>
                                                <span className={`flex items-center text-[10px] font-bold ${getBatteryColor(emp.battery)}`}>
                                                    <Battery className="w-3 h-3 mr-1" />{emp.battery}%
                                                </span>
                                                <span className="flex items-center text-[10px] font-bold text-gray-400">
                                                    {emp.gps === 'enabled' ? <Wifi className="w-3 h-3 mr-1 text-slate-700" /> : <WifiOff className="w-3 h-3 mr-1 text-red-500" />}
                                                    GPS
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Employee Detail Panel */}
                {selectedEmployee && (
                    <div className="lg:col-span-2 space-y-6">

                        {/* Map View */}
                        {(() => {
                            const mapComponent = (
                                <div className={`bg-white border border-gray-100 shadow-sm relative overflow-hidden flex flex-col ${isMapFullscreen ? 'fixed top-0 left-0 right-0 bottom-0 z-[99999] w-[100vw] h-[100vh] m-0 rounded-none' : 'rounded-[2rem] p-4 h-[400px]'}`}>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsMapFullscreen(!isMapFullscreen);
                                        }}
                                        className="absolute top-8 right-8 z-50 bg-white/90 backdrop-blur-md border border-gray-200 p-2.5 rounded-xl shadow-sm hover:text-slate-800 transition-colors"
                                    >
                                        {isMapFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                                    </button>
                                    
                                    <div className="flex-1 w-full h-full relative rounded-2xl overflow-hidden">
                                        <MapContainer
                                            center={[parseFloat(selectedEmployee.latitude) || 12.9716, parseFloat(selectedEmployee.longitude) || 77.5946]}
                                            zoom={14}
                                            style={{ width: '100%', height: '100%', zIndex: 0 }}
                                        >
                                            <ChangeView center={[parseFloat(selectedEmployee.latitude) || 12.9716, parseFloat(selectedEmployee.longitude) || 77.5946]} zoom={14} />
                                            <TileLayer
                                                attribution='&copy; Google Maps'
                                                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                            />
                                            {selectedEmployee.recentPath && selectedEmployee.recentPath.length > 1 && (
                                                <Polyline 
                                                    positions={selectedEmployee.recentPath.map(p => [p.lat, p.lng])} 
                                                    color="#10B981" 
                                                    weight={4} 
                                                    opacity={0.8}
                                                    lineCap="round"
                                                    lineJoin="round"
                                                />
                                            )}
                                            {selectedEmployee.latitude && selectedEmployee.longitude && (
                                                <Marker
                                                    position={[parseFloat(selectedEmployee.latitude), parseFloat(selectedEmployee.longitude)]}
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
                                            )}
                                        </MapContainer>
                                    </div>
                                </div>
                            );

                            return isMapFullscreen ? createPortal(mapComponent, document.body) : mapComponent;
                        })()}

                        {/* Maximalist Profile Header */}
                        <div className="bg-white rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 relative group">
                            {/* Cover Image */}
                            <div className="h-32 relative overflow-hidden">
                                <img src={`/images/image${(selectedEmployee.id % 12) + 1}.jpg`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors" title="Call">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-colors" title="Message">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="px-6 pb-6 pt-0 relative">
                                <div className="flex flex-col items-start">
                                    <div className="w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center bg-white shadow-xl border-4 border-white -mt-10 relative z-10 overflow-hidden">
                                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEmployee.name)}&background=random`} alt={selectedEmployee.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="mt-3 w-full">
                                        <div className="flex items-center justify-between mb-1">
                                            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">{selectedEmployee.name}</h2>
                                            <span className={`text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-xl shadow-sm ${getStatusStyle(selectedEmployee.status).badge}`}>
                                                {selectedEmployee.status}
                                            </span>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{selectedEmployee.role} • {selectedEmployee.region}</p>
                                        
                                        <div className="flex flex-col gap-2 mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                            <span className="flex items-center text-xs font-medium text-slate-700">
                                                <MapPin className="w-4 h-4 mr-2 text-emerald-500" /> {selectedEmployee.currentLocation}
                                            </span>
                                            <span className="flex items-center text-xs font-medium text-slate-700">
                                                <Clock className="w-4 h-4 mr-2 text-blue-500" /> Check-in: {selectedEmployee.checkInTime}
                                            </span>
                                        </div>
                                    </div>
                                </div>


                            {/* Progress Bar */}
                            <div className="mt-5 pt-5 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Visit Progress</span>
                                    <span className="text-sm font-semibold text-slate-800">{selectedEmployee.visitsDone} / {selectedEmployee.visitsTarget}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="h-2.5 rounded-full bg-slate-800 transition-all duration-700"
                                        style={{ width: `${(selectedEmployee.visitsDone / selectedEmployee.visitsTarget) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between mt-1.5">
                                    <span className="text-[10px] text-gray-400 font-medium">{Math.round((selectedEmployee.visitsDone / selectedEmployee.visitsTarget) * 100)}% complete</span>
                                    <span className="text-[10px] text-gray-400 font-medium">{selectedEmployee.visitsTarget - selectedEmployee.visitsDone} remaining</span>
                                </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Timeline */}
                        <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-slate-700" /> Today's Activity Log
                                </h3>
                                <span className="text-xs font-bold text-gray-400">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                            </div>

                            {selectedEmployee.activities.length === 0 ? (
                                <div className="py-12 text-center text-gray-400 text-sm font-medium flex flex-col items-center gap-2">
                                    <AlertTriangle className="w-10 h-10 text-gray-300" />
                                    No activity recorded today. This officer has not checked in.
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-100"></div>
                                    <div className="space-y-4">
                                        {selectedEmployee.activities.map((activity, idx) => (
                                            <div key={idx} className="flex items-start gap-4 relative">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${getActivityStyle(activity.type)}`}>
                                                    {activity.type === 'checkin' && <User className="w-4 h-4" />}
                                                    {activity.type === 'visit' && <MapPin className="w-4 h-4" />}
                                                    {activity.type === 'form' && <CheckCircle2 className="w-4 h-4" />}
                                                    {activity.type === 'break' && <Clock className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 pb-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-bold text-sm text-gray-900">{activity.action}</p>
                                                        <span className="text-xs text-gray-400 font-bold">{activity.time}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium mt-0.5">{activity.location}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
