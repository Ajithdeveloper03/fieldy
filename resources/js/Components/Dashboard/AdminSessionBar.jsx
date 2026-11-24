import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Pause, RotateCcw, Trophy, Timer, Flame, Compass,
    Radio, Coffee, Megaphone, Navigation
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SHIFT_MODES = [
    { id: 'command', label: 'On Command', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Radio },
    { id: 'dispatch', label: 'Field Dispatch', dot: 'bg-sky-500', chip: 'bg-sky-50 text-sky-700 border-sky-200', icon: Navigation },
    { id: 'briefing', label: 'Team Briefing', dot: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700 border-violet-200', icon: Megaphone },
    { id: 'break', label: 'Short Break', dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700 border-amber-200', icon: Coffee },
];

const SPRINT_PRESETS = [
    { mins: 15, label: '15m' },
    { mins: 25, label: '25m' },
    { mins: 45, label: '45m' },
];

const formatClock = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
};

const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function AdminSessionBar({
    storagePrefix,
    xp = 0,
    sprintsDone = 0,
    onSprintComplete,
}) {
    const { t } = useTranslation();

    // Persistent session start timestamp per browser session & company
    const [elapsedSec, setElapsedSec] = useState(0);
    const [shiftMode, setShiftMode] = useState(() => {
        try {
            return sessionStorage.getItem(`${storagePrefix}_shift_mode`) || 'command';
        } catch {
            return 'command';
        }
    });

    // Focus sprint Pomodoro state
    const [sprintDuration, setSprintDuration] = useState(25 * 60);
    const [sprintRemaining, setSprintRemaining] = useState(25 * 60);
    const [sprintRunning, setSprintRunning] = useState(false);
    const [showSprintPicker, setShowSprintPicker] = useState(false);
    const sprintCompletedRef = useRef(false);

    // Live session clock
    useEffect(() => {
        let startMs = Date.now();
        try {
            const saved = sessionStorage.getItem(`${storagePrefix}_started_at`);
            if (saved) {
                startMs = parseInt(saved, 10) || Date.now();
            } else {
                sessionStorage.setItem(`${storagePrefix}_started_at`, String(startMs));
            }
        } catch {
            // ignore
        }

        const update = () => setElapsedSec(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [storagePrefix]);

    // Persist shift mode
    const selectShiftMode = (id) => {
        setShiftMode(id);
        try {
            sessionStorage.setItem(`${storagePrefix}_shift_mode`, id);
        } catch {
            // ignore
        }
    };

    // Focus sprint countdown
    useEffect(() => {
        if (!sprintRunning) return;
        const interval = setInterval(() => {
            setSprintRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    setSprintRunning(false);
                    if (!sprintCompletedRef.current) {
                        sprintCompletedRef.current = true;
                        onSprintComplete?.();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [sprintRunning, onSprintComplete]);

    const toggleSprint = () => {
        if (sprintRemaining === 0) {
            setSprintRemaining(sprintDuration);
        }
        sprintCompletedRef.current = false;
        setSprintRunning((r) => !r);
    };

    const resetSprint = (mins = null) => {
        const nextSec = mins ? mins * 60 : sprintDuration;
        if (mins) setSprintDuration(nextSec);
        setSprintRemaining(nextSec);
        setSprintRunning(false);
        sprintCompletedRef.current = false;
        setShowSprintPicker(false);
    };

    const currentMode = SHIFT_MODES.find((m) => m.id === shiftMode) || SHIFT_MODES[0];
    const progressPct = sprintDuration > 0 ? ((sprintDuration - sprintRemaining) / sprintDuration) * 100 : 0;

    // Gamified commander level from real XP
    const level = Math.floor(xp / 150) + 1;
    const levelProgress = Math.min(100, Math.round(((xp % 150) / 150) * 100));
    const rankLabel = level >= 4 ? 'Ops Legend' : level === 3 ? 'Ops Champion' : level === 2 ? 'Field Strategist' : 'Ops Commander';

    const replayTour = () => {
        window.dispatchEvent(new CustomEvent('fieldy:start-tour'));
    };

    return (
        <section className="hp-animate-in mb-7">
            <div className="hp-card p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
                {/* Left: Live Session Timer + Shift Status Switcher */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-hp-border shadow-2xs">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentMode.dot} opacity-75`} />
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${currentMode.dot}`} />
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-hp-muted">{t('Live Session')}</span>
                        <span className="font-mono text-sm font-extrabold text-hp-dark tabular-nums">{formatClock(elapsedSec)}</span>
                    </div>

                    {/* Interactive Shift Status Pills */}
                    <div className="flex items-center flex-wrap gap-1.5">
                        {SHIFT_MODES.map((m) => {
                            const Icon = m.icon;
                            const active = shiftMode === m.id;
                            return (
                                <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => selectShiftMode(m.id)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                        active
                                            ? `${m.chip} shadow-2xs scale-[1.02]`
                                            : 'bg-white/60 text-hp-muted border-hp-border hover:text-hp-dark hover:bg-white'
                                    }`}
                                >
                                    <Icon className="w-3.5 h-3.5" />
                                    <span>{t(m.label)}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right: Focus Sprint Timer + Session XP + Tour Shortcut */}
                <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                    {/* Interactive Focus Sprint Pomodoro */}
                    <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 border border-hp-border">
                        <button
                            type="button"
                            onClick={() => setShowSprintPicker((v) => !v)}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-hp-dark hover:text-hp-primary cursor-pointer"
                            title={t('Change Focus Sprint Duration')}
                        >
                            <Timer className={`w-4 h-4 ${sprintRunning ? 'text-hp-primary animate-pulse' : 'text-hp-muted'}`} />
                            <span className="font-mono text-sm font-extrabold tabular-nums">{formatTimer(sprintRemaining)}</span>
                        </button>

                        {/* Tiny progress bar */}
                        <div className="hidden sm:block w-12 h-1.5 rounded-full bg-hp-gray-200 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-hp-primary transition-all duration-500"
                                style={{ width: `${Math.max(4, progressPct)}%` }}
                            />
                        </div>

                        <button
                            type="button"
                            onClick={toggleSprint}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                                sprintRunning
                                    ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                    : 'bg-hp-primary text-white hover:bg-hp-primary-hover'
                            }`}
                            title={sprintRunning ? t('Pause Focus Sprint') : t('Start Focus Sprint')}
                        >
                            {sprintRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                        <button
                            type="button"
                            onClick={() => resetSprint()}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-hp-muted hover:text-hp-dark hover:bg-hp-hover transition-colors cursor-pointer"
                            title={t('Reset Sprint')}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>

                        {showSprintPicker && (
                            <div className="hp-pop absolute right-0 top-full mt-2 bg-white border border-hp-border rounded-xl shadow-[var(--shadow-hp-lg)] p-2 flex items-center gap-1.5 z-40">
                                <span className="text-[11px] font-bold text-hp-muted px-1">{t('Focus')}:</span>
                                {SPRINT_PRESETS.map((p) => (
                                    <button
                                        key={p.mins}
                                        type="button"
                                        onClick={() => resetSprint(p.mins)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                            sprintDuration === p.mins * 60
                                                ? 'bg-hp-primary text-white'
                                                : 'bg-hp-gray-100 text-hp-dark hover:bg-hp-gray-200'
                                        }`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Session XP & Rank Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50/90 border border-amber-200/80">
                        <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                        <div className="leading-tight">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-extrabold text-amber-900">Lv.{level} {t(rankLabel)}</span>
                                <span className="text-[11px] font-bold text-amber-700">{xp} XP</span>
                            </div>
                            <div className="w-24 h-1.5 rounded-full bg-amber-200/80 mt-0.5 overflow-hidden">
                                <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.max(8, levelProgress)}%` }} />
                            </div>
                        </div>
                        {sprintsDone > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[11px] font-extrabold text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded-full">
                                <Flame className="w-3 h-3" /> {sprintsDone}
                            </span>
                        )}
                    </div>

                    {/* Quick Guided Tour Trigger */}
                    <button
                        type="button"
                        onClick={replayTour}
                        className="hp-pill !h-9 !px-3 !text-xs !font-bold cursor-pointer"
                        title={t('Start interactive spotlight tour')}
                    >
                        <Compass className="w-3.5 h-3.5 text-hp-primary" />
                        <span>{t('Guided Tour')}</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
