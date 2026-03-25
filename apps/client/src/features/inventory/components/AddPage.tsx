import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Platform, Image } from "react-native";
import { Modal, Portal, Button, Title, Text } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from "axios";
import { FormFields } from "./FormFields";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import SelectionDialog from "./SelectionDialog";
import { FormData } from "@/src/features/inventory/types/FormData";
import { CreateGeraetPayload } from "@/src/features/inventory/types/CreateGeraetPayload";
import Attachment from "@/src/features/inventory/types/Attachment";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import dokumenteService from "@/src/features/masterdata/services/dokumenteService";
import apiClient from "@/src/shared/api/apiClient";
import { pickImageAsDataUrl } from "@/src/shared/utils/ImagePickerUtil";
import { pickDocumentAsDataUrl } from "@/src/shared/utils/documentPicker";

interface NamedItem {
    id: number;
    name: string;
}

interface PendingModel {
    id: number;
    name: string;
    herstellerName: string;
}

interface EditableAttachment extends Attachment {
    isPending?: boolean;
    markedForDeletion?: boolean;
    dataUrl?: string;
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
const INTEGER_PATTERN = /^\d+$/;

const getErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return "Fehler beim Speichern des Items";
    }

    if (!error.response) {
        return "Der Server ist nicht erreichbar. Bitte Verbindung und API-URL pruefen.";
    }

    const { status, data } = error.response;
    const backendMessage =
        typeof data === "string"
            ? data
            : typeof data?.message === "string"
                ? data.message
                : typeof data?.error === "string"
                    ? data.error
                    : null;

    if (status === 400) {
        return backendMessage ?? "Die uebermittelten Daten sind ungueltig.";
    }

    if (status === 403) {
        return backendMessage ?? "Diese Aktion ist nur mit Admin-Rechten erlaubt.";
    }

    if (status === 404) {
        return backendMessage ?? "Die API-Route wurde nicht gefunden.";
    }

    if (status === 409) {
        if (backendMessage?.toLowerCase().includes("inventarnummer")) {
            return backendMessage;
        }

        return backendMessage ?? "Der Datensatz steht in Konflikt mit vorhandenen Daten.";
    }

    if (status === 503) {
        return backendMessage ?? "Die Admin-Freigabe ist auf dem Server nicht konfiguriert.";
    }

    if (status >= 500) {
        return backendMessage ?? "Serverfehler beim Speichern des Items.";
    }

    return backendMessage ?? "Fehler beim Speichern des Items";
};

interface AddPageProps {
    visible: boolean;
    onDismiss: () => void;
    existingBrands: Hersteller[];
    existingModels: Modell[];
    onAddBrand: (brandName: string) => Promise<Hersteller>;
    onSubmit: (itemData: CreateGeraetPayload) => Promise<void>;
    editingItem?: InventoryItem | null;
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
    editingItem = null,
}) => {
    const { states, fetchMaxGeraeteId, fetchItems, addModel, bereiche, standorte, kategorien, personen } = useInventory();
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
    const [pendingModel, setPendingModel] = useState<PendingModel | null>(null);
    const [formData, setFormData] = useState<FormData>(emptyFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedPhotoDataUrl, setSelectedPhotoDataUrl] = useState<string | null>(null);
    const [uploadedPhotoPath, setUploadedPhotoPath] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<EditableAttachment[]>([]);
    const isEditMode = editingItem !== null;

    const selectedBrand = existingBrands.find((brand) => normalize(brand.name) === normalize(formData.hersteller));

    const filteredModels = selectedBrand?.id
        ? [
            ...existingModels.filter((model) => model.hersteller_id === selectedBrand.id),
            ...(pendingModel && normalize(pendingModel.herstellerName) === normalize(formData.hersteller)
                ? [{ ...pendingModel, hersteller_id: selectedBrand.id, objekttyp_id: 0 } as Modell]
                : []),
        ]
        : (
            pendingModel && normalize(pendingModel.herstellerName) === normalize(formData.hersteller)
                ? [{ ...pendingModel, hersteller_id: -1, objekttyp_id: 0 } as Modell]
                : existingModels
        );

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

        if (isEditMode && editingItem) {
            const model = existingModels.find((entry) => normalize(entry.name) === normalize(editingItem.modell));
            const brand = model
                ? existingBrands.find((entry) => entry.id === model.hersteller_id)
                : existingBrands.find((entry) => normalize(entry.name) === normalize(editingItem.hersteller ?? ""));

            setLoading(false);
            setFormData({
                invNr: String(editingItem.invNr),
                modell: editingItem.modell ?? "",
                hersteller: brand?.name ?? editingItem.hersteller ?? "",
                serien_nr: editingItem.seriennummer ?? "",
                kaufdatum: editingItem.kaufdatum ? formatDateForDb(editingItem.kaufdatum) : "",
                einkaufspreis: editingItem.einkaufspreis != null ? String(editingItem.einkaufspreis).replace(".", ",") : "",
                standort: editingItem.standort ?? "",
                bereich: editingItem.bereich ?? "",
                kategorie: editingItem.kategorie ?? "",
                status: editingItem.status ?? "",
                verantwortlicher: editingItem.verantwortlicher ?? "",
            });
            setErrors({});
            setError(null);
            setPendingNewBrand(null);
            setPendingModel(null);
            setSelectedPhotoDataUrl(editingItem.geraeteFoto ?? null);
            setUploadedPhotoPath(editingItem.geraeteFoto ?? null);
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
        setPendingModel(null);
        setSelectedPhotoDataUrl(null);
        setUploadedPhotoPath(null);
        setAttachments([]);
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
        handleChange("modell", modelName);
        setShowModelDialog(false);
        setModelSearchQuery("");
    };

    const handleAddNewModel = async () => {
        const modelName = modelSearchQuery.trim();
        if (!modelName) {
            return;
        }

        if (!formData.hersteller.trim()) {
            setError("Bitte zuerst einen Hersteller auswaehlen, bevor ein Modell angelegt wird.");
            return;
        }

        setPendingModel({
            id: -1,
            name: modelName,
            herstellerName: formData.hersteller.trim(),
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
            console.error("Fehler beim Hochladen des Geraetefotos:", photoError);
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
            console.error("Fehler beim Auswaehlen des Dokuments:", documentError);
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
        const nextErrors: Record<string, string> = {};

        if (!formData.invNr) nextErrors.invNr = "Inventarnummer ist erforderlich";
        if (formData.invNr && !INTEGER_PATTERN.test(formData.invNr.trim())) {
            nextErrors.invNr = "Inventarnummer muss eine positive ganze Zahl sein";
        }
        if (formData.invNr && INTEGER_PATTERN.test(formData.invNr.trim()) && Number(formData.invNr) <= 0) {
            nextErrors.invNr = "Inventarnummer muss groesser als 0 sein";
        }
        if (!formData.modell) nextErrors.modell = "Modell ist erforderlich";
        if (!formData.status) nextErrors.status = "Status ist erforderlich";
        if (!formData.bereich) nextErrors.bereich = "Bereich ist erforderlich";
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
            let resolvedBrand = existingBrands.find(
                (brand) => normalize(brand.name) === normalize(formData.hersteller),
            );

            if (!resolvedBrand && pendingNewBrand && normalize(pendingNewBrand) === normalize(formData.hersteller)) {
                resolvedBrand = await onAddBrand(pendingNewBrand);
            }

            let selectedModel = findByName(existingModels, formData.modell);
            if (
                !selectedModel &&
                pendingModel &&
                normalize(pendingModel.name) === normalize(formData.modell) &&
                normalize(pendingModel.herstellerName) === normalize(formData.hersteller)
            ) {
                if (!resolvedBrand?.id) {
                    setError("Der Hersteller fuer das neue Modell konnte nicht aufgeloest werden.");
                    return;
                }

                selectedModel = await addModel(pendingModel.name, resolvedBrand.id);
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
                setError("Die ausgewaehlten Stammdaten konnten nicht aufgeloest werden.");
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
            <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.modalContainer}>
                <ScrollView>
                    <Title style={styles.title}>
                        {isEditMode ? `Geraet ${formData.invNr} bearbeiten` : "Neuen Artikel hinzufuegen"}
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
                            setShowBrandDialog={setShowBrandDialog}
                            setShowModelDialog={setShowModelDialog}
                            setShowStandortDialog={setShowStandortDialog}
                            setShowBereichDialog={setShowBereichDialog}
                            setShowKategorieDialog={setShowKategorieDialog}
                            setShowVerantwortlicherDialog={setShowVerantwortlicherDialog}
                            setShowKaufdatumPicker={setShowKaufdatumPicker}
                        />
                        <View style={styles.photoCard}>
                            <View style={styles.photoHeader}>
                                <Text variant="titleMedium">Geraetefoto</Text>
                                <Text variant="bodySmall" style={styles.photoHint}>
                                    Optional
                                </Text>
                            </View>
                            <View style={styles.photoSection}>
                                {selectedPhotoDataUrl ? (
                                    <Image source={{ uri: selectedPhotoDataUrl }} style={styles.photoPreview} />
                                ) : (
                                    <View style={styles.photoPlaceholder}>
                                        <Text style={styles.photoPlaceholderText}>Noch kein Foto ausgewaehlt</Text>
                                    </View>
                                )}
                                <View style={styles.photoActions}>
                                    <Button mode="outlined" onPress={handlePhotoPick}>
                                        {selectedPhotoDataUrl ? "Foto aendern" : "Foto auswaehlen"}
                                    </Button>
                                </View>
                            </View>
                        </View>
                        <View style={styles.photoCard}>
                            <View style={styles.photoHeader}>
                                <Text variant="titleMedium">Dokumente</Text>
                                <Text variant="bodySmall" style={styles.photoHint}>
                                    {isEditMode ? "Im Bearbeitungsflow" : "Wird mit dem Speichern angelegt"}
                                </Text>
                            </View>
                            <View style={styles.documentSection}>
                                {visibleAttachments.length === 0 ? (
                                    <View style={styles.documentPlaceholder}>
                                        <Text style={styles.photoPlaceholderText}>Noch keine Dokumente ausgewaehlt</Text>
                                    </View>
                                ) : (
                                    visibleAttachments.map((attachment) => (
                                        <View key={attachment.id} style={styles.documentRow}>
                                            <View style={styles.documentMeta}>
                                                <Text variant="bodyMedium">{attachment.name}</Text>
                                                <Text variant="bodySmall" style={styles.photoHint}>
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
                                        Dokument auswaehlen
                                    </Button>
                                </View>
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Button mode="outlined" onPress={handleDismiss} style={styles.button}>
                                Abbrechen
                            </Button>
                            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
                                {isEditMode ? "Aenderungen speichern" : "Speichern"}
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
    photoCard: {
        marginTop: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        backgroundColor: "#fafafa",
        gap: 12,
    },
    photoHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    photoHint: {
        color: "#666",
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
