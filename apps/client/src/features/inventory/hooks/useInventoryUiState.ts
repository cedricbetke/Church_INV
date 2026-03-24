import { Dispatch, SetStateAction, useState } from "react";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";

export interface InventoryFilters {
    status: string;
    hersteller: string;
    modell: string;
    bereich: string;
    standort: string;
}

export interface InventoryUiState {
    filters: InventoryFilters;
    setFilters: Dispatch<SetStateAction<InventoryFilters>>;
    isFilterVisible: boolean;
    setIsFilterVisible: Dispatch<SetStateAction<boolean>>;
    selectedItem: InventoryItem | null;
    setSelectedItem: Dispatch<SetStateAction<InventoryItem | null>>;
    editingItem: InventoryItem | null;
    setEditingItem: Dispatch<SetStateAction<InventoryItem | null>>;
    searchQuery: string;
    setSearchQuery: Dispatch<SetStateAction<string>>;
    numberOfItemsPerPageList: number[];
    isAddPageVisible: boolean;
    setIsAddPageVisible: Dispatch<SetStateAction<boolean>>;
}

export const useInventoryUiState = (): InventoryUiState => {
    const [filters, setFilters] = useState<InventoryFilters>({
        status: "",
        hersteller: "",
        modell: "",
        bereich: "",
        standort: "",
    });
    const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [numberOfItemsPerPageList] = useState([5, 10, 15, 20, 30, 50]);
    const [isAddPageVisible, setIsAddPageVisible] = useState<boolean>(false);

    return {
        filters,
        setFilters,
        isFilterVisible,
        setIsFilterVisible,
        selectedItem,
        setSelectedItem,
        editingItem,
        setEditingItem,
        searchQuery,
        setSearchQuery,
        numberOfItemsPerPageList,
        isAddPageVisible,
        setIsAddPageVisible,
    };
};
