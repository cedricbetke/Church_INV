export interface BookingDevice {
    invNr: number;
    modell: string;
    hersteller?: string;
}

export interface Booking {
    id: number;
    titel: string;
    bucherName: string;
    zweck?: string;
    startDatum: string;
    endDatum: string;
    status: string;
    erstelltAm: string;
    geraete: BookingDevice[];
}

export interface CreateBookingPayload {
    titel: string;
    bucher_name: string;
    zweck?: string;
    start_datum: string;
    end_datum: string;
    geraete_inv_nr: number[];
}
