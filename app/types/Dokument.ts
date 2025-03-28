interface Dokument {
    id: number;
    name: string;
    url: string;
    geraete_id: number;
    hochgeladen_am: string; // oder Date, wenn du ein Date-Objekt nutzen möchtest
}