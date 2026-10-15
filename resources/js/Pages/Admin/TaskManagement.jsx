import React, { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { Head, router } from '@inertiajs/react';
import { 
    ClipboardList, Calendar, Activity, 
    Search, ChevronDown, CheckCircle2, X,
    Clock, Plus, User, Trash2,
    LayoutGrid, ListFilter, ArrowRight, RotateCcw,
    Pencil, Eye, Check, AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAlert } from '../../Components/AlertSystem';

export default function TaskManagement({ tasks = [], employees = [] }) {
    const { t } = useTranslation();
    const { triggerInfo, triggerCritical } = useAlert();

    // View mode: 'list' (default) or 'board'
    const [viewMode, setViewMode] = useState('list');

    // Modals state
    const [showNewModal, setShowNewModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Form state for Create Task
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assigned_to: '',
        priority: 'medium',
        due_date: ''
    });

    // Form state for Edit Task
    const [editTask, setEditTask] = useState({
        id: null,
        title: '',
        description: '',
        assigned_to: '',
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

            const matchStatus = statusFilter === 'all' || task.status === statusFilter;
            const matchPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchAssignee = assigneeFilter === 'all' ||
                (assigneeFilter === 'unassigned' ? !task.assigned_to : String(task.assigned_to?.id) === String(assigneeFilter));
            const matchOverdue = !showOverdueOnly || Boolean(task.overdue);

            return matchSearch && matchStatus && matchPriority && matchAssignee && matchOverdue;
        });
    }, [tasks, searchQuery, statusFilter, priorityFilter, assigneeFilter, showOverdueOnly]);

    const hasActiveFilters = searchQuery !== '' || statusFilter !== 'all' || priorityFilter !== 'all' || assigneeFilter !== 'all' || showOverdueOnly;

    const resetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setPriorityFilter('all');
        setAssigneeFilter('all');
        setShowOverdueOnly(false);
    };

    // Priority configurations
    const priorityConfig = {
        urgent: {
            labelKey: 'Urgent',
            badge: 'bg-rose-50 text-rose-700 border-rose-200/60',
            dot: 'bg-rose-500'
        },
        high: {
            labelKey: 'High',
            badge: 'bg-amber-50 text-amber-700 border-amber-200/60',
            dot: 'bg-amber-500'
        },
        medium: {
            labelKey: 'Medium',
            badge: 'bg-sky-50 text-sky-700 border-sky-200/60',
            dot: 'bg-sky-500'
        },
        low: {
            labelKey: 'Low',
            badge: 'bg-slate-50 text-slate-600 border-slate-200/60',
            dot: 'bg-slate-400'
        }
    };

    // Status configurations
    const statusConfig = {
        pending: {
            labelKey: 'Pending',
            color: 'text-amber-700',
            badge: 'bg-amber-50 text-amber-700 border-amber-200/70',
            dot: 'bg-amber-500',
            border: 'border-amber-200',
            bgColumn: 'bg-amber-50/20'
        },
        in_progress: {
            labelKey: 'In Progress',
            color: 'text-sky-700',
            badge: 'bg-sky-50 text-sky-700 border-sky-200/70',
            dot: 'bg-sky-500',
            border: 'border-sky-200',
            bgColumn: 'bg-sky-50/20'
        },
        done: {
            labelKey: 'Completed',
            color: 'text-emerald-700',
            badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
            dot: 'bg-emerald-500',
            border: 'border-emerald-200',
            bgColumn: 'bg-emerald-50/20'
        },
        cancelled: {
            labelKey: 'Cancelled',
            color: 'text-slate-600',
            badge: 'bg-slate-100 text-slate-600 border-slate-200/70',
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
            assigned_to: newTask.assigned_to ? Number(newTask.assigned_to) : null,
            priority: newTask.priority,
            due_date: newTask.due_date || null
        };

        router.post('/admin/tasks', payload, {
            preserveScroll: true,
            onSuccess: () => {
                setShowNewModal(false);
                setNewTask({
                    title: '',
                    description: '',
                    assigned_to: '',
                    priority: 'medium',
                    due_date: ''
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
            assigned_to: task.assigned_to?.id ? String(task.assigned_to.id) : '',
            priority: task.priority || 'medium',
            status: task.status || 'pending',
            due_date: task.due_date_raw || ''
        });
        setShowEditModal(true);
    };

    const handleUpdateTask = (e) => {
        e.preventDefault();
        if (!editTask.title.trim()) {
            triggerCritical('Task title is required.');
            return;
        }

        setProcessing(true);
        const payload = {
            title: editTask.title.trim(),
            description: editTask.description.trim() || null,
            assigned_to: editTask.assigned_to ? Number(editTask.assigned_to) : null,
            priority: editTask.priority,
            status: editTask.status,
            due_date: editTask.due_date || null
        };

        router.put(`/admin/tasks/${editTask.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setShowEditModal(false);
                triggerInfo(t('Save Changes'));
                setProcessing(false);
            },
            onError: () => {
                triggerCritical('Failed to update task.');
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
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-sm">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-heading font-semibold text-slate-800 tracking-tight">
                            {t('Tasks & Schedule Management')}
                        </h1>
                        <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
                            {t('Assign targets, track field operations, and monitor daily progress across officers.')}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* View Switcher */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
                            <button
                                onClick={() => setViewMode('board')}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    viewMode === 'board'
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                                title={t('Board View')}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span>{t('Board View')}</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    viewMode === 'list'
                                        ? 'bg-white text-slate-800 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-800'
                                }`}
                                title={t('List View')}
                            >
                                <ListFilter className="w-3.5 h-3.5" />
                                <span>{t('List View')}</span>
                            </button>
                        </div>

                        {/* Create Task Button */}
                        <button
                            onClick={() => setShowNewModal(true)}
                            className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all duration-200"
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
                        className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${
                            statusFilter === 'all' && !showOverdueOnly ? 'border-slate-300 ring-1 ring-slate-200 shadow-sm' : 'border-slate-100'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-slate-500">{t('Total Tasks')}</span>
                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                <ClipboardList className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-800">{metrics.total}</div>
                        <div className="text-[11px] text-slate-400 mt-1">{t('Across all field staff')}</div>
                    </div>

                    {/* Pending */}
                    <div 
                        onClick={() => { setStatusFilter('pending'); setShowOverdueOnly(false); }}
                        className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${
                            statusFilter === 'pending' && !showOverdueOnly ? 'border-amber-300 ring-1 ring-amber-200 shadow-sm' : 'border-slate-100'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-amber-700">{t('Pending')}</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-800">{metrics.pending}</div>
                        <div className="text-[11px] text-amber-600/80 mt-1 font-medium">{t('Awaiting commencement')}</div>
                    </div>

                    {/* In Progress */}
                    <div 
                        onClick={() => { setStatusFilter('in_progress'); setShowOverdueOnly(false); }}
                        className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${
                            statusFilter === 'in_progress' && !showOverdueOnly ? 'border-sky-300 ring-1 ring-sky-200 shadow-sm' : 'border-slate-100'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-sky-700">{t('In Progress')}</span>
                            <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-800">{metrics.inProgress}</div>
                        <div className="text-[11px] text-sky-600/80 mt-1 font-medium">{t('Ongoing field duties')}</div>
                    </div>

                    {/* Done */}
                    <div 
                        onClick={() => { setStatusFilter('done'); setShowOverdueOnly(false); }}
                        className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${
                            statusFilter === 'done' && !showOverdueOnly ? 'border-emerald-300 ring-1 ring-emerald-200 shadow-sm' : 'border-slate-100'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-emerald-700">{t('Completed')}</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-slate-800">{metrics.done}</div>
                        <div className="text-[11px] text-emerald-600/80 mt-1 font-medium">{t('Successfully completed')}</div>
                    </div>

                    {/* Overdue */}
                    <div 
                        onClick={() => setShowOverdueOnly(!showOverdueOnly)}
                        className={`col-span-2 lg:col-span-1 bg-white p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-sm ${
                            showOverdueOnly ? 'border-rose-300 ring-1 ring-rose-200 shadow-sm' : 'border-slate-100'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-rose-700">{t('Overdue')}</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-rose-600">{metrics.overdue}</div>
                        <div className="text-[11px] text-rose-500 mt-1 font-medium">{t('Past scheduled deadline')}</div>
                    </div>
                </div>

                {/* Filter and Search Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
                    <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={t('Search by task title, description, or officer...')}
                                className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filter Selectors */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Officer Filter */}
                            <div className="relative">
                                <select
                                    value={assigneeFilter}
                                    onChange={e => setAssigneeFilter(e.target.value)}
                                    className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer transition-all"
                                >
                                    <option value="all">{t('All Officers')}</option>
                                    <option value="unassigned">{t('Unassigned')}</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Priority Filter */}
                            <div className="relative">
                                <select
                                    value={priorityFilter}
                                    onChange={e => setPriorityFilter(e.target.value)}
                                    className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer transition-all"
                                >
                                    <option value="all">{t('All Priorities')}</option>
                                    <option value="urgent">{t('Urgent')}</option>
                                    <option value="high">{t('High')}</option>
                                    <option value="medium">{t('Medium')}</option>
                                    <option value="low">{t('Low')}</option>
                                </select>
                                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Status Filter (Especially for List View) */}
                            {viewMode === 'list' && (
                                <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={e => setStatusFilter(e.target.value)}
                                        className="appearance-none bg-slate-50 border border-slate-200/80 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer transition-all"
                                    >
                                        <option value="all">{t('All Status')}</option>
                                        <option value="pending">{t('Pending')}</option>
                                        <option value="in_progress">{t('In Progress')}</option>
                                        <option value="done">{t('Completed')}</option>
                                        <option value="cancelled">{t('Cancelled')}</option>
                                    </select>
                                    <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            )}

                            {/* Reset Button */}
                            {hasActiveFilters && (
                                <button
                                    onClick={resetFilters}
                                    className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all"
                                    title={t('Reset')}
                                >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>{t('Reset')}</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Status Summary Tag */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
                        <span>
                            {t('Showing')} <strong className="font-semibold text-slate-700">{filteredTasks.length}</strong> {t('tasks')}
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
                                    className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col min-h-[460px] overflow-hidden"
                                >
                                    {/* Column Header */}
                                    <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2.5 h-2.5 rounded-full ${colConfig.dot}`} />
                                            <div>
                                                <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                                                    {t(colConfig.labelKey)}
                                                </h3>
                                            </div>
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white border border-slate-200/70 text-slate-600 shadow-2xs">
                                            {columnTasks.length}
                                        </span>
                                    </div>

                                    {/* Task Cards Container */}
                                    <div className={`p-3 flex-1 flex flex-col gap-3 ${colConfig.bgColumn}`}>
                                        {columnTasks.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200/80 rounded-xl my-4">
                                                <ClipboardList className="w-7 h-7 text-slate-300 mb-1.5" />
                                                <p className="text-xs font-semibold text-slate-400">{t('No tasks in this stage')}</p>
                                            </div>
                                        ) : (
                                            columnTasks.map(task => {
                                                const priority = priorityConfig[task.priority] || priorityConfig.medium;

                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="bg-white p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                                                    >
                                                        <div>
                                                            {/* Top Badges */}
                                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${priority.badge}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                                                                    {t(priority.labelKey)}
                                                                </span>

                                                                {task.due_date && (
                                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                                                                        task.overdue ? 'text-rose-600 font-bold' : 'text-slate-400'
                                                                    }`}>
                                                                        <Calendar className="w-3 h-3" />
                                                                        {task.due_date}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Title & Description */}
                                                            <h4
                                                                onClick={() => openDetailModal(task)}
                                                                className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors cursor-pointer leading-snug"
                                                            >
                                                                {task.title}
                                                            </h4>

                                                            {task.description && (
                                                                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Bottom Meta & Actions */}
                                                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
                                                            {/* Assignee Avatar */}
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                                    {task.assigned_to?.name ? String(task.assigned_to.name).charAt(0).toUpperCase() : <User className="w-3 h-3 text-slate-400" />}
                                                                </div>
                                                                <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[105px]">
                                                                    {task.assigned_to?.name || t('Unassigned')}
                                                                </span>
                                                            </div>

                                                            {/* Quick Action Buttons */}
                                                            <div className="flex items-center gap-1">
                                                                {/* Progress Button */}
                                                                {columnStatus === 'pending' && (
                                                                    <button
                                                                        onClick={() => handleQuickStatusChange(task, 'in_progress')}
                                                                        title={t('Start')}
                                                                        disabled={processing}
                                                                        className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[10px] font-bold flex items-center gap-0.5 transition-colors"
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
                                                                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-0.5 transition-colors"
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
                                                                        className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                                                    >
                                                                        <RotateCcw className="w-3.5 h-3.5" />
                                                                    </button>
                                                                )}

                                                                {/* Edit Button */}
                                                                <button
                                                                    onClick={() => openEditModal(task)}
                                                                    title={t('Edit')}
                                                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>

                                                                {/* Delete Button */}
                                                                <button
                                                                    onClick={() => handleDeleteTask(task)}
                                                                    title={t('Delete')}
                                                                    disabled={processing}
                                                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
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
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {filteredTasks.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center">
                                <ClipboardList className="w-10 h-10 text-slate-300 mb-2" />
                                <h3 className="text-sm font-bold text-slate-700">{t('No matching tasks found')}</h3>
                                {hasActiveFilters && (
                                    <button
                                        onClick={resetFilters}
                                        className="mt-3 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors"
                                    >
                                        {t('Clear Filters')}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                            <th className="py-3.5 px-4 sm:px-6">{t('Task Title')}</th>
                                            <th className="py-3.5 px-4">{t('Assignee')}</th>
                                            <th className="py-3.5 px-4">{t('Priority')}</th>
                                            <th className="py-3.5 px-4">{t('Due Date')}</th>
                                            <th className="py-3.5 px-4">{t('All Status')}</th>
                                            <th className="py-3.5 px-4 text-right">{t('Actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs">
                                        {filteredTasks.map(task => {
                                            const priority = priorityConfig[task.priority] || priorityConfig.medium;
                                            const status = statusConfig[task.status] || statusConfig.pending;

                                            return (
                                                <tr
                                                    key={task.id}
                                                    className="hover:bg-slate-50/50 transition-colors group"
                                                >
                                                    {/* Title & Description */}
                                                    <td className="py-3.5 px-4 sm:px-6 max-w-xs sm:max-w-md">
                                                        <div
                                                            onClick={() => openDetailModal(task)}
                                                            className="font-bold text-slate-800 hover:text-emerald-700 transition-colors cursor-pointer text-xs sm:text-sm"
                                                        >
                                                            {task.title}
                                                        </div>
                                                        {task.description && (
                                                            <div className="text-slate-500 text-[11px] truncate mt-0.5">
                                                                {task.description}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Assignee */}
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                                                {task.assigned_to?.name ? String(task.assigned_to.name).charAt(0).toUpperCase() : <User className="w-3 h-3 text-slate-400" />}
                                                            </div>
                                                            <span className="font-semibold text-slate-700">
                                                                {task.assigned_to?.name || <span className="text-slate-400 font-normal">{t('Unassigned')}</span>}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Priority */}
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priority.badge}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
                                                            {t(priority.labelKey)}
                                                        </span>
                                                    </td>

                                                    {/* Due Date */}
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        {task.due_date ? (
                                                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                                                                task.overdue ? 'text-rose-600 font-bold' : 'text-slate-600'
                                                            }`}>
                                                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                {task.due_date}
                                                                {task.overdue && (
                                                                    <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.2 rounded-full font-bold ml-1">
                                                                        {t('Overdue')}
                                                                    </span>
                                                                )}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-[11px]">-</span>
                                                        )}
                                                    </td>

                                                    {/* Status Dropdown */}
                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <select
                                                            value={task.status}
                                                            onChange={e => handleQuickStatusChange(task, e.target.value)}
                                                            disabled={processing}
                                                            className={`text-[11px] font-bold py-1 px-2.5 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all ${status.badge}`}
                                                        >
                                                            <option value="pending">{t('Pending')}</option>
                                                            <option value="in_progress">{t('In Progress')}</option>
                                                            <option value="done">{t('Completed')}</option>
                                                            <option value="cancelled">{t('Cancelled')}</option>
                                                        </select>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => openDetailModal(task)}
                                                                title={t('View All')}
                                                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </button>

                                                            <button
                                                                onClick={() => openEditModal(task)}
                                                                title={t('Edit')}
                                                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeleteTask(task)}
                                                                title={t('Delete')}
                                                                disabled={processing}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowNewModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-7 my-8 border border-slate-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-heading font-bold text-slate-800">
                                    {t('Create New Task')}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowNewModal(false)}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="mt-5 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    {t('Task Title')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newTask.title}
                                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="e.g. Conduct Farm Visit at Sector 4"
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    {t('Detailed Instructions')}
                                </label>
                                <textarea
                                    rows={3}
                                    value={newTask.description}
                                    onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Provide clear goals, target farmer details, or special notes..."
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
                                />
                            </div>

                            {/* Assign Officer */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    {t('Assign To Officer')}
                                </label>
                                <select
                                    value={newTask.assigned_to}
                                    onChange={e => setNewTask(prev => ({ ...prev, assigned_to: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                                >
                                    <option value="">{t('Unassigned')}</option>
                                    {employees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Priority & Due Date */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {t('Priority')}
                                    </label>
                                    <select
                                        value={newTask.priority}
                                        onChange={e => setNewTask(prev => ({ ...prev, priority: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                                    >
                                        <option value="low">{t('Low')}</option>
                                        <option value="medium">{t('Medium')}</option>
                                        <option value="high">{t('High')}</option>
                                        <option value="urgent">{t('Urgent')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {t('Due Date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={newTask.due_date}
                                        onChange={e => setNewTask(prev => ({ ...prev, due_date: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowNewModal(false)}
                                    className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
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
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowEditModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-7 my-8 border border-slate-100"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-heading font-bold text-slate-800">
                                    {t('Edit Task Details')}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateTask} className="mt-5 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    {t('Task Title')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editTask.title}
                                    onChange={e => setEditTask(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    {t('Detailed Instructions')}
                                </label>
                                <textarea
                                    rows={3}
                                    value={editTask.description}
                                    onChange={e => setEditTask(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none"
                                />
                            </div>

                            {/* Assign Officer */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    {t('Assign To Officer')}
                                </label>
                                <select
                                    value={editTask.assigned_to}
                                    onChange={e => setEditTask(prev => ({ ...prev, assigned_to: e.target.value }))}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
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
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {t('All Status')}
                                    </label>
                                    <select
                                        value={editTask.status}
                                        onChange={e => setEditTask(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                                    >
                                        <option value="pending">{t('Pending')}</option>
                                        <option value="in_progress">{t('In Progress')}</option>
                                        <option value="done">{t('Completed')}</option>
                                        <option value="cancelled">{t('Cancelled')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {t('Priority')}
                                    </label>
                                    <select
                                        value={editTask.priority}
                                        onChange={e => setEditTask(prev => ({ ...prev, priority: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                                    >
                                        <option value="low">{t('Low')}</option>
                                        <option value="medium">{t('Medium')}</option>
                                        <option value="high">{t('High')}</option>
                                        <option value="urgent">{t('Urgent')}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        {t('Due Date')}
                                    </label>
                                    <input
                                        type="date"
                                        value={editTask.due_date}
                                        onChange={e => setEditTask(prev => ({ ...prev, due_date: e.target.value }))}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-semibold"
                                    />
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all disabled:opacity-50"
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
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
                    onClick={() => setShowDetailModal(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 sm:p-7 my-8 border border-slate-100 space-y-5"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${priorityConfig[selectedTask.priority]?.badge || ''}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[selectedTask.priority]?.dot || ''}`} />
                                        {t(priorityConfig[selectedTask.priority]?.labelKey || 'Medium')}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig[selectedTask.status]?.badge || ''}`}>
                                        {t(statusConfig[selectedTask.status]?.labelKey || 'Pending')}
                                    </span>
                                </div>
                                <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-800 mt-2">
                                    {selectedTask.title}
                                </h2>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Description */}
                        <div>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                {t('Task Description')}
                            </span>
                            <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 whitespace-pre-wrap leading-relaxed">
                                {selectedTask.description || 'No detailed instructions provided.'}
                            </p>
                        </div>

                        {/* Meta Information Grid */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    {t('Assigned Officer')}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                        {selectedTask.assigned_to?.name ? String(selectedTask.assigned_to.name).charAt(0).toUpperCase() : <User className="w-3 h-3 text-slate-400" />}
                                    </div>
                                    <span className="text-xs font-bold text-slate-800">
                                        {selectedTask.assigned_to?.name || t('Unassigned')}
                                    </span>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                                    {t('Due Date')}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                    <span>{selectedTask.due_date || '-'}</span>
                                    {selectedTask.overdue && (
                                        <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-bold">
                                            {t('Overdue')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Footer Quick Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleDeleteTask(selectedTask);
                                }}
                                disabled={processing}
                                className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors"
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
                                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span>{t('Edit')}</span>
                                </button>

                                {selectedTask.status !== 'done' && (
                                    <button
                                        onClick={() => handleQuickStatusChange(selectedTask, 'done')}
                                        disabled={processing}
                                        className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition-colors"
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
