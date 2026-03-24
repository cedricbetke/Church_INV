import apiClient from "@/src/shared/api/apiClient";

class HerstellerService {
    private readonly baseUrl = "hersteller";

    async getAll(): Promise<Hersteller[]> {
        return await apiClient.getAll(this.baseUrl);
    }

    async getById(id: number): Promise<Hersteller> {
        return await apiClient.getById(this.baseUrl, id);
    }

    async create(hersteller: Hersteller): Promise<Hersteller> {
        return await apiClient.create(this.baseUrl, hersteller);
    }

    async update(id: number, hersteller: Hersteller): Promise<Hersteller> {
        return await apiClient.update(this.baseUrl, id, hersteller);
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete(this.baseUrl, id);
    }
}

export default new HerstellerService();
