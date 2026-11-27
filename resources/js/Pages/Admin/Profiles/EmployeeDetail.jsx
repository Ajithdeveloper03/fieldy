import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminLayout from '../AdminLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { 
    ArrowLeft, MapPin, Navigation, Clock, Smartphone, ShieldCheck, Activity, 
    Maximize, Minimize, Star, Users, Map, CheckCircle2, Sparkles, Phone, MessageSquare,
    ArrowUpRight, Building2, Wifi, TrendingUp, KeyRound, X, Save
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../../hooks/useIndustry';
import { withBase } from '../../../basePath';
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

export default function EmployeeDetail({ employee = {}, attendance = [], visitsThisWeek = [], assignedFarmers = [], recentReviews = [], performanceHistory = [], editing = false }) {
    const { t } = useTranslation();
    const { flash } = usePage().props;
    const { vocab, labels, industry } = useIndustry();
    const [isMapFullscreen, setIsMapFullscreen] = useState(false);
    const [showEditModal, setShowEditModal] = useState(editing);
    const [showPassword, setShowPassword] = useState(false);
    const photoForm = useForm({ photo: null });

    function updatePhoto(event) {
        const photo = event.target.files?.[0];
        event.target.value = '';
        if (!photo) return;
        photoForm.transform(() => ({ photo }));
        photoForm.post(withBase(`/admin/employees/${employee.id}/photo`), { preserveScroll: true });
    }

    const { data: editData, setData: setEditData, put, processing: savingEdit, errors: editErrors } = useForm({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        password: '',
        assigned_region: employee.region || '',
        emergency_phone: employee.emergency && employee.emergency !== 'N/A' ? employee.emergency : '',
        status: employee.status === 'disabled' ? 'disabled' : 'active',
    });

    const closeEditModal = () => {
        setEditData('password', '');
        setShowPassword(false);
        setShowEditModal(false);
    };

    const handleSaveCredentials = (e) => {
        e.preventDefault();
        put(withBase(`/admin/employees/${employee.id}`), {
            preserveScroll: true,
            onSuccess: closeEditModal,
        });
    };

    const [liveLocation, setLiveLocation] = useState({
        lat: parseFloat(employee.last_latitude) || null,
        lng: parseFloat(employee.last_longitude) || null,
        last_seen: employee.last_seen || 'Just now',
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
        <div className={`hp-bento-card !p-0 overflow-hidden flex flex-col ${isMapFullscreen ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none' : 'h-[520px]'}`}>
            <div className="p-4 border-b border-hp-border flex items-center justify-between bg-white">
                <div>
                    <h2 className="hp-card-title text-sm flex items-center gap-2">
                        <Activity className="w-4 h-4 text-hp-primary" /> {t('Live Route & Telemetry')}
                    </h2>
                    <p className="text-xs text-hp-muted mt-0.5">{t('Continuous GPS tracking & path history')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="hp-chip hp-chip-success hp-chip-dot">
                        {t('Tracking Active')}
                    </span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsMapFullscreen(!isMapFullscreen);
                        }}
                        className="hp-icon-btn !w-8 !h-8"
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
                    <div className="text-hp-muted font-bold text-sm">{t('No GPS Location Available')}</div>
                )}
                
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-white/95 backdrop-blur px-3.5 py-1.5 rounded-full shadow-[var(--shadow-hp-md)] border border-hp-border text-center text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-hp-primary animate-ping"></span>
                        <span className="text-hp-muted font-medium">{t('Telemetry ping')}: </span>
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
                    <Link href="/admin/employees" className="hp-pill">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back to Property Advisors')}
                    </Link>
                </div>

                {flash?.success && (
                    <div className="hp-bento-card !p-4 border-l-4 border-l-hp-success bg-hp-success-light/30 text-sm font-bold text-hp-dark flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-hp-success" /> {flash.success}
                    </div>
                )}

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-18 h-18 rounded-2xl bg-hp-dark text-white font-bold text-3xl flex items-center justify-center shrink-0 shadow-sm">
                                {employee.has_photo ? (
                                    <img className="h-full w-full rounded-[inherit] object-cover" src={withBase(`/admin/employees/${employee.id}/photo?v=${encodeURIComponent(employee.photo_version || '')}`)} alt="" />
                                ) : (employee.name || 'A').charAt(0)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">{employee.name}</h1>
                                    <span className="hp-chip hp-chip-gray font-mono">{employee.employee_code || 'ADV-N/A'}</span>
                                    <span className={`hp-chip ${employee.status === 'active' ? 'hp-chip-success hp-chip-dot' : 'hp-chip-gray'}`}>
                                        {employee.status === 'active' ? t('On Site Duty') : t(employee.status || 'Active')}
                                    </span>
                                </div>
                                <p className="text-sm text-hp-muted flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-hp-muted" /> {employee.region || 'OMR / ECR Corridor'} • {employee.designation && employee.designation !== 'field_officer' ? employee.designation : 'Senior Property Advisor'}
                                </p>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-center">
                            {!employee.is_sample && (
                                <div>
                                    <label className="hp-btn hp-btn-secondary cursor-pointer">
                                        {photoForm.processing ? t('Uploading…') : t('Change Photo')}
                                        <input type="file" className="sr-only" accept="image/jpeg,image/png,image/webp" disabled={photoForm.processing} onChange={updatePhoto} />
                                    </label>
                                    {photoForm.errors.photo && <p className="text-xs text-hp-danger">{photoForm.errors.photo}</p>}
                                </div>
                            )}
                            {!employee.is_sample && <button
                                type="button"
                                onClick={() => setShowEditModal(true)}
                                className="hp-btn hp-btn-secondary !rounded-full"
                            >
                                <KeyRound className="w-4 h-4 mr-1 text-hp-primary" />
                                <span>{t('Change Login & Password')}</span>
                            </button>}
                            <button 
                                type="button" 
                                onClick={() => window.location.href = `tel:${employee.phone}`}
                                className="hp-btn hp-btn-secondary !rounded-full"
                            >
                                <Phone className="w-4 h-4 mr-1 text-hp-primary" />
                                <span>{t('Call Advisor')}</span>
                            </button>
                            <Link 
                                href="/admin/tasks"
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                <span>{t('Assign Site Visit')}</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO METRIC CARDS ══════════ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('{{visits}} Completed', { visits: vocab.visit.plural })}</span>
                        <p className="font-bold text-2xl text-hp-dark">{visitsThisWeek.length}</p>
                        <p className="text-xs text-hp-muted mt-1">{t('Weekly verified {{visits}}', { visits: vocab.visit.plural.toLowerCase() })}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Duty Attendance')}</span>
                        <p className="font-bold text-2xl text-hp-success">{attendance.filter(a => a.status === 'present' || a.status === 'overtime').length} <span className="text-xs text-hp-muted font-normal">{t('days')}</span></p>
                        <p className="text-xs text-hp-muted mt-1">100% {t('Geofence verified')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Client Rating')}</span>
                        <p className="font-bold text-2xl text-hp-dark flex items-center gap-1.5">
                            <Star className="w-5 h-5 text-amber-500 fill-current" />
                            <span>{employee.avg_rating || '4.9'}</span>
                        </p>
                        <p className="text-xs text-hp-muted mt-1">{recentReviews.length} {t('client feedback scores')}</p>
                    </div>

                    <div className="hp-metric-pill-card">
                        <span className="text-xs font-bold text-hp-muted uppercase tracking-wider mb-1 block">{t('Assigned {{entities}}', { entities: vocab.entity.plural })}</span>
                        <p className="font-bold text-2xl text-hp-primary">{assignedFarmers.length}</p>
                        <p className="text-xs text-hp-muted mt-1">{t('Active {{entities}} in zone', { entities: vocab.entity.plural.toLowerCase() })}</p>
                    </div>
                </div>

                {/* ══════════ BENTO DETAILS & MAP ══════════ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Profile Specifications */}
                    <div className={`col-span-1 space-y-6 ${isMapFullscreen ? 'hidden' : 'block'}`}>
                        <div className="hp-bento-card">
                            <h3 className="hp-card-title text-sm pb-3 mb-4 border-b border-hp-border">
                                {t('{{staff}} Credentials & Service Zone', { staff: vocab.staff.singular })}
                            </h3>

                            <div className="space-y-3.5 text-xs">
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-hp-muted flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> {t('Role / Specialization')}</span>
                                    <span className="font-bold text-hp-dark">{employee.designation && employee.designation !== 'field_officer' ? t(employee.designation) : (vocab.staff?.roles?.[0] || t('Field Officer'))}</span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-hp-muted flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {t('Assigned Zone')}</span>
                                    <span className="font-bold text-hp-dark">{employee.region || t('Assigned Zone')}</span>
                                </div>
                                <div className="flex items-center justify-between py-1">
                                    <span className="text-hp-muted flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> {t('Mobile Contact')}</span>
                                    <span className="font-bold text-hp-dark font-mono">{employee.phone || t('N/A')}</span>
                                </div>
                                {employee.emergency && (
                                    <div className="flex items-center justify-between py-1 text-hp-danger">
                                        <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> {t('Emergency SOS')}</span>
                                        <span className="font-bold font-mono">{employee.emergency}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Map */}
                    <div className="col-span-1 lg:col-span-2">
                        {isMapFullscreen ? (
                            <>
                                <div className="h-[520px] w-full"></div>
                                {createPortal(mapContent, document.body)}
                            </>
                        ) : (
                            mapContent
                        )}
                    </div>
                </div>

                {/* ══════════ SUB-TIER BENTO: ASSIGNED ENTITIES & CLIENT REVIEWS ══════════ */}
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${isMapFullscreen ? 'hidden' : 'block'}`}>
                    {/* Assigned Entities */}
                    <div className="hp-bento-card !p-0 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-hp-border flex items-center justify-between bg-white">
                            <h3 className="hp-card-title text-sm flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-hp-primary" /> {t('Assigned {{entities}} & Locations', { entities: vocab.entity.plural })}
                            </h3>
                            <span className="hp-chip hp-chip-gray">
                                {assignedFarmers.length} Total
                            </span>
                        </div>
                        <div className="p-4 max-h-[380px] overflow-y-auto divide-y divide-hp-border">
                            {assignedFarmers.length > 0 ? (
                                assignedFarmers.map((farmer, i) => (
                                    <div key={i} className="py-3 flex items-center justify-between gap-3 hover:bg-hp-hover px-2 rounded-xl transition-colors cursor-pointer" onClick={() => farmer.id && router.visit(`/admin/farmers/${farmer.id}`)}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-hp-hover border border-hp-border overflow-hidden shrink-0">
                                                <img 
                                                    src={farmer.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.name)}&background=random`} 
                                                    onError={(e) => { e.target.onerror = null; e.target.src = `/images/image1.jpg`; }}
                                                    alt={farmer.name} 
                                                    className="w-full h-full object-cover" 
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-hp-dark truncate">{farmer.name}</p>
                                                <p className="text-[11px] text-hp-muted font-mono">{farmer.farmer_code || `LOC-${i+1}`}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="hp-chip hp-chip-success !h-5 !text-[10px]">
                                                {farmer.status || 'Active'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-hp-muted text-xs py-10">No assigned {vocab.entity.plural.toLowerCase()} found.</div>
                            )}
                        </div>
                    </div>

                    {/* Ratings & Reviews */}
                    <div className="hp-bento-card !p-0 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-hp-border flex items-center justify-between bg-white">
                            <h3 className="hp-card-title text-sm flex items-center gap-2">
                                <Star className="w-4 h-4 text-hp-primary" /> {t('Client {{visit}} Feedback', { visit: vocab.visit.singular })}
                            </h3>
                            <div className="flex items-center gap-1.5">
                                <span className="text-base font-bold text-hp-dark">{employee.avg_rating || '5.0'}</span>
                                <Star className="w-4 h-4 text-amber-500 fill-current" />
                            </div>
                        </div>
                        <div className="p-4 max-h-[380px] overflow-y-auto space-y-3">
                            {recentReviews.length > 0 ? (
                                recentReviews.map((review, i) => (
                                    <div key={i} className="p-3.5 bg-hp-hover/60 rounded-xl border border-hp-border">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="text-xs font-bold text-hp-dark">{review.farmer_name}</p>
                                            <span className="text-[10px] text-hp-muted">{review.date}</span>
                                        </div>
                                        <p className="text-xs text-hp-muted italic leading-relaxed">"{review.comment || t('Service execution completed with full procedural sign-off.')}"</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-hp-muted text-xs py-10">No {vocab.visit.singular.toLowerCase()} reviews recorded yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ══════════ PERFORMANCE HISTORY ══════════ */}
                <div className={`hp-bento-card !p-0 overflow-hidden ${isMapFullscreen ? 'hidden' : 'block'}`}>
                    <div className="p-4 border-b border-hp-border flex items-center justify-between bg-white">
                        <h3 className="hp-card-title text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-hp-primary" /> {t('Performance History')}
                        </h3>
                        <span className="hp-chip hp-chip-gray">{performanceHistory.length} {t('months')}</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="hp-table min-w-[720px]">
                            <thead>
                                <tr>
                                    <th>{t('Period')}</th>
                                    <th>{t('Performance Score')}</th>
                                    <th>{t('Rating')}</th>
                                    <th>{t(vocab.visit.plural)}</th>
                                    <th>{t('Check-ins / Check-outs')}</th>
                                    <th>{t('Tasks Completed')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {performanceHistory.length > 0 ? performanceHistory.map((row, i) => (
                                    <tr key={i}>
                                        <td className="font-bold text-sm text-hp-dark">{row.period}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-24 h-2 rounded-full bg-hp-hover overflow-hidden">
                                                    <div className="h-full rounded-full bg-hp-primary" style={{ width: `${row.score}%` }} />
                                                </div>
                                                <span className="text-xs font-bold text-hp-dark tabular-nums">{row.score}</span>
                                            </div>
                                        </td>
                                        <td><span className="hp-chip hp-chip-warning !h-5 !text-[11px]">{row.rating ?? '—'}</span></td>
                                        <td className="text-xs font-bold text-hp-dark">{row.visits_done} {t('done')}</td>
                                        <td className="text-xs text-hp-dark font-medium">{row.check_ins} / {row.check_outs}</td>
                                        <td className="text-xs text-hp-muted">{row.tasks_done} / {row.tasks_total}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="6" className="text-center py-10 text-hp-muted text-xs">{t('No performance history available.')}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {showEditModal && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4" onClick={closeEditModal}>
                    <div className="hp-card w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-3 border-b border-hp-border">
                            <h2 className="text-lg font-bold text-hp-dark flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-hp-primary" /> {t('Edit Profile & Login Credentials')}
                            </h2>
                            <button type="button" onClick={closeEditModal} className="p-1 text-hp-muted hover:text-hp-dark">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveCredentials} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1">{t('Full Name')} *</label>
                                    <input
                                        type="text"
                                        required
                                        className="hp-input"
                                        value={editData.name}
                                        onChange={(e) => setEditData('name', e.target.value)}
                                    />
                                    {editErrors.name && <p className="text-hp-danger text-xs mt-1">{editErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1">{t('Mobile Number')} *</label>
                                    <input
                                        type="tel"
                                        required
                                        className="hp-input"
                                        value={editData.phone}
                                        onChange={(e) => setEditData('phone', e.target.value)}
                                    />
                                    {editErrors.phone && <p className="text-hp-danger text-xs mt-1">{editErrors.phone}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-hp-dark mb-1">{t('Username / Login Email')} *</label>
                                    <input
                                        type="text"
                                        required
                                        className="hp-input font-mono text-xs"
                                        value={editData.email}
                                        onChange={(e) => setEditData('email', e.target.value)}
                                    />
                                    {editErrors.email && <p className="text-hp-danger text-xs mt-1">{editErrors.email}</p>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-hp-dark mb-1">{t('New Password (leave blank to keep current)')}</label>
                                    <div className="flex gap-2">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            autoComplete="new-password"
                                            className="hp-input font-mono text-xs"
                                            placeholder={t('Enter new password (min 4 chars)')}
                                            value={editData.password}
                                            onChange={(e) => setEditData('password', e.target.value)}
                                        />
                                        <button type="button" className="hp-btn hp-btn-outline shrink-0" onClick={() => setShowPassword(value => !value)}>
                                            {showPassword ? t('Hide Password') : t('Show Password')}
                                        </button>
                                    </div>
                                    {editErrors.password && <p className="text-hp-danger text-xs mt-1">{editErrors.password}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1">{t('Assigned Zone')}</label>
                                    <input
                                        type="text"
                                        className="hp-input"
                                        value={editData.assigned_region}
                                        onChange={(e) => setEditData('assigned_region', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark mb-1">{t('Account Status')}</label>
                                    <select
                                        className="hp-input"
                                        value={editData.status}
                                        onChange={(e) => setEditData('status', e.target.value)}
                                    >
                                        <option value="active">{t('Active')}</option>
                                        <option value="disabled">{t('Disabled')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-hp-border">
                                <button type="button" onClick={closeEditModal} className="hp-btn hp-btn-secondary">
                                    {t('Cancel')}
                                </button>
                                <button type="submit" disabled={savingEdit} className="hp-btn hp-btn-primary">
                                    <Save className="w-4 h-4 mr-1" /> {savingEdit ? t('Saving...') : t('Save Credentials')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
