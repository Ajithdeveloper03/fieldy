import L from 'leaflet';

/**
 * Transparent Field Employee (hard-hat safety engineer/technician) SVG marker for Web Admin maps.
 */
export function createFieldEmployeeIcon(label = '') {
    const safeLabel = String(label || '').replace(/[<>&"']/g, '');
    return L.divIcon({
        className: 'fieldy-employee-marker',
        html: `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:transparent;pointer-events:auto;">
                <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 5px rgba(15,23,42,0.35));">
                    <!-- Safety Hard Hat -->
                    <path d="M13 17C13 11.477 17.029 7 22 7C26.971 7 31 11.477 31 17H13Z" fill="#F26A10" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
                    <path d="M22 7V15" stroke="#FFF7ED" stroke-width="2" stroke-linecap="round" />
                    <path d="M10.5 17.5H33.5" stroke="#0F172A" stroke-width="2.4" stroke-linecap="round" />
                    <!-- Face -->
                    <path d="M15.5 18.5C15.5 22.09 18.41 25 22 25C25.59 25 28.5 22.09 28.5 18.5" fill="#FDE68A" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
                    <!-- High-Vis Jacket / Shoulders -->
                    <path d="M9 36C9 29.925 13.925 26 20 26H24C30.075 26 35 29.925 35 36" fill="#0F172A" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
                    <path d="M15.5 26.5L18.5 36M28.5 26.5L25.5 36" stroke="#F26A10" stroke-width="3" stroke-linecap="round" />
                    <circle cx="22" cy="31.5" r="2" fill="#22C55E" stroke="#FFFFFF" stroke-width="1.2" />
                </svg>
                ${
                    safeLabel
                        ? `<span style="margin-top:-2px;padding:1px 7px;border-radius:999px;background:rgba(15,23,42,0.88);color:#fff;font-size:10px;font-weight:700;white-space:nowrap;">${safeLabel}</span>`
                        : ''
                }
            </div>
        `,
        iconSize: [44, safeLabel ? 56 : 42],
        iconAnchor: [22, 22],
    });
}
