import fs from "node:fs";
import path from "node:path";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require("../apps/api/src/config/db");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
    optimizePhotoToStoredPath,
    ensureThumbnailForStoredPhoto,
    getStoredAbsolutePath,
    deleteThumbnailForStoredPhoto,
} = require("../apps/api/src/utils/photoThumbnails");

type Summary = {
    processed: number;
    optimized: number;
    updatedPaths: number;
    skippedMissing: number;
    skippedInvalid: number;
    savedBytes: number;
    errors: Array<{ invNr: number; message: string }>;
};

const rootDir = process.cwd();
const reportPath = path.join(rootDir, "import", "photo-optimization-report.json");
const dryRun = process.argv.includes("--dry-run");
const PROGRESS_INTERVAL = 25;

const writeReport = (summary: Summary) => {
    fs.writeFileSync(
        reportPath,
        JSON.stringify(
            {
                dryRun,
                ...summary,
                savedMb: Number((summary.savedBytes / 1024 / 1024).toFixed(2)),
            },
            null,
            2,
        ),
        "utf8",
    );
};

const toOptimizedRelativePath = (storedPath: string) => {
    const normalized = storedPath.replace(/\\/g, "/");
    const parsed = path.posix.parse(normalized);
    return `${parsed.dir}/${parsed.name}.jpg`;
};

const main = async () => {
    const [rows] = await db.query("SELECT inv_nr, geraetefoto_url FROM geraet WHERE geraetefoto_url IS NOT NULL");

    const summary: Summary = {
        processed: 0,
        optimized: 0,
        updatedPaths: 0,
        skippedMissing: 0,
        skippedInvalid: 0,
        savedBytes: 0,
        errors: [],
    };

    for (const row of rows as Array<{ inv_nr: number; geraetefoto_url: string }>) {
        summary.processed += 1;

        if (summary.processed === 1 || summary.processed % PROGRESS_INTERVAL === 0 || summary.processed === rows.length) {
            console.log(
                `[Photo-Optimize] ${summary.processed}/${rows.length} verarbeitet ` +
                `(optimiert: ${summary.optimized}, pfade: ${summary.updatedPaths}, ` +
                `fehlen: ${summary.skippedMissing}, ungueltig: ${summary.skippedInvalid}, fehler: ${summary.errors.length})`,
            );
        }

        const oldRelativePath = row.geraetefoto_url;
        const oldAbsolutePath = getStoredAbsolutePath(oldRelativePath);

        if (!oldAbsolutePath) {
            summary.skippedInvalid += 1;
            continue;
        }

        if (!fs.existsSync(oldAbsolutePath)) {
            summary.skippedMissing += 1;
            continue;
        }

        const oldStats = fs.statSync(oldAbsolutePath);
        const nextRelativePath = toOptimizedRelativePath(oldRelativePath);
        const nextAbsolutePath = getStoredAbsolutePath(nextRelativePath);

        if (!nextAbsolutePath) {
            summary.skippedInvalid += 1;
            continue;
        }

        const targetAbsolutePath =
            nextAbsolutePath === oldAbsolutePath ? `${oldAbsolutePath}.tmp` : nextAbsolutePath;

        try {
            await optimizePhotoToStoredPath(oldAbsolutePath, targetAbsolutePath);

            const optimizedStats = fs.statSync(targetAbsolutePath);
            const savedBytes = Math.max(0, oldStats.size - optimizedStats.size);

            if (dryRun) {
                fs.unlinkSync(targetAbsolutePath);
                summary.optimized += 1;
                if (nextRelativePath !== oldRelativePath) {
                    summary.updatedPaths += 1;
                }
                summary.savedBytes += savedBytes;
                continue;
            }

            deleteThumbnailForStoredPhoto(oldRelativePath);

            if (nextAbsolutePath === oldAbsolutePath) {
                fs.renameSync(targetAbsolutePath, oldAbsolutePath);
            } else {
                fs.renameSync(targetAbsolutePath, nextAbsolutePath);
                fs.unlinkSync(oldAbsolutePath);
            }

            await ensureThumbnailForStoredPhoto(nextRelativePath);

            if (nextRelativePath !== oldRelativePath) {
                await db.query("UPDATE geraet SET geraetefoto_url = ? WHERE inv_nr = ?", [nextRelativePath, row.inv_nr]);
                summary.updatedPaths += 1;
            }

            summary.optimized += 1;
            summary.savedBytes += savedBytes;
        } catch (error) {
            if (fs.existsSync(targetAbsolutePath)) {
                fs.unlinkSync(targetAbsolutePath);
            }

            summary.errors.push({
                invNr: row.inv_nr,
                message: error instanceof Error ? error.message : "Unbekannter Fehler",
            });
        }
    }

    writeReport(summary);

    console.log(`Foto-Optimierung abgeschlossen${dryRun ? " (dry-run)" : ""}.`);
    console.log(`Verarbeitet: ${summary.processed}`);
    console.log(`Optimiert: ${summary.optimized}`);
    console.log(`Aktualisierte Pfade: ${summary.updatedPaths}`);
    console.log(`Fehlende Dateien: ${summary.skippedMissing}`);
    console.log(`Ungueltige Pfade: ${summary.skippedInvalid}`);
    console.log(`Gesparter Speicher: ${(summary.savedBytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Fehler: ${summary.errors.length}`);
    console.log(`Report: ${reportPath}`);
};

void main().catch((error) => {
    console.error("Foto-Optimierung fehlgeschlagen:", error);
    process.exitCode = 1;
});
