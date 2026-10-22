import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    Wallet, TrendingUp, IndianRupee, CreditCard, 
    Search, Filter, CheckCircle2, XCircle, 
    Clock, Download, Users, Briefcase, FileText, X,
    ChevronRight, Home
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
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const getStatusChip = (status) => {
        const s = String(status || '').toLowerCase();
        if (s === 'completed') {
            return (
                <span className="hp-chip hp-chip-success inline-flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Completed</span>
                </span>
            );
        }
        if (s === 'pending') {
            return (
                <span className="hp-chip hp-chip-warning inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending</span>
                </span>
            );
        }
        return (
            <span className="hp-chip hp-chip-danger inline-flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Failed</span>
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

    return (
        <AdminLayout>
            <Head title="Payments & Financials - Fieldy Admin" />
            
            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/admin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Home</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">Payments & Financials</span>
                </div>

                {/* Hostinger hPanel Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-hp-border)]">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {t('Payments & Financials')}
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                            Manage and track disbursements for facility partners, farmers, and field officers.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExport} 
                            className="hp-btn hp-btn-secondary inline-flex items-center gap-2"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export Ledger</span>
                        </button>
                        <button 
                            onClick={handleInitiatePayment} 
                            className="hp-btn hp-btn-primary inline-flex items-center gap-2"
                        >
                            <CreditCard className="w-4 h-4" />
                            <span>Initiate Payment</span>
                        </button>
                    </div>
                </div>

                {/* Summary KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1: Total Disbursed (MTD) */}
                    <div className="hp-card p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-[var(--color-hp-gray-600)]">Total Disbursed (MTD)</span>
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-hp-primary-light)] text-[var(--color-hp-primary)] flex items-center justify-center">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            ₹{kpis.total_disbursed || '0'}
                        </p>
                        <p className="text-xs text-emerald-700 mt-2 font-medium flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> All completed transactions
                        </p>
                    </div>

                    {/* Card 2: Pending Clearances */}
                    <div className="hp-card p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-[var(--color-hp-gray-600)]">Pending Clearances</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {kpis.pending_count || 0}
                        </p>
                        <p className="text-xs text-[var(--color-hp-gray-500)] mt-2 font-medium">
                            Transactions awaiting approval
                        </p>
                    </div>

                    {/* Card 3: Total Transactions */}
                    <div className="hp-card p-5 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-[var(--color-hp-gray-600)]">Total Transactions</span>
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-hp-gray-100)] text-[var(--color-hp-dark)] flex items-center justify-center">
                                <IndianRupee className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {kpis.total_transactions || 0}
                        </p>
                        <p className="text-xs text-[var(--color-hp-gray-500)] mt-2 font-medium">
                            Platform-wide volume
                        </p>
                    </div>
                </div>

                {/* Main Card with Tabs & Data Table */}
                <div className="hp-card overflow-hidden flex flex-col">
                    {/* Tab Navigation Strip */}
                    <div className="flex border-b border-[var(--color-hp-border)] px-6 bg-white">
                        <button 
                            onClick={() => setActiveTab('farmers')}
                            className={`flex items-center gap-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
                                activeTab === 'farmers' 
                                    ? 'border-[var(--color-hp-primary)] text-[var(--color-hp-primary)]' 
                                    : 'border-transparent text-[var(--color-hp-gray-600)] hover:text-[var(--color-hp-dark)]'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>Farmer & Facility Payouts</span>
                        </button>
                        <button 
                            onClick={() => setActiveTab('officers')}
                            className={`flex items-center gap-2 py-3.5 px-4 font-semibold text-xs border-b-2 transition-all ${
                                activeTab === 'officers' 
                                    ? 'border-[var(--color-hp-primary)] text-[var(--color-hp-primary)]' 
                                    : 'border-transparent text-[var(--color-hp-gray-600)] hover:text-[var(--color-hp-dark)]'
                            }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            <span>Officer Payroll & Expenses</span>
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="p-4 border-b border-[var(--color-hp-border)] bg-[var(--color-hp-gray-50)] flex flex-col md:flex-row gap-3 justify-between items-center">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-hp-gray-500)]" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search by ID, name or region..." 
                                className="hp-input pl-9 pr-8"
                            />
                            {searchQuery && (
                                <button 
                                    onClick={() => setSearchQuery('')} 
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative">
                                <button
                                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                    className={`hp-btn hp-btn-secondary inline-flex items-center gap-2 ${
                                        statusFilter !== 'all' ? 'border-[var(--color-hp-primary)] text-[var(--color-hp-primary)]' : ''
                                    }`}
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
                                </button>
                                {showStatusDropdown && (
                                    <div className="absolute top-full mt-1 right-0 min-w-[150px] bg-white border border-[var(--color-hp-border)] rounded-lg shadow-lg z-30 overflow-hidden">
                                        {['all', 'Completed', 'Pending', 'Failed'].map(s => (
                                            <button 
                                                key={s} 
                                                onClick={() => { setStatusFilter(s.toLowerCase()); setShowStatusDropdown(false); }}
                                                className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[var(--color-hp-gray-100)] transition-colors ${
                                                    statusFilter === s.toLowerCase() ? 'text-[var(--color-hp-primary)] bg-[var(--color-hp-primary-light)]' : 'text-[var(--color-hp-dark)]'
                                                }`}
                                            >
                                                {s === 'all' ? 'All Status' : s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="overflow-x-auto flex-1">
                        <table className="hp-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>Beneficiary</th>
                                    <th>Type</th>
                                    <th>Date</th>
                                    <th className="text-right">Amount (₹)</th>
                                    <th>Status</th>
                                    <th className="text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activeTab === 'farmers' && filteredFarmerPayments.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-[var(--color-hp-gray-500)] font-medium text-xs">
                                            No matching transactions found.
                                        </td>
                                    </tr>
                                )}
                                {activeTab === 'farmers' && filteredFarmerPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <span className="font-mono text-xs font-bold text-[var(--color-hp-gray-700)] bg-[var(--color-hp-gray-100)] px-2 py-0.5 rounded">
                                                {payment.id}
                                            </span>
                                        </td>
                                        <td>
                                            <p className="font-semibold text-xs text-[var(--color-hp-dark)]">{payment.farmer}</p>
                                            <p className="text-[11px] text-[var(--color-hp-gray-500)]">{payment.region}</p>
                                        </td>
                                        <td>
                                            <span className="text-xs text-[var(--color-hp-gray-700)] bg-[var(--color-hp-gray-100)] px-2 py-0.5 rounded">
                                                {payment.type}
                                            </span>
                                        </td>
                                        <td className="text-xs text-[var(--color-hp-gray-600)]">{payment.date}</td>
                                        <td className="text-right">
                                            <span className="font-bold text-xs text-[var(--color-hp-dark)]">₹{payment.amount}</span>
                                        </td>
                                        <td>
                                            {getStatusChip(payment.status)}
                                        </td>
                                        <td className="text-right">
                                            <button 
                                                title="View Receipt"
                                                className="text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] transition-colors p-1.5 hover:bg-[var(--color-hp-gray-100)] rounded-md"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {activeTab === 'officers' && filteredOfficerPayments.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-[var(--color-hp-gray-500)] font-medium text-xs">
                                            No matching transactions found.
                                        </td>
                                    </tr>
                                )}
                                {activeTab === 'officers' && filteredOfficerPayments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <span className="font-mono text-xs font-bold text-[var(--color-hp-primary)] bg-[var(--color-hp-primary-light)] px-2 py-0.5 rounded">
                                                {payment.id}
                                            </span>
                                        </td>
                                        <td>
                                            <p className="font-semibold text-xs text-[var(--color-hp-dark)]">{payment.officer}</p>
                                            <p className="text-[11px] text-[var(--color-hp-gray-500)]">{payment.role}</p>
                                        </td>
                                        <td>
                                            <span className="text-xs text-[var(--color-hp-gray-700)] bg-[var(--color-hp-gray-100)] px-2 py-0.5 rounded">
                                                {payment.type}
                                            </span>
                                        </td>
                                        <td className="text-xs text-[var(--color-hp-gray-600)]">{payment.date}</td>
                                        <td className="text-right">
                                            <span className="font-bold text-xs text-[var(--color-hp-dark)]">₹{payment.amount}</span>
                                        </td>
                                        <td>
                                            {getStatusChip(payment.status)}
                                        </td>
                                        <td className="text-right">
                                            <button 
                                                title="View Voucher"
                                                className="text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-primary)] transition-colors p-1.5 hover:bg-[var(--color-hp-primary-light)] rounded-md"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-3.5 border-t border-[var(--color-hp-border)] flex items-center justify-between bg-white text-xs text-[var(--color-hp-gray-600)]">
                        <span>
                            Showing <strong className="font-semibold text-[var(--color-hp-dark)]">
                                {activeTab === 'farmers' ? filteredFarmerPayments.length : filteredOfficerPayments.length}
                            </strong> entries
                        </span>
                        <div className="flex gap-2">
                            <button className="hp-btn hp-btn-secondary hp-btn-sm opacity-50 cursor-not-allowed">Prev</button>
                            <button className="hp-btn hp-btn-secondary hp-btn-sm">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
