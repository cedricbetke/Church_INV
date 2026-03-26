import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import geraeteService from "@/src/features/inventory/services/geraeteService";
import apiClient from "@/src/shared/api/apiClient";

interface InventoryListItemDto {
    inv_nr: number;
    kaufdatum: string | null;
    einkaufspreis: number | null;
    zustandshinweis: string | null;
    geraetefoto_url: string | null;
    geraetefoto_thumb_url?: string | null;
    Status: string;
    Hersteller: string | null;
    Objekttyp: string | null;
    Modell: string;
    Standort: string | null;
    Bereich: string;
    Kategorie: string | null;
    Verantwortlicher: string | null;
}

const inventoryMapper = {
    ...geraeteService,

    getAll: async () => {
        const response = await geraeteService.getAll() as unknown as Promise<InventoryListItemDto[]>;

        return response.map((item): InventoryItem => ({
            invNr: item.inv_nr,
            status: item.Status,
            hersteller: item.Hersteller ?? undefined,
            objekttyp: item.Objekttyp ?? undefined,
            modell: item.Modell,
            kaufdatum: item.kaufdatum ? new Date(item.kaufdatum) : undefined,
            einkaufspreis: item.einkaufspreis ?? undefined,
            zustandshinweis: item.zustandshinweis ?? undefined,
            standort: item.Standort ?? "",
            verantwortlicher: item.Verantwortlicher ?? undefined,
            bereich: item.Bereich,
            kategorie: item.Kategorie ?? undefined,
            geraeteFoto: item.geraetefoto_url ? apiClient.resolveAssetUrl(item.geraetefoto_url) : undefined,
            geraeteFotoThumb: item.geraetefoto_thumb_url ? apiClient.resolveAssetUrl(item.geraetefoto_thumb_url) : undefined,
            attachments: [],
        }));
    },

    createWhole: async (_item: InventoryItem) => {
    },
};

export default inventoryMapper;
