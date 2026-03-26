import { PcoMappingDevice } from "@/src/features/bookings/types/PcoMapping";

export type PcoPlanSuggestion = {
    id: string;
    serviceTypeId: string;
    serviceTypeName: string;
    isVirtual: boolean;
    sourceServiceTypeId: string | null;
    sourceServiceTypeName: string | null;
    sourceSeriesTitle: string | null;
    planTitle: string | null;
    displayTitle: string;
    bookingTitle: string;
    dates: string | null;
    shortDates: string | null;
    sortDate: string;
    suggestedEndDatum: string | null;
    planningCenterUrl: string | null;
    seriesTitle: string | null;
    seriesId: string | null;
    hasMapping: boolean;
    geraete: PcoMappingDevice[];
};
