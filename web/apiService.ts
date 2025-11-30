import axios, { AxiosInstance } from "axios";

// Erstelle eine Axios-Instanz mit Basis-URL
const api: AxiosInstance = axios.create({
    baseURL: "http://192.168.178.71:3000/api/", // Deine Backend-Base-URL
    headers: {
        "Content-Type": "application/json",
    },
});

// Generischer API-Service für GET, POST, PUT und DELETE
const apiService = {
    getAll: async <T>(resource: string): Promise<T> => {
        const response = await api.get<T>(`/${resource}`);
        return response.data;
    },

    getById: async <T>(resource: string, id: number): Promise<T> => {
        const response = await api.get<T>(`/${resource}/${id}`);
        return response.data;
    },

    create: async <T>(resource: string, data: unknown): Promise<T> => {
        const response = await api.post<T>(`/${resource}`, data);
        return response.data;
    },

    update: async <T>(resource: string, id: number, data: unknown): Promise<T> => {
        const response = await api.put<T>(`/${resource}/${id}`, data);
        return response.data;
    },

    delete: async (resource: string, id: number): Promise<{ message: string }> => {
        const response = await api.delete<{ message: string }>(`/${resource}/${id}`);
        return response.data;
    },
};

export default apiService;
