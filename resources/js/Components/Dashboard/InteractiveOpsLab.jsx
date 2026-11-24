import React, { useState, useEffect, useMemo } from 'react';
import { router } from '@inertiajs/react';
import {
    Sparkles, Trophy, CheckCircle2, Circle, Plus, Trash2, BarChart3,
    Smile, Brain, Dices, HeartHandshake, StickyNote, ArrowRight,
    Check, X, RotateCw, Award, Send, Flame, Rocket,
    Target, ThumbsUp, Zap, Coffee, ShieldCheck, Star
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MOODS = [
    { id: 'fired', icon: Flame, color: '#EA580C', bg: 'bg-orange-50', label: 'Fired Up', tip: 'High momentum! Assign priority tasks first while energy peaks.' },
    { id: 'focused', icon: Target, color: '#0F766E', bg: 'bg-teal-50', label: 'Focused', tip: 'Great time to review site geofences and clear pending approvals.' },
    { id: 'steady', icon: ThumbsUp, color: '#2563EB', bg: 'bg-blue-50', label: 'Steady', tip: 'Smooth operations ahead. Check live map attendance for mid-shift sync.' },
    { id: 'busy', icon: Zap, color: '#7C3AED', bg: 'bg-violet-50', label: 'Busy', tip: 'Start a 15-minute Focus Sprint above to knock out urgent dispatches.' },
    { id: 'coffee', icon: Coffee, color: '#B45309', bg: 'bg-amber-50', label: 'Need Coffee', tip: 'Grab a quick breather and send a quick shoutout to boost team morale!' },
];

const QUIZ_BANK = [
    {
        id: 'q1',
        q: 'What is the fastest way to verify a field agent actually arrived at a client site?',
        options: ['Phone call only', 'GPS geofence check-in + photo proof', 'End-of-week spreadsheet', 'Text message'],
        answer: 1,
        explain: 'GPS geofencing paired with timestamped photo proof verifies presence instantly with zero manual follow-up.',
    },
    {
        id: 'q2',
        q: 'Why should daily tasks include a structured safety checklist?',
        options: ['It slows down staff', 'Ensures consistent compliance & audit trail', 'Only needed once a year', 'Replaces attendance'],
        answer: 1,
        explain: 'Step-by-step checklists ensure PPE, inspections, and client sign-offs are completed accurately every visit.',
    },
    {
        id: 'q3',
        q: 'When should a new employee receive mobile login credentials?',
        options: ['Immediately during onboarding', 'After 30 days', 'Only after first payout', 'Never'],
        answer: 0,
        explain: 'Provisioning logins right in the Employees menu gets staff clocking in and logging visits on day one.',
    },
    {
        id: 'q4',
        q: 'What does Live GPS Monitoring help managers prevent most effectively?',
        options: ['Missed visits & route delays', 'Weather changes', 'Printer jams', 'Software updates'],
        answer: 0,
        explain: 'Real-time visibility lets supervisors spot idle gaps early and reroute nearby field staff before SLAs slip.',
    },
    {
        id: 'q5',
        q: 'What is the best habit at the start of every operations shift?',
        options: ['Wait until evening to check status', 'Confirm check-ins & assign urgent tasks', 'Skip site reviews', 'Disable notifications'],
        answer: 1,
        explain: 'Reviewing morning attendance and dispatching priority work orders sets up high on-time completion rates.',
    },
    {
        id: 'q6',
        q: 'Why capture client OTP or digital sign-off on task completion?',
        options: ['Extra paperwork', 'Eliminates billing disputes & proves handover', 'Only for large teams', 'Hides visit history'],
        answer: 1,
        explain: 'Verified digital sign-offs give both clients and admins indisputable proof of service completion.',
    },
];

const WHEEL_SLICES = [
    { id: 'shoutout', label: 'Team Shoutout', color: '#0F766E', prompt: 'Send a quick Kudos badge to recognize a teammate for today’s effort!' },
    { id: 'safety', label: 'Safety Spot Check', color: '#2563EB', prompt: 'Verify safety checklists on your next active work order.' },
    { id: 'route', label: 'Map Sync', color: '#7C3AED', prompt: 'Open Live GPS Map and check active field coverage across zones.' },
    { id: 'coffee', label: '2-Min Breather', color: '#D97706', prompt: 'Stretch, hydrate, and reset your focus before the next dispatch.' },
    { id: 'photo', label: 'Photo Audit', color: '#DB2777', prompt: 'Review recent visit reports and inspect site photo quality.' },
    { id: 'goal', label: 'Zero-Overdue Push', color: '#059669', prompt: 'Pick one pending task and assign a clear deadline right now.' },
];

const KUDOS_BADGES = [
    { id: 'mvp', icon: Trophy, color: '#D97706', bg: 'bg-amber-50', label: 'Shift MVP' },
    { id: 'safety', icon: ShieldCheck, color: '#059669', bg: 'bg-emerald-50', label: 'Safety Star' },
    { id: 'fast', icon: Zap, color: '#2563EB', bg: 'bg-blue-50', label: 'Fast Response' },
    { id: 'hero', icon: Star, color: '#7C3AED', bg: 'bg-violet-50', label: 'Client Hero' },
];

const readJson = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

export default function InteractiveOpsLab({
    storagePrefix,
    stats = {},
    growthData = [],
    labels = {},
    currentIndustry,
    onEarnXp,
}) {
    const { t } = useTranslation();

    // Left card tabs: 'missions' | 'pulse'
    const [leftTab, setLeftTab] = useState('missions');
    const [chartMetric, setChartMetric] = useState('val'); // 'val' (Visits) | 'rev' (Tasks)
    const [selectedDayIdx, setSelectedDayIdx] = useState(null);

    // Custom personal shift checklist (persisted per company)
    const checklistKey = `${storagePrefix}_shift_checklist`;
    const [customTodos, setCustomTodos] = useState(() => readJson(checklistKey, []));
    const [newTodoText, setNewTodoText] = useState('');

    // Right card tabs: 'mood' | 'quiz' | 'wheel' | 'kudos'
    const [funTab, setFunTab] = useState('mood');

    // 1. Shift Mood state (persisted per company & date)
    const todayKey = new Date().toISOString().slice(0, 10);
    const moodStorageKey = `${storagePrefix}_mood_log`;
    const [moodLog, setMoodLog] = useState(() => readJson(moodStorageKey, {}));
    const todayMoodId = moodLog[todayKey] || null;

    // 2. Quiz state
    const [quizIndex, setQuizIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [quizStreak, setQuizStreak] = useState(0);

    // 3. Spin the Wheel state
    const [wheelRotation, setWheelRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [spinResult, setSpinResult] = useState(null);

    // 4. Kudos Wall + Shift Scratchpad (persisted per company — starts completely empty for fresh companies!)
    const kudosKey = `${storagePrefix}_kudos_wall`;
    const noteKey = `${storagePrefix}_shift_note`;
    const [kudosList, setKudosList] = useState(() => readJson(kudosKey, []));
    const [kudosBadge, setKudosBadge] = useState(KUDOS_BADGES[0].id);
    const [kudosTarget, setKudosTarget] = useState('');
    const [kudosMsg, setKudosMsg] = useState('');
    const [shiftNote, setShiftNote] = useState(() => {
        try {
            return localStorage.getItem(noteKey) || '';
        } catch {
            return '';
        }
    });

    // Reload company-scoped state if company switches
    useEffect(() => {
        setCustomTodos(readJson(checklistKey, []));
        setMoodLog(readJson(moodStorageKey, {}));
        setKudosList(readJson(kudosKey, []));
        try {
            setShiftNote(localStorage.getItem(noteKey) || '');
        } catch {
            setShiftNote('');
        }
    }, [checklistKey, moodStorageKey, kudosKey, noteKey]);

    // Real-data Launch Quest milestones
    const launchQuests = useMemo(() => [
        {
            id: 'q-emp',
            title: t('Add your first {{agent}}', { agent: t(labels.navAgents || 'Agent') }),
            xp: 50,
            done: (stats?.totalEmployees ?? 0) > 0,
            href: '/admin/employees/create',
            cta: t('Add'),
        },
        {
            id: 'q-site',
            title: t('Register your first {{entity}}', { entity: t(labels.entityTitle || 'Site') }),
            xp: 50,
            done: (stats?.totalFarmers ?? 0) > 0,
            href: '/admin/farmers/register',
            cta: t('Register'),
        },
        {
            id: 'q-task',
            title: t('Assign your first work order'),
            xp: 50,
            done: ((stats?.activeWorkOrders ?? 0) + (stats?.completedWorkOrders ?? 0)) > 0,
            href: '/admin/tasks',
            cta: t('Create'),
        },
        {
            id: 'q-visit',
            title: t('Complete first verified site visit'),
            xp: 100,
            done: (stats?.totalVisits ?? 0) > 0,
            href: '/admin/visits',
            cta: t('View'),
        },
    ], [t, labels, stats]);

    const completedQuests = launchQuests.filter((q) => q.done).length;
    const questPercent = Math.round((completedQuests / launchQuests.length) * 100);

    // Custom todo handlers
    const saveTodos = (next) => {
        setCustomTodos(next);
        try {
            localStorage.setItem(checklistKey, JSON.stringify(next));
        } catch {
            // ignore
        }
    };

    const addCustomTodo = (e) => {
        e.preventDefault();
        const text = newTodoText.trim();
        if (!text) return;
        const next = [{ id: Date.now(), text, done: false }, ...customTodos].slice(0, 8);
        saveTodos(next);
        setNewTodoText('');
    };

    const toggleCustomTodo = (id) => {
        const target = customTodos.find((item) => item.id === id);
        const next = customTodos.map((item) => (item.id === id ? { ...item, done: !item.done } : item));
        saveTodos(next);
        if (target && !target.done) {
            onEarnXp?.(15, t('Shift checklist item completed! +15 XP'), true);
        }
    };

    const removeCustomTodo = (id) => {
        saveTodos(customTodos.filter((item) => item.id !== id));
    };

    // Mood handler
    const handlePickMood = (moodId) => {
        const alreadyLogged = Boolean(moodLog[todayKey]);
        const next = { ...moodLog, [todayKey]: moodId };
        setMoodLog(next);
        try {
            localStorage.setItem(moodStorageKey, JSON.stringify(next));
        } catch {
            // ignore
        }
        if (!alreadyLogged) {
            onEarnXp?.(15, t('Daily shift pulse logged! +15 XP'), true);
        }
    };

    // Quiz handlers
    const currentQuiz = QUIZ_BANK[quizIndex % QUIZ_BANK.length];
    const handleQuizSelect = (optIdx) => {
        if (selectedOption !== null) return;
        setSelectedOption(optIdx);
        if (optIdx === currentQuiz.answer) {
            setQuizStreak((s) => s + 1);
            onEarnXp?.(25, t('Correct answer! +25 XP'), true);
        } else {
            setQuizStreak(0);
        }
    };

    const nextQuizQuestion = () => {
        setSelectedOption(null);
        setQuizIndex((i) => (i + 1) % QUIZ_BANK.length);
    };

    // Spin Wheel handler
    const handleSpinWheel = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setSpinResult(null);
        const sliceCount = WHEEL_SLICES.length;
        const sliceAngle = 360 / sliceCount;
        const chosenIdx = Math.floor(Math.random() * sliceCount);
        // Align chosen slice center to top pointer (0 deg)
        const targetOffset = 360 - (chosenIdx * sliceAngle + sliceAngle / 2);
        const extraSpins = 360 * (4 + Math.floor(Math.random() * 2));
        const base = wheelRotation - (wheelRotation % 360);
        const nextRotation = base + extraSpins + targetOffset;
        setWheelRotation(nextRotation);

        setTimeout(() => {
            setIsSpinning(false);
            setSpinResult(WHEEL_SLICES[chosenIdx]);
            onEarnXp?.(20, `${t(WHEEL_SLICES[chosenIdx].label)}! +20 XP`, true);
        }, 2850);
    };

    // Kudos & Scratchpad handlers
    const handleSendKudos = (e) => {
        e.preventDefault();
        const to = kudosTarget.trim();
        const msg = kudosMsg.trim();
        if (!to || !msg) return;
        const badgeObj = KUDOS_BADGES.find((b) => b.id === kudosBadge) || KUDOS_BADGES[0];
        const entry = {
            id: Date.now(),
            to,
            msg,
            badgeId: badgeObj.id,
            badgeLabel: badgeObj.label,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        const next = [entry, ...kudosList].slice(0, 6);
        setKudosList(next);
        try {
            localStorage.setItem(kudosKey, JSON.stringify(next));
        } catch {
            // ignore
        }
        setKudosTarget('');
        setKudosMsg('');
        onEarnXp?.(20, t('Team shoutout posted! +20 XP'), true);
    };

    const handleNoteChange = (val) => {
        setShiftNote(val);
        try {
            localStorage.setItem(noteKey, val);
        } catch {
            // ignore
        }
    };

    // Chart calculations from real growthData
    const chartBars = useMemo(() => {
        const list = Array.isArray(growthData) && growthData.length > 0
            ? growthData
            : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ day, val: 0, rev: 0 }));
        const maxVal = Math.max(1, ...list.map((d) => Number(d[chartMetric] || 0)));
        return list.map((d) => {
            const v = Number(d[chartMetric] || 0);
            return {
                day: d.day,
                value: v,
                pct: v > 0 ? Math.max(14, Math.round((v / maxVal) * 100)) : 6,
            };
        });
    }, [growthData, chartMetric]);

    const totalChartValue = chartBars.reduce((acc, b) => acc + b.value, 0);
    const activeMood = MOODS.find((m) => m.id === todayMoodId) || null;

    // Build SVG wheel slice paths
    const wheelSlicesSvg = useMemo(() => {
        const n = WHEEL_SLICES.length;
        const cx = 100;
        const cy = 100;
        const r = 96;
        return WHEEL_SLICES.map((slice, idx) => {
            const startAngle = ((idx * 360) / n - 90) * (Math.PI / 180);
            const endAngle = (((idx + 1) * 360) / n - 90) * (Math.PI / 180);
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const midAngle = (startAngle + endAngle) / 2;
            const tx = cx + r * 0.62 * Math.cos(midAngle);
            const ty = cy + r * 0.62 * Math.sin(midAngle);
            const deg = (midAngle * 180) / Math.PI;
            return {
                ...slice,
                d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`,
                tx,
                ty,
                deg,
            };
        });
    }, []);

    return (
        <section className="hp-animate-in mb-8">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-hp-primary flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> {t('Interactive Command & Engagement Hub')}
                    </p>
                    <h2 className="hp-section-title mt-0.5">{t('Session Missions & Team Fun')}</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* ══════════ LEFT CARD: LAUNCH QUESTS + CUSTOM CHECKLIST + 7-DAY PULSE ══════════ */}
                <div className="hp-card overflow-hidden flex flex-col">
                    <div className="hp-card-header flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span className="hp-icon-tile !w-9 !h-9" style={{ '--glass-tint': '#0F766E', color: '#0F766E' }}>
                                {leftTab === 'missions' ? <Rocket className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                            </span>
                            <div>
                                <h3 className="hp-card-title text-base">
                                    {leftTab === 'missions' ? t('Launch Quest & Shift Goals') : t('Interactive 7-Day Pulse')}
                                </h3>
                                <p className="text-xs text-hp-muted">
                                    {leftTab === 'missions'
                                        ? `${completedQuests}/${launchQuests.length} ${t('workspace milestones unlocked')}`
                                        : `${totalChartValue} ${chartMetric === 'val' ? t('visits this week') : t('completed tasks this week')}`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 bg-hp-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setLeftTab('missions')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    leftTab === 'missions' ? 'bg-white text-hp-dark shadow-2xs' : 'text-hp-muted hover:text-hp-dark'
                                }`}
                            >
                                {t('Missions')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setLeftTab('pulse')}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    leftTab === 'pulse' ? 'bg-white text-hp-dark shadow-2xs' : 'text-hp-muted hover:text-hp-dark'
                                }`}
                            >
                                {t('7-Day Chart')}
                            </button>
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        {leftTab === 'missions' ? (
                            <>
                                {/* Progress Header */}
                                <div>
                                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                                        <span className="text-hp-dark">{t('Workspace Readiness')}</span>
                                        <span className="text-hp-primary">{questPercent}%</span>
                                    </div>
                                    <div className="w-full h-2.5 rounded-full bg-hp-gray-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-hp-primary transition-all duration-700"
                                            style={{ width: `${Math.max(4, questPercent)}%` }}
                                        />
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {launchQuests.map((q) => (
                                            <div
                                                key={q.id}
                                                className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${
                                                    q.done
                                                        ? 'bg-emerald-50/70 border-emerald-200/80'
                                                        : 'bg-white/80 border-hp-border hover:border-hp-primary/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    {q.done ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                                    ) : (
                                                        <Circle className="w-5 h-5 text-hp-gray-300 shrink-0" />
                                                    )}
                                                    <span className={`text-sm font-semibold truncate ${q.done ? 'line-through text-emerald-800' : 'text-hp-dark'}`}>
                                                        {q.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                                                        q.done ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                                    }`}>
                                                        +{q.xp} XP
                                                    </span>
                                                    {!q.done && (
                                                        <button
                                                            type="button"
                                                            onClick={() => router.visit(q.href)}
                                                            className="hp-btn hp-btn-sm hp-btn-outline !h-7 !px-2.5 !text-xs cursor-pointer"
                                                        >
                                                            {q.cta} <ArrowRight className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Interactive Quick Personal Shift Checklist */}
                                <div className="pt-3 border-t border-hp-border">
                                    <p className="text-xs font-bold uppercase tracking-wider text-hp-muted mb-2">
                                        {t('Quick Shift Checklist')}
                                    </p>
                                    <form onSubmit={addCustomTodo} className="flex items-center gap-2 mb-2.5">
                                        <input
                                            type="text"
                                            value={newTodoText}
                                            onChange={(e) => setNewTodoText(e.target.value)}
                                            placeholder={t('Add a personal shift reminder...')}
                                            className="hp-input !h-9 !text-xs flex-1"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newTodoText.trim()}
                                            className="hp-btn hp-btn-sm hp-btn-primary !h-9 !px-3 cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>{t('Add')}</span>
                                        </button>
                                    </form>
                                    {customTodos.length === 0 ? (
                                        <p className="text-xs text-hp-muted italic">
                                            {t('Add quick shift tasks here and check them off for +15 XP each.')}
                                        </p>
                                    ) : (
                                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                                            {customTodos.map((item) => (
                                                <div key={item.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-white/75 border border-hp-border">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleCustomTodo(item.id)}
                                                        className="flex items-center gap-2 text-left min-w-0 flex-1 cursor-pointer"
                                                    >
                                                        {item.done ? (
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                                        ) : (
                                                            <Circle className="w-4 h-4 text-hp-gray-400 shrink-0" />
                                                        )}
                                                        <span className={`text-xs font-semibold truncate ${item.done ? 'line-through text-hp-muted' : 'text-hp-dark'}`}>
                                                            {item.text}
                                                        </span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeCustomTodo(item.id)}
                                                        className="text-hp-muted hover:text-rose-600 p-1 cursor-pointer"
                                                        aria-label={t('Delete')}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            /* Interactive 7-Day Chart */
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex items-center justify-between gap-2 mb-4">
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setChartMetric('val')}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                                                chartMetric === 'val'
                                                    ? 'bg-hp-primary text-white border-hp-primary'
                                                    : 'bg-white text-hp-muted border-hp-border hover:text-hp-dark'
                                            }`}
                                        >
                                            {t('Site Visits')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setChartMetric('rev')}
                                            className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                                                chartMetric === 'rev'
                                                    ? 'bg-hp-primary text-white border-hp-primary'
                                                    : 'bg-white text-hp-muted border-hp-border hover:text-hp-dark'
                                            }`}
                                        >
                                            {t('Tasks Done')}
                                        </button>
                                    </div>
                                    {selectedDayIdx !== null && chartBars[selectedDayIdx] && (
                                        <span className="hp-chip hp-chip-primary !text-xs">
                                            {t(chartBars[selectedDayIdx].day)}: {chartBars[selectedDayIdx].value}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-7 gap-2.5 items-end h-48 pt-6 pb-2 px-2 bg-hp-gray-50/80 rounded-2xl border border-hp-border">
                                    {chartBars.map((bar, idx) => {
                                        const isSelected = selectedDayIdx === idx;
                                        return (
                                            <button
                                                key={bar.day + idx}
                                                type="button"
                                                onClick={() => setSelectedDayIdx(isSelected ? null : idx)}
                                                className="flex flex-col items-center justify-end h-full group cursor-pointer"
                                            >
                                                <span className={`text-[11px] font-extrabold mb-1.5 transition-opacity ${
                                                    isSelected || bar.value > 0 ? 'opacity-100 text-hp-dark' : 'opacity-60 text-hp-muted'
                                                }`}>
                                                    {bar.value}
                                                </span>
                                                <div className="w-full max-w-[34px] flex-1 flex items-end justify-center">
                                                    <div
                                                        className={`w-full rounded-t-xl transition-all duration-500 ${
                                                            bar.value > 0
                                                                ? isSelected
                                                                    ? 'bg-hp-dark shadow-md scale-x-105'
                                                                    : 'bg-hp-primary group-hover:bg-hp-primary-hover'
                                                                : 'bg-hp-gray-200 group-hover:bg-hp-gray-300'
                                                        }`}
                                                        style={{ height: `${bar.pct}%` }}
                                                    />
                                                </div>
                                                <span className={`text-[11px] font-bold mt-2 ${isSelected ? 'text-hp-primary' : 'text-hp-muted'}`}>
                                                    {t(bar.day)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                <p className="text-xs text-hp-muted mt-3">
                                    {totalChartValue === 0
                                        ? t('Real-time 7-day activity bars light up automatically as your team completes visits and tasks.')
                                        : t('Click any day bar to inspect daily throughput across your workspace.')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ══════════ RIGHT CARD: FUN ACTIVITIES & TEAM ENERGY DECK ══════════ */}
                <div className="hp-card overflow-hidden flex flex-col">
                    <div className="hp-card-header flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span className="hp-icon-tile !w-9 !h-9" style={{ '--glass-tint': '#7C3AED', color: '#7C3AED' }}>
                                <Trophy className="w-4 h-4" />
                            </span>
                            <div>
                                <h3 className="hp-card-title text-base">{t('Fun & Team Energy Deck')}</h3>
                                <p className="text-xs text-hp-muted">{t('Interactive pulse checks, trivia, standup wheel & shoutouts')}</p>
                            </div>
                        </div>

                        <div className="flex items-center flex-wrap gap-1 bg-hp-gray-100 p-1 rounded-xl">
                            {[
                                { id: 'mood', icon: Smile, label: 'Mood' },
                                { id: 'quiz', icon: Brain, label: 'Quiz' },
                                { id: 'wheel', icon: Dices, label: 'Spin' },
                                { id: 'kudos', icon: HeartHandshake, label: 'Kudos' },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const active = funTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setFunTab(tab.id)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                            active ? 'bg-white text-hp-dark shadow-2xs' : 'text-hp-muted hover:text-hp-dark'
                                        }`}
                                    >
                                        <Icon className="w-3.5 h-3.5" />
                                        <span>{t(tab.label)}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                        {/* TAB 1: DAILY SHIFT MOOD CHECK-IN */}
                        {funTab === 'mood' && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-bold text-hp-dark">{t('How is today’s shift energy feeling?')}</h4>
                                    <p className="text-xs text-hp-muted mt-0.5">{t('Tap your vibe to log today’s pulse and unlock a tailored ops tip (+15 XP).')}</p>
                                </div>

                                <div className="grid grid-cols-5 gap-2">
                                    {MOODS.map((m) => {
                                        const selected = todayMoodId === m.id;
                                        const MoodIcon = m.icon;
                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => handlePickMood(m.id)}
                                                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all cursor-pointer ${
                                                    selected
                                                        ? 'bg-hp-primary-light border-hp-primary scale-105 shadow-sm'
                                                        : 'bg-white/80 border-hp-border hover:border-hp-primary/50 hover:-translate-y-0.5'
                                                }`}
                                            >
                                                <span
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.bg}`}
                                                    style={{ color: m.color }}
                                                >
                                                    <MoodIcon className="w-4.5 h-4.5" strokeWidth={2.2} />
                                                </span>
                                                <span className={`text-[11px] font-bold mt-2 text-center leading-tight ${selected ? 'text-hp-primary' : 'text-hp-dark'}`}>
                                                    {t(m.label)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {activeMood ? (() => {
                                    const ActiveMoodIcon = activeMood.icon;
                                    return (
                                        <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
                                            <span
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${activeMood.bg}`}
                                                style={{ color: activeMood.color }}
                                            >
                                                <ActiveMoodIcon className="w-4.5 h-4.5" strokeWidth={2.2} />
                                            </span>
                                            <div>
                                                <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                                                    {t('Today’s Shift Vibe')}: {t(activeMood.label)}
                                                </p>
                                                <p className="text-sm text-emerald-950 font-medium mt-1 leading-snug">
                                                    {t(activeMood.tip)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <div className="p-3.5 rounded-2xl bg-hp-gray-50 border border-hp-border text-xs text-hp-muted">
                                        {t('Select a shift status above to check in for today’s session.')}
                                    </div>
                                )}

                                {/* Quick Scratchpad preview at bottom of Mood tab */}
                                <div className="pt-2 border-t border-hp-border">
                                    <label className="flex items-center gap-1.5 text-xs font-bold text-hp-muted mb-1.5">
                                        <StickyNote className="w-3.5 h-3.5 text-amber-500" /> {t('Quick Shift Scratchpad')}
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={shiftNote}
                                        onChange={(e) => handleNoteChange(e.target.value)}
                                        placeholder={t('Jot down quick handover notes, phone numbers, or gate codes (auto-saved)...')}
                                        className="hp-input !h-auto !py-2 !text-xs w-full resize-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* TAB 2: FIELD OPS MICRO-QUIZ */}
                        {funTab === 'quiz' && (
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="hp-chip hp-chip-primary !text-[11px]">
                                        {t('Question')} {(quizIndex % QUIZ_BANK.length) + 1}/{QUIZ_BANK.length}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-orange-600">
                                        <Flame className="w-3.5 h-3.5" /> {t('Streak')}: {quizStreak}
                                    </span>
                                </div>

                                <h4 className="text-[15px] font-bold text-hp-dark leading-snug">
                                    {t(currentQuiz.q)}
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {currentQuiz.options.map((opt, idx) => {
                                        const picked = selectedOption === idx;
                                        const isCorrect = idx === currentQuiz.answer;
                                        let cls = 'bg-white/85 border-hp-border text-hp-dark hover:border-hp-primary';
                                        if (selectedOption !== null) {
                                            if (isCorrect) cls = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                                            else if (picked) cls = 'bg-rose-50 border-rose-400 text-rose-900';
                                            else cls = 'bg-hp-gray-50 border-hp-border text-hp-muted opacity-70';
                                        }
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                disabled={selectedOption !== null}
                                                onClick={() => handleQuizSelect(idx)}
                                                className={`flex items-center justify-between gap-2 text-left px-3.5 py-2.5 rounded-xl border text-xs sm:text-[13px] font-semibold transition-all cursor-pointer disabled:cursor-default ${cls}`}
                                            >
                                                <span>{t(opt)}</span>
                                                {selectedOption !== null && isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                                                {selectedOption !== null && picked && !isCorrect && <X className="w-4 h-4 text-rose-600 shrink-0" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {selectedOption !== null && (
                                    <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        <p className="text-xs text-slate-200 leading-relaxed">
                                            <span className="font-bold text-emerald-400 mr-1">
                                                {selectedOption === currentQuiz.answer ? t('Spot on!') : t('Good to know:')}
                                            </span>
                                            {t(currentQuiz.explain)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={nextQuizQuestion}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shrink-0 cursor-pointer"
                                        >
                                            {t('Next Question')} →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB 3: STANDUP SPIN WHEEL */}
                        {funTab === 'wheel' && (
                            <div className="flex flex-col sm:flex-row items-center gap-5">
                                <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                                    {/* Top Pointer Triangle */}
                                    <div
                                        className="absolute -top-1.5 left-1/2 -translate-x-1/2 z-20 w-0 h-0"
                                        style={{
                                            borderLeft: '9px solid transparent',
                                            borderRight: '9px solid transparent',
                                            borderTop: '14px solid #1A1D24',
                                        }}
                                    />
                                    <svg
                                        viewBox="0 0 200 200"
                                        className="w-44 h-44 drop-shadow-md"
                                        style={{
                                            transform: `rotate(${wheelRotation}deg)`,
                                            transition: isSpinning ? 'transform 2.8s cubic-bezier(0.12, 0.85, 0.22, 1)' : 'none',
                                        }}
                                    >
                                        {wheelSlicesSvg.map((s) => (
                                            <g key={s.id}>
                                                <path d={s.d} fill={s.color} stroke="#ffffff" strokeWidth="2" />
                                                <text
                                                    x={s.tx}
                                                    y={s.ty}
                                                    fill="#ffffff"
                                                    fontSize="8.5"
                                                    fontWeight="700"
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    transform={`rotate(${s.deg}, ${s.tx}, ${s.ty})`}
                                                >
                                                    {t(s.label).slice(0, 13)}
                                                </text>
                                            </g>
                                        ))}
                                        <circle cx="100" cy="100" r="18" fill="#1A1D24" stroke="#ffffff" strokeWidth="3" />
                                        <circle cx="100" cy="100" r="6" fill="#10B981" />
                                    </svg>
                                </div>

                                <div className="flex-1 text-center sm:text-left space-y-3">
                                    <div>
                                        <h4 className="text-base font-extrabold text-hp-dark">{t('Standup Activity Spinner')}</h4>
                                        <p className="text-xs text-hp-muted mt-1 leading-relaxed">
                                            {t('Spin the wheel during daily briefings to pick a quick team boost or quality micro-challenge (+20 XP).')}
                                        </p>
                                    </div>

                                    {spinResult && (
                                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                                            <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 inline-flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {t(spinResult.label)}
                                            </p>
                                            <p className="text-xs text-emerald-950 font-medium mt-1">
                                                {t(spinResult.prompt)}
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleSpinWheel}
                                        disabled={isSpinning}
                                        className="hp-btn hp-btn-primary !rounded-full !px-5 cursor-pointer"
                                    >
                                        <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                                        <span>{isSpinning ? t('Spinning...') : t('Spin the Wheel')}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: TEAM KUDOS / SHOUTOUT WALL */}
                        {funTab === 'kudos' && (
                            <div className="space-y-3.5">
                                <form onSubmit={handleSendKudos} className="space-y-2.5">
                                    <div className="flex flex-wrap gap-1.5">
                                        {KUDOS_BADGES.map((b) => {
                                            const BadgeIcon = b.icon;
                                            return (
                                                <button
                                                    key={b.id}
                                                    type="button"
                                                    onClick={() => setKudosBadge(b.id)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                                        kudosBadge === b.id
                                                            ? 'bg-hp-primary-light text-hp-primary border-hp-primary'
                                                            : 'bg-white text-hp-muted border-hp-border hover:text-hp-dark'
                                                    }`}
                                                >
                                                    <BadgeIcon className="w-3.5 h-3.5" style={{ color: b.color }} />
                                                    <span>{t(b.label)}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                        <input
                                            type="text"
                                            value={kudosTarget}
                                            onChange={(e) => setKudosTarget(e.target.value)}
                                            placeholder={t('Teammate name...')}
                                            className="hp-input !h-9 !text-xs"
                                        />
                                        <div className="sm:col-span-2 flex gap-2">
                                            <input
                                                type="text"
                                                value={kudosMsg}
                                                onChange={(e) => setKudosMsg(e.target.value)}
                                                placeholder={t('Say thanks for great field work...')}
                                                className="hp-input !h-9 !text-xs flex-1"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!kudosTarget.trim() || !kudosMsg.trim()}
                                                className="hp-btn hp-btn-sm hp-btn-primary !h-9 !px-3 cursor-pointer"
                                            >
                                                <Send className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                    {kudosList.length === 0 ? (
                                        <div className="p-4 rounded-xl bg-hp-gray-50 border border-hp-border text-center">
                                            <Award className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                                            <p className="text-xs font-bold text-hp-dark">{t('No shoutouts posted yet')}</p>
                                            <p className="text-[11px] text-hp-muted mt-0.5">{t('Celebrate a teammate’s win to kick off the kudos board!')}</p>
                                        </div>
                                    ) : (
                                        kudosList.map((k) => {
                                            const badgeMeta = KUDOS_BADGES.find((b) => b.id === k.badgeId || b.label === k.badgeLabel) || KUDOS_BADGES[0];
                                            const KudosIcon = badgeMeta.icon;
                                            return (
                                                <div key={k.id} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/85 border border-hp-border">
                                                    <span
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${badgeMeta.bg}`}
                                                        style={{ color: badgeMeta.color }}
                                                    >
                                                        <KudosIcon className="w-3.5 h-3.5" />
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-xs font-extrabold text-hp-dark truncate">
                                                                {k.to} <span className="font-semibold text-hp-primary">• {t(k.badgeLabel)}</span>
                                                            </p>
                                                            <span className="text-[10px] text-hp-muted shrink-0">{k.time}</span>
                                                        </div>
                                                        <p className="text-xs text-hp-muted mt-0.5">{k.msg}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
