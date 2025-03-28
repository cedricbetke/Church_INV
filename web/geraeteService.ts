import apiService from "./apiService";

// Typ für Gerät


const geraetService = {
    getAll: () => apiService.getAll<Geraet[]>("geraet"),

    getById: (inv_nr: number) => apiService.getById<Geraet>("geraet", inv_nr),

    create: (data: Omit<Geraet, "inv_nr">) =>
        apiService.create<Geraet>("geraet", data),

    update: (inv_nr: number, data: Partial<Omit<Geraet, "inv_nr">>) =>
        apiService.update<Geraet>("geraet", inv_nr, data),

    delete: (inv_nr: number) => apiService.delete("geraet", inv_nr),
};

export default geraetService;
