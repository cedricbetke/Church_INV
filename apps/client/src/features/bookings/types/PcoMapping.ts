export type PcoMappingDevice = {
    invNr: number;
    modell: string | null;
    hersteller: string | null;
    bereich: string | null;
    standort: string | null;
};

export type PcoMapping = {
    id: number;
    pcoServiceTypeId: string;
    pcoServiceTypeName: string;
    isVirtual: boolean;
    sourceServiceTypeId: string | null;
    sourceServiceTypeName: string | null;
    sourceSeriesTitle: string | null;
    aktiv: boolean;
    erstelltAm: string;
    aktualisiertAm: string;
    geraete: PcoMappingDevice[];
};

export type UpdatePcoMappingPayload = {
    aktiv: boolean;
    geraete_inv_nr: number[];
};
