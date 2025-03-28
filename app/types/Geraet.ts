interface Geraet {
    inv_nr: number;
    status_id: number;
    geraetefoto_url?: string;
    modell_id: number;
    serien_nr?: string;
    kaufdatum?: string; // oder Date, wenn du ein Date-Objekt möchtest
    einkaufspreis?: number;
    standort_id?: number;
    verantwortlicher_id?: number;
    bereich_id: number;
    kategorie_id?: number;
    qrcode?: string;
}