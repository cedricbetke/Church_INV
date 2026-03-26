import apiClient from "@/src/shared/api/apiClient";
import { PcoMapping, UpdatePcoMappingPayload } from "@/src/features/bookings/types/PcoMapping";

type PcoMappingApiDevice = {
    inv_nr: number;
    modell: string | null;
    hersteller: string | null;
    bereich: string | null;
    standort: string | null;
};

type PcoMappingApiResponse = {
    id: number;
    pco_service_type_id: string;
    pco_service_type_name: string;
    is_virtual: boolean;
    source_service_type_id: string | null;
    source_service_type_name: string | null;
    source_series_title: string | null;
    aktiv: boolean;
    erstellt_am: string;
    aktualisiert_am: string;
    geraete: PcoMappingApiDevice[];
};

const mapPcoMapping = (mapping: PcoMappingApiResponse): PcoMapping => ({
    id: mapping.id,
    pcoServiceTypeId: mapping.pco_service_type_id,
    pcoServiceTypeName: mapping.pco_service_type_name,
    isVirtual: mapping.is_virtual,
    sourceServiceTypeId: mapping.source_service_type_id,
    sourceServiceTypeName: mapping.source_service_type_name,
    sourceSeriesTitle: mapping.source_series_title,
    aktiv: mapping.aktiv,
    erstelltAm: mapping.erstellt_am,
    aktualisiertAm: mapping.aktualisiert_am,
    geraete: mapping.geraete.map((device) => ({
        invNr: device.inv_nr,
        modell: device.modell,
        hersteller: device.hersteller,
        bereich: device.bereich,
        standort: device.standort,
    })),
});

const pcoMappingService = {
    getAll: async () => {
        const data = await apiClient.getAll<PcoMappingApiResponse[]>("pco-mapping");
        return data.map(mapPcoMapping);
    },

    update: async (id: number, payload: UpdatePcoMappingPayload) => {
        const data = await apiClient.update<PcoMappingApiResponse>("pco-mapping", id, payload);
        return mapPcoMapping(data);
    },
};

export default pcoMappingService;
