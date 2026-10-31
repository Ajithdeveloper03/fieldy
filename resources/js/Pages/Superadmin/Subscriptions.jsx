import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import SuperadminLayout from './SuperadminLayout';
import { 
    Check, X, Sparkles, Shield, Zap, Layers, ArrowRight, 
    Smartphone, Globe, Award, HelpCircle, ChevronDown, ChevronUp, 
    Cpu, Building2, Lock, CheckCircle2, Home, ChevronRight, Crown
} from 'lucide-react';

export default function Subscriptions() {
    const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
    const [openFaq, setOpenFaq] = useState(0);

    const plans = [
        {
            name: 'FIELDY WORKFORCE',
            subtitle: 'Ideal for compact field teams & local operations',
            monthlyPrice: 4999,
            annualPrice: 2999,
            originalPrice: 7999,
            discount: 'SAVE 62%',
            popular: false,
            cta: 'Provision Starter Plan',
            tenantsCount: '12 Active Tenants',
            features: [
                { text: 'Up to 25 Active Field Officers', included: true },
                { text: 'Live GPS Attendance & Geofence Check-in', included: true },
                { text: 'Unlimited Client & Site Profiles', included: true },
                { text: 'Basic Task & Work Order Dispatch', included: true },
                { text: 'Mobile App (Android & iOS) Access', included: true },
                { text: 'Standard CSV & PDF Audit Reports', included: true },
                { text: 'AI Route Optimization & Predictive SLA', included: false },
                { text: 'Multi-Branch Hierarchy & Custom Roles', included: false },
                { text: 'Dedicated Account Manager & 24/7 SLA', included: false },
            ]
        },
        {
            name: 'FIELDY FIELD PRO',
            subtitle: 'Complete suite for growing multi-district enterprises',
            monthlyPrice: 9999,
            annualPrice: 5999,
            originalPrice: 15999,
            discount: 'MOST POPULAR • 63% OFF',
            popular: true,
            cta: 'Default Enterprise Tier',
            current: true,
            tenantsCount: '34 Active Tenants',
            features: [
                { text: 'Up to 150 Active Field Officers', included: true, bold: true },
                { text: 'Real-Time Live Telemetry & Breadcrumb Replay', included: true, bold: true },
                { text: 'Unlimited Client & Site Profiles + KYC Vault', included: true },
                { text: 'Smart Work Orders with OTP & Photo Proof', included: true },
                { text: 'Automated Payroll, TA/DA & Commission Ledger', included: true },
                { text: 'Fieldy AI Assistant & Anomaly Detection', included: true, badge: 'FREE' },
                { text: 'AI Route Optimization & Predictive SLA', included: true },
                { text: 'Multi-Branch Hierarchy & Custom Roles', included: true },
                { text: 'Dedicated Account Manager & 24/7 SLA', included: false },
            ]
        },
        {
            name: 'FIELDY CLOUD SCALE',
            subtitle: 'Maximum power & custom integrations for nationwide scale',
            monthlyPrice: 19999,
            annualPrice: 12999,
            originalPrice: 29999,
            discount: 'SAVE 57%',
            popular: false,
            cta: 'Configure Custom Tenant',
            tenantsCount: '8 Active Tenants',
            features: [
                { text: 'Unlimited Active Field Officers', included: true, bold: true },
                { text: 'High-Frequency 5s Live GPS Telemetry Stream', included: true, bold: true },
                { text: 'Multi-Tenant Sub-Organizations & Franchises', included: true },
                { text: 'Custom ERP / SAP / Tally Webhook Sync', included: true },
                { text: 'White-Label Mobile APK & Custom Domain', included: true, badge: 'NEW' },
                { text: 'Fieldy AI Co-Pilot + Custom LLM Training', included: true },
                { text: 'AI Route Optimization & Predictive SLA', included: true },
                { text: 'Multi-Branch Hierarchy & Granular RBAC', included: true },
                { text: 'Dedicated Account Manager & 99.99% Uptime SLA', included: true },
            ]
        }
    ];

    const addons = [
        {
            title: 'WhatsApp Business API Bot',
            category: 'COMMUNICATION',
            desc: 'Send automated visit reminders, digital receipts, and OTP confirmations directly to clients on WhatsApp.',
            price: '₹999',
            period: '/mo per tenant',
            icon: Smartphone,
            color: 'bg-emerald-50 text-emerald-600',
            active: true,
        },
        {
            title: 'Satellite GIS & Plot Boundary Pro',
            category: 'GEOSPATIAL',
            desc: 'Measure property plot boundaries, land parcels, and project site perimeters via satellite polygons.',
            price: '₹1,499',
            period: '/mo per tenant',
            icon: Globe,
            color: 'bg-blue-50 text-blue-600',
            active: true,
        },
        {
            title: 'AI Face Liveness & Biometric KYC',
            category: 'SECURITY',
            desc: 'Prevent buddy-punching with 3D liveness selfie verification and instant Aadhaar/ID OCR extraction.',
            price: '₹1,299',
            period: '/mo per tenant',
            icon: Shield,
            color: 'bg-orange-50 text-[var(--color-hp-primary)]',
            active: false,
        },
        {
            title: 'ERP & Tally Prime Auto-Bridge',
            category: 'ACCOUNTING',
            desc: 'Two-way real-time sync for bookings, field expenses, invoices, and staff disbursements with Tally & Zoho.',
            price: '₹1,999',
            period: '/mo per tenant',
            icon: Cpu,
            color: 'bg-amber-50 text-amber-600',
            active: false,
        }
    ];

    const comparisonRows = [
        { feature: 'Active Field Force Quota', starter: '25 Officers', pro: '150 Officers', enterprise: 'Unlimited' },
        { feature: 'GPS Breadcrumb Retention', starter: '30 Days', pro: '1 Year', enterprise: 'Unlimited (Cold Storage)' },
        { feature: 'Geofence Radius Accuracy', starter: '50 Meters', pro: '10 Meters (High Precision)', enterprise: 'Custom Polygon Fencing' },
        { feature: 'Offline-First Mobile Sync', starter: true, pro: true, enterprise: true },
        { feature: 'Customer OTP & Digital Sign-off', starter: true, pro: true, enterprise: true },
        { feature: 'Fieldy AI Operations Assistant', starter: false, pro: true, enterprise: true },
        { feature: 'Custom Branding & White-Label Domain', starter: false, pro: false, enterprise: true },
        { feature: 'API Rate Limit', starter: '1,000 req/min', pro: '10,000 req/min', enterprise: 'Unlimited Dedicated Node' },
    ];

    const faqs = [
        {
            q: 'How are subscription tiers assigned to Client Companies?',
            a: 'As a Superadmin, you can assign or upgrade any client company between Starter, Professional, and Enterprise tiers directly from the Client Companies directory. Quota changes apply immediately without downtime.'
        },
        {
            q: 'What happens when a tenant reaches their Field Officer quota?',
            a: 'Existing field officers continue to stream GPS and log visits normally. To onboard additional employees beyond their tier limit, the Superadmin can either increase their custom agent limit or upgrade their subscription plan.'
        },
        {
            q: 'Can add-on modules be enabled per client company?',
            a: 'Yes! Platform add-ons like Satellite GIS Plot Boundary Pro, WhatsApp Business API Bot, and Biometric KYC can be provisioned per tenant based on their industry vertical (such as Real Estate, Agriculture, or Facility Management).'
        },
        {
            q: 'How does Multi-Company Tenant Isolation work?',
            a: 'Every client company operates in an isolated tenant scope with dedicated employee rosters, property/client records, GPS logs, and financial ledgers. Client Admins only see their own organization workflow.'
        }
    ];

    return (
        <SuperadminLayout>
            <Head title="Platform Plans & Add-ons Marketplace — Superadmin" />

            <div className="space-y-8 pb-10">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/superadmin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Superadmin</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">Plans & Add-ons Marketplace</span>
                </div>

                {/* Hero Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B2E] via-[#2B193D] to-[#1A1025] text-white p-8 md:p-12 shadow-xl">
                    <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--color-hp-primary)]/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-wider text-orange-200">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            Superadmin SaaS Billing & Edition Catalog
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            Manage Tenant Editions & Platform Add-ons
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto">
                            Configure multi-company subscription tiers, agent quotas, and industry-specific add-on modules across all client organizations on the Fieldy platform.
                        </p>

                        {/* Billing Toggle Pill */}
                        <div className="pt-2 flex items-center justify-center">
                            <div className="inline-flex items-center bg-white/10 p-1.5 rounded-2xl border border-white/15 backdrop-blur-md">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                                        billingCycle === 'monthly'
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    Monthly Billing
                                </button>
                                <button
                                    onClick={() => setBillingCycle('annual')}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                        billingCycle === 'annual'
                                            ? 'bg-[var(--color-hp-primary)] text-white shadow-sm'
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    <span>Annual Contract</span>
                                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-400 text-slate-950 font-extrabold">
                                        2 MONTHS FREE
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3-Column Pricing Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch pt-2">
                    {plans.map((plan, idx) => {
                        const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                        return (
                            <div
                                key={idx}
                                className={`relative rounded-2xl bg-white flex flex-col justify-between transition-all duration-300 ${
                                    plan.popular
                                        ? 'border-2 border-[var(--color-hp-primary)] shadow-[0_12px_36px_-8px_rgba(242,106,16,0.22)] lg:-translate-y-2'
                                        : 'border border-[var(--color-hp-border)] shadow-[var(--shadow-hp)] hover:shadow-[var(--shadow-hp-md)]'
                                }`}
                            >
                                {/* Top Ribbon for Popular Plan */}
                                {plan.popular && (
                                    <div className="bg-[var(--color-hp-primary)] text-white text-center py-2 px-4 rounded-t-[14px] text-xs font-extrabold uppercase tracking-widest">
                                        ★ {plan.discount}
                                    </div>
                                )}

                                <div className="p-6 md:p-8 flex-1 flex flex-col">
                                    {/* Discount Pill for non-popular */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        {!plan.popular ? (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-orange-50 text-[var(--color-hp-primary)] text-[11px] font-extrabold">
                                                {plan.discount}
                                            </span>
                                        ) : (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold">
                                                DEFAULT TENANT TIER
                                            </span>
                                        )}
                                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                            {plan.tenantsCount}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{plan.name}</h3>
                                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{plan.subtitle}</p>

                                    {/* Price Block */}
                                    <div className="my-6 pb-6 border-b border-slate-100">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 line-through">
                                            ₹{plan.originalPrice.toLocaleString('en-IN')}/mo
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-lg font-bold text-slate-900">₹</span>
                                            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                                {price.toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500">/mo per tenant</span>
                                        </div>
                                        <p className="text-[11px] text-emerald-600 font-semibold mt-1.5">
                                            {billingCycle === 'annual' ? '+3 months free on 36-month enterprise lock-in' : 'Billed monthly per client organization'}
                                        </p>
                                    </div>

                                    {/* CTA Button */}
                                    <Link
                                        href="/superadmin/companies"
                                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mb-6 ${
                                            plan.popular
                                                ? 'bg-[var(--color-hp-primary)] hover:bg-[var(--color-hp-primary-hover)] text-white shadow-md shadow-orange-600/20'
                                                : 'bg-slate-900 hover:bg-slate-800 text-white'
                                        }`}
                                    >
                                        <span>{plan.cta}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>

                                    {/* Feature Checklist */}
                                    <div className="space-y-3 flex-1">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                            Included Tenant Capabilities
                                        </p>
                                        {plan.features.map((feat, fIdx) => (
                                            <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                                                {feat.included ? (
                                                    <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <Check className="w-3 h-3 stroke-[2.5]" />
                                                    </div>
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <X className="w-3 h-3" />
                                                    </div>
                                                )}
                                                <span className={`${feat.included ? 'text-slate-700' : 'text-slate-400 line-through'} ${feat.bold ? 'font-bold text-slate-900' : ''}`}>
                                                    {feat.text}
                                                </span>
                                                {feat.badge && (
                                                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-orange-100 text-[var(--color-hp-primary)]">
                                                        {feat.badge}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Power Add-ons Marketplace */}
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Multi-Tenant Add-on Modules</h2>
                            <p className="text-xs text-slate-500">Provision specialized geospatial, WhatsApp, and biometric modules for specific client companies</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-hp-primary)] bg-orange-50 px-3 py-1.5 rounded-lg">
                            <Layers className="w-3.5 h-3.5" /> 2 Global Modules Active
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {addons.map((addon, idx) => {
                            const Icon = addon.icon;
                            return (
                                <div key={idx} className="hp-card p-5 flex flex-col justify-between hover:border-[var(--color-hp-primary)]/40 transition-all">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${addon.color}`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            {addon.active ? (
                                                <span className="hp-chip hp-chip-success flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Enabled
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    {addon.category}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900">{addon.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{addon.desc}</p>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div>
                                            <span className="text-base font-extrabold text-slate-900">{addon.price}</span>
                                            <span className="text-[11px] text-slate-400">{addon.period}</span>
                                        </div>
                                        <button
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                addon.active
                                                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    : 'bg-orange-50 text-[var(--color-hp-primary)] hover:bg-[var(--color-hp-primary)] hover:text-white'
                                            }`}
                                        >
                                            {addon.active ? 'Configure' : '+ Enable Module'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Technical Specification Comparison Table */}
                <div className="hp-card overflow-hidden">
                    <div className="p-6 border-b border-[var(--color-hp-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Platform Edition Architecture Comparison</h2>
                            <p className="text-xs text-slate-500">Granular infrastructure, rate limits, and SLA specifications across tenant tiers</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                            <Lock className="w-3.5 h-3.5" /> ISO 27001 & SOC2 Compliant
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="hp-table">
                            <thead>
                                <tr>
                                    <th className="w-1/3">Platform Capability</th>
                                    <th className="text-center">Fieldy Workforce</th>
                                    <th className="text-center bg-orange-50/60 text-[var(--color-hp-primary)]">Fieldy Field Pro</th>
                                    <th className="text-center">Fieldy Cloud Scale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparisonRows.map((row, rIdx) => (
                                    <tr key={rIdx}>
                                        <td className="font-semibold text-slate-800">{row.feature}</td>
                                        <td className="text-center text-slate-600">
                                            {typeof row.starter === 'boolean' ? (
                                                row.starter ? <Check className="w-4 h-4 text-emerald-600 mx-auto" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />
                                            ) : row.starter}
                                        </td>
                                        <td className="text-center font-semibold text-slate-900 bg-orange-50/30">
                                            {typeof row.pro === 'boolean' ? (
                                                row.pro ? <Check className="w-4 h-4 text-[var(--color-hp-primary)] mx-auto stroke-[2.5]" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />
                                            ) : row.pro}
                                        </td>
                                        <td className="text-center font-semibold text-slate-800">
                                            {typeof row.enterprise === 'boolean' ? (
                                                row.enterprise ? <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[2.5]" /> : <X className="w-4 h-4 text-slate-300 mx-auto" />
                                            ) : row.enterprise}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* FAQ Accordion */}
                <div className="hp-card p-6 md:p-8">
                    <div className="max-w-3xl mx-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Superadmin Tenant Licensing FAQs</h2>
                            <p className="text-xs text-slate-500 mt-1">How multi-company provisioning, quotas, and add-on billing operate</p>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {faqs.map((faq, idx) => (
                                <div key={idx} className="py-4">
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                                        className="w-full flex items-center justify-between text-left gap-4"
                                    >
                                        <span className="text-sm font-bold text-slate-900 flex items-center gap-2.5">
                                            <HelpCircle className="w-4 h-4 text-[var(--color-hp-primary)] flex-shrink-0" />
                                            {faq.q}
                                        </span>
                                        {openFaq === idx ? (
                                            <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        )}
                                    </button>
                                    {openFaq === idx && (
                                        <p className="text-xs text-slate-600 mt-2.5 pl-6.5 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </SuperadminLayout>
    );
}

