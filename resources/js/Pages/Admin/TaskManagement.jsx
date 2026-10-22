import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    ClipboardList, Calendar, Activity, 
    Search, ChevronDown, CheckCircle2, X,
    Clock, Plus, User, Trash2,
    LayoutGrid, ListFilter, ArrowRight, RotateCcw,
    Pencil, Eye, Check, AlertTriangle, Sparkles, Building2, ShieldCheck, KeyRound, Award,
    ChevronRight, Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../Components/AlertSystem';

export default function TaskManagement({ tasks = [], employees = [], customers = [] }) {
    const { t } = useTranslation();
    const { triggerInfo, triggerCritical } = useAlert();

    // View mode: 'list' (default) or 'board'
    const [viewMode, setViewMode] = useState('list');

    // Industry selector filter: 'all' or specific
    const [industryFilter, setIndustryFilter] = useState('all');

    // Modals state
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [generatingAi, setGeneratingAi] = useState(false);

    // Form state for Create Task
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        industry: 'facility_management',
        assigned_to: '',
        customer_id: '',
        priority: 'medium',
        due_date: '',
        ai_suggestions: '',
    });

    // Form state for Edit Task
    const [editTask, setEditTask] = useState({
        id: null,
        title: '',
        description: '',
        industry: 'facility_management',
        assigned_to: '',
        customer_id: '',
        priority: 'medium',
        status: 'pending',
        due_date: ''
    });

    // Filter and search states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);

    // KPI Metrics calculation
    const metrics = useMemo(() => {
        const total = tasks.length;
        const pending = tasks.filter(t => t.status === 'pending').length;
        const inProgress = tasks.filter(t => t.status === 'in_progress').length;
        const done = tasks.filter(t => t.status === 'done').length;
        const cancelled = tasks.filter(t => t.status === 'cancelled').length;
        const overdue = tasks.filter(t => Boolean(t.overdue)).length;

        return { total, pending, inProgress, done, cancelled, overdue };
    }, [tasks]);

    // Filtered tasks
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const assigneeName = String(task.assigned_to?.name || '');
            const title = String(task.title || '');
            const desc = String(task.description || '');
            const search = searchQuery.trim().toLowerCase();

            const matchSearch = !search ||
                title.toLowerCase().includes(search) ||
                desc.toLowerCase().includes(search) ||
                assigneeName.toLowerCase().includes(search);

            const matchIndustry = industryFilter === 'all' || task.industry === industryFilter;
            const matchStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchAssignee = assigneeFilter === 'all' ||
                (assigneeFilter === 'unassigned' ? !task.assigned_to : String(task.assigned_to?.id) === String(assigneeFilter));
            const matchOverdue = !showOverdueOnly || Boolean(task.overdue);

            return matchSearch && matchIndustry && matchStatus && matchPriority && matchAssignee && matchOverdue;
        });
    }, [tasks, searchQuery, industryFilter, statusFilter, priorityFilter, assigneeFilter, showOverdueOnly]);

    const hasActiveFilters = searchQuery !== '' || industryFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || showOverdueOnly;

    const resetFilters = () => {
        setSearchQuery('');
        setIndustryFilter('all');
        setStatusFilter('all');
        setPriorityFilter('all');
        setAssigneeFilter('all');
        setShowOverdueOnly(false);
    };

    const handleGenerateAiSuggestions = (title, industry) => {
        setGeneratingAi(true);
        setTimeout(() => {
            const suggestions = {
                facility_management: "Recommended: Verify AHU filter resistance, check chilled water valve actuator calibration, and test emergency cutoff switch. Estimated resolution time: 45-60 mins. Required PPE: Insulated gloves, safety goggles.",
                construction: "Recommended: Inspect scaffolding structural anchors, review daily toolbox talk records, verify concrete cure strength test report. Required PPE: Hard hat, safety harness, steel-toe boots.",
                security: "Recommended: Scan NFC/QR checkpoints at perimeter gates, inspect gate barrier sensors, verify visitor ledger discrepancies. Required PPE: High-visibility vest, baton, communication radio.",
                fmcg: "Recommended: Audit display shelf facing, verify expiry batches, check competitor promotional pricing, calculate restocking quantity. Priority: High visibility aisles.",
                logistics: "Recommended: Check delivery vehicle tire tread, verify customer address geofence, confirm seal integrity, obtain customer OTP on handover.",
                solar: "Recommended: Measure string open-circuit voltage (Voc), check inverter error codes, inspect solar module surface for micro-cracks or hot spots.",
                cleaning: "Recommended: Check restroom sanitation checklist, refill disinfectant dispensers, audit floor buffer chemical dilution ratios.",
                pest_control: "Recommended: Inspect bait station tamper seals, record chemical spray batch number, ensure client staff evacuation during misting."
            };
            const text = suggestions[industry] || "Recommended: Conduct initial diagnostic check, verify customer symptom description, wear standard PPE, and obtain customer OTP verification upon completion.";
            setNewTask(prev => ({ ...prev, ai_suggestions: text }));
            setGeneratingAi(false);
            triggerInfo("AI Suggestions generated successfully.");
        }, 600);
    };

    // Priority configurations
    const priorityConfig = {
        urgent: {
            labelKey: 'Urgent',
            badge: 'bg-rose-50 text-rose-700 border-rose-200',
            dot: 'bg-rose-500'
        },
        high: {
            labelKey: 'High',
            badge: 'bg-amber-50 text-amber-700 border-amber-200',
            dot: 'bg-amber-500'
        },
        medium: {
            labelKey: 'Medium',
            badge: 'bg-sky-50 text-sky-700 border-sky-200',
            dot: 'bg-sky-500'
        },
        low: {
            labelKey: 'Low',
            badge: 'bg-slate-100 text-slate-700 border-slate-200',
            dot: 'bg-slate-400'
        }
    };

    // Status configurations
    const statusConfig = {
        pending: {
            labelKey: 'Pending',
            color: 'text-amber-700',
            badge: 'hp-chip-warning',
            dot: 'bg-amber-500',
            border: 'border-amber-200',
            bgColumn: 'bg-amber-50/20'
        },
        in_progress: {
            labelKey: 'In Progress',
            color: 'text-sky-700',
            badge: 'hp-chip-info',
            dot: 'bg-sky-500',
            border: 'border-sky-200',
            bgColumn: 'bg-sky-50/20'
        },
        done: {
            labelKey: 'Completed',
            color: 'text-emerald-700',
            badge: 'hp-chip-success',
            dot: 'bg-emerald-500',
            border: 'border-emerald-200',
            bgColumn: 'bg-emerald-50/20'
        },
        cancelled: {
            labelKey: 'Cancelled',
            color: 'text-slate-600',
            badge: 'hp-chip-gray',
            dot: 'bg-slate-400',
            border: 'border-slate-200',
            bgColumn: 'bg-slate-50/40'
        }
    };

    // Handlers
    const handleQuickStatusChange = (task, newStatus) => {
        if (processing) return;
        setProcessing(true);
        router.put(`/admin/tasks/${task.id}`, { status: newStatus }, {
            preserveScroll: true,
            onSuccess: () => {
                const statusName = t(statusConfig[newStatus]?.labelKey || newStatus);
                triggerInfo(`${t('Task Title')}: ${statusName}`);
                setProcessing(false);
                if (selectedTask?.id === task.id) {
                    setSelectedTask(prev => ({ ...prev, status: newStatus }));
                }
            },
            onError: () => {
                triggerCritical('Failed to update task status.');
                setProcessing(false);
            }
        });
    };

    const handleDeleteTask = (task) => {
        if (processing) return;
        if (!confirm(`${t('Delete')} "${task.title}"?`)) return;
        setProcessing(true);
        router.delete(`/admin/tasks/${task.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                triggerInfo(`${task.title} ${t('Delete')}.`);
                setProcessing(false);
                if (showDetailModal) setShowDetailModal(false);
            },
            onError: () => {
                triggerCritical('Failed to delete task.');
                setProcessing(false);
            }
        });
    };

    const handleCreateTask = (e) => {
        e.preventDefault();
        if (!newTask.title.trim()) {
            triggerCritical('Please enter a task title.');
            return;
        }

        setProcessing(true);
        const payload = {
            title: newTask.title.trim(),
            description: newTask.description.trim() || null,
            industry: newTask.industry,
            assigned_to: newTask.assigned_to ? Number(newTask.assigned_to) : null,
            customer_id: newTask.customer_id ? Number(newTask.customer_id) : null,
            priority: newTask.priority,
            due_date: newTask.due_date || null,
            ai_suggestions: newTask.ai_suggestions || null
        };

        router.post('/admin/tasks', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setShowNewModal(false);
                setNewTask({
                    title: '',
                    description: '',
                    industry: 'facility_management',
                    assigned_to: '',
                    customer_id: '',
                    priority: 'medium',
                    due_date: '',
                    ai_suggestions: '',
                });
                triggerInfo(t('Successfully completed'));
                setProcessing(false);
            },
            onError: () => {
                triggerCritical('Please check the form inputs.');
                setProcessing(false);
            }
        });
    };

    const openEditModal = (task) => {
        setEditTask({
            id: task.id,
            title: task.title || '',
            description: task.description || '',
            industry: task.industry || 'facility_management',
            assigned_to: task.assigned_to?.id ? String(task.assigned_to.id) : '',
            customer_id: task.customer?.id ? String(task.customer.id) : '',
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            due_date: task.due_date_raw || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateTask = (e) => {
        e.preventDefault();
        if (!editTask.title.trim()) {
            triggerCritical('Please enter a task title.');
            return;
        }

        setProcessing(true);
        const payload = {
            title: editTask.title.trim(),
            description: editTask.description.trim() || null,
            industry: editTask.industry,
            assigned_to: editTask.assigned_to ? Number(editTask.assigned_to) : null,
            customer_id: editTask.customer_id ? Number(editTask.customer_id) : null,
            priority: editTask.priority,
            status: editTask.status,
            due_date: editTask.due_date || null
        };

        router.put(`/admin/tasks/${editTask.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                triggerInfo(t('Successfully completed'));
                setProcessing(false);
                if (selectedTask?.id === editTask.id) {
                    setSelectedTask(prev => ({
                        ...prev,
                        ...payload,
                        assigned_to: employees.find(e => e.id === payload.assigned_to) || null,
                        customer: customers.find(c => c.id === payload.customer_id) || null
                    }));
                }
            },
            onError: () => {
                triggerCritical('Please check the form inputs.');
                setProcessing(false);
            }
        });
    };

    const openDetailModal = (task) => {
        setSelectedTask(task);
        setShowDetailModal(true);
    };

    return (
        <AdminLayout>
            <Head title={`${t('Tasks & Schedule Management')} - Fieldy Admin`} />

            <div className="max-w-7xl mx-auto space-y-6 pb-12">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs text-[var(--color-hp-gray-600)]">
                    <Link href="/admin/dashboard" className="hover:text-[var(--color-hp-primary)] flex items-center gap-1 transition-colors">
                        <Home className="w-3.5 h-3.5" />
                        <span>Home</span>
                    </Link>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--color-hp-gray-400)]" />
                    <span className="font-semibold text-[var(--color-hp-dark)]">Tasks & Schedule</span>
                </div>

                {/* Hostinger hPanel Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[var(--color-hp-border)]">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)] tracking-tight">
                            {t('Tasks & Schedule Management')}
                        </h1>
                        <p className="text-xs sm:text-sm text-[var(--color-hp-gray-600)] mt-1">
                            {t('Assign targets, track field operations, and monitor daily progress across officers.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Switcher: Segmented Control */}
                        <div className="inline-flex p-1 bg-white border border-[var(--color-hp-border)] rounded-lg shadow-xs">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-[var(--color-hp-dark)] text-white shadow-xs'
                                        : 'text-[var(--color-hp-gray-600)] hover:text-[var(--color-hp-dark)]'
                                }`}
                                title={t('List View')}
                            >
                                <ListFilter className="w-3.5 h-3.5" />
                                <span>{t('List View')}</span>
                            </button>
                            <button
                                onClick={() => setViewMode('board')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    viewMode === 'board'
                                        ? 'bg-[var(--color-hp-dark)] text-white shadow-xs'
                                        : 'text-[var(--color-hp-gray-600)] hover:text-[var(--color-hp-dark)]'
                                }`}
                                title={t('Board View')}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>{t('Board View')}</span>
                            </button>
                        </div>

                        {/* Create Task Button: Hostinger Primary Orange */}
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="hp-btn hp-btn-primary inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>{t('New Task')}</span>
                        </button>
                    </div>
                </div>

                {/* Minimalist KPI Overview Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    {/* Total Tasks */}
                    <div 
                        onClick={() => { setStatusFilter('all'); setShowOverdueOnly(false); }}
                        className={`hp-card p-4 transition-all cursor-pointer ${
                            statusFilter === 'all' && !showOverdueOnly ? 'ring-2 ring-[var(--color-hp-primary)] shadow-xs' : 'hover:border-[var(--color-hp-gray-400)]'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-[var(--color-hp-gray-600)]">{t('Total Tasks')}</span>
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-hp-gray-100)] flex items-center justify-center text-[var(--color-hp-dark)]">
                                <ClipboardList className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)]">{metrics.total}</div>
                        <div className="text-[11px] text-[var(--color-hp-gray-500)] mt-1">{t('Across all field staff')}</div>
                    </div>

                    {/* Pending */}
                    <div 
                        onClick={() => { setStatusFilter('pending'); setShowOverdueOnly(false); }}
                        className={`hp-card p-4 transition-all cursor-pointer ${
                            statusFilter === 'pending' && !showOverdueOnly ? 'ring-2 ring-amber-500 shadow-xs' : 'hover:border-[var(--color-hp-gray-400)]'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-amber-700">{t('Pending')}</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)]">{metrics.pending}</div>
                        <div className="text-[11px] text-amber-600 mt-1 font-medium">{t('Awaiting commencement')}</div>
                    </div>

                    {/* In Progress */}
                    <div 
                        onClick={() => { setStatusFilter('in_progress'); setShowOverdueOnly(false); }}
                        className={`hp-card p-4 transition-all cursor-pointer ${
                            statusFilter === 'in_progress' && !showOverdueOnly ? 'ring-2 ring-sky-500 shadow-xs' : 'hover:border-[var(--color-hp-gray-400)]'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-sky-700">{t('In Progress')}</span>
                            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)]">{metrics.inProgress}</div>
                        <div className="text-[11px] text-sky-600 mt-1 font-medium">{t('Ongoing field duties')}</div>
                    </div>

                    {/* Done */}
                    <div 
                        onClick={() => { setStatusFilter('done'); setShowOverdueOnly(false); }}
                        className={`hp-card p-4 transition-all cursor-pointer ${
                            statusFilter === 'done' && !showOverdueOnly ? 'ring-2 ring-emerald-500 shadow-xs' : 'hover:border-[var(--color-hp-gray-400)]'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-emerald-700">{t('Completed')}</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-[var(--color-hp-dark)]">{metrics.done}</div>
                        <div className="text-[11px] text-emerald-600 mt-1 font-medium">{t('Successfully completed')}</div>
                    </div>

                    {/* Overdue */}
                    <div 
                        onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                        className={`col-span-2 lg:col-span-1 hp-card p-4 transition-all cursor-pointer ${
                            showOverdueOnly ? 'ring-2 ring-rose-500 shadow-xs' : 'hover:border-[var(--color-hp-gray-400)]'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-rose-700">{t('Overdue')}</span>
                            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-rose-600">{metrics.overdue}</div>
                        <div className="text-[11px] text-rose-500 mt-1 font-medium">{t('Past scheduled deadline')}</div>
                    </div>
                </div>

                {/* Industry Workspace Selector Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {[
                        { id: 'all', label: 'All Industries', icon: LayoutGrid },
                        { id: 'facility_management', label: 'Facility Management', icon: Building2 },
                        { id: 'construction', label: 'Construction & Civil', icon: ClipboardList },
                        { id: 'security', label: 'Security Services', icon: ShieldCheck },
                        { id: 'fmcg', label: 'FMCG & Retail', icon: Activity },
                        { id: 'logistics', label: 'Logistics & Delivery', icon: ArrowRight },
                        { id: 'solar', label: 'Solar & Renewable', icon: Sparkles },
                    ].map(ind => {
                        const Icon = ind.icon;
                        const isSelected = industryFilter === ind.id;
                        return (
                            <button
                                key={ind.id}
                                onClick={() => setIndustryFilter(ind.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                                    isSelected 
                                    ? 'bg-[var(--color-hp-dark)] text-white border-[var(--color-hp-dark)] shadow-xs' 
                                    : 'bg-white text-[var(--color-hp-gray-600)] border-[var(--color-hp-border)] hover:border-[var(--color-hp-gray-400)] hover:text-[var(--color-hp-dark)]'
                                }`}
                            >
                                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[var(--color-hp-primary)]' : 'text-[var(--color-hp-gray-500)]'}`} />
                                <span>{t(ind.label)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Filter and Search Toolbar */}
                <div className="hp-card p-4 space-y-3">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={t('Search by task title, description, or officer...')}
                                className="hp-input pl-9 pr-9"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Selectors */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Industry Dropdown */}
                            <div className="relative">
                                <select
                                    value={industryFilter}
                                    onChange={e => setIndustryFilter(e.target.value)}
                                    className="appearance-none bg-white border border-[var(--color-hp-border)] rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-[var(--color-hp-dark)] hover:border-[var(--color-hp-gray-400)] focus:outline-none focus:border-[var(--color-hp-primary)] cursor-pointer transition-all"
                                >
                                    <option value="all">{t('All Industries')}</option>
                                    <option value="facility_management">{t('Facility Management')}</option>
                                    <option value="construction">{t('Construction')}</option>
                                    <option value="security">{t('Security Services')}</option>
                                    <option value="fmcg">{t('FMCG & Retail')}</option>
                                    <option value="logistics">{t('Logistics & Delivery')}</option>
                                    <option value="solar">{t('Solar & Energy')}</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)] pointer-events-none" />
                            </div>

                            {/* Officer Filter */}
                            <div className="relative">
                                <select
                                    value={assigneeFilter}
                                    onChange={e => setAssigneeFilter(e.target.value)}
                                    className="appearance-none bg-white border border-[var(--color-hp-border)] rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-[var(--color-hp-dark)] hover:border-[var(--color-hp-gray-400)] focus:outline-none focus:border-[var(--color-hp-primary)] cursor-pointer transition-all"
                                >
                                    <option value="all">{t('All Officers')}</option>
                                    <option value="unassigned">{t('Unassigned')}</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)] pointer-events-none" />
                            </div>

                            {/* Priority Filter */}
                            <div className="relative">
                                <select
                                    value={priorityFilter}
                                    onChange={e => setPriorityFilter(e.target.value)}
                                    className="appearance-none bg-white border border-[var(--color-hp-border)] rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-[var(--color-hp-dark)] hover:border-[var(--color-hp-gray-400)] focus:outline-none focus:border-[var(--color-hp-primary)] cursor-pointer transition-all"
                                >
                                    <option value="all">{t('All Priorities')}</option>
                                    <option value="urgent">{t('Urgent')}</option>
                                    <option value="high">{t('High')}</option>
                                    <option value="medium">{t('Medium')}</option>
                                    <option value="low">{t('Low')}</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)] pointer-events-none" />
                            </div>

                            {/* Status Filter (Especially for List View) */}
                            {viewMode === 'list' && (
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                        className="appearance-none bg-white border border-[var(--color-hp-border)] rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-[var(--color-hp-dark)] hover:border-[var(--color-hp-gray-400)] focus:outline-none focus:border-[var(--color-hp-primary)] cursor-pointer transition-all"
                                    >
                                        <option value="all">{t('All Status')}</option>
                                        <option value="pending">{t('Pending')}</option>
                                        <option value="in_progress">{t('In Progress')}</option>
                                        <option value="done">{t('Completed')}</option>
                                        <option value="cancelled">{t('Cancelled')}</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-hp-gray-500)] pointer-events-none" />
                                </div>
                            )}

                            {/* Reset Button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="hp-btn hp-btn-secondary inline-flex items-center gap-1.5"
                                    title={t('Reset')}
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>{t('Reset')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Status Summary Tag */}
                    <div className="flex items-center justify-between text-xs text-[var(--color-hp-gray-600)] pt-2 border-t border-[var(--color-hp-border)]">
                        <span>
                            {t('Showing')} <strong className="font-semibold text-[var(--color-hp-dark)]">{filteredTasks.length}</strong> {t('tasks')}
                            {hasActiveFilters && ` (${t('filtered')})`}
                        </span>
                        {showOverdueOnly && (
                            <span className="text-rose-600 font-semibold text-xs flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {t('Showing overdue tasks only')}
                            </span>
                        )}
                    </div>
                </div>

                {/* VIEW 1: KANBAN BOARD VIEW */}
                {viewMode === 'board' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
                        {['pending', 'in_progress', 'done', 'cancelled'].map(columnStatus => {
                            const colConfig = statusConfig[columnStatus] || statusConfig.pending;
                            const columnTasks = filteredTasks.filter(t => t.status === columnStatus);

                            return (
                                <div
                                    key={columnStatus}
                                    className="hp-card flex flex-col min-h-[460px] overflow-hidden"
                                >
                                    {/* Column Header */}
                                    <div className="px-4 py-3 border-b border-[var(--color-hp-border)] flex items-center justify-between bg-white">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${colConfig.dot}`} />
                                            <h3 className="text-xs sm:text-sm font-bold text-[var(--color-hp-dark)]">
                                                {t(colConfig.labelKey)}
                                            </h3>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[var(--color-hp-gray-100)] text-[var(--color-hp-gray-700)]">
                                            {columnTasks.length}
                                        </span>
                                    </div>

                                    {/* Task Cards Container */}
                                    <div className={`p-3 flex-1 flex flex-col gap-3 bg-[var(--color-hp-gray-50)]`}>
                                        {columnTasks.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--color-hp-border)] rounded-lg my-4 bg-white">
                                                <ClipboardList className="w-7 h-7 text-[var(--color-hp-gray-400)] mb-1.5" />
                                                <p className="text-xs font-semibold text-[var(--color-hp-gray-500)]">{t('No tasks in this stage')}</p>
                                            </div>
                                        ) : (
                                            columnTasks.map(task => {
                                                const priority = priorityConfig[task.priority] || priorityConfig.medium;

                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="bg-white p-3.5 rounded-lg border border-[var(--color-hp-border)] hover:border-[var(--color-hp-primary)] hover:shadow-xs transition-all group flex flex-col justify-between"
                                                    >
                                                        <div>
                                                            {/* Top Badges */}
                                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                                    <span className="text-[10px] font-mono font-bold text-[var(--color-hp-gray-700)] bg-[var(--color-hp-gray-100)] px-1.5 py-0.5 rounded">
                                                                        {task.work_order_code || `WO-${task.id}`}
                                                                    </span>
                                                                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${priority.badge}`}>
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                                                                        {t(priority.labelKey)}
                                                                    </span>
                                                                </div>

                                                                {task.due_date && (
                                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                                                                        task.overdue ? 'text-rose-600 font-bold' : 'text-[var(--color-hp-gray-500)]'
                                                                    }`}>
                                                                        <Calendar className="w-3 h-3" />
                                                                        {task.due_date}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Title & Description */}
                                                            <h4
                                                                onClick={() => openDetailModal(task)}
                                                                className="text-xs sm:text-sm font-bold text-[var(--color-hp-dark)] group-hover:text-[var(--color-hp-primary)] transition-colors cursor-pointer leading-snug"
                                                            >
                                                                {task.title}
                                                            </h4>

                                                            {task.description && (
                                                                <p className="text-xs text-[var(--color-hp-gray-600)] mt-1.5 line-clamp-2 leading-relaxed">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Bottom Meta & Actions */}
                                                        <div className="mt-3 pt-2.5 border-t border-[var(--color-hp-border)] flex items-center justify-between gap-2">
                                                            {/* Assignee Avatar */}
                                                            <div className="flex items-center gap-1.5 min-w-0">
                                                                <div className="w-5 h-5 rounded-full bg-[var(--color-hp-gray-100)] border border-[var(--color-hp-border)] text-[var(--color-hp-dark)] flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                    {task.assigned_to?.name ? String(task.assigned_to.name).charAt(0).toUpperCase() : <User className="w-3 h-3 text-[var(--color-hp-gray-500)]" />}
                                                                </div>
                                                                <span className="text-[11px] font-medium text-[var(--color-hp-gray-700)] truncate max-w-[105px]">
                                                                    {task.assigned_to?.name || t('Unassigned')}
                                                                </span>
                                                            </div>

                                                            {/* Quick Action Buttons */}
                                                            <div className="flex items-center gap-1">
                                                                {columnStatus === 'pending' && (
                                                                    <button
                                                                        onClick={() => handleQuickStatusChange(task, 'in_progress')}
                                                                        title={t('Start')}
                                                                        disabled={processing}
                                                                        className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                                                                    >
                                                                        <span>{t('Start')}</span>
                                                                        <ArrowRight className="w-2.5 h-2.5" />
                                                                    </button>
                                                                )}

                                                                {columnStatus === 'in_progress' && (
                                                                    <button
                                                                        onClick={() => handleQuickStatusChange(task, 'done')}
                                                                        title={t('Done')}
                                                                        disabled={processing}
                                                                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-[10px] font-semibold flex items-center gap-0.5 transition-colors"
                                                                    >
                                                                        <Check className="w-2.5 h-2.5" />
                                                                        <span>{t('Done')}</span>
                                                                    </button>
                                                                )}

                                                                {columnStatus === 'done' && (
                                                                    <button
                                                                        onClick={() => handleQuickStatusChange(task, 'in_progress')}
                                                                        title={t('Reopen')}
                                                                        disabled={processing}
                                                                        className="p-1 text-[var(--color-hp-gray-500)] hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                                                    >
                                                                        <RotateCcw className="w-3 h-3" />
                                                                    </button>
                                                                )}

                                                                {/* Edit Button */}
                                                                <button
                                                                    onClick={() => openEditModal(task)}
                                                                    title={t('Edit')}
                                                                    className="p-1 text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] hover:bg-[var(--color-hp-gray-100)] rounded transition-colors"
                                                                >
                                                                    <Pencil className="w-3 h-3" />
                                                                </button>

                                                                {/* Delete Button */}
                                                                <button
                                                                    onClick={() => handleDeleteTask(task)}
                                                                    title={t('Delete')}
                                                                    disabled={processing}
                                                                    className="p-1 text-[var(--color-hp-gray-500)] hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                                >
                                                                    <Trash2 className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* VIEW 2: CLEAN MINIMALIST LIST / TABLE VIEW */}
                {viewMode === 'list' && (
                    <div className="hp-card overflow-hidden">
                        {filteredTasks.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <ClipboardList className="w-10 h-10 text-[var(--color-hp-gray-400)] mb-2" />
                                <h3 className="text-sm font-bold text-[var(--color-hp-dark)]">{t('No matching tasks found')}</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={resetFilters}
                                        className="mt-3 hp-btn hp-btn-secondary hp-btn-sm"
                                    >
                                        {t('Clear Filters')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="hp-table">
                                    <thead>
                                        <tr>
                                            <th>{t('Task Title')}</th>
                                            <th>{t('Assignee')}</th>
                                            <th>{t('Priority')}</th>
                                            <th>{t('Due Date')}</th>
                                            <th>{t('All Status')}</th>
                                            <th className="text-right">{t('Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTasks.map(task => {
                                            const priority = priorityConfig[task.priority] || priorityConfig.medium;
                                            const status = statusConfig[task.status] || statusConfig.pending;

                                            return (
                                                <tr key={task.id}>
                                                    {/* Title & Description */}
                                                    <td className="max-w-xs sm:max-w-md">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-mono font-bold text-[var(--color-hp-gray-700)] bg-[var(--color-hp-gray-100)] px-1.5 py-0.5 rounded">
                                                                {task.work_order_code || `WO-${task.id}`}
                                                            </span>
                                                            <span className="text-[10px] capitalize font-semibold text-[var(--color-hp-primary)] bg-[var(--color-hp-primary-light)] px-1.5 py-0.5 rounded">
                                                                {String(task.industry || 'facility').replace('_', ' ')}
                                                            </span>
                                                            {task.customer && (
                                                                <span className="text-[10px] text-[var(--color-hp-gray-500)] font-medium truncate max-w-[120px]">
                                                                    • {task.customer.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div
                                                            onClick={() => openDetailModal(task)}
                                                            className="font-bold text-[var(--color-hp-dark)] hover:text-[var(--color-hp-primary)] transition-colors cursor-pointer text-xs sm:text-sm"
                                                        >
                                                            {task.title}
                                                        </div>
                                                        {task.description && (
                                                            <div className="text-[var(--color-hp-gray-600)] text-[11px] truncate mt-0.5">
                                                                {task.description}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Assignee */}
                                                    <td className="whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-[var(--color-hp-gray-100)] border border-[var(--color-hp-border)] text-[var(--color-hp-dark)] flex items-center justify-center text-[10px] font-bold">
                                                                {task.assigned_to?.name ? String(task.assigned_to.name).charAt(0).toUpperCase() : <User className="w-3 h-3 text-[var(--color-hp-gray-500)]" />}
                                                            </div>
                                                            <span className="font-medium text-[var(--color-hp-dark)] text-xs">
                                                                {task.assigned_to?.name || <span className="text-[var(--color-hp-gray-500)] font-normal">{t('Unassigned')}</span>}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Priority */}
                                                    <td className="whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${priority.badge}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                                                            {t(priority.labelKey)}
                                                        </span>
                                                    </td>

                                                    {/* Due Date */}
                                                    <td className="whitespace-nowrap">
                                                        {task.due_date ? (
                                                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                                                task.overdue ? 'text-rose-600 font-bold' : 'text-[var(--color-hp-gray-700)]'
                                                            }`}>
                                                                <Calendar className="w-3.5 h-3.5 text-[var(--color-hp-gray-500)]" />
                                                                {task.due_date}
                                                                {task.overdue && (
                                                                    <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 px-1 py-0.2 rounded font-bold ml-1">
                                                                        {t('Overdue')}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[var(--color-hp-gray-400)] text-[11px]">-</span>
                                                        )}
                                                    </td>

                                                    {/* Status Dropdown */}
                                                    <td className="whitespace-nowrap">
                                                        <select
                                                            value={task.status}
                                                            onChange={e => handleQuickStatusChange(task, e.target.value)}
                                                            disabled={processing}
                                                            className={`text-[11px] font-semibold py-1 px-2.5 rounded-md border border-[var(--color-hp-border)] bg-white cursor-pointer focus:outline-none focus:border-[var(--color-hp-primary)] transition-all`}
                                                        >
                                                            <option value="pending">{t('Pending')}</option>
                                                            <option value="in_progress">{t('In Progress')}</option>
                                                            <option value="done">{t('Completed')}</option>
                                                            <option value="cancelled">{t('Cancelled')}</option>
                                                        </select>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => openDetailModal(task)}
                                                                title={t('View All')}
                                                                className="p-1.5 text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] hover:bg-[var(--color-hp-gray-100)] rounded-md transition-colors"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>

                                                            <button
                                                                onClick={() => openEditModal(task)}
                                                                title={t('Edit')}
                                                                className="p-1.5 text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-primary)] hover:bg-[var(--color-hp-primary-light)] rounded-md transition-colors"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeleteTask(task)}
                                                                title={t('Delete')}
                                                                disabled={processing}
                                                                className="p-1.5 text-[var(--color-hp-gray-500)] hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL 1: CREATE NEW TASK */}
            {showNewModal && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowNewModal(false)}
                >
                    <div
                        className="hp-card shadow-lg w-full max-w-lg p-6 my-8 border border-[var(--color-hp-border)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-hp-border)]">
                            <h2 className="text-lg font-bold text-[var(--color-hp-dark)]">
                                {t('Create New Task')}
                            </h2>
                            <button
                                onClick={() => setShowNewModal(false)}
                                className="text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] p-1 rounded-md hover:bg-[var(--color-hp-gray-100)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
                            {/* Industry & Client Site */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                        {t('Industry Domain')} <span className="text-[var(--color-hp-primary)]">*</span>
                                    </label>
                                    <select
                                        value={newTask.industry}
                                        onChange={e => setNewTask(prev => ({ ...prev, industry: e.target.value }))}
                                        className="hp-input"
                                    >
                                        <option value="facility_management">Facility Management</option>
                                        <option value="construction">Construction & Civil</option>
                                        <option value="security">Security & Guard Patrols</option>
                                        <option value="fmcg">FMCG & Retail Distribution</option>
                                        <option value="logistics">Logistics & Express Delivery</option>
                                        <option value="solar">Solar & Renewable Energy</option>
                                        <option value="cleaning">Housekeeping & Cleaning</option>
                                        <option value="pest_control">Pest Control & Sanitation</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                        {t('Client / Facility Site')}
                                    </label>
                                    <select
                                        value={newTask.customer_id}
                                        onChange={e => setNewTask(prev => ({ ...prev, customer_id: e.target.value }))}
                                        className="hp-input"
                                    >
                                        <option value="">{t('No client selected')}</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Title with AI Suggestion Button */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-semibold text-[var(--color-hp-dark)]">
                                        {t('Task Title')} <span className="text-rose-500">*</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => handleGenerateAiSuggestions(newTask.title, newTask.industry)}
                                        disabled={generatingAi}
                                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-hp-primary)] hover:underline"
                                    >
                                        <Sparkles className="w-3 h-3" />
                                        <span>{generatingAi ? 'Analyzing...' : 'AI Recommend'}</span>
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={newTask.title}
                                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Chiller Maintenance / HVAC Inspection Floor 3"
                                    className="hp-input"
                                />
                            </div>

                            {/* AI Suggestions Box */}
                            {newTask.ai_suggestions && (
                                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Fieldy AI Insights (Advisory)</span>
                                    </div>
                                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                        {newTask.ai_suggestions}
                                    </p>
                                </div>
                            )}

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                    {t('Detailed Instructions')}
                                </label>
                                <textarea
                                    rows={3}
                                    value={newTask.description}
                                    onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Provide clear goals, target facility / client details, or special notes..."
                                    className="hp-input resize-none"
                                />
                            </div>

                            {/* Assign Officer */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                    {t('Assign To Officer')}
                                </label>
                                <select
                                    value={newTask.assigned_to}
                                    onChange={e => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))}
                                    className="hp-input"
                                >
                                    <option value="">{t('Unassigned')}</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority & Due Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                        {t('Priority')}
                                    </label>
                                    <select
                                        value={newTask.priority}
                                        onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                                        className="hp-input"
                                    >
                                        <option value="low">{t('Low')}</option>
                                        <option value="medium">{t('Medium')}</option>
                                        <option value="high">{t('High')}</option>
                                        <option value="urgent">{t('Urgent')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                        {t('Due Date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={newTask.due_date}
                                        onChange={e => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                                        className="hp-input"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--color-hp-border)]">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModal(false)}
                                    className="hp-btn hp-btn-secondary"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="hp-btn hp-btn-primary"
                                >
                                    {processing ? '...' : t('Create New Task')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: EDIT TASK */}
            {showEditModal && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="hp-card shadow-lg w-full max-w-lg p-6 my-8 border border-[var(--color-hp-border)]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-[var(--color-hp-border)]">
                            <h2 className="text-lg font-bold text-[var(--color-hp-dark)]">
                                {t('Edit Task Details')}
                            </h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] p-1 rounded-md hover:bg-[var(--color-hp-gray-100)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateTask} className="mt-4 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                    {t('Task Title')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editTask.title}
                                    onChange={e => setEditTask(prev => ({ ...prev, title: e.target.value }))}
                                    className="hp-input"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                    {t('Detailed Instructions')}
                                </label>
                                <textarea
                                    rows={3}
                                    value={editTask.description}
                                    onChange={e => setEditTask(prev => ({ ...prev, description: e.target.value }))}
                                    className="hp-input resize-none"
                                />
                            </div>

                            {/* Assign Officer */}
                            <div>
                                <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                    {t('Assign To Officer')}
                                </label>
                                <select
                                    value={editTask.assigned_to}
                                    onChange={e => setEditTask(prev => ({ ...prev, assigned_to: e.target.value }))}
                                    className="hp-input"
                                >
                                    <option value="">{t('Unassigned')}</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Status, Priority & Due Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                        {t('All Status')}
                                    </label>
                                    <select
                                        value={editTask.status}
                                        onChange={e => setEditTask(prev => ({ ...prev, status: e.target.value }))}
                                        className="hp-input"
                                    >
                                        <option value="pending">{t('Pending')}</option>
                                        <option value="in_progress">{t('In Progress')}</option>
                                        <option value="done">{t('Completed')}</option>
                                        <option value="cancelled">{t('Cancelled')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                        {t('Priority')}
                                    </label>
                                    <select
                                        value={editTask.priority}
                                        onChange={e => setEditTask(prev => ({ ...prev, priority: e.target.value }))}
                                        className="hp-input"
                                    >
                                        <option value="low">{t('Low')}</option>
                                        <option value="medium">{t('Medium')}</option>
                                        <option value="high">{t('High')}</option>
                                        <option value="urgent">{t('Urgent')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-[var(--color-hp-dark)] mb-1">
                                        {t('Due Date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={editTask.due_date}
                                        onChange={e => setEditTask(prev => ({ ...prev, due_date: e.target.value }))}
                                        className="hp-input"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--color-hp-border)]">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="hp-btn hp-btn-secondary"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="hp-btn hp-btn-primary"
                                >
                                    {processing ? '...' : t('Save Changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: TASK DETAIL VIEW */}
            {showDetailModal && selectedTask && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowDetailModal(false)}
                >
                    <div
                        className="hp-card shadow-lg w-full max-w-lg p-6 my-8 border border-[var(--color-hp-border)] space-y-4"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[var(--color-hp-border)]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityConfig[selectedTask.priority]?.badge || ''}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[selectedTask.priority]?.dot || ''}`} />
                                        {t(priorityConfig[selectedTask.priority]?.labelKey || 'Medium')}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${statusConfig[selectedTask.status]?.badge || ''}`}>
                                        {t(statusConfig[selectedTask.status]?.labelKey || 'Pending')}
                                    </span>
                                </div>
                                <h2 className="text-lg font-bold text-[var(--color-hp-dark)] mt-2">
                                    {selectedTask.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-[var(--color-hp-gray-500)] hover:text-[var(--color-hp-dark)] p-1 rounded-md hover:bg-[var(--color-hp-gray-100)] transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Work Order & Domain Badge */}
                        <div className="flex items-center justify-between text-xs font-medium text-[var(--color-hp-gray-600)] bg-[var(--color-hp-gray-50)] px-3 py-2 rounded-lg border border-[var(--color-hp-border)]">
                            <span>Work Order: <strong className="text-[var(--color-hp-dark)]">{selectedTask.work_order_code || `WO-${selectedTask.id}`}</strong></span>
                            <span className="capitalize text-[var(--color-hp-primary)] font-semibold bg-[var(--color-hp-primary-light)] px-2 py-0.5 rounded">{String(selectedTask.industry || 'facility_management').replace('_', ' ')}</span>
                        </div>

                        {/* Customer / Client */}
                        {selectedTask.customer && (
                            <div className="flex items-center justify-between text-xs bg-[var(--color-hp-gray-50)] px-3 py-2 rounded-lg border border-[var(--color-hp-border)]">
                                <span className="text-[var(--color-hp-gray-600)]">{t('Client / Facility')}:</span>
                                <strong className="text-[var(--color-hp-dark)]">{selectedTask.customer.name}</strong>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <span className="text-[11px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider block mb-1">
                                {t('Task Description')}
                            </span>
                            <p className="text-xs sm:text-sm text-[var(--color-hp-dark)] bg-[var(--color-hp-gray-50)] p-3 rounded-lg border border-[var(--color-hp-border)] whitespace-pre-wrap leading-relaxed">
                                {selectedTask.description || 'No detailed instructions provided.'}
                            </p>
                        </div>

                        {/* AI Suggestions (if present) */}
                        {selectedTask.ai_suggestions && (
                            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg space-y-1">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Fieldy AI Insights (Advisory)</span>
                                </div>
                                <p className="text-xs text-amber-800 leading-relaxed font-medium">
                                    {selectedTask.ai_suggestions}
                                </p>
                            </div>
                        )}

                        {/* Service Checklist & Evidence Verification */}
                        <div className="space-y-2">
                            <span className="text-[11px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider block">
                                Service Execution & Verification Checklist
                            </span>
                            <div className="space-y-1.5 bg-[var(--color-hp-gray-50)] p-3 rounded-lg border border-[var(--color-hp-border)]">
                                {(selectedTask.checklist || [
                                    { id: 1, text: 'Safety gear & PPE checklist verified', done: true },
                                    { id: 2, text: 'Inspection diagnostics completed', done: false },
                                    { id: 3, text: 'Before & after photos attached', done: false },
                                    { id: 4, text: `Customer OTP verification (Dummy: ${selectedTask.customer_otp || '4821'})`, done: selectedTask.otp_verified }
                                ]).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                        <div className={`w-4 h-4 rounded flex items-center justify-center ${item.done ? 'bg-emerald-600 text-white' : 'border border-[var(--color-hp-border)] bg-white'}`}>
                                            {item.done && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                        <span className={item.done ? 'line-through text-[var(--color-hp-gray-500)] font-medium' : 'text-[var(--color-hp-dark)] font-medium'}>
                                            {item.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Meta Information Grid */}
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                            <div className="bg-[var(--color-hp-gray-50)] p-2.5 rounded-lg border border-[var(--color-hp-border)]">
                                <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider block mb-1">
                                    {t('Assigned Officer')}
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-white border border-[var(--color-hp-border)] text-[var(--color-hp-dark)] flex items-center justify-center text-[10px] font-bold">
                                        {selectedTask.assigned_to?.name ? String(selectedTask.assigned_to.name).charAt(0).toUpperCase() : <User className="w-3 h-3 text-[var(--color-hp-gray-500)]" />}
                                    </div>
                                    <span className="text-xs font-semibold text-[var(--color-hp-dark)] truncate">
                                        {selectedTask.assigned_to?.name || t('Unassigned')}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-[var(--color-hp-gray-50)] p-2.5 rounded-lg border border-[var(--color-hp-border)]">
                                <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider block mb-1">
                                    {t('Due Date')}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-hp-dark)]">
                                    <Calendar className="w-3.5 h-3.5 text-[var(--color-hp-gray-500)]" />
                                    <span>{selectedTask.due_date || '-'}</span>
                                    {selectedTask.overdue && (
                                        <span className="text-[9px] bg-rose-100 text-rose-700 px-1 rounded font-bold">
                                            {t('Overdue')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-[var(--color-hp-gray-50)] p-2.5 rounded-lg border border-[var(--color-hp-border)]">
                                <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider block mb-1">
                                    Customer OTP
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-hp-dark)]">
                                    <KeyRound className="w-3.5 h-3.5 text-[var(--color-hp-primary)]" />
                                    <span>{selectedTask.customer_otp || '4821'} ({selectedTask.otp_verified ? 'Verified' : 'Pending'})</span>
                                </div>
                            </div>

                            <div className="bg-[var(--color-hp-gray-50)] p-2.5 rounded-lg border border-[var(--color-hp-border)]">
                                <span className="text-[10px] font-semibold text-[var(--color-hp-gray-500)] uppercase tracking-wider block mb-1">
                                    Performance Reward
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>+{selectedTask.points_awarded || 35} Pts</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Quick Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-[var(--color-hp-border)]">
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleDeleteTask(selectedTask);
                                }}
                                disabled={processing}
                                className="hp-btn hp-btn-outline text-rose-600 hover:bg-rose-50 border-rose-200 hp-btn-sm inline-flex items-center gap-1.5"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{t('Delete')}</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        openEditModal(selectedTask);
                                    }}
                                    className="hp-btn hp-btn-secondary hp-btn-sm inline-flex items-center gap-1.5"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>{t('Edit')}</span>
                                </button>

                                {selectedTask.status !== 'done' && (
                                    <button
                                        onClick={() => handleQuickStatusChange(selectedTask, 'done')}
                                        disabled={processing}
                                        className="hp-btn hp-btn-primary hp-btn-sm inline-flex items-center gap-1.5"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{t('Completed')}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
