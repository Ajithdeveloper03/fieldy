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

export default function LiveMonitor({ employees: propEmployees = [] }) {
    const { t } = useTranslation();
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

    const regions = ['all', ...Array.from(new Set(employees.map(e => e.region).filter(Boolean)))];

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
    const totalVisits = employees.reduce((sum, e) => sum + (e.visitsDone || 0), 0);

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

    const mapMarkerIcon = L.divIcon({
        className: 'custom-icon',
        html: `
            <div style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="white" />
                    <circle cx="12" cy="12" r="7.5" fill="#F26A10" />
                    <circle cx="12" cy="12" r="3" fill="white" />
                </svg>
            </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    return (
        <AdminLayout>
            <Head title="Live Field Monitor - Fieldy" />

            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="hp-chip hp-chip-success hp-chip-dot">LIVE STREAM</span>
                            <span className="text-xs text-hp-muted">Refreshed {lastRefreshed}</span>
                        </div>
                        <h1 className="hp-page-title">{t('Live Officer & Telemetry Monitor')}</h1>
                        <p className="text-sm text-hp-muted mt-1">
                            {t('Real-time GPS positioning, battery health, geofence compliance, and live dispatch logs.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="hp-btn hp-btn-secondary"
                        >
                            <RefreshCw className="w-4 h-4 mr-1.5" />
                            {t('Refresh Data')}
                        </button>
                    </div>
                </div>

                {/* hPanel KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="hp-card p-5">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Active Field Staff')}</span>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark mt-1">
                            {activeCount} <span className="text-sm font-normal text-hp-muted">/ {employees.length}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="hp-chip hp-chip-success !h-5 !text-[11px] hp-chip-dot">{t('On Duty')}</span>
                        </div>
                    </div>

                    <div className="hp-card p-5">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Offline / No GPS')}</span>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark mt-1">
                            {offlineCount}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className={`hp-chip !h-5 !text-[11px] ${offlineCount > 0 ? 'hp-chip-danger' : 'hp-chip-gray'}`}>
                                {offlineCount > 0 ? 'Alert Triggered' : 'All Clear'}
                            </span>
                        </div>
                    </div>

                    <div className="hp-card p-5">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total Visits Completed')}</span>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark mt-1">
                            {totalVisits}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="hp-chip hp-chip-primary !h-5 !text-[11px]">{t('Today')}</span>
                        </div>
                    </div>

                    <div className="hp-card p-5">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Active Geofence Pings')}</span>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark mt-1">
                            {employees.filter(e => e.isOnline || e.status === 'active').length}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                            <span className="hp-chip hp-chip-info !h-5 !text-[11px]">Telemetry Ok</span>
                        </div>
                    </div>
                </div>

                {/* Main 2-Column Monitor Interface */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Officer Directory & Selection */}
                    <div className="lg:col-span-1 hp-card overflow-hidden flex flex-col max-h-[820px]">
                        <div className="hp-card-header !p-4 flex-col gap-3">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-hp-muted pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder={t('Search officers or location...')}
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="hp-input !pl-9"
                                />
                            </div>
                            <div className="flex gap-2 w-full">
                                {/* Status Filter */}
                                <div className="relative flex-1">
                                    <button
                                        onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowRegionDropdown(false); }}
                                        className="hp-btn hp-btn-secondary !h-9 w-full justify-between text-xs font-semibold"
                                    >
                                        <span>{statusFilter === 'all' ? t('All Status') : statusFilter.toUpperCase()}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-hp-muted ml-1" />
                                    </button>
                                    {showStatusDropdown && (
                                        <div className="hp-pop absolute top-full mt-1 left-0 right-0 bg-white border border-hp-border rounded-xl shadow-[var(--shadow-hp-lg)] z-30 py-1 overflow-hidden">
                                            {['all', 'active', 'idle', 'offline'].map(s => (
                                                <button 
                                                    key={s} 
                                                    onClick={() => { setStatusFilter(s); setShowStatusDropdown(false); }}
                                                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-hp-hover transition-colors ${statusFilter === s ? 'text-hp-primary bg-hp-primary-light font-bold' : 'text-hp-dark'}`}
                                                >
                                                    {s === 'all' ? t('All Status') : s.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Region Filter */}
                                <div className="relative flex-1">
                                    <button
                                        onClick={() => { setShowRegionDropdown(!showRegionDropdown); setShowStatusDropdown(false); }}
                                        className="hp-btn hp-btn-secondary !h-9 w-full justify-between text-xs font-semibold"
                                    >
                                        <span className="truncate">{regionFilter === 'all' ? t('All Regions') : regionFilter}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-hp-muted ml-1" />
                                    </button>
                                    {showRegionDropdown && (
                                        <div className="hp-pop absolute top-full mt-1 left-0 right-0 bg-white border border-hp-border rounded-xl shadow-[var(--shadow-hp-lg)] z-30 py-1 overflow-hidden">
                                            {regions.map(r => (
                                                <button 
                                                    key={r} 
                                                    onClick={() => { setRegionFilter(r); setShowRegionDropdown(false); }}
                                                    className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-hp-hover transition-colors ${regionFilter === r ? 'text-hp-primary bg-hp-primary-light font-bold' : 'text-hp-dark'}`}
                                                >
                                                    {r === 'all' ? t('All Regions') : r}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-hp-border">
                            {filteredEmployees.length === 0 ? (
                                <div className="p-8 text-center text-xs text-hp-muted font-medium">No field staff matching filter.</div>
                            ) : (
                                filteredEmployees.map(emp => {
                                    const isSelected = selectedEmployee?.id === emp.id;
                                    return (
                                        <button
                                            key={emp.id}
                                            onClick={() => setSelectedEmployee(emp)}
                                            className={`w-full text-left p-4 transition-colors ${isSelected ? 'bg-hp-primary-light/50 border-l-4 border-l-hp-primary' : 'hover:bg-hp-hover'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-full bg-hp-dark text-white font-bold text-xs flex items-center justify-center shrink-0">
                                                    {(emp.name || 'O').charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <p className="font-bold text-sm text-hp-dark truncate">{emp.name}</p>
                                                        <span className={`hp-chip !h-5 !px-1.5 !text-[10px] ${emp.status === 'active' ? 'hp-chip-success hp-chip-dot' : 'hp-chip-gray'}`}>
                                                            {emp.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-hp-muted truncate mt-0.5">{emp.currentLocation || 'Location updating…'}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-[11px] text-hp-muted">
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{emp.lastSeen || 'Recent'}</span>
                                                        <span className="flex items-center gap-1 font-semibold"><Battery className="w-3 h-3 text-hp-primary" />{emp.battery || 85}%</span>
                                                        <span className="flex items-center gap-1">
                                                            {emp.gps === 'enabled' ? <Wifi className="w-3 h-3 text-hp-success" /> : <WifiOff className="w-3 h-3 text-hp-danger" />}
                                                            GPS
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right: Selected Employee Map & Detail */}
                    {selectedEmployee ? (
                        <div className="lg:col-span-2 space-y-6">

                            {/* Interactive Live Map View */}
                            {(() => {
                                const mapComponent = (
                                    <div className={`hp-card overflow-hidden relative flex flex-col ${isMapFullscreen ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none' : 'h-[440px]'}`}>
                                        <div className="absolute top-3 right-3 z-[500] flex items-center gap-2">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsMapFullscreen(!isMapFullscreen);
                                                }}
                                                className="hp-icon-btn !bg-white border border-hp-border shadow-[var(--shadow-hp-md)]"
                                                title={isMapFullscreen ? t('Exit fullscreen') : t('Fullscreen')}
                                            >
                                                {isMapFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        <div className="w-full h-full relative">
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
                                                        color="#F26A10" 
                                                        weight={4} 
                                                        opacity={0.85}
                                                        lineCap="round"
                                                        lineJoin="round"
                                                    />
                                                )}
                                                {selectedEmployee.latitude && selectedEmployee.longitude && (
                                                    <Marker
                                                        position={[parseFloat(selectedEmployee.latitude), parseFloat(selectedEmployee.longitude)]}
                                                        icon={mapMarkerIcon}
                                                    />
                                                )}
                                            </MapContainer>
                                        </div>
                                    </div>
                                );

                                return isMapFullscreen ? createPortal(mapComponent, document.body) : mapComponent;
                            })()}

                            {/* Hostinger-style Officer Profile Card */}
                            <div className="hp-card p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hp-border">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-xl bg-hp-dark text-white font-bold text-xl flex items-center justify-center shrink-0">
                                            {(selectedEmployee.name || 'O').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-lg font-bold text-hp-dark">{selectedEmployee.name}</h2>
                                                <span className={`hp-chip ${selectedEmployee.status === 'active' ? 'hp-chip-success hp-chip-dot' : 'hp-chip-gray'}`}>
                                                    {selectedEmployee.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-hp-muted mt-0.5">{selectedEmployee.role || 'Field Technician'} • {selectedEmployee.region || 'Assigned Zone'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="hp-btn hp-btn-sm hp-btn-secondary" title="Call">
                                            <Phone className="w-3.5 h-3.5 mr-1 text-hp-primary" /> {t('Call')}
                                        </button>
                                        <button className="hp-btn hp-btn-sm hp-btn-secondary" title="Message">
                                            <MessageSquare className="w-3.5 h-3.5 mr-1" /> {t('Message')}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                                    <div className="p-3.5 bg-hp-bg rounded-lg border border-hp-border">
                                        <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Current Location')}</p>
                                        <p className="text-sm font-semibold text-hp-dark flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-hp-primary shrink-0" />
                                            <span className="truncate">{selectedEmployee.currentLocation || 'Coimbatore Perimeter'}</span>
                                        </p>
                                    </div>
                                    <div className="p-3.5 bg-hp-bg rounded-lg border border-hp-border">
                                        <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Attendance / Shift')}</p>
                                        <p className="text-sm font-semibold text-hp-dark flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-hp-info shrink-0" />
                                            <span>Check-in: {selectedEmployee.checkInTime || '08:30 AM'}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t("Today's Visit Target")}</span>
                                        <span className="text-sm font-bold text-hp-dark">{selectedEmployee.visitsDone || 0} / {selectedEmployee.visitsTarget || 6}</span>
                                    </div>
                                    <div className="w-full bg-hp-hover rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-2.5 rounded-full bg-hp-primary transition-all duration-500"
                                            style={{ width: `${Math.min(100, Math.round(((selectedEmployee.visitsDone || 0) / (selectedEmployee.visitsTarget || 6)) * 100))}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Activity Log */}
                            <div className="hp-card">
                                <div className="hp-card-header">
                                    <h3 className="hp-card-title flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-hp-primary" /> {t("Today's Activity Timeline")}
                                    </h3>
                                    <span className="text-xs text-hp-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                </div>

                                <div className="p-6">
                                    {!selectedEmployee.activities || selectedEmployee.activities.length === 0 ? (
                                        <div className="py-8 text-center text-xs text-hp-muted font-medium">
                                            No activity logs recorded yet today.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {selectedEmployee.activities.map((act, idx) => (
                                                <div key={idx} className="flex items-start gap-3.5">
                                                    <span className="w-8 h-8 rounded-lg bg-hp-primary-light text-hp-primary flex items-center justify-center shrink-0">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm font-bold text-hp-dark">{act.action}</p>
                                                            <span className="text-xs text-hp-muted">{act.time}</span>
                                                        </div>
                                                        <p className="text-xs text-hp-muted mt-0.5">{act.location}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="lg:col-span-2 hp-card p-16 text-center text-sm text-hp-muted">
                            Select an officer from the list to view real-time location telemetry.
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
