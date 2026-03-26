import apiClient from "@/src/shared/api/apiClient";
import { Booking, CreateBookingPayload } from "@/src/features/bookings/types/Booking";

type BookingApiResponse = {
    id: number;
    titel: string;
    bucher_name: string;
    zweck?: string | null;
    start_datum: string;
    end_datum: string;
    status: string;
    erstellt_am: string;
    geraete: Array<{
        inv_nr: number;
        modell: string;
        hersteller?: string | null;
    }>;
};

const mapBooking = (booking: BookingApiResponse): Booking => ({
    id: booking.id,
    titel: booking.titel,
    bucherName: booking.bucher_name,
    zweck: booking.zweck ?? undefined,
    startDatum: booking.start_datum,
    endDatum: booking.end_datum,
    status: booking.status,
    erstelltAm: booking.erstellt_am,
    geraete: booking.geraete.map((geraet) => ({
        invNr: geraet.inv_nr,
        modell: geraet.modell,
        hersteller: geraet.hersteller ?? undefined,
    })),
});

const buchungService = {
    getAll: async (): Promise<Booking[]> => {
        const data = await apiClient.getAll<BookingApiResponse[]>("buchung");
        return data.map(mapBooking);
    },
    create: async (payload: CreateBookingPayload): Promise<Booking> => {
        const data = await apiClient.create<BookingApiResponse>("buchung", payload);
        return mapBooking(data);
    },
    delete: async (id: number) => apiClient.delete("buchung", id),
};

export default buchungService;
