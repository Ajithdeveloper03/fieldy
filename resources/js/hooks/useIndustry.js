import { usePage } from '@inertiajs/react';
import { getIndustryById } from '../data/industriesConfig';
import { getVocab } from '../data/industryVocab';

/**
 * Active service vertical for the admin panel.
 * Source of truth is the server-shared `currentIndustry` prop (persisted in session),
 * so every page and the sidebar always agree on the selected service.
 *
 * Returns { id, industry, labels, vocab, isDefault }.
 */
export default function useIndustry() {
    const { props } = usePage();
    const id = props.currentIndustry || 'real_estate';
    const industry = getIndustryById(id);
    return {
        id: industry.id,
        industry,
        labels: industry.adminLabels || {},
        vocab: getVocab(industry.id),
        isDefault: industry.id === 'real_estate',
    };
}

