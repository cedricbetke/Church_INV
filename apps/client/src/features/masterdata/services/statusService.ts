import apiClient from "@/src/shared/api/apiClient";

const statusService = {
    getAll: () => apiClient.getAll<Status[]>("status"),
    getById: (id: number) => apiClient.getById<Status>("status", id),
    create: (data: { name: string }) => apiClient.create<Status>("status", data),
    update: (id: number, data: { name: string }) => apiClient.update<Status>("status", id, data),
    delete: (id: number) => apiClient.delete("status", id),
};

export default statusService;
