export interface HistoryEntry {
    id: number;
    geraet_inv_nr: number;
    aktion: string;
    feld: string | null;
    alter_wert: string | null;
    neuer_wert: string | null;
    erstellt_am: string;
}
