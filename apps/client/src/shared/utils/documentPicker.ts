import { Platform } from "react-native";

export interface PickedDocument {
    fileName: string;
    mimeType: string;
    dataUrl: string;
}

export const pickDocumentAsDataUrl = async (): Promise<PickedDocument | null> => {
    if (Platform.OS !== "web") {
        throw new Error("Dokument-Upload ist aktuell nur im Web verfügbar.");
    }

    return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.doc,.docx,.txt,.xlsx,.xls,.png,.jpg,.jpeg";

        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) {
                resolve(null);
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
