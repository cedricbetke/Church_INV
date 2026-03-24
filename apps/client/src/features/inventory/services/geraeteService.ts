import apiClient from "@/src/shared/api/apiClient";

const geraeteService = {
    getAll: () => apiClient.getAll<Geraet[]>("geraet"),
    getById: (invNr: number) => apiClient.getById<Geraet>("geraet", invNr),
    create: (data: Omit<Geraet, "inv_nr">) => apiClient.create<Geraet>("geraet", data),
    update: (invNr: number, data: Partial<Omit<Geraet, "inv_nr">>) =>
        apiClient.update<Geraet>("geraet", invNr, data),
    delete: (invNr: number) => apiClient.delete("geraet", invNr),
    getMaxId: () => apiClient.getAll("geraet/max-id"),
};

export default geraeteService;
