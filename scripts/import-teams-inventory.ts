import { writeFileSync } from "node:fs";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("../apps/api/src/config/db");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Geraet = require("../apps/api/src/models/geratModel");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const GeraetVerlauf = require("../apps/api/src/models/geraetVerlaufModel");

type CsvRow = Record<string, string>;

type ImportWarning = {
    invNr?: number;
    type: string;
    message: string;
};

type ImportError = {
    invNr?: number;
    message: string;
    row: CsvRow;
};

type ImportSummary = {
    sourceFile: string;
    processedRows: number;
    createdDevices: number;
    updatedDevices: number;
    skippedDevices: number;
    createdMasterdata: {
        status: number;
        hersteller: number;
        objekttyp: number;
        modell: number;
        bereich: number;
        standort: number;
        kategorie: number;
        person: number;
    };
    warnings: ImportWarning[];
    errors: ImportError[];
};

const rootDir = process.cwd();
const defaultCsvPath = path.join(rootDir, "import", "Inventar Liste csv.csv");
const reportPath = path.join(rootDir, "import", "import-report.json");

const FIELD_NAMES = {
    invNr: "Inventar-Nr",
    status: "Status",
    hersteller: "Hersteller",
    modell: "Modell",
    objekttyp: "Objekttyp",
    seriennummer: "Seriennummer",
    kaufdatum: "Kaufdatum",
    einkaufspreis: "Einkaufspreis",
    standort: "Standort",
    bereich: "Bereich",
    kategorie: "Unterkategorie",
    verantwortlichePerson: "Zuständige Person",
    zustandshinweis: "Zustandshinweis",
} as const;

const typoCorrections: Record<string, string> = {
    Gemindesaal: "Gemeindesaal",
    Lagerrraum: "Lagerraum",
};

const IMPORT_FALLBACKS = {
    hersteller: "Unbekannt",
    objekttyp: "Unbekannt",
} as const;

const parseArgs = () => {
    const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
    const dryRun = process.argv.includes("--dry-run");

    return {
        filePath: fileArg ? path.resolve(rootDir, fileArg.slice("--file=".length)) : defaultCsvPath,
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

const normalizeLookupKey = (value: string) => cleanText(value).toLowerCase();

const normalizePlainValue = (value: string | null | undefined) => {
    const cleaned = cleanText(value);
    if (!cleaned) {
        return null;
    }

    if (cleaned.toLowerCase() === "kein") {
        return null;
    }

    return typoCorrections[cleaned] ?? cleaned;
};

const parseMultiChoiceField = (rawValue: string) => {
    const cleaned = cleanText(rawValue);
    if (!cleaned) {
        return [];
    }

    try {
        const parsed = JSON.parse(cleaned) as string[];
        return parsed.map((value) => normalizePlainValue(value)).filter(Boolean) as string[];
    } catch {
        return [normalizePlainValue(cleaned)].filter(Boolean) as string[];
    }
};

const resolveFallbackBrandName = (brandName: string | null, modelName: string | null, objectTypeName: string | null) => {
    if (brandName) {
        return brandName;
    }

    if (modelName || objectTypeName) {
        return IMPORT_FALLBACKS.hersteller;
    }

    return null;
};

const resolveFallbackObjectTypeName = (objectTypeName: string | null, modelName: string | null, brandName: string | null) => {
    if (objectTypeName) {
        return objectTypeName;
    }

    if (modelName || brandName) {
        return IMPORT_FALLBACKS.objekttyp;
    }

    return null;
};

const parseDate = (rawValue: string) => {
    const cleaned = cleanText(rawValue);
    if (!cleaned) {
        return null;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
        return cleaned;
    }

    const dotMatch = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (dotMatch) {
        const [, day, month, year] = dotMatch;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return null;
};

const parsePrice = (rawValue: string) => {
    const cleaned = cleanText(rawValue);
    if (!cleaned) {
        return null;
    }

    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    const value = Number.parseFloat(normalized);
    return Number.isFinite(value) ? value : null;
};

const capitalize = (value: string) => {
    if (!value) {
        return value;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
};

const parsePersonFromEmail = (rawValue: string) => {
    const cleaned = cleanText(rawValue);
    if (!cleaned || !cleaned.includes("@")) {
        return null;
    }

    const localPart = cleaned.split("@")[0];
    const parts = localPart
        .split(/[._-]+/)
        .map((part) => cleanText(part))
        .filter(Boolean);

    if (parts.length < 2) {
        return null;
    }

    return {
        vorname: capitalize(parts[0]),
        nachname: capitalize(parts.slice(1).join(" ")),
    };
};

const parsePersonFromTeamsValue = (rawValue: string) => {
    const cleaned = cleanText(rawValue);
    if (!cleaned) {
        return null;
    }

    const primaryValue = cleanText(cleaned.split("|")[0]);
    if (!primaryValue) {
        return null;
    }

    if (primaryValue.includes("@")) {
        return parsePersonFromEmail(primaryValue);
    }

    const blockedValues = new Set(["ef-köln", "ef-koln", "sekretariat", "büro", "buero", "technik"]);
    if (blockedValues.has(normalizeLookupKey(primaryValue))) {
        return null;
    }

    const parts = primaryValue
        .split(/\s+/)
        .map((part) => cleanText(part))
        .filter(Boolean);

    if (parts.length < 2) {
        return null;
    }

    return {
        vorname: capitalize(parts[0]),
        nachname: parts
            .slice(1)
            .map((part) => capitalize(part))
            .join(" "),
    };
};

const assertRequiredColumns = (rows: CsvRow[]) => {
    const firstRow = rows[0];
    if (!firstRow) {
        throw new Error("Die CSV-Datei enthält keine Datenzeilen.");
    }

    const requiredColumns = [
        FIELD_NAMES.invNr,
        FIELD_NAMES.status,
        FIELD_NAMES.hersteller,
        FIELD_NAMES.modell,
        FIELD_NAMES.objekttyp,
        FIELD_NAMES.bereich,
    ];

    const missingColumns = requiredColumns.filter((column) => !(column in firstRow));
    if (missingColumns.length > 0) {
        throw new Error(`In der CSV fehlen Pflichtspalten: ${missingColumns.join(", ")}`);
    }
};

const ensureZustandshinweisColumn = async () => {
    const [rows] = await db.query("SHOW COLUMNS FROM geraet LIKE 'zustandshinweis'");
    if (!Array.isArray(rows) || rows.length === 0) {
        throw new Error("Die DB-Spalte geraet.zustandshinweis fehlt. Bitte zuerst per ALTER TABLE anlegen.");
    }
};

const createLookupCaches = async () => {
    const [statusRows] = await db.query("SELECT id, name FROM status");
    const [brandRows] = await db.query("SELECT id, name FROM hersteller");
    const [objectTypeRows] = await db.query("SELECT id, name FROM objekttyp");
    const [bereichRows] = await db.query("SELECT id, name FROM bereich");
    const [standortRows] = await db.query("SELECT id, name FROM standort");
    const [personRows] = await db.query("SELECT id, vorname, nachname FROM person");
    const [kategorieRows] = await db.query("SELECT id, name, bereich_id FROM kategorie");
    const [modellRows] = await db.query("SELECT id, name, hersteller_id, objekttyp_id FROM modell");

    return {
        statusByName: new Map(statusRows.map((row: { id: number; name: string }) => [normalizeLookupKey(row.name), row])),
        brandsByName: new Map(brandRows.map((row: { id: number; name: string }) => [normalizeLookupKey(row.name), row])),
        objectTypesByName: new Map(objectTypeRows.map((row: { id: number; name: string }) => [normalizeLookupKey(row.name), row])),
        bereicheByName: new Map(bereichRows.map((row: { id: number; name: string }) => [normalizeLookupKey(row.name), row])),
        standorteByName: new Map(standortRows.map((row: { id: number; name: string }) => [normalizeLookupKey(row.name), row])),
        personsByKey: new Map(
            personRows.map((row: { id: number; vorname: string; nachname: string }) => [
                `${normalizeLookupKey(row.vorname)}:${normalizeLookupKey(row.nachname)}`,
                row,
            ]),
        ),
        kategorienByKey: new Map(
            kategorieRows.map((row: { id: number; name: string; bereich_id: number }) => [
                `${row.bereich_id}:${normalizeLookupKey(row.name)}`,
                row,
            ]),
        ),
        modelsByKey: new Map(
            modellRows.map((row: { id: number; name: string; hersteller_id: number; objekttyp_id: number }) => [
                `${row.hersteller_id}:${row.objekttyp_id}:${normalizeLookupKey(row.name)}`,
                row,
            ]),
        ),
    };
};

const writeReport = (summary: ImportSummary) => {
    writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");
};

const main = async () => {
    const { filePath, dryRun } = parseArgs();
    const csvContent = require("node:fs").readFileSync(filePath, "utf8");
    const csvRows = rowsToObjects(parseCsv(csvContent));
    assertRequiredColumns(csvRows);
    await ensureZustandshinweisColumn();

    const summary: ImportSummary = {
        sourceFile: filePath,
        processedRows: 0,
        createdDevices: 0,
        updatedDevices: 0,
        skippedDevices: 0,
        createdMasterdata: {
            status: 0,
            hersteller: 0,
            objekttyp: 0,
            modell: 0,
            bereich: 0,
            standort: 0,
            kategorie: 0,
            person: 0,
        },
        warnings: [],
        errors: [],
    };

    const caches = await createLookupCaches();

    const getOrCreateStatus = async (name: string) => {
        const key = normalizeLookupKey(name);
        const existing = caches.statusByName.get(key);
        if (existing) {
            return existing;
        }

        if (dryRun) {
            const placeholder = { id: -1, name };
            caches.statusByName.set(key, placeholder);
            summary.createdMasterdata.status += 1;
            return placeholder;
        }

        const [result] = await db.query("INSERT INTO status (name) VALUES (?)", [name]);
        const created = { id: result.insertId, name };
        caches.statusByName.set(key, created);
        summary.createdMasterdata.status += 1;
        return created;
    };

    const getOrCreateBrand = async (name: string) => {
        const key = normalizeLookupKey(name);
        const existing = caches.brandsByName.get(key);
        if (existing) {
            return existing;
        }

        if (dryRun) {
            const placeholder = { id: -1, name };
            caches.brandsByName.set(key, placeholder);
            summary.createdMasterdata.hersteller += 1;
            return placeholder;
        }

        const [result] = await db.query("INSERT INTO hersteller (name) VALUES (?)", [name]);
        const created = { id: result.insertId, name };
        caches.brandsByName.set(key, created);
        summary.createdMasterdata.hersteller += 1;
        return created;
    };

    const getOrCreateObjectType = async (name: string) => {
        const key = normalizeLookupKey(name);
        const existing = caches.objectTypesByName.get(key);
        if (existing) {
            return existing;
        }

        if (dryRun) {
            const placeholder = { id: -1, name };
            caches.objectTypesByName.set(key, placeholder);
            summary.createdMasterdata.objekttyp += 1;
            return placeholder;
        }

        const [result] = await db.query("INSERT INTO objekttyp (name) VALUES (?)", [name]);
        const created = { id: result.insertId, name };
        caches.objectTypesByName.set(key, created);
        summary.createdMasterdata.objekttyp += 1;
        return created;
    };

    const getOrCreateBereich = async (name: string) => {
        const key = normalizeLookupKey(name);
        const existing = caches.bereicheByName.get(key);
        if (existing) {
            return existing;
        }

        if (dryRun) {
            const placeholder = { id: -1, name };
            caches.bereicheByName.set(key, placeholder);
            summary.createdMasterdata.bereich += 1;
            return placeholder;
        }

        const [result] = await db.query("INSERT INTO bereich (name) VALUES (?)", [name]);
        const created = { id: result.insertId, name };
        caches.bereicheByName.set(key, created);
        summary.createdMasterdata.bereich += 1;
        return created;
    };

    const getOrCreateStandort = async (name: string) => {
        const key = normalizeLookupKey(name);
        const existing = caches.standorteByName.get(key);
        if (existing) {
            return existing;
        }

        if (dryRun) {
            const placeholder = { id: -1, name };
            caches.standorteByName.set(key, placeholder);
            summary.createdMasterdata.standort += 1;
            return placeholder;
        }

        const [result] = await db.query("INSERT INTO standort (name) VALUES (?)", [name]);
        const created = { id: result.insertId, name };
        caches.standorteByName.set(key, created);
        summary.createdMasterdata.standort += 1;
        return created;
    };

    const getOrCreatePerson = async (vorname: string, nachname: string) => {
        const key = `${normalizeLookupKey(vorname)}:${normalizeLookupKey(nachname)}`;
        const existing = caches.personsByKey.get(key);
        if (existing) {
            return existing;
        }

        if (dryRun) {
            const placeholder = { id: -1, vorname, nachname };
            caches.personsByKey.set(key, placeholder);
            summary.createdMasterdata.person += 1;
            return placeholder;
        }

        const [result] = await db.query("INSERT INTO person (vorname, nachname) VALUES (?, ?)", [vorname, nachname]);
        const created = { id: result.insertId, vorname, nachname };
        caches.personsByKey.set(key, created);
        summary.createdMasterdata.person += 1;
        return created;
    };

    const getOrCreateKategorie = async (name: string, bereichId: number) => {
        const key = `${bereichId}:${normalizeLookupKey(name)}`;
        const existing = caches.kategorienByKey.get(key);
        if (existing) {
            return existing;
        }

        if (dryRun) {
            const placeholder = { id: -1, name, bereich_id: bereichId };
            caches.kategorienByKey.set(key, placeholder);
            summary.createdMasterdata.kategorie += 1;
            return placeholder;
        }

        const [result] = await db.query("INSERT INTO kategorie (name, bereich_id) VALUES (?, ?)", [name, bereichId]);
        const created = { id: result.insertId, name, bereich_id: bereichId };
        caches.kategorienByKey.set(key, created);
        summary.createdMasterdata.kategorie += 1;
        return created;
    };

    const getOrCreateModel = async (name: string, herstellerId: number, objekttypId: number) => {
        const key = `${herstellerId}:${objekttypId}:${normalizeLookupKey(name)}`;
        const existing = caches.modelsByKey.get(key);
        if (existing) {
            return existing;
        }

        if (dryRun) {
            const placeholder = { id: -1, name, hersteller_id: herstellerId, objekttyp_id: objekttypId };
            caches.modelsByKey.set(key, placeholder);
            summary.createdMasterdata.modell += 1;
            return placeholder;
        }

        const [result] = await db.query(
            "INSERT INTO modell (name, hersteller_id, objekttyp_id) VALUES (?, ?, ?)",
            [name, herstellerId, objekttypId],
        );
        const created = { id: result.insertId, name, hersteller_id: herstellerId, objekttyp_id: objekttypId };
        caches.modelsByKey.set(key, created);
        summary.createdMasterdata.modell += 1;
        return created;
    };

    for (const row of csvRows) {
        summary.processedRows += 1;

        const invNrRaw = cleanText(row[FIELD_NAMES.invNr]);
        const invNr = Number.parseInt(invNrRaw, 10);

        if (!Number.isInteger(invNr) || invNr <= 0) {
            summary.skippedDevices += 1;
            summary.errors.push({
                message: `Ungültige Inventarnummer: ${invNrRaw || "(leer)"}`,
                row,
            });
            continue;
        }

        const statusName = normalizePlainValue(row[FIELD_NAMES.status]);
        const rawBrandName = normalizePlainValue(row[FIELD_NAMES.hersteller]);
        const modelName = normalizePlainValue(row[FIELD_NAMES.modell]);
        const rawObjectTypeName = normalizePlainValue(row[FIELD_NAMES.objekttyp]);
        const standortName = normalizePlainValue(row[FIELD_NAMES.standort]);
        const seriennummer = normalizePlainValue(row[FIELD_NAMES.seriennummer]);
        const kaufdatum = parseDate(row[FIELD_NAMES.kaufdatum]);
        const einkaufspreis = parsePrice(row[FIELD_NAMES.einkaufspreis]);
        const zustandshinweis = normalizePlainValue(row[FIELD_NAMES.zustandshinweis]);

        const bereichValues = parseMultiChoiceField(row[FIELD_NAMES.bereich]);
        const kategorieValues = parseMultiChoiceField(row[FIELD_NAMES.kategorie]);

        if (bereichValues.length > 1) {
            summary.warnings.push({
                invNr,
                type: "multi-bereich",
                message: `Mehrere Bereichswerte gefunden, erster Wert wird verwendet: ${bereichValues.join(", ")}`,
            });
        }

        if (kategorieValues.length > 1) {
            summary.warnings.push({
                invNr,
                type: "multi-kategorie",
                message: `Mehrere Unterkategorien gefunden, erster Wert wird verwendet: ${kategorieValues.join(", ")}`,
            });
        }

        const bereichName = bereichValues[0] ?? null;
        const kategorieName = kategorieValues[0] ?? null;
        const brandName = resolveFallbackBrandName(rawBrandName, modelName, rawObjectTypeName);
        const objectTypeName = resolveFallbackObjectTypeName(rawObjectTypeName, modelName, brandName);

        if (!rawBrandName && brandName) {
            summary.warnings.push({
                invNr,
                type: "fallback-hersteller",
                message: `Hersteller fehlt, Fallback '${brandName}' wird verwendet.`,
            });
        }

        if (!rawObjectTypeName && objectTypeName) {
            summary.warnings.push({
                invNr,
                type: "fallback-objekttyp",
                message: `Objekttyp fehlt, Fallback '${objectTypeName}' wird verwendet.`,
            });
        }

        const verantwortlichePerson = parsePersonFromTeamsValue(row[FIELD_NAMES.verantwortlichePerson]);
        if (row[FIELD_NAMES.verantwortlichePerson] && !verantwortlichePerson) {
            summary.warnings.push({
                invNr,
                type: "person-skipped",
                message: `Zuständige Person konnte nicht sauber aufgelöst werden und wird übersprungen: ${row[FIELD_NAMES.verantwortlichePerson]}`,
            });
        }

        if (!statusName || !brandName || !modelName || !objectTypeName || !bereichName) {
            summary.skippedDevices += 1;
            summary.errors.push({
                invNr,
                message: "Pflichtfelder fehlen nach der Normalisierung",
                row,
            });
            continue;
        }

        try {
            const status = await getOrCreateStatus(statusName);
            const brand = await getOrCreateBrand(brandName);
            const objectType = await getOrCreateObjectType(objectTypeName);
            const bereich = await getOrCreateBereich(bereichName);
            const standort = standortName ? await getOrCreateStandort(standortName) : null;
            const person = verantwortlichePerson
                ? await getOrCreatePerson(verantwortlichePerson.vorname, verantwortlichePerson.nachname)
                : null;
            const kategorie = kategorieName ? await getOrCreateKategorie(kategorieName, bereich.id) : null;
            const model = await getOrCreateModel(modelName, brand.id, objectType.id);

            const beforeSnapshot = await GeraetVerlauf.getGeraetSnapshot(invNr);

            if (dryRun) {
                if (beforeSnapshot) {
                    summary.updatedDevices += 1;
                } else {
                    summary.createdDevices += 1;
                }
                continue;
            }

            if (!beforeSnapshot) {
                await Geraet.create(
                    invNr,
                    status.id,
                    model.id,
                    bereich.id,
                    kaufdatum,
                    einkaufspreis,
                    seriennummer,
                    standort?.id,
                    person?.id,
                    kategorie?.id,
                    zustandshinweis,
                    null,
                );
                await GeraetVerlauf.logCreate(invNr);
                summary.createdDevices += 1;
            } else {
                await Geraet.update(
                    invNr,
                    status.id,
                    model.id,
                    bereich.id,
                    kaufdatum,
                    einkaufspreis,
                    seriennummer,
                    standort?.id,
                    person?.id,
                    kategorie?.id,
                    zustandshinweis,
                    beforeSnapshot.geraetefoto_url ?? null,
                );

                const afterSnapshot = await GeraetVerlauf.getGeraetSnapshot(invNr);
                if (afterSnapshot) {
                    await GeraetVerlauf.logUpdateChanges(invNr, beforeSnapshot, afterSnapshot);
                }
                summary.updatedDevices += 1;
            }
        } catch (error) {
            summary.skippedDevices += 1;
            summary.errors.push({
                invNr,
                message: error instanceof Error ? error.message : "Unbekannter Importfehler",
                row,
            });
        }
    }

    writeReport(summary);

    console.log(`Import abgeschlossen${dryRun ? " (dry-run)" : ""}.`);
    console.log(`Verarbeitete Zeilen: ${summary.processedRows}`);
    console.log(`Neu angelegte Geräte: ${summary.createdDevices}`);
    console.log(`Aktualisierte Geräte: ${summary.updatedDevices}`);
    console.log(`Übersprungene Geräte: ${summary.skippedDevices}`);
    console.log(`Report: ${reportPath}`);
}

void main().catch((error) => {
    console.error("Import fehlgeschlagen:", error);
    process.exitCode = 1;
});
