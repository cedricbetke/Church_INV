import apiClient from "@/src/shared/api/apiClient";
import { createCrudService } from "@/src/shared/api/createCrudService";

const baseGeraeteService = createCrudService<Geraet, Omit<Geraet, "inv_nr">, Partial<Omit<Geraet, "inv_nr">>>("geraet");

const geraeteService = {
    ...baseGeraeteService,
    getMaxId: () => apiClient.getAll("geraet/max-id"),
};

export default geraeteService;
