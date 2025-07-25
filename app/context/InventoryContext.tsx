import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import  InventoryItem  from "@/app/inventoryItem/InventoryItem";
import geraetServiceWithMapping from "@/web/geraetserviceMapper";
import StatusService from "@/web/statusService";
import geraeteService from "@/web/geraeteService";
import modelService from "@/web/modelService";
import herstellerService from "@/web/herstellerService"; // Falls du Typen hast

// 1. Kontext-Typ definieren
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
    setModels: React.Dispatch<React.SetStateAction<Modell[]>>
    brands: Hersteller[];
    setBrands: React.Dispatch<React.SetStateAction<Hersteller[]>>;
    addBrand: (brandName: string) => Promise<Hersteller>;
    fetchItems: () => Promise<void>;

}

// 2. Initialen Kontext erstellen
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// 3. Provider-Komponente
export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filter, setFilter] = useState<string>(""); // Beispiel: Filter für Suchfunktion
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null); // Beispiel: Aktuell ausgewähltes Gerät
    const [states,setStates] = useState<Status[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>(""); //seachquery für Table search
    const [numberOfItemsPerPageList] = React.useState([5,10,15,20,30,50]);
    const [isAddPageVisible, setIsAddPageVisible] = useState<boolean>(false);
    const [models, setModels] = useState<Modell[]>([]);
    const [brands, setBrands] = useState<Hersteller[]>([]);


    // Funktion zum Laden der Items (API-Call)
    const fetchItems = async () => {
        try {
            const response = await geraetServiceWithMapping.getAll();
            setItems(response);
        } catch (error) {
            console.error("Fehler beim Laden der Geräte:", error);
        }
    };
    const fetchModels = async () => {
        try {
            const response = await modelService.getAll();
            setModels(response);
        } catch (error) {
            console.error("Fehler beim Laden der Models:", error);
        }
    }
    const fetchstates = async () => {
        try {
            const response = await StatusService.getAll();
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
            throw error; // wichtig, damit der Fehler "durchgeht"
        }
    };
    const fetchBrands = async () => {
        try {
            const allBrands = await herstellerService.getAll();
            setBrands(allBrands);
        } catch (error) {
            console.error('Fehler beim Laden der Brands:', error);
        }
    };
    const addBrand = async (brandName: string) => {
        try {
            const newHersteller: Hersteller = { name: brandName };
            const createdHersteller = await herstellerService.create(newHersteller);

            // Brands neu laden für Konsistenz
            await fetchBrands();

            return createdHersteller;
        } catch (error) {
            console.error('Fehler beim Hinzufügen des Herstellers:', error);
            throw error;
        }
    };

    // Beim ersten Rendern automatisch laden
    useEffect(() => {
        fetchItems();
        fetchstates();
        fetchModels();
        fetchBrands();
    }, []);
    return (
        <InventoryContext.Provider value={{ items, setItems, filter, setFilter, selectedItem, setSelectedItem,states,
            setStates, searchQuery, setSearchQuery,numberOfItemsPerPageList, setIsAddPageVisible, isAddPageVisible, fetchMaxGeraeteId,
            models, setModels, brands, setBrands, addBrand, fetchItems }}>
            {children}
        </InventoryContext.Provider>
    );
};

// 4. Custom Hook zur Nutzung des Kontexts
export const useInventory = (): InventoryContextType => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error("useInventory muss innerhalb eines InventoryProviders verwendet werden");
    }
    return context;
};
