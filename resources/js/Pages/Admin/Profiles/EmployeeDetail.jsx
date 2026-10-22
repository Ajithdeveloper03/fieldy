import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from '../AdminLayout';
import { Link } from '@inertiajs/react';
import { ArrowLeft, MapPin, Navigation, Clock, Smartphone, ShieldCheck, Activity, Maximize, Minimize, Star, Users, Map, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

export default function EmployeeDetail({ employee = {}, attendance = [], visitsThisWeek = [], assignedFarmers = [], recentReviews = [] }) {
    const { t } = useTranslation();
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);

    const [liveLocation, setLiveLocation] = useState({
        lat: parseFloat(employee.last_latitude) || null,
        lng: parseFloat(employee.last_longitude) || null,
        last_seen: employee.last_seen || 'Never',
    });
    const [path, setPath] = useState(
        employee.recentPath ? employee.recentPath.map(p => [parseFloat(p.lat), parseFloat(p.lng)]) : []
    );

    useEffect(() => {
        if (window.Echo && employee.id) {
            window.Echo.channel('live-tracking')
                .listen('.LocationUpdated', (e) => {
                    if (e.employeeId === employee.id) {
                        setLiveLocation({
                            lat: parseFloat(e.latitude),
                            lng: parseFloat(e.longitude),
                            last_seen: 'Just now',
                        });
                        setPath(prev => [[parseFloat(e.latitude), parseFloat(e.longitude)], ...prev]);
                    }
                });
        }
        return () => {
            if (window.Echo) {
                window.Echo.leaveChannel('live-tracking');
            }
        };
    }, [employee.id]);

    const markerIcon = L.divIcon({
        className: 'custom-icon',
        html: `
            <div style="width: 38px; height: 38px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); border: 2px solid #F26A10; font-size: 0.875rem; font-weight: bold; color: #1D1E20;">
                ${employee.name?.[0] || 'O'}
            </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
    });

    const mapContent = (
        <div className={`hp-card overflow-hidden flex flex-col ${isMapFullscreen ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none' : 'h-[580px]'}`}>
            <div className="hp-card-header">
                <div>
                    <h2 className="hp-card-title flex items-center gap-2">
                        <Activity className="w-5 h-5 text-hp-primary" /> {t('Live Telemetry')}
                    </h2>
                    <p className="text-xs text-hp-muted mt-0.5">Continuous GPS route and status tracking</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hp-chip hp-chip-success hp-chip-dot">
                        Tracking Active
                    </span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMapFullscreen(!isMapFullscreen);
                        }}
                        className="hp-icon-btn"
                        title={isMapFullscreen ? t('Exit fullscreen') : t('Fullscreen')}
                    >
                        {isMapFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            
            <div className="flex-1 relative bg-hp-bg flex items-center justify-center overflow-hidden">
                {liveLocation.lat && liveLocation.lng ? (
                    <MapContainer
                        center={[liveLocation.lat, liveLocation.lng]}
                        zoom={15}
                        style={{ width: '100%', height: '100%', zIndex: 0 }}
                    >
                        <ChangeView center={[liveLocation.lat, liveLocation.lng]} zoom={15} />
                        <TileLayer
                            attribution='&copy; Google Maps'
                            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                        />
                        {path.length > 1 && (
                            <Polyline 
                                positions={path} 
                                color="#F26A10" 
                                weight={4} 
                                opacity={0.85}
                                lineCap="round"
                                lineJoin="round"
                            />
                        )}
                        <Marker 
                            position={[liveLocation.lat, liveLocation.lng]}
                            icon={markerIcon}
                        />
                    </MapContainer>
                ) : (
                    <div className="text-hp-muted font-bold text-sm">No GPS Location Available</div>
                )}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-white/95 backdrop-blur px-3.5 py-1.5 rounded-lg shadow-[var(--shadow-hp-md)] border border-hp-border text-center text-xs">
                        <span className="text-hp-muted font-medium">Telemetry ping: </span>
                        <strong className="text-hp-dark">{liveLocation.last_seen}</strong>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="space-y-6 pb-12 hp-animate-in">
                {/* Back button */}
                <div>
                    <Link href="/admin/employees" className="hp-btn hp-btn-sm hp-btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to Directory')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Profile Card */}
                    <div className={`col-span-1 space-y-6 ${isMapFullscreen ? 'hidden' : 'block'}`}>
                        <div className="hp-card p-6">
                            <div className="flex items-center gap-4 pb-5 border-b border-hp-border">
                                <div className="w-16 h-16 rounded-xl bg-hp-dark text-white font-bold text-2xl flex items-center justify-center shrink-0">
                                    {(employee.name || 'O').charAt(0)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-lg font-bold text-hp-dark truncate">{employee.name}</h1>
                                        <span className={`hp-chip !h-5 !text-[10px] ${employee.status === 'active' ? 'hp-chip-success hp-chip-dot' : 'hp-chip-gray'}`}>
                                            {employee.status || 'Active'}
                                        </span>
                                    </div>
                                    <span className="font-mono text-xs text-hp-muted block mt-0.5">{employee.employee_code || 'EMP-N/A'}</span>
                                </div>
                            </div>

                            <div className="py-4 space-y-3 text-xs text-hp-dark border-b border-hp-border">
                                <div className="flex items-center justify-between">
                                    <span className="text-hp-muted flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Designation</span>
                                    <span className="font-bold">{employee.designation || 'Field Officer'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-hp-muted flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Region</span>
                                    <span className="font-bold">{employee.region || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-hp-muted flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Phone</span>
                                    <span className="font-bold">{employee.phone || 'N/A'}</span>
                                </div>
                                {employee.emergency && (
                                    <div className="flex items-center justify-between text-hp-danger">
                                        <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Emergency</span>
                                        <span className="font-bold">{employee.emergency}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4">
                                <h3 className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-3">Weekly Telemetry Overview</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-hp-bg rounded-lg border border-hp-border text-center">
                                        <p className="text-xs text-hp-muted">Visits</p>
                                        <p className="text-xl font-bold text-hp-dark mt-0.5">{visitsThisWeek.length}</p>
                                    </div>
                                    <div className="p-3 bg-hp-bg rounded-lg border border-hp-border text-center">
                                        <p className="text-xs text-hp-muted">Days Present</p>
                                        <p className="text-xl font-bold text-hp-dark mt-0.5">{attendance.filter(a => a.status === 'present').length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Map */}
                    <div className="col-span-1 lg:col-span-2">
                        {isMapFullscreen ? (
                            <>
                                <div className="h-[580px] w-full"></div>
                                {createPortal(mapContent, document.body)}
                            </>
                        ) : (
                            mapContent
                        )}
                    </div>
                </div>

                {/* Sub-Tier: Assigned Farmers & Performance Reviews */}
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isMapFullscreen ? 'hidden' : 'block'}`}>
                    {/* Assigned Farmers */}
                    <div className="hp-card flex flex-col">
                        <div className="hp-card-header">
                            <h3 className="hp-card-title flex items-center gap-2">
                                <Users className="w-5 h-5 text-hp-primary" /> {t('Assigned Facilities & Clients')}
                            </h3>
                            <span className="hp-chip hp-chip-gray">
                                {assignedFarmers.length} Total
                            </span>
                        </div>
                        <div className="p-4 max-h-[380px] overflow-y-auto divide-y divide-hp-border">
                            {assignedFarmers.length > 0 ? (
                                assignedFarmers.map((farmer, i) => (
                                    <div key={i} className="py-3 flex items-center justify-between gap-3 hover:bg-hp-hover px-2 rounded-lg transition-colors cursor-pointer">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-hp-hover border border-hp-border overflow-hidden shrink-0">
                                                <img 
                                                    src={farmer.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random`} 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random`; }}
                                                    alt={farmer.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-hp-dark truncate">{farmer.name}</p>
                                                <p className="text-[11px] text-hp-muted">{farmer.farmer_code}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={`hp-chip !h-5 !text-[10px] ${farmer.status === 'approved' ? 'hp-chip-success' : 'hp-chip-warning'}`}>
                                                {farmer.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-hp-muted text-xs py-10">No assigned clients found.</div>
                            )}
                        </div>
                    </div>

                    {/* Ratings & Reviews */}
                    <div className="hp-card flex flex-col">
                        <div className="hp-card-header">
                            <h3 className="hp-card-title flex items-center gap-2">
                                <Star className="w-5 h-5 text-hp-primary" /> {t('Client Audits & Feedback')}
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg font-bold text-hp-dark">{employee.avg_rating || '5.0'}</span>
                                <div className="flex text-amber-500">
                                    <Star className="w-4 h-4 fill-current" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4 max-h-[380px] overflow-y-auto space-y-3">
                            {recentReviews.length > 0 ? (
                                recentReviews.map((review, i) => (
                                    <div key={i} className="p-3.5 bg-hp-bg rounded-lg border border-hp-border">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-bold text-hp-dark">{review.farmer_name}</p>
                                            <span className="text-[10px] text-hp-muted">{review.date}</span>
                                        </div>
                                        <p className="text-xs text-hp-muted italic leading-relaxed">"{review.comment || 'Audit completed satisfactorily.'}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-hp-muted text-xs py-10">No client reviews recorded yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
