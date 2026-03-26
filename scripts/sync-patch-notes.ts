import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type PatchNotesData = {
    app: string;
    entries: Array<{
        version: string;
        date: string;
        title: string;
        summary: string;
        items: string[];
    }>;
};

const rootDir = process.cwd();
const jsonPath = path.join(rootDir, "docs", "patch-notes", "patch-notes.json");
const markdownPath = path.join(rootDir, "docs", "changelog.md");
const clientDataPath = path.join(rootDir, "apps", "client", "src", "features", "patch-notes", "data", "patchNotes.ts");

const patchNotes = JSON.parse(readFileSync(jsonPath, "utf8")) as PatchNotesData;

const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
};

const escapeTsString = (value: string) =>
    JSON.stringify(value)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e");

// The JSON file is the single source of truth.
// This script derives the readable Markdown changelog and the client-side TS module from it.
const markdown = [
    "# Patch Notes",
    "",
    "> Diese Datei wird aus `docs/patch-notes/patch-notes.json` erzeugt.",
    "> Änderungen daher bitte in der JSON-Datei pflegen und danach `npm run sync:patch-notes` ausführen.",
    "",
    ...patchNotes.entries.flatMap((entry) => [
        `## ${entry.version}`,
        "",
        `**${formatDate(entry.date)}**  `,
        `**${entry.title}**`,
        "",
        entry.summary,
        "",
        ...entry.items.map((item) => `- ${item}`),
        "",
    ]),
].join("\n");

const clientModule = [
    "// Diese Datei wird aus docs/patch-notes/patch-notes.json erzeugt.",
    "// Änderungen daher bitte in der JSON-Datei pflegen und danach `npm run sync:patch-notes` ausführen.",
    "",
    "export interface PatchNoteEntry {",
    "    version: string;",
    "    date: string;",
    "    title: string;",
    "    summary: string;",
    "    items: string[];",
    "}",
    "",
    "export interface PatchNotesData {",
    "    app: string;",
    "    entries: PatchNoteEntry[];",
    "}",
    "",
    "export const patchNotesData: PatchNotesData = {",
    `    app: ${escapeTsString(patchNotes.app)},`,
    "    entries: [",
    ...patchNotes.entries.flatMap((entry) => [
        "        {",
        `            version: ${escapeTsString(entry.version)},`,
        `            date: ${escapeTsString(entry.date)},`,
        `            title: ${escapeTsString(entry.title)},`,
        `            summary: ${escapeTsString(entry.summary)},`,
        "            items: [",
        ...entry.items.map((item) => `                ${escapeTsString(item)},`),
        "            ],",
        "        },",
    ]),
    "    ],",
    "};",
    "",
].join("\n");

writeFileSync(markdownPath, `${markdown}\n`, "utf8");
writeFileSync(clientDataPath, clientModule, "utf8");

console.log("Patch Notes synchronisiert:");
console.log(`- ${markdownPath}`);
console.log(`- ${clientDataPath}`);
