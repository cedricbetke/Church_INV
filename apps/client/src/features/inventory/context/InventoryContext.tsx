import React, { createContext, useContext, ReactNode } from "react";
import { InventoryDataState, useInventoryData } from "@/src/features/inventory/hooks/useInventoryData";
import { InventoryUiState, useInventoryUiState } from "@/src/features/inventory/hooks/useInventoryUiState";

interface InventoryContextType extends InventoryDataState, InventoryUiState {}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const dataState = useInventoryData();
    const uiState = useInventoryUiState();

    return (
        <InventoryContext.Provider
            value={{
                ...dataState,
                ...uiState,
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
