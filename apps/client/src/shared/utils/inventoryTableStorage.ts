import { Platform } from "react-native";

const ITEMS_PER_PAGE_STORAGE_KEY = "churchinv.inventory.itemsPerPage";
const COLUMN_VISIBILITY_STORAGE_KEY = "churchinv.inventory.columnVisibility";

interface TableColumnVisibility {
    key: string | number | symbol;
    visible: boolean;
    locked?: boolean;
}

const canUseLocalStorage = () =>
    Platform.OS === "web" && typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const readStoredItemsPerPage = (allowedValues: number[], fallbackValue: number) => {
    if (!canUseLocalStorage()) {
        return fallbackValue;
    }

    const rawValue = window.localStorage.getItem(ITEMS_PER_PAGE_STORAGE_KEY);
    const parsedValue = rawValue ? Number(rawValue) : NaN;

    return allowedValues.includes(parsedValue) ? parsedValue : fallbackValue;
};

export const writeStoredItemsPerPage = (value: number) => {
    if (!canUseLocalStorage()) {
        return;
    }

    window.localStorage.setItem(ITEMS_PER_PAGE_STORAGE_KEY, String(value));
};

export const readStoredColumnVisibility = <TColumn extends TableColumnVisibility>(columns: TColumn[]) => {
    if (!canUseLocalStorage()) {
        return columns;
    }

    const rawValue = window.localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);

    if (!rawValue) {
        return columns;
    }

    try {
        const storedVisibility = JSON.parse(rawValue) as unknown;

        if (!storedVisibility || typeof storedVisibility !== "object" || Array.isArray(storedVisibility)) {
            return columns;
        }

        const visibilityByKey = storedVisibility as Record<string, unknown>;

        return columns.map((column) => {
            if (column.locked) {
                return { ...column, visible: true };
            }

            const storedValue = visibilityByKey[String(column.key)];

            return typeof storedValue === "boolean"
                ? { ...column, visible: storedValue }
                : column;
        });
    } catch {
        return columns;
    }
};

export const writeStoredColumnVisibility = (columns: TableColumnVisibility[]) => {
    if (!canUseLocalStorage()) {
        return;
    }

    const visibilityByKey = columns.reduce<Record<string, boolean>>((result, column) => {
        if (!column.locked) {
            result[String(column.key)] = column.visible;
        }

        return result;
    }, {});

    window.localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(visibilityByKey));
};
