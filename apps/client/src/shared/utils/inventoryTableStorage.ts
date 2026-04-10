import { Platform } from "react-native";

const ITEMS_PER_PAGE_STORAGE_KEY = "churchinv.inventory.itemsPerPage";

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
