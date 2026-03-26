import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import Attachment from "@/src/features/inventory/types/Attachment";
import geraeteService from "@/src/features/inventory/services/geraeteService";
import apiClient from "@/src/shared/api/apiClient";
import dokumenteService from "@/src/features/masterdata/services/dokumenteService";

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
        const [response, dokumente] = await Promise.all([
            geraeteService.getAll() as unknown as Promise<InventoryListItemDto[]>,
            dokumenteService.getAll(),
        ]);

        const attachmentsByGeraet = new Map<number, Attachment[]>();
        for (const dokument of dokumente) {
            const current = attachmentsByGeraet.get(dokument.geraete_id) ?? [];
            current.push({
                id: String(dokument.id),
                name: dokument.name,
                type: dokument.url.split(".").pop()?.toLowerCase() ?? "datei",
                file: apiClient.resolveAssetUrl(dokument.url),
                uploadedAt: dokument.hochgeladen_am ? new Date(dokument.hochgeladen_am) : new Date(),
            });
            attachmentsByGeraet.set(dokument.geraete_id, current);
        }

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
            attachments: attachmentsByGeraet.get(item.inv_nr) ?? [],
        }));
    },

    createWhole: async (_item: InventoryItem) => {
    },
};

export default inventoryMapper;
