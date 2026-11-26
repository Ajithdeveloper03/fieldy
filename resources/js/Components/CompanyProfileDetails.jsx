import React from 'react';
import { useTranslation } from 'react-i18next';

export default function CompanyProfileDetails({ company }) {
    const { t } = useTranslation();
    const setting = value => value == null ? null : t(value ? 'Enabled' : 'Disabled');
    const fields = [
        ['Tenant Prefix Code', company.code],
        ['Company Email', company.email],
        ['Company Phone', company.phone],
        ['Address', company.address],
        ['GST Number', company.gst_number],
        ['Website', company.website],
        ['Plan', company.plan ? t(company.plan) : null],
        ['Billing Cycle', company.billing_cycle ? t(company.billing_cycle) : null],
        ['Subscription Expiry', company.subscription_expires_at],
        ['Employee Limit', company.max_employees],
        ['Estimated Project Sites', company.estimated_sites],
        ['GPS Geofence Required', setting(company.security?.require_gps_geofence)],
        ['Selfie Verification Required', setting(company.security?.require_selfie_verification)],
    ];

    return (
        <dl className="mt-6 grid gap-x-8 rounded-2xl border border-hp-border bg-white px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
            {fields.filter(([, value]) => value != null && value !== '').map(([label, value]) => (
                <div key={label} className="min-w-0 border-b border-hp-border py-4">
                    <dt className="text-xs font-semibold text-hp-muted">{t(label)}</dt>
                    <dd className="mt-1 break-words text-sm font-medium text-hp-dark">{value}</dd>
                </div>
            ))}
        </dl>
    );
}
