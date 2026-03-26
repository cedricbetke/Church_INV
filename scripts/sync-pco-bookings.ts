import fs from "node:fs";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("../apps/api/src/config/db");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PcoMapping = require("../apps/api/src/models/pcoMappingModel");

type PlanExport = {
    id: unknown;
    title: unknown;
    dates: unknown;
    short_dates: unknown;
    sort_date: unknown;
    planning_center_url: unknown;
    series_title: unknown;
    series_id: unknown;
};

type ServiceTypeExport = {
    id: unknown;
    name: unknown;
    plans: PlanExport[];
    virtual?: boolean;
    source_service_type_id?: unknown;
    source_service_type_name?: unknown;
    source_series_title?: unknown;
};

type PcoPayload = {
    service_types: ServiceTypeExport[];
    derived_service_types: ServiceTypeExport[];
};

type SyncWarning = {
    type: string;
    message: string;
    serviceTypeId?: string;
    planId?: string;
};

type SyncConflict = {
    serviceTypeId: string;
    planId: string;
    title: string;
    conflictingBookingId: number;
    conflictingBookingTitle: string;
    geraetInvNr: number;
};

type SyncSummary = {
    dryRun: boolean;
    sourceFile: string;
    processedPlans: number;
    createdBookings: number;
    updatedBookings: number;
    skippedPlans: number;
    conflicts: SyncConflict[];
    warnings: SyncWarning[];
};

type MappingDevice = {
    inv_nr: number;
};

type Mapping = {
    pco_service_type_id: string;
    pco_service_type_name: string;
    aktiv: boolean;
    geraete: MappingDevice[];
};

type NormalizedSuggestion = {
    serviceTypeId: string;
    serviceTypeName: string;
    planId: string;
    externalId: string;
    title: string;
    startDatum: string;
    endDatum: string;
    planningCenterUrl: string | null;
    geraeteInvNr: number[];
    isVirtual: boolean;
};

const rootDir = process.cwd();
const defaultJsonPath = path.join(rootDir, "import", "pco-services-import-report.json");
const reportPath = path.join(rootDir, "import", "pco-booking-sync-report.json");
const PCO_BOOKER_NAME = "Planning Center";

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

const addHours = (isoString: string, hoursToAdd: number) => {
    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    date.setHours(date.getHours() + hoursToAdd);
    return date.toISOString().slice(0, 19).replace("T", " ");
};

const toMysqlDateTime = (isoString: string) => {
    const date = new Date(isoString);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString().slice(0, 19).replace("T", " ");
};

const buildBookingTitle = (serviceTypeName: string, plan: PlanExport) => {
    const title =
        cleanText(plan.title) ??
        cleanText(plan.series_title) ??
        cleanText(plan.short_dates) ??
        cleanText(plan.dates) ??
        "Plan";

    return `${serviceTypeName} · ${title}`;
};

const buildBookingPurpose = (serviceTypeName: string, plan: PlanExport) => {
    const parts = [`Automatisch aus Planning Center übernommen`, serviceTypeName];
    const seriesTitle = cleanText(plan.series_title);

    if (seriesTitle) {
        parts.push(seriesTitle);
    }

    return parts.join(" · ");
};

const createDerivedOverrideSet = (serviceTypes: ServiceTypeExport[], activeMappings: Map<string, Mapping>) => {
    const overrides = new Set<string>();

    for (const serviceType of serviceTypes) {
        const isVirtual = Boolean(serviceType.virtual);
        const serviceTypeId = cleanText(serviceType.id);
        const sourceServiceTypeId = cleanText(serviceType.source_service_type_id);

        if (!isVirtual || !serviceTypeId || !sourceServiceTypeId) {
            continue;
        }

        const mapping = activeMappings.get(serviceTypeId);
        if (!mapping || mapping.geraete.length === 0) {
            continue;
        }

        for (const plan of serviceType.plans ?? []) {
            const planId = cleanText(plan.id);

            if (planId) {
                overrides.add(`${sourceServiceTypeId}::${planId}`);
            }
        }
    }

    return overrides;
};

const normalizeSuggestions = (
    payload: PcoPayload,
    mappings: Mapping[],
    warnings: SyncWarning[],
) => {
    const activeMappings = new Map(
        mappings
            .filter((mapping) => mapping.aktiv)
            .map((mapping) => [mapping.pco_service_type_id, mapping]),
    );

    const derivedTypes = Array.isArray(payload.derived_service_types) ? payload.derived_service_types : [];
    const standardTypes = Array.isArray(payload.service_types) ? payload.service_types : [];
    const derivedOverrideSet = createDerivedOverrideSet(derivedTypes, activeMappings);

    const suggestions: NormalizedSuggestion[] = [];

    const collect = (serviceTypes: ServiceTypeExport[], isVirtual: boolean) => {
        for (const serviceType of serviceTypes) {
            const serviceTypeId = cleanText(serviceType.id);
            const serviceTypeName = cleanText(serviceType.name);

            if (!serviceTypeId || !serviceTypeName) {
                warnings.push({
                    type: "invalid-service-type",
                    message: "Ein PCO-Service-Type ohne gueltige ID oder Name wurde uebersprungen.",
                });
                continue;
            }

            const mapping = activeMappings.get(serviceTypeId);
            if (!mapping || mapping.geraete.length === 0) {
                warnings.push({
                    type: "no-active-mapping",
                    message: `Service Type ${serviceTypeName} hat kein aktives Mapping mit Geraeten.`,
                    serviceTypeId,
                });
                continue;
            }

            for (const plan of serviceType.plans ?? []) {
                const planId = cleanText(plan.id);
                const sortDate = cleanText(plan.sort_date);

                if (!planId || !sortDate) {
                    warnings.push({
                        type: "invalid-plan",
                        message: `Ein Plan in ${serviceTypeName} konnte wegen fehlender ID oder Zeit nicht verwendet werden.`,
                        serviceTypeId,
                        planId: planId ?? undefined,
                    });
                    continue;
                }

                if (!isVirtual && derivedOverrideSet.has(`${serviceTypeId}::${planId}`)) {
                    warnings.push({
                        type: "derived-override",
                        message: `Plan ${planId} wird ueber ein virtuelles Mapping priorisiert und deshalb im Basis-Service-Type uebersprungen.`,
                        serviceTypeId,
                        planId,
                    });
                    continue;
                }

                const startDatum = toMysqlDateTime(sortDate);
                const endDatum = addHours(sortDate, 3);

                if (!startDatum || !endDatum) {
                    warnings.push({
                        type: "invalid-plan-time",
                        message: `Plan ${planId} hat kein gueltiges Datum fuer die Buchungssynchronisierung.`,
                        serviceTypeId,
                        planId,
                    });
                    continue;
                }

                suggestions.push({
                    serviceTypeId,
                    serviceTypeName,
                    planId,
                    externalId: `${serviceTypeId}:${planId}`,
                    title: buildBookingTitle(serviceTypeName, plan),
                    startDatum,
                    endDatum,
                    planningCenterUrl: cleanText(plan.planning_center_url),
                    geraeteInvNr: mapping.geraete.map((device) => Number(device.inv_nr)).filter((value) => Number.isInteger(value) && value > 0),
                    isVirtual,
                });
            }
        }
    };

    collect(standardTypes, false);
    collect(derivedTypes, true);

    return suggestions.sort((left, right) => new Date(left.startDatum).getTime() - new Date(right.startDatum).getTime());
};

const loadExistingBookings = async () => {
    const [rows] = await db.query(`
        SELECT
            b.id,
            b.external_id,
            bg.geraet_inv_nr
        FROM geraet_buchung b
        LEFT JOIN geraet_buchung_geraet bg ON bg.buchung_id = b.id
        WHERE b.quelle = 'pco'
    `);

    const bookingByExternalId = new Map<
        string,
        { id: number; geraeteInvNr: number[] }
    >();

    for (const row of rows) {
        if (!row.external_id) {
            continue;
        }

        if (!bookingByExternalId.has(row.external_id)) {
            bookingByExternalId.set(row.external_id, {
                id: row.id,
                geraeteInvNr: [],
            });
        }

        if (row.geraet_inv_nr != null) {
            bookingByExternalId.get(row.external_id)?.geraeteInvNr.push(Number(row.geraet_inv_nr));
        }
    }

    return bookingByExternalId;
};

const findConflicts = async (
    geraeteInvNr: number[],
    startDatum: string,
    endDatum: string,
    ignoreBookingId?: number,
) => {
    if (geraeteInvNr.length === 0) {
        return [];
    }

    const [rows] = await db.query(
        `
            SELECT DISTINCT
                b.id,
                b.titel,
                bg.geraet_inv_nr
            FROM geraet_buchung b
            INNER JOIN geraet_buchung_geraet bg ON bg.buchung_id = b.id
            WHERE bg.geraet_inv_nr IN (?)
              AND b.status <> 'storniert'
              AND b.start_datum <= ?
              AND b.end_datum >= ?
              AND (? IS NULL OR b.id <> ?)
        `,
        [geraeteInvNr, endDatum, startDatum, ignoreBookingId ?? null, ignoreBookingId ?? null],
    );

    return rows as Array<{ id: number; titel: string; geraet_inv_nr: number }>;
};

const main = async () => {
    const { filePath, dryRun } = parseArgs();
    const rawJson = fs.readFileSync(filePath, "utf8");
    const payload = JSON.parse(rawJson) as PcoPayload;

    const mappings = (await PcoMapping.getAll()) as Mapping[];
    const summary: SyncSummary = {
        dryRun,
        sourceFile: filePath,
        processedPlans: 0,
        createdBookings: 0,
        updatedBookings: 0,
        skippedPlans: 0,
        conflicts: [],
        warnings: [],
    };

    const suggestions = normalizeSuggestions(payload, mappings, summary.warnings);
    const existingBookings = await loadExistingBookings();
    summary.processedPlans = suggestions.length;

    for (const suggestion of suggestions) {
        const existing = existingBookings.get(suggestion.externalId) ?? null;
        const conflicts = await findConflicts(
            suggestion.geraeteInvNr,
            suggestion.startDatum,
            suggestion.endDatum,
            existing?.id,
        );

        if (conflicts.length > 0) {
            summary.skippedPlans += 1;
            for (const conflict of conflicts) {
                summary.conflicts.push({
                    serviceTypeId: suggestion.serviceTypeId,
                    planId: suggestion.planId,
                    title: suggestion.title,
                    conflictingBookingId: conflict.id,
                    conflictingBookingTitle: conflict.titel,
                    geraetInvNr: conflict.geraet_inv_nr,
                });
            }
            continue;
        }

        if (existing) {
            const sameDevices =
                existing.geraeteInvNr.length === suggestion.geraeteInvNr.length &&
                [...existing.geraeteInvNr].sort((a, b) => a - b).every((value, index) => value === [...suggestion.geraeteInvNr].sort((a, b) => a - b)[index]);

            if (!dryRun) {
                await db.query(
                    `UPDATE geraet_buchung
                     SET titel = ?, bucher_name = ?, zweck = ?, start_datum = ?, end_datum = ?, pco_service_type_id = ?, planning_center_url = ?
                     WHERE id = ?`,
                    [
                        suggestion.title,
                        PCO_BOOKER_NAME,
                        buildBookingPurpose(suggestion.serviceTypeName, { series_title: null } as PlanExport),
                        suggestion.startDatum,
                        suggestion.endDatum,
                        suggestion.serviceTypeId,
                        suggestion.planningCenterUrl,
                        existing.id,
                    ],
                );

                if (!sameDevices) {
                    await db.query('DELETE FROM geraet_buchung_geraet WHERE buchung_id = ?', [existing.id]);
                    if (suggestion.geraeteInvNr.length > 0) {
                        const values = suggestion.geraeteInvNr.map((invNr) => [existing.id, invNr]);
                        await db.query(
                            'INSERT INTO geraet_buchung_geraet (buchung_id, geraet_inv_nr) VALUES ?',
                            [values],
                        );
                    }
                }
            }

            summary.updatedBookings += 1;
            continue;
        }

        if (!dryRun) {
            const [result] = await db.query(
                `INSERT INTO geraet_buchung
                    (titel, bucher_name, zweck, start_datum, end_datum, status, quelle, external_id, pco_service_type_id, planning_center_url)
                 VALUES (?, ?, ?, ?, ?, 'reserviert', 'pco', ?, ?, ?)`,
                [
                    suggestion.title,
                    PCO_BOOKER_NAME,
                    `Automatisch aus Planning Center übernommen · ${suggestion.serviceTypeName}`,
                    suggestion.startDatum,
                    suggestion.endDatum,
                    suggestion.externalId,
                    suggestion.serviceTypeId,
                    suggestion.planningCenterUrl,
                ],
            );

            if (suggestion.geraeteInvNr.length > 0) {
                const values = suggestion.geraeteInvNr.map((invNr) => [result.insertId, invNr]);
                await db.query(
                    'INSERT INTO geraet_buchung_geraet (buchung_id, geraet_inv_nr) VALUES ?',
                    [values],
                );
            }
        }

        summary.createdBookings += 1;
    }

    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");

    console.log(`PCO-Buchungssync abgeschlossen${dryRun ? " (dry-run)" : ""}.`);
    console.log(`Verarbeitete Plaene: ${summary.processedPlans}`);
    console.log(`Neu angelegte Buchungen: ${summary.createdBookings}`);
    console.log(`Aktualisierte Buchungen: ${summary.updatedBookings}`);
    console.log(`Uebersprungene Plaene: ${summary.skippedPlans}`);
    console.log(`Konflikte: ${summary.conflicts.length}`);
    console.log(`Report: ${reportPath}`);
};

void main().catch((error) => {
    console.error("PCO-Buchungssync fehlgeschlagen:", error);
    process.exitCode = 1;
});
