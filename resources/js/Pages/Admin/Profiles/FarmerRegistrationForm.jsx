import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    User, FileText, Map, Building2, ArrowRight, ArrowLeft, CheckCircle2, 
    UploadCloud, Smartphone, CreditCard, ShieldCheck, MapPin, Search, Briefcase
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FarmerRegistrationForm() {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        mobile_number: '',
        otp: '',
        aadhaar_number: '',
        address: '',
        village: '',
        taluk: '',
        district: '',
        state: 'Tamil Nadu',
        pincode: '',
        total_land_owned: '',
        vetiver_land_allocated: '',
        survey_number: '',
        lat: '',
        lng: '',
        seed_bags_required: '',
        planned_investment: '',
        irrigation_type: 'Centralised Sprinkler',
        soil_type: 'Reinforced Concrete',
        expected_plantation_date: '',
        customer_category: 'crop',
        crop_types: ['HVAC & MEP'],
    });

    const updateForm = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            router.visit('/admin/farmers');
        }, 1200);
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-between mb-8 relative px-2">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-hp-border -z-10"></div>
            <div 
                className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-hp-primary -z-10 transition-all duration-300" 
                style={{ width: `${((step - 1) / 3) * 88}%` }}
            ></div>
            
            {[
                { num: 1, icon: User, label: 'Contact' },
                { num: 2, icon: ShieldCheck, label: 'Identity / KYC' },
                { num: 3, icon: Map, label: 'Campus & GPS' },
                { num: 4, icon: Building2, label: 'Service Scope' }
            ].map((s) => (
                <div key={s.num} className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-[var(--shadow-hp-md)] transition-colors duration-200 ${step >= s.num ? 'bg-hp-primary text-white' : 'bg-white text-hp-muted border-hp-border'}`}>
                        <s.icon className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-bold mt-2 uppercase tracking-wider ${step >= s.num ? 'text-hp-dark' : 'text-hp-muted'}`}>{s.label}</span>
                </div>
            ))}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Facility Onboarding - Fieldy Admin" />
            
            <div className="max-w-3xl mx-auto space-y-6 pb-12 hp-animate-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/farmers" className="hp-btn hp-btn-sm hp-btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back')}
                    </Link>
                    <div>
                        <h1 className="hp-page-title">{t('Facility Onboarding Wizard')}</h1>
                        <p className="text-sm text-hp-muted mt-0.5">{t('Register client facilities, commercial sites, and service contracts.')}</p>
                    </div>
                </div>

                <div className="hp-card p-6 sm:p-8">
                    <StepIndicator />

                    <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                        
                        {/* STEP 1: Personal Information */}
                        <div className={`space-y-6 ${step === 1 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t('Facility Manager / Client Contact')}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">Primary site representative and administrative contact</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Facility / Client Name')}</label>
                                    <input 
                                        type="text" 
                                        className="hp-input" 
                                        placeholder="e.g. Olympia Tech Park / Rajesh Kumar" 
                                        value={formData.full_name} 
                                        onChange={e => updateForm('full_name', e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Mobile Number')}</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="tel" 
                                            className="hp-input flex-1" 
                                            placeholder="+91 9876543210" 
                                            value={formData.mobile_number} 
                                            onChange={e => updateForm('mobile_number', e.target.value)} 
                                            required 
                                        />
                                        <button type="button" className="hp-btn hp-btn-secondary text-xs">{t('Send OTP')}</button>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('OTP Verification')}</label>
                                    <input 
                                        type="text" 
                                        className="hp-input md:w-1/2 tracking-[0.4em] font-mono text-center text-sm" 
                                        placeholder="• • • • • •" 
                                        value={formData.otp} 
                                        onChange={e => updateForm('otp', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: KYC Documents */}
                        <div className={`space-y-6 ${step === 2 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t('Identity Verification & Registration')}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">Statutory registration and address verification</p>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Govt Registration / GST / ID Number')}</label>
                                    <input 
                                        type="text" 
                                        className="hp-input font-mono tracking-wider" 
                                        placeholder="XXXX-XXXX-XXXX" 
                                        value={formData.aadhaar_number} 
                                        onChange={e => updateForm('aadhaar_number', e.target.value)} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-dashed border-hp-border rounded-lg p-5 flex flex-col items-center justify-center bg-hp-bg hover:border-hp-primary cursor-pointer transition-colors text-center">
                                        <UploadCloud className="w-8 h-8 text-hp-primary mb-2" />
                                        <p className="font-bold text-hp-dark text-xs">{t('Upload Registration Certificate')}</p>
                                        <p className="text-[11px] text-hp-muted mt-0.5">PDF, PNG, JPEG up to 5MB</p>
                                    </div>
                                    <div className="border border-dashed border-hp-border rounded-lg p-5 flex flex-col items-center justify-center bg-hp-bg hover:border-hp-primary cursor-pointer transition-colors text-center">
                                        <User className="w-8 h-8 text-hp-primary mb-2" />
                                        <p className="font-bold text-hp-dark text-xs">{t('Facility Officer Photo')}</p>
                                        <p className="text-[11px] text-hp-muted mt-0.5">Clear verification photograph</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-hp-border">
                                <h4 className="text-xs font-bold text-hp-dark uppercase tracking-wider mb-3">{t('Facility Street Address')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-3">
                                        <input type="text" className="hp-input" placeholder="Campus / Plot / Street Address" value={formData.address} onChange={e => updateForm('address', e.target.value)} />
                                    </div>
                                    <div><input type="text" className="hp-input" placeholder="Area / Sector" value={formData.village} onChange={e => updateForm('village', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="Zone / Ward" value={formData.taluk} onChange={e => updateForm('taluk', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="City / District" value={formData.district} onChange={e => updateForm('district', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="State" value={formData.state} onChange={e => updateForm('state', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="PIN Code" value={formData.pincode} onChange={e => updateForm('pincode', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 3: Farm Mapping */}
                        <div className={`space-y-6 ${step === 3 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t('Facility Campus & Geolocation')}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">Specify coverage perimeter for geofence enforcement</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Total Campus Area (Sq. Ft)')}</label>
                                    <input type="number" className="hp-input" placeholder="e.g. 50000" value={formData.total_land_owned} onChange={e => updateForm('total_land_owned', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Serviceable Area (Sq. Ft)')}</label>
                                    <input type="number" className="hp-input font-bold" placeholder="e.g. 35000" value={formData.vetiver_land_allocated} onChange={e => updateForm('vetiver_land_allocated', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Building / Unit Identification')}</label>
                                    <input type="text" className="hp-input" placeholder="e.g. Block-B, Tower 3, Floors 1-6" value={formData.survey_number} onChange={e => updateForm('survey_number', e.target.value)} />
                                </div>
                            </div>

                            <div className="p-4 bg-hp-bg rounded-lg border border-hp-border">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold text-hp-dark uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-hp-primary" /> {t('GPS Coordinates')}
                                    </label>
                                    <button type="button" className="hp-btn hp-btn-sm hp-btn-secondary !h-7 !text-[11px]">
                                        <Search className="w-3 h-3 mr-1" /> {t('Auto-Detect')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" className="hp-input !bg-white" placeholder="Latitude" value={formData.lat} onChange={e => updateForm('lat', e.target.value)} />
                                    <input type="text" className="hp-input !bg-white" placeholder="Longitude" value={formData.lng} onChange={e => updateForm('lng', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* STEP 4: Facility Scope & Services */}
                        <div className={`space-y-6 ${step === 4 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t('Service Scope & SLA Parameters')}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">Specify engineering requirements and scheduled maintenance</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Service Agreement Classification')}</label>
                                    <select
                                        className="hp-input font-bold"
                                        value={formData.customer_category}
                                        onChange={e => updateForm('customer_category', e.target.value)}
                                    >
                                        <option value="crop">Hard FM (HVAC, Electrical & MEP)</option>
                                        <option value="fertilizer">Soft FM (Housekeeping & Cleaning)</option>
                                        <option value="both">Integrated Facility Management (IFM)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Core Services Included')}</label>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {['HVAC & MEP', 'Fire Safety', 'Janitorial', 'Electrical'].map(srv => {
                                            const isSelected = formData.crop_types.includes(srv);
                                            return (
                                                <button
                                                    key={srv}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = [...formData.crop_types];
                                                        const next = isSelected ? current.filter(c => c !== srv) : [...current, srv];
                                                        updateForm('crop_types', next.length ? next : [srv]);
                                                    }}
                                                    className={`px-3 py-1 rounded-md text-xs font-bold border transition-colors ${
                                                        isSelected
                                                            ? 'bg-hp-primary text-white border-hp-primary'
                                                            : 'bg-white text-hp-dark border-hp-border hover:bg-hp-hover'
                                                    }`}
                                                >
                                                    {srv}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Allocated Equipment / Spares (Units)')}</label>
                                    <input type="number" className="hp-input" placeholder="0" value={formData.seed_bags_required} onChange={e => updateForm('seed_bags_required', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Annual SLA Budget (₹)')}</label>
                                    <input type="number" className="hp-input" placeholder="250000" value={formData.planned_investment} onChange={e => updateForm('planned_investment', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('SLA Effective Start Date')}</label>
                                    <input type="date" className="hp-input" value={formData.expected_plantation_date} onChange={e => updateForm('expected_plantation_date', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-hp-border">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className="hp-btn hp-btn-secondary">
                                    <ArrowLeft className="w-4 h-4 mr-1.5" /> {t('Back')}
                                </button>
                            ) : <div></div>}

                            {step < 4 ? (
                                <button type="submit" className="hp-btn hp-btn-primary">
                                    {t('Continue')} <ArrowRight className="w-4 h-4 ml-1.5" />
                                </button>
                            ) : (
                                <button type="submit" disabled={loading} className="hp-btn hp-btn-primary">
                                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                    {loading ? t('Onboarding...') : t('Complete Onboarding')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
