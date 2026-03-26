#!/usr/bin/env tsx

import { writeFile } from "node:fs/promises";

const BASE_URL = "https://api.planningcenteronline.com/services/v2";
const SPECIAL_EVENTS_SERVICE_TYPE_NAME = "05_Sonderveranstaltungen";
const SERIES_PROBE_NAME = "GBK";
const DEFAULT_OUTPUT_PATH = "import/pco-services-import-report.json";

type JsonObject = Record<string, unknown>;
type LogLevel = "INFO" | "DEBUG";

type ParsedArgs = {
    userToken: string | undefined;
    clientId: string | undefined;
    clientSecret: string | undefined;
    output: string;
    perPage: number;
    maxPlansPerServiceType: number | null;
    planStart: string | null;
    timeout: number;
    retries: number;
    debug: boolean;
};

type ExtractOptions = {
    perPage?: number;
    planStart: string;
    maxPlansPerServiceType?: number | null;
};

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
    frequency: unknown;
    updated_at: unknown;
    plans: PlanExport[];
};

type DerivedServiceTypeExport = ServiceTypeExport & {
    virtual: true;
    source_service_type_id: unknown;
    source_service_type_name: string;
    source_series_title: string;
};

type ExportPayload = {
    meta: {
        generated_at_utc: string;
        service_type_count: number;
        plan_count: number;
        derived_service_type_count: number;
        derived_plan_count: number;
        gbk_series_plan_count: number;
    };
    service_types: ServiceTypeExport[];
    derived_service_types: DerivedServiceTypeExport[];
};

class PCOClient {
    private readonly timeout: number;
    private readonly retries: number;
    private readonly debug: boolean;
    private readonly headers: Record<string, string>;

    constructor(options: {
        userToken: string | undefined;
        clientId: string | undefined;
        clientSecret: string | undefined;
        timeout?: number;
        retries?: number;
        debug?: boolean;
    }) {
        this.timeout = options.timeout ?? 30;
        this.retries = Math.max(1, options.retries ?? 3);
        this.debug = options.debug ?? false;
        this.headers = { Accept: "application/json" };

        if (options.userToken) {
            this.headers.Authorization = `Bearer ${options.userToken}`;
        } else if (options.clientId && options.clientSecret) {
            const basicValue = Buffer.from(`${options.clientId}:${options.clientSecret}`, "utf-8").toString("base64");
            this.headers.Authorization = `Basic ${basicValue}`;
        } else {
            throw new Error(
                "Keine gueltigen Zugangsdaten gefunden. Nutze --user-token ODER --client-id + --client-secret.",
            );
        }
    }

    private async requestJson(url: string, params?: JsonObject): Promise<JsonObject> {
        const requestUrl = mergeQueryParams(url, params);

        for (let attempt = 1; attempt <= this.retries; attempt += 1) {
            if (this.debug) {
                log(`GET ${requestUrl} (Attempt ${attempt}/${this.retries})`, "DEBUG");
            }

            const controller = new AbortController();
            const timeoutHandle = setTimeout(() => controller.abort(), this.timeout * 1000);

            try {
                const response = await fetch(requestUrl, {
                    method: "GET",
                    headers: this.headers,
                    signal: controller.signal,
                });

                const body = await response.text();
                if (!response.ok) {
                    const retryAfter = response.headers.get("Retry-After");
                    const retryable = [429, 500, 502, 503, 504].includes(response.status);

                    if (this.debug) {
                        log(`HTTP ${response.status} fuer ${requestUrl} (retryable=${String(retryable)})`, "DEBUG");
                    }

                    if (retryable && attempt < this.retries) {
                        await sleepSeconds(retryWaitSeconds(retryAfter, attempt));
                        continue;
                    }

                    throw new Error(formatApiError(response.status, requestUrl, body));
                }

                try {
                    const parsed = JSON.parse(body) as unknown;
                    if (!isJsonObject(parsed)) {
                        throw new Error("Erwartetes JSON-Objekt erhalten.");
                    }
                    return parsed;
                } catch (error) {
                    const reason = error instanceof Error ? error.message : String(error);
                    throw new Error(`Ungueltige JSON-Antwort fuer ${requestUrl}: ${reason}`);
                }
            } catch (error) {
                if (error instanceof Error && error.message.startsWith("API-Fehler")) {
                    throw error;
                }
                if (error instanceof Error && error.message.startsWith("Ungueltige JSON-Antwort")) {
                    throw error;
                }

                if (attempt < this.retries) {
                    await sleepSeconds(Math.min(2 ** attempt, 10));
                    continue;
                }

                if (error instanceof DOMException && error.name === "AbortError") {
                    throw new Error(`Netzwerkfehler fuer ${requestUrl}: Request timeout nach ${this.timeout}s`);
                }

                const reason = error instanceof Error ? error.message : String(error);
                throw new Error(`Netzwerkfehler fuer ${requestUrl}: ${reason}`);
            } finally {
                clearTimeout(timeoutHandle);
            }
        }

        throw new Error("Unbekannter Fehler beim API-Aufruf.");
    }

    async getPaginated(path: string, params?: JsonObject, limit?: number): Promise<JsonObject[]> {
        let nextUrl = path.startsWith("http://") || path.startsWith("https://") ? path : `${BASE_URL}${path}`;
        let nextParams: JsonObject | null = { ...(params ?? {}) };
        const result: JsonObject[] = [];
        let pageNo = 0;

        while (nextUrl) {
            pageNo += 1;
            const payload = await this.requestJson(nextUrl, nextParams ?? undefined);
            const data = payload.data;

            if (!Array.isArray(data)) {
                throw new Error(`Unerwartete API-Antwort fuer URL: ${nextUrl}`);
            }

            for (const item of data) {
                if (isJsonObject(item)) {
                    result.push(item);
                }
            }

            if (limit !== undefined && limit !== null && result.length >= limit) {
                result.length = limit;
                if (this.debug) {
                    log(`Limit erreicht: ${limit} Eintraege fuer ${path}`, "DEBUG");
                }
                break;
            }

            if (this.debug) {
                log(`Seite ${pageNo}: ${data.length} Eintraege (gesamt: ${result.length}) fuer ${path}`, "DEBUG");
            }

            const links = isJsonObject(payload.links) ? payload.links : null;
            const nextCandidate = links?.next;
            nextUrl = typeof nextCandidate === "string" ? nextCandidate : "";
            nextParams = null;
        }

        return result;
    }
}

function mergeQueryParams(url: string, params?: JsonObject): string {
    if (!params || Object.keys(params).length === 0) {
        return url;
    }

    const parsedUrl = new URL(url);
    for (const [key, value] of Object.entries(params)) {
        parsedUrl.searchParams.set(String(key), String(value));
    }
    return parsedUrl.toString();
}

function retryWaitSeconds(retryAfter: string | null, attempt: number): number {
    if (retryAfter) {
        const asNumber = Number(retryAfter);
        if (!Number.isNaN(asNumber)) {
            return Math.max(1, asNumber);
        }

        const parsedDate = Date.parse(retryAfter);
        if (!Number.isNaN(parsedDate)) {
            const seconds = (parsedDate - Date.now()) / 1000;
            return Math.max(1, seconds);
        }
    }

    return Math.min(2 ** attempt, 10);
}

function formatApiError(statusCode: number, url: string, body: string): string {
    let details = body.trim();

    try {
        const payload = JSON.parse(body) as unknown;
        if (isJsonObject(payload) && Object.hasOwn(payload, "errors")) {
            details = JSON.stringify(payload.errors);
        } else {
            details = JSON.stringify(payload);
        }
    } catch {
        // Kein JSON-Body, daher unveraenderte Details nutzen.
    }

    return `API-Fehler ${statusCode} fuer ${url}: ${details}`;
}

function log(message: string, level: LogLevel = "INFO"): void {
    const timestamp = new Date();
    const hh = String(timestamp.getHours()).padStart(2, "0");
    const mm = String(timestamp.getMinutes()).padStart(2, "0");
    const ss = String(timestamp.getSeconds()).padStart(2, "0");

    process.stderr.write(`[${hh}:${mm}:${ss}] [${level}] ${message}\n`);
}

function buildPlanFilterParams(planStart: string): [Record<string, string>, string] {
    const value = planStart.trim();
    assertValidDate(value);
    return [{ filter: "after", after: value }, `Termine ab ${value}`];
}

async function extractServiceTypesAndPlans(
    client: PCOClient,
    { perPage = 100, planStart, maxPlansPerServiceType = null }: ExtractOptions,
): Promise<ExportPayload> {
    const [planFilterParams, planFilterText] = buildPlanFilterParams(planStart);
    log(`Plan-Filter aktiv: ${planFilterText}`);

    log("Lade Service Types ...");
    const serviceTypes = await client.getPaginated("/service_types", { per_page: perPage, order: "sequence" });
    log(`${serviceTypes.length} Service Types geladen.`);

    const extractedServiceTypes: ServiceTypeExport[] = [];
    let specialEventsFound = false;
    let specialEventsGbkPlans: PlanExport[] = [];
    let totalPlans = 0;

    for (let index = 0; index < serviceTypes.length; index += 1) {
        const serviceType = serviceTypes[index];
        const serviceTypeId = serviceType.id;
        const attributes = isJsonObject(serviceType.attributes) ? serviceType.attributes : {};
        const serviceTypeName = (attributes.name as string | undefined) ?? "(ohne Name)";

        log(`[${index + 1}/${serviceTypes.length}] Lade Termine fuer '${serviceTypeName}' (ID ${String(serviceTypeId)}) ...`);

        let effectivePlanPerPage = perPage;
        if (maxPlansPerServiceType !== null && maxPlansPerServiceType !== undefined) {
            effectivePlanPerPage = Math.max(1, Math.min(perPage, maxPlansPerServiceType));
        }

        const planParams: JsonObject = {
            per_page: effectivePlanPerPage,
            order: "sort_date",
            ...planFilterParams,
        };

        const isSpecialEventsServiceType = serviceTypeName === SPECIAL_EVENTS_SERVICE_TYPE_NAME;
        const limitForRequest = isSpecialEventsServiceType ? undefined : (maxPlansPerServiceType ?? undefined);
        const plansRaw = await client.getPaginated(
            `/service_types/${String(serviceTypeId)}/plans`,
            planParams,
            limitForRequest,
        );

        log(`[${index + 1}/${serviceTypes.length}] ${plansRaw.length} Termine gefunden fuer '${serviceTypeName}'.`);

        const mappedPlans = plansRaw.map((plan) => {
            const planAttr = isJsonObject(plan.attributes) ? plan.attributes : {};
            const seriesId = getPlanSeriesId(plan);
            return {
                id: plan.id,
                title: planAttr.title,
                dates: planAttr.dates,
                short_dates: planAttr.short_dates,
                sort_date: planAttr.sort_date,
                planning_center_url: planAttr.planning_center_url,
                series_title: planAttr.series_title ?? null,
                series_id: seriesId,
            };
        });

        let plans = mappedPlans;
        if (isSpecialEventsServiceType) {
            specialEventsFound = true;
            const gbkPlans = mappedPlans.filter((plan) => planMatchesSeriesProbe(plan, SERIES_PROBE_NAME));
            const nonGbkPlans = mappedPlans.filter((plan) => !planMatchesSeriesProbe(plan, SERIES_PROBE_NAME));
            specialEventsGbkPlans = gbkPlans;

            if (maxPlansPerServiceType !== null) {
                plans = nonGbkPlans.slice(0, maxPlansPerServiceType);
                log(
                    `[${index + 1}/${serviceTypes.length}] ${nonGbkPlans.length} Nicht-GBK Termine verfuegbar, nutze ${plans.length} nach Auffuellen auf max=${maxPlansPerServiceType}.`,
                );
            } else {
                plans = nonGbkPlans;
                log(`[${index + 1}/${serviceTypes.length}] Entferne ${gbkPlans.length} GBK-Termine aus Sonderveranstaltungen.`);
            }
        }

        totalPlans += plans.length;
        extractedServiceTypes.push({
            id: serviceTypeId,
            name: attributes.name,
            frequency: attributes.frequency,
            updated_at: attributes.updated_at,
            plans,
        });
    }

    log(`Sondiere Series '${SERIES_PROBE_NAME}' in '${SPECIAL_EVENTS_SERVICE_TYPE_NAME}' ...`);
    const specialEventsServiceType = extractedServiceTypes.find(
        (serviceType) => asTrimmedString(serviceType.name) === SPECIAL_EVENTS_SERVICE_TYPE_NAME,
    );
    const gbkPlans = specialEventsGbkPlans;
    const derivedServiceTypes: DerivedServiceTypeExport[] = [];

    if (specialEventsFound && specialEventsServiceType) {
        log(
            `Series-Sondierung abgeschlossen: ${gbkPlans.length} Treffer fuer '${SERIES_PROBE_NAME}' in '${SPECIAL_EVENTS_SERVICE_TYPE_NAME}'.`,
        );
    } else {
        log(`Service Type '${SPECIAL_EVENTS_SERVICE_TYPE_NAME}' nicht gefunden. Keine GBK-Sondierung moeglich.`);
    }

    if (specialEventsServiceType && gbkPlans.length > 0) {
        derivedServiceTypes.push({
            id: `${String(specialEventsServiceType.id)}::series::${SERIES_PROBE_NAME}`,
            name: `${SPECIAL_EVENTS_SERVICE_TYPE_NAME}::${SERIES_PROBE_NAME}`,
            frequency: specialEventsServiceType.frequency,
            updated_at: specialEventsServiceType.updated_at,
            plans: gbkPlans,
            virtual: true,
            source_service_type_id: specialEventsServiceType.id,
            source_service_type_name: SPECIAL_EVENTS_SERVICE_TYPE_NAME,
            source_series_title: SERIES_PROBE_NAME,
        });
    }

    const derivedPlanCount = derivedServiceTypes.reduce((sum, serviceType) => sum + serviceType.plans.length, 0);

    return {
        meta: {
            generated_at_utc: new Date().toISOString(),
            service_type_count: extractedServiceTypes.length,
            plan_count: totalPlans,
            derived_service_type_count: derivedServiceTypes.length,
            derived_plan_count: derivedPlanCount,
            gbk_series_plan_count: gbkPlans.length,
        },
        service_types: extractedServiceTypes,
        derived_service_types: derivedServiceTypes,
    };
}

function parseArgs(argv = process.argv.slice(2)): ParsedArgs {
    const args: ParsedArgs = {
        userToken: process.env.PCO_USER_TOKEN,
        clientId: process.env.PCO_CLIENT_ID,
        clientSecret: process.env.PCO_CLIENT_SECRET,
        output: DEFAULT_OUTPUT_PATH,
        perPage: 100,
        maxPlansPerServiceType: null,
        planStart: null,
        timeout: 30,
        retries: 3,
        debug: false,
    };

    for (let index = 0; index < argv.length; index += 1) {
        const rawArg = argv[index];
        if (rawArg === "--debug") {
            args.debug = true;
            continue;
        }

        if (rawArg === "--help" || rawArg === "-h") {
            printHelp();
            process.exit(0);
        }

        if (!rawArg.startsWith("--")) {
            throw new Error(`Unbekannte Option: ${rawArg}`);
        }

        const [optionName, inlineValue] = splitOption(rawArg);
        const readValue = (): string => {
            if (inlineValue !== undefined) {
                return inlineValue;
            }
            const nextValue = argv[index + 1];
            if (nextValue === undefined || nextValue.startsWith("--")) {
                throw new Error(`Option ${optionName} erwartet einen Wert.`);
            }
            index += 1;
            return nextValue;
        };

        switch (optionName) {
            case "--user-token":
                args.userToken = readValue();
                break;
            case "--client-id":
                args.clientId = readValue();
                break;
            case "--client-secret":
                args.clientSecret = readValue();
                break;
            case "--output":
                args.output = readValue();
                break;
            case "--per-page":
                args.perPage = parseIntegerOption(optionName, readValue());
                break;
            case "--max-plans-per-service-type":
                args.maxPlansPerServiceType = parseIntegerOption(optionName, readValue());
                break;
            case "--plan-start":
                args.planStart = readValue();
                break;
            case "--timeout":
                args.timeout = parseIntegerOption(optionName, readValue());
                break;
            case "--retries":
                args.retries = parseIntegerOption(optionName, readValue());
                break;
            default:
                throw new Error(`Unbekannte Option: ${optionName}`);
        }
    }

    return args;
}

async function main(): Promise<number> {
    const args = parseArgs();

    try {
        log("Starte Export ...");
        if (args.debug) {
            log("Debug-Modus aktiv.", "DEBUG");
        }

        const client = new PCOClient({
            userToken: args.userToken,
            clientId: args.clientId,
            clientSecret: args.clientSecret,
            timeout: args.timeout,
            retries: args.retries,
            debug: args.debug,
        });

        if (args.userToken) {
            log("Authentifizierung: Bearer Token");
        } else {
            log("Authentifizierung: Basic Auth (client_id + secret)");
        }

        if (args.maxPlansPerServiceType !== null) {
            if (args.maxPlansPerServiceType < 1) {
                throw new Error("--max-plans-per-service-type muss >= 1 sein.");
            }
            log(`Limit aktiv: maximal ${args.maxPlansPerServiceType} Termine pro Service Type`);
        }

        let effectivePlanStart = args.planStart;
        if (effectivePlanStart === null) {
            effectivePlanStart = toLocalIsoDate(new Date());
            log(`Kein --plan-start gesetzt. Nutze heutiges Datum: ${effectivePlanStart}`);
        }

        const exportPayload = await extractServiceTypesAndPlans(client, {
            perPage: Math.max(1, Math.min(args.perPage, 100)),
            planStart: effectivePlanStart,
            maxPlansPerServiceType: args.maxPlansPerServiceType,
        });

        log(`Schreibe Ergebnis nach ${args.output} ...`);
        await writeFile(args.output, JSON.stringify(exportPayload, null, 2), "utf-8");
        log("Exportdatei geschrieben.");

        console.log(
            `Export abgeschlossen: ${exportPayload.meta.service_type_count} Service Types, ${exportPayload.meta.plan_count} Termine`,
        );
        if (exportPayload.meta.derived_service_type_count > 0) {
            console.log(
                `Abgeleitet: ${exportPayload.meta.derived_service_type_count} virtueller Service Type (${exportPayload.meta.derived_plan_count} Termine)`,
            );
        } else {
            console.log("Abgeleitet: keine virtuellen Service Types erzeugt");
        }
        console.log(`GBK-Sondierung: ${exportPayload.meta.gbk_series_plan_count} Treffer`);
        console.log(`Datei: ${args.output}`);
        return 0;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`Fehler: ${message}\n`);
        return 1;
    }
}

function splitOption(rawArg: string): [string, string | undefined] {
    const separatorIndex = rawArg.indexOf("=");
    if (separatorIndex < 0) {
        return [rawArg, undefined];
    }

    const optionName = rawArg.slice(0, separatorIndex);
    const value = rawArg.slice(separatorIndex + 1);
    return [optionName, value];
}

function parseIntegerOption(optionName: string, rawValue: string): number {
    if (!/^-?\d+$/.test(rawValue.trim())) {
        throw new Error(`${optionName} erwartet eine Ganzzahl.`);
    }
    return Number.parseInt(rawValue, 10);
}

function assertValidDate(value: string): void {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (!match) {
        throw new Error("--plan-start muss im Format YYYY-MM-DD angegeben werden.");
    }

    const year = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const day = Number.parseInt(match[3], 10);

    const candidate = new Date(Date.UTC(year, month - 1, day));
    const valid =
        candidate.getUTCFullYear() === year && candidate.getUTCMonth() === month - 1 && candidate.getUTCDate() === day;

    if (!valid) {
        throw new Error("--plan-start muss im Format YYYY-MM-DD angegeben werden.");
    }
}

function toLocalIsoDate(date: Date): string {
    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function isJsonObject(value: unknown): value is JsonObject {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asTrimmedString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function getPlanSeriesId(plan: JsonObject): string | null {
    const relationships = isJsonObject(plan.relationships) ? plan.relationships : null;
    const series = relationships && isJsonObject(relationships.series) ? relationships.series : null;
    const data = series && isJsonObject(series.data) ? series.data : null;
    if (!data) {
        return null;
    }
    if (typeof data.id === "string") {
        return data.id;
    }
    if (typeof data.id === "number") {
        return String(data.id);
    }
    return null;
}

function planMatchesSeriesProbe(plan: PlanExport, seriesProbeName: string): boolean {
    const probe = seriesProbeName.trim().toLocaleLowerCase("de-DE");
    if (!probe) {
        return false;
    }

    const seriesTitle = asTrimmedString(plan.series_title).toLocaleLowerCase("de-DE");
    if (seriesTitle === probe) {
        return true;
    }

    const planTitle = asTrimmedString(plan.title).toLocaleLowerCase("de-DE");
    return planTitle.includes(probe);
}

function sleepSeconds(seconds: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, Math.max(0, seconds) * 1000);
    });
}

function printHelp(): void {
    process.stdout.write(
        [
            "Extrahiert Service Types und zugehoerige Termine (Plans) aus Planning Center Online.",
            "",
            "Authentifizierung:",
            "1) User Token (OAuth Access Token):",
            "   npx tsx scripts/PCOTestApi.ts --user-token <TOKEN>",
            "",
            "2) Personal Access Token (client_id + secret):",
            "   npx tsx scripts/PCOTestApi.ts --client-id <CLIENT_ID> --client-secret <SECRET>",
            "",
            "Optional koennen die Werte ueber Umgebungsvariablen gesetzt werden:",
            "  PCO_USER_TOKEN",
            "  PCO_CLIENT_ID",
            "  PCO_CLIENT_SECRET",
            "",
            "Output:",
            `- Standard: ${DEFAULT_OUTPUT_PATH}`,
            "- Mit --output kann ein eigener Dateipfad gesetzt werden",
            "",
            "Plan-Filter:",
            "- Standard (ohne --plan-start): ab heutigem Datum",
            "- --plan-start 2026-03-26",
            "",
            "Series:",
            `- Erkennt pro Plan das Feld 'series_title' und sondiert '${SERIES_PROBE_NAME}' in '${SPECIAL_EVENTS_SERVICE_TYPE_NAME}'`,
            "- Treffer landen unter 'derived_service_types' als virtueller Service Type",
            "",
        ].join("\n"),
    );
}

void main().then((exitCode) => {
    process.exitCode = exitCode;
});
