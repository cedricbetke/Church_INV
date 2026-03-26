import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import type { APIRequestContext, BrowserContext } from "playwright";
import { chromium, request } from "playwright";

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
    importedDocuments: number;
    skippedDocuments: number;
    skippedRows: number;
    warnings: ImportWarning[];
    errors: ImportError[];
};

const rootDir = process.cwd();
const defaultCsvPath = path.join(rootDir, "import", "teams-export-with-id.csv");
const defaultStorageStatePath = path.join(rootDir, "import", "sharepoint-storage-state.json");
const reportPath = path.join(rootDir, "import", "documents-import-report.json");
const uploadDir = path.resolve(rootDir, "apps", "api", "uploads", "dokumente");

const DEFAULTS = {
    siteOrigin: "https://efkoeln.sharepoint.com",
    sitePath: "/sites/netzwerk",
    listTitle: "Inventar Liste",
    loginUrl: "https://efkoeln.sharepoint.com/sites/netzwerk/Lists/Inventar%20Liste/AllItems.aspx",
} as const;

const parseArgs = () => {
    const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
    const storageStateArg = process.argv.find((arg) => arg.startsWith("--storage-state="));
    const dryRun = process.argv.includes("--dry-run");
    const freshLogin = process.argv.includes("--fresh-login");
    const headless = process.argv.includes("--headless");

    return {
        filePath: fileArg ? path.resolve(rootDir, fileArg.slice("--file=".length)) : defaultCsvPath,
        storageStatePath: storageStateArg
            ? path.resolve(rootDir, storageStateArg.slice("--storage-state=".length))
            : defaultStorageStatePath,
        dryRun,
        freshLogin,
        headless,
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

const decodeSharePointText = (value: string) => {
    const cleaned = cleanText(value);
    if (!cleaned.includes("Ã")) {
        return cleaned;
    }

    try {
        return Buffer.from(cleaned, "latin1").toString("utf8");
    } catch {
        return cleaned;
    }
};

const safeFileName = (value: string) =>
    cleanText(value)
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .replace(/\s+/g, "_");

const createStoredDocumentName = (invNr: number, fileName: string) => `${Date.now()}_${invNr}_${safeFileName(fileName)}`;

const writeReport = (summary: ImportSummary) => {
    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");
};

const getGeraetInvNrSet = async () => {
    const [rows] = await db.query("SELECT inv_nr FROM geraet");
    return new Set(rows.map((row: { inv_nr: number }) => row.inv_nr));
};

const getExistingDocumentKeys = async () => {
    const [rows] = await db.query("SELECT geraete_id, name FROM dokumente");
    return new Set(rows.map((row: { geraete_id: number; name: string }) => `${row.geraete_id}:${cleanText(row.name)}`));
};

const ensureStorageState = async (storageStatePath: string, headless: boolean, freshLogin: boolean) => {
    if (!freshLogin && fs.existsSync(storageStatePath)) {
        return;
    }

    let browser;

    try {
        browser = await chromium.launch({
            headless,
            channel: "chrome",
        });
    } catch {
        browser = await chromium.launch({ headless });
    }

    let context: BrowserContext | undefined;

    try {
        context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(DEFAULTS.loginUrl, { waitUntil: "domcontentloaded" });

        console.log("");
        console.log("SharePoint-Login erforderlich.");
        console.log("Im geoeffneten Browserfenster bei SharePoint anmelden.");
        console.log("Sobald die Inventarliste geladen ist, hier im Terminal Enter druecken.");

        const rl = readline.createInterface({ input, output });
        await rl.question("");
        rl.close();

        await context.storageState({ path: storageStatePath });
    } finally {
        await context?.close();
        await browser.close();
    }
};

const createRequestContext = async (storageStatePath: string) =>
    request.newContext({
        baseURL: DEFAULTS.siteOrigin,
        storageState: storageStatePath,
        extraHTTPHeaders: {
            Accept: "application/json;odata=nometadata",
        },
    });

const fetchJson = async (request: APIRequestContext, url: string) => {
    const response = await request.get(url);
    if (!response.ok()) {
        throw new Error(`SharePoint API ${response.status()} fuer ${url}`);
    }

    return response.json();
};

const fetchBinary = async (request: APIRequestContext, url: string) => {
    const response = await request.get(url);
    if (!response.ok()) {
        throw new Error(`Dateidownload ${response.status()} fuer ${url}`);
    }

    return Buffer.from(await response.body());
};

const main = async () => {
    const { filePath, storageStatePath, dryRun, freshLogin, headless } = parseArgs();
    const csvContent = fs.readFileSync(filePath, "utf8");
    const csvRows = rowsToObjects(parseCsv(csvContent));
    const existingGeraete = await getGeraetInvNrSet();
    const existingDocumentKeys = await getExistingDocumentKeys();

    const summary: ImportSummary = {
        sourceFile: filePath,
        processedRows: 0,
        importedDocuments: 0,
        skippedDocuments: 0,
        skippedRows: 0,
        warnings: [],
        errors: [],
    };

    fs.mkdirSync(uploadDir, { recursive: true });
    fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

    await ensureStorageState(storageStatePath, headless, freshLogin);
    const request = await createRequestContext(storageStatePath);

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

            if (!existingGeraete.has(invNr)) {
                summary.skippedRows += 1;
                summary.errors.push({
                    itemId,
                    invNr,
                    message: "Geraet zur Inventar Nummer nicht in der DB gefunden",
                    row,
                });
                continue;
            }

            try {
                const attachmentApiUrl =
                    `${DEFAULTS.sitePath}` +
                    `/_api/web/lists/getbytitle('${DEFAULTS.listTitle}')/items(${itemId})/AttachmentFiles`;

                const attachmentData = await fetchJson(request, attachmentApiUrl);
                const attachments = Array.isArray(attachmentData.value) ? attachmentData.value : [];

                if (attachments.length === 0) {
                    summary.warnings.push({
                        itemId,
                        invNr,
                        type: "no-attachments",
                        message: "Keine Dokument-Anhaenge fuer dieses SharePoint-Item gefunden.",
                    });
                    continue;
                }

                for (const attachment of attachments) {
                    const originalFileName = decodeSharePointText(attachment.FileName ?? attachment.FileNameAsPath?.DecodedUrl ?? "");
                    const serverRelativeUrl = cleanText(
                        attachment.ServerRelativeUrl ??
                            attachment.ServerRelativePath?.DecodedUrl ??
                            attachment.FileRef ??
                            "",
                    );

                    if (!originalFileName || !serverRelativeUrl) {
                        summary.skippedDocuments += 1;
                        summary.warnings.push({
                            itemId,
                            invNr,
                            type: "attachment-metadata-missing",
                            message: "Ein Attachment hatte keinen gueltigen Dateinamen oder Pfad.",
                        });
                        continue;
                    }

                    const documentKey = `${invNr}:${originalFileName}`;
                    if (existingDocumentKeys.has(documentKey)) {
                        summary.skippedDocuments += 1;
                        summary.warnings.push({
                            itemId,
                            invNr,
                            type: "document-exists",
                            message: `Dokument '${originalFileName}' ist bereits in der DB vorhanden und wird uebersprungen.`,
                        });
                        continue;
                    }

                    if (dryRun) {
                        existingDocumentKeys.add(documentKey);
                        summary.importedDocuments += 1;
                        continue;
                    }

                    const downloadUrl = `${DEFAULTS.siteOrigin}${serverRelativeUrl}`;
                    const fileBuffer = await fetchBinary(request, downloadUrl);
                    const storedFileName = createStoredDocumentName(invNr, originalFileName);
                    const storedRelativePath = `/uploads/dokumente/${storedFileName}`;
                    const storedAbsolutePath = path.join(uploadDir, storedFileName);

                    fs.writeFileSync(storedAbsolutePath, fileBuffer);
                    await db.query("INSERT INTO dokumente (name, url, geraete_id) VALUES (?, ?, ?)", [
                        originalFileName,
                        storedRelativePath,
                        invNr,
                    ]);

                    existingDocumentKeys.add(documentKey);
                    summary.importedDocuments += 1;
                }
            } catch (error) {
                summary.skippedRows += 1;
                summary.errors.push({
                    itemId,
                    invNr,
                    message: error instanceof Error ? error.message : "Unbekannter Dokument-Importfehler",
                    row,
                });
            }
        }
    } finally {
        await request.dispose();
    }

    writeReport(summary);

    console.log(`Dokument-Import abgeschlossen${dryRun ? " (dry-run)" : ""}.`);
    console.log(`Verarbeitete Zeilen: ${summary.processedRows}`);
    console.log(`Importierte Dokumente: ${summary.importedDocuments}`);
    console.log(`Uebersprungene Dokumente: ${summary.skippedDocuments}`);
    console.log(`Uebersprungene Zeilen: ${summary.skippedRows}`);
    console.log(`Report: ${reportPath}`);
}

void main().catch((error) => {
    console.error("Dokument-Import fehlgeschlagen:", error);
    process.exitCode = 1;
});
