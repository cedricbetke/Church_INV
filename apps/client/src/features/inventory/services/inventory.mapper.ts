import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import geraeteService from "@/src/features/inventory/services/geraeteService";
import apiClient from "@/src/shared/api/apiClient";

interface InventoryListItemDto {
    inv_nr: number;
    kaufdatum: string | null;
    einkaufspreis: number | null;
    geraetefoto_url: string | null;
    Status: string;
    Modell: string;
    Standort: string | null;
    Bereich: string;
    Kategorie: string | null;
    Verantwortlicher: string | null;
}

const inventoryMapper = {
    ...geraeteService,

    getAll: async () => {
        const response = await geraeteService.getAll() as unknown as InventoryListItemDto[];
        return response.map((item): InventoryItem => ({
            invNr: item.inv_nr,
            status: item.Status,
            modell: item.Modell,
            kaufdatum: item.kaufdatum ? new Date(item.kaufdatum) : undefined,
            einkaufspreis: item.einkaufspreis ?? undefined,
            standort: item.Standort ?? "",
            verantwortlicher: item.Verantwortlicher ?? undefined,
            bereich: item.Bereich,
            kategorie: item.Kategorie ?? undefined,
            geraeteFoto: item.geraetefoto_url ? apiClient.resolveAssetUrl(item.geraetefoto_url) : undefined,
            attachments: [],
        }));
    },

    createWhole: async (_item: InventoryItem) => {
    },
};

export default inventoryMapper;
