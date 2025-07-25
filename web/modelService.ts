import apiService from "./apiService";

// Typ für Model


const modelService = {
    getAll: () :Promise<Modell[]> => apiService.getAll("modell"),

    getById: (id: number) => apiService.getById("modell", id),

    create: (data: Modell) => apiService.create("modell", data),

    update: (id: number, data: Modell) =>
        apiService.update<Status>("modell", id, data),

    delete: (id: number) => apiService.delete("modell", id),
};

export default modelService;
