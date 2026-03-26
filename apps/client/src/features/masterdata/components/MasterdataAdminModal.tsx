import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, HelperText, Modal, Text, TextInput } from "react-native-paper";
import SelectionDialog from "@/src/features/inventory/components/SelectionDialog";
import herstellerService from "@/src/features/masterdata/services/herstellerService";
import objekttypService from "@/src/features/masterdata/services/objekttypService";
import modellService from "@/src/features/masterdata/services/modellService";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

interface MasterdataAdminModalProps {
    visible: boolean;
    onDismiss: () => void;
    brands: Hersteller[];
    objekttypen: Array<{ id: number; name: string }>;
    models: Modell[];
    addBrand: (brandName: string) => Promise<Hersteller>;
    addObjectType: (name: string) => Promise<{ id: number; name: string }>;
    addModel: (name: string, herstellerId: number, objekttypId: number) => Promise<Modell>;
}

const normalize = (value: string) => value.trim().toLowerCase();

const HoverRow = ({
    children,
    onPress,
    active = false,
    isDarkMode,
}: {
    children: React.ReactNode;
    onPress: () => void;
    active?: boolean;
    isDarkMode: boolean;
}) => (
    <Pressable onPress={onPress}>
        {({ hovered, pressed }) => (
            <View
                style={[
                    styles.rowItem,
                    isDarkMode && styles.rowItemDark,
                    (hovered || pressed) && styles.rowItemHover,
                    active && styles.rowItemActive,
                ]}
            >
                {children}
            </View>
        )}
    </Pressable>
);

const MasterdataAdminModal: React.FC<MasterdataAdminModalProps> = ({
    visible,
    onDismiss,
    brands,
    objekttypen,
    models,
    addBrand,
    addObjectType,
    addModel,
}) => {
    const { isDarkMode } = useAppThemeMode();
    const [brandName, setBrandName] = useState("");
    const [objectTypeName, setObjectTypeName] = useState("");
    const [modelName, setModelName] = useState("");
    const [selectedBrandName, setSelectedBrandName] = useState("");
    const [selectedObjectTypeName, setSelectedObjectTypeName] = useState("");
    const [showBrandDialog, setShowBrandDialog] = useState(false);
    const [showObjectTypeDialog, setShowObjectTypeDialog] = useState(false);
    const [brandSearchQuery, setBrandSearchQuery] = useState("");
    const [objectTypeSearchQuery, setObjectTypeSearchQuery] = useState("");
    const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
    const [editingObjectTypeId, setEditingObjectTypeId] = useState<number | null>(null);
    const [editingModelId, setEditingModelId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    if (!visible) {
        return null;
    }

    const sortedBrands = useMemo(
        () => [...brands].sort((left, right) => left.name.localeCompare(right.name, "de")),
        [brands],
    );
    const sortedObjectTypes = useMemo(
        () => [...objekttypen].sort((left, right) => left.name.localeCompare(right.name, "de")),
        [objekttypen],
    );
    const modelRows = useMemo(() => {
        return [...models]
            .sort((left, right) => left.name.localeCompare(right.name, "de"))
            .map((model) => {
                const brand = brands.find((entry) => entry.id === model.hersteller_id)?.name ?? "Unbekannt";
                const objectType = objekttypen.find((entry) => entry.id === model.objekttyp_id)?.name ?? "Unbekannt";
                return {
                    id: model.id,
                    label: `${model.name} · ${brand} · ${objectType}`,
                };
            });
    }, [brands, models, objekttypen]);

    const resetForm = () => {
        setBrandName("");
        setObjectTypeName("");
        setModelName("");
        setSelectedBrandName("");
        setSelectedObjectTypeName("");
        setShowBrandDialog(false);
        setShowObjectTypeDialog(false);
        setBrandSearchQuery("");
        setObjectTypeSearchQuery("");
        setEditingBrandId(null);
        setEditingObjectTypeId(null);
        setEditingModelId(null);
        setError(null);
        setIsSaving(false);
    };

    const handleDismiss = () => {
        resetForm();
        onDismiss();
    };

    const handleCreateBrand = async () => {
        const nextName = brandName.trim();
        if (!nextName) {
            setError("Bitte einen Herstellernamen eingeben.");
            return;
        }

        if (brands.some((entry) => normalize(entry.name) === normalize(nextName) && entry.id !== editingBrandId)) {
            setError("Dieser Hersteller existiert bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            const createdBrand = editingBrandId
                ? await herstellerService.update(editingBrandId, { name: nextName })
                : await addBrand(nextName);
            setBrandName("");
            setSelectedBrandName(createdBrand.name);
            setEditingBrandId(null);
        } catch (createError) {
            console.error("Fehler beim Anlegen des Herstellers:", createError);
            setError(editingBrandId ? "Hersteller konnte nicht aktualisiert werden." : "Hersteller konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateObjectType = async () => {
        const nextName = objectTypeName.trim();
        if (!nextName) {
            setError("Bitte einen Objekttyp eingeben.");
            return;
        }

        if (objekttypen.some((entry) => normalize(entry.name) === normalize(nextName) && entry.id !== editingObjectTypeId)) {
            setError("Dieser Objekttyp existiert bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            const createdObjectType = editingObjectTypeId
                ? await objekttypService.update(editingObjectTypeId, { name: nextName })
                : await addObjectType(nextName);
            setObjectTypeName("");
            setSelectedObjectTypeName(createdObjectType.name);
            setEditingObjectTypeId(null);
        } catch (createError) {
            console.error("Fehler beim Anlegen des Objekttyps:", createError);
            setError(editingObjectTypeId ? "Objekttyp konnte nicht aktualisiert werden." : "Objekttyp konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateModel = async () => {
        const nextName = modelName.trim();
        if (!nextName) {
            setError("Bitte einen Modellnamen eingeben.");
            return;
        }

        const selectedBrand = brands.find((entry) => normalize(entry.name) === normalize(selectedBrandName));
        const selectedObjectType = objekttypen.find((entry) => normalize(entry.name) === normalize(selectedObjectTypeName));

        if (!selectedBrand) {
            setError("Bitte zuerst einen Hersteller für das Modell auswählen.");
            return;
        }

        if (!selectedObjectType) {
            setError("Bitte zuerst einen Objekttyp für das Modell auswählen.");
            return;
        }

        if (
            models.some(
                (entry) =>
                    normalize(entry.name) === normalize(nextName) &&
                    entry.hersteller_id === selectedBrand.id &&
                    entry.objekttyp_id === selectedObjectType.id &&
                    entry.id !== editingModelId,
            )
        ) {
            setError("Dieses Modell existiert für den gewählten Hersteller und Objekttyp bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            await (
                editingModelId
                    ? modellService.update(editingModelId, {
                        name: nextName,
                        hersteller_id: selectedBrand.id,
                        objekttyp_id: selectedObjectType.id,
                    })
                    : addModel(nextName, selectedBrand.id, selectedObjectType.id)
            );
            setModelName("");
            setSelectedBrandName("");
            setSelectedObjectTypeName("");
            setEditingModelId(null);
        } catch (createError) {
            console.error("Fehler beim Anlegen des Modells:", createError);
            setError(editingModelId ? "Modell konnte nicht aktualisiert werden." : "Modell konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={[styles.modal, isDarkMode && styles.modalDark]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text variant="titleLarge" style={isDarkMode ? styles.titleDark : undefined}>Stammdaten</Text>
                    <Text variant="bodyMedium" style={[styles.subtleText, isDarkMode && styles.subtleTextDark]}>
                        Erste Admin-Version zum Pflegen von Herstellern, Objekttypen und Modellen.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium" style={isDarkMode ? styles.titleDark : undefined}>Hersteller</Text>
                    <View style={styles.formRow}>
                        <TextInput
                            mode="outlined"
                            label={editingBrandId ? "Hersteller bearbeiten" : "Neuer Hersteller"}
                            value={brandName}
                            onChangeText={setBrandName}
                            style={[styles.input, isDarkMode && styles.inputDark]}
                        />
                        <Button mode="contained" onPress={handleCreateBrand} disabled={isSaving}>
                            {editingBrandId ? "Speichern" : "Anlegen"}
                        </Button>
                    </View>
                    <ScrollView style={[styles.listPanel, isDarkMode && styles.listPanelDark]} contentContainerStyle={styles.list}>
                        {sortedBrands.map((brand) => (
                            <HoverRow
                                key={brand.id}
                                active={editingBrandId === brand.id}
                                onPress={() => {
                                    setBrandName(brand.name);
                                    setEditingBrandId(brand.id);
                                    setError(null);
                                }}
                                isDarkMode={isDarkMode}
                            >
                                <Text variant="bodyMedium" style={[styles.rowItemText, isDarkMode && styles.rowItemTextDark]}>
                                    {brand.name}
                                </Text>
                                <Button
                                    mode="text"
                                    onPress={() => {
                                        setBrandName(brand.name);
                                        setEditingBrandId(brand.id);
                                        setError(null);
                                    }}
                                >
                                    Bearbeiten
                                </Button>
                            </HoverRow>
                        ))}
                    </ScrollView>
                </View>

                <Divider />

                <View style={styles.section}>
                    <Text variant="titleMedium" style={isDarkMode ? styles.titleDark : undefined}>Objekttypen</Text>
                    <View style={styles.formRow}>
                        <TextInput
                            mode="outlined"
                            label={editingObjectTypeId ? "Objekttyp bearbeiten" : "Neuer Objekttyp"}
                            value={objectTypeName}
                            onChangeText={setObjectTypeName}
                            style={[styles.input, isDarkMode && styles.inputDark]}
                        />
                        <Button mode="contained" onPress={handleCreateObjectType} disabled={isSaving}>
                            {editingObjectTypeId ? "Speichern" : "Anlegen"}
                        </Button>
                    </View>
                    <ScrollView style={[styles.listPanel, isDarkMode && styles.listPanelDark]} contentContainerStyle={styles.list}>
                        {sortedObjectTypes.map((objectType) => (
                            <HoverRow
                                key={objectType.id}
                                active={editingObjectTypeId === objectType.id}
                                onPress={() => {
                                    setObjectTypeName(objectType.name);
                                    setEditingObjectTypeId(objectType.id);
                                    setError(null);
                                }}
                                isDarkMode={isDarkMode}
                            >
                                <Text variant="bodyMedium" style={[styles.rowItemText, isDarkMode && styles.rowItemTextDark]}>
                                    {objectType.name}
                                </Text>
                                <Button
                                    mode="text"
                                    onPress={() => {
                                        setObjectTypeName(objectType.name);
                                        setEditingObjectTypeId(objectType.id);
                                        setError(null);
                                    }}
                                >
                                    Bearbeiten
                                </Button>
                            </HoverRow>
                        ))}
                    </ScrollView>
                </View>

                <Divider />

                <View style={styles.section}>
                    <Text variant="titleMedium" style={isDarkMode ? styles.titleDark : undefined}>Modelle</Text>
                    <View style={styles.formColumn}>
                        <TextInput
                            mode="outlined"
                            label={editingModelId ? "Modell bearbeiten" : "Modellname"}
                            value={modelName}
                            onChangeText={setModelName}
                            style={isDarkMode ? styles.inputDark : undefined}
                        />
                        <TextInput
                            mode="outlined"
                            label="Hersteller"
                            value={selectedBrandName}
                            onFocus={() => setShowBrandDialog(true)}
                            onPressIn={() => setShowBrandDialog(true)}
                            showSoftInputOnFocus={false}
                            right={<TextInput.Icon icon="chevron-down" />}
                            style={isDarkMode ? styles.inputDark : undefined}
                        />
                        <TextInput
                            mode="outlined"
                            label="Objekttyp"
                            value={selectedObjectTypeName}
                            onFocus={() => setShowObjectTypeDialog(true)}
                            onPressIn={() => setShowObjectTypeDialog(true)}
                            showSoftInputOnFocus={false}
                            right={<TextInput.Icon icon="chevron-down" />}
                            style={isDarkMode ? styles.inputDark : undefined}
                        />
                        <Button mode="contained" onPress={handleCreateModel} disabled={isSaving}>
                            {editingModelId ? "Speichern" : "Modell anlegen"}
                        </Button>
                    </View>
                    <Text variant="bodySmall" style={[styles.subtleText, isDarkMode && styles.subtleTextDark]}>
                        Hersteller und Objekttyp werden jetzt über die vorhandenen Stammdaten ausgewählt.
                    </Text>
                    <ScrollView style={[styles.largeListPanel, isDarkMode && styles.listPanelDark]} contentContainerStyle={styles.list}>
                        {modelRows.map((model) => (
                            <HoverRow
                                key={model.id}
                                active={editingModelId === model.id}
                                onPress={() => {
                                    const currentModel = models.find((entry) => entry.id === model.id);
                                    if (!currentModel) {
                                        return;
                                    }

                                    const currentBrand = brands.find((entry) => entry.id === currentModel.hersteller_id);
                                    const currentObjectType = objekttypen.find((entry) => entry.id === currentModel.objekttyp_id);

                                    setModelName(currentModel.name);
                                    setSelectedBrandName(currentBrand?.name ?? "");
                                    setSelectedObjectTypeName(currentObjectType?.name ?? "");
                                    setEditingModelId(currentModel.id);
                                    setError(null);
                                }}
                                isDarkMode={isDarkMode}
                            >
                                <Text variant="bodyMedium" style={[styles.rowItemText, isDarkMode && styles.rowItemTextDark]}>
                                    {model.label}
                                </Text>
                                <Button
                                    mode="text"
                                    onPress={() => {
                                        const currentModel = models.find((entry) => entry.id === model.id);
                                        if (!currentModel) {
                                            return;
                                        }

                                        const currentBrand = brands.find((entry) => entry.id === currentModel.hersteller_id);
                                        const currentObjectType = objekttypen.find((entry) => entry.id === currentModel.objekttyp_id);

                                        setModelName(currentModel.name);
                                        setSelectedBrandName(currentBrand?.name ?? "");
                                        setSelectedObjectTypeName(currentObjectType?.name ?? "");
                                        setEditingModelId(currentModel.id);
                                        setError(null);
                                    }}
                                >
                                    Bearbeiten
                                </Button>
                            </HoverRow>
                        ))}
                    </ScrollView>
                </View>

                {error && <HelperText type="error">{error}</HelperText>}

                <View style={styles.footer}>
                    <Button mode="outlined" onPress={handleDismiss}>
                        Schließen
                    </Button>
                </View>
            </ScrollView>

            <SelectionDialog
                visible={showBrandDialog}
                onDismiss={() => setShowBrandDialog(false)}
                title="Hersteller auswählen"
                searchQuery={brandSearchQuery}
                onSearchChange={setBrandSearchQuery}
                items={sortedBrands}
                onSelect={(name) => {
                    setSelectedBrandName(name);
                    setShowBrandDialog(false);
                    setBrandSearchQuery("");
                    if (error) {
                        setError(null);
                    }
                }}
                onAddNew={async () => Promise.resolve()}
                isNewItem={false}
            />

            <SelectionDialog
                visible={showObjectTypeDialog}
                onDismiss={() => setShowObjectTypeDialog(false)}
                title="Objekttyp auswählen"
                searchQuery={objectTypeSearchQuery}
                onSearchChange={setObjectTypeSearchQuery}
                items={sortedObjectTypes}
                onSelect={(name) => {
                    setSelectedObjectTypeName(name);
                    setShowObjectTypeDialog(false);
                    setObjectTypeSearchQuery("");
                    if (error) {
                        setError(null);
                    }
                }}
                onAddNew={async () => Promise.resolve()}
                isNewItem={false}
            />
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        backgroundColor: "#ffffff",
        margin: 20,
        borderRadius: 12,
        maxHeight: "90%",
    },
    modalDark: {
        backgroundColor: "#151a22",
        borderWidth: 1,
        borderColor: "#263140",
    },
    content: {
        padding: 20,
        gap: 16,
    },
    header: {
        gap: 6,
    },
    section: {
        gap: 12,
    },
    titleDark: {
        color: "#f3f4f6",
    },
    formRow: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    formColumn: {
        gap: 10,
    },
    input: {
        flex: 1,
    },
    inputDark: {
        backgroundColor: "#0f141b",
    },
    list: {
        gap: 6,
        padding: 8,
    },
    listPanel: {
        maxHeight: 180,
        borderWidth: 1,
        borderColor: "#e3e7ee",
        borderRadius: 12,
        backgroundColor: "#fafbfc",
    },
    largeListPanel: {
        maxHeight: 220,
        borderWidth: 1,
        borderColor: "#e3e7ee",
        borderRadius: 12,
        backgroundColor: "#fafbfc",
    },
    listPanelDark: {
        backgroundColor: "#0f141b",
        borderColor: "#263140",
    },
    rowItem: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "transparent",
        backgroundColor: "#ffffff",
    },
    rowItemDark: {
        backgroundColor: "#161b22",
    },
    rowItemHover: {
        backgroundColor: "#f3f7ff",
        borderColor: "#c7dafc",
    },
    rowItemActive: {
        backgroundColor: "#e8f0fe",
        borderColor: "#8fb4ff",
    },
    rowItemText: {
        flex: 1,
    },
    rowItemTextDark: {
        color: "#f3f4f6",
    },
    subtleText: {
        color: "#5f6368",
    },
    subtleTextDark: {
        color: "#9aa4b2",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 4,
    },
});

export default MasterdataAdminModal;
