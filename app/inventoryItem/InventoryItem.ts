import {Status} from "@/app/inventoryItem/Status";

export default class InventoryItem {
    invNr: number;
    status: Status;
    hersteller: string;
    geräteFoto: string;
    modell: string;
    objekttyp: string;
    seriennummer: string;
    kaufdatum: Date;
    einkaufspreis: number;
    standort: string;
    verantwortlicher: string; // Verantwortliche Person fuer das Item
    bereich: string;
    kategorie: string;
    attachments: Attachment[]; //Liste mit Anlagen
    qrCode: string; // Eindeutiger Wert, der im QR-Code kodiert wird


    constructor(invNr: number, status: Status, hersteller:string, geräteFoto: string, modell: string, objekttyp: string, seriennummer: string, kaufdatum: Date, einkaufspreis: number, standort: string, verantwortlicher: string, bereich:string, kategorie: string, attachments: Attachment[], qrCode: string) {
        this.invNr = invNr;
        this.status = status;
        this.hersteller = hersteller;
        this.geräteFoto = geräteFoto;
        this.modell = modell;
        this.objekttyp = objekttyp;
        this.seriennummer = seriennummer;
        this.kaufdatum = kaufdatum;
        this.einkaufspreis = einkaufspreis;
        this.standort = standort;
        this.verantwortlicher = verantwortlicher;
        this.bereich = bereich;
        this.kategorie = kategorie;
        this.attachments = attachments;
        this.qrCode = qrCode;
    }
    addAttachment(attachment: Attachment): void {
        this.attachments.push(attachment);
    }

    removeAttachment(attachmentId: string): void {
        this.attachments = this.attachments.filter(att => att.id !== attachmentId);
    }
}
