const fs = require('fs');
const path = require('path');
const PcoMapping = require('./pcoMappingModel');

const pcoJsonPath = path.resolve(__dirname, '..', '..', '..', '..', 'import', 'pco-services-import-report.json');

const cleanText = (value) => {
    if (typeof value !== 'string') {
        return null;
    }

    const cleaned = value.replace(/\uFEFF/g, '').replace(/\s+/g, ' ').trim();
    return cleaned || null;
};

const addHours = (isoString, hoursToAdd) => {
    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    date.setHours(date.getHours() + hoursToAdd);
    return date.toISOString();
};

const toSuggestions = (serviceTypes, mappingMap) =>
    serviceTypes.flatMap((serviceType) => {
        const serviceTypeId = cleanText(serviceType.id);
        const serviceTypeName = cleanText(serviceType.name);
        const plans = Array.isArray(serviceType.plans) ? serviceType.plans : [];
        const mapping = serviceTypeId ? mappingMap.get(serviceTypeId) ?? null : null;

        return plans
            .map((plan) => {
                const planId = cleanText(plan.id);
                const sortDate = cleanText(plan.sort_date);

                if (!serviceTypeId || !serviceTypeName || !planId || !sortDate) {
                    return null;
                }

                const planTitle =
                    cleanText(plan.title) ??
                    cleanText(plan.series_title) ??
                    cleanText(plan.short_dates) ??
                    cleanText(plan.dates) ??
                    'Plan';

                return {
                    id: planId,
                    service_type_id: serviceTypeId,
                    service_type_name: serviceTypeName,
                    is_virtual: Boolean(serviceType.virtual),
                    source_service_type_id: cleanText(serviceType.source_service_type_id),
                    source_service_type_name: cleanText(serviceType.source_service_type_name),
                    source_series_title: cleanText(serviceType.source_series_title),
                    plan_title: cleanText(plan.title),
                    display_title: planTitle,
                    booking_title: `${serviceTypeName} · ${planTitle}`,
                    dates: cleanText(plan.dates),
                    short_dates: cleanText(plan.short_dates),
                    sort_date: sortDate,
                    suggested_end_datum: addHours(sortDate, 3),
                    planning_center_url: cleanText(plan.planning_center_url),
                    series_title: cleanText(plan.series_title),
                    series_id: cleanText(plan.series_id),
                    has_mapping: Boolean(mapping && mapping.geraete.length > 0),
                    geraete: mapping?.geraete ?? [],
                };
            })
            .filter(Boolean);
    });

const PcoPlanSuggestion = {
    getAll: async () => {
        const rawJson = fs.readFileSync(pcoJsonPath, 'utf8');
        const payload = JSON.parse(rawJson);
        const mappings = await PcoMapping.getAll();
        const mappingMap = new Map(mappings.map((mapping) => [mapping.pco_service_type_id, mapping]));

        const serviceTypes = Array.isArray(payload.service_types) ? payload.service_types : [];
        const derivedServiceTypes = Array.isArray(payload.derived_service_types) ? payload.derived_service_types : [];

        const suggestions = [
            ...toSuggestions(serviceTypes, mappingMap),
            ...toSuggestions(derivedServiceTypes, mappingMap),
        ];

        return suggestions.sort((left, right) => new Date(left.sort_date).getTime() - new Date(right.sort_date).getTime());
    },
};

module.exports = PcoPlanSuggestion;
