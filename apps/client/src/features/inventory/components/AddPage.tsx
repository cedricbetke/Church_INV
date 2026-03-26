import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, Image } from "react-native";
import { Modal, Portal, Button, Title, Text } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { FormFields } from "./FormFields";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import SelectionDialog from "./SelectionDialog";
import { FormData } from "@/src/features/inventory/types/FormData";
import { CreateGeraetPayload } from "@/src/features/inventory/types/CreateGeraetPayload";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import dokumenteService from "@/src/features/masterdata/services/dokumenteService";
import apiClient from "@/src/shared/api/apiClient";
import { pickImageAsDataUrl } from "@/src/shared/utils/ImagePickerUtil";
import { pickDocumentAsDataUrl } from "@/src/shared/utils/documentPicker";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";
import {
    buildPersonItems,
    buildMasterdataResolutionError,
    EditableAttachment,
    emptyFormData,
    findByName,
    formatDateForDb,
    getErrorMessage,
    getFilteredKategorien,
    getFilteredModels,
    mapEditingItemToFormData,
    normalize,
    parseDbDate,
    parsePrice,
    PendingModel,
    today,
    toStoredAssetPath,
    validateFormData,
} from "./addPage.helpers";

interface AddPageProps {
    visible: boolean;
    onDismiss: () => void;
    existingBrands: Hersteller[];
    existingModels: Modell[];
    onAddBrand: (brandName: string) => Promise<Hersteller>;
    onSubmit: (itemData: CreateGeraetPayload) => Promise<void>;
    editingItem?: InventoryItem | null;
}

const AddPage: React.FC<AddPageProps> = ({
    visible,
    onDismiss,
    existingModels,
    existingBrands,
    onAddBrand,
    onSubmit,
    editingItem = null,
}) => {
    const { isDarkMode } = useAppThemeMode();
    const { states, fetchMaxGeraeteId, fetchItems, addObjectType, addModel, objekttypen, bereiche, standorte, kategorien, personen } = useInventory();
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showObjekttypDialog, setShowObjekttypDialog] = useState(false);
    const [showBrandDialog, setShowBrandDialog] = useState(false);
    const [showModelDialog, setShowModelDialog] = useState(false);
    const [showStandortDialog, setShowStandortDialog] = useState(false);
    const [showBereichDialog, setShowBereichDialog] = useState(false);
    const [showKategorieDialog, setShowKategorieDialog] = useState(false);
    const [showVerantwortlicherDialog, setShowVerantwortlicherDialog] = useState(false);
    const [showKaufdatumPicker, setShowKaufdatumPicker] = useState(false);
    const [statusSearchQuery, setStatusSearchQuery] = useState("");
    const [objekttypSearchQuery, setObjekttypSearchQuery] = useState("");
    const [brandSearchQuery, setBrandSearchQuery] = useState("");
    const [modelSearchQuery, setModelSearchQuery] = useState("");
    const [standortSearchQuery, setStandortSearchQuery] = useState("");
    const [bereichSearchQuery, setBereichSearchQuery] = useState("");
    const [kategorieSearchQuery, setKategorieSearchQuery] = useState("");
    const [verantwortlicherSearchQuery, setVerantwortlicherSearchQuery] = useState("");
    const [isNewBrand, setIsNewBrand] = useState(false);
    const [isNewObjekttyp, setIsNewObjekttyp] = useState(false);
    const [isNewModel, setIsNewModel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingNewBrand, setPendingNewBrand] = useState<string | null>(null);
    const [pendingNewObjekttyp, setPendingNewObjekttyp] = useState<string | null>(null);
    const [pendingModel, setPendingModel] = useState<PendingModel | null>(null);
    const [formData, setFormData] = useState<FormData>(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedPhotoDataUrl, setSelectedPhotoDataUrl] = useState<string | null>(null);
    const [uploadedPhotoPath, setUploadedPhotoPath] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const isEditMode = editingItem !== null;

    const filteredModels = getFilteredModels({
        existingModels,
        existingBrands,
        objekttypen,
        pendingModel,
        formData,
    });

    const filteredKategorien = getFilteredKategorien(formData, bereiche, kategorien);

    const resetDialogState = () => {
        setShowStatusDialog(false);
        setShowObjekttypDialog(false);
        setShowBrandDialog(false);
        setShowModelDialog(false);
        setShowStandortDialog(false);
        setShowBereichDialog(false);
        setShowKategorieDialog(false);
        setShowVerantwortlicherDialog(false);
        setShowKaufdatumPicker(false);
        setStatusSearchQuery("");
        setObjekttypSearchQuery("");
        setBrandSearchQuery("");
        setModelSearchQuery("");
        setStandortSearchQuery("");
        setBereichSearchQuery("");
        setKategorieSearchQuery("");
        setVerantwortlicherSearchQuery("");
        setIsNewBrand(false);
        setIsNewObjekttyp(false);
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

        if (isEditMode && editingItem) {
            setLoading(false);
            setFormData(mapEditingItemToFormData(editingItem, existingModels, existingBrands));
            setErrors({});
            setError(null);
            setPendingNewBrand(null);
            setPendingNewObjekttyp(null);
            setPendingModel(null);
            setSelectedPhotoDataUrl(editingItem.geraeteFoto ?? null);
            setUploadedPhotoPath(toStoredAssetPath(editingItem.geraeteFoto));
            setAttachments(editingItem.attachments.map((attachment) => ({ ...attachment })));
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
    }, [visible, isEditMode, editingItem, existingModels, existingBrands, fetchMaxGeraeteId]);

    const resetForm = () => {
        setFormData(emptyFormData);
        setErrors({});
        setError(null);
        setPendingNewBrand(null);
        setPendingNewObjekttyp(null);
        setPendingModel(null);
        setSelectedPhotoDataUrl(null);
        setUploadedPhotoPath(null);
        setAttachments([]);
    };

    const handleChange = (name: string, value: string) => {
        if (error) {
            setError(null);
        }

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
        if (error) {
            setError(null);
        }

        if (name === "hersteller") {
            setFormData((prev) => ({
                ...prev,
                hersteller: value,
                modell: "",
            }));
            setPendingModel((current) => (
                current && normalize(current.herstellerName) !== normalize(value)
                    ? null
                    : current
            ));
            setErrors((prev) => ({
                ...prev,
                hersteller: "",
                modell: "",
            }));
            return;
        }

        if (name === "objekttyp") {
            setFormData((prev) => ({
                ...prev,
                objekttyp: value,
                modell: "",
            }));
            setPendingModel((current) => (
                current && normalize(current.objekttypName) !== normalize(value)
                    ? null
                    : current
            ));
            setErrors((prev) => ({
                ...prev,
                objekttyp: "",
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

        const newBrandName = brandSearchQuery.trim();
        setPendingNewBrand(newBrandName);
        handleBrandSelect(newBrandName);
        setIsNewBrand(false);
    };

    const handleModelSelect = (modelName: string) => {
        const selectedPendingModel =
            pendingModel &&
            normalize(pendingModel.name) === normalize(modelName) &&
            normalize(pendingModel.herstellerName) === normalize(formData.hersteller)
                ? pendingModel
                : null;

        if (selectedPendingModel) {
            handleChange("objekttyp", selectedPendingModel.objekttypName);
            handleChange("modell", modelName);
            setShowModelDialog(false);
            setModelSearchQuery("");
            return;
        }

        const selectedModel = existingModels.find((model) => normalize(model.name) === normalize(modelName));
        const selectedObjekttyp = selectedModel
            ? objekttypen.find((objekttyp) => objekttyp.id === selectedModel.objekttyp_id)
            : null;

        if (selectedObjekttyp) {
            handleChange("objekttyp", selectedObjekttyp.name);
        }
        handleChange("modell", modelName);
        setShowModelDialog(false);
        setModelSearchQuery("");
    };

    const handleObjekttypSelect = (objekttypName: string) => {
        handleDependentChange("objekttyp", objekttypName);
        setShowObjekttypDialog(false);
        setObjekttypSearchQuery("");
        setModelSearchQuery("");
    };

    const handleAddNewObjekttyp = async () => {
        if (!objekttypSearchQuery.trim()) {
            return;
        }

        const newObjekttypName = objekttypSearchQuery.trim();
        setPendingNewObjekttyp(newObjekttypName);
        handleObjekttypSelect(newObjekttypName);
        setIsNewObjekttyp(false);
    };

    const handleAddNewModel = async () => {
        const modelName = modelSearchQuery.trim();
        if (!modelName) {
            return;
        }

        if (!formData.hersteller.trim()) {
            setError("Bitte zuerst einen Hersteller auswählen, bevor ein Modell angelegt wird.");
            return;
        }

        if (!formData.objekttyp.trim()) {
            setError("Bitte zuerst einen Objekttyp auswählen, bevor ein Modell angelegt wird.");
            return;
        }

        setPendingModel({
            id: -1,
            name: modelName,
            herstellerName: formData.hersteller.trim(),
            objekttypName: formData.objekttyp.trim(),
        });
        handleModelSelect(modelName);
        setIsNewModel(false);
        setError(null);
    };

    const handleKaufdatumConfirm = (date: Date) => {
        handleChange("kaufdatum", formatDateForDb(date));
        setShowKaufdatumPicker(false);
    };

    const handlePhotoPick = async () => {
        try {
            const pickedImage = await pickImageAsDataUrl();
            if (!pickedImage) {
                return;
            }

            setSelectedPhotoDataUrl(pickedImage.dataUrl);
            setError(null);

            const uploadResponse = await apiClient.create<{ path: string }>("geraet/upload-photo", {
                fileName: pickedImage.fileName,
                dataUrl: pickedImage.dataUrl,
            });

            setUploadedPhotoPath(uploadResponse.path);
        } catch (photoError) {
            console.error("Fehler beim Hochladen des Gerätefotos:", photoError);
            setError(getErrorMessage(photoError));
        }
    };

    const visibleAttachments = attachments.filter((attachment) => !attachment.markedForDeletion);

    const handleDocumentPick = async () => {
        try {
            const pickedDocument = await pickDocumentAsDataUrl();
            if (!pickedDocument) {
                return;
            }

            setAttachments((current) => [
                {
                    id: `pending-${Date.now()}`,
                    name: pickedDocument.fileName,
                    type: pickedDocument.mimeType,
                    file: pickedDocument.fileName,
                    uploadedAt: new Date(),
                    isPending: true,
                    dataUrl: pickedDocument.dataUrl,
                },
                ...current,
            ]);
            setError(null);
        } catch (documentError) {
            console.error("Fehler beim Auswählen des Dokuments:", documentError);
            setError(getErrorMessage(documentError));
        }
    };

    const handleAttachmentRemove = (attachmentId: string) => {
        setAttachments((current) =>
            current
                .map((attachment) => (
                    attachment.id === attachmentId && !attachment.isPending
                        ? { ...attachment, markedForDeletion: true }
                        : attachment
                ))
                .filter((attachment) => !(attachment.id === attachmentId && attachment.isPending)),
        );
    };

    const persistAttachmentChanges = async (invNr: number) => {
        const attachmentsToDelete = attachments.filter((attachment) => attachment.markedForDeletion && !attachment.isPending);
        const attachmentsToCreate = attachments.filter((attachment) => attachment.isPending && attachment.dataUrl);

        for (const attachment of attachmentsToDelete) {
            await dokumenteService.delete(Number(attachment.id));
        }

        for (const attachment of attachmentsToCreate) {
            const uploadResponse = await dokumenteService.upload(attachment.name, attachment.dataUrl!);
            await dokumenteService.create({
                name: attachment.name,
                url: uploadResponse.path,
                geraete_id: invNr,
            });
        }
    };

    const validateForm = () => {
        const nextErrors = validateFormData(formData);
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const personItems = buildPersonItems(personen);

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setError(null);
            // New master data stays local until submit. Resolve and persist it here in dependency order:
            // brand -> object type -> model -> device.
            let resolvedBrand = existingBrands.find(
                (brand) => normalize(brand.name) === normalize(formData.hersteller),
            );
            let resolvedObjekttyp = objekttypen.find(
                (objekttyp) => normalize(objekttyp.name) === normalize(formData.objekttyp),
            );

            if (!resolvedBrand && pendingNewBrand && normalize(pendingNewBrand) === normalize(formData.hersteller)) {
                resolvedBrand = await onAddBrand(pendingNewBrand);
            }

            if (!resolvedObjekttyp && pendingNewObjekttyp && normalize(pendingNewObjekttyp) === normalize(formData.objekttyp)) {
                resolvedObjekttyp = await addObjectType(pendingNewObjekttyp);
            }

            let selectedModel = findByName(existingModels, formData.modell);
            if (
                !selectedModel &&
                pendingModel &&
                normalize(pendingModel.name) === normalize(formData.modell) &&
                normalize(pendingModel.herstellerName) === normalize(formData.hersteller)
            ) {
                if (!resolvedBrand?.id) {
                    setError("Der Hersteller für das neue Modell konnte nicht aufgelöst werden.");
                    return;
                }
                if (!resolvedObjekttyp?.id) {
                    setError("Der Objekttyp für das neue Modell konnte nicht aufgelöst werden.");
                    return;
                }

                selectedModel = await addModel(pendingModel.name, resolvedBrand.id, resolvedObjekttyp.id);
            }

            const selectedStatus = findByName(states, formData.status);
            const selectedStandort = formData.standort
                ? findByName(standorte, formData.standort)
                : undefined;
            const selectedBereich = findByName(bereiche, formData.bereich);
            const selectedKategorie = formData.kategorie
                ? findByName(kategorien, formData.kategorie)
                : undefined;
            const selectedVerantwortlicher = formData.verantwortlicher
                ? findByName(personItems, formData.verantwortlicher)
                : undefined;

            if (
                !selectedModel ||
                !selectedStatus ||
                !selectedBereich ||
                (formData.standort && !selectedStandort) ||
                (formData.kategorie && !selectedKategorie) ||
                (formData.verantwortlicher && !selectedVerantwortlicher)
            ) {
                const resolutionError = buildMasterdataResolutionError({
                    selectedModel,
                    selectedStatus,
                    selectedBereich,
                    selectedStandort,
                    selectedKategorie,
                    selectedVerantwortlicher,
                    formData,
                });
                setErrors((prev) => ({
                    ...prev,
                    [resolutionError.field]: resolutionError.message,
                }));
                return;
            }

            const payload: CreateGeraetPayload = {
                inv_nr: Number(formData.invNr),
                modell_id: selectedModel.id,
                status_id: selectedStatus.id,
                bereich_id: selectedBereich.id,
                standort_id: selectedStandort?.id,
                kategorie_id: selectedKategorie?.id,
                verantwortlicher_id: selectedVerantwortlicher?.id,
                serien_nr: formData.serien_nr || undefined,
                kaufdatum: formData.kaufdatum || undefined,
                einkaufspreis: formData.einkaufspreis ? parsePrice(formData.einkaufspreis.trim()) : undefined,
                geraetefoto_url: uploadedPhotoPath ?? undefined,
            };

            await onSubmit(payload);
            // Attachments are persisted after the device exists so we always have a stable inventory number.
            await persistAttachmentChanges(payload.inv_nr);
            await fetchItems();
            resetForm();
            resetDialogState();
            onDismiss();
        } catch (submitError) {
            console.error("Fehler beim Speichern:", submitError);
            setError(getErrorMessage(submitError));
        }
    };

    return (
        <Portal>
            <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={[styles.modalContainer, isDarkMode && styles.modalContainerDark]}>
                <ScrollView>
                    <Title style={styles.title}>
                        {isEditMode ? `Gerät ${formData.invNr} bearbeiten` : "Neuen Artikel hinzufügen"}
                    </Title>
                    <View style={styles.form}>
                        <FormFields
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                            loading={loading}
                            error={error}
                            invNrDisabled={isEditMode}
                            setShowStatusDialog={setShowStatusDialog}
                            setShowObjekttypDialog={setShowObjekttypDialog}
                            setShowBrandDialog={setShowBrandDialog}
                            setShowModelDialog={setShowModelDialog}
                            setShowStandortDialog={setShowStandortDialog}
                            setShowBereichDialog={setShowBereichDialog}
                            setShowKategorieDialog={setShowKategorieDialog}
                            setShowVerantwortlicherDialog={setShowVerantwortlicherDialog}
                            setShowKaufdatumPicker={setShowKaufdatumPicker}
                        />
                        <View style={[styles.photoCard, isDarkMode && styles.photoCardDark]}>
                            <View style={styles.photoHeader}>
                                <Text variant="titleMedium">Gerätefoto</Text>
                                <Text variant="bodySmall" style={[styles.photoHint, isDarkMode && styles.photoHintDark]}>
                                    Optional
                                </Text>
                            </View>
                            <View style={styles.photoSection}>
                                {selectedPhotoDataUrl ? (
                                    <Image source={{ uri: selectedPhotoDataUrl }} style={styles.photoPreview} />
                                ) : (
                                    <View style={[styles.photoPlaceholder, isDarkMode && styles.photoPlaceholderDark]}>
                                        <Text style={styles.photoPlaceholderText}>Noch kein Foto ausgewählt</Text>
                                    </View>
                                )}
                                <View style={styles.photoActions}>
                                    <Button mode="outlined" onPress={handlePhotoPick}>
                                        {selectedPhotoDataUrl ? "Foto ändern" : "Foto auswählen"}
                                    </Button>
                                </View>
                            </View>
                        </View>
                        <View style={[styles.photoCard, isDarkMode && styles.photoCardDark]}>
                            <View style={styles.photoHeader}>
                                <Text variant="titleMedium">Dokumente</Text>
                                <Text variant="bodySmall" style={styles.photoHint}>
                                    {isEditMode ? "Im Bearbeitungsflow" : "Wird mit dem Speichern angelegt"}
                                </Text>
                            </View>
                            <View style={styles.documentSection}>
                                {visibleAttachments.length === 0 ? (
                                    <View style={[styles.documentPlaceholder, isDarkMode && styles.photoPlaceholderDark]}>
                                        <Text style={styles.photoPlaceholderText}>Noch keine Dokumente ausgewählt</Text>
                                    </View>
                                ) : (
                                    visibleAttachments.map((attachment) => (
                                        <View key={attachment.id} style={[styles.documentRow, isDarkMode && styles.documentRowDark]}>
                                            <View style={styles.documentMeta}>
                                                <Text variant="bodyMedium">{attachment.name}</Text>
                                                <Text variant="bodySmall" style={[styles.photoHint, isDarkMode && styles.photoHintDark]}>
                                                    {attachment.isPending ? "Wird beim Speichern hochgeladen" : "Bereits hinterlegt"}
                                                </Text>
                                            </View>
                                            <Button mode="text" textColor="#b3261e" onPress={() => handleAttachmentRemove(attachment.id)}>
                                                Entfernen
                                            </Button>
                                        </View>
                                    ))
                                )}
                                <View style={styles.photoActions}>
                                    <Button mode="outlined" onPress={handleDocumentPick}>
                                        Dokument auswählen
                                    </Button>
                                </View>
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button mode="outlined" onPress={handleDismiss} style={styles.button}>
                                Abbrechen
                            </Button>
                            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                                {isEditMode ? "Änderungen speichern" : "Speichern"}
                            </Button>
                        </View>
                    </View>
                </ScrollView>

                <SelectionDialog
                    visible={showStatusDialog}
                    onDismiss={() => setShowStatusDialog(false)}
                    title="Status auswählen"
                    searchQuery={statusSearchQuery}
                    onSearchChange={setStatusSearchQuery}
                    items={states}
                    onSelect={(statusName) => {
                        handleChange("status", statusName);
                        setShowStatusDialog(false);
                        setStatusSearchQuery("");
                    }}
                    onAddNew={async () => {
                        console.log("Neue Status können nur vom Administrator hinzugefügt werden");
                    }}
                    isNewItem={false}
                />

                <SelectionDialog
                    visible={showObjekttypDialog}
                    onDismiss={() => setShowObjekttypDialog(false)}
                    title="Objekttyp auswählen"
                    searchQuery={objekttypSearchQuery}
                    onSearchChange={(text) => {
                        setObjekttypSearchQuery(text);
                        setIsNewObjekttyp(!objekttypen.some(
                            (objekttyp) => normalize(objekttyp.name) === normalize(text),
                        ));
                    }}
                    items={objekttypen}
                    onSelect={handleObjekttypSelect}
                    onAddNew={handleAddNewObjekttyp}
                    isNewItem={isNewObjekttyp}
                />

                <SelectionDialog
                    visible={showBrandDialog}
                    onDismiss={() => setShowBrandDialog(false)}
                    title="Hersteller auswählen"
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
                    title="Modell auswählen"
                    searchQuery={modelSearchQuery}
                    onSearchChange={(text) => {
                        setModelSearchQuery(text);
                        setIsNewModel(!filteredModels.some(
                            (model) => normalize(model.name) === normalize(text),
                        ));
                    }}
                    items={filteredModels}
                    onSelect={handleModelSelect}
                    onAddNew={handleAddNewModel}
                    isNewItem={isNewModel}
                />

                <SelectionDialog
                    visible={showStandortDialog}
                    onDismiss={() => setShowStandortDialog(false)}
                    title="Standort auswählen"
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
                    title="Bereich auswählen"
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
                    title="Kategorie auswählen"
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
                    title="Verantwortlichen auswählen"
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
        alignSelf: "center",
        width: Platform.OS === "web" ? "94%" : undefined,
        maxWidth: Platform.OS === "web" ? 980 : undefined,
    },
    modalContainerDark: {
        backgroundColor: "#151a22",
        borderWidth: 1,
        borderColor: "#263140",
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: "center",
    },
    form: {
        gap: 10,
    },
    photoCard: {
        marginTop: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        backgroundColor: "#fafafa",
        gap: 12,
    },
    photoCardDark: {
        backgroundColor: "#0f141b",
        borderColor: "#263140",
    },
    photoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    photoHint: {
        color: "#666",
    },
    photoHintDark: {
        color: "#9aa4b2",
    },
    photoSection: {
        gap: 10,
        alignItems: "center",
    },
    photoPreview: {
        width: 140,
        height: 140,
        borderRadius: 8,
        resizeMode: "cover",
    },
    photoPlaceholder: {
        width: 140,
        height: 140,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d0d0d0",
        borderStyle: "dashed",
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    photoPlaceholderText: {
        textAlign: "center",
        color: "#666",
    },
    photoPlaceholderDark: {
        borderColor: "#334155",
        backgroundColor: "#11161d",
    },
    photoPlaceholderTextDark: {
        color: "#9aa4b2",
    },
    photoActions: {
        width: "100%",
        alignItems: "center",
    },
    documentSection: {
        gap: 10,
    },
    documentPlaceholder: {
        minHeight: 90,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#d0d0d0",
        borderStyle: "dashed",
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
    },
    documentRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#ececec",
    },
    documentRowDark: {
        borderBottomColor: "#263140",
    },
    documentMeta: {
        flex: 1,
        gap: 2,
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
