import Attachment from "@/src/features/inventory/types/Attachment";

interface InventoryItem {
    invNr: number;
    statusid: number;
    hersteller: string;
    geraeteFoto: string;
    modell: string;
    objekttyp: string;
    seriennummer: string;
    kaufdatum: Date;
    einkaufspreis: number;
    standort: string;
    verantwortlicher: string;
    bereich: string;
    kategorie: string;
    attachments: Attachment[];
    qrCode: string;
}

export default InventoryItem;
