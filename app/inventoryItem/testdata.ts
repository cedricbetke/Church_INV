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
const testItem4 = new InventoryItem(
    1004,
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
const testItem5 = new InventoryItem(
    1005,
    Status.IN_REPERATUR,
    "HP",
    "https://example.com/images/hp-printer.jpg",
    "LaserJet Pro MFP",
    "Drucker",
    "SN987654",
    new Date("2022-11-20"),
    350.75,
    "München",
    "Erika Beispiel",
    "Office Management",
    "Bürogeräte",
    [
        {
            id: "att2",
            name: "Garantie_Nachweis.pdf",
            type: "application/pdf",
            file: "https://example.com/garantie.pdf",
            uploadedAt: new Date("2022-12-01"),
        },
        {
            id: "att3",
            name: "Bedienungsanleitung.pdf",
            type: "application/pdf",
            file: "https://example.com/manual.pdf",
            uploadedAt: new Date("2022-12-05"),
        },
    ],
    "qrCode98765"
    );
const testItem6 = new InventoryItem(
    1006,
    Status.RESERVIERT,
    "Apple",
    "https://example.com/images/macbook.jpg",
    "MacBook Pro 16",
    "Laptop",
    "SN555888",
    new Date("2023-01-15"),
    2500.00,
    "Hamburg",
    "Hans Meier",
    "Design-Abteilung",
    "Elektronik",
    [
        {
            id: "att4",
            name: "Kaufbeleg.pdf",
            type: "application/pdf",
            file: "https://example.com/kaufbeleg.pdf",
            uploadedAt: new Date("2023-01-16"),
        },
    ],
    "qrCode55588"
);
const testItem7 =    new InventoryItem(
        1007,
        Status.IN_REPERATUR,
        "Logitech",
        "https://example.com/images/mouse.jpg",
        "MX Master 3",
        "Maus",
        "SN111222",
        new Date("2021-09-05"),
        99.99,
        "Köln",
        "Lisa Schmidt",
        "Support",
        "Peripherie",
        [],
        "qrCode11122"
    );
const testItem8 = new InventoryItem(
        1008,
        Status.VERFUEGBAR,
        "Samsung",
        "https://example.com/images/monitor.jpg",
        "Odyssey G7",
        "Monitor",
        "SN777999",
        new Date("2022-07-30"),
        699.99,
        "Frankfurt",
        "Thomas Müller",
        "Entwicklung",
        "Elektronik",
        [
            {
                id: "att5",
                name: "Lieferungsschein.pdf",
                type: "application/pdf",
                file: "https://example.com/lieferungsschein.pdf",
                uploadedAt: new Date("2022-08-01"),
            },
        ],
        "qrCode77799"
    );
const testItem9 = new InventoryItem(
    1009,
    Status.VERFUEGBAR,
    "Samsung",
    "https://example.com/images/monitor.jpg",
    "Odyssey G7",
    "Monitor",
    "SN777999",
    new Date("2022-07-30"),
    699.99,
    "Frankfurt",
    "Thomas Müller",
    "Entwicklung",
    "Elektronik",
    [
        {
            id: "att5",
            name: "Lieferungsschein.pdf",
            type: "application/pdf",
            file: "https://example.com/lieferungsschein.pdf",
            uploadedAt: new Date("2022-08-01"),
        },
    ],
    "qrCode77799"
);
const testItem10 = new InventoryItem(
    1010,
    Status.VERFUEGBAR,
    "Samsung",
    "https://example.com/images/monitor.jpg",
    "Odyssey G7",
    "Monitor",
    "SN777999",
    new Date("2022-07-30"),
    699.99,
    "Frankfurt",
    "Thomas Müller",
    "Entwicklung",
    "Elektronik",
    [
        {
            id: "att5",
            name: "Lieferungsschein.pdf",
            type: "application/pdf",
            file: "https://example.com/lieferungsschein.pdf",
            uploadedAt: new Date("2022-08-01"),
        },
    ],
    "qrCode77799"
);
const testItem11 = new InventoryItem(
    1011,
    Status.VERFUEGBAR,
    "Samsung",
    "https://example.com/images/monitor.jpg",
    "Odyssey G7",
    "Monitor",
    "SN777999",
    new Date("2022-07-30"),
    699.99,
    "Frankfurt",
    "Thomas Müller",
    "Entwicklung",
    "Elektronik",
    [
        {
            id: "att5",
            name: "Lieferungsschein.pdf",
            type: "application/pdf",
            file: "https://example.com/lieferungsschein.pdf",
            uploadedAt: new Date("2022-08-01"),
        },
    ],
    "qrCode77799"
);
// Alle Testobjekte in einem Array zusammenfassen
export const testInventoryItems: InventoryItem[] = [testItem1, testItem2, testItem3,testItem4, testItem5, testItem6, testItem7, testItem8, testItem9, testItem10,testItem11];
