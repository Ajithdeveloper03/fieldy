import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from './AdminLayout';
import { Head, router } from '@inertiajs/react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { createFieldEmployeeIcon } from '../../lib/mapIcons';

// Fix Leaflet's default icon path issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ChangeView({ center, zoom, fullscreen }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 60);
    return () => clearTimeout(timer);
  }, [center, zoom, fullscreen, map]);
  return null;
}

import {
    ShieldAlert, MapPin, Clock, Search,
    CheckCircle2, Wifi, WifiOff, Phone,
    Battery, Navigation, MessageSquare, Maximize, Minimize,
    RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../hooks/useIndustry';

export default function LiveMonitor({ employees: propEmployees = [] }) {
    const { t } = useTranslation();
    const { vocab, labels, industry } = useIndustry();

    const [employees, setEmployees] = useState(propEmployees);
    
    useEffect(() => {
        setEmployees(propEmployees);
    }, [propEmployees]);

    useEffect(() => {
        let active = true;
        const refreshLiveData = async () => {
            try {
                const response = await fetch(`${window.location.pathname.replace(/\/$/, '')}/live`, {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                if (!response.ok) return;
                const data = await response.json();
                if (active && Array.isArray(data.employees)) {
                    setEmployees(data.employees);
                    setLastRefreshed(new Date().toLocaleTimeString());
                }
            } catch (error) {
                console.error('Live monitor refresh failed', error);
            }
        };
        void refreshLiveData();
        const timer = window.setInterval(refreshLiveData, 5000);
        return () => {
            active = false;
            window.clearInterval(timer);
        };
    }, []);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [regionFilter, setRegionFilter] = useState('all');
    const [selectedEmployee, setSelectedEmployee] = useState(employees[0] || null);
    const [lastRefreshed, setLastRefreshed] = useState(new Date().toLocaleTimeString());
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    useEffect(() => {
        if (selectedEmployee) {
            const latest = employees.find((employee) => String(employee.id) === String(selectedEmployee.id));
            if (latest) setSelectedEmployee(latest);
        } else if (employees.length) {
            setSelectedEmployee(employees[0]);
        }
    }, [employees]);

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

    const mapMarkerIcon = useMemo(
        () => createFieldEmployeeIcon(selectedEmployee?.name?.split(' ')?.[0] || ''),
        [selectedEmployee?.name]
    );

    return (
        <AdminLayout>
            <Head title={`${vocab.monitor.title} - ${industry.name}`} />

            <div className="space-y-6 pb-12 hp-animate-in">

                {/* HERO CARD */}
                <div className="hp-card-gradient-slate rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-success hp-chip-dot">
                                    {t('Live {{staff}} GPS Stream', { staff: vocab.staff.singular })}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {t('Refreshed')} {lastRefreshed}
                                </span>
                                <span className="hp-chip hp-chip-info">
                                    {industry.shortName}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t(labels.bannerTitle || `${industry.shortName} GPS Command Center`)}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t(labels.bannerSub || `Real-time GPS positioning, ${vocab.entity.singular.toLowerCase()} geofence compliance, and route tracking for all on-duty ${vocab.staff.plural.toLowerCase()}.`)}
                            </p>

                            {/* Search Bar */}
                            <div className="mt-5 max-w-lg">
                                <div className="hp-search-pill-bar !bg-white !shadow-xs">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        placeholder={t('Search {{staffPlural}}, sectors, or {{entities}}...', { staffPlural: vocab.staff.plural.toLowerCase(), entities: vocab.entity.plural.toLowerCase() })}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Refresh Button */}
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

                {/* BENTO METRIC CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t(labels.agentDutyTitle || vocab.monitor.onDuty)}</span>
                            <span className="w-2 h-2 rounded-full bg-hp-success animate-ping"></span>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">
                            {activeCount} <span className="text-sm font-normal text-hp-muted">/ {employees.length}</span>
                        </div>
                        <p className="text-xs text-hp-success font-medium mt-1">{t('Actively streaming GPS')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Offline / Standby')}</span>
                            <ShieldAlert className="w-3.5 h-3.5 text-hp-danger" />
                        </div>
                        <div className={`text-2xl sm:text-3xl font-bold ${offlineCount > 0 ? 'text-hp-danger' : 'text-hp-dark'}`}>
                            {offlineCount}
                        </div>
                        <p className="text-xs text-hp-muted mt-1">{offlineCount > 0 ? t('Alert flag active') : t('All crew connected')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Today\'s {{visits}}', { visits: vocab.visit.plural })}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-hp-primary" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">
                            {totalVisits}
                        </div>
                        <p className="text-xs text-hp-success font-medium mt-1">{industry.complianceRate || '99%'} {t('On-time arrival')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Geofence Lock')}</span>
                            <Wifi className="w-3.5 h-3.5 text-hp-info" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-hp-dark">
                            100%
                        </div>
                        <p className="text-xs text-hp-muted mt-1">{t('Within {{entity}} bounds', { entity: vocab.entity.singular.toLowerCase() })}</p>
                    </div>
                </div>

                {/* STATUS & REGION PILLS */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="hp-segmented-bar shrink-0">
                        {[
                            { id: 'all', label: `All ${vocab.staff.plural}` },
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

                    <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1">
                        <span className="shrink-0 text-xs font-bold text-hp-muted uppercase tracking-wider mr-1">{t('Sector')}:</span>
                        {regions.map((r) => (
                            <button
                                key={r}
                                onClick={() => setRegionFilter(r)}
                                className={`hp-pill !h-8 !shrink-0 !whitespace-nowrap !text-xs ${regionFilter === r ? '!bg-hp-dark !text-white !border-hp-dark' : ''}`}
                            >
                                {r === 'all' ? t('All Sectors') : r}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2-COLUMN SPLIT BENTO MONITOR */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Officer Directory Roster */}
                    <div className="lg:col-span-1 hp-bento-card !p-0 overflow-hidden flex flex-col max-h-[820px]">
                        <div className="p-4 border-b border-hp-border flex items-center justify-between">
                            <h3 className="hp-card-title text-sm">{t('{{staffPlural}} Roster', { staffPlural: vocab.staff.plural })}</h3>
                            <span className="text-xs text-hp-muted font-medium">
                                {filteredEmployees.length} {t('Listed')}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-hp-border">
                            {filteredEmployees.length === 0 ? (
                                <div className="p-8 text-center text-xs text-hp-muted font-medium">
                                    {t('No {{staffPlural}} matching filter.', { staffPlural: vocab.staff.plural.toLowerCase() })}
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
                                                    {(emp.name || 'S').charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-1">
                                                        <p className="font-bold text-sm text-hp-dark truncate">{emp.name}</p>
                                                        <span className={`hp-chip !h-5 !px-1.5 !text-[10px] ${emp.status === 'active' ? 'hp-chip-success hp-chip-dot' : 'hp-chip-gray'}`}>
                                                            {emp.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-hp-muted truncate mt-0.5">{emp.currentLocation || 'Location streaming...'}</p>
                                                    
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

                            {(() => {
                                const renderMap = (fullscreenMode) => (
                                    <MapContainer
                                        center={[parseFloat(selectedEmployee.latitude) || 12.9716, parseFloat(selectedEmployee.longitude) || 77.5946]}
                                        zoom={fullscreenMode ? 15 : 14}
                                        style={{ width: '100%', height: '100%', zIndex: 0 }}
                                    >
                                        <ChangeView
                                            center={[parseFloat(selectedEmployee.latitude) || 12.9716, parseFloat(selectedEmployee.longitude) || 77.5946]}
                                            zoom={fullscreenMode ? 15 : 14}
                                            fullscreen={fullscreenMode}
                                        />
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
                                );

                                return (
                                    <>
                                        <div className="hp-bento-card !p-0 overflow-hidden relative flex flex-col h-[440px]">
                                            <div className="absolute top-4 right-4 z-[500] flex items-center gap-2">
                                                <div className="bg-white/95 backdrop-blur-sm border border-hp-border px-3 py-1.5 rounded-full text-xs font-bold text-hp-dark shadow-sm flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-hp-primary animate-ping"></span>
                                                    <span>{selectedEmployee.name}</span>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setIsMapFullscreen(true);
                                                    }}
                                                    className="hp-icon-btn !bg-white border border-hp-border shadow-[var(--shadow-hp-md)] !w-9 !h-9 !rounded-full"
                                                    title={t('Fullscreen')}
                                                >
                                                    <Maximize className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="w-full h-full relative">
                                                {!isMapFullscreen && renderMap(false)}
                                            </div>
                                        </div>

                                        {isMapFullscreen && typeof document !== 'undefined' && createPortal(
                                            <div
                                                style={{
                                                    position: 'fixed',
                                                    inset: 0,
                                                    zIndex: 99999,
                                                    backgroundColor: 'rgba(15, 23, 42, 0.72)',
                                                    backdropFilter: 'blur(4px)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: '16px',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        backgroundColor: '#ffffff',
                                                        borderRadius: '20px',
                                                        overflow: 'hidden',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
                                                    }}
                                                >
                                                    <div className="px-5 py-3.5 border-b border-hp-border flex items-center justify-between bg-white shrink-0">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-3 h-3 rounded-full bg-hp-primary animate-ping"></span>
                                                            <div>
                                                                <h3 className="text-sm font-bold text-hp-dark">{selectedEmployee.name} — {t('Live GPS Map')}</h3>
                                                                <p className="text-xs text-hp-muted">{selectedEmployee.currentLocation}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => setIsMapFullscreen(false)}
                                                            className="hp-btn hp-btn-sm hp-btn-secondary"
                                                        >
                                                            <Minimize className="w-4 h-4 mr-1.5" />
                                                            <span>{t('Close Map')}</span>
                                                        </button>
                                                    </div>
                                                    <div style={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
                                                        {renderMap(true)}
                                                    </div>
                                                </div>
                                            </div>,
                                            document.body
                                        )}
                                    </>
                                );
                            })()}

                            {/* Staff Profile Card */}
                            <div className="hp-bento-card">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-hp-border">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-hp-dark text-white font-bold text-xl flex items-center justify-center shrink-0">
                                            {(selectedEmployee.name || 'S').charAt(0)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-lg font-bold text-hp-dark">{selectedEmployee.name}</h2>
                                                <span className={`hp-chip ${selectedEmployee.status === 'active' ? 'hp-chip-success hp-chip-dot' : 'hp-chip-gray'}`}>
                                                    {selectedEmployee.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-hp-muted mt-0.5">{selectedEmployee.role || vocab.staff.roles[0]} • {selectedEmployee.region || 'Assigned Beat'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {selectedEmployee.phone && (
                                            <button 
                                                onClick={() => window.location.href = `tel:${selectedEmployee.phone}`}
                                                className="hp-btn hp-btn-sm hp-btn-outline !rounded-xl"
                                            >
                                                <Phone className="w-3.5 h-3.5 mr-1 text-hp-primary" /> {t('Call')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                                    <div className="p-4 bg-hp-hover/60 rounded-xl border border-hp-border">
                                        <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Current {{entity}} Location', { entity: vocab.entity.singular })}</p>
                                        <p className="text-sm font-semibold text-hp-dark flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-hp-primary shrink-0" />
                                            <span className="truncate">{selectedEmployee.currentLocation || selectedEmployee.current_site || 'Active Beat'}</span>
                                        </p>
                                    </div>
                                    <div className="p-4 bg-hp-hover/60 rounded-xl border border-hp-border">
                                        <p className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1">{t('Shift Clock-in')}</p>
                                        <p className="text-sm font-semibold text-hp-dark flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-hp-info shrink-0" />
                                            <span>Check-in: {selectedEmployee.checkInTime || '08:30 AM'}</span>
                                        </p>
                                    </div>
                                </div>

                                {/* Target Progress */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Today\'s {{visits}} Target', { visits: vocab.visit.plural })}</span>
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
                            {t('Select a {{staff}} from the list to view real-time location telemetry.', { staff: vocab.staff.singular.toLowerCase() })}
                        </div>
                    )}
                </div>

            </div>
        </AdminLayout>
    );
}
