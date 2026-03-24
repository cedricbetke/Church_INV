import apiService from "./apiService";

// Typ für Bereich

const bereichService = {
    getAll: () => apiService.getAll<Bereich[]>("bereich"),

    getById: (id: number) => apiService.getById<Bereich>("bereich", id),

    create: (data: { name: string }) => apiService.create<Bereich>("bereich", data),

    update: (id: number, data: { name: string }) =>
        apiService.update<Bereich>("bereich", id, data),

    delete: (id: number) => apiService.delete("bereich", id),
};

export default bereichService;
