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
        irrigation_type: 'Underground EB & Avenue Roads',
        soil_type: 'DTCP & RERA Approved',
        expected_plantation_date: '',
        customer_category: 'crop',
        crop_types: ['Residential Plots'],
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
                { num: 1, icon: User, label: 'Developer Contact' },
                { num: 2, icon: ShieldCheck, label: 'RERA & Title KYC' },
                { num: 3, icon: Map, label: 'Site & GPS Geofence' },
                { num: 4, icon: Building2, label: 'Units & Pricing' }
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
            <Head title="Property & Project Onboarding - Fieldy Real Estate" />
            
            <div className="max-w-3xl mx-auto space-y-6 pb-12 hp-animate-in">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/farmers" className="hp-btn hp-btn-sm hp-btn-secondary">
                        <ArrowLeft className="w-4 h-4 mr-1" /> {t('Back')}
                    </Link>
                    <div>
                        <h1 className="hp-page-title">{t('Property & Project Onboarding Wizard')}</h1>
                        <p className="text-sm text-hp-muted mt-0.5">{t('Register real estate projects, plotted townships, luxury villas, and RERA marketing mandates.')}</p>
                    </div>
                </div>

                <div className="hp-card p-6 sm:p-8">
                    <StepIndicator />

                    <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                        
                        {/* STEP 1: Developer / Property Owner Information */}
                        <div className={`space-y-6 ${step === 1 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t('Developer / Property Owner Details')}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">Primary project title holder and sales mandate contact</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Property / Project Name')}</label>
                                    <input 
                                        type="text" 
                                        className="hp-input" 
                                        placeholder="e.g. Casagrand ECR Sea-View Villas" 
                                        value={formData.full_name} 
                                        onChange={e => updateForm('full_name', e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Developer / Sales Head Mobile')}</label>
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

                        {/* STEP 2: RERA & Title KYC Documents */}
                        <div className={`space-y-6 ${step === 2 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t('RERA, DTCP & Title Deed Verification')}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">Statutory RERA registration number, patta/chitta, and encumbrance verification</p>
                            </div>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('RERA / DTCP Approval Number')}</label>
                                    <input 
                                        type="text" 
                                        className="hp-input font-mono tracking-wider" 
                                        placeholder="TN/29/Building/0412/2026" 
                                        value={formData.aadhaar_number} 
                                        onChange={e => updateForm('aadhaar_number', e.target.value)} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border border-dashed border-hp-border rounded-lg p-5 flex flex-col items-center justify-center bg-hp-bg hover:border-hp-primary cursor-pointer transition-colors text-center">
                                        <UploadCloud className="w-8 h-8 text-hp-primary mb-2" />
                                        <p className="font-bold text-hp-dark text-xs">{t('Upload RERA / Title Deed PDF')}</p>
                                        <p className="text-[11px] text-hp-muted mt-0.5">PDF, PNG, JPEG up to 10MB</p>
                                    </div>
                                    <div className="border border-dashed border-hp-border rounded-lg p-5 flex flex-col items-center justify-center bg-hp-bg hover:border-hp-primary cursor-pointer transition-colors text-center">
                                        <User className="w-8 h-8 text-hp-primary mb-2" />
                                        <p className="font-bold text-hp-dark text-xs">{t('Project Master Layout / Elevation')}</p>
                                        <p className="text-[11px] text-hp-muted mt-0.5">High-res site layout or 3D render</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-hp-border">
                                <h4 className="text-xs font-bold text-hp-dark uppercase tracking-wider mb-3">{t('Property Site Location Address')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="md:col-span-3">
                                        <input type="text" className="hp-input" placeholder="Survey No. / Plot Layout / Road Address" value={formData.address} onChange={e => updateForm('address', e.target.value)} />
                                    </div>
                                    <div><input type="text" className="hp-input" placeholder="Locality / Corridor (e.g. OMR)" value={formData.village} onChange={e => updateForm('village', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="Taluk / Sub-Registrar Zone" value={formData.taluk} onChange={e => updateForm('taluk', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="City / District" value={formData.district} onChange={e => updateForm('district', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="State" value={formData.state} onChange={e => updateForm('state', e.target.value)} /></div>
                                    <div><input type="text" className="hp-input" placeholder="PIN Code" value={formData.pincode} onChange={e => updateForm('pincode', e.target.value)} /></div>
                                </div>
                            </div>
                        </div>

                        {/* STEP 3: Site Mapping & Geofence */}
                        <div className={`space-y-6 ${step === 3 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t('Project Land Extent & Site Geofence')}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">Specify project boundary coordinates for Property Advisor GPS check-in verification</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Total Project Area (Acres / Sq. Ft)')}</label>
                                    <input type="number" className="hp-input" placeholder="e.g. 12.5" value={formData.total_land_owned} onChange={e => updateForm('total_land_owned', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Saleable Carpet / Plot Area (Sq. Ft)')}</label>
                                    <input type="number" className="hp-input font-bold" placeholder="e.g. 185000" value={formData.vetiver_land_allocated} onChange={e => updateForm('vetiver_land_allocated', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Survey Numbers & Phase / Tower Numbers')}</label>
                                    <input type="text" className="hp-input" placeholder="e.g. S.F. No. 142/1B, Phase II, Plots 1 to 84" value={formData.survey_number} onChange={e => updateForm('survey_number', e.target.value)} />
                                </div>
                            </div>

                            <div className="p-4 bg-hp-bg rounded-lg border border-hp-border">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs font-bold text-hp-dark uppercase tracking-wider flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-hp-primary" /> {t('Site Experience Center GPS Coordinates')}
                                    </label>
                                    <button type="button" className="hp-btn hp-btn-sm hp-btn-secondary !h-7 !text-[11px]">
                                        <Search className="w-3 h-3 mr-1" /> {t('Auto-Detect Site GPS')}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" className="hp-input !bg-white" placeholder="Latitude (e.g. 12.8912)" value={formData.lat} onChange={e => updateForm('lat', e.target.value)} />
                                    <input type="text" className="hp-input !bg-white" placeholder="Longitude (e.g. 80.2445)" value={formData.lng} onChange={e => updateForm('lng', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* STEP 4: Property Typology & Pricing */}
                        <div className={`space-y-6 ${step === 4 ? 'block' : 'hidden'}`}>
                            <div className="border-b border-hp-border pb-3 mb-6">
                                <h3 className="hp-card-title">{t('Property Typology, Inventory & Guide Valuation')}</h3>
                                <p className="text-xs text-hp-muted mt-0.5">Configure unit types, available plot/villa inventory, and base project valuation</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Property Segment Classification')}</label>
                                    <select
                                        className="hp-input font-bold"
                                        value={formData.customer_category}
                                        onChange={e => updateForm('customer_category', e.target.value)}
                                    >
                                        <option value="crop">Residential Plots & Luxury Villas</option>
                                        <option value="fertilizer">Commercial & Grade-A Office Space</option>
                                        <option value="both">Gated Apartments & Integrated Township</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Unit Configurations Available')}</label>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {['Residential Plots', 'Luxury Villas', '3BHK / 4BHK Flats', 'Commercial Retail'].map(srv => {
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
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Total Saleable Units / Plots')}</label>
                                    <input type="number" className="hp-input" placeholder="e.g. 64" value={formData.seed_bags_required} onChange={e => updateForm('seed_bags_required', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Base Unit Price / Project Valuation (₹)')}</label>
                                    <input type="number" className="hp-input" placeholder="8500000" value={formData.planned_investment} onChange={e => updateForm('planned_investment', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-hp-dark uppercase tracking-wider mb-1.5">{t('Project Launch / Possession Date')}</label>
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
                                    {loading ? t('Listing Property...') : t('Publish Property Listing')}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
