import { useEffect, useState } from "react";
import { Platform } from "react-native";

export const canUseQrScannerInCurrentContext = () => {
    if (Platform.OS !== "web") {
        return true;
    }

    if (typeof window === "undefined") {
        return true;
    }

    return window.isSecureContext;
};

export const useQrScannerAvailability = () => {
    const [isAvailable, setIsAvailable] = useState(canUseQrScannerInCurrentContext);

    useEffect(() => {
        setIsAvailable(canUseQrScannerInCurrentContext());
    }, []);

    return isAvailable;
};
