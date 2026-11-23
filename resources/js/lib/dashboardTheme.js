export const DASHBOARD_THEMES = [
    { id: 'teal', name: 'Ocean Teal', hex: '#0F766E', hover: '#0D645D', pressed: '#0A4F4A', light: '#E6F7F5', border: '#99E2D9' },
    { id: 'cobalt', name: 'Royal Cobalt', hex: '#1D4ED8', hover: '#1E40AF', pressed: '#1E3A8A', light: '#EFF6FF', border: '#BFDBFE' },
    { id: 'orchid', name: 'Plum Orchid', hex: '#7E22CE', hover: '#6B21A8', pressed: '#581C87', light: '#F5F0FF', border: '#DDD6FE' },
    { id: 'jade', name: 'Botanical Jade', hex: '#15803D', hover: '#166534', pressed: '#14532D', light: '#ECFDF5', border: '#A7F3D0' },
    { id: 'terracotta', name: 'Terracotta Clay', hex: '#C8553D', hover: '#B24630', pressed: '#963825', light: '#FBF0ED', border: '#EBC7BD' },
    { id: 'rose', name: 'Berry Rose', hex: '#BE185D', hover: '#9D174D', pressed: '#831843', light: '#FDF2F8', border: '#FBCFE8' },
];

export const ICON_COLOR_SWATCHES = [
    { id: 'match', label: 'Match Theme', hex: null },
    { id: 'multi', label: 'Multi-Color', hex: 'multi' },
    { id: '#0F766E', label: 'Teal', hex: '#0F766E' },
    { id: '#1D4ED8', label: 'Cobalt', hex: '#1D4ED8' },
    { id: '#7E22CE', label: 'Orchid', hex: '#7E22CE' },
    { id: '#15803D', label: 'Jade', hex: '#15803D' },
    { id: '#C8553D', label: 'Terracotta', hex: '#C8553D' },
    { id: '#BE185D', label: 'Berry', hex: '#BE185D' },
    { id: '#D97706', label: 'Amber', hex: '#D97706' },
    { id: '#1E293B', label: 'Graphite', hex: '#1E293B' },
];

export function hexToRgbString(hex) {
    if (!hex || typeof hex !== 'string') return '15, 118, 110';
    const clean = hex.replace('#', '').trim();
    const full = clean.length === 3
        ? clean.split('').map((c) => c + c).join('')
        : clean;
    if (full.length !== 6) return '15, 118, 110';
    const r = parseInt(full.slice(0, 2), 16);
    const g = parseInt(full.slice(2, 4), 16);
    const b = parseInt(full.slice(4, 6), 16);
    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return '15, 118, 110';
    return `${r}, ${g}, ${b}`;
}

export function darkenHex(hex, factor = 0.78) {
    const [r, g, b] = hexToRgbString(hex).split(',').map((n) => parseInt(n.trim(), 10));
    const dr = Math.max(0, Math.round(r * factor));
    const dg = Math.max(0, Math.round(g * factor));
    const db = Math.max(0, Math.round(b * factor));
    return `rgb(${dr}, ${dg}, ${db})`;
}

export function loadThemePrefs() {
    try {
        const savedTheme = JSON.parse(localStorage.getItem('fieldy.dashboardTheme') || '"teal"');
        const savedCustomAccent = JSON.parse(localStorage.getItem('fieldy.customAccentHex') || '"#0F766E"');
        const savedIconMode = JSON.parse(localStorage.getItem('fieldy.dashboardIconColor') || '"match"');
        return {
            themeId: typeof savedTheme === 'string' ? savedTheme : 'teal',
            customAccentHex: typeof savedCustomAccent === 'string' ? savedCustomAccent : '#0F766E',
            iconColor: typeof savedIconMode === 'string' ? savedIconMode : 'match',
        };
    } catch {
        return { themeId: 'teal', customAccentHex: '#0F766E', iconColor: 'match' };
    }
}

export function applyDashboardTheme({ themeId, customAccentHex, iconColor }) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const preset = DASHBOARD_THEMES.find((t) => t.id === themeId);
    const accentHex = themeId === 'custom' ? customAccentHex : (preset?.hex || '#0F766E');
    const accentRgb = hexToRgbString(accentHex);

    root.setAttribute('data-theme', themeId);
    root.setAttribute('data-icon-mode', iconColor === 'multi' ? 'multi' : 'custom');

    root.style.setProperty('--color-hp-primary', accentHex);
    root.style.setProperty('--color-hp-primary-hover', preset ? preset.hover : darkenHex(accentHex, 0.86));
    root.style.setProperty('--color-hp-primary-pressed', preset ? preset.pressed : darkenHex(accentHex, 0.72));
    root.style.setProperty('--color-hp-primary-light', preset ? preset.light : `rgba(${accentRgb}, 0.10)`);
    root.style.setProperty('--color-hp-primary-lighter', `rgba(${accentRgb}, 0.05)`);
    root.style.setProperty('--color-hp-primary-border', preset ? preset.border : `rgba(${accentRgb}, 0.34)`);
    root.style.setProperty('--hp-accent-rgb', accentRgb);
    root.style.setProperty('--hp-accent-deep', darkenHex(accentHex, 0.68));

    // Icon color customization (Match Theme, Multi-Color, or any custom Hex)
    if (iconColor === 'multi') {
        root.style.removeProperty('--hp-icon-override');
        root.style.removeProperty('--hp-icon-override-rgb');
        root.style.setProperty('--hp-icon-color', accentHex);
        root.style.setProperty('--hp-icon-rgb', accentRgb);
    } else {
        const resolvedIconHex = iconColor === 'match' || !iconColor ? accentHex : iconColor;
        const resolvedIconRgb = hexToRgbString(resolvedIconHex);
        root.style.setProperty('--hp-icon-override', resolvedIconHex);
        root.style.setProperty('--hp-icon-override-rgb', resolvedIconRgb);
        root.style.setProperty('--hp-icon-color', resolvedIconHex);
        root.style.setProperty('--hp-icon-rgb', resolvedIconRgb);
    }

    try {
        localStorage.setItem('fieldy.dashboardTheme', JSON.stringify(themeId));
        localStorage.setItem('fieldy.customAccentHex', JSON.stringify(customAccentHex));
        localStorage.setItem('fieldy.dashboardIconColor', JSON.stringify(iconColor));
    } catch { }
}

const LIQUID_SELECTOR = '.hp-btn, .hp-icon-btn, .hp-liquid-icon-badge, .hp-icon-tile, .hp-pill, .hp-nav-item';
const LIQUID_CARD_SELECTOR = '.hp-card, .hp-bento-card, .hp-hero-card, .hp-metric-pill-card';

/**
 * Attaches lightweight pointer-tracking fluid hover motion (--mx, --my, --tx, --ty, --rx, --ry)
 * for interactive controls plus subtle specular sheen gliding (--card-mx) on plain liquid glass cards.
 */
export function attachLiquidPointerTracking(container) {
    if (!container || typeof window === 'undefined') return () => {};
    let activeTarget = null;
    let activeCard = null;
    let rafId = null;

    const resetTarget = (el) => {
        if (!el) return;
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
        el.style.removeProperty('--tx');
        el.style.removeProperty('--ty');
        el.style.removeProperty('--rx');
        el.style.removeProperty('--ry');
    };

    const resetCard = (el) => {
        if (!el) return;
        el.style.removeProperty('--card-mx');
    };

    const handleMove = (e) => {
        const target = e.target?.closest?.(LIQUID_SELECTOR);
        const card = e.target?.closest?.(LIQUID_CARD_SELECTOR);

        if (activeTarget && activeTarget !== target) {
            resetTarget(activeTarget);
        }
        if (activeCard && activeCard !== card) {
            resetCard(activeCard);
        }
        activeTarget = target || null;
        activeCard = card || null;
        if (!activeTarget && !activeCard) return;

        const clientX = e.clientX;
        const clientY = e.clientY;
        const el = activeTarget;
        const cardEl = activeCard;

        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.width && rect.height) {
                    const normX = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
                    const normY = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height) * 2 - 1));
                    const xPct = (normX + 1) * 50;
                    const yPct = (normY + 1) * 50;
                    const tx = normX * 3.2;
                    const ty = normY * 2.4;
                    const rx = normX * 6.5;
                    const ry = -normY * 6.5;
                    el.style.setProperty('--mx', xPct.toFixed(1));
                    el.style.setProperty('--my', yPct.toFixed(1));
                    el.style.setProperty('--tx', tx.toFixed(2));
                    el.style.setProperty('--ty', ty.toFixed(2));
                    el.style.setProperty('--rx', rx.toFixed(2));
                    el.style.setProperty('--ry', ry.toFixed(2));
                }
            }
            if (cardEl) {
                const cRect = cardEl.getBoundingClientRect();
                if (cRect.width) {
                    const cPct = Math.max(0, Math.min(100, ((clientX - cRect.left) / cRect.width) * 100));
                    cardEl.style.setProperty('--card-mx', cPct.toFixed(1));
                }
            }
        });
    };

    const handleLeave = () => {
        if (rafId) cancelAnimationFrame(rafId);
        resetTarget(activeTarget);
        resetCard(activeCard);
        activeTarget = null;
        activeCard = null;
    };

    container.addEventListener('pointermove', handleMove, { passive: true });
    container.addEventListener('pointerleave', handleLeave, { passive: true });

    return () => {
        if (rafId) cancelAnimationFrame(rafId);
        resetTarget(activeTarget);
        resetCard(activeCard);
        container.removeEventListener('pointermove', handleMove);
        container.removeEventListener('pointerleave', handleLeave);
    };
}
