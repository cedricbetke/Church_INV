import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Modal, Portal, Button, Title } from "react-native-paper";
import { FormFields } from "./FormFields";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import SelectionDialog from "./SelectionDialog";
import { FormData } from "@/src/features/inventory/types/FormData";

interface AddPageProps {
    visible: boolean;
    onDismiss: () => void;
    existingBrands: Hersteller[];
    existingModels: Modell[];
    onAddBrand: (brandName: string) => Promise<void>;
    onSubmit: (itemData: FormData) => Promise<void>;
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
    const { states, fetchMaxGeraeteId } = useInventory();
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showBrandDialog, setShowBrandDialog] = useState(false);
    const [showModelDialog, setShowModelDialog] = useState(false);
    const [statusSearchQuery, setStatusSearchQuery] = useState("");
    const [brandSearchQuery, setBrandSearchQuery] = useState("");
    const [modelSearchQuery, setModelSearchQuery] = useState("");
    const [isNewBrand, setIsNewBrand] = useState(false);
    const [isNewModel, setIsNewModel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingNewBrand, setPendingNewBrand] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});

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

    const handleBrandSelect = (brandName: string) => {
        handleChange("hersteller", brandName);
        setShowBrandDialog(false);
        setBrandSearchQuery("");
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

    const validateForm = () => {
        const nextErrors: Record<string, string> = {};

        if (!formData.invNr) nextErrors.invNr = "Inventarnummer ist erforderlich";
        if (!formData.modell) nextErrors.modell = "Modell ist erforderlich";
        if (!formData.status) nextErrors.status = "Status ist erforderlich";
        if (!formData.hersteller) nextErrors.hersteller = "Hersteller ist erforderlich";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            if (pendingNewBrand) {
                await onAddBrand(pendingNewBrand);
            }

            await onSubmit(formData);
            resetForm();
            onDismiss();
        } catch (submitError) {
            console.error("Fehler beim Speichern:", submitError);
            setError("Fehler beim Speichern des Items");
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
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
                        />
                        <View style={styles.buttonContainer}>
                            <Button mode="outlined" onPress={onDismiss} style={styles.button}>
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
                            (brand) => brand.name.toLowerCase() === text.toLowerCase(),
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
                        setIsNewModel(true);
                    }}
                    items={existingModels}
                    onSelect={handleModelSelect}
                    onAddNew={async () => {
                        handleModelSelect(modelSearchQuery);
                    }}
                    isNewItem={isNewModel}
                />
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
