import statusService from "./statusService";
import bereichService from "@/web/bereichService";
import dokumenteService from "@/web/dokumenteService";
import geraeteService from "@/web/geraeteService";

// Alle Status abrufen
statusService.getAll().then((data) => console.log("Alle Status:", data));
bereichService.getAll().then((data) => console.log("Alle Bereiche:", data));
dokumenteService.getAll().then((data) => console.log("Alle Dokumente:", data));
geraeteService.getAll().then((data) => console.log("Alle Geräte:", data));
/*
const newGeraet: Omit<Geraet, "inv_nr"> = {
    status_id: 1,
    modell_id: 1,
    bereich_id: 2,
    standort_id: 3,
    verantwortlicher_id: 1,
    kategorie_id: 1,
    serien_nr: "dfghrthr",     // optional
    qrcode: "QR12345",       // optional
    geraetefoto_url: "http://example.com/photo.jpg" // optional
};

// Diese Daten solltest du dann im create-Aufruf senden
geraeteService.create(newGeraet);



 */