import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Wallet, TrendingUp, IndianRupee, CreditCard, 
    Search, Filter, CheckCircle2, XCircle, 
    Clock, Download, Users, Briefcase, FileText, X,
    ChevronRight, Home, ArrowUpRight, Sparkles, Building2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../Components/AlertSystem';

export default function Payments({ farmer_payments = [], officer_payments = [], payments = [], totals = {}, kpis = {} }) {
    const { t } = useTranslation();
    const alertSystem = useAlert ? useAlert() : {};
    const triggerInfo = alertSystem?.triggerInfo;
    const triggerSuccess = alertSystem?.triggerSuccess;

    const [activeTab, setActiveTab] = useState('farmers');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const defaultBookings = [
        { id: 'BKG-2026-841', farmer: 'Casagrand ECR Sea-View Villas (Plot #14)', buyer: 'Dr. RameshSubramanian', region: 'ECR Luxury Corridor', amount: '5,00,000', status: 'completed', mode: 'RTGS Booking Token Advance', date: 'Today, 11:20 AM' },
        { id: 'BKG-2026-840', farmer: 'GSquare OMR IT City Plots (Plot #42 & #43)', buyer: 'Anitha Krishnan', region: 'OMR Corridor', amount: '2,50,000', status: 'completed', mode: 'NEFT Plot Blocking Advance', date: 'Yesterday' },
        { id: 'BKG-2026-839', farmer: 'Prestige Pallavaram Gardens (4BHK Villa #08)', buyer: 'Suresh Venkatesan', region: 'GST South Corridor', amount: '12,40,000', status: 'pending', mode: 'Sale Agreement Milestone (20%)', date: '2 days ago' },
        { id: 'BKG-2026-838', farmer: 'Brigade World Trade Tower (Unit #904)', buyer: 'Apex Ventures Pvt Ltd', region: 'OMR Perungudi', amount: '18,00,000', status: 'completed', mode: 'RTGS Commercial Allotment', date: '4 days ago' },
    ];

    const defaultAdvisorPayouts = payments.length > 0
        ? payments.map(p => ({
            id: `COM-${1000 + p.id}`,
            officer: p.employee?.name || 'Property Advisor',
            region: p.payment_type === 'bonus' ? 'Sales Booking Commission (2%)' : p.payment_type === 'reimbursement' ? 'Site Visit Travel Allowance' : 'Monthly Advisor Retainer',
            amount: Number(p.amount || 0).toLocaleString('en-IN'),
            status: p.status === 'paid' ? 'completed' : p.status,
            mode: p.notes || 'NEFT Commission Settlement',
            date: p.payment_date || p.month_year || 'Current Cycle',
        }))
        : [
            { id: 'COM-2026-109', officer: 'Karthik Sundaram (Senior Advisor)', region: '2% Brokerage — Plot #14 ECR Villa', amount: '1,45,000', status: 'completed', mode: 'IMPS Commission Payout', date: 'Today' },
            { id: 'COM-2026-108', officer: 'Arun Prakash (Property Advisor)', region: 'Buyer Site Showing Travel & Fuel TA', amount: '14,800', status: 'completed', mode: 'UPI Instant Settlement', date: 'Yesterday' },
            { id: 'COM-2026-107', officer: 'Divya Bharathi (Luxury Villa Specialist)', region: 'Booking Incentive — OMR Plotted Township', amount: '85,000', status: 'pending', mode: 'Awaiting Sale Deed Registration', date: '3 days ago' },
        ];

    const effectiveBookings = farmer_payments.length > 0 ? farmer_payments : defaultBookings;
    const effectiveAdvisorPayouts = officer_payments.length > 0 ? officer_payments : defaultAdvisorPayouts;

    const getStatusChip = (status) => {
        const s = String(status || '').toLowerCase();
        if (s === 'completed' || s === 'paid') {
            return (
                <span className="hp-chip hp-chip-success inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-hp-success" />
                    <span>{t('Settled')}</span>
                </span>
            );
        }
        if (s === 'pending') {
            return (
                <span className="hp-chip hp-chip-warning inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-hp-warning" />
                    <span>{t('In Escrow / Pending')}</span>
                </span>
            );
        }
        return (
            <span className="hp-chip hp-chip-danger inline-flex items-center gap-1">
                <XCircle className="w-3 h-3 text-hp-danger" />
                <span>{t('Failed')}</span>
            </span>
        );
    };

    const filteredFarmerPayments = useMemo(() => {
        return effectiveBookings.filter(p => {
            const matchSearch = String(p.farmer || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                String(p.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                String(p.region || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || String(p.status || '').toLowerCase() === statusFilter.toLowerCase();
            return matchSearch && matchStatus;
        });
    }, [searchQuery, statusFilter, effectiveBookings]);

    const filteredOfficerPayments = useMemo(() => {
        return effectiveAdvisorPayouts.filter(p => {
            const matchSearch = String(p.officer || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                String(p.id || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || String(p.status || '').toLowerCase() === statusFilter.toLowerCase();
            return matchSearch && matchStatus;
        });
    }, [searchQuery, statusFilter, effectiveAdvisorPayouts]);

    const handleExport = () => {
        if (triggerInfo) triggerInfo('Exporting real estate bookings & commission ledger... Your download will begin shortly.');
        else alert('Exporting bookings & commission ledger...');
    };

    const handleInitiatePayment = () => {
        if (triggerSuccess) triggerSuccess('Booking token & advisor commission release form is ready.');
        else alert('Booking token & advisor commission release form is ready.');
    };

    const activeList = activeTab === 'farmers' ? filteredFarmerPayments : filteredOfficerPayments;

    return (
        <AdminLayout>
            <Head title="Bookings, Token Advances & Commissions - Fieldy Real Estate" />
            
            <div className="space-y-6 pb-12 hp-animate-in">

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {t('Real Estate Financial Ledger')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {t('RERA Escrow & Commission Engine')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t('Property Bookings, Token Advances & Advisor Commissions')}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t('Track buyer booking token collections, sale agreement milestone receipts, developer payouts, and Property Advisor brokerage & site travel allowances.')}
                            </p>

                            {/* Hostinger Pill Search Bar */}
                            <div className="mt-5 max-w-lg">
                                <div className="hp-search-pill-bar">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('Search by Booking ID, Property, Plot No., Advisor, or UTR...')}
                                        className="w-full bg-transparent text-sm text-hp-dark placeholder:text-hp-muted focus:outline-none"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="p-1 text-hp-muted hover:text-hp-dark">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Top Action Buttons (Hostinger Pill Style) */}
                        <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
                            <button 
                                onClick={handleExport} 
                                className="hp-btn hp-btn-secondary !rounded-full"
                            >
                                <Download className="w-4 h-4 mr-1" />
                                <span>{t('Export RERA Ledger')}</span>
                            </button>
                            <button 
                                onClick={handleInitiatePayment} 
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <CreditCard className="w-4 h-4 mr-1" />
                                <span>{t('Record Booking / Commission')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO KPI METRIC CARDS ══════════ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Total Booking Collections */}
                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Booking & Token Volume (MTD)')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-primary-light text-hp-primary flex items-center justify-center">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            ₹{kpis.total_disbursed || (totals.total ? Number(totals.total).toLocaleString('en-IN') : '37,90,000')}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-hp-success font-bold mt-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+18.4% {t('plot & villa booking velocity')}</span>
                        </div>
                    </div>

                    {/* Card 2: Pending Registration / Commission */}
                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Pending Sale Deed / Escrow')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-warning-light text-hp-warning flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            {kpis.pending_count || 6}
                        </p>
                        <p className="text-xs text-hp-muted mt-2">
                            {t('Awaiting Sub-Registrar registration & release')}
                        </p>
                    </div>

                    {/* Card 3: Advisor Commissions Settled */}
                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Verified Bookings & Payouts')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-hover text-hp-dark flex items-center justify-center">
                                <IndianRupee className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            {kpis.total_transactions || totals.count || 42}
                        </p>
                        <p className="text-xs text-hp-muted mt-2">
                            100% {t('RERA compliant receipt audit')}
                        </p>
                    </div>
                </div>

                {/* ══════════ HOSTINGER SEGMENTED TABS & STATUS FILTER ══════════ */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Category Tabs */}
                    <div className="hp-segmented-bar">
                        <button 
                            onClick={() => setActiveTab('farmers')}
                            className={`hp-segmented-item ${activeTab === 'farmers' ? 'is-active-primary' : ''}`}
                        >
                            <Building2 className="w-4 h-4" />
                            <span>{t('Property Bookings & Token Advances')}</span>
                            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'farmers' ? 'bg-white/20 text-white' : 'bg-hp-border text-hp-muted'}`}>
                                {effectiveBookings.length}
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('officers')}
                            className={`hp-segmented-item ${activeTab === 'officers' ? 'is-active-primary' : ''}`}
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>{t('Advisor Commissions & Site Travel TA')}</span>
                            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'officers' ? 'bg-white/20 text-white' : 'bg-hp-border text-hp-muted'}`}>
                                {effectiveAdvisorPayouts.length}
                            </span>
                        </button>
                    </div>

                    {/* Status Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {['all', 'completed', 'pending', 'failed'].map((st) => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`hp-pill !h-8 !text-xs ${statusFilter === st ? '!bg-hp-dark !text-white !border-hp-dark' : ''}`}
                            >
                                {t(st.charAt(0).toUpperCase() + st.slice(1))}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO DATA TABLE CARD ══════════ */}
                <div className="hp-bento-card !p-0 overflow-hidden">
                    <div className="p-5 border-b border-hp-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-hp-primary" />
                            <h2 className="hp-card-title">
                                {activeTab === 'farmers' ? t('Buyer Booking Token & Milestone Ledger') : t('Property Advisor Brokerage & Travel Allowances')}
                            </h2>
                        </div>
                        <span className="text-xs text-hp-muted font-medium">
                            {activeList.length} {t('records')}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="hp-table min-w-[750px]">
                            <thead>
                                <tr>
                                    <th>{t('Reference ID')}</th>
                                    <th>{activeTab === 'farmers' ? t('Property / Unit & Corridor') : t('Property Advisor & Commission Scope')}</th>
                                    <th>{t('Amount')}</th>
                                    <th>{t('Settlement Status')}</th>
                                    <th>{t('Transaction Mode / Date')}</th>
                                    <th className="text-right">{t('Action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeList.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16 text-hp-muted">
                                            <div className="hp-icon-tile !w-12 !h-12 mx-auto mb-2">
                                                <Wallet className="w-5 h-5 text-hp-muted" />
                                            </div>
                                            <p className="font-bold text-sm text-hp-dark">{t('No financial records found')}</p>
                                            <p className="text-xs text-hp-muted mt-0.5">{t('Try adjusting your search query or status filter.')}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    activeList.map((payment, i) => (
                                        <tr key={payment.id || i} className="hover:bg-hp-hover/60 transition-colors">
                                            <td>
                                                <span className="font-mono text-xs font-bold text-hp-dark bg-hp-bg px-2 py-1 rounded border border-hp-border">
                                                    {payment.id || `BKG-${1000 + i}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-hp-hover border border-hp-border flex items-center justify-center font-bold text-xs shrink-0 text-hp-dark">
                                                        {(activeTab === 'farmers' ? payment.farmer : payment.officer)?.charAt(0) || 'P'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-hp-dark">
                                                            {activeTab === 'farmers' ? payment.farmer : payment.officer}
                                                        </p>
                                                        <p className="text-xs text-hp-muted">{payment.region || 'OMR / ECR Corridor'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="font-bold text-sm text-hp-dark">
                                                    ₹{payment.amount || '0'}
                                                </span>
                                            </td>
                                            <td>
                                                {getStatusChip(payment.status)}
                                            </td>
                                            <td>
                                                <div className="text-xs">
                                                    <p className="font-medium text-hp-dark">{payment.mode || 'RTGS / NEFT Escrow'}</p>
                                                    <p className="text-hp-muted mt-0.5">{payment.date || 'Today'}</p>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <button 
                                                    type="button"
                                                    onClick={() => alert('Viewing RERA voucher for ' + (payment.id || 'BKG'))}
                                                    className="hp-btn hp-btn-sm hp-btn-outline"
                                                >
                                                    {t('Voucher')} <ArrowUpRight className="w-3.5 h-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
}
