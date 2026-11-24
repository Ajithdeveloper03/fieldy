import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import SuperadminLayout from './SuperadminLayout';
import { getIndianPhoto } from '../../Components/CardPhotoBackdrop';
import {
    Check, X, Sparkles, Shield, Zap, Layers, ArrowRight,
    Smartphone, Globe, Award, HelpCircle, ChevronDown, ChevronUp,
    Cpu, Building2, Lock, CheckCircle2, Home, ChevronRight, Crown, Star
} from 'lucide-react';

export default function Subscriptions() {
    const { t } = useTranslation();
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
            tenantsCount: 12,
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
            tenantsCount: 34,
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
            tenantsCount: 8,
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

    return (
        <SuperadminLayout>
            <Head title={`${t('Plans & Add-ons Marketplace')} — ${t('Superadmin')}`} />

            <div className="space-y-8 pb-10">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/superadmin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>{t('Superadmin')}</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">{t('Plans & Add-ons Marketplace')}</span>
                </div>

                {/* Hero Banner with subtle Indian corporate backdrop */}
                <div className="relative overflow-hidden rounded-3xl bg-[#162332] border border-white/15 text-white p-8 md:p-12 shadow-xl">
                    <img
                        src={getIndianPhoto('office')}
                        alt=""
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-20"
                    />
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.72) 55%, rgba(10,50,53,0.85) 100%)' }}
                    />
                    <div className="relative z-10 max-w-3xl mx-auto text-center space-y-5">
                        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-bold uppercase tracking-wider text-teal-200">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            {t('Superadmin SaaS Billing & Edition Catalog')}
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                            {t('Manage Tenant Editions & Platform Add-ons')}
                        </h1>
                        <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto">
                            {t('Configure multi-company subscription tiers, agent quotas, and industry-specific add-on modules across all client organizations on the Fieldy platform.')}
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
                                    {t('Monthly Billing')}
                                </button>
                                <button
                                    onClick={() => setBillingCycle('annual')}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                        billingCycle === 'annual'
                                            ? 'bg-[var(--color-hp-primary)] text-white shadow-sm'
                                            : 'text-slate-300 hover:text-white'
                                    }`}
                                >
                                    <span>{t('Annual Contract')}</span>
                                    <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-400 text-slate-950 font-extrabold">
                                        {t('2 MONTHS FREE')}
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
                                className={`hp-card relative flex flex-col justify-between transition-all duration-300 ${
                                    plan.popular
                                        ? 'ring-2 ring-[var(--color-hp-primary)] lg:-translate-y-2'
                                        : ''
                                }`}
                            >
                                {/* Top Ribbon for Popular Plan */}
                                {plan.popular && (
                                    <div className="bg-[var(--color-hp-primary)] text-white text-center py-2 px-4 rounded-t-[20px] text-xs font-extrabold uppercase tracking-widest flex items-center justify-center gap-1.5">
                                        <Star className="w-3.5 h-3.5 fill-current" />
                                        <span>{t(plan.discount)}</span>
                                    </div>
                                )}

                                <div className="p-6 md:p-8 flex-1 flex flex-col">
                                    {/* Discount Pill for non-popular */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        {!plan.popular ? (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-hp-primary-light text-[var(--color-hp-primary)] text-[11px] font-extrabold">
                                                {t(plan.discount)}
                                            </span>
                                        ) : (
                                            <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold">
                                                {t('DEFAULT TENANT TIER')}
                                            </span>
                                        )}
                                        <span className="text-[11px] font-bold text-slate-600 bg-white/60 px-2.5 py-1 rounded-full border border-white/80">
                                            {plan.tenantsCount} {t('Active Tenants')}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">{t(plan.name)}</h3>
                                    <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{t(plan.subtitle)}</p>

                                    {/* Price Block */}
                                    <div className="my-6 pb-6 border-b border-slate-200/70">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 line-through">
                                            ₹{plan.originalPrice.toLocaleString('en-IN')}/{t('mo')}
                                        </div>
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-lg font-bold text-slate-900">₹</span>
                                            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
                                                {price.toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500">{t('/mo per tenant')}</span>
                                        </div>
                                        <p className="text-[11px] text-emerald-700 font-semibold mt-1.5">
                                            {billingCycle === 'annual' ? t('+3 months free on 36-month enterprise lock-in') : t('Billed monthly per client organization')}
                                        </p>
                                    </div>

                                    {/* CTA Button */}
                                    <Link
                                        href="/superadmin/companies"
                                        className={`hp-btn w-full mb-6 ${plan.popular ? 'hp-btn-primary' : 'hp-btn-secondary'}`}
                                    >
                                        <span>{t(plan.cta)}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>

                                    {/* Feature Checklist */}
                                    <div className="space-y-3 flex-1">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            {t('Included Tenant Capabilities')}
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
                                                    {t(feat.text)}
                                                </span>
                                                {feat.badge && (
                                                    <span className="ml-auto px-1.5 py-0.5 text-[9px] font-extrabold rounded bg-hp-primary-light text-[var(--color-hp-primary)]">
                                                        {t(feat.badge)}
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
            </div>
        </SuperadminLayout>
    );
}
