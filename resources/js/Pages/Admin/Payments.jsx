import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Head } from '@inertiajs/react';
import { 
    Wallet, TrendingUp, IndianRupee, CreditCard, 
    Search, Filter, ChevronDown, CheckCircle2, XCircle, 
    Clock, Download, Users, Briefcase, FileText, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../Components/AlertSystem';

export default function Payments({ farmer_payments = [], officer_payments = [], kpis = {} }) {
    const { t } = useTranslation();
    const { triggerInfo, triggerSuccess } = useAlert ? useAlert() : {};
    const [activeTab, setActiveTab] = useState('farmers');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const getStatusStyle = (status) => {
        if (status === 'completed') return 'bg-slate-100 text-green-700 border-green-200';
        if (status === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
        return 'bg-red-100 text-red-700 border-red-200';
    };

    const getStatusIcon = (status) => {
        if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-slate-700 mr-1" />;
        if (status === 'pending') return <Clock className="w-4 h-4 text-yellow-500 mr-1" />;
        return <XCircle className="w-4 h-4 text-red-500 mr-1" />;
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
            
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-slate-800">{t('Payments & Financials')}</h1>
                    <p className="text-slate-500 mt-2 font-medium">Manage and track disbursements for farmers and field officers.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleExport} className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors">
                        <Download className="w-4 h-4 mr-2" />
                        Export Ledger
                    </button>
                    <button onClick={handleInitiatePayment} className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg shadow-slate-900/10 transition-all">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Initiate Payment
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 rounded-[2xl] p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="font-bold text-green-100">Total Disbursed (MTD)</h3>
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-4xl font-extrabold tracking-tight">₹{kpis.total_disbursed}</p>
                        <p className="text-green-200 text-sm mt-2 font-medium flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" /> All completed transactions
                        </p>
                    </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-[2xl] p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors duration-700"></div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-500">Pending Clearances</h3>
                        <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-100 group-hover:scale-110 transition-transform">
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{kpis.pending_count}</p>
                    <p className="text-gray-400 text-sm mt-2 font-medium">transactions pending</p>
                </div>

                <div className="bg-white border border-gray-100 rounded-[2xl] p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-32 h-32 bg-slate-800/5 rounded-full blur-2xl group-hover:bg-slate-800/10 transition-colors duration-700"></div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-500">Total Transactions</h3>
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 group-hover:scale-110 transition-transform">
                            <IndianRupee className="w-5 h-5 text-slate-800" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{kpis.total_transactions}</p>
                    <p className="text-gray-400 text-sm mt-2 font-medium">Platform wide</p>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                
                {/* Tab Header */}
                <div className="flex border-b border-gray-100 px-6">
                    <button 
                        onClick={() => setActiveTab('farmers')}
                        className={`flex items-center py-5 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'farmers' ? 'border-green-600 text-slate-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Users className="w-4 h-4 mr-2" /> Farmer Payouts
                    </button>
                    <button 
                        onClick={() => setActiveTab('officers')}
                        className={`flex items-center py-5 px-4 font-bold text-sm border-b-2 transition-colors ${activeTab === 'officers' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Briefcase className="w-4 h-4 mr-2" /> Officer Payroll & Expenses
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by Transaction ID or Name..." 
                            className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-medium"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative">
                            <button
                                onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                className={`flex-1 md:flex-none flex items-center justify-center px-4 py-2.5 border rounded-xl text-sm font-bold transition-colors ${
                                    statusFilter !== 'all' ? 'bg-slate-50 border-green-300 text-green-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                {statusFilter === 'all' ? 'Status' : statusFilter}
                            </button>
                            {showStatusDropdown && (
                                <div className="absolute top-full mt-1 right-0 min-w-[140px] bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
                                    {['all', 'Completed', 'Pending', 'Failed'].map(s => (
                                        <button key={s} onClick={() => { setStatusFilter(s.toLowerCase()); setShowStatusDropdown(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-gray-50 transition-colors ${
                                                statusFilter === s.toLowerCase() ? 'text-slate-800' : 'text-gray-700'
                                            }`}>
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
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Beneficiary</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Amount (₹)</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {activeTab === 'farmers' && filteredFarmerPayments.length === 0 && (
                                <tr><td colSpan={7} className="py-12 text-center text-gray-400 font-medium text-sm">No matching transactions found.</td></tr>
                            )}
                            {activeTab === 'farmers' && filteredFarmerPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <span className="font-mono text-sm font-bold text-slate-800 bg-slate-50 px-2 py-1 rounded-md">{payment.id}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-sm text-gray-900">{payment.farmer}</p>
                                        <p className="text-xs text-gray-500">{payment.region}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{payment.type}</span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">{payment.date}</td>
                                    <td className="py-4 px-6 text-right">
                                        <span className="font-bold text-gray-900">₹{payment.amount}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusStyle(payment.status)}`}>
                                            {getStatusIcon(payment.status)}
                                            {payment.status}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-gray-400 hover:text-slate-800 transition-colors p-2 hover:bg-slate-50 rounded-lg">
                                            <FileText className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {activeTab === 'officers' && filteredOfficerPayments.length === 0 && (
                                <tr><td colSpan={7} className="py-12 text-center text-gray-400 font-medium text-sm">No matching transactions found.</td></tr>
                            )}
                            {activeTab === 'officers' && filteredOfficerPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <span className="font-mono text-sm font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">{payment.id}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="font-bold text-sm text-gray-900">{payment.officer}</p>
                                        <p className="text-xs text-gray-500">{payment.role}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{payment.type}</span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">{payment.date}</td>
                                    <td className="py-4 px-6 text-right">
                                        <span className="font-bold text-gray-900">₹{payment.amount}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusStyle(payment.status)}`}>
                                            {getStatusIcon(payment.status)}
                                            {payment.status}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button className="text-gray-400 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-lg">
                                            <FileText className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Mock) */}
                <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Showing 1-10 of 45 entries</p>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed">Prev</button>
                        <button className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50">Next</button>
                    </div>
                </div>

            </div>

        </AdminLayout>
    );
}
