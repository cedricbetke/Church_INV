import apiService from "./apiService";

// Typ für Dokumente


const dokumenteService = {
    getAll: () => apiService.getAll<Dokument[]>("dokumente"),

    getById: (id: number) => apiService.getById<Dokument>("dokumente", id),

    create: (data: { name: string; url: string; geraete_id: number }) =>
        apiService.create<Dokument>("dokumente", data),

    update: (id: number, data: { name: string; url: string; geraete_id: number }) =>
        apiService.update<Dokument>("dokumente", id, data),

    delete: (id: number) => apiService.delete("dokumente", id),
};

export default dokumenteService;
