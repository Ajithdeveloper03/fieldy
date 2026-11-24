import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Check, ExternalLink, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

function findVisibleTarget(tourKey) {
    if (typeof document === 'undefined' || !tourKey) return null;
    const candidates = Array.from(document.querySelectorAll(`[data-tour="${tourKey}"]`));
    const vw = window.innerWidth;
    for (const el of candidates) {
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity || '1') === 0) {
            continue;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width < 4 || rect.height < 4) continue;
        // Skip elements translated off-screen (e.g. closed mobile drawer)
        if (rect.right <= 2 || rect.left >= vw - 2) continue;
        return el;
    }
    return null;
}

export default function GuidedTour({
    steps = [],
    activeStep = -1,
    onStepChange,
    onComplete,
    onPrepareStep,
}) {
    const { t } = useTranslation();
    const isOpen = activeStep >= 0 && activeStep < steps.length;
    const step = isOpen ? steps[activeStep] : null;

    const [targetRect, setTargetRect] = useState(null);
    const [cardSize, setCardSize] = useState({ width: 336, height: 210 });
    const [viewport, setViewport] = useState(() => ({
        w: typeof window !== 'undefined' ? window.innerWidth : 1280,
        h: typeof window !== 'undefined' ? window.innerHeight : 800,
    }));
    const cardRef = useRef(null);
    const activeTargetRef = useRef(null);

    const measureTarget = useCallback(() => {
        if (!step) {
            setTargetRect(null);
            activeTargetRef.current = null;
            return;
        }
        const el = findVisibleTarget(step.target);
        activeTargetRef.current = el;
        if (!el) {
            setTargetRect(null);
            return;
        }
        const r = el.getBoundingClientRect();
        setTargetRect({
            top: r.top,
            left: r.left,
            right: r.right,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
        });
    }, [step]);

    // Prepare UI (expand collapsed sidebar / group or open mobile drawer) whenever step changes
    useEffect(() => {
        if (!isOpen || !step) {
            setTargetRect(null);
            return;
        }

        if (typeof onPrepareStep === 'function') {
            onPrepareStep(step);
        }

        // Scroll target into view and re-measure across layout/drawer transition frames
        const runMeasure = (shouldScroll = false) => {
            const el = findVisibleTarget(step.target);
            if (el && shouldScroll) {
                try {
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
                } catch {
                    // ignore
                }
            }
            measureTarget();
        };

        const raf1 = requestAnimationFrame(() => runMeasure(true));
        const t1 = setTimeout(() => runMeasure(true), 120);
        const t2 = setTimeout(() => runMeasure(false), 340);

        return () => {
            cancelAnimationFrame(raf1);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [isOpen, activeStep, step, onPrepareStep, measureTarget]);

    // Keep anchored position locked on resize & scroll (including sidebar inner scrolling)
    useEffect(() => {
        if (!isOpen) return;
        const handleUpdate = () => {
            setViewport({ w: window.innerWidth, h: window.innerHeight });
            measureTarget();
        };
        window.addEventListener('resize', handleUpdate);
        window.addEventListener('scroll', handleUpdate, true);
        return () => {
            window.removeEventListener('resize', handleUpdate);
            window.removeEventListener('scroll', handleUpdate, true);
        };
    }, [isOpen, measureTarget]);

    // Measure actual tooltip card size so clamping works in both English & Tamil
    useLayoutEffect(() => {
        if (!isOpen || !cardRef.current) return;
        const updateCardSize = () => {
            if (!cardRef.current) return;
            const rect = cardRef.current.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                setCardSize((prev) =>
                    Math.abs(prev.width - rect.width) > 1 || Math.abs(prev.height - rect.height) > 1
                        ? { width: rect.width, height: rect.height }
                        : prev
                );
            }
        };
        updateCardSize();
        if (typeof ResizeObserver !== 'undefined') {
            const ro = new ResizeObserver(updateCardSize);
            ro.observe(cardRef.current);
            return () => ro.disconnect();
        }
    }, [isOpen, activeStep, step]);

    // Keyboard navigation (Escape, ArrowRight, ArrowLeft)
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onComplete?.();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (activeStep < steps.length - 1) onStepChange?.(activeStep + 1);
                else onComplete?.();
            } else if (e.key === 'ArrowLeft' && activeStep > 0) {
                e.preventDefault();
                onStepChange?.(activeStep - 1);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [isOpen, activeStep, steps.length, onStepChange, onComplete]);

    if (!isOpen || !step || typeof document === 'undefined') return null;

    const padX = 6;
    const padY = 4;
    const hole = targetRect
        ? {
            x: Math.max(4, targetRect.left - padX),
            y: Math.max(4, targetRect.top - padY),
            w: targetRect.width + padX * 2,
            h: targetRect.height + padY * 2,
        }
        : null;

    const vw = viewport.w;
    const vh = viewport.h;
    const cardW = Math.min(344, vw - 24);
    const cardH = cardSize.height || 210;
    const gap = 16;

    // Compute anchored popover placement + directional arrow offset
    let placement = step.placement || 'right';
    let top = Math.max(24, (vh - cardH) / 2);
    let left = Math.max(12, (vw - cardW) / 2);
    let arrowStyle = null;
    let arrowSide = null;

    if (hole) {
        const targetCenterX = hole.x + hole.w / 2;
        const targetCenterY = hole.y + hole.h / 2;

        const fitsRight = hole.x + hole.w + gap + cardW + 12 <= vw;
        const fitsLeft = hole.x - gap - cardW >= 12;
        const fitsBottom = hole.y + hole.h + gap + cardH + 12 <= vh;
        const fitsTop = hole.y - gap - cardH >= 12;

        if (placement === 'right' && !fitsRight) {
            placement = fitsBottom ? 'bottom' : fitsTop ? 'top' : fitsLeft ? 'left' : 'bottom';
        } else if (placement === 'bottom' && !fitsBottom) {
            placement = fitsTop ? 'top' : fitsLeft ? 'left' : fitsRight ? 'right' : 'top';
        } else if (placement === 'left' && !fitsLeft) {
            placement = fitsRight ? 'right' : fitsBottom ? 'bottom' : 'top';
        }

        if (placement === 'right') {
            left = hole.x + hole.w + gap;
            top = clamp(targetCenterY - cardH / 2, 16, Math.max(16, vh - cardH - 16));
            arrowSide = 'left';
            arrowStyle = { top: clamp(targetCenterY - top - 7, 22, cardH - 34) };
        } else if (placement === 'left') {
            left = Math.max(12, hole.x - gap - cardW);
            top = clamp(targetCenterY - cardH / 2, 16, Math.max(16, vh - cardH - 16));
            arrowSide = 'right';
            arrowStyle = { top: clamp(targetCenterY - top - 7, 22, cardH - 34) };
        } else if (placement === 'top') {
            top = Math.max(16, hole.y - gap - cardH);
            left = clamp(targetCenterX - cardW / 2, 12, Math.max(12, vw - cardW - 12));
            arrowSide = 'bottom';
            arrowStyle = { left: clamp(targetCenterX - left - 7, 24, cardW - 36) };
        } else {
            // bottom
            top = clamp(hole.y + hole.h + gap, 16, Math.max(16, vh - cardH - 16));
            left = clamp(targetCenterX - cardW / 2, 12, Math.max(12, vw - cardW - 12));
            arrowSide = 'top';
            arrowStyle = { left: clamp(targetCenterX - left - 7, 24, cardW - 36) };
        }
    }

    const isLast = activeStep === steps.length - 1;

    const handleNext = () => {
        if (isLast) onComplete?.();
        else onStepChange?.(activeStep + 1);
    };

    const handleOpenAndNext = () => {
        const nextIdx = activeStep + 1;
        if (nextIdx >= steps.length) {
            onComplete?.();
        } else {
            onStepChange?.(nextIdx);
        }
        if (step.href) {
            router.visit(step.href);
        }
    };

    const maskId = 'fieldy-guided-tour-spotlight-mask';

    return createPortal(
        <div className="fixed inset-0 z-[9990] pointer-events-none" role="dialog" aria-modal="false" aria-label={t('Interactive Guided Tour')}>
            {/* Smooth SVG spotlight cutout overlay */}
            <svg className="fixed inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                <defs>
                    <mask id={maskId}>
                        <rect x="0" y="0" width="100%" height="100%" fill="white" />
                        {hole && (
                            <rect
                                x={hole.x}
                                y={hole.y}
                                width={hole.w}
                                height={hole.h}
                                rx="14"
                                ry="14"
                                fill="black"
                            />
                        )}
                    </mask>
                </defs>
                <rect
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    fill="rgba(15, 23, 42, 0.58)"
                    mask={`url(#${maskId})`}
                />
            </svg>

            {/* Click shields around the cutout so background stays safe while highlighted item remains directly clickable */}
            {hole ? (
                <>
                    <div className="fixed left-0 top-0 right-0 pointer-events-auto" style={{ height: hole.y }} />
                    <div className="fixed left-0 bottom-0 right-0 pointer-events-auto" style={{ top: hole.y + hole.h }} />
                    <div className="fixed left-0 pointer-events-auto" style={{ top: hole.y, width: hole.x, height: hole.h }} />
                    <div className="fixed right-0 pointer-events-auto" style={{ top: hole.y, left: hole.x + hole.w, height: hole.h }} />
                </>
            ) : (
                <div className="fixed inset-0 pointer-events-auto" />
            )}

            {/* Glowing animated highlight ring around the exact target element */}
            {hole && (
                <div
                    className="fixed pointer-events-none rounded-[14px] transition-all duration-300 ease-out"
                    style={{
                        top: hole.y,
                        left: hole.x,
                        width: hole.w,
                        height: hole.h,
                        border: '2.5px solid #10b981',
                        boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.28), 0 0 28px rgba(16, 185, 129, 0.48)',
                    }}
                >
                    <span className="absolute -inset-1 rounded-[16px] border border-emerald-400/60 animate-pulse" />
                </div>
            )}

            {/* Anchored Coachmark Popover */}
            <div
                ref={cardRef}
                className="fixed z-[9995] pointer-events-auto bg-slate-900/95 backdrop-blur-xl text-white rounded-2xl border border-emerald-400/50 shadow-[0_24px_60px_rgba(2,6,23,0.55)] p-4.5 transition-all duration-300 ease-out"
                style={{
                    top,
                    left,
                    width: cardW,
                }}
            >
                {/* Directional Pointer Arrow */}
                {arrowSide === 'left' && (
                    <span
                        className="absolute -left-[7px] w-3.5 h-3.5 rotate-45 bg-slate-900 border-l border-b border-emerald-400/50"
                        style={arrowStyle}
                    />
                )}
                {arrowSide === 'right' && (
                    <span
                        className="absolute -right-[7px] w-3.5 h-3.5 rotate-45 bg-slate-900 border-r border-t border-emerald-400/50"
                        style={arrowStyle}
                    />
                )}
                {arrowSide === 'top' && (
                    <span
                        className="absolute -top-[7px] w-3.5 h-3.5 rotate-45 bg-slate-900 border-l border-t border-emerald-400/50"
                        style={arrowStyle}
                    />
                )}
                {arrowSide === 'bottom' && (
                    <span
                        className="absolute -bottom-[7px] w-3.5 h-3.5 rotate-45 bg-slate-900 border-r border-b border-emerald-400/50"
                        style={arrowStyle}
                    />
                )}

                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        <Sparkles className="w-3 h-3" />
                        {t('Step')} {activeStep + 1} / {steps.length}
                    </span>
                    <button
                        type="button"
                        onClick={() => onComplete?.()}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title={t('Skip tour')}
                    >
                        <span>{t('Skip')}</span>
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Title & Description */}
                <h4 className="text-[15px] font-extrabold text-white leading-snug mb-1.5">
                    {step.title}
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed mb-3.5">
                    {step.desc}
                </p>

                {/* Step Progress Dots */}
                <div className="flex items-center gap-1.5 mb-3.5">
                    {steps.map((s, i) => (
                        <button
                            key={s.id || i}
                            type="button"
                            onClick={() => onStepChange?.(i)}
                            aria-label={`${t('Step')} ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                i === activeStep
                                    ? 'w-6 bg-emerald-400'
                                    : i < activeStep
                                        ? 'w-2 bg-emerald-500/60'
                                        : 'w-2 bg-slate-600 hover:bg-slate-500'
                            }`}
                        />
                    ))}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                        {activeStep > 0 && (
                            <button
                                type="button"
                                onClick={() => onStepChange?.(activeStep - 1)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>{t('Back')}</span>
                            </button>
                        )}
                        {step.href && (
                            <button
                                type="button"
                                onClick={handleOpenAndNext}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-xs font-bold text-emerald-300 transition-colors cursor-pointer"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>{t('Open & Next →')}</span>
                            </button>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md transition-colors cursor-pointer shrink-0"
                    >
                        {isLast ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{t('Finish')}</span>
                            </>
                        ) : (
                            <>
                                <span>{t('Next')}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
