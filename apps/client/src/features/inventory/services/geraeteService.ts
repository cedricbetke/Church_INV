import apiClient from "@/src/shared/api/apiClient";
import { createCrudService } from "@/src/shared/api/createCrudService";
import { CreateGeraetPayload, UpdateGeraetPayload } from "@/src/features/inventory/types/CreateGeraetPayload";

const baseGeraeteService = createCrudService<
    { inv_nr: number } & CreateGeraetPayload,
    CreateGeraetPayload,
    UpdateGeraetPayload
>("geraet");

const geraeteService = {
    ...baseGeraeteService,
    getMaxId: () => apiClient.getAll("geraet/max-id"),
};

export default geraeteService;
