import { Dispatch, SetStateAction, useEffect, useState } from "react";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import inventoryMapper from "@/src/features/inventory/services/inventory.mapper";
import geraeteService from "@/src/features/inventory/services/geraeteService";
import statusService from "@/src/features/masterdata/services/statusService";
import modellService from "@/src/features/masterdata/services/modellService";
import herstellerService from "@/src/features/masterdata/services/herstellerService";
import bereichService from "@/src/features/masterdata/services/bereichService";
import standortService from "@/src/features/masterdata/services/standortService";
import kategorieService from "@/src/features/masterdata/services/kategorieService";
import personService from "@/src/features/masterdata/services/personService";
import objekttypService from "@/src/features/masterdata/services/objekttypService";

export interface InventoryDataState {
    items: InventoryItem[];
    setItems: Dispatch<SetStateAction<InventoryItem[]>>;
    states: Status[];
    setStates: Dispatch<SetStateAction<Status[]>>;
    models: Modell[];
    setModels: Dispatch<SetStateAction<Modell[]>>;
    brands: Hersteller[];
    setBrands: Dispatch<SetStateAction<Hersteller[]>>;
    bereiche: Bereich[];
    setBereiche: Dispatch<SetStateAction<Bereich[]>>;
    standorte: Standort[];
    setStandorte: Dispatch<SetStateAction<Standort[]>>;
    kategorien: Kategorie[];
    setKategorien: Dispatch<SetStateAction<Kategorie[]>>;
    personen: Person[];
    setPersonen: Dispatch<SetStateAction<Person[]>>;
    objekttypen: Array<{ id: number; name: string }>;
    setObjekttypen: Dispatch<SetStateAction<Array<{ id: number; name: string }>>>;
    fetchItems: () => Promise<InventoryItem[]>;
    fetchMaxGeraeteId: () => Promise<number>;
    addBrand: (brandName: string) => Promise<Hersteller>;
    addObjectType: (name: string) => Promise<{ id: number; name: string }>;
    addModel: (name: string, herstellerId: number, objekttypId: number) => Promise<Modell>;
}

export const useInventoryData = (): InventoryDataState => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [states, setStates] = useState<Status[]>([]);
    const [models, setModels] = useState<Modell[]>([]);
    const [brands, setBrands] = useState<Hersteller[]>([]);
    const [bereiche, setBereiche] = useState<Bereich[]>([]);
    const [standorte, setStandorte] = useState<Standort[]>([]);
    const [kategorien, setKategorien] = useState<Kategorie[]>([]);
    const [personen, setPersonen] = useState<Person[]>([]);
    const [objekttypen, setObjekttypen] = useState<Array<{ id: number; name: string }>>([]);

    const fetchItems = async () => {
        try {
            const response = await inventoryMapper.getAll();
            setItems(response);
            return response;
        } catch (error) {
            console.error("Fehler beim Laden der Geraete:", error);
            return [];
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

    const fetchBereiche = async () => {
        try {
            const response = await bereichService.getAll();
            setBereiche(response);
        } catch (error) {
            console.error("Fehler beim Laden der Bereiche:", error);
        }
    };

    const fetchStandorte = async () => {
        try {
            const response = await standortService.getAll();
            setStandorte(response);
        } catch (error) {
            console.error("Fehler beim Laden der Standorte:", error);
        }
    };

    const fetchKategorien = async () => {
        try {
            const response = await kategorieService.getAll();
            setKategorien(response);
        } catch (error) {
            console.error("Fehler beim Laden der Kategorien:", error);
        }
    };

    const fetchPersonen = async () => {
        try {
            const response = await personService.getAll();
            setPersonen(response);
        } catch (error) {
            console.error("Fehler beim Laden der Personen:", error);
        }
    };

    const fetchObjekttypen = async () => {
        try {
            const response = await objekttypService.getAll();
            setObjekttypen(response);
        } catch (error) {
            console.error("Fehler beim Laden der Objekttypen:", error);
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

    const addObjectType = async (name: string) => {
        try {
            const createdObjekttyp = await objekttypService.create({ name });
            await fetchObjekttypen();
            return createdObjekttyp;
        } catch (error) {
            console.error("Fehler beim Hinzufuegen des Objekttyps:", error);
            throw error;
        }
    };

    const addModel = async (name: string, herstellerId: number, objekttypId: number) => {
        try {
            const createdModel = await modellService.create({
                name,
                hersteller_id: herstellerId,
                objekttyp_id: objekttypId,
            });
            await fetchModels();
            return createdModel;
        } catch (error) {
            console.error("Fehler beim Hinzufuegen des Modells:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchItems();
        fetchStates();
        fetchModels();
        fetchBrands();
        fetchBereiche();
        fetchStandorte();
        fetchKategorien();
        fetchPersonen();
        fetchObjekttypen();
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
        bereiche,
        setBereiche,
        standorte,
        setStandorte,
        kategorien,
        setKategorien,
        personen,
        setPersonen,
        objekttypen,
        setObjekttypen,
        fetchItems,
        fetchMaxGeraeteId,
        addBrand,
        addObjectType,
        addModel,
    };
};
