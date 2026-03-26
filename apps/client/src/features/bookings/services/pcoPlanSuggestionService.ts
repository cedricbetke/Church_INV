import apiClient from "@/src/shared/api/apiClient";
import { PcoPlanSuggestion } from "@/src/features/bookings/types/PcoPlanSuggestion";

type PcoPlanSuggestionApiDevice = {
    inv_nr: number;
    modell: string | null;
    hersteller: string | null;
    bereich: string | null;
    standort: string | null;
};

type PcoPlanSuggestionApiResponse = {
    id: string;
    service_type_id: string;
    service_type_name: string;
    is_virtual: boolean;
    source_service_type_id: string | null;
    source_service_type_name: string | null;
    source_series_title: string | null;
    plan_title: string | null;
    display_title: string;
    booking_title: string;
    dates: string | null;
    short_dates: string | null;
    sort_date: string;
    suggested_end_datum: string | null;
    planning_center_url: string | null;
    series_title: string | null;
    series_id: string | null;
    has_mapping: boolean;
    geraete: PcoPlanSuggestionApiDevice[];
};

const mapSuggestion = (suggestion: PcoPlanSuggestionApiResponse): PcoPlanSuggestion => ({
    id: suggestion.id,
    serviceTypeId: suggestion.service_type_id,
    serviceTypeName: suggestion.service_type_name,
    isVirtual: suggestion.is_virtual,
    sourceServiceTypeId: suggestion.source_service_type_id,
    sourceServiceTypeName: suggestion.source_service_type_name,
    sourceSeriesTitle: suggestion.source_series_title,
    planTitle: suggestion.plan_title,
    displayTitle: suggestion.display_title,
    bookingTitle: suggestion.booking_title,
    dates: suggestion.dates,
    shortDates: suggestion.short_dates,
    sortDate: suggestion.sort_date,
    suggestedEndDatum: suggestion.suggested_end_datum,
    planningCenterUrl: suggestion.planning_center_url,
    seriesTitle: suggestion.series_title,
    seriesId: suggestion.series_id,
    hasMapping: suggestion.has_mapping,
    geraete: suggestion.geraete.map((device) => ({
        invNr: device.inv_nr,
        modell: device.modell,
        hersteller: device.hersteller,
        bereich: device.bereich,
        standort: device.standort,
    })),
});

const pcoPlanSuggestionService = {
    getAll: async () => {
        const data = await apiClient.getAll<PcoPlanSuggestionApiResponse[]>("pco-plan-suggestion");
        return data.map(mapSuggestion);
    },
};

export default pcoPlanSuggestionService;
