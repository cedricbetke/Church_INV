import { Dispatch, SetStateAction, useState } from "react";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";

export interface InventoryUiState {
    filter: string;
    setFilter: Dispatch<SetStateAction<string>>;
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
    const [filter, setFilter] = useState<string>("");
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [numberOfItemsPerPageList] = useState([5, 10, 15, 20, 30, 50]);
    const [isAddPageVisible, setIsAddPageVisible] = useState<boolean>(false);

    return {
        filter,
        setFilter,
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
