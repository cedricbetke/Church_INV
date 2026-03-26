import axios from "axios";
import { FormData } from "@/src/features/inventory/types/FormData";
import Attachment from "@/src/features/inventory/types/Attachment";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";

export interface NamedItem {
    id: number;
    name: string;
}

export interface PendingModel {
    id: number;
    name: string;
    herstellerName: string;
    objekttypName: string;
}

export interface EditableAttachment extends Attachment {
    isPending?: boolean;
    markedForDeletion?: boolean;
    dataUrl?: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PRICE_PATTERN = /^\d+(?:[.,]\d{1,2})?$/;
const INTEGER_PATTERN = /^\d+$/;

export const today = new Date();

export const emptyFormData: FormData = {
    invNr: "",
    objekttyp: "",
    modell: "",
    hersteller: "",
    serien_nr: "",
    kaufdatum: "",
    einkaufspreis: "",
    zustandshinweis: "",
    standort: "",
    bereich: "",
    kategorie: "",
    status: "",
    verantwortlicher: "",
};

export const normalize = (value: string) => value.trim().toLowerCase();

export const parsePrice = (value: string) => Number.parseFloat(value.replace(",", "."));

export const formatDateForDb = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const parseDbDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};

export const isFutureDbDate = (value: string) => {
    if (!isValidIsoDate(value)) {
        return false;
    }

    return value > formatDateForDb(new Date());
};

export const toStoredAssetPath = (value?: string | null) => {
    if (!value) {
        return null;
    }

    if (value.startsWith("/uploads/") || value.startsWith("data:")) {
        return value;
    }

    if (/^https?:\/\//i.test(value)) {
        try {
            const url = new URL(value);
            if (url.pathname.startsWith("/uploads/")) {
                return url.pathname;
            }
        } catch {
            return value;
        }
    }

    return value;
};

export const isValidIsoDate = (value: string) => {
    if (!DATE_PATTERN.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

export const getErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return "Fehler beim Speichern des Items";
    }

    if (!error.response) {
        return "Der Server ist nicht erreichbar. Bitte Verbindung und API-URL pruefen.";
    }

    const { status, data } = error.response;
    const backendMessage =
        typeof data === "string"
            ? data
            : typeof data?.message === "string"
                ? data.message
                : typeof data?.error === "string"
                    ? data.error
                    : null;

    if (status === 400) {
        return backendMessage ?? "Die uebermittelten Daten sind ungueltig.";
    }

    if (status === 403) {
        return backendMessage ?? "Diese Aktion ist nur mit Admin-Rechten erlaubt.";
    }

    if (status === 404) {
        return backendMessage ?? "Die API-Route wurde nicht gefunden.";
    }

    if (status === 409) {
        if (backendMessage?.toLowerCase().includes("inventarnummer")) {
            return backendMessage;
        }

        return backendMessage ?? "Der Datensatz steht in Konflikt mit vorhandenen Daten.";
    }

    if (status === 503) {
        return backendMessage ?? "Die Admin-Freigabe ist auf dem Server nicht konfiguriert.";
    }

    if (status >= 500) {
        return backendMessage ?? "Serverfehler beim Speichern des Items.";
    }

    return backendMessage ?? "Fehler beim Speichern des Items";
};

export const findByName = <T extends NamedItem>(items: T[], name: string) =>
    items.find((item) => normalize(item.name) === normalize(name));

export const buildPersonItems = (personen: Person[]): NamedItem[] =>
    personen.map((person) => ({
        id: person.id,
        name: `${person.vorname} ${person.nachname}`.trim(),
    }));

export const mapEditingItemToFormData = (
    editingItem: InventoryItem,
    existingModels: Modell[],
    existingBrands: Hersteller[],
): FormData => {
    const model = existingModels.find((entry) => normalize(entry.name) === normalize(editingItem.modell));
    const brand = model
        ? existingBrands.find((entry) => entry.id === model.hersteller_id)
        : existingBrands.find((entry) => normalize(entry.name) === normalize(editingItem.hersteller ?? ""));

    return {
        invNr: String(editingItem.invNr),
        objekttyp: editingItem.objekttyp ?? "",
        modell: editingItem.modell ?? "",
        hersteller: brand?.name ?? editingItem.hersteller ?? "",
        serien_nr: editingItem.seriennummer ?? "",
        kaufdatum: editingItem.kaufdatum ? formatDateForDb(editingItem.kaufdatum) : "",
        einkaufspreis: editingItem.einkaufspreis != null ? String(editingItem.einkaufspreis).replace(".", ",") : "",
        zustandshinweis: editingItem.zustandshinweis ?? "",
        standort: editingItem.standort ?? "",
        bereich: editingItem.bereich ?? "",
        kategorie: editingItem.kategorie ?? "",
        status: editingItem.status ?? "",
        verantwortlicher: editingItem.verantwortlicher ?? "",
    };
};

export const getFilteredModels = ({
    existingModels,
    existingBrands,
    objekttypen,
    pendingModel,
    formData,
}: {
    existingModels: Modell[];
    existingBrands: Hersteller[];
    objekttypen: Array<{ id: number; name: string }>;
    pendingModel: PendingModel | null;
    formData: FormData;
}): Modell[] => {
    const selectedBrand = existingBrands.find((brand) => normalize(brand.name) === normalize(formData.hersteller));
    const matchesPendingModel = pendingModel &&
        normalize(pendingModel.herstellerName) === normalize(formData.hersteller) &&
        normalize(pendingModel.objekttypName) === normalize(formData.objekttyp);

    if (!selectedBrand?.id) {
        return matchesPendingModel
            ? [{ ...pendingModel, hersteller_id: -1, objekttyp_id: 0 } as Modell]
            : [];
    }

    return [
        ...existingModels.filter((model) =>
            model.hersteller_id === selectedBrand.id &&
            (formData.objekttyp
                ? objekttypen.find((objekttyp) => objekttyp.id === model.objekttyp_id)?.name &&
                  normalize(objekttypen.find((objekttyp) => objekttyp.id === model.objekttyp_id)!.name) === normalize(formData.objekttyp)
                : true)
        ),
        ...(matchesPendingModel
            ? [{ ...pendingModel, hersteller_id: selectedBrand.id, objekttyp_id: 0 } as Modell]
            : []),
    ];
};

export const getFilteredKategorien = (formData: FormData, bereiche: Bereich[], kategorien: Kategorie[]) => {
    const selectedBereich = bereiche.find(
        (bereich) => normalize(bereich.name) === normalize(formData.bereich),
    );

    return selectedBereich
        ? kategorien.filter((kategorie) => kategorie.bereich_id === selectedBereich.id)
        : kategorien;
};

export const validateFormData = (formData: FormData) => {
    const nextErrors: Record<string, string> = {};

    if (!formData.invNr) nextErrors.invNr = "Inventarnummer ist erforderlich";
    if (formData.invNr && !INTEGER_PATTERN.test(formData.invNr.trim())) {
        nextErrors.invNr = "Inventarnummer muss eine positive ganze Zahl sein";
    }
    if (formData.invNr && INTEGER_PATTERN.test(formData.invNr.trim()) && Number(formData.invNr) <= 0) {
        nextErrors.invNr = "Inventarnummer muss groesser als 0 sein";
    }
    if (!formData.modell) nextErrors.modell = "Modell ist erforderlich";
    if (!formData.objekttyp) nextErrors.objekttyp = "Objekttyp ist erforderlich";
    if (!formData.status) nextErrors.status = "Status ist erforderlich";
    if (!formData.bereich) nextErrors.bereich = "Bereich ist erforderlich";
    if (formData.kaufdatum && !isValidIsoDate(formData.kaufdatum)) {
        nextErrors.kaufdatum = "Kaufdatum muss im Format YYYY-MM-DD sein";
    }
    if (formData.kaufdatum && isFutureDbDate(formData.kaufdatum)) {
        nextErrors.kaufdatum = "Kaufdatum darf nicht in der Zukunft liegen";
    }
    if (formData.einkaufspreis && !PRICE_PATTERN.test(formData.einkaufspreis.trim())) {
        nextErrors.einkaufspreis = "Einkaufspreis muss eine Zahl mit bis zu 2 Nachkommastellen sein";
    }

    return nextErrors;
};

export const buildMasterdataResolutionError = ({
    selectedModel,
    selectedStatus,
    selectedBereich,
    selectedStandort,
    selectedKategorie,
    selectedVerantwortlicher,
    formData,
}: {
    selectedModel?: Modell;
    selectedStatus?: Status;
    selectedBereich?: Bereich;
    selectedStandort?: Standort;
    selectedKategorie?: Kategorie;
    selectedVerantwortlicher?: NamedItem;
    formData: FormData;
}): { field: keyof FormData; message: string } => {
    if (!selectedModel) {
        return {
            field: "modell",
            message: `Das Modell "${formData.modell}" konnte nicht aufgeloest werden.`,
        };
    }

    if (!selectedStatus) {
        return {
            field: "status",
            message: `Der Status "${formData.status}" konnte nicht aufgeloest werden.`,
        };
    }

    if (!selectedBereich) {
        return {
            field: "bereich",
            message: `Der Bereich "${formData.bereich}" konnte nicht aufgeloest werden.`,
        };
    }

    if (formData.standort && !selectedStandort) {
        return {
            field: "standort",
            message: `Der Standort "${formData.standort}" konnte nicht aufgeloest werden.`,
        };
    }

    if (formData.kategorie && !selectedKategorie) {
        return {
            field: "kategorie",
            message: `Die Kategorie "${formData.kategorie}" konnte nicht aufgeloest werden.`,
        };
    }

    if (formData.verantwortlicher && !selectedVerantwortlicher) {
        return {
            field: "verantwortlicher",
            message: `Der Verantwortliche "${formData.verantwortlicher}" konnte nicht aufgeloest werden.`,
        };
    }

    return {
        field: "modell",
        message: "Die ausgewaehlten Stammdaten konnten nicht aufgeloest werden.",
    };
};
