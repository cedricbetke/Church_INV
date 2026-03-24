import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Platform } from "react-native";
import { Modal, Portal, Button, Title } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FormFields } from "./FormFields";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import SelectionDialog from "./SelectionDialog";
import { FormData } from "@/src/features/inventory/types/FormData";
import { CreateGeraetPayload } from "@/src/features/inventory/types/CreateGeraetPayload";

interface NamedItem {
    id: number;
    name: string;
}

const normalize = (value: string) => value.trim().toLowerCase();
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PRICE_PATTERN = /^\d+(?:[.,]\d{1,2})?$/;

const isValidIsoDate = (value: string) => {
    if (!DATE_PATTERN.test(value)) {
        return false;
    }

    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month - 1 &&
        date.getUTCDate() === day
    );
};

const parsePrice = (value: string) => Number.parseFloat(value.replace(",", "."));
const formatDateForDb = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const parseDbDate = (value: string) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
};
const today = new Date();

interface AddPageProps {
    visible: boolean;
    onDismiss: () => void;
    existingBrands: Hersteller[];
    existingModels: Modell[];
    onAddBrand: (brandName: string) => Promise<void>;
    onSubmit: (itemData: CreateGeraetPayload) => Promise<void>;
}

const emptyFormData: FormData = {
    invNr: "",
    modell: "",
    hersteller: "",
    serien_nr: "",
    kaufdatum: "",
    einkaufspreis: "",
    standort: "",
    bereich: "",
    kategorie: "",
    status: "",
    verantwortlicher: "",
};

const AddPage: React.FC<AddPageProps> = ({
    visible,
    onDismiss,
    existingModels,
    existingBrands,
    onAddBrand,
    onSubmit,
}) => {
    const { states, fetchMaxGeraeteId, bereiche, standorte, kategorien, personen } = useInventory();
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showBrandDialog, setShowBrandDialog] = useState(false);
    const [showModelDialog, setShowModelDialog] = useState(false);
    const [showStandortDialog, setShowStandortDialog] = useState(false);
    const [showBereichDialog, setShowBereichDialog] = useState(false);
    const [showKategorieDialog, setShowKategorieDialog] = useState(false);
    const [showVerantwortlicherDialog, setShowVerantwortlicherDialog] = useState(false);
    const [showKaufdatumPicker, setShowKaufdatumPicker] = useState(false);
    const [statusSearchQuery, setStatusSearchQuery] = useState("");
    const [brandSearchQuery, setBrandSearchQuery] = useState("");
    const [modelSearchQuery, setModelSearchQuery] = useState("");
    const [standortSearchQuery, setStandortSearchQuery] = useState("");
    const [bereichSearchQuery, setBereichSearchQuery] = useState("");
    const [kategorieSearchQuery, setKategorieSearchQuery] = useState("");
    const [verantwortlicherSearchQuery, setVerantwortlicherSearchQuery] = useState("");
    const [isNewBrand, setIsNewBrand] = useState(false);
    const [isNewModel, setIsNewModel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingNewBrand, setPendingNewBrand] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const selectedBrand = existingBrands.find(
        (brand) => normalize(brand.name) === normalize(formData.hersteller),
    );

    const filteredModels = selectedBrand?.id
        ? existingModels.filter((model) => model.hersteller_id === selectedBrand.id)
        : existingModels;

    const selectedBereich = bereiche.find(
        (bereich) => normalize(bereich.name) === normalize(formData.bereich),
    );

    const filteredKategorien = selectedBereich
        ? kategorien.filter((kategorie) => kategorie.bereich_id === selectedBereich.id)
        : kategorien;

    const resetDialogState = () => {
        setShowStatusDialog(false);
        setShowBrandDialog(false);
        setShowModelDialog(false);
        setShowStandortDialog(false);
        setShowBereichDialog(false);
        setShowKategorieDialog(false);
        setShowVerantwortlicherDialog(false);
        setShowKaufdatumPicker(false);
        setStatusSearchQuery("");
        setBrandSearchQuery("");
        setModelSearchQuery("");
        setStandortSearchQuery("");
        setBereichSearchQuery("");
        setKategorieSearchQuery("");
        setVerantwortlicherSearchQuery("");
        setIsNewBrand(false);
        setIsNewModel(false);
    };

    const handleDismiss = () => {
        resetForm();
        resetDialogState();
        onDismiss();
    };

    useEffect(() => {
        if (!visible) {
            return;
        }

        const loadMaxId = async () => {
            try {
                setLoading(true);
                const maxId = await fetchMaxGeraeteId();
                setFormData((prev) => ({
                    ...prev,
                    invNr: String(maxId),
                }));
            } catch (loadError) {
                console.error("Fehler beim Laden der Max-ID:", loadError);
                setError("Fehler beim Laden der Max-ID");
            } finally {
                setLoading(false);
            }
        };

        loadMaxId();
    }, [visible, fetchMaxGeraeteId]);

    const resetForm = () => {
        setFormData(emptyFormData);
        setErrors({});
        setError(null);
        setPendingNewBrand(null);
    };

    const handleChange = (name: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleDependentChange = (name: string, value: string) => {
        if (name === "hersteller") {
            setFormData((prev) => ({
                ...prev,
                hersteller: value,
                modell: "",
            }));
            setErrors((prev) => ({
                ...prev,
                hersteller: "",
                modell: "",
            }));
            return;
        }

        if (name === "bereich") {
            setFormData((prev) => ({
                ...prev,
                bereich: value,
                kategorie: "",
            }));
            setErrors((prev) => ({
                ...prev,
                bereich: "",
                kategorie: "",
            }));
            return;
        }

        handleChange(name, value);
    };

    const handleBrandSelect = (brandName: string) => {
        handleDependentChange("hersteller", brandName);
        setShowBrandDialog(false);
        setBrandSearchQuery("");
        setModelSearchQuery("");
    };

    const handleAddNewBrand = async () => {
        if (!brandSearchQuery.trim()) {
            return;
        }

        setPendingNewBrand(brandSearchQuery);
        handleBrandSelect(brandSearchQuery);
        setIsNewBrand(false);
    };

    const handleModelSelect = (modelName: string) => {
        handleChange("modell", modelName);
        setShowModelDialog(false);
        setModelSearchQuery("");
    };

    const handleKaufdatumConfirm = (date: Date) => {
        handleChange("kaufdatum", formatDateForDb(date));
        setShowKaufdatumPicker(false);
    };

    const validateForm = () => {
        const nextErrors: Record<string, string> = {};

        if (!formData.invNr) nextErrors.invNr = "Inventarnummer ist erforderlich";
        if (!formData.modell) nextErrors.modell = "Modell ist erforderlich";
        if (!formData.status) nextErrors.status = "Status ist erforderlich";
        if (!formData.standort) nextErrors.standort = "Standort ist erforderlich";
        if (!formData.bereich) nextErrors.bereich = "Bereich ist erforderlich";
        if (!formData.kategorie) nextErrors.kategorie = "Kategorie ist erforderlich";
        if (!formData.verantwortlicher) nextErrors.verantwortlicher = "Verantwortlicher ist erforderlich";
        if (formData.kaufdatum && !isValidIsoDate(formData.kaufdatum)) {
            nextErrors.kaufdatum = "Kaufdatum muss im Format YYYY-MM-DD sein";
        }
        if (formData.kaufdatum && isValidIsoDate(formData.kaufdatum) && parseDbDate(formData.kaufdatum) > today) {
            nextErrors.kaufdatum = "Kaufdatum darf nicht in der Zukunft liegen";
        }
        if (formData.einkaufspreis && !PRICE_PATTERN.test(formData.einkaufspreis.trim())) {
            nextErrors.einkaufspreis = "Einkaufspreis muss eine Zahl mit bis zu 2 Nachkommastellen sein";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const findByName = <T extends NamedItem>(items: T[], name: string) =>
        items.find((item) => normalize(item.name) === normalize(name));

    const personItems: NamedItem[] = personen.map((person) => ({
        id: person.id,
        name: `${person.vorname} ${person.nachname}`.trim(),
    }));

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            if (pendingNewBrand) {
                await onAddBrand(pendingNewBrand);
            }

            const selectedModel = findByName(filteredModels, formData.modell);
            const selectedStatus = findByName(states, formData.status);
            const selectedStandort = findByName(standorte, formData.standort);
            const selectedBereich = findByName(bereiche, formData.bereich);
            const selectedKategorie = findByName(filteredKategorien, formData.kategorie);
            const selectedVerantwortlicher = findByName(personItems, formData.verantwortlicher);

            if (!selectedModel || !selectedStatus || !selectedStandort || !selectedBereich || !selectedKategorie || !selectedVerantwortlicher) {
                setError("Die ausgewaehlten Stammdaten konnten nicht aufgeloest werden.");
                return;
            }

            const payload: CreateGeraetPayload = {
                modell_id: selectedModel.id,
                status_id: selectedStatus.id,
                standort_id: selectedStandort.id,
                bereich_id: selectedBereich.id,
                kategorie_id: selectedKategorie.id,
                verantwortlicher_id: selectedVerantwortlicher.id,
                serien_nr: formData.serien_nr || undefined,
                kaufdatum: formData.kaufdatum || undefined,
                einkaufspreis: formData.einkaufspreis ? parsePrice(formData.einkaufspreis.trim()) : undefined,
            };

            await onSubmit(payload);
            resetForm();
            resetDialogState();
            onDismiss();
        } catch (submitError) {
            console.error("Fehler beim Speichern:", submitError);
            setError("Fehler beim Speichern des Items");
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modalContainer}>
                <ScrollView>
                    <Title style={styles.title}>Neuen Artikel hinzufuegen</Title>
                    <View style={styles.form}>
                        <FormFields
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                            loading={loading}
                            error={error}
                            setShowStatusDialog={setShowStatusDialog}
                            setShowBrandDialog={setShowBrandDialog}
                            setShowModelDialog={setShowModelDialog}
                            setShowStandortDialog={setShowStandortDialog}
                            setShowBereichDialog={setShowBereichDialog}
                            setShowKategorieDialog={setShowKategorieDialog}
                            setShowVerantwortlicherDialog={setShowVerantwortlicherDialog}
                            setShowKaufdatumPicker={setShowKaufdatumPicker}
                        />
                        <View style={styles.buttonContainer}>
                            <Button mode="outlined" onPress={handleDismiss} style={styles.button}>
                                Abbrechen
                            </Button>
                            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                                Speichern
                            </Button>
                        </View>
                    </View>
                </ScrollView>

                <SelectionDialog
                    visible={showStatusDialog}
                    onDismiss={() => setShowStatusDialog(false)}
                    title="Status auswaehlen"
                    searchQuery={statusSearchQuery}
                    onSearchChange={setStatusSearchQuery}
                    items={states}
                    onSelect={(statusName) => {
                        handleChange("status", statusName);
                        setShowStatusDialog(false);
                        setStatusSearchQuery("");
                    }}
                    onAddNew={async () => {
                        console.log("Neue Status koennen nur vom Administrator hinzugefuegt werden");
                    }}
                    isNewItem={false}
                />

                <SelectionDialog
                    visible={showBrandDialog}
                    onDismiss={() => setShowBrandDialog(false)}
                    title="Hersteller auswaehlen"
                    searchQuery={brandSearchQuery}
                    onSearchChange={(text) => {
                        setBrandSearchQuery(text);
                        setIsNewBrand(!existingBrands.some(
                            (brand) => normalize(brand.name) === normalize(text),
                        ));
                    }}
                    items={existingBrands}
                    onSelect={handleBrandSelect}
                    onAddNew={handleAddNewBrand}
                    isNewItem={isNewBrand}
                />

                <SelectionDialog
                    visible={showModelDialog}
                    onDismiss={() => setShowModelDialog(false)}
                    title="Modell auswaehlen"
                    searchQuery={modelSearchQuery}
                    onSearchChange={(text) => {
                        setModelSearchQuery(text);
                        setIsNewModel(false);
                    }}
                    items={filteredModels}
                    onSelect={handleModelSelect}
                    onAddNew={async () => Promise.resolve()}
                    isNewItem={isNewModel}
                />

                <SelectionDialog
                    visible={showStandortDialog}
                    onDismiss={() => setShowStandortDialog(false)}
                    title="Standort auswaehlen"
                    searchQuery={standortSearchQuery}
                    onSearchChange={setStandortSearchQuery}
                    items={standorte}
                    onSelect={(name) => {
                        handleChange("standort", name);
                        setShowStandortDialog(false);
                        setStandortSearchQuery("");
                    }}
                    onAddNew={async () => Promise.resolve()}
                    isNewItem={false}
                />

                <SelectionDialog
                    visible={showBereichDialog}
                    onDismiss={() => setShowBereichDialog(false)}
                    title="Bereich auswaehlen"
                    searchQuery={bereichSearchQuery}
                    onSearchChange={setBereichSearchQuery}
                    items={bereiche}
                    onSelect={(name) => {
                        handleDependentChange("bereich", name);
                        setShowBereichDialog(false);
                        setBereichSearchQuery("");
                        setKategorieSearchQuery("");
                    }}
                    onAddNew={async () => Promise.resolve()}
                    isNewItem={false}
                />

                <SelectionDialog
                    visible={showKategorieDialog}
                    onDismiss={() => setShowKategorieDialog(false)}
                    title="Kategorie auswaehlen"
                    searchQuery={kategorieSearchQuery}
                    onSearchChange={setKategorieSearchQuery}
                    items={filteredKategorien}
                    onSelect={(name) => {
                        handleChange("kategorie", name);
                        setShowKategorieDialog(false);
                        setKategorieSearchQuery("");
                    }}
                    onAddNew={async () => Promise.resolve()}
                    isNewItem={false}
                />

                <SelectionDialog
                    visible={showVerantwortlicherDialog}
                    onDismiss={() => setShowVerantwortlicherDialog(false)}
                    title="Verantwortlichen auswaehlen"
                    searchQuery={verantwortlicherSearchQuery}
                    onSearchChange={setVerantwortlicherSearchQuery}
                    items={personItems}
                    onSelect={(name) => {
                        handleChange("verantwortlicher", name);
                        setShowVerantwortlicherDialog(false);
                        setVerantwortlicherSearchQuery("");
                    }}
                    onAddNew={async () => Promise.resolve()}
                    isNewItem={false}
                />

                {Platform.OS !== "web" && (
                    <DateTimePickerModal
                        isVisible={showKaufdatumPicker}
                        mode="date"
                        date={formData.kaufdatum ? parseDbDate(formData.kaufdatum) : new Date()}
                        maximumDate={today}
                        onConfirm={handleKaufdatumConfirm}
                        onCancel={() => setShowKaufdatumPicker(false)}
                    />
                )}
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: "white",
        margin: 20,
        padding: 20,
        borderRadius: 10,
        maxHeight: "90%",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
    },
    form: {
        gap: 10,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
    },
});

export default AddPage;
