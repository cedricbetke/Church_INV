import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import inventoryMapper from "@/src/features/inventory/services/inventory.mapper";
import statusService from "@/src/features/masterdata/services/statusService";
import geraeteService from "@/src/features/inventory/services/geraeteService";
import modellService from "@/src/features/masterdata/services/modellService";
import herstellerService from "@/src/features/masterdata/services/herstellerService";

interface InventoryContextType {
    items: InventoryItem[];
    setItems: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    selectedItem: InventoryItem | null;
    setSelectedItem: React.Dispatch<React.SetStateAction<InventoryItem | null>>;
    states: Status[];
    setStates: React.Dispatch<React.SetStateAction<Status[]>>;
    searchQuery: string;
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
    numberOfItemsPerPageList: number[];
    isAddPageVisible: boolean;
    setIsAddPageVisible: React.Dispatch<React.SetStateAction<boolean>>;
    fetchMaxGeraeteId: () => Promise<number>;
    models: Modell[];
    setModels: React.Dispatch<React.SetStateAction<Modell[]>>;
    brands: Hersteller[];
    setBrands: React.Dispatch<React.SetStateAction<Hersteller[]>>;
    addBrand: (brandName: string) => Promise<Hersteller>;
    fetchItems: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filter, setFilter] = useState<string>("");
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [states, setStates] = useState<Status[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [numberOfItemsPerPageList] = React.useState([5, 10, 15, 20, 30, 50]);
    const [isAddPageVisible, setIsAddPageVisible] = useState<boolean>(false);
    const [models, setModels] = useState<Modell[]>([]);
    const [brands, setBrands] = useState<Hersteller[]>([]);

    const fetchItems = async () => {
        try {
            const response = await inventoryMapper.getAll();
            setItems(response);
        } catch (error) {
            console.error("Fehler beim Laden der Geraete:", error);
        }
    };

    const fetchModels = async () => {
        try {
            const response = await modellService.getAll();
            setModels(response);
        } catch (error) {
            console.error("Fehler beim Laden der Models:", error);
        }
    };

    const fetchStates = async () => {
        try {
            const response = await statusService.getAll();
            setStates(response);
        } catch (error) {
            console.error("Fehler beim Laden der States:", error);
        }
    };

    const fetchMaxGeraeteId = async (): Promise<number> => {
        try {
            const response = await geraeteService.getMaxId();
            return response as number;
        } catch (error) {
            console.error("Fehler beim Laden der States:", error);
            throw error;
        }
    };

    const fetchBrands = async () => {
        try {
            const allBrands = await herstellerService.getAll();
            setBrands(allBrands);
        } catch (error) {
            console.error("Fehler beim Laden der Brands:", error);
        }
    };

    const addBrand = async (brandName: string) => {
        try {
            const newHersteller: Hersteller = { name: brandName };
            const createdHersteller = await herstellerService.create(newHersteller);
            await fetchBrands();
            return createdHersteller;
        } catch (error) {
            console.error("Fehler beim Hinzufuegen des Herstellers:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchItems();
        fetchStates();
        fetchModels();
        fetchBrands();
    }, []);

    return (
        <InventoryContext.Provider
            value={{
                items,
                setItems,
                filter,
                setFilter,
                selectedItem,
                setSelectedItem,
                states,
                setStates,
                searchQuery,
                setSearchQuery,
                numberOfItemsPerPageList,
                isAddPageVisible,
                setIsAddPageVisible,
                fetchMaxGeraeteId,
                models,
                setModels,
                brands,
                setBrands,
                addBrand,
                fetchItems,
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
