import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import geraeteService from "@/src/features/inventory/services/geraeteService";

const inventoryMapper = {
    ...geraeteService,

    getAll: async () => {
        const response = await geraeteService.getAll();
        return response.map((item: any): InventoryItem => ({
            invNr: item.inv_nr,
            statusid: Number(item.Status ?? 0),
            hersteller: "",
            geraeteFoto: "",
            modell: item.Modell,
            objekttyp: "",
            seriennummer: "",
            kaufdatum: new Date(),
            einkaufspreis: 0,
            standort: String(item.standort_id ?? ""),
            verantwortlicher: "",
            bereich: "",
            kategorie: "",
            attachments: [],
            qrCode: "",
        }));
    },

    createWhole: async (_item: InventoryItem) => {
    },
};

export default inventoryMapper;
