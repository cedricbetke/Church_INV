import InventoryItem from "@/app/inventoryItem/InventoryItem";
import geraetService from "./geraeteService"; // Dein Service für Geräte

const geraetServiceWithMapping = {
    ...geraetService,

    getAll: async () => {
        const response = await geraetService.getAll();
        return response.map((item: any) => {
            return new InventoryItem(
                item.inv_nr,  // Inventarnummer übernehmen
                item.Status,    // Platzhalter für Status
                "",           // Hersteller leer lassen
                "",           // Gerätefoto leer lassen
                item.Modell,  // Nur das Modell übernehmen
                "",           // Objekttyp leer lassen
                "",           // Seriennummer leer lassen
                new Date(),   // Kaufdatum mit Standardwert
                0,            // Einkaufspreis auf 0 setzen
                item.standort_id,           // Standort leer lassen
                "",           // Verantwortlicher leer lassen
                "",           // Bereich leer lassen
                "",           // Kategorie leer lassen
                [],           // Leeres Array für Attachments
                ""            // QR-Code leer lassen
            );
        });
    },
    createWhole: async (item: InventoryItem) => {

    }
};

export default geraetServiceWithMapping;
