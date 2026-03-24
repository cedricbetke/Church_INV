import apiClient from "@/src/shared/api/apiClient";

const modellService = {
    getAll: (): Promise<Modell[]> => apiClient.getAll("modell"),
    getById: (id: number) => apiClient.getById("modell", id),
    create: (data: Modell) => apiClient.create("modell", data),
    update: (id: number, data: Modell) => apiClient.update<Status>("modell", id, data),
    delete: (id: number) => apiClient.delete("modell", id),
};

export default modellService;
