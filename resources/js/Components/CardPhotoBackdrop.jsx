import React from 'react';

export const INDIAN_PHOTOS = {
    // Industry-matched verified free Indian Pexels photos
    construction: 'https://images.pexels.com/photos/8293664/pexels-photo-8293664.jpeg?auto=compress&cs=tinysrgb&w=900',
    solar: 'https://images.pexels.com/photos/21832812/pexels-photo-21832812/free-photo-of-solar-panels-on-road.jpeg?auto=compress&cs=tinysrgb&w=900',
    real_estate: 'https://images.pexels.com/photos/7581016/pexels-photo-7581016.jpeg?auto=compress&cs=tinysrgb&w=900',
    facility_fmcg: 'https://images.pexels.com/photos/7580648/pexels-photo-7580648.jpeg?auto=compress&cs=tinysrgb&w=900',
    cleaning: 'https://images.pexels.com/photos/7581040/pexels-photo-7581040.jpeg?auto=compress&cs=tinysrgb&w=900',
    security: 'https://images.pexels.com/photos/8293666/pexels-photo-8293666.jpeg?auto=compress&cs=tinysrgb&w=900',
    maintenance: 'https://images.pexels.com/photos/8853504/pexels-photo-8853504.jpeg?auto=compress&cs=tinysrgb&w=900',
    pest_control: 'https://images.pexels.com/photos/29039800/pexels-photo-29039800/free-photo-of-south-asian-farmer-working-in-rice-fields.jpeg?auto=compress&cs=tinysrgb&w=900',
    logistics: 'https://images.pexels.com/photos/31335982/pexels-photo-31335982/free-photo-of-textile-factory-worker-reviewing-documents.jpeg?auto=compress&cs=tinysrgb&w=900',

    // Functional page-specific Indian photos
    office: 'https://images.pexels.com/photos/7581016/pexels-photo-7581016.jpeg?auto=compress&cs=tinysrgb&w=900',
    team: 'https://images.pexels.com/photos/7580648/pexels-photo-7580648.jpeg?auto=compress&cs=tinysrgb&w=900',
    workplace: 'https://images.pexels.com/photos/7581040/pexels-photo-7581040.jpeg?auto=compress&cs=tinysrgb&w=900',
    engineer: 'https://images.pexels.com/photos/8293664/pexels-photo-8293664.jpeg?auto=compress&cs=tinysrgb&w=900',
    industrial: 'https://images.pexels.com/photos/8293666/pexels-photo-8293666.jpeg?auto=compress&cs=tinysrgb&w=900',
    aerial: 'https://images.pexels.com/photos/29923348/pexels-photo-29923348/free-photo-of-aerial-view-of-solar-panels-on-industrial-building.jpeg?auto=compress&cs=tinysrgb&w=900',
    manager: 'https://images.pexels.com/photos/9474025/pexels-photo-9474025.jpeg?auto=compress&cs=tinysrgb&w=900',
    analytics: 'https://images.pexels.com/photos/9345681/pexels-photo-9345681.jpeg?auto=compress&cs=tinysrgb&w=900',
    mobile: 'https://images.pexels.com/photos/9159272/pexels-photo-9159272.jpeg?auto=compress&cs=tinysrgb&w=900',
    documents: 'https://images.pexels.com/photos/31335982/pexels-photo-31335982/free-photo-of-textile-factory-worker-reviewing-documents.jpeg?auto=compress&cs=tinysrgb&w=900',
    technician: 'https://images.pexels.com/photos/8853510/pexels-photo-8853510.jpeg?auto=compress&cs=tinysrgb&w=900',
};

export function getIndianPhoto(key) {
    return INDIAN_PHOTOS[key] || INDIAN_PHOTOS.office;
}

/**
 * Subtle editorial Indian background photo faded cleanly into white/glass cards
 * so foreground KPIs, titles, and actions stay 100% legible.
 */
export default function CardPhotoBackdrop({
    src,
    photoKey = 'office',
    variant = 'corner', // 'corner' | 'right' | 'bottom'
    alt = '',
    opacity = 0.28,
}) {
    const resolvedSrc = src || getIndianPhoto(photoKey);

    if (variant === 'bottom') {
        return (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 overflow-hidden rounded-b-[inherit]" aria-hidden="true">
                <img
                    src={resolvedSrc}
                    alt={alt}
                    className="w-full h-full object-cover object-center"
                    style={{ opacity }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.78) 34%, rgba(255,255,255,0.08) 100%)',
                    }}
                />
            </div>
        );
    }

    if (variant === 'right') {
        return (
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 sm:w-2/5 overflow-hidden rounded-r-[inherit] hidden sm:block" aria-hidden="true">
                <img
                    src={resolvedSrc}
                    alt={alt}
                    className="w-full h-full object-cover object-center"
                    style={{ opacity }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to right, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.72) 45%, rgba(255,255,255,0.12) 100%)',
                    }}
                />
            </div>
        );
    }

    // Default: soft bottom-right corner fade for compact KPI & metric cards
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
            <img
                src={resolvedSrc}
                alt={alt}
                className="w-full h-full object-cover object-center"
                style={{ opacity }}
            />
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.22) 100%)',
                }}
            />
        </div>
    );
}
