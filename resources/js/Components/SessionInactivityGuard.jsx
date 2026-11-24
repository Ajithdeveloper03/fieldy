import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePage, router } from '@inertiajs/react';
import { ShieldAlert, Clock, LogOut, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { withBase } from '../basePath';

const IDLE_THRESHOLD_SEC = 60; // Mark user Idle after 60s without input
const ACTIVITY_KEY = 'fieldy_portal_last_activity_ts';
const ACTIVE_ACC_KEY = 'fieldy_portal_active_secs';
const IDLE_ACC_KEY = 'fieldy_portal_idle_secs';

const getCsrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

const postSessionEndpoint = async (path, payload = {}) => {
    const url = withBase(path);
    if (window.axios) {
        return window.axios.post(url, payload);
    }
    const res = await fetch(url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-CSRF-TOKEN': getCsrf(),
        },
        body: JSON.stringify(payload),
    });
    return { status: res.status, data: await res.json().catch(() => ({})) };
};

const formatCountdown = (sec) => {
    const clamped = Math.max(0, Math.floor(sec));
    const m = Math.floor(clamped / 60);
    const s = clamped % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export default function SessionInactivityGuard() {
    const { props } = usePage();
    const { t } = useTranslation();
    const user = props.auth?.user;
    const security = props.sessionSecurity;

    const timeoutSeconds = Number(security?.timeoutSeconds || 900);
    const warningSeconds = Number(security?.warningSeconds || 120);

    const lastInteractionRef = useRef(Date.now());
    const lastHeartbeatRef = useRef(Date.now());
    const isIdleRef = useRef(false);
    const idleStartedAtRef = useRef(null);
    const loggingOutRef = useRef(false);
    const showWarningRef = useRef(false);
    const extendingRef = useRef(false);

    const [showWarning, setShowWarning] = useState(false);
    const [remainingSec, setRemainingSec] = useState(timeoutSeconds);
    const [extending, setExtending] = useState(false);

    const updateShowWarning = useCallback((val) => {
        showWarningRef.current = val;
        setShowWarning(val);
    }, []);

    const triggerTimeoutLogout = useCallback(async (idleSecs) => {
        if (loggingOutRef.current) return;
        loggingOutRef.current = true;
        try {
            const res = await postSessionEndpoint('/portal/session/timeout-logout', {
                idle_seconds: Math.round(idleSecs),
            });
            const redirectTo = res?.data?.redirect || withBase('/admin/login?reason=inactivity');
            window.location.href = redirectTo;
        } catch {
            window.location.href = withBase('/admin/login?reason=inactivity');
        }
    }, []);

    const extendSession = useCallback(async (fromWarning = false) => {
        if (extendingRef.current) return;
        extendingRef.current = true;
        setExtending(true);
        const now = Date.now();
        const idleSecs = idleStartedAtRef.current ? Math.floor((now - idleStartedAtRef.current) / 1000) : 0;
        lastInteractionRef.current = now;
        lastHeartbeatRef.current = now;
        isIdleRef.current = false;
        idleStartedAtRef.current = null;
        updateShowWarning(false);
        setRemainingSec(timeoutSeconds);
        try {
            localStorage.setItem(ACTIVITY_KEY, String(now));
        } catch {
            // ignore
        }
        try {
            await postSessionEndpoint('/portal/session/heartbeat', {
                extended: fromWarning,
                idle_seconds: idleSecs,
            });
            window.dispatchEvent(new CustomEvent('fieldy:session-refresh'));
        } catch {
            // ignore
        } finally {
            extendingRef.current = false;
            setExtending(false);
        }
    }, [timeoutSeconds, updateShowWarning]);

    const manualLogout = useCallback(() => {
        updateShowWarning(false);
        router.post(withBase('/admin/logout'));
    }, [updateShowWarning]);

    const userId = user?.id;

    useEffect(() => {
        if (!userId) return;

        const nowInit = Date.now();
        lastInteractionRef.current = nowInit;
        try {
            localStorage.setItem(ACTIVITY_KEY, String(nowInit));
        } catch {
            // ignore
        }

        let lastThrottle = 0;
        const onUserActivity = () => {
            const now = Date.now();
            if (now - lastThrottle < 2000) return;
            lastThrottle = now;

            // If user was idle and starts moving again (before warning modal locks interaction)
            if (isIdleRef.current && !showWarningRef.current) {
                const idleDuration = idleStartedAtRef.current
                    ? Math.max(1, Math.floor((now - idleStartedAtRef.current) / 1000))
                    : IDLE_THRESHOLD_SEC;
                isIdleRef.current = false;
                idleStartedAtRef.current = null;
                postSessionEndpoint('/portal/session/idle-event', {
                    state: 'resumed',
                    idle_seconds: idleDuration,
                })
                    .then(() => window.dispatchEvent(new CustomEvent('fieldy:session-refresh')))
                    .catch(() => {});
            }

            if (!showWarningRef.current) {
                lastInteractionRef.current = now;
                try {
                    localStorage.setItem(ACTIVITY_KEY, String(now));
                } catch {
                    // ignore
                }
                // Keep server session warm every 3 minutes while actively interacting
                if (now - lastHeartbeatRef.current >= 180000) {
                    lastHeartbeatRef.current = now;
                    postSessionEndpoint('/portal/session/heartbeat', { extended: false }).catch(() => {});
                }
            }
        };

        const onStorageSync = (e) => {
            if (e.key === ACTIVITY_KEY && e.newValue) {
                const ts = parseInt(e.newValue, 10);
                if (!Number.isNaN(ts) && ts > lastInteractionRef.current) {
                    lastInteractionRef.current = ts;
                    isIdleRef.current = false;
                    idleStartedAtRef.current = null;
                    updateShowWarning(false);
                }
            }
        };

        const onForceExtend = () => {
            void extendSession(true);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach((ev) => window.addEventListener(ev, onUserActivity, { passive: true }));
        window.addEventListener('storage', onStorageSync);
        window.addEventListener('fieldy:extend-session', onForceExtend);

        const ticker = window.setInterval(() => {
            const now = Date.now();
            const idleSecs = Math.max(0, Math.floor((now - lastInteractionRef.current) / 1000));
            const remaining = Math.max(0, timeoutSeconds - idleSecs);
            setRemainingSec(remaining);

            // Accumulate per-session active vs idle counters
            let activeAcc = 0;
            let idleAcc = 0;
            try {
                activeAcc = parseInt(sessionStorage.getItem(ACTIVE_ACC_KEY) || '0', 10) || 0;
                idleAcc = parseInt(sessionStorage.getItem(IDLE_ACC_KEY) || '0', 10) || 0;
                if (idleSecs >= IDLE_THRESHOLD_SEC) {
                    idleAcc += 1;
                    sessionStorage.setItem(IDLE_ACC_KEY, String(idleAcc));
                } else {
                    activeAcc += 1;
                    sessionStorage.setItem(ACTIVE_ACC_KEY, String(activeAcc));
                }
            } catch {
                // ignore
            }

            // Transition into idle state at 60s of inactivity
            if (idleSecs >= IDLE_THRESHOLD_SEC && !isIdleRef.current) {
                isIdleRef.current = true;
                idleStartedAtRef.current = lastInteractionRef.current + IDLE_THRESHOLD_SEC * 1000;
                postSessionEndpoint('/portal/session/idle-event', {
                    state: 'idle',
                    idle_seconds: idleSecs,
                })
                    .then(() => window.dispatchEvent(new CustomEvent('fieldy:session-refresh')))
                    .catch(() => {});
            }

            // Publish live session state for Dashboard widgets
            const liveState = {
                isIdle: idleSecs >= IDLE_THRESHOLD_SEC,
                idleSeconds: idleSecs,
                remainingSeconds: remaining,
                timeoutSeconds,
                activeTotalSeconds: activeAcc,
                idleTotalSeconds: idleAcc,
            };
            window.__FIELDY_SESSION_STATE__ = liveState;
            window.dispatchEvent(new CustomEvent('fieldy:session-tick', { detail: liveState }));

            // Show warning modal when entering warning threshold
            if (remaining <= warningSeconds && remaining > 0 && !showWarningRef.current) {
                updateShowWarning(true);
            }

            // Auto-logout when countdown expires
            if (remaining <= 0) {
                void triggerTimeoutLogout(idleSecs);
            }
        }, 1000);

        return () => {
            events.forEach((ev) => window.removeEventListener(ev, onUserActivity));
            window.removeEventListener('storage', onStorageSync);
            window.removeEventListener('fieldy:extend-session', onForceExtend);
            window.clearInterval(ticker);
        };
    }, [userId, timeoutSeconds, warningSeconds, extendSession, triggerTimeoutLogout, updateShowWarning]);

    if (!user || !showWarning || typeof document === 'undefined') return null;

    const pct = Math.min(100, Math.max(0, (remainingSec / warningSeconds) * 100));

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white border border-hp-border shadow-2xl overflow-hidden hp-animate-in">
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-7 h-7" />
                    </div>

                    <h3 className="text-lg font-extrabold text-hp-dark">
                        {t('Session Inactivity Warning')}
                    </h3>
                    <p className="text-xs sm:text-sm text-hp-muted mt-1.5 leading-relaxed">
                        {t('No activity has been detected. For your account security, you will be signed out automatically when the timer reaches zero.')}
                    </p>

                    {/* Countdown Display */}
                    <div className="mt-5 p-4 rounded-2xl bg-hp-gray-50 border border-hp-border">
                        <div className="inline-flex items-center gap-2 text-2xl font-mono font-extrabold text-rose-600 tabular-nums">
                            <Clock className="w-5 h-5" />
                            <span>{formatCountdown(remainingSec)}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-hp-gray-200 mt-3 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-amber-500 transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => extendSession(true)}
                            disabled={extending}
                            className="w-full sm:flex-1 hp-btn hp-btn-primary justify-center cursor-pointer"
                        >
                            <RefreshCw className={`w-4 h-4 ${extending ? 'animate-spin' : ''}`} />
                            <span>{t('Stay Signed In')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={manualLogout}
                            className="w-full sm:w-auto hp-btn hp-btn-outline justify-center cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t('Log Out Now')}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
