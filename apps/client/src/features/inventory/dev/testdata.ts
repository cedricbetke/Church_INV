import InventoryItem from "@/src/features/inventory/types/InventoryItem";

const testItem1 = new InventoryItem(
    1001,
    { id: 1, name: 2 } as any,
    "Dell",
    "https://example.com/images/dell-laptop.jpg",
    "Latitude 7420",
    "Laptop",
    "SN123456",
    new Date("2023-05-10"),
    1200.5,
    "Berlin",
    "Max Mustermann",
    "IT-Abteilung",
    "Elektronik",
    [
        {
            id: "att1",
            name: "Rechnung.pdf",
            type: "application/pdf",
            file: "https://example.com/rechnung.pdf",
            uploadedAt: new Date("2023-05-11"),
        },
    ],
    "qrCode12345",
);

export const testInventoryItems: InventoryItem[] = [testItem1];
