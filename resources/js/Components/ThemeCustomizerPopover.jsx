import React, { useState, useEffect, useRef } from 'react';
import { Palette, Check, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
    DASHBOARD_THEMES,
    ICON_COLOR_SWATCHES,
    loadThemePrefs,
    applyDashboardTheme,
} from '../lib/dashboardTheme';

export default function ThemeCustomizerPopover({ darkTrigger = false }) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [prefs, setPrefs] = useState(() => loadThemePrefs());
    const wrapRef = useRef(null);

    useEffect(() => {
        applyDashboardTheme(prefs);
    }, [prefs]);

    useEffect(() => {
        const onClick = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        window.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            window.removeEventListener('keydown', onKey);
        };
    }, []);

    const updatePrefs = (patch) => setPrefs((prev) => ({ ...prev, ...patch }));

    return (
        <div className="relative" ref={wrapRef}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className={
                    darkTrigger
                        ? 'hp-dark-trigger w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 inline-flex items-center justify-center transition-all cursor-pointer'
                        : 'hp-icon-btn'
                }
                title={t('Customize Theme & Icon Colors')}
            >
                <Palette
                    className="w-5 h-5"
                    style={{ color: darkTrigger ? '#ffffff' : 'var(--hp-icon-override, var(--color-hp-primary))' }}
                />
            </button>

            {open && (
                <div className="hp-pop absolute right-0 top-full mt-2 w-72 bg-white/95 backdrop-blur-2xl border border-white rounded-2xl shadow-[var(--shadow-hp-lg)] p-3.5 z-[70] text-hp-dark">
                    {/* Accent Color Section */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-hp-muted">
                            {t('Glass Accent Color')}
                        </span>
                        <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-hp-primary cursor-pointer">
                            <span>{t('Custom')}</span>
                            <input
                                type="color"
                                value={prefs.customAccentHex}
                                onChange={(e) =>
                                    updatePrefs({
                                        themeId: 'custom',
                                        customAccentHex: e.target.value,
                                    })
                                }
                                className="w-5 h-5 rounded-full border border-hp-border cursor-pointer bg-transparent p-0"
                                title={t('Pick any accent color')}
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mb-3.5">
                        {DASHBOARD_THEMES.map((th) => {
                            const selected = prefs.themeId === th.id;
                            return (
                                <button
                                    key={th.id}
                                    type="button"
                                    onClick={() => updatePrefs({ themeId: th.id })}
                                    className={`flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                        selected
                                            ? 'bg-hp-primary-light text-hp-primary border-hp-primary-border'
                                            : 'bg-white/70 text-hp-dark border-transparent hover:bg-hp-gray-50'
                                    }`}
                                >
                                    <span className="flex items-center gap-2 truncate">
                                        <span
                                            className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-white shadow-xs"
                                            style={{ backgroundColor: th.hex }}
                                        />
                                        <span className="truncate">{t(th.name)}</span>
                                    </span>
                                    {selected && <Check className="w-3.5 h-3.5 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Icon Color Section */}
                    <div className="border-t border-hp-border pt-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-hp-muted">
                                {t('Icon Color')}
                            </span>
                            <label className="inline-flex items-center gap-1.5 text-[11px] font-bold text-hp-primary cursor-pointer">
                                <span>{t('Custom')}</span>
                                <input
                                    type="color"
                                    value={
                                        prefs.iconColor && prefs.iconColor.startsWith('#')
                                            ? prefs.iconColor
                                            : prefs.customAccentHex
                                    }
                                    onChange={(e) => updatePrefs({ iconColor: e.target.value })}
                                    className="w-5 h-5 rounded-full border border-hp-border cursor-pointer bg-transparent p-0"
                                    title={t('Pick any icon color')}
                                />
                            </label>
                        </div>

                        {/* Mode toggles: Match Theme vs Multi-Color */}
                        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                            <button
                                type="button"
                                onClick={() => updatePrefs({ iconColor: 'match' })}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                    prefs.iconColor === 'match'
                                        ? 'bg-hp-primary-light text-hp-primary border-hp-primary-border'
                                        : 'bg-hp-gray-50 text-hp-gray border-transparent hover:bg-hp-gray-100'
                                }`}
                            >
                                {t('Match Theme')}
                            </button>
                            <button
                                type="button"
                                onClick={() => updatePrefs({ iconColor: 'multi' })}
                                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border inline-flex items-center justify-center gap-1 ${
                                    prefs.iconColor === 'multi'
                                        ? 'bg-hp-primary-light text-hp-primary border-hp-primary-border'
                                        : 'bg-hp-gray-50 text-hp-gray border-transparent hover:bg-hp-gray-100'
                                }`}
                            >
                                <Sparkles className="w-3 h-3" />
                                {t('Multi-Color')}
                            </button>
                        </div>

                        {/* Direct Icon Color Swatches */}
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {ICON_COLOR_SWATCHES.filter((s) => s.hex && s.hex.startsWith('#')).map((sw) => {
                                const isSel = prefs.iconColor === sw.hex;
                                return (
                                    <button
                                        key={sw.id}
                                        type="button"
                                        onClick={() => updatePrefs({ iconColor: sw.hex })}
                                        title={t(sw.label)}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer ${
                                            isSel ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : 'ring-1 ring-black/10'
                                        }`}
                                        style={{ backgroundColor: sw.hex }}
                                    >
                                        {isSel && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
