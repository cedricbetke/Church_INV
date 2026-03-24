import { Dispatch, SetStateAction, useEffect, useState } from "react";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import inventoryMapper from "@/src/features/inventory/services/inventory.mapper";
import geraeteService from "@/src/features/inventory/services/geraeteService";
import statusService from "@/src/features/masterdata/services/statusService";
import modellService from "@/src/features/masterdata/services/modellService";
import herstellerService from "@/src/features/masterdata/services/herstellerService";

export interface InventoryDataState {
    items: InventoryItem[];
    setItems: Dispatch<SetStateAction<InventoryItem[]>>;
    states: Status[];
    setStates: Dispatch<SetStateAction<Status[]>>;
    models: Modell[];
    setModels: Dispatch<SetStateAction<Modell[]>>;
    brands: Hersteller[];
    setBrands: Dispatch<SetStateAction<Hersteller[]>>;
    fetchItems: () => Promise<void>;
    fetchMaxGeraeteId: () => Promise<number>;
    addBrand: (brandName: string) => Promise<Hersteller>;
}

export const useInventoryData = (): InventoryDataState => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [states, setStates] = useState<Status[]>([]);
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

    const fetchStates = async () => {
        try {
            const response = await statusService.getAll();
            setStates(response);
        } catch (error) {
            console.error("Fehler beim Laden der States:", error);
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

    const fetchBrands = async () => {
        try {
            const allBrands = await herstellerService.getAll();
            setBrands(allBrands);
        } catch (error) {
            console.error("Fehler beim Laden der Brands:", error);
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

    return {
        items,
        setItems,
        states,
        setStates,
        models,
        setModels,
        brands,
        setBrands,
        fetchItems,
        fetchMaxGeraeteId,
        addBrand,
    };
};
