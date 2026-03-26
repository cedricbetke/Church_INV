import fs from "node:fs";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("../apps/api/src/config/db");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
    ensureThumbnailForStoredPhoto,
    getExistingThumbnailRelativePath,
    getThumbnailAbsolutePath,
} = require("../apps/api/src/utils/photoThumbnails");

type Summary = {
    processed: number;
    created: number;
    skippedExisting: number;
    skippedUnsupported: number;
    errors: Array<{ invNr: number; message: string }>;
};

const rootDir = process.cwd();
const reportPath = path.join(rootDir, "import", "photo-thumbnail-backfill-report.json");
const dryRun = process.argv.includes("--dry-run");
const PROGRESS_INTERVAL = 25;

const writeReport = (summary: Summary) => {
    fs.writeFileSync(reportPath, JSON.stringify({ dryRun, ...summary }, null, 2), "utf8");
};

const main = async () => {
    const [rows] = await db.query("SELECT inv_nr, geraetefoto_url FROM geraet WHERE geraetefoto_url IS NOT NULL");
    const summary: Summary = {
        processed: 0,
        created: 0,
        skippedExisting: 0,
        skippedUnsupported: 0,
        errors: [],
    };

    for (const row of rows as Array<{ inv_nr: number; geraetefoto_url: string }>) {
        summary.processed += 1;

        if (summary.processed === 1 || summary.processed % PROGRESS_INTERVAL === 0 || summary.processed === rows.length) {
            console.log(
                `[Thumbnail-Backfill] ${summary.processed}/${rows.length} verarbeitet ` +
                `(erstellt: ${summary.created}, vorhanden: ${summary.skippedExisting}, uebersprungen: ${summary.skippedUnsupported}, fehler: ${summary.errors.length})`,
            );
        }

        if (getExistingThumbnailRelativePath(row.geraetefoto_url)) {
            summary.skippedExisting += 1;
            continue;
        }

        if (dryRun) {
            try {
                const thumbnailPath = await ensureThumbnailForStoredPhoto(row.geraetefoto_url);
                if (thumbnailPath) {
                    const absolutePath = getThumbnailAbsolutePath(row.geraetefoto_url);
                    if (fs.existsSync(absolutePath)) {
                        fs.unlinkSync(absolutePath);
                    }
                    summary.created += 1;
                } else {
                    summary.skippedUnsupported += 1;
                }
            } catch (error) {
                summary.errors.push({
                    invNr: row.inv_nr,
                    message: error instanceof Error ? error.message : "Unbekannter Fehler",
                });
            }
            continue;
        }

        try {
            const thumbnailPath = await ensureThumbnailForStoredPhoto(row.geraetefoto_url);
            if (thumbnailPath) {
                summary.created += 1;
            } else {
                summary.skippedUnsupported += 1;
            }
        } catch (error) {
            summary.errors.push({
                invNr: row.inv_nr,
                message: error instanceof Error ? error.message : "Unbekannter Fehler",
            });
        }
    }

    writeReport(summary);

    console.log(`Thumbnail-Backfill abgeschlossen${dryRun ? " (dry-run)" : ""}.`);
    console.log(`Verarbeitet: ${summary.processed}`);
    console.log(`Erstellt: ${summary.created}`);
    console.log(`Bereits vorhanden: ${summary.skippedExisting}`);
    console.log(`Nicht unterstuetzt: ${summary.skippedUnsupported}`);
    console.log(`Fehler: ${summary.errors.length}`);
    console.log(`Report: ${reportPath}`);
};

void main().catch((error) => {
    console.error("Thumbnail-Backfill fehlgeschlagen:", error);
    process.exitCode = 1;
});
