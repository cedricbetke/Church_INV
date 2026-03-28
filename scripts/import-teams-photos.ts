import fs from "node:fs";
import path from "node:path";
import type { APIRequestContext } from "playwright";
import { request } from "playwright";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { optimizePhotoToStoredPath, ensureThumbnailForStoredPhoto } = require("../apps/api/src/utils/photoThumbnails");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("../apps/api/src/config/db");

type CsvRow = Record<string, string>;

type ImportWarning = {
    invNr?: number;
    itemId?: number;
    type: string;
    message: string;
};

type ImportError = {
    invNr?: number;
    itemId?: number;
    message: string;
    row?: CsvRow;
};

type ImportSummary = {
    sourceFile: string;
    processedRows: number;
    importedPhotos: number;
    skippedPhotos: number;
    skippedRows: number;
    warnings: ImportWarning[];
    errors: ImportError[];
};

type SharePointPhotoMetadata = {
    fileName: string;
    downloadUrl: string;
};

const rootDir = process.cwd();
const defaultCsvPath = path.join(rootDir, "import", "teams-export-with-id.csv");
const defaultStorageStatePath = path.join(rootDir, "import", "sharepoint-storage-state.json");
const reportPath = path.join(rootDir, "import", "photos-import-report.json");
const uploadDir = path.resolve(rootDir, "apps", "api", "uploads", "geraete");

const DEFAULTS = {
    siteOrigin: "https://efkoeln.sharepoint.com",
    sitePath: "/sites/netzwerk",
    listTitle: "Inventar Liste",
} as const;

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".heic", ".heif", ".dng"]);

const parseArgs = () => {
    const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
    const storageStateArg = process.argv.find((arg) => arg.startsWith("--storage-state="));
    const dryRun = process.argv.includes("--dry-run");

    return {
        filePath: fileArg ? path.resolve(rootDir, fileArg.slice("--file=".length)) : defaultCsvPath,
        storageStatePath: storageStateArg
            ? path.resolve(rootDir, storageStateArg.slice("--storage-state=".length))
            : defaultStorageStatePath,
        dryRun,
    };
};

const parseCsv = (input: string): string[][] => {
    const rows: string[][] = [];
    let currentCell = "";
    let currentRow: string[] = [];
    let insideQuotes = false;

    for (let index = 0; index < input.length; index += 1) {
        const char = input[index];
        const nextChar = input[index + 1];

        if (char === "\"") {
            if (insideQuotes && nextChar === "\"") {
                currentCell += "\"";
                index += 1;
                continue;
            }

            insideQuotes = !insideQuotes;
            continue;
        }

        if (char === "," && !insideQuotes) {
            currentRow.push(currentCell);
            currentCell = "";
            continue;
        }

        if ((char === "\n" || char === "\r") && !insideQuotes) {
            if (char === "\r" && nextChar === "\n") {
                index += 1;
            }

            currentRow.push(currentCell);
            if (currentRow.some((value) => value.length > 0)) {
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = "";
            continue;
        }

        currentCell += char;
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
        currentRow.push(currentCell);
        rows.push(currentRow);
    }

    return rows;
};

const rowsToObjects = (rows: string[][]): CsvRow[] => {
    const [headerRow, ...dataRows] = rows;
    const normalizedHeader = headerRow.map((cell) => cell.replace(/^\uFEFF/, "").trim());

    return dataRows.map((row) =>
        normalizedHeader.reduce<CsvRow>((record, header, index) => {
            record[header] = row[index] ?? "";
            return record;
        }, {}),
    );
};

const cleanText = (value: string | null | undefined) => {
    if (!value) {
        return "";
    }

    return value
        .replace(/\uFEFF/g, "")
        .replace(/\s+/g, " ")
        .trim();
};

const safeFileName = (value: string) =>
    cleanText(value)
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .replace(/\s+/g, "_");

const createStoredPhotoName = (invNr: number, fileName: string) =>
    `${Date.now()}_${invNr}_${safeFileName(fileName).replace(/\.[^.]+$/, "")}.jpg`;

const writeReport = (summary: ImportSummary) => {
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");
};

const createRequestContext = async (storageStatePath: string) =>
    request.newContext({
        baseURL: DEFAULTS.siteOrigin,
        storageState: storageStatePath,
        extraHTTPHeaders: {
            Accept: "application/json;odata=nometadata",
        },
    });

const fetchJson = async (requestContext: APIRequestContext, url: string) => {
    const response = await requestContext.get(url);
    if (!response.ok()) {
        throw new Error(`SharePoint API ${response.status()} fuer ${url}`);
    }

    return response.json();
};

const fetchBinary = async (requestContext: APIRequestContext, url: string) => {
    const response = await requestContext.get(url);
    if (!response.ok()) {
        throw new Error(`Bilddownload ${response.status()} fuer ${url}`);
    }

    return Buffer.from(await response.body());
};

const isDevicePhotoAttachment = (fileName: string) => {
    const normalizedName = cleanText(fileName);
    const extension = path.extname(normalizedName).toLowerCase();

    return normalizedName.startsWith("Reserved_ImageAttachment_") && imageExtensions.has(extension);
};

const getGeraetMap = async () => {
    const [rows] = await db.query("SELECT inv_nr, geraetefoto_url FROM geraet");
    return new Map(
        rows.map((row: { inv_nr: number; geraetefoto_url: string | null }) => [
            row.inv_nr,
            cleanText(row.geraetefoto_url),
        ]),
    );
};

const parsePhotoValue = (rawValue: unknown): SharePointPhotoMetadata | null => {
    if (!rawValue) {
        return null;
    }

    let value: Record<string, unknown> | null = null;

    if (typeof rawValue === "string") {
        const trimmed = cleanText(rawValue);
        if (!trimmed) {
            return null;
        }

        try {
            value = JSON.parse(trimmed);
        } catch {
            return null;
        }
    } else if (typeof rawValue === "object") {
        value = rawValue as Record<string, unknown>;
    }

    if (!value) {
        return null;
    }

    const possibleUrl =
        cleanText(value.serverRelativeUrl as string) ||
        cleanText(value.serverRelativePath as string) ||
        cleanText(value.fileServerRelativeUrl as string) ||
        cleanText(value.url as string) ||
        cleanText(value.Url as string);

    const possibleFileName =
        cleanText(value.fileName as string) ||
        cleanText(value.fileNamePath as string) ||
        cleanText(value.name as string) ||
        path.basename(possibleUrl);

    if (!possibleUrl || !possibleFileName) {
        return null;
    }

    const downloadUrl = possibleUrl.startsWith("http")
        ? possibleUrl
        : `${DEFAULTS.siteOrigin}${possibleUrl.startsWith("/") ? possibleUrl : `/${possibleUrl}`}`;

    return {
        fileName: possibleFileName,
        downloadUrl,
    };
};

const getPhotoFromAttachments = async (requestContext: APIRequestContext, itemId: number) => {
    const attachmentApiUrl =
        `${DEFAULTS.sitePath}` +
        `/_api/web/lists/getbytitle('${DEFAULTS.listTitle}')/items(${itemId})/AttachmentFiles`;

    const attachmentData = await fetchJson(requestContext, attachmentApiUrl);
    const attachments = Array.isArray(attachmentData.value) ? attachmentData.value : [];

    const photoAttachment = attachments.find((attachment: Record<string, unknown>) =>
        isDevicePhotoAttachment(cleanText(attachment.FileName as string)),
    );

    if (!photoAttachment) {
        return null;
    }

    const fileName = cleanText(photoAttachment.FileName as string);
    const serverRelativeUrl = cleanText(
        (photoAttachment.ServerRelativeUrl as string) ??
            (photoAttachment.ServerRelativePath as string) ??
            (photoAttachment.FileRef as string) ??
            "",
    );

    if (!fileName || !serverRelativeUrl) {
        return null;
    }

    return {
        fileName,
        downloadUrl: `${DEFAULTS.siteOrigin}${serverRelativeUrl}`,
    } satisfies SharePointPhotoMetadata;
};

const main = async () => {
    const { filePath, storageStatePath, dryRun } = parseArgs();

    if (!fs.existsSync(storageStatePath)) {
        throw new Error(
            `Storage-State-Datei nicht gefunden: ${storageStatePath}. Fuehre zuerst den Dokument-Import mit Browser-Login aus oder lege die Datei dort ab.`,
        );
    }

    const csvContent = fs.readFileSync(filePath, "utf8");
    const csvRows = rowsToObjects(parseCsv(csvContent));
    const geraetMap = await getGeraetMap();

    const summary: ImportSummary = {
        sourceFile: filePath,
        processedRows: 0,
        importedPhotos: 0,
        skippedPhotos: 0,
        skippedRows: 0,
        warnings: [],
        errors: [],
    };

    fs.mkdirSync(uploadDir, { recursive: true });

    const requestContext = await createRequestContext(storageStatePath);

    try {
        for (const row of csvRows) {
            summary.processedRows += 1;

            const itemId = Number.parseInt(cleanText(row.ID), 10);
            const invNr = Number.parseInt(cleanText(row["Inventar Nummer"]), 10);

            if (!Number.isInteger(itemId) || itemId <= 0 || !Number.isInteger(invNr) || invNr <= 0) {
                summary.skippedRows += 1;
                summary.errors.push({
                    itemId: Number.isInteger(itemId) ? itemId : undefined,
                    invNr: Number.isInteger(invNr) ? invNr : undefined,
                    message: "ID oder Inventar Nummer ungueltig",
                    row,
                });
                continue;
            }

            const currentPhotoUrl = geraetMap.get(invNr);
            if (currentPhotoUrl === undefined) {
                summary.skippedRows += 1;
                summary.errors.push({
                    itemId,
                    invNr,
                    message: "Geraet zur Inventar Nummer nicht in der DB gefunden",
                    row,
                });
                continue;
            }

            if (currentPhotoUrl) {
                summary.skippedPhotos += 1;
                summary.warnings.push({
                    itemId,
                    invNr,
                    type: "photo-exists",
                    message: "Geraet hat bereits ein Foto in der DB und wird uebersprungen.",
                });
                continue;
            }

            try {
                const itemUrl =
                    `${DEFAULTS.sitePath}` +
                    `/_api/web/lists/getbytitle('${DEFAULTS.listTitle}')/items(${itemId})?$select=ID,Title,DevicePhoto`;

                const itemData = await fetchJson(requestContext, itemUrl);
                const photo = parsePhotoValue(itemData.DevicePhoto) ?? (await getPhotoFromAttachments(requestContext, itemId));

                if (!photo) {
                    summary.warnings.push({
                        itemId,
                        invNr,
                        type: "no-photo",
                        message: "Kein Geraetefoto fuer dieses SharePoint-Item gefunden.",
                    });
                    continue;
                }

                if (dryRun) {
                    summary.importedPhotos += 1;
                    continue;
                }

                const photoBuffer = await fetchBinary(requestContext, photo.downloadUrl);
                const storedFileName = createStoredPhotoName(invNr, photo.fileName);
                const storedRelativePath = `/uploads/geraete/${storedFileName}`;
                const storedAbsolutePath = path.join(uploadDir, storedFileName);

                await optimizePhotoToStoredPath(photoBuffer, storedAbsolutePath);
                await ensureThumbnailForStoredPhoto(storedRelativePath);
                await db.query("UPDATE geraet SET geraetefoto_url = ? WHERE inv_nr = ?", [storedRelativePath, invNr]);

                geraetMap.set(invNr, storedRelativePath);
                summary.importedPhotos += 1;
            } catch (error) {
                summary.skippedRows += 1;
                summary.errors.push({
                    itemId,
                    invNr,
                    message: error instanceof Error ? error.message : "Unbekannter Foto-Importfehler",
                    row,
                });
            }
        }
    } finally {
        await requestContext.dispose();
    }

    writeReport(summary);

    console.log(`Foto-Import abgeschlossen${dryRun ? " (dry-run)" : ""}.`);
    console.log(`Verarbeitete Zeilen: ${summary.processedRows}`);
    console.log(`Importierte Fotos: ${summary.importedPhotos}`);
    console.log(`Uebersprungene Fotos: ${summary.skippedPhotos}`);
    console.log(`Uebersprungene Zeilen: ${summary.skippedRows}`);
    console.log(`Report: ${reportPath}`);
};

void main().catch((error) => {
    console.error("Foto-Import fehlgeschlagen:", error);
    process.exitCode = 1;
});
