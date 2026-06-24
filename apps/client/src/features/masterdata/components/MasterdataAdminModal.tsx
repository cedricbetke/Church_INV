import React, { useEffect, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, HelperText, Modal, Text, TextInput } from "react-native-paper";
import SelectionDialog from "@/src/features/inventory/components/SelectionDialog";
import herstellerService from "@/src/features/masterdata/services/herstellerService";
import objekttypService from "@/src/features/masterdata/services/objekttypService";
import modellService from "@/src/features/masterdata/services/modellService";
import statusService from "@/src/features/masterdata/services/statusService";
import bereichService from "@/src/features/masterdata/services/bereichService";
import standortService from "@/src/features/masterdata/services/standortService";
import kategorieService from "@/src/features/masterdata/services/kategorieService";
import personService from "@/src/features/masterdata/services/personService";
import { MasterdataUsage } from "@/src/features/masterdata/services/masterdataUsageService";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

interface MasterdataAdminModalProps {
    visible: boolean;
    onDismiss: () => void;
    brands: Hersteller[];
    objekttypen: Array<{ id: number; name: string }>;
    models: Modell[];
    states: Status[];
    bereiche: Bereich[];
    standorte: Standort[];
    kategorien: Kategorie[];
    personen: Person[];
    masterdataUsage: MasterdataUsage;
    addBrand: (brandName: string) => Promise<Hersteller>;
    addObjectType: (name: string) => Promise<{ id: number; name: string }>;
    addModel: (name: string, herstellerId: number, objekttypId: number) => Promise<Modell>;
    onMasterdataChanged: () => Promise<void>;
}

const normalize = (value: string) => value.trim().toLowerCase();

const confirmDelete = (label: string): Promise<boolean> => {
    const message = `${label} wirklich loeschen? Das geht nur, wenn der Eintrag nicht verwendet wird.`;

    if (Platform.OS === "web" && typeof globalThis.confirm === "function") {
        return Promise.resolve(globalThis.confirm(message));
    }

    return new Promise((resolve) => {
        Alert.alert("Stammdatum loeschen", message, [
            { text: "Abbrechen", style: "cancel", onPress: () => resolve(false) },
            { text: "Loeschen", style: "destructive", onPress: () => resolve(true) },
        ]);
    });
};

const getErrorMessage = (unknownError: unknown, fallback: string) => {
    const apiError = unknownError as { response?: { data?: { error?: string } } };
    return apiError.response?.data?.error ?? fallback;
};

type MasterdataSectionKey =
    | "brands"
    | "objectTypes"
    | "models"
    | "states"
    | "bereiche"
    | "standorte"
    | "kategorien"
    | "personen";

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
                    (hovered || pressed) && (isDarkMode ? styles.rowItemHoverDark : styles.rowItemHover),
                    active && (isDarkMode ? styles.rowItemActiveDark : styles.rowItemActive),
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
    states,
    bereiche,
    standorte,
    kategorien,
    personen,
    masterdataUsage,
    addBrand,
    addObjectType,
    addModel,
    onMasterdataChanged,
}) => {
    const { isDarkMode } = useAppThemeMode();
    const [brandName, setBrandName] = useState("");
    const [objectTypeName, setObjectTypeName] = useState("");
    const [modelName, setModelName] = useState("");
    const [statusName, setStatusName] = useState("");
    const [bereichName, setBereichName] = useState("");
    const [standortName, setStandortName] = useState("");
    const [kategorieName, setKategorieName] = useState("");
    const [selectedKategorieBereichName, setSelectedKategorieBereichName] = useState("");
    const [personVorname, setPersonVorname] = useState("");
    const [personNachname, setPersonNachname] = useState("");
    const [selectedBrandName, setSelectedBrandName] = useState("");
    const [selectedObjectTypeName, setSelectedObjectTypeName] = useState("");
    const [showBrandDialog, setShowBrandDialog] = useState(false);
    const [showObjectTypeDialog, setShowObjectTypeDialog] = useState(false);
    const [showKategorieBereichDialog, setShowKategorieBereichDialog] = useState(false);
    const [brandSearchQuery, setBrandSearchQuery] = useState("");
    const [objectTypeSearchQuery, setObjectTypeSearchQuery] = useState("");
    const [kategorieBereichSearchQuery, setKategorieBereichSearchQuery] = useState("");
    const [brandListQuery, setBrandListQuery] = useState("");
    const [objectTypeListQuery, setObjectTypeListQuery] = useState("");
    const [modelListQuery, setModelListQuery] = useState("");
    const [statusListQuery, setStatusListQuery] = useState("");
    const [bereichListQuery, setBereichListQuery] = useState("");
    const [standortListQuery, setStandortListQuery] = useState("");
    const [kategorieListQuery, setKategorieListQuery] = useState("");
    const [personListQuery, setPersonListQuery] = useState("");
    const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
    const [editingObjectTypeId, setEditingObjectTypeId] = useState<number | null>(null);
    const [editingModelId, setEditingModelId] = useState<number | null>(null);
    const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
    const [editingBereichId, setEditingBereichId] = useState<number | null>(null);
    const [editingStandortId, setEditingStandortId] = useState<number | null>(null);
    const [editingKategorieId, setEditingKategorieId] = useState<number | null>(null);
    const [editingPersonId, setEditingPersonId] = useState<number | null>(null);
    const [activeSection, setActiveSection] = useState<MasterdataSectionKey>("models");
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingTarget, setDeletingTarget] = useState<string | null>(null);
    const [isContentReady, setIsContentReady] = useState(false);

    if (!visible) {
        return null;
    }

    useEffect(() => {
        setIsContentReady(false);
        const timer = setTimeout(() => {
            setIsContentReady(true);
        }, 0);

        return () => clearTimeout(timer);
    }, []);

    const sortedBrands = useMemo(
        () => (isContentReady ? [...brands].sort((left, right) => left.name.localeCompare(right.name, "de")) : []),
        [brands, isContentReady],
    );
    const sortedObjectTypes = useMemo(
        () => (isContentReady ? [...objekttypen].sort((left, right) => left.name.localeCompare(right.name, "de")) : []),
        [objekttypen, isContentReady],
    );
    const sortedStates = useMemo(
        () => (isContentReady ? [...states].sort((left, right) => left.name.localeCompare(right.name, "de")) : []),
        [states, isContentReady],
    );
    const sortedBereiche = useMemo(
        () => (isContentReady ? [...bereiche].sort((left, right) => left.name.localeCompare(right.name, "de")) : []),
        [bereiche, isContentReady],
    );
    const sortedStandorte = useMemo(
        () => (isContentReady ? [...standorte].sort((left, right) => left.name.localeCompare(right.name, "de")) : []),
        [standorte, isContentReady],
    );
    const sortedKategorien = useMemo(
        () => (
            isContentReady
                ? [...kategorien]
                    .sort((left, right) => left.name.localeCompare(right.name, "de"))
                    .map((kategorie) => {
                        const bereich = bereiche.find((entry) => entry.id === kategorie.bereich_id)?.name ?? "Unbekannt";
                        return {
                            id: kategorie.id,
                            label: `${kategorie.name} - ${bereich}`,
                            name: kategorie.name,
                            bereich_id: kategorie.bereich_id,
                        };
                    })
                : []
        ),
        [bereiche, kategorien, isContentReady],
    );
    const sortedPersonen = useMemo(
        () => (
            isContentReady
                ? [...personen]
                    .sort((left, right) => `${left.vorname} ${left.nachname}`.localeCompare(`${right.vorname} ${right.nachname}`, "de"))
                    .map((person) => ({
                        id: person.id,
                        label: [person.vorname, person.nachname].filter(Boolean).join(" "),
                        vorname: person.vorname,
                        nachname: person.nachname,
                    }))
                : []
        ),
        [personen, isContentReady],
    );
    const modelRows = useMemo(
        () => (
            isContentReady
                ? [...models]
                    .sort((left, right) => left.name.localeCompare(right.name, "de"))
                    .map((model) => {
                        const brand = brands.find((entry) => entry.id === model.hersteller_id)?.name ?? "Unbekannt";
                        const objectType = objekttypen.find((entry) => entry.id === model.objekttyp_id)?.name ?? "Unbekannt";
                        return {
                            id: model.id,
                            label: `${model.name} - ${brand} - ${objectType}`,
                        };
                    })
                : []
        ),
        [brands, models, objekttypen, isContentReady],
    );

    const filteredBrands = useMemo(
        () => sortedBrands.filter((brand) => normalize(brand.name).includes(normalize(brandListQuery))),
        [sortedBrands, brandListQuery],
    );
    const filteredObjectTypes = useMemo(
        () => sortedObjectTypes.filter((objectType) => normalize(objectType.name).includes(normalize(objectTypeListQuery))),
        [sortedObjectTypes, objectTypeListQuery],
    );
    const filteredModelRows = useMemo(
        () => modelRows.filter((model) => normalize(model.label).includes(normalize(modelListQuery))),
        [modelRows, modelListQuery],
    );
    const filteredStates = useMemo(
        () => sortedStates.filter((state) => normalize(state.name).includes(normalize(statusListQuery))),
        [sortedStates, statusListQuery],
    );
    const filteredBereiche = useMemo(
        () => sortedBereiche.filter((bereich) => normalize(bereich.name).includes(normalize(bereichListQuery))),
        [sortedBereiche, bereichListQuery],
    );
    const filteredStandorte = useMemo(
        () => sortedStandorte.filter((standort) => normalize(standort.name).includes(normalize(standortListQuery))),
        [sortedStandorte, standortListQuery],
    );
    const filteredKategorien = useMemo(
        () => sortedKategorien.filter((kategorie) => normalize(kategorie.label).includes(normalize(kategorieListQuery))),
        [sortedKategorien, kategorieListQuery],
    );
    const filteredPersonen = useMemo(
        () => sortedPersonen.filter((person) => normalize(person.label).includes(normalize(personListQuery))),
        [sortedPersonen, personListQuery],
    );
    const hasUsage = (usage: Record<number, number>, id: number) => Number(usage[id] ?? 0) > 0;
    const isStatusUsed = (status: Status) => hasUsage(masterdataUsage.states, status.id);
    const isBereichUsed = (bereich: Bereich) => hasUsage(masterdataUsage.bereiche, bereich.id);
    const isStandortUsed = (standort: Standort) => hasUsage(masterdataUsage.standorte, standort.id);
    const isKategorieUsed = (kategorieId: number) => hasUsage(masterdataUsage.kategorien, kategorieId);
    const isPersonUsed = (personId: number) => hasUsage(masterdataUsage.personen, personId);
    const sectionTabs = useMemo(
        () => [
            { key: "brands" as const, label: "Hersteller", count: brands.length },
            { key: "objectTypes" as const, label: "Objekttypen", count: objekttypen.length },
            { key: "models" as const, label: "Modelle", count: models.length },
            { key: "states" as const, label: "Status", count: states.length },
            { key: "bereiche" as const, label: "Bereiche", count: bereiche.length },
            { key: "standorte" as const, label: "Standorte", count: standorte.length },
            { key: "kategorien" as const, label: "Kategorien", count: kategorien.length },
            { key: "personen" as const, label: "Personen", count: personen.length },
        ],
        [bereiche.length, brands.length, kategorien.length, models.length, objekttypen.length, personen.length, standorte.length, states.length],
    );

    const resetForm = () => {
        setBrandName("");
        setObjectTypeName("");
        setModelName("");
        setStatusName("");
        setBereichName("");
        setStandortName("");
        setKategorieName("");
        setSelectedKategorieBereichName("");
        setPersonVorname("");
        setPersonNachname("");
        setSelectedBrandName("");
        setSelectedObjectTypeName("");
        setShowBrandDialog(false);
        setShowObjectTypeDialog(false);
        setShowKategorieBereichDialog(false);
        setBrandSearchQuery("");
        setObjectTypeSearchQuery("");
        setKategorieBereichSearchQuery("");
        setBrandListQuery("");
        setObjectTypeListQuery("");
        setModelListQuery("");
        setStatusListQuery("");
        setBereichListQuery("");
        setStandortListQuery("");
        setKategorieListQuery("");
        setPersonListQuery("");
        setEditingBrandId(null);
        setEditingObjectTypeId(null);
        setEditingModelId(null);
        setEditingStatusId(null);
        setEditingBereichId(null);
        setEditingStandortId(null);
        setEditingKategorieId(null);
        setEditingPersonId(null);
        setError(null);
        setIsSaving(false);
        setDeletingTarget(null);
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
            await onMasterdataChanged();
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
            await onMasterdataChanged();
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
            await onMasterdataChanged();
        } catch (createError) {
            console.error("Fehler beim Anlegen des Modells:", createError);
            setError(editingModelId ? "Modell konnte nicht aktualisiert werden." : "Modell konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateStatus = async () => {
        const nextName = statusName.trim();
        if (!nextName) {
            setError("Bitte einen Status eingeben.");
            return;
        }

        if (states.some((entry) => normalize(entry.name) === normalize(nextName) && entry.id !== editingStatusId)) {
            setError("Dieser Status existiert bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            await (
                editingStatusId
                    ? statusService.update(editingStatusId, { name: nextName })
                    : statusService.create({ name: nextName })
            );
            setStatusName("");
            setEditingStatusId(null);
            await onMasterdataChanged();
        } catch (createError) {
            console.error("Fehler beim Speichern des Status:", createError);
            setError(editingStatusId ? "Status konnte nicht aktualisiert werden." : "Status konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateBereich = async () => {
        const nextName = bereichName.trim();
        if (!nextName) {
            setError("Bitte einen Bereich eingeben.");
            return;
        }

        if (bereiche.some((entry) => normalize(entry.name) === normalize(nextName) && entry.id !== editingBereichId)) {
            setError("Dieser Bereich existiert bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            await (
                editingBereichId
                    ? bereichService.update(editingBereichId, { name: nextName })
                    : bereichService.create({ name: nextName })
            );
            setBereichName("");
            setEditingBereichId(null);
            await onMasterdataChanged();
        } catch (createError) {
            console.error("Fehler beim Speichern des Bereichs:", createError);
            setError(editingBereichId ? "Bereich konnte nicht aktualisiert werden." : "Bereich konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateStandort = async () => {
        const nextName = standortName.trim();
        if (!nextName) {
            setError("Bitte einen Standort eingeben.");
            return;
        }

        if (standorte.some((entry) => normalize(entry.name) === normalize(nextName) && entry.id !== editingStandortId)) {
            setError("Dieser Standort existiert bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            await (
                editingStandortId
                    ? standortService.update(editingStandortId, { name: nextName })
                    : standortService.create({ name: nextName })
            );
            setStandortName("");
            setEditingStandortId(null);
            await onMasterdataChanged();
        } catch (createError) {
            console.error("Fehler beim Speichern des Standorts:", createError);
            setError(editingStandortId ? "Standort konnte nicht aktualisiert werden." : "Standort konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateKategorie = async () => {
        const nextName = kategorieName.trim();
        const selectedBereich = bereiche.find((entry) => normalize(entry.name) === normalize(selectedKategorieBereichName));
        if (!nextName) {
            setError("Bitte einen Kategorienamen eingeben.");
            return;
        }

        if (!selectedBereich) {
            setError("Bitte einen Bereich fuer die Kategorie auswaehlen.");
            return;
        }

        if (
            kategorien.some(
                (entry) =>
                    normalize(entry.name) === normalize(nextName) &&
                    entry.bereich_id === selectedBereich.id &&
                    entry.id !== editingKategorieId,
            )
        ) {
            setError("Diese Kategorie existiert fuer den gewaehlten Bereich bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            await (
                editingKategorieId
                    ? kategorieService.update(editingKategorieId, { name: nextName, bereich_id: selectedBereich.id })
                    : kategorieService.create({ name: nextName, bereich_id: selectedBereich.id })
            );
            setKategorieName("");
            setSelectedKategorieBereichName("");
            setEditingKategorieId(null);
            await onMasterdataChanged();
        } catch (createError) {
            console.error("Fehler beim Speichern der Kategorie:", createError);
            setError(editingKategorieId ? "Kategorie konnte nicht aktualisiert werden." : "Kategorie konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreatePerson = async () => {
        const nextVorname = personVorname.trim();
        const nextNachname = personNachname.trim();
        if (!nextVorname || !nextNachname) {
            setError("Bitte Vorname und Nachname eingeben.");
            return;
        }

        if (
            personen.some(
                (entry) =>
                    normalize(entry.vorname) === normalize(nextVorname) &&
                    normalize(entry.nachname) === normalize(nextNachname) &&
                    entry.id !== editingPersonId,
            )
        ) {
            setError("Diese Person existiert bereits.");
            return;
        }

        try {
            setIsSaving(true);
            setError(null);
            await (
                editingPersonId
                    ? personService.update(editingPersonId, { vorname: nextVorname, nachname: nextNachname })
                    : personService.create({ vorname: nextVorname, nachname: nextNachname })
            );
            setPersonVorname("");
            setPersonNachname("");
            setEditingPersonId(null);
            await onMasterdataChanged();
        } catch (createError) {
            console.error("Fehler beim Speichern der Person:", createError);
            setError(editingPersonId ? "Person konnte nicht aktualisiert werden." : "Person konnte nicht angelegt werden.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBrand = async (brand: Hersteller) => {
        if (!brand.id) {
            setError("Hersteller kann nicht geloescht werden, weil die ID fehlt.");
            return;
        }

        if (hasUsage(masterdataUsage.brands, brand.id)) {
            setError("Hersteller wird noch von Modellen verwendet und kann nicht geloescht werden.");
            return;
        }

        if (!(await confirmDelete(`Hersteller "${brand.name}"`))) {
            return;
        }

        try {
            setIsSaving(true);
            setDeletingTarget(`brand-${brand.id}`);
            setError(null);
            await herstellerService.delete(brand.id);
            if (editingBrandId === brand.id) {
                setBrandName("");
                setEditingBrandId(null);
            }
            if (normalize(selectedBrandName) === normalize(brand.name)) {
                setSelectedBrandName("");
            }
            await onMasterdataChanged();
        } catch (deleteError) {
            console.error("Fehler beim Loeschen des Herstellers:", deleteError);
            setError(getErrorMessage(deleteError, "Hersteller konnte nicht geloescht werden."));
        } finally {
            setDeletingTarget(null);
            setIsSaving(false);
        }
    };

    const handleDeleteObjectType = async (objectType: { id: number; name: string }) => {
        if (hasUsage(masterdataUsage.objectTypes, objectType.id)) {
            setError("Objekttyp wird noch von Modellen verwendet und kann nicht geloescht werden.");
            return;
        }

        if (!(await confirmDelete(`Objekttyp "${objectType.name}"`))) {
            return;
        }

        try {
            setIsSaving(true);
            setDeletingTarget(`objectType-${objectType.id}`);
            setError(null);
            await objekttypService.delete(objectType.id);
            if (editingObjectTypeId === objectType.id) {
                setObjectTypeName("");
                setEditingObjectTypeId(null);
            }
            if (normalize(selectedObjectTypeName) === normalize(objectType.name)) {
                setSelectedObjectTypeName("");
            }
            await onMasterdataChanged();
        } catch (deleteError) {
            console.error("Fehler beim Loeschen des Objekttyps:", deleteError);
            setError(getErrorMessage(deleteError, "Objekttyp konnte nicht geloescht werden."));
        } finally {
            setDeletingTarget(null);
            setIsSaving(false);
        }
    };

    const handleDeleteModel = async (modelId: number) => {
        const currentModel = models.find((entry) => entry.id === modelId);
        if (!currentModel) {
            return;
        }

        if (hasUsage(masterdataUsage.models, modelId)) {
            setError("Modell wird noch von Geraeten verwendet und kann nicht geloescht werden.");
            return;
        }

        if (!(await confirmDelete(`Modell "${currentModel.name}"`))) {
            return;
        }

        try {
            setIsSaving(true);
            setDeletingTarget(`model-${modelId}`);
            setError(null);
            await modellService.delete(modelId);
            if (editingModelId === modelId) {
                setModelName("");
                setSelectedBrandName("");
                setSelectedObjectTypeName("");
                setEditingModelId(null);
            }
            await onMasterdataChanged();
        } catch (deleteError) {
            console.error("Fehler beim Loeschen des Modells:", deleteError);
            setError(getErrorMessage(deleteError, "Modell konnte nicht geloescht werden."));
        } finally {
            setDeletingTarget(null);
            setIsSaving(false);
        }
    };

    const handleDeleteStatus = async (status: Status) => {
        if (isStatusUsed(status)) {
            setError("Status wird noch von Geraeten verwendet und kann nicht geloescht werden.");
            return;
        }

        if (!(await confirmDelete(`Status "${status.name}"`))) {
            return;
        }

        try {
            setIsSaving(true);
            setDeletingTarget(`status-${status.id}`);
            setError(null);
            await statusService.delete(status.id);
            if (editingStatusId === status.id) {
                setStatusName("");
                setEditingStatusId(null);
            }
            await onMasterdataChanged();
        } catch (deleteError) {
            console.error("Fehler beim Loeschen des Status:", deleteError);
            setError(getErrorMessage(deleteError, "Status konnte nicht geloescht werden."));
        } finally {
            setDeletingTarget(null);
            setIsSaving(false);
        }
    };

    const handleDeleteBereich = async (bereich: Bereich) => {
        if (isBereichUsed(bereich)) {
            setError("Bereich wird noch von Kategorien oder Geraeten verwendet und kann nicht geloescht werden.");
            return;
        }

        if (!(await confirmDelete(`Bereich "${bereich.name}"`))) {
            return;
        }

        try {
            setIsSaving(true);
            setDeletingTarget(`bereich-${bereich.id}`);
            setError(null);
            await bereichService.delete(bereich.id);
            if (editingBereichId === bereich.id) {
                setBereichName("");
                setEditingBereichId(null);
            }
            await onMasterdataChanged();
        } catch (deleteError) {
            console.error("Fehler beim Loeschen des Bereichs:", deleteError);
            setError(getErrorMessage(deleteError, "Bereich konnte nicht geloescht werden."));
        } finally {
            setDeletingTarget(null);
            setIsSaving(false);
        }
    };

    const handleDeleteStandort = async (standort: Standort) => {
        if (isStandortUsed(standort)) {
            setError("Standort wird noch von Geraeten verwendet und kann nicht geloescht werden.");
            return;
        }

        if (!(await confirmDelete(`Standort "${standort.name}"`))) {
            return;
        }

        try {
            setIsSaving(true);
            setDeletingTarget(`standort-${standort.id}`);
            setError(null);
            await standortService.delete(standort.id);
            if (editingStandortId === standort.id) {
                setStandortName("");
                setEditingStandortId(null);
            }
            await onMasterdataChanged();
        } catch (deleteError) {
            console.error("Fehler beim Loeschen des Standorts:", deleteError);
            setError(getErrorMessage(deleteError, "Standort konnte nicht geloescht werden."));
        } finally {
            setDeletingTarget(null);
            setIsSaving(false);
        }
    };

    const handleDeleteKategorie = async (kategorie: { id: number; name: string }) => {
        if (isKategorieUsed(kategorie.id)) {
            setError("Kategorie wird noch von Geraeten verwendet und kann nicht geloescht werden.");
            return;
        }

        if (!(await confirmDelete(`Kategorie "${kategorie.name}"`))) {
            return;
        }

        try {
            setIsSaving(true);
            setDeletingTarget(`kategorie-${kategorie.id}`);
            setError(null);
            await kategorieService.delete(kategorie.id);
            if (editingKategorieId === kategorie.id) {
                setKategorieName("");
                setSelectedKategorieBereichName("");
                setEditingKategorieId(null);
            }
            await onMasterdataChanged();
        } catch (deleteError) {
            console.error("Fehler beim Loeschen der Kategorie:", deleteError);
            setError(getErrorMessage(deleteError, "Kategorie konnte nicht geloescht werden."));
        } finally {
            setDeletingTarget(null);
            setIsSaving(false);
        }
    };

    const handleDeletePerson = async (person: { id: number; label: string }) => {
        if (isPersonUsed(person.id)) {
            setError("Person wird noch als Verantwortlicher verwendet und kann nicht geloescht werden.");
            return;
        }

        if (!(await confirmDelete(`Person "${person.label}"`))) {
            return;
        }

        try {
            setIsSaving(true);
            setDeletingTarget(`person-${person.id}`);
            setError(null);
            await personService.delete(person.id);
            if (editingPersonId === person.id) {
                setPersonVorname("");
                setPersonNachname("");
                setEditingPersonId(null);
            }
            await onMasterdataChanged();
        } catch (deleteError) {
            console.error("Fehler beim Loeschen der Person:", deleteError);
            setError(getErrorMessage(deleteError, "Person konnte nicht geloescht werden."));
        } finally {
            setDeletingTarget(null);
            setIsSaving(false);
        }
    };

    const renderReadOnlySection = ({
        title,
        searchLabel,
        query,
        onQueryChange,
        form,
        rows,
        emptyMessage,
    }: {
        title: string;
        searchLabel: string;
        query: string;
        onQueryChange: (value: string) => void;
        form: React.ReactNode;
        rows: Array<{
            id: number;
            label: string;
            active?: boolean;
            isUsed: boolean;
            deleteTarget: string;
            onEdit: () => void;
            onDelete: () => void;
        }>;
        emptyMessage: string;
    }) => (
        <>
            <Divider />

            <View style={styles.section}>
                <Text variant="titleMedium" style={isDarkMode ? styles.titleDark : undefined}>{title}</Text>
                {form}
                <TextInput
                    mode="outlined"
                    label={searchLabel}
                    value={query}
                    onChangeText={onQueryChange}
                    style={isDarkMode ? styles.inputDark : undefined}
                />
                <ScrollView style={[styles.listPanel, isDarkMode && styles.listPanelDark]} contentContainerStyle={styles.list}>
                    {rows.map((row) => (
                        <HoverRow
                            key={row.id}
                            active={row.active}
                            onPress={() => {
                                row.onEdit();
                                setError(null);
                            }}
                            isDarkMode={isDarkMode}
                        >
                            <Text variant="bodyMedium" style={[styles.rowItemText, isDarkMode && styles.rowItemTextDark]}>
                                {row.label}
                            </Text>
                            <View style={styles.rowActions}>
                                <Button
                                    mode="text"
                                    onPress={() => {
                                        row.onEdit();
                                        setError(null);
                                    }}
                                >
                                    Bearbeiten
                                </Button>
                                <Button
                                    mode="text"
                                    textColor="#b3261e"
                                    disabled={isSaving || row.isUsed || deletingTarget === row.deleteTarget}
                                    loading={deletingTarget === row.deleteTarget}
                                    onPress={row.onDelete}
                                >
                                    {row.isUsed ? "Genutzt" : "Loeschen"}
                                </Button>
                            </View>
                        </HoverRow>
                    ))}
                    {rows.length === 0 && (
                        <Text style={[styles.emptyListText, isDarkMode && styles.emptyListTextDark]}>
                            {emptyMessage}
                        </Text>
                    )}
                </ScrollView>
            </View>
        </>
    );

    return (
        <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={[styles.modal, isDarkMode && styles.modalDark]}>
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text variant="titleLarge" style={isDarkMode ? styles.titleDark : undefined}>Stammdaten</Text>
                    <Text variant="bodyMedium" style={[styles.subtleText, isDarkMode && styles.subtleTextDark]}>
                        Admin-Uebersicht fuer Inventar-Stammdaten.
                    </Text>
                </View>

                {!isContentReady ? (
                    <View style={[styles.loadingState, isDarkMode && styles.loadingStateDark]}>
                        <Text style={[styles.loadingStateText, isDarkMode && styles.loadingStateTextDark]}>
                            Stammdaten werden geladen...
                        </Text>
                    </View>
                ) : (
                    <>
                <View style={[styles.sectionNavigation, isDarkMode && styles.sectionNavigationDark]}>
                    {sectionTabs.map((section) => {
                        const isActive = activeSection === section.key;

                        return (
                            <Pressable
                                key={section.key}
                                onPress={() => {
                                    setActiveSection(section.key);
                                    setError(null);
                                }}
                            >
                                {({ hovered, pressed }) => (
                                    <View
                                        style={[
                                            styles.sectionTab,
                                            isDarkMode && styles.sectionTabDark,
                                            (hovered || pressed) && (isDarkMode ? styles.sectionTabHoverDark : styles.sectionTabHover),
                                            isActive && (isDarkMode ? styles.sectionTabActiveDark : styles.sectionTabActive),
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.sectionTabText,
                                                isDarkMode && styles.sectionTabTextDark,
                                                isActive && (isDarkMode ? styles.sectionTabTextActiveDark : styles.sectionTabTextActive),
                                            ]}
                                        >
                                            {section.label}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.sectionTabCount,
                                                isDarkMode && styles.sectionTabCountDark,
                                                isActive && (isDarkMode ? styles.sectionTabCountActiveDark : styles.sectionTabTextActive),
                                            ]}
                                        >
                                            {section.count}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>
                        );
                    })}
                </View>

                {activeSection === "brands" && (
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
                    <TextInput
                        mode="outlined"
                        label="Hersteller suchen"
                        value={brandListQuery}
                        onChangeText={setBrandListQuery}
                        style={isDarkMode ? styles.inputDark : undefined}
                    />
                    <ScrollView style={[styles.listPanel, isDarkMode && styles.listPanelDark]} contentContainerStyle={styles.list}>
                        {filteredBrands.map((brand) => {
                            const isUsed = Boolean(brand.id && hasUsage(masterdataUsage.brands, brand.id));
                            const deleteTarget = brand.id ? `brand-${brand.id}` : null;

                            return (
                                <HoverRow
                                    key={brand.id}
                                    active={editingBrandId === brand.id}
                                    onPress={() => {
                                        setBrandName(brand.name);
                                        setEditingBrandId(brand.id ?? null);
                                        setError(null);
                                    }}
                                    isDarkMode={isDarkMode}
                                >
                                    <Text variant="bodyMedium" style={[styles.rowItemText, isDarkMode && styles.rowItemTextDark]}>
                                        {brand.name}
                                    </Text>
                                    <View style={styles.rowActions}>
                                        <Button
                                            mode="text"
                                            onPress={() => {
                                                setBrandName(brand.name);
                                                setEditingBrandId(brand.id ?? null);
                                                setError(null);
                                            }}
                                        >
                                            Bearbeiten
                                        </Button>
                                        <Button
                                            mode="text"
                                            textColor="#b3261e"
                                            disabled={isSaving || isUsed || deletingTarget === deleteTarget}
                                            loading={deletingTarget === deleteTarget}
                                            onPress={() => void handleDeleteBrand(brand)}
                                        >
                                            {isUsed ? "Genutzt" : "Loeschen"}
                                        </Button>
                                    </View>
                                </HoverRow>
                            );
                        })}
                        {filteredBrands.length === 0 && (
                            <Text style={[styles.emptyListText, isDarkMode && styles.emptyListTextDark]}>
                                Keine Hersteller für diese Suche.
                            </Text>
                        )}
                    </ScrollView>
                </View>
                )}

                {activeSection === "objectTypes" && (
                <>
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
                    <TextInput
                        mode="outlined"
                        label="Objekttyp suchen"
                        value={objectTypeListQuery}
                        onChangeText={setObjectTypeListQuery}
                        style={isDarkMode ? styles.inputDark : undefined}
                    />
                    <ScrollView style={[styles.listPanel, isDarkMode && styles.listPanelDark]} contentContainerStyle={styles.list}>
                        {filteredObjectTypes.map((objectType) => {
                            const isUsed = hasUsage(masterdataUsage.objectTypes, objectType.id);
                            const deleteTarget = `objectType-${objectType.id}`;

                            return (
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
                                    <View style={styles.rowActions}>
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
                                        <Button
                                            mode="text"
                                            textColor="#b3261e"
                                            disabled={isSaving || isUsed || deletingTarget === deleteTarget}
                                            loading={deletingTarget === deleteTarget}
                                            onPress={() => void handleDeleteObjectType(objectType)}
                                        >
                                            {isUsed ? "Genutzt" : "Loeschen"}
                                        </Button>
                                    </View>
                                </HoverRow>
                            );
                        })}
                        {filteredObjectTypes.length === 0 && (
                            <Text style={[styles.emptyListText, isDarkMode && styles.emptyListTextDark]}>
                                Keine Objekttypen für diese Suche.
                            </Text>
                        )}
                    </ScrollView>
                </View>
                </>
                )}

                {activeSection === "models" && (
                <>
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
                    <TextInput
                        mode="outlined"
                        label="Modelle suchen"
                        value={modelListQuery}
                        onChangeText={setModelListQuery}
                        style={isDarkMode ? styles.inputDark : undefined}
                    />
                    <Text variant="bodySmall" style={[styles.subtleText, isDarkMode && styles.subtleTextDark]}>
                        Hersteller und Objekttyp werden über die vorhandenen Stammdaten ausgewählt.
                    </Text>
                    <ScrollView style={[styles.largeListPanel, isDarkMode && styles.listPanelDark]} contentContainerStyle={styles.list}>
                        {filteredModelRows.map((model) => {
                            const isUsed = hasUsage(masterdataUsage.models, model.id);
                            const deleteTarget = `model-${model.id}`;

                            return (
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
                                    <View style={styles.rowActions}>
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
                                        <Button
                                            mode="text"
                                            textColor="#b3261e"
                                            disabled={isSaving || isUsed || deletingTarget === deleteTarget}
                                            loading={deletingTarget === deleteTarget}
                                            onPress={() => void handleDeleteModel(model.id)}
                                        >
                                            {isUsed ? "Genutzt" : "Loeschen"}
                                        </Button>
                                    </View>
                                </HoverRow>
                            );
                        })}
                        {filteredModelRows.length === 0 && (
                            <Text style={[styles.emptyListText, isDarkMode && styles.emptyListTextDark]}>
                                Keine Modelle für diese Suche.
                            </Text>
                        )}
                    </ScrollView>
                </View>
                </>
                )}

                {activeSection === "states" && (
                    renderReadOnlySection({
                        title: "Status",
                        searchLabel: "Status suchen",
                        query: statusListQuery,
                        onQueryChange: setStatusListQuery,
                        form: (
                            <View style={styles.formRow}>
                                <TextInput
                                    mode="outlined"
                                    label={editingStatusId ? "Status bearbeiten" : "Neuer Status"}
                                    value={statusName}
                                    onChangeText={setStatusName}
                                    style={[styles.input, isDarkMode && styles.inputDark]}
                                />
                                <Button mode="contained" onPress={handleCreateStatus} disabled={isSaving}>
                                    {editingStatusId ? "Speichern" : "Anlegen"}
                                </Button>
                            </View>
                        ),
                        rows: filteredStates.map((status) => ({
                            id: status.id,
                            label: status.name,
                            active: editingStatusId === status.id,
                            isUsed: isStatusUsed(status),
                            deleteTarget: `status-${status.id}`,
                            onEdit: () => {
                                setStatusName(status.name);
                                setEditingStatusId(status.id);
                            },
                            onDelete: () => void handleDeleteStatus(status),
                        })),
                        emptyMessage: "Keine Status fuer diese Suche.",
                    })
                )}

                {activeSection === "bereiche" && (
                    renderReadOnlySection({
                        title: "Bereiche",
                        searchLabel: "Bereiche suchen",
                        query: bereichListQuery,
                        onQueryChange: setBereichListQuery,
                        form: (
                            <View style={styles.formRow}>
                                <TextInput
                                    mode="outlined"
                                    label={editingBereichId ? "Bereich bearbeiten" : "Neuer Bereich"}
                                    value={bereichName}
                                    onChangeText={setBereichName}
                                    style={[styles.input, isDarkMode && styles.inputDark]}
                                />
                                <Button mode="contained" onPress={handleCreateBereich} disabled={isSaving}>
                                    {editingBereichId ? "Speichern" : "Anlegen"}
                                </Button>
                            </View>
                        ),
                        rows: filteredBereiche.map((bereich) => ({
                            id: bereich.id,
                            label: bereich.name,
                            active: editingBereichId === bereich.id,
                            isUsed: isBereichUsed(bereich),
                            deleteTarget: `bereich-${bereich.id}`,
                            onEdit: () => {
                                setBereichName(bereich.name);
                                setEditingBereichId(bereich.id);
                            },
                            onDelete: () => void handleDeleteBereich(bereich),
                        })),
                        emptyMessage: "Keine Bereiche fuer diese Suche.",
                    })
                )}

                {activeSection === "standorte" && (
                    renderReadOnlySection({
                        title: "Standorte",
                        searchLabel: "Standorte suchen",
                        query: standortListQuery,
                        onQueryChange: setStandortListQuery,
                        form: (
                            <View style={styles.formRow}>
                                <TextInput
                                    mode="outlined"
                                    label={editingStandortId ? "Standort bearbeiten" : "Neuer Standort"}
                                    value={standortName}
                                    onChangeText={setStandortName}
                                    style={[styles.input, isDarkMode && styles.inputDark]}
                                />
                                <Button mode="contained" onPress={handleCreateStandort} disabled={isSaving}>
                                    {editingStandortId ? "Speichern" : "Anlegen"}
                                </Button>
                            </View>
                        ),
                        rows: filteredStandorte.map((standort) => ({
                            id: standort.id,
                            label: standort.name,
                            active: editingStandortId === standort.id,
                            isUsed: isStandortUsed(standort),
                            deleteTarget: `standort-${standort.id}`,
                            onEdit: () => {
                                setStandortName(standort.name);
                                setEditingStandortId(standort.id);
                            },
                            onDelete: () => void handleDeleteStandort(standort),
                        })),
                        emptyMessage: "Keine Standorte fuer diese Suche.",
                    })
                )}

                {activeSection === "kategorien" && (
                    renderReadOnlySection({
                        title: "Kategorien",
                        searchLabel: "Kategorien suchen",
                        query: kategorieListQuery,
                        onQueryChange: setKategorieListQuery,
                        form: (
                            <View style={styles.formColumn}>
                                <TextInput
                                    mode="outlined"
                                    label={editingKategorieId ? "Kategorie bearbeiten" : "Neue Kategorie"}
                                    value={kategorieName}
                                    onChangeText={setKategorieName}
                                    style={isDarkMode ? styles.inputDark : undefined}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Bereich"
                                    value={selectedKategorieBereichName}
                                    onFocus={() => setShowKategorieBereichDialog(true)}
                                    onPressIn={() => setShowKategorieBereichDialog(true)}
                                    showSoftInputOnFocus={false}
                                    right={<TextInput.Icon icon="chevron-down" />}
                                    style={isDarkMode ? styles.inputDark : undefined}
                                />
                                <Button mode="contained" onPress={handleCreateKategorie} disabled={isSaving}>
                                    {editingKategorieId ? "Speichern" : "Kategorie anlegen"}
                                </Button>
                            </View>
                        ),
                        rows: filteredKategorien.map((kategorie) => ({
                            id: kategorie.id,
                            label: kategorie.label,
                            active: editingKategorieId === kategorie.id,
                            isUsed: isKategorieUsed(kategorie.id),
                            deleteTarget: `kategorie-${kategorie.id}`,
                            onEdit: () => {
                                const currentBereich = bereiche.find((entry) => entry.id === kategorie.bereich_id);
                                setKategorieName(kategorie.name);
                                setSelectedKategorieBereichName(currentBereich?.name ?? "");
                                setEditingKategorieId(kategorie.id);
                            },
                            onDelete: () => void handleDeleteKategorie(kategorie),
                        })),
                        emptyMessage: "Keine Kategorien fuer diese Suche.",
                    })
                )}

                {activeSection === "personen" && (
                    renderReadOnlySection({
                        title: "Personen",
                        searchLabel: "Personen suchen",
                        query: personListQuery,
                        onQueryChange: setPersonListQuery,
                        form: (
                            <View style={styles.formRow}>
                                <TextInput
                                    mode="outlined"
                                    label="Vorname"
                                    value={personVorname}
                                    onChangeText={setPersonVorname}
                                    style={[styles.input, isDarkMode && styles.inputDark]}
                                />
                                <TextInput
                                    mode="outlined"
                                    label="Nachname"
                                    value={personNachname}
                                    onChangeText={setPersonNachname}
                                    style={[styles.input, isDarkMode && styles.inputDark]}
                                />
                                <Button mode="contained" onPress={handleCreatePerson} disabled={isSaving}>
                                    {editingPersonId ? "Speichern" : "Anlegen"}
                                </Button>
                            </View>
                        ),
                        rows: filteredPersonen.map((person) => ({
                            id: person.id,
                            label: person.label,
                            active: editingPersonId === person.id,
                            isUsed: isPersonUsed(person.id),
                            deleteTarget: `person-${person.id}`,
                            onEdit: () => {
                                setPersonVorname(person.vorname);
                                setPersonNachname(person.nachname);
                                setEditingPersonId(person.id);
                            },
                            onDelete: () => void handleDeletePerson(person),
                        })),
                        emptyMessage: "Keine Personen fuer diese Suche.",
                    })
                )}

                {error && <HelperText type="error">{error}</HelperText>}

                <View style={styles.footer}>
                    <Button mode="outlined" onPress={handleDismiss}>
                        Schließen
                    </Button>
                </View>
                    </>
                )}
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

            <SelectionDialog
                visible={showKategorieBereichDialog}
                onDismiss={() => setShowKategorieBereichDialog(false)}
                title="Bereich auswaehlen"
                searchQuery={kategorieBereichSearchQuery}
                onSearchChange={setKategorieBereichSearchQuery}
                items={sortedBereiche}
                onSelect={(name) => {
                    setSelectedKategorieBereichName(name);
                    setShowKategorieBereichDialog(false);
                    setKategorieBereichSearchQuery("");
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
    sectionNavigation: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        padding: 8,
        borderWidth: 1,
        borderColor: "#e3e7ee",
        borderRadius: 12,
        backgroundColor: "#fafbfc",
    },
    sectionNavigationDark: {
        backgroundColor: "#0f141b",
        borderColor: "#263140",
    },
    sectionTab: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        minHeight: 36,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#d6dce6",
        borderRadius: 8,
        backgroundColor: "#ffffff",
    },
    sectionTabDark: {
        backgroundColor: "#161b22",
        borderColor: "#263140",
    },
    sectionTabHover: {
        borderColor: "#8fb4ff",
        backgroundColor: "#f3f7ff",
    },
    sectionTabHoverDark: {
        borderColor: "#2a3340",
        backgroundColor: "#1b212c",
    },
    sectionTabActive: {
        borderColor: "#1f6fb2",
        backgroundColor: "#e8f0fe",
    },
    sectionTabActiveDark: {
        borderColor: "#3a4658",
        backgroundColor: "#202938",
    },
    sectionTabText: {
        color: "#2f343b",
        fontWeight: "600",
    },
    sectionTabTextDark: {
        color: "#f3f4f6",
    },
    sectionTabTextActive: {
        color: "#174f80",
    },
    sectionTabTextActiveDark: {
        color: "#eaf2ff",
    },
    sectionTabCount: {
        color: "#5f6368",
        fontWeight: "600",
    },
    sectionTabCountDark: {
        color: "#9aa4b2",
    },
    sectionTabCountActiveDark: {
        color: "#cbd5e1",
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
        maxHeight: 420,
        borderWidth: 1,
        borderColor: "#e3e7ee",
        borderRadius: 12,
        backgroundColor: "#fafbfc",
    },
    largeListPanel: {
        maxHeight: 420,
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
        flexWrap: "wrap",
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
    rowItemHoverDark: {
        backgroundColor: "#1b212c",
        borderColor: "#2a3340",
    },
    rowItemActive: {
        backgroundColor: "#e8f0fe",
        borderColor: "#8fb4ff",
    },
    rowItemActiveDark: {
        backgroundColor: "#202938",
        borderColor: "#3a4658",
    },
    rowItemText: {
        flex: 1,
        minWidth: 160,
    },
    rowItemTextDark: {
        color: "#f3f4f6",
    },
    rowActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 4,
    },
    subtleText: {
        color: "#5f6368",
    },
    subtleTextDark: {
        color: "#9aa4b2",
    },
    loadingState: {
        paddingVertical: 24,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: "#e3e7ee",
        borderRadius: 12,
        backgroundColor: "#fafbfc",
    },
    loadingStateDark: {
        backgroundColor: "#0f141b",
        borderColor: "#263140",
    },
    loadingStateText: {
        color: "#5f6368",
    },
    loadingStateTextDark: {
        color: "#9aa4b2",
    },
    emptyListText: {
        color: "#5f6368",
        paddingHorizontal: 8,
        paddingVertical: 10,
    },
    emptyListTextDark: {
        color: "#9aa4b2",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 4,
    },
});

export default MasterdataAdminModal;
