import apiClient from "@/src/shared/api/apiClient";

const dokumenteService = {
    getAll: () => apiClient.getAll<Dokument[]>("dokumente"),
    getById: (id: number) => apiClient.getById<Dokument>("dokumente", id),
    create: (data: { name: string; url: string; geraete_id: number }) =>
        apiClient.create<Dokument>("dokumente", data),
    update: (id: number, data: { name: string; url: string; geraete_id: number }) =>
        apiClient.update<Dokument>("dokumente", id, data),
    delete: (id: number) => apiClient.delete("dokumente", id),
};

export default dokumenteService;
