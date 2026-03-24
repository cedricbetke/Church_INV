import React, { createContext, useContext, ReactNode, useEffect, useMemo, useState } from "react";
import { InventoryDataState, useInventoryData } from "@/src/features/inventory/hooks/useInventoryData";
import { InventoryUiState, useInventoryUiState } from "@/src/features/inventory/hooks/useInventoryUiState";
import { adminPassword as configuredAdminPassword, hasAdminBypass } from "@/src/shared/config/access";
import apiClient from "@/src/shared/api/apiClient";

interface InventoryContextType extends InventoryDataState, InventoryUiState {
    canManageInventory: boolean;
    isAdminSessionActive: boolean;
    isAdminLoginConfigured: boolean;
    activateAdminSession: (password: string) => boolean;
    clearAdminSession: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const dataState = useInventoryData();
    const uiState = useInventoryUiState();
    const [isAdminSessionActive, setIsAdminSessionActive] = useState<boolean>(hasAdminBypass);
    const isAdminLoginConfigured = Boolean(configuredAdminPassword);

    const activateAdminSession = (password: string) => {
        if (!configuredAdminPassword || password !== configuredAdminPassword) {
            return false;
        }

        setIsAdminSessionActive(true);
        return true;
    };

    const clearAdminSession = () => {
        setIsAdminSessionActive(hasAdminBypass);
    };

    const canManageInventory = useMemo(
        () => hasAdminBypass || isAdminSessionActive,
        [isAdminSessionActive],
    );

    useEffect(() => {
        if (canManageInventory && configuredAdminPassword) {
            apiClient.setAdminPassword(configuredAdminPassword);
            return;
        }

        apiClient.setAdminPassword(null);
    }, [canManageInventory]);

    return (
        <InventoryContext.Provider
            value={{
                ...dataState,
                ...uiState,
                canManageInventory,
                isAdminSessionActive,
                isAdminLoginConfigured,
                activateAdminSession,
                clearAdminSession,
            }}
        >
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = (): InventoryContextType => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error("useInventory muss innerhalb eines InventoryProviders verwendet werden");
    }
    return context;
};
