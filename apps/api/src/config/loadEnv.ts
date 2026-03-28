import fs from "fs";
import path from "path";

const stripQuotes = (value: string) => {
    const trimmed = value.trim();
    if (
        (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
        (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
};

const parseEnvLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
        return null;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
        return null;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = stripQuotes(trimmed.slice(separatorIndex + 1));

    if (!key) {
        return null;
    }

    return { key, value };
};

export const loadEnv = () => {
    const candidatePaths = [
        path.resolve(process.cwd(), ".env"),
        path.resolve(process.cwd(), "apps", "api", ".env"),
    ];

    for (const envPath of candidatePaths) {
        if (!fs.existsSync(envPath)) {
            continue;
        }

        const fileContents = fs.readFileSync(envPath, "utf8");
        for (const line of fileContents.split(/\r?\n/)) {
            const parsed = parseEnvLine(line);
            if (!parsed) {
                continue;
            }

            if (process.env[parsed.key] === undefined) {
                process.env[parsed.key] = parsed.value;
            }
        }

        return;
    }
};
