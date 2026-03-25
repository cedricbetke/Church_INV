import apiClient from "@/src/shared/api/apiClient";
import { createCrudService } from "@/src/shared/api/createCrudService";
import { CreateGeraetPayload, UpdateGeraetPayload } from "@/src/features/inventory/types/CreateGeraetPayload";
import { HistoryEntry } from "@/src/features/inventory/types/HistoryEntry";

const baseGeraeteService = createCrudService<
    { inv_nr: number } & CreateGeraetPayload,
    CreateGeraetPayload,
    UpdateGeraetPayload
>("geraet");

const geraeteService = {
    ...baseGeraeteService,
    getMaxId: () => apiClient.getAll("geraet/max-id"),
    getHistory: (invNr: number) => apiClient.getAll<HistoryEntry[]>(`geraet/${invNr}/verlauf`),
};

export default geraeteService;
