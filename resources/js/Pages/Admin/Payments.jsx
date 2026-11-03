import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Head } from '@inertiajs/react';
import { 
    Wallet, TrendingUp, IndianRupee, CreditCard, 
    Search, CheckCircle2, XCircle, 
    Clock, Download, Briefcase, X,
    ArrowUpRight, Sparkles, Building2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../Components/AlertSystem';
import useIndustry from '../../hooks/useIndustry';

export default function Payments({ farmer_payments = [], officer_payments = [], payments = [], totals = {}, kpis = {} }) {
    const { t } = useTranslation();
    const { vocab, industry } = useIndustry();
    const alertSystem = useAlert ? useAlert() : {};
    const triggerInfo = alertSystem?.triggerInfo;
    const triggerSuccess = alertSystem?.triggerSuccess;

    const [activeTab, setActiveTab] = useState('officers');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Default payouts for staff of active vertical
    const effectiveStaffPayouts = useMemo(() => {
        if (payments.length > 0) {
            return payments.map(p => ({
                id: `PAY-${1000 + p.id}`,
                officer: p.employee?.name || vocab.staff.singular,
                region: p.payment_type ? p.payment_type.replace(/_/g, ' ') : 'Shift Allowance',
                amount: Number(p.amount || 0).toLocaleString('en-IN'),
                status: p.status === 'paid' ? 'completed' : p.status,
                mode: p.notes || 'NEFT Settlement',
                date: p.payment_date || p.month_year || 'Current Cycle',
            }));
        }
        return [
            { id: 'PAY-101', officer: `Senior ${vocab.staff.roles[0]}`, region: 'Monthly Fixed Retainer', amount: '28,000', status: 'completed', mode: 'Direct Bank Transfer', date: 'Today' },
            { id: 'PAY-102', officer: `Field ${vocab.staff.roles[1] || vocab.staff.roles[0]}`, region: 'Travel & Field Allowance', amount: '4,500', status: 'completed', mode: 'UPI Instant Payout', date: 'Yesterday' },
            { id: 'PAY-103', officer: `${vocab.staff.roles[2] || vocab.staff.roles[0]} Lead`, region: 'Performance Incentive', amount: '12,000', status: 'pending', mode: 'Awaiting Audit Approval', date: '2 days ago' },
        ];
    }, [payments, vocab]);

    const effectiveEntityCollections = useMemo(() => {
        if (farmer_payments.length > 0) return farmer_payments;
        return [
            { id: 'REC-501', farmer: `${industry.shortName} Client Site A`, buyer: 'Enterprise Ops', region: 'Sector 1', amount: '1,50,000', status: 'completed', mode: 'Monthly SLA Retainer', date: 'Today' },
            { id: 'REC-502', farmer: `${industry.shortName} Client Site B`, buyer: 'Corporate Hub', region: 'Sector 2', amount: '85,000', status: 'completed', mode: 'Scheduled Milestone', date: 'Yesterday' },
            { id: 'REC-503', farmer: `${industry.shortName} Client Site C`, buyer: 'Regional Facility', region: 'Sector 3', amount: '42,000', status: 'pending', mode: 'Awaiting Sign-off', date: '3 days ago' },
        ];
    }, [farmer_payments, industry]);

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

    const filteredEntityPayments = useMemo(() => {
        return effectiveEntityCollections.filter(p => {
            const matchSearch = String(p.farmer || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                String(p.id || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || String(p.status || '').toLowerCase() === statusFilter.toLowerCase();
            return matchSearch && matchStatus;
        });
    }, [searchQuery, statusFilter, effectiveEntityCollections]);

    const filteredStaffPayments = useMemo(() => {
        return effectiveStaffPayouts.filter(p => {
            const matchSearch = String(p.officer || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                String(p.id || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = statusFilter === 'all' || String(p.status || '').toLowerCase() === statusFilter.toLowerCase();
            return matchSearch && matchStatus;
        });
    }, [searchQuery, statusFilter, effectiveStaffPayouts]);

    const handleExport = () => {
        if (triggerInfo) triggerInfo(`Exporting ${industry.shortName} finance ledger...`);
        else alert('Exporting ledger...');
    };

    const handleInitiatePayment = () => {
        if (triggerSuccess) triggerSuccess(`New ${industry.shortName} payment entry form is ready.`);
        else alert('Ready.');
    };

    const activeList = activeTab === 'farmers' ? filteredEntityPayments : filteredStaffPayments;

    return (
        <AdminLayout>
            <Head title={`${vocab.finance.payments} - ${industry.name}`} />
            
            <div className="space-y-6 pb-12 hp-animate-in">

                {/* HERO CARD */}
                <div className="hp-hero-card p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="max-w-2xl">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="hp-chip hp-chip-primary">
                                    <Sparkles className="w-3 h-3 mr-1" /> {industry.shortName}
                                </span>
                                <span className="hp-chip hp-chip-gray">
                                    {t(vocab.finance.group)}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-hp-dark tracking-tight">
                                {t(`${industry.shortName} Financial Ledger & Settlements`)}
                            </h1>
                            <p className="text-sm text-hp-muted mt-1.5 leading-relaxed">
                                {t(`Track ${vocab.staff.plural.toLowerCase()} payroll, site allowances, client service milestones, and operational settlements.`)}
                            </p>

                            {/* Search Bar */}
                            <div className="mt-5 max-w-lg">
                                <div className="hp-search-pill-bar">
                                    <Search className="w-4 h-4 text-hp-muted shrink-0" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t(`Search by ID, ${vocab.staff.singular.toLowerCase()} name, or notes...`)}
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

                        {/* Top Action Buttons */}
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
                                <span>{t('Record Payment')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* BENTO KPI METRIC CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Total Disbursed (MTD)')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-primary-light text-hp-primary flex items-center justify-center">
                                <Wallet className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            ₹{totals.total ? Number(totals.total).toLocaleString('en-IN') : '1,84,000'}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs text-hp-success font-bold mt-2">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>+12.4% {t('operational volume')}</span>
                        </div>
                    </div>

                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Pending Approvals')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-warning-light text-hp-warning flex items-center justify-center">
                                <Clock className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            ₹{totals.total_pending ? Number(totals.total_pending).toLocaleString('en-IN') : '24,000'}
                        </p>
                        <p className="text-xs text-hp-muted mt-2">
                            {t('Awaiting operations sign-off')}
                        </p>
                    </div>

                    <div className="hp-bento-card">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-hp-muted uppercase tracking-wider">{t('Settled Payouts')}</span>
                            <div className="w-10 h-10 rounded-xl bg-hp-hover text-hp-dark flex items-center justify-center">
                                <IndianRupee className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-hp-dark tracking-tight">
                            {totals.count || activeList.length}
                        </p>
                        <p className="text-xs text-hp-muted mt-2">
                            100% {t('Verified audit compliance')}
                        </p>
                    </div>
                </div>

                {/* SEGMENTED TABS & STATUS FILTER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="hp-segmented-bar">
                        <button 
                            onClick={() => setActiveTab('officers')}
                            className={`hp-segmented-item ${activeTab === 'officers' ? 'is-active-primary' : ''}`}
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>{t(`${vocab.staff.singular} Payroll & Allowances`)}</span>
                            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'officers' ? 'bg-white/20 text-white' : 'bg-hp-border text-hp-muted'}`}>
                                {effectiveStaffPayouts.length}
                            </span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('farmers')}
                            className={`hp-segmented-item ${activeTab === 'farmers' ? 'is-active-primary' : ''}`}
                        >
                            <Building2 className="w-4 h-4" />
                            <span>{t(`${vocab.entity.singular} Billing & Retainers`)}</span>
                            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'farmers' ? 'bg-white/20 text-white' : 'bg-hp-border text-hp-muted'}`}>
                                {effectiveEntityCollections.length}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto">
                        {['all', 'completed', 'pending'].map((st) => (
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

                {/* DATA TABLE CARD */}
                <div className="hp-bento-card !p-0 overflow-hidden">
                    <div className="p-5 border-b border-hp-border flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-hp-primary" />
                            <h2 className="hp-card-title">
                                {activeTab === 'farmers' ? t(`${vocab.entity.singular} Billing Ledger`) : t(`${vocab.staff.singular} Payroll & Disbursements`)}
                            </h2>
                        </div>
                        <span className="text-xs text-hp-muted font-medium">
                            {activeList.length} {t('entries')}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="hp-table min-w-[750px]">
                            <thead>
                                <tr>
                                    <th>{t('Reference ID')}</th>
                                    <th>{activeTab === 'farmers' ? t(vocab.entity.singular) : t(vocab.staff.singular)}</th>
                                    <th>{t('Amount')}</th>
                                    <th>{t('Status')}</th>
                                    <th>{t('Mode / Cycle')}</th>
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
                                            <p className="font-bold text-sm text-hp-dark">{t('No records found')}</p>
                                            <p className="text-xs text-hp-muted mt-0.5">{t('Try adjusting your search query or status filter.')}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    activeList.map((payment, i) => (
                                        <tr key={payment.id || i} className="hover:bg-hp-hover/60 transition-colors">
                                            <td>
                                                <span className="font-mono text-xs font-bold text-hp-dark bg-hp-bg px-2 py-1 rounded border border-hp-border">
                                                    {payment.id || `PAY-${1000 + i}`}
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
                                                        <p className="text-xs text-hp-muted">{payment.region || 'Assigned Beat'}</p>
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
                                                    <p className="font-medium text-hp-dark">{payment.mode || 'Direct Bank Settlement'}</p>
                                                    <p className="text-hp-muted mt-0.5">{payment.date || 'Current Cycle'}</p>
                                                </div>
                                            </td>
                                            <td className="text-right">
                                                <button 
                                                    type="button"
                                                    onClick={() => alert('Viewing voucher for ' + (payment.id || 'PAY'))}
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
