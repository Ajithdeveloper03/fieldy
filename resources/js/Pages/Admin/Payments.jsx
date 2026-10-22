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

export default function Payments({ farmer_payments = [], officer_payments = [], kpis = {} }) {
    const { t } = useTranslation();
    const alertSystem = useAlert ? useAlert() : {};
    const triggerInfo = alertSystem?.triggerInfo;
    const triggerSuccess = alertSystem?.triggerSuccess;

    const [activeTab, setActiveTab] = useState('farmers');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const getStatusChip = (status) => {
        const s = String(status || '').toLowerCase();
        if (s === 'completed') {
            return (
                <span className="hp-chip hp-chip-success inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-hp-success" />
                    <span>{t('Completed')}</span>
                </span>
            );
        }
        if (s === 'pending') {
            return (
                <span className="hp-chip hp-chip-warning inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-hp-warning" />
                    <span>{t('Pending')}</span>
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
        return farmer_payments.filter(p => {
            const matchSearch = String(p.farmer || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                String(p.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                String(p.region || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || String(p.status || '').toLowerCase() === statusFilter.toLowerCase();
            return matchSearch && matchStatus;
        });
    }, [searchQuery, statusFilter, farmer_payments]);

    const filteredOfficerPayments = useMemo(() => {
        return officer_payments.filter(p => {
            const matchSearch = String(p.officer || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                String(p.id || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || String(p.status || '').toLowerCase() === statusFilter.toLowerCase();
            return matchSearch && matchStatus;
        });
    }, [searchQuery, statusFilter, officer_payments]);

    const handleExport = () => {
        if (triggerInfo) triggerInfo('Exporting ledger... Your download will begin shortly.');
        else alert('Exporting ledger...');
    };

    const handleInitiatePayment = () => {
        if (triggerSuccess) triggerSuccess('Payment initiation form is ready.');
        else alert('Payment initiation form is ready.');
    };

    const activeList = activeTab === 'farmers' ? filteredFarmerPayments : filteredOfficerPayments;

    return (
        <AdminLayout>
            <Head title="Payments & Financials - Fieldy Admin" />
            
            <div className="space-y-6 pb-12 hp-animate-in">

                {/* ══════════ HOSTINGER HERO CARD ══════════ */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {t('Financial Ledger')}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {t('Automated Settlement Engine')}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t('Disbursements & Financial Settlement')}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t('Track automated payouts, contractor fees, equipment disbursements, and technician travel allowances across all active contracts.')}
                            </p>

                            {/* Hostinger Pill Search Bar */}
                            <div className="mt-5 max-w-lg">
                                <div className="hp-search-pill-bar">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('Search by payment ID, facility, officer, or UTR...')}
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
                                <span>{t('Export Ledger')}</span>
                            </button>
                            <button 
                                onClick={handleInitiatePayment} 
                                className="hp-btn hp-btn-primary !rounded-full"
                            >
                                <CreditCard className="w-4 h-4 mr-1" />
                                <span>{t('Initiate Disbursement')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ══════════ HOSTINGER BENTO KPI METRIC CARDS ══════════ */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Card 1: Total Disbursed */}
                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total Disbursed (MTD)')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-primary-light text-hp-primary flex items-center justify-center">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            ₹{kpis.total_disbursed || '1,84,500'}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-hp-success font-bold mt-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+12.4% {t('vs last cycle')}</span>
                        </div>
                    </div>

                    {/* Card 2: Pending Clearances */}
                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Pending Clearances')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-warning-light text-hp-warning flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            {kpis.pending_count || 14}
                        </p>
                        <p className="text-xs text-hp-muted mt-2">
                            {t('Queued for automated bank release')}
                        </p>
                    </div>

                    {/* Card 3: Platform Volume */}
                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total Transactions')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-hover text-hp-dark flex items-center justify-center">
                                <IndianRupee className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            {kpis.total_transactions || 128}
                        </p>
                        <p className="text-xs text-hp-muted mt-2">
                            99.8% {t('Settlement success rate')}
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
                            <span>{t('Facility & Contractor Payouts')}</span>
                            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'farmers' ? 'bg-white/20 text-white' : 'bg-hp-border text-hp-muted'}`}>
                                {farmer_payments.length}
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('officers')}
                            className={`hp-segmented-item ${activeTab === 'officers' ? 'is-active-primary' : ''}`}
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>{t('Officer Payroll & Travel')}</span>
                            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'officers' ? 'bg-white/20 text-white' : 'bg-hp-border text-hp-muted'}`}>
                                {officer_payments.length}
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
                                {activeTab === 'farmers' ? t('Facility Settlement Ledger') : t('Field Officer Compensation')}
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
                                    <th>{t('Disbursement ID')}</th>
                                    <th>{activeTab === 'farmers' ? t('Facility / Client') : t('Technician')}</th>
                                    <th>{t('Amount')}</th>
                                    <th>{t('Status')}</th>
                                    <th>{t('Payment Mode / Date')}</th>
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
                                            <p className="font-bold text-sm text-hp-dark">{t('No payment records found')}</p>
                                            <p className="text-xs text-hp-muted mt-0.5">{t('Try adjusting your search query or status filter.')}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    activeList.map((payment, i) => (
                                        <tr key={payment.id || i} className="hover:bg-hp-hover/60 transition-colors">
                                            <td>
                                                <span className="font-mono text-xs font-bold text-hp-dark bg-hp-bg px-2 py-1 rounded border border-hp-border">
                                                    {payment.id || `TXN-${1000 + i}`}
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
                                                        <p className="text-xs text-hp-muted">{payment.region || 'HQ Region'}</p>
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
                                                    <p className="font-medium text-hp-dark">{payment.mode || 'IMPS / Direct Settlement'}</p>
                                                    <p className="text-hp-muted mt-0.5">{payment.date || 'Today'}</p>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <button 
                                                    type="button"
                                                    onClick={() => alert('Viewing receipt for ' + (payment.id || 'TXN'))}
                                                    className="hp-btn hp-btn-sm hp-btn-outline"
                                                >
                                                    {t('Receipt')} <ArrowUpRight className="w-3.5 h-3.5" />
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
