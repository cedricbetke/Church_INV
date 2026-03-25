import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, HelperText, Modal, Text, TextInput } from "react-native-paper";
import SelectionDialog from "@/src/features/inventory/components/SelectionDialog";

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
    const [brandName, setBrandName] = useState("");
    const [objectTypeName, setObjectTypeName] = useState("");
    const [modelName, setModelName] = useState("");
    const [selectedBrandName, setSelectedBrandName] = useState("");
    const [selectedObjectTypeName, setSelectedObjectTypeName] = useState("");
    const [showBrandDialog, setShowBrandDialog] = useState(false);
    const [showObjectTypeDialog, setShowObjectTypeDialog] = useState(false);
    const [brandSearchQuery, setBrandSearchQuery] = useState("");
    const [objectTypeSearchQuery, setObjectTypeSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

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

        if (brands.some((entry) => normalize(entry.name) === normalize(nextName))) {
            setError("Dieser Hersteller existiert bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            const createdBrand = await addBrand(nextName);
            setBrandName("");
            setSelectedBrandName(createdBrand.name);
        } catch (createError) {
            console.error("Fehler beim Anlegen des Herstellers:", createError);
            setError("Hersteller konnte nicht angelegt werden.");
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

        if (objekttypen.some((entry) => normalize(entry.name) === normalize(nextName))) {
            setError("Dieser Objekttyp existiert bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            const createdObjectType = await addObjectType(nextName);
            setObjectTypeName("");
            setSelectedObjectTypeName(createdObjectType.name);
        } catch (createError) {
            console.error("Fehler beim Anlegen des Objekttyps:", createError);
            setError("Objekttyp konnte nicht angelegt werden.");
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
            setError("Bitte zuerst einen Hersteller fuer das Modell auswaehlen.");
            return;
        }

        if (!selectedObjectType) {
            setError("Bitte zuerst einen Objekttyp fuer das Modell auswaehlen.");
            return;
        }

        if (
            models.some(
                (entry) =>
                    normalize(entry.name) === normalize(nextName) &&
                    entry.hersteller_id === selectedBrand.id &&
                    entry.objekttyp_id === selectedObjectType.id,
            )
        ) {
            setError("Dieses Modell existiert fuer den gewaehlten Hersteller und Objekttyp bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            await addModel(nextName, selectedBrand.id, selectedObjectType.id);
            setModelName("");
        } catch (createError) {
            console.error("Fehler beim Anlegen des Modells:", createError);
            setError("Modell konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modal}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text variant="titleLarge">Stammdaten</Text>
                    <Text variant="bodyMedium" style={styles.subtleText}>
                        Erste Admin-Version zum Pflegen von Herstellern, Objekttypen und Modellen.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text variant="titleMedium">Hersteller</Text>
                    <View style={styles.formRow}>
                        <TextInput
                            mode="outlined"
                            label="Neuer Hersteller"
                            value={brandName}
                            onChangeText={setBrandName}
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={handleCreateBrand} disabled={isSaving}>
                            Anlegen
                        </Button>
                    </View>
                    <View style={styles.list}>
                        {sortedBrands.map((brand) => (
                            <Text key={brand.id} variant="bodyMedium">
                                {brand.name}
                            </Text>
                        ))}
                    </View>
                </View>

                <Divider />

                <View style={styles.section}>
                    <Text variant="titleMedium">Objekttypen</Text>
                    <View style={styles.formRow}>
                        <TextInput
                            mode="outlined"
                            label="Neuer Objekttyp"
                            value={objectTypeName}
                            onChangeText={setObjectTypeName}
                            style={styles.input}
                        />
                        <Button mode="contained" onPress={handleCreateObjectType} disabled={isSaving}>
                            Anlegen
                        </Button>
                    </View>
                    <View style={styles.list}>
                        {sortedObjectTypes.map((objectType) => (
                            <Text key={objectType.id} variant="bodyMedium">
                                {objectType.name}
                            </Text>
                        ))}
                    </View>
                </View>

                <Divider />

                <View style={styles.section}>
                    <Text variant="titleMedium">Modelle</Text>
                    <View style={styles.formColumn}>
                        <TextInput
                            mode="outlined"
                            label="Modellname"
                            value={modelName}
                            onChangeText={setModelName}
                        />
                        <TextInput
                            mode="outlined"
                            label="Hersteller"
                            value={selectedBrandName}
                            onFocus={() => setShowBrandDialog(true)}
                            onPressIn={() => setShowBrandDialog(true)}
                            showSoftInputOnFocus={false}
                            right={<TextInput.Icon icon="chevron-down" />}
                        />
                        <TextInput
                            mode="outlined"
                            label="Objekttyp"
                            value={selectedObjectTypeName}
                            onFocus={() => setShowObjectTypeDialog(true)}
                            onPressIn={() => setShowObjectTypeDialog(true)}
                            showSoftInputOnFocus={false}
                            right={<TextInput.Icon icon="chevron-down" />}
                        />
                        <Button mode="contained" onPress={handleCreateModel} disabled={isSaving}>
                            Modell anlegen
                        </Button>
                    </View>
                    <Text variant="bodySmall" style={styles.subtleText}>
                        Hersteller und Objekttyp werden jetzt ueber die vorhandenen Stammdaten ausgewaehlt.
                    </Text>
                    <View style={styles.list}>
                        {modelRows.map((model) => (
                            <Text key={model.id} variant="bodyMedium">
                                {model.label}
                            </Text>
                        ))}
                    </View>
                </View>

                {error && <HelperText type="error">{error}</HelperText>}

                <View style={styles.footer}>
                    <Button mode="outlined" onPress={handleDismiss}>
                        Schliessen
                    </Button>
                </View>
            </ScrollView>

            <SelectionDialog
                visible={showBrandDialog}
                onDismiss={() => setShowBrandDialog(false)}
                title="Hersteller auswaehlen"
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
                title="Objekttyp auswaehlen"
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
    list: {
        gap: 6,
        paddingVertical: 4,
    },
    subtleText: {
        color: "#5f6368",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 4,
    },
});

export default MasterdataAdminModal;
