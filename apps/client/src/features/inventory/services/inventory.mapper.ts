import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import geraeteService from "@/src/features/inventory/services/geraeteService";

const inventoryMapper = {
    ...geraeteService,

    getAll: async () => {
        const response = await geraeteService.getAll();
        return response.map((item: any) => new InventoryItem(
            item.inv_nr,
            item.Status,
            "",
            "",
            item.Modell,
            "",
            "",
            new Date(),
            0,
            item.standort_id,
            "",
            "",
            "",
            [],
            "",
        ));
    },

    createWhole: async (_item: InventoryItem) => {
    },
};

export default inventoryMapper;
