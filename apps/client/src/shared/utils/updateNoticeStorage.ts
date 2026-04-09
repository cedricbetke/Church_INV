import { Platform } from "react-native";

const STORAGE_KEY = "churchinv.seenUpdateVersion";

const canUseLocalStorage = () =>
    Platform.OS === "web" && typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export const readSeenUpdateVersion = () => {
    if (!canUseLocalStorage()) {
        return null;
    }

    return window.localStorage.getItem(STORAGE_KEY);
};

export const writeSeenUpdateVersion = (version: string) => {
    if (!canUseLocalStorage()) {
        return;
    }

    window.localStorage.setItem(STORAGE_KEY, version);
};
