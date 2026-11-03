import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    User, FileText, Map, Building2, ArrowRight, ArrowLeft, CheckCircle2, 
    UploadCloud, Smartphone, CreditCard, ShieldCheck, MapPin, Search, Briefcase
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useIndustry from '../../../hooks/useIndustry';

export default function FarmerRegistrationForm() {
    const { t } = useTranslation();
    const { vocab, labels, industry } = useIndustry();
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
        customer_category: 'standard',
        crop_types: [vocab.entity.singular],
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
                { num: 1, icon: User, label: `${labels.primaryContact}` },
                { num: 2, icon: ShieldCheck, label: `${labels.complianceDoc}` },
                { num: 3, icon: Map, label: 'GPS Geofence' },
                { num: 4, icon: Building2, label: 'Service Specs' }
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
            <Head title={`${vocab.entity.singular} Onboarding - Fieldy ${industry.name}`} />
            
            <div className="max-w-3xl mx-auto space-y-6 pb-12 hp-animate-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/farmers" className="hp-btn hp-btn-sm hp-btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back')}
                    </Link>
                    <div>
                        <h1 className="hp-page-title">{t(`${vocab.entity.singular} Onboarding Wizard`)}</h1>
                        <p className="text-sm text-hp-muted mt-0.5">{t(`Register new ${vocab.entity.plural.toLowerCase()} and configure operational parameters for ${industry.name}.`)}</p>
                    </div>
                </div>

                <div className="hp-card p-6 sm:p-8">
                    <StepIndicator />

                    <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                        
                        {/* STEP 1: Primary Contact Information */}
                        <div className={`space-y-6 ${step === 1 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t(`${labels.primaryContact} & Title Details`)}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">{t(`Primary administrative contact and location authority for this ${vocab.entity.singular.toLowerCase()}.`)}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t(`${vocab.entity.singular} Name / Title`)}</label>
                                    <input 
                                        type="text" 
                                        className="hp-input" 
                                        placeholder={`e.g. Prestige Heights Phase II`} 
                                        value={formData.full_name} 
                                        onChange={e => updateForm('full_name', e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t(`${labels.primaryContact} Mobile Phone`)}</label>
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
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Verification Passcode (OTP)')}</label>
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

                        {/* STEP 2: Compliance KYC Documents */}
                        <div className={`space-y-6 ${step === 2 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t(`${labels.complianceDoc} & Regulatory Documentation`)}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">{t(`Statutory registration certificates and identity proof.`)}</p>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t(`${labels.complianceDoc} Registration Number`)}</label>
                                    <input 
                                        type="text" 
                                        className="hp-input font-mono tracking-wider" 
                                        placeholder="REG-TN-2026-0412" 
                                        value={formData.aadhaar_number} 
                                        onChange={e => updateForm('aadhaar_number', e.target.value)} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-dashed border-hp-border rounded-lg p-5 flex flex-col items-center justify-center bg-hp-bg hover:border-hp-primary cursor-pointer transition-colors text-center">
                                        <UploadCloud className="w-8 h-8 text-hp-primary mb-2" />
                                        <p className="font-bold text-hp-dark text-xs">{t(`Upload ${labels.complianceDoc} PDF`)}</p>
                                        <p className="text-[11px] text-hp-muted mt-0.5">PDF, PNG, JPEG up to 10MB</p>
                                    </div>
                                    <div className="border border-dashed border-hp-border rounded-lg p-5 flex flex-col items-center justify-center bg-hp-bg hover:border-hp-primary cursor-pointer transition-colors text-center">
                                        <Building2 className="w-8 h-8 text-hp-primary mb-2" />
                                        <p className="font-bold text-hp-dark text-xs">{t('Site Layout / Blueprint Photo')}</p>
                                        <p className="text-[11px] text-hp-muted mt-0.5">High-res schematic or floor plan</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-hp-border">
                                <h4 className="text-xs font-bold text-hp-dark uppercase tracking-wider mb-3">{t(`${vocab.entity.singular} Physical Address`)}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-3">
                                        <input type="text" className="hp-input" placeholder="Street Address / Plot / Suite" value={formData.address} onChange={e => updateForm('address', e.target.value)} />
                                    </div>
                                    <div><input type="text" className="hp-input" placeholder="Locality / Sector" value={formData.village} onChange={e => updateForm('village', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="Sub-District / Zone" value={formData.taluk} onChange={e => updateForm('taluk', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="City / District" value={formData.district} onChange={e => updateForm('district', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="State" value={formData.state} onChange={e => updateForm('state', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="PIN / Postal Code" value={formData.pincode} onChange={e => updateForm('pincode', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 3: Site Mapping & Geofence */}
                        <div className={`space-y-6 ${step === 3 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t(`Operational Area & GPS Geofence`)}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">{t(`Specify coordinates for automated ${vocab.staff.singular.toLowerCase()} GPS check-in verification.`)}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t(`Total Site Footprint (${labels.areaUnit})`)}</label>
                                    <input type="number" className="hp-input" placeholder="e.g. 10.5" value={formData.total_land_owned} onChange={e => updateForm('total_land_owned', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t(`Active Operational Area (${labels.areaUnit})`)}</label>
                                    <input type="number" className="hp-input font-bold" placeholder="e.g. 8.2" value={formData.vetiver_land_allocated} onChange={e => updateForm('vetiver_land_allocated', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Site Code / Location Reference ID')}</label>
                                    <input type="text" className="hp-input" placeholder="e.g. LOC-SITE-042, Gate 4" value={formData.survey_number} onChange={e => updateForm('survey_number', e.target.value)} />
                                </div>
                            </div>

                            <div className="p-4 bg-hp-bg rounded-lg border border-hp-border">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold text-hp-dark uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-hp-primary" /> {t('Geofence Center Point GPS Coordinates')}
                                    </label>
                                    <button type="button" className="hp-btn hp-btn-sm hp-btn-secondary !h-7 !text-[11px]">
                                        <Search className="w-3 h-3 mr-1" /> {t('Auto-Detect Current GPS')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" className="hp-input !bg-white" placeholder="Latitude (e.g. 13.0827)" value={formData.lat} onChange={e => updateForm('lat', e.target.value)} />
                                    <input type="text" className="hp-input !bg-white" placeholder="Longitude (e.g. 80.2707)" value={formData.lng} onChange={e => updateForm('lng', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* STEP 4: Classification & Details */}
                        <div className={`space-y-6 ${step === 4 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t(`${labels.category} & Service Parameters`)}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">{t(`Configure SLA, category tier, and service scope.`)}</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Category Tier')}</label>
                                    <select
                                        className="hp-input font-bold"
                                        value={formData.customer_category}
                                        onChange={e => updateForm('customer_category', e.target.value)}
                                    >
                                        <option value="tier_1">Tier 1 - Mission Critical SLA</option>
                                        <option value="tier_2">Tier 2 - High Priority</option>
                                        <option value="standard">Standard Recurring Service</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Service Scope Tags')}</label>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {[labels.primaryMetric, labels.secondaryMetric, 'Scheduled Audits', 'Emergency SOS'].map(srv => {
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
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Target Monthly Visits / Dispatches')}</label>
                                    <input type="number" className="hp-input" placeholder="e.g. 12" value={formData.seed_bags_required} onChange={e => updateForm('seed_bags_required', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Monthly Retainer / Budget Value (₹)')}</label>
                                    <input type="number" className="hp-input" placeholder="45000" value={formData.planned_investment} onChange={e => updateForm('planned_investment', e.target.value)} />
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
                                    {loading ? t(`Registering ${vocab.entity.singular}...`) : t(`Register ${vocab.entity.singular}`)}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
