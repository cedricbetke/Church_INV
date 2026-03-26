import fs from "node:fs";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("../apps/api/src/config/db");

type PlanExport = {
    id: unknown;
    title: unknown;
    dates: unknown;
    short_dates: unknown;
    sort_date: unknown;
    planning_center_url: unknown;
    series_title: unknown;
    series_id: string | null;
};

type ServiceTypeExport = {
    id: unknown;
    name: unknown;
    updated_at?: unknown;
    frequency?: unknown;
    plans: PlanExport[];
};

type DerivedServiceTypeExport = ServiceTypeExport & {
    virtual: true;
    source_service_type_id: unknown;
    source_service_type_name: string;
    source_series_title: string;
};

type PcoImportPayload = {
    service_types: ServiceTypeExport[];
    derived_service_types: DerivedServiceTypeExport[];
};

type SyncSummary = {
    dryRun: boolean;
    sourceFile: string;
    processedMappings: number;
    createdMappings: number;
    updatedMappings: number;
    unchangedMappings: number;
    warnings: Array<{ type: string; message: string }>;
};

type MappingSeedRow = {
    pco_service_type_id: string;
    pco_service_type_name: string;
    is_virtual: boolean;
    source_service_type_id: string | null;
    source_service_type_name: string | null;
    source_series_title: string | null;
};

const rootDir = process.cwd();
const defaultJsonPath = path.join(rootDir, "import", "pco-services-import-report.json");
const reportPath = path.join(rootDir, "import", "pco-mapping-sync-report.json");

const parseArgs = () => {
    const fileArg = process.argv.find((arg) => arg.startsWith("--file="));

    return {
        dryRun: process.argv.includes("--dry-run"),
        filePath: fileArg ? path.resolve(rootDir, fileArg.slice("--file=".length)) : defaultJsonPath,
    };
};

const cleanText = (value: unknown) => {
    if (typeof value !== "string") {
        return null;
    }

    const cleaned = value.replace(/\uFEFF/g, "").replace(/\s+/g, " ").trim();
    return cleaned || null;
};

const toSeedRows = (payload: PcoImportPayload, warnings: SyncSummary["warnings"]) => {
    const seen = new Set<string>();
    const rows: MappingSeedRow[] = [];

    for (const entry of payload.service_types ?? []) {
        const id = cleanText(entry.id);
        const name = cleanText(entry.name);

        if (!id || !name) {
            warnings.push({
                type: "invalid-service-type",
                message: "Ein Service Type ohne gueltige ID oder Name wurde uebersprungen.",
            });
            continue;
        }

        if (seen.has(id)) {
            warnings.push({
                type: "duplicate-service-type",
                message: `Service Type ${id} wurde doppelt gefunden und nur einmal uebernommen.`,
            });
            continue;
        }

        seen.add(id);
        rows.push({
            pco_service_type_id: id,
            pco_service_type_name: name,
            is_virtual: false,
            source_service_type_id: null,
            source_service_type_name: null,
            source_series_title: null,
        });
    }

    for (const entry of payload.derived_service_types ?? []) {
        const id = cleanText(entry.id);
        const name = cleanText(entry.name);

        if (!id || !name) {
            warnings.push({
                type: "invalid-derived-service-type",
                message: "Ein virtueller Service Type ohne gueltige ID oder Name wurde uebersprungen.",
            });
            continue;
        }

        if (seen.has(id)) {
            warnings.push({
                type: "duplicate-derived-service-type",
                message: `Virtueller Service Type ${id} wurde doppelt gefunden und nur einmal uebernommen.`,
            });
            continue;
        }

        seen.add(id);
        rows.push({
            pco_service_type_id: id,
            pco_service_type_name: name,
            is_virtual: true,
            source_service_type_id: cleanText(entry.source_service_type_id),
            source_service_type_name: cleanText(entry.source_service_type_name),
            source_series_title: cleanText(entry.source_series_title),
        });
    }

    return rows.sort((left, right) => left.pco_service_type_name.localeCompare(right.pco_service_type_name, "de"));
};

const main = async () => {
    const { filePath, dryRun } = parseArgs();
    const rawJson = fs.readFileSync(filePath, "utf8");
    const payload = JSON.parse(rawJson) as PcoImportPayload;

    const summary: SyncSummary = {
        dryRun,
        sourceFile: filePath,
        processedMappings: 0,
        createdMappings: 0,
        updatedMappings: 0,
        unchangedMappings: 0,
        warnings: [],
    };

    const seedRows = toSeedRows(payload, summary.warnings);
    summary.processedMappings = seedRows.length;

    for (const row of seedRows) {
        const [existingRows] = await db.query(
            `SELECT id, pco_service_type_name, is_virtual, source_service_type_id, source_service_type_name, source_series_title
             FROM pco_service_type_mapping
             WHERE pco_service_type_id = ?`,
            [row.pco_service_type_id],
        );

        const existing = existingRows[0] ?? null;

        if (!existing) {
            summary.createdMappings += 1;

            if (!dryRun) {
                await db.query(
                    `INSERT INTO pco_service_type_mapping
                        (pco_service_type_id, pco_service_type_name, is_virtual, source_service_type_id, source_service_type_name, source_series_title)
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        row.pco_service_type_id,
                        row.pco_service_type_name,
                        row.is_virtual ? 1 : 0,
                        row.source_service_type_id,
                        row.source_service_type_name,
                        row.source_series_title,
                    ],
                );
            }
            continue;
        }

        const hasChanges =
            existing.pco_service_type_name !== row.pco_service_type_name ||
            Boolean(existing.is_virtual) !== row.is_virtual ||
            (existing.source_service_type_id ?? null) !== row.source_service_type_id ||
            (existing.source_service_type_name ?? null) !== row.source_service_type_name ||
            (existing.source_series_title ?? null) !== row.source_series_title;

        if (!hasChanges) {
            summary.unchangedMappings += 1;
            continue;
        }

        summary.updatedMappings += 1;

        if (!dryRun) {
            await db.query(
                `UPDATE pco_service_type_mapping
                 SET pco_service_type_name = ?,
                     is_virtual = ?,
                     source_service_type_id = ?,
                     source_service_type_name = ?,
                     source_series_title = ?
                 WHERE pco_service_type_id = ?`,
                [
                    row.pco_service_type_name,
                    row.is_virtual ? 1 : 0,
                    row.source_service_type_id,
                    row.source_service_type_name,
                    row.source_series_title,
                    row.pco_service_type_id,
                ],
            );
        }
    }

    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");

    console.log(`PCO-Mapping-Sync abgeschlossen${dryRun ? " (dry-run)" : ""}.`);
    console.log(`Verarbeitete Mappings: ${summary.processedMappings}`);
    console.log(`Neu: ${summary.createdMappings}`);
    console.log(`Aktualisiert: ${summary.updatedMappings}`);
    console.log(`Unveraendert: ${summary.unchangedMappings}`);
    console.log(`Report: ${reportPath}`);
};

void main().catch((error) => {
    console.error("PCO-Mapping-Sync fehlgeschlagen:", error);
    process.exitCode = 1;
});
