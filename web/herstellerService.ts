import apiService from './apiService';


class HerstellerService {
    private readonly baseUrl = 'hersteller';

    async getAll(): Promise<Hersteller[]> {
        return await apiService.getAll(this.baseUrl);
    }

    async getById(id: number): Promise<Hersteller> {
        return await apiService.getById(`${this.baseUrl}`,id);
    }

    async create(hersteller: Hersteller): Promise<Hersteller> {
        return await apiService.create(this.baseUrl, hersteller);
    }

    async update(id: number, hersteller: Hersteller): Promise<Hersteller> {
        return await apiService.update(`${this.baseUrl}`,id, hersteller);
    }

    async delete(id: number): Promise<void> {
        await apiService.delete(`${this.baseUrl}`,id);
    }
}

export default new HerstellerService();