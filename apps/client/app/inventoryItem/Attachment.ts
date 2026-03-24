export default interface Attachment {
    id: string;          // Eindeutige ID
    name: string;        // Dateiname (z. B. "Rechnung.pdf")
    type: string;        // Dateityp (z. B. "application/pdf")
    file: string;         // URL oder Base64-Inhalt der Datei
    uploadedAt: Date;    // Hochladedatum
}
