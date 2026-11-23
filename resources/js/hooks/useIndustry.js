import { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';
import { getIndustryById } from '../data/industriesConfig';
import { getVocab } from '../data/industryVocab';

function translateObjectStrings(obj, t, skipKeys = new Set()) {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) {
        return obj.map((item) => (typeof item === 'string' ? t(item) : translateObjectStrings(item, t, skipKeys)));
    }
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
        if (skipKeys.has(k)) {
            out[k] = v;
        } else if (typeof v === 'string') {
            out[k] = t(v);
        } else if (v && typeof v === 'object' && typeof v !== 'function') {
            out[k] = translateObjectStrings(v, t, skipKeys);
        } else {
            out[k] = v;
        }
    }
    return out;
}

/**
 * Active service vertical for the admin panel.
 * Source of truth is the server-shared `currentIndustry` prop (persisted in session),
 * so every page and the sidebar always agree on the selected service.
 *
 * Automatically translates all display labels, vocabulary, and vertical metadata
 * into the active language (English / Tamil).
 */
export default function useIndustry() {
    const { props } = usePage();
    const { t, i18n } = useTranslation();
    const id = props.currentIndustry || 'real_estate';
    const rawIndustry = getIndustryById(id);

    return useMemo(() => {
        const rawLabels = rawIndustry.adminLabels || {};
        const labels = {};
        for (const [k, v] of Object.entries(rawLabels)) {
            labels[k] = typeof v === 'string' ? t(v) : v;
        }

        const rawVocab = getVocab(rawIndustry.id);
        const vocab = translateObjectStrings(rawVocab, t, new Set(['paymentTypes']));

        const industry = {
            ...rawIndustry,
            name: t(rawIndustry.name),
            shortName: t(rawIndustry.shortName),
            badge: t(rawIndustry.badge),
            tagline: rawIndustry.tagline ? t(rawIndustry.tagline) : rawIndustry.tagline,
            kpis: Array.isArray(rawIndustry.kpis)
                ? rawIndustry.kpis.map((kpi) => ({
                      ...kpi,
                      label: t(kpi.label),
                      trend: t(kpi.trend),
                      desc: t(kpi.desc),
                  }))
                : rawIndustry.kpis,
            quickActions: Array.isArray(rawIndustry.quickActions)
                ? rawIndustry.quickActions.map((qa) => ({
                      ...qa,
                      status: t(qa.status),
                      type: t(qa.type),
                  }))
                : rawIndustry.quickActions,
            telemetry: Array.isArray(rawIndustry.telemetry)
                ? rawIndustry.telemetry.map((tm) => ({
                      ...tm,
                      metric: t(tm.metric),
                      status: t(tm.status),
                  }))
                : rawIndustry.telemetry,
            adminLabels: labels,
        };

        return {
            id: rawIndustry.id,
            industry,
            labels,
            vocab,
            isDefault: rawIndustry.id === 'real_estate',
        };
    }, [rawIndustry.id, i18n.language, t]);
}
