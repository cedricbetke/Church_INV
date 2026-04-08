import { Platform } from "react-native";

const MB_IN_BYTES = 1024 * 1024;

const DOCUMENT_UPLOAD_ALLOWED_EXTENSIONS = new Set([
    "pdf",
    "doc",
    "docx",
    "txt",
    "xlsx",
    "xls",
    "png",
    "jpg",
    "jpeg",
]);

const DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/png",
    "image/jpeg",
]);

export const DOCUMENT_UPLOAD_ACCEPT = ".pdf,.doc,.docx,.txt,.xlsx,.xls,.png,.jpg,.jpeg";
export const DOCUMENT_UPLOAD_ALLOWED_TYPE_LABEL = "PDF, Word, Excel, TXT, PNG, JPG";
export const DOCUMENT_UPLOAD_MAX_SIZE_BYTES = 10 * MB_IN_BYTES;
export const DOCUMENT_UPLOAD_MAX_SIZE_LABEL = "10 MB";

export interface PickedDocument {
    fileName: string;
    mimeType: string;
    dataUrl: string;
}

const getFileExtension = (fileName: string) => {
    const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/);
    return match?.[1] ?? "";
};

const validatePickedDocument = (file: File) => {
    const fileExtension = getFileExtension(file.name);
    const mimeType = file.type.toLowerCase();
    const hasAllowedExtension = DOCUMENT_UPLOAD_ALLOWED_EXTENSIONS.has(fileExtension);
    const hasAllowedMimeType = mimeType.length > 0 && DOCUMENT_UPLOAD_ALLOWED_MIME_TYPES.has(mimeType);

    if (!hasAllowedExtension && !hasAllowedMimeType) {
        throw new Error(`Dateityp nicht erlaubt. Erlaubt sind ${DOCUMENT_UPLOAD_ALLOWED_TYPE_LABEL}.`);
    }

    if (file.size > DOCUMENT_UPLOAD_MAX_SIZE_BYTES) {
        throw new Error(`Dokument ist zu gross. Maximal ${DOCUMENT_UPLOAD_MAX_SIZE_LABEL} erlaubt.`);
    }
};

export const pickDocumentAsDataUrl = async (): Promise<PickedDocument | null> => {
    if (Platform.OS !== "web") {
        throw new Error("Dokument-Upload ist aktuell nur im Web verfügbar.");
    }

    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = DOCUMENT_UPLOAD_ACCEPT;

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) {
                resolve(null);
                return;
            }

            try {
                validatePickedDocument(file);
            } catch (error) {
                reject(error);
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result !== "string") {
                    reject(new Error("Datei konnte nicht gelesen werden."));
                    return;
                }

                resolve({
                    fileName: file.name,
                    mimeType: file.type || "application/octet-stream",
                    dataUrl: reader.result,
                });
            };
            reader.onerror = () => reject(new Error("Datei konnte nicht gelesen werden."));
            reader.readAsDataURL(file);
        };

        input.click();
    });
};
