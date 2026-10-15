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
        // Mock submission to dashboard
        setTimeout(() => {
            router.visit('/admin/farmers');
        }, 1500);
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-between mb-8 relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-900 rounded-full -z-10 transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
            
            {[
                { num: 1, icon: User, label: 'Contact' },
                { num: 2, icon: ShieldCheck, label: 'Identity / KYC' },
                { num: 3, icon: Map, label: 'Campus & GPS' },
                { num: 4, icon: Building2, label: 'Service Scope' }
            ].map((s) => (
                <div key={s.num} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-colors duration-300 ${step >= s.num ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                        <s.icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${step >= s.num ? 'text-slate-800' : 'text-gray-400'}`}>{s.label}</span>
                </div>
            ))}
        </div>
    );

    return (
        <AdminLayout>
            <Head title="Facility Onboarding - Fieldy Admin" />
            
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-slate-800">{t('Facility Onboarding Wizard')}</h1>
                    <p className="text-slate-500 mt-2 font-medium">Onboard new commercial, industrial, or residential facilities and verify SLAs.</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
                    <StepIndicator />

                    <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                        
                        {/* STEP 1: Personal Information */}
                        <div className={`space-y-6 transition-all duration-500 ${step === 1 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                            <h3 className="text-lg sm:text-xl font-heading font-semibold text-slate-800 border-b border-gray-100 pb-3 mb-6">Facility Manager / Client Contact</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Facility / Client Name</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="e.g. Olympia Tech Park / Rajesh Kumar" value={formData.full_name} onChange={e => updateForm('full_name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mobile Number</label>
                                    <div className="flex relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Smartphone className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input type="tel" className="flex-1 pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-l-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="+91 9876543210" value={formData.mobile_number} onChange={e => updateForm('mobile_number', e.target.value)} required />
                                        <button type="button" className="bg-slate-900 hover:bg-slate-800 text-white px-4 font-bold rounded-r-xl transition-colors text-sm">Send OTP</button>
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">OTP Verification</label>
                                    <input type="text" className="w-full md:w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all tracking-[0.5em] font-mono text-center text-sm" placeholder="• • • • • •" value={formData.otp} onChange={e => updateForm('otp', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* STEP 2: KYC Documents */}
                        <div className={`space-y-6 transition-all duration-500 ${step === 2 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                            <h3 className="text-lg sm:text-xl font-heading font-semibold text-slate-800 border-b border-gray-100 pb-3 mb-6">Identity Verification (KYC)</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Aadhaar Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <CreditCard className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <input type="text" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono text-lg tracking-widest" placeholder="XXXX XXXX XXXX" value={formData.aadhaar_number} onChange={e => updateForm('aadhaar_number', e.target.value)} />
                                    </div>
                                </div>

                                {/* File Upload Mocks */}
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-slate-50/50 hover:border-green-200 cursor-pointer transition-colors group">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <UploadCloud className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm">Upload Identity / Business Reg</p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">JPEG, PNG, PDF up to 5MB</p>
                                </div>
                                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-slate-50/50 hover:border-green-200 cursor-pointer transition-colors group">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <User className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <p className="font-bold text-gray-900 text-sm">Upload Facility Officer Photo</p>
                                    <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Clear ID / Profile photograph</p>
                                </div>
                            </div>

                            <h4 className="text-[10px] font-bold text-gray-900 mt-8 mb-4 uppercase tracking-wider border-b border-gray-100 pb-2">Facility Street Address</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-3">
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="Campus / Plot / Street Address" value={formData.address} onChange={e => updateForm('address', e.target.value)} />
                                </div>
                                <div><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="Sector / Area" value={formData.village} onChange={e => updateForm('village', e.target.value)} /></div>
                                <div><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="Zone / Ward" value={formData.taluk} onChange={e => updateForm('taluk', e.target.value)} /></div>
                                <div><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="City / District" value={formData.district} onChange={e => updateForm('district', e.target.value)} /></div>
                                <div><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="State" value={formData.state} onChange={e => updateForm('state', e.target.value)} /></div>
                                <div><input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="PIN Code" value={formData.pincode} onChange={e => updateForm('pincode', e.target.value)} /></div>
                            </div>
                        </div>

                        {/* STEP 3: Farm Mapping */}
                        <div className={`space-y-6 transition-all duration-500 ${step === 3 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                            <h3 className="text-lg sm:text-xl font-heading font-semibold text-slate-800 border-b border-gray-100 pb-3 mb-6">Facility Campus & Geolocation</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Campus Area (Sq. Ft / Units)</label>
                                    <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="e.g. 50000" value={formData.total_land_owned} onChange={e => updateForm('total_land_owned', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Serviceable / Covered Area (Sq. Ft)</label>
                                    <input type="number" className="w-full px-4 py-3 bg-slate-50/50 border-blue-200 border-2 rounded-xl text-blue-700 font-bold focus:ring-2 focus:ring-blue-500/30 transition-all text-sm" placeholder="e.g. 35000" value={formData.vetiver_land_allocated} onChange={e => updateForm('vetiver_land_allocated', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Building / Unit Identification Number</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="e.g. Block-B, Tower 3, Floor 4-8" value={formData.survey_number} onChange={e => updateForm('survey_number', e.target.value)} />
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-sm font-bold text-gray-900 flex items-center"><MapPin className="w-4 h-4 text-slate-700 mr-2"/> GPS Geofence Coordinates</label>
                                    <button type="button" className="text-[10px] uppercase tracking-wider font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center hover:text-slate-800 transition-colors">
                                        <Search className="w-3 h-3 mr-1"/> Auto-Detect Location
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" placeholder="Latitude" value={formData.lat} onChange={e => updateForm('lat', e.target.value)} />
                                    <input type="text" className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all" placeholder="Longitude" value={formData.lng} onChange={e => updateForm('lng', e.target.value)} />
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-slate-50/50 hover:border-green-200 cursor-pointer transition-colors group">
                                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-6 h-6 text-blue-500" />
                                </div>
                                <p className="font-bold text-gray-900 text-sm">Upload Facility Front & Campus Photos</p>
                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Upload at least 2 clear wide-angle photos of the building/site</p>
                            </div>
                        </div>

                        {/* STEP 4: Facility Scope & Services */}
                        <div className={`space-y-6 transition-all duration-500 ${step === 4 ? 'block opacity-100' : 'hidden opacity-0'}`}>
                            <h3 className="text-lg sm:text-xl font-heading font-semibold text-slate-800 border-b border-gray-100 pb-3 mb-6">FM Contract Scope & Services</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Service Agreement Classification</label>
                                    <select
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-semibold focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                                        value={formData.customer_category}
                                        onChange={e => updateForm('customer_category', e.target.value)}
                                    >
                                        <option value="crop">Hard FM (HVAC, Electrical, Plumbing & MEP)</option>
                                        <option value="fertilizer">Soft FM (Housekeeping, Security, Waste Mgmt)</option>
                                        <option value="both">Integrated Facility Management (IFM)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Core Services Included</label>
                                    <div className="flex flex-wrap gap-2 pt-1">
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
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                        isSelected
                                                            ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-xs'
                                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {srv}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Allocated Equipment / Spares (Units)</label>
                                    <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="0" value={formData.seed_bags_required} onChange={e => updateForm('seed_bags_required', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Annual SLA Contract Budget (₹)</label>
                                    <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" placeholder="250000" value={formData.planned_investment} onChange={e => updateForm('planned_investment', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Fire & Water Utility System</label>
                                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" value={formData.irrigation_type} onChange={e => updateForm('irrigation_type', e.target.value)}>
                                        <option value="Centralised Sprinkler">Centralised Sprinkler & Hydrant</option>
                                        <option value="Rooftop Gravity">Rooftop Gravity Tank & Boosters</option>
                                        <option value="Borewell/Hydro-pneumatic">Hydro-pneumatic System</option>
                                        <option value="Municipal Mains">Direct Municipal Mains</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Building Structure / Flooring</label>
                                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" value={formData.soil_type} onChange={e => updateForm('soil_type', e.target.value)}>
                                        <option value="Reinforced Concrete">Reinforced Concrete / Granite</option>
                                        <option value="Steel Framework">Steel Framework / Epoxy Industrial</option>
                                        <option value="Glass Façade Corporate">Glass Façade Corporate</option>
                                        <option value="Warehouse Pre-engineered">Pre-engineered Warehouse</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SLA Effective Start Date</label>
                                    <input type="date" className="w-full md:w-1/2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm" value={formData.expected_plantation_date} onChange={e => updateForm('expected_plantation_date', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                            {step > 1 ? (
                                <button type="button" onClick={prevStep} className="cursor-pointer flex items-center px-6 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm text-sm">
                                    <ArrowLeft className="w-5 h-5 mr-2" /> Back
                                </button>
                            ) : <div></div>}

                            {step < 4 ? (
                                <button type="submit" className="cursor-pointer flex items-center px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg shadow-slate-900/10 text-sm">
                                    Continue <ArrowRight className="w-5 h-5 ml-2" />
                                </button>
                            ) : (
                                <button type="submit" disabled={loading} className="cursor-pointer flex items-center px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg shadow-slate-900/10 disabled:opacity-70 text-sm">
                                    {loading ? (
                                        <div className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Onboarding Facility...
                                        </div>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 mr-2" /> Complete Onboarding
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
