import fs from "node:fs";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("../apps/api/src/config/db");

type CleanupRow = {
    id: number;
    name: string;
    url: string;
    geraete_id: number;
};

type CleanupSummary = {
    dryRun: boolean;
    matchedRows: number;
    deletedRows: number;
    deletedFiles: number;
    missingFiles: number;
    rows: Array<{
        id: number;
        invNr: number;
        name: string;
        url: string;
        fileDeleted: boolean;
        fileMissing: boolean;
    }>;
};

const rootDir = process.cwd();
const reportPath = path.join(rootDir, "import", "cleanup-photo-documents-report.json");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".heic", ".heif", ".dng"]);

const isDevicePhotoAttachment = (fileName: string) => {
    const normalizedName = fileName.trim();
    const extension = path.extname(normalizedName).toLowerCase();

    return normalizedName.startsWith("Reserved_ImageAttachment_") && imageExtensions.has(extension);
};

const parseArgs = () => ({
    dryRun: process.argv.includes("--dry-run"),
});

const main = async () => {
    const { dryRun } = parseArgs();
    const [rows] = await db.query(
        "SELECT id, name, url, geraete_id FROM dokumente WHERE name LIKE 'Reserved_ImageAttachment_%'",
    );

    const matchedRows = (rows as CleanupRow[]).filter((row) => isDevicePhotoAttachment(row.name));

    const summary: CleanupSummary = {
        dryRun,
        matchedRows: matchedRows.length,
        deletedRows: 0,
        deletedFiles: 0,
        missingFiles: 0,
        rows: [],
    };

    for (const row of matchedRows) {
        const normalizedUrl = row.url.startsWith("/") ? row.url.slice(1) : row.url;
        const absolutePath = path.resolve(rootDir, "apps", "api", normalizedUrl.replace(/^uploads\//, "uploads/"));
        const fileExists = fs.existsSync(absolutePath);

        summary.rows.push({
            id: row.id,
            invNr: row.geraete_id,
            name: row.name,
            url: row.url,
            fileDeleted: !dryRun && fileExists,
            fileMissing: !fileExists,
        });

        if (dryRun) {
            if (!fileExists) {
                summary.missingFiles += 1;
            }
            continue;
        }

        await db.query("DELETE FROM dokumente WHERE id = ?", [row.id]);
        summary.deletedRows += 1;

        if (fileExists) {
            fs.unlinkSync(absolutePath);
            summary.deletedFiles += 1;
        } else {
            summary.missingFiles += 1;
        }
    }

    fs.writeFileSync(reportPath, JSON.stringify(summary, null, 2), "utf8");

    console.log(`Cleanup abgeschlossen${dryRun ? " (dry-run)" : ""}.`);
    console.log(`Gefundene Foto-Dokumente: ${summary.matchedRows}`);
    console.log(`Geloeschte DB-Zeilen: ${summary.deletedRows}`);
    console.log(`Geloeschte Dateien: ${summary.deletedFiles}`);
    console.log(`Fehlende Dateien: ${summary.missingFiles}`);
    console.log(`Report: ${reportPath}`);
};

void main().catch((error) => {
    console.error("Cleanup fehlgeschlagen:", error);
    process.exitCode = 1;
});
