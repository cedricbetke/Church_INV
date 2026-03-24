import axios, { AxiosInstance } from "axios";

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!configuredBaseUrl) {
    throw new Error("EXPO_PUBLIC_API_BASE_URL ist nicht gesetzt.");
}

const normalizedBaseUrl = configuredBaseUrl.replace(/\/+$/, "");
const apiBaseUrl = normalizedBaseUrl.endsWith("/api")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`;

const api: AxiosInstance = axios.create({
    baseURL: apiBaseUrl,
    headers: { "Content-Type": "application/json" },
});

const apiClient = {
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

export default apiClient;
