import React, {createContext, useContext, useState, ReactNode, useEffect} from "react";
import  InventoryItem  from "@/app/inventoryItem/InventoryItem";
import geraetServiceWithMapping from "@/web/geraetserviceMapper";
import StatusService from "@/web/statusService"; // Falls du Typen hast

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
}

// 2. Initialen Kontext erstellen
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// 3. Provider-Komponente
export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [filter, setFilter] = useState<string>(""); // Beispiel: Filter für Suchfunktion
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null); // Beispiel: Aktuell ausgewähltes Gerät
    const [states,setStates] = useState<Status[]>([]);
    // Funktion zum Laden der Items (API-Call)
    const fetchItems = async () => {
        try {
            const response = await geraetServiceWithMapping.getAll();
            setItems(response);
        } catch (error) {
            console.error("Fehler beim Laden der Geräte:", error);
        }
    };
    const fetchstates = async () => {
        try {
            const response = await StatusService.getAll();
            setStates(response);
        } catch (error) {
            console.error("Fehler beim Laden der States:", error);
        }
    };
    // Beim ersten Rendern automatisch laden
    useEffect(() => {
        fetchItems();
    }, []);
    return (
        <InventoryContext.Provider value={{ items, setItems, filter, setFilter, selectedItem, setSelectedItem,states,setStates }}>
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
