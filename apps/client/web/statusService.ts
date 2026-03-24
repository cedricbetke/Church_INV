import apiService from "./apiService";

// Typ für Status


const statusService = {
    getAll: () => apiService.getAll<Status[]>("status"),

    getById: (id: number) => apiService.getById<Status>("status", id),

    create: (data: { name: string }) => apiService.create<Status>("status", data),

    update: (id: number, data: { name: string }) =>
        apiService.update<Status>("status", id, data),

    delete: (id: number) => apiService.delete("status", id),
};

export default statusService;
