import apiClient from "@/src/shared/api/apiClient";

const bereichService = {
    getAll: () => apiClient.getAll<Bereich[]>("bereich"),
    getById: (id: number) => apiClient.getById<Bereich>("bereich", id),
    create: (data: { name: string }) => apiClient.create<Bereich>("bereich", data),
    update: (id: number, data: { name: string }) => apiClient.update<Bereich>("bereich", id, data),
    delete: (id: number) => apiClient.delete("bereich", id),
};

export default bereichService;
