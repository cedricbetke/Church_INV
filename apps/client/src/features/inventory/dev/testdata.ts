import InventoryItem from "@/src/features/inventory/types/InventoryItem";

const testItem1: InventoryItem = {
    invNr: 1001,
    status: "Aktiv",
    hersteller: "Dell",
    geraeteFoto: "https://example.com/images/dell-laptop.jpg",
    modell: "Latitude 7420",
    objekttyp: "Laptop",
    seriennummer: "SN123456",
    kaufdatum: new Date("2023-05-10"),
    einkaufspreis: 1200.5,
    standort: "Berlin",
    verantwortlicher: "Max Mustermann",
    bereich: "IT-Abteilung",
    kategorie: "Elektronik",
    attachments: [
        {
            id: "att1",
            name: "Rechnung.pdf",
            type: "application/pdf",
            file: "https://example.com/rechnung.pdf",
            uploadedAt: new Date("2023-05-11"),
        },
    ],
    qrCode: "qrCode12345",
};

export const testInventoryItems: InventoryItem[] = [testItem1];
