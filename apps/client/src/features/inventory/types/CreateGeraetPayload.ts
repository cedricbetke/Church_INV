export interface CreateGeraetPayload {
    inv_nr: number;
    status_id: number;
    modell_id: number;
    bereich_id: number;
    standort_id?: number;
    verantwortlicher_id?: number;
    kategorie_id?: number;
    serien_nr?: string;
    kaufdatum?: string;
    einkaufspreis?: number;
    zustandshinweis?: string;
    geraetefoto_url?: string;
}

export type UpdateGeraetPayload = Partial<CreateGeraetPayload>;
