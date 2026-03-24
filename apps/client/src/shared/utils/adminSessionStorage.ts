import { Platform } from "react-native";

const STORAGE_KEY = "churchinv.adminSession";

const canUseSessionStorage = () =>
    Platform.OS === "web" && typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";

export const readAdminSession = () => {
    if (!canUseSessionStorage()) {
        return false;
    }

    return window.sessionStorage.getItem(STORAGE_KEY) === "true";
};

export const writeAdminSession = (isActive: boolean) => {
    if (!canUseSessionStorage()) {
        return;
    }

    if (isActive) {
        window.sessionStorage.setItem(STORAGE_KEY, "true");
        return;
    }

    window.sessionStorage.removeItem(STORAGE_KEY);
};
