import apiClient from "@/src/shared/api/apiClient";

export const createCrudService = <TEntity, TCreate = TEntity, TUpdate = TCreate>(resource: string) => ({
    getAll: () => apiClient.getAll<TEntity[]>(resource),
    getById: (id: number) => apiClient.getById<TEntity>(resource, id),
    create: (data: TCreate) => apiClient.create<TEntity>(resource, data),
    update: (id: number, data: TUpdate) => apiClient.update<TEntity>(resource, id, data),
    delete: (id: number) => apiClient.delete(resource, id),
});
