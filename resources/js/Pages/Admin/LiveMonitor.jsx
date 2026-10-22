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
    TrendingUp, Filter, RefreshCw, Eye, MessageSquare, Maximize, Minimize,
    Sparkles, ArrowRight, ShieldCheck, ArrowUpRight
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

                {/* ══════════ HOSTINGER HERO CARD (Soft Minimal Slate Gradient) ══════════ */}
                <div className="hp-card-gradient-slate rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-success hp-chip-dot">
                                    {t('Real-Time Fleet Telemetry Active')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {t('Refreshed')} {lastRefreshed}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t('Live Officer & Telemetry Command Center')}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t('Real-time GPS positioning, battery health, geofence compliance, and live dispatch logs for all field technicians on duty.')}
                            </p>

                            {/* Hostinger Pill Search Bar */}
                            <div className="mt-5 max-w-lg">
                                <div className="hp-search-pill-bar !bg-white !shadow-xs">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={t('Search officers, regions, or current locations...')}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Hostinger Refresh Button */}
                        <div className="shrink-0 self-start lg:self-center">
                            <button
                                onClick={handleRefresh}
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <RefreshCw className="w-4 h-4 mr-1.5" />
                                <span>{t('Refresh Telemetry')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS ══════════ */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Staff On Duty')}</span>
                            <span className="w-2 h-2 rounded-full bg-hp-success animate-ping"></span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">
                            {activeCount} <span className="text-sm font-normal text-hp-muted">/ {employees.length}</span>
                        </div>
                        <p className="text-xs text-hp-success font-medium mt-1">{t('Actively streaming GPS')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Offline / No GPS')}</span>
                            <ShieldAlert className="w-3.5 h-3.5 text-hp-danger" />
                        </div>
                        <div className={`text-2xl sm:text-3xl font-bold ${offlineCount > 0 ? 'text-hp-danger' : 'text-hp-dark'}`}>
                            {offlineCount}
                        </div>
                        <p className="text-xs text-hp-muted mt-1">{offlineCount > 0 ? t('Alert flag active') : t('All nodes normal')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Audits Completed Today')}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-hp-primary" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">
                            {totalVisits}
                        </div>
                        <p className="text-xs text-hp-success font-medium mt-1">98.4% {t('On-time SLA')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Geofence Heartbeat')}</span>
                            <Wifi className="w-3.5 h-3.5 text-hp-info" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">
                            100%
                        </div>
                        <p className="text-xs text-hp-muted mt-1">{t('No perimeter breaches')}</p>
                    </div>
                </div>

                {/* ══════════ HOSTINGER SEGMENTED STATUS & REGION PILLS ══════════ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="hp-segmented-bar">
                        {[
                            { id: 'all', label: 'All Staff' },
                            { id: 'active', label: 'Active on Duty' },
                            { id: 'offline', label: 'Offline' },
                        ].map((s) => (
                            <button
                                key={s.id}
                                onClick={() => setStatusFilter(s.id)}
                                className={`hp-segmented-item ${statusFilter === s.id ? 'is-active-primary' : ''}`}
                            >
                                {t(s.label)}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mr-1">{t('Region')}:</span>
                        {regions.map((r) => (
                            <button
                                key={r}
                                onClick={() => setRegionFilter(r)}
                                className={`hp-pill !h-8 !text-xs ${regionFilter === r ? '!bg-hp-dark !text-white !border-hp-dark' : ''}`}
                            >
                                {r === 'all' ? t('All Regions') : r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ══════════ HOSTINGER 2-COLUMN SPLIT BENTO MONITOR ══════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Officer Directory Roster */}
                    <div className="lg:col-span-1 hp-bento-card !p-0 overflow-hidden flex flex-col max-h-[820px]">
                        <div className="p-4 border-b border-hp-border flex items-center justify-between">
                            <h3 className="hp-card-title text-sm">{t('Field Technicians')}</h3>
                            <span className="text-xs text-hp-muted font-medium">
                                {filteredEmployees.length} {t('Active')}
                            </span>
                        </div>

                        {/* Staff Cards List */}
                        <div className="flex-1 overflow-y-auto divide-y divide-hp-border">
                            {filteredEmployees.length === 0 ? (
                                <div className="p-8 text-center text-xs text-hp-muted font-medium">
                                    {t('No field staff matching filter.')}
                                </div>
                            ) : (
                                filteredEmployees.map(emp => {
                                    const isSelected = selectedEmployee?.id === emp.id;
                                    return (
                                        <div
                                            key={emp.id}
                                            onClick={() => setSelectedEmployee(emp)}
                                            className={`p-4 transition-all cursor-pointer ${
                                                isSelected 
                                                    ? 'bg-hp-primary-light/60 border-l-4 border-l-hp-primary' 
                                                    : 'hover:bg-hp-hover/60'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-hp-dark text-white font-bold text-xs flex items-center justify-center shrink-0">
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
                                                        <span className="flex items-center gap-1 font-semibold">
                                                            <Battery className="w-3.5 h-3.5 text-hp-primary" />{emp.battery || 85}%
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            {emp.gps === 'enabled' ? (
                                                                <Wifi className="w-3 h-3 text-hp-success" />
                                                            ) : (
                                                                <WifiOff className="w-3 h-3 text-hp-danger" />
                                                            )}
                                                            GPS
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />{emp.lastSeen || 'Just now'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right: Selected Employee Map & Detail */}
                    {selectedEmployee ? (
                        <div className="lg:col-span-2 space-y-6">

                            {/* Interactive Live Map View in Hostinger Card */}
                            {(() => {
                                const mapComponent = (
                                    <div className={`hp-bento-card !p-0 overflow-hidden relative flex flex-col ${isMapFullscreen ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none' : 'h-[440px]'}`}>
                                        {/* Floating Map Controls */}
                                        <div className="absolute top-4 right-4 z-[500] flex items-center gap-2">
                                            <div className="bg-white/95 backdrop-blur-sm border border-hp-border px-3 py-1.5 rounded-full text-xs font-bold text-hp-dark shadow-sm flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-hp-primary animate-ping"></span>
                                                <span>{selectedEmployee.name}</span>
                                            </div>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsMapFullscreen(!isMapFullscreen);
                                                }}
                                                className="hp-icon-btn !bg-white border border-hp-border shadow-[var(--shadow-hp-md)] !w-9 !h-9 !rounded-full"
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
                            <div className="hp-bento-card">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hp-border">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-hp-dark text-white font-bold text-xl flex items-center justify-center shrink-0">
                                            {(selectedEmployee.name || 'O').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-lg font-bold text-hp-dark">{selectedEmployee.name}</h2>
                                                <span className={`hp-chip ${selectedEmployee.status === 'active' ? 'hp-chip-success hp-chip-dot' : 'hp-chip-gray'}`}>
                                                    {selectedEmployee.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-hp-muted mt-0.5">{selectedEmployee.role || 'Senior Field Engineer'} • {selectedEmployee.region || 'Assigned Zone'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="hp-btn hp-btn-sm hp-btn-outline !rounded-xl" title="Call">
                                            <Phone className="w-3.5 h-3.5 mr-1 text-hp-primary" /> {t('Call')}
                                        </button>
                                        <button className="hp-btn hp-btn-sm hp-btn-secondary !rounded-xl" title="Message">
                                            <MessageSquare className="w-3.5 h-3.5 mr-1" /> {t('Message')}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                                    <div className="p-4 bg-hp-hover/60 rounded-xl border border-hp-border">
                                        <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Current Location')}</p>
                                        <p className="text-sm font-semibold text-hp-dark flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-hp-primary shrink-0" />
                                            <span className="truncate">{selectedEmployee.currentLocation || 'Coimbatore Perimeter'}</span>
                                        </p>
                                    </div>
                                    <div className="p-4 bg-hp-hover/60 rounded-xl border border-hp-border">
                                        <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Shift Attendance')}</p>
                                        <p className="text-sm font-semibold text-hp-dark flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-hp-info shrink-0" />
                                            <span>Check-in: {selectedEmployee.checkInTime || '08:30 AM'}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Target Progress */}
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

                        </div>
                    ) : (
                        <div className="lg:col-span-2 hp-bento-card p-16 text-center text-sm text-hp-muted">
                            {t('Select an officer from the list to view real-time location telemetry.')}
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
