// testData.ts
import InventoryItem from "@/app/inventoryItem/InventoryItem";
import { Status } from "@/app/inventoryItem/Status";


// Testobjekt 1 mit einem Attachment
const testItem1 = new InventoryItem(
    1001,
    Status.VERFUEGBAR,
    "Dell",
    "https://example.com/images/dell-laptop.jpg",
    "Latitude 7420",
    "Laptop",
    "SN123456",
    new Date("2023-05-10"),
    1200.50,
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
    "qrCode12345"
);

// Testobjekt 2 ohne Attachments
const testItem2 = new InventoryItem(
    1002,
    Status.IN_VERWENDUNG,
    "Apple",
    "",
    "iPhone 13",
    "Smartphone",
    "SN789012",
    new Date("2022-11-25"),
    999.99,
    "München",
    "Erika Mustermann",
    "Vertrieb",
    "Elektronik",
    [],
    "qrCode67890"
);

// Testobjekt 3 mit einem Attachment
const testItem3 = new InventoryItem(
    1003,
    Status.IN_REPERATUR,
    "HP",
    "",
    "OfficeJet Pro 9025",
    "Drucker",
    "SN345678",
    new Date("2021-07-15"),
    350.75,
    "Hamburg",
    "Peter Schmidt",
    "Büro",
    "Drucker",
    [
        {
            id: "att2",
            name: "Servicebericht.pdf",
            type: "application/pdf",
            file: "https://example.com/servicebericht.pdf",
            uploadedAt: new Date("2021-07-20"),
        },
    ],
    "qrCode54321"
);

// Alle Testobjekte in einem Array zusammenfassen
export const testInventoryItems: InventoryItem[] = [testItem1, testItem2, testItem3];
