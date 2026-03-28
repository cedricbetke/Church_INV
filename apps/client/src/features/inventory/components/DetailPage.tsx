import React, { useEffect, useMemo, useState } from "react";
import { Modal, Portal as PaperPortal, Button, Surface, Text, ActivityIndicator } from "react-native-paper";
import { Alert, Image, ScrollView, View, StyleSheet, Platform, Linking, useWindowDimensions } from "react-native";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import { Column } from "./dataTable";
import geraeteService from "@/src/features/inventory/services/geraeteService";
import { HistoryEntry } from "@/src/features/inventory/types/HistoryEntry";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";
import dokumenteService from "@/src/features/masterdata/services/dokumenteService";
import Attachment from "@/src/features/inventory/types/Attachment";
import apiClient from "@/src/shared/api/apiClient";

interface DetailModalProps {
    visible: boolean;
    onDismiss: () => void;
    selectedItem: InventoryItem | null;
    columns: Column[];
    canManageInventory: boolean;
    onEdit: (item: InventoryItem) => void;
    onDelete: (item: InventoryItem) => Promise<void>;
}

const formatDate = (value?: Date) => {
    if (!value) {
        return "Nicht gesetzt";
    }

    return value.toLocaleDateString("de-DE");
};

const formatCurrency = (value?: number) => {
    if (value == null) {
        return "Nicht gesetzt";
    }

    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    }).format(value);
};

const getDisplayValue = (value?: string) => value?.trim() || "Nicht gesetzt";
const isUnsetValue = (value: string) => value === "Nicht gesetzt";

const DetailRow = ({ label, value, isDarkMode, compact = false }: { label: string; value: string; isDarkMode: boolean; compact?: boolean }) => (
    <View style={[styles.detailItem, compact && styles.detailItemCompact]}>
        <Surface style={[styles.detailCard, isDarkMode && styles.detailCardDark]}>
            <Text style={[styles.cardLabel, isDarkMode && styles.cardLabelDark]}>{label}</Text>
            <Text style={[styles.cardValue, isDarkMode && styles.cardValueDark, isUnsetValue(value) && styles.cardValueMuted]}>{value}</Text>
        </Surface>
    </View>
);

const formatHistoryValue = (value: string | null) => value?.trim() || "Nicht gesetzt";

const getHistoryDescription = (entry: HistoryEntry) => {
    if (entry.aktion === "create") {
        return "Gerät angelegt";
    }

    const fieldLabel = entry.feld ?? "unbekanntes Feld";
    return `${fieldLabel}: ${formatHistoryValue(entry.alter_wert)} -> ${formatHistoryValue(entry.neuer_wert)}`;
};

const getHistoryGroupTitle = (aktion: string, entryCount: number) => {
    if (aktion === "create") {
        return "Angelegt";
    }

    if (entryCount === 1) {
        return "Änderung";
    }

    return `${entryCount} Änderungen`;
};

const groupHistoryEntries = (entries: HistoryEntry[]) => {
    // A single save action writes multiple history rows with the same action and timestamp.
    // Grouping them here keeps the UI readable without changing the DB schema.
    const groupedEntries: Array<{
        key: string;
        aktion: string;
        erstellt_am: string;
        entries: HistoryEntry[];
    }> = [];

    for (const entry of entries) {
        const lastGroup = groupedEntries[groupedEntries.length - 1];
        const groupKey = `${entry.aktion}-${entry.erstellt_am}`;

        if (lastGroup && lastGroup.key === groupKey) {
            lastGroup.entries.push(entry);
            continue;
        }

        groupedEntries.push({
            key: groupKey,
            aktion: entry.aktion,
            erstellt_am: entry.erstellt_am,
            entries: [entry],
        });
    }

    return groupedEntries;
};

const DetailModal: React.FC<DetailModalProps> = ({
    visible,
    onDismiss,
    selectedItem,
    canManageInventory,
    onEdit,
    onDelete,
}) => {
    const { isDarkMode } = useAppThemeMode();
    const { width } = useWindowDimensions();
    const isCompactViewport = width < 760;
    const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
    const [isPhotoLoading, setIsPhotoLoading] = useState(false);
    const [photoSource, setPhotoSource] = useState<string | null>(null);
    const groupedHistoryEntries = useMemo(
        () => groupHistoryEntries(historyEntries),
        [historyEntries],
    );

    const preferredPhotoSource = useMemo(
        () => selectedItem?.geraeteFotoThumb ?? selectedItem?.geraeteFoto ?? null,
        [selectedItem],
    );

    useEffect(() => {
        if (!visible || !selectedItem) {
            setHistoryEntries([]);
            setAttachments([]);
            setIsHistoryExpanded(false);
            setIsPhotoLoading(false);
            setPhotoSource(null);
            return;
        }

        setPhotoSource(preferredPhotoSource);
        setIsPhotoLoading(false);

        let isActive = true;

        void dokumenteService.getAllByGeraetId(selectedItem.invNr)
            .then((items) => {
                if (!isActive) {
                    return;
                }

                setAttachments(items.map((attachment) => ({
                    id: String(attachment.id),
                    name: attachment.name,
                    type: attachment.url.split(".").pop()?.toLowerCase() ?? "datei",
                    file: apiClient.resolveAssetUrl(attachment.url),
                    uploadedAt: attachment.hochgeladen_am ? new Date(attachment.hochgeladen_am) : new Date(),
                })));
            })
            .catch((error) => {
                console.error("Fehler beim Laden der Dokumente:", error);
                if (isActive) {
                    setAttachments([]);
                }
            });

        return () => {
            isActive = false;
        };
    }, [visible, selectedItem, preferredPhotoSource]);

    useEffect(() => {
        if (!isPhotoLoading || !photoSource) {
            return;
        }

        const timeout = setTimeout(() => {
            setIsPhotoLoading(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [isPhotoLoading, photoSource]);

    useEffect(() => {
        if (!visible || !selectedItem || !isHistoryExpanded) {
            if (!isHistoryExpanded) {
                setHistoryEntries([]);
            }
            return;
        }

        let isActive = true;

        void geraeteService.getHistory(selectedItem.invNr)
            .then((entries) => {
                if (isActive) {
                    setHistoryEntries(entries);
                }
            })
            .catch((error) => {
                console.error("Fehler beim Laden des Geräteverlaufs:", error);
                if (isActive) {
                    setHistoryEntries([]);
                }
            });

        return () => {
            isActive = false;
        };
    }, [visible, selectedItem, isHistoryExpanded]);

    const confirmDelete = async (item: InventoryItem) => {
        if (Platform.OS === "web") {
            if (globalThis.confirm(`Gerät ${item.invNr} wirklich löschen?`)) {
                await onDelete(item);
            }
            return;
        }

        Alert.alert(
            "Gerät löschen",
            `Gerät ${item.invNr} wirklich löschen?`,
            [
                { text: "Abbrechen", style: "cancel" },
                {
                    text: "Löschen",
                    style: "destructive",
                    onPress: () => {
                        void onDelete(item);
                    },
                },
            ],
        );
    };

    const openAttachment = async (url: string) => {
        await Linking.openURL(url);
    };

    return (
        <PaperPortal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.modalContainer,
                    isDarkMode && styles.modalContainerDark,
                    isCompactViewport && styles.modalContainerCompact,
                ]}
            >
                <ScrollView>
                    {selectedItem && (
                        <View>
                            <Text style={[styles.title, isDarkMode && styles.titleDark]}>
                                Details zu {selectedItem.invNr}
                            </Text>
                            <Text style={styles.subtitle}>Inventarübersicht und aktuelle Zuordnung</Text>

                            <Surface style={[styles.heroCard, isDarkMode && styles.heroCardDark]}>
                                <View style={[styles.heroContent, isCompactViewport && styles.heroContentCompact]}>
                                    <View style={[styles.imageFrame, isDarkMode && styles.imageFrameDark]}>
                                        {photoSource ? (
                                            <View style={styles.imageWrapper}>
                                                <Image
                                                    key={photoSource}
                                                    source={{ uri: photoSource }}
                                                    style={styles.image}
                                                    resizeMode="contain"
                                                    onLoadStart={() => setIsPhotoLoading(true)}
                                                    onLoad={() => setIsPhotoLoading(false)}
                                                    onLoadEnd={() => setIsPhotoLoading(false)}
                                                    onError={() => {
                                                        if (photoSource !== selectedItem.geraeteFoto && selectedItem.geraeteFoto) {
                                                            setPhotoSource(selectedItem.geraeteFoto);
                                                            return;
                                                        }

                                                        setIsPhotoLoading(false);
                                                    }}
                                                />
                                                {isPhotoLoading && (
                                                    <View style={[styles.imageLoadingOverlay, isDarkMode && styles.imageLoadingOverlayDark]}>
                                                        <ActivityIndicator animating size="small" color={isDarkMode ? "#dbe6f5" : "#0f5ea8"} />
                                                        <Text style={[styles.imageLoadingText, isDarkMode && styles.imageLoadingTextDark]}>
                                                            Foto wird geladen
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        ) : (
                                            <View style={[styles.imagePlaceholder, isDarkMode && styles.imagePlaceholderDark]}>
                                                <Text style={[styles.imagePlaceholderText, isDarkMode && styles.imagePlaceholderTextDark]}>Kein Foto hinterlegt</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={[styles.heroMeta, isCompactViewport && styles.heroMetaCompact]}>
                                        <Text style={[styles.heroTitle, isDarkMode && styles.heroTitleDark, isCompactViewport && styles.heroTitleCompact]}>{selectedItem.modell}</Text>
                                        <Text style={[styles.heroSubtitle, isDarkMode && styles.heroSubtitleDark]}>
                                            Inventarnummer {selectedItem.invNr}
                                        </Text>
                                        <View style={styles.heroBadgeRow}>
                                            <View style={[styles.heroBadge, isDarkMode && styles.heroBadgeDark, isCompactViewport && styles.heroBadgeCompact]}>
                                                <Text style={[styles.heroBadgeLabel, isDarkMode && styles.heroBadgeLabelDark]}>Status</Text>
                                                <Text style={[styles.heroBadgeValue, isDarkMode && styles.heroBadgeValueDark]}>{getDisplayValue(selectedItem.status)}</Text>
                                            </View>
                                            <View style={[styles.heroBadge, isDarkMode && styles.heroBadgeDark, isCompactViewport && styles.heroBadgeCompact]}>
                                                <Text style={[styles.heroBadgeLabel, isDarkMode && styles.heroBadgeLabelDark]}>Bereich</Text>
                                                <Text style={[styles.heroBadgeValue, isDarkMode && styles.heroBadgeValueDark]}>{getDisplayValue(selectedItem.bereich)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Surface>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Stammdaten</Text>
                                    <View style={[styles.sectionLine, isDarkMode && styles.sectionLineDark]} />
                                </View>
                                <View style={styles.detailGrid}>
                                    <DetailRow label="Status" value={getDisplayValue(selectedItem.status)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Hersteller" value={getDisplayValue(selectedItem.hersteller)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Objekttyp" value={getDisplayValue(selectedItem.objekttyp)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Modell" value={getDisplayValue(selectedItem.modell)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Bereich" value={getDisplayValue(selectedItem.bereich)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Standort" value={getDisplayValue(selectedItem.standort)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Kategorie" value={getDisplayValue(selectedItem.kategorie)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Verantwortlicher" value={getDisplayValue(selectedItem.verantwortlicher)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Zusatzdaten</Text>
                                    <View style={[styles.sectionLine, isDarkMode && styles.sectionLineDark]} />
                                </View>
                                <View style={styles.detailGrid}>
                                    <DetailRow label="Kaufdatum" value={formatDate(selectedItem.kaufdatum)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Einkaufspreis" value={formatCurrency(selectedItem.einkaufspreis)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Zustandshinweis" value={getDisplayValue(selectedItem.zustandshinweis)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow label="Seriennummer" value={getDisplayValue(selectedItem.seriennummer)} isDarkMode={isDarkMode} compact={isCompactViewport} />
                                    <DetailRow
                                        label="Foto"
                                        value={selectedItem.geraeteFoto ? "Vorhanden" : "Nicht gesetzt"}
                                        isDarkMode={isDarkMode}
                                        compact={isCompactViewport}
                                    />
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Dokumente</Text>
                                    <View style={[styles.sectionLine, isDarkMode && styles.sectionLineDark]} />
                                </View>
                                <Surface style={[styles.attachmentCard, isDarkMode && styles.attachmentCardDark]}>
                                    {attachments.length === 0 ? (
                                        <Text style={[styles.emptyAttachmentText, isDarkMode && styles.emptyAttachmentTextDark]}>Noch keine Dokumente hinterlegt.</Text>
                                    ) : (
                                        attachments.map((attachment) => (
                                            <View key={attachment.id} style={[styles.attachmentRow, isDarkMode && styles.attachmentRowDark, isCompactViewport && styles.attachmentRowCompact]}>
                                                <View style={styles.attachmentMeta}>
                                                    <Text style={[styles.attachmentName, isDarkMode && styles.attachmentNameDark]}>{attachment.name}</Text>
                                                    <Text style={[styles.attachmentInfo, isDarkMode && styles.attachmentInfoDark]}>
                                                        Hochgeladen am {attachment.uploadedAt.toLocaleDateString("de-DE")}
                                                    </Text>
                                                </View>
                                                <View style={styles.attachmentActions}>
                                                    <Button mode="text" onPress={() => void openAttachment(attachment.file)}>
                                                        Öffnen
                                                    </Button>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </Surface>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Verlauf</Text>
                                    <View style={[styles.sectionLine, isDarkMode && styles.sectionLineDark]} />
                                    <Button
                                        mode="text"
                                        compact
                                        onPress={() => setIsHistoryExpanded((current) => !current)}
                                        contentStyle={styles.historyToggleContent}
                                        labelStyle={styles.historyToggleLabel}
                                    >
                                        {isHistoryExpanded ? "Ausblenden" : "Anzeigen"}
                                    </Button>
                                </View>
                                {isHistoryExpanded && (
                                    <Surface style={[styles.attachmentCard, isDarkMode && styles.attachmentCardDark]}>
                                        {groupedHistoryEntries.length === 0 ? (
                                            <Text style={styles.emptyAttachmentText}>Noch keine Verlaufseinträge vorhanden.</Text>
                                        ) : (
                                            groupedHistoryEntries.map((group) => (
                                                <View key={group.key} style={[styles.historyGroupCard, isDarkMode && styles.historyGroupCardDark]}>
                                                    <View style={[styles.historyGroupHeader, isCompactViewport && styles.historyGroupHeaderCompact]}>
                                                        <Text style={[styles.historyGroupTitle, isDarkMode && styles.historyGroupTitleDark]}>
                                                            {getHistoryGroupTitle(group.aktion, group.entries.length)}
                                                        </Text>
                                                        <Text style={[styles.historyGroupTimestamp, isDarkMode && styles.historyGroupTimestampDark]}>
                                                            {new Date(group.erstellt_am).toLocaleString("de-DE")}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.historyEntryList}>
                                                        {group.entries.map((entry) => (
                                                            <Text key={entry.id} style={[styles.historyEntryText, isDarkMode && styles.historyEntryTextDark]}>
                                                                {getHistoryDescription(entry)}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                </View>
                                            ))
                                        )}
                                    </Surface>
                                )}
                            </View>

                            <View style={[styles.buttonRow, isCompactViewport && styles.buttonRowCompact]}>
                                {canManageInventory && (
                                    <>
                                        <Button
                                            mode="outlined"
                                            onPress={() => onEdit({
                                                ...selectedItem,
                                                attachments,
                                            })}
                                            style={styles.button}
                                        >
                                            Bearbeiten
                                        </Button>
                                        <Button
                                            mode="outlined"
                                            onPress={() => void confirmDelete(selectedItem)}
                                            style={styles.deleteButton}
                                            textColor="#b3261e"
                                        >
                                            Löschen
                                        </Button>
                                    </>
                                )}
                                <Button
                                    mode="contained"
                                    onPress={onDismiss}
                                    style={styles.button}
                                >
                                    Schließen
                                </Button>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </Modal>
        </PaperPortal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: "#ffffff",
        padding: 22,
        borderRadius: 18,
        margin: 16,
        maxHeight: "90%",
        width: Platform.OS === "web" ? "96%" : undefined,
        maxWidth: Platform.OS === "web" ? 1080 : undefined,
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "#e8e8e8",
    },
    modalContainerDark: {
        backgroundColor: "#151a22",
        borderColor: "#263140",
    },
    modalContainerCompact: {
        margin: 8,
        padding: 14,
        width: undefined,
        maxWidth: undefined,
        alignSelf: "stretch",
        maxHeight: "94%",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#151515",
    },
    titleDark: {
        color: "#f3f4f6",
    },
    subtitle: {
        fontSize: 14,
        color: "#6a6a6a",
        marginBottom: 18,
    },
    heroCard: {
        padding: 20,
        borderRadius: 18,
        marginBottom: 20,
        backgroundColor: "#f7f8fa",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    heroCardDark: {
        backgroundColor: "#0f141b",
        borderColor: "#263140",
    },
    heroContent: {
        flexDirection: Platform.OS === "web" ? "row" : "column",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
    },
    heroContentCompact: {
        flexDirection: "column",
        alignItems: "stretch",
        gap: 16,
    },
    imageFrame: {
        padding: 10,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e4e6ea",
    },
    imageFrameDark: {
        backgroundColor: "#11161d",
        borderColor: "#334155",
    },
    image: {
        width: 220,
        height: 220,
        borderRadius: 14,
        backgroundColor: "#ffffff",
    },
    imageWrapper: {
        width: 220,
        height: 220,
        borderRadius: 14,
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
    },
    imageLoadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "rgba(255, 255, 255, 0.82)",
    },
    imageLoadingOverlayDark: {
        backgroundColor: "rgba(17, 22, 29, 0.78)",
    },
    imageLoadingText: {
        color: "#5f6b78",
        fontSize: 12,
    },
    imageLoadingTextDark: {
        color: "#d6dbe3",
    },
    imagePlaceholder: {
        width: 220,
        height: 220,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#d7dbe1",
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
    },
    imagePlaceholderDark: {
        backgroundColor: "#11161d",
        borderColor: "#334155",
    },
    imagePlaceholderText: {
        color: "#737983",
    },
    imagePlaceholderTextDark: {
        color: "#9aa4b2",
    },
    heroMeta: {
        gap: 6,
        flex: 1,
        width: Platform.OS === "web" ? undefined : "100%",
    },
    heroMetaCompact: {
        width: "100%",
    },
    heroTitle: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#222222",
    },
    heroTitleCompact: {
        fontSize: 22,
        lineHeight: 28,
    },
    heroTitleDark: {
        color: "#f3f4f6",
    },
    heroSubtitle: {
        fontSize: 14,
        color: "#61656d",
        marginBottom: 8,
    },
    heroSubtitleDark: {
        color: "#9aa4b2",
    },
    heroBadgeRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        marginTop: 10,
    },
    heroBadge: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: "#ffffff",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e2e5ea",
        minWidth: 140,
    },
    heroBadgeCompact: {
        minWidth: 0,
        flexBasis: "100%",
    },
    heroBadgeDark: {
        backgroundColor: "#11161d",
        borderColor: "#334155",
    },
    heroBadgeLabel: {
        fontSize: 12,
        color: "#70757d",
        marginBottom: 2,
    },
    heroBadgeLabelDark: {
        color: "#9aa4b2",
    },
    heroBadgeValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1f2328",
    },
    heroBadgeValueDark: {
        color: "#f3f4f6",
    },
    section: {
        marginBottom: 18,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#222222",
    },
    sectionTitleDark: {
        color: "#f3f4f6",
    },
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e5e7eb",
    },
    sectionLineDark: {
        backgroundColor: "#263140",
    },
    detailGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    detailItem: {
        width: Platform.OS === "web" ? "49%" : "100%",
        marginBottom: 12,
    },
    detailItemCompact: {
        width: "100%",
    },
    detailCard: {
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e7e9ee",
    },
    detailCardDark: {
        backgroundColor: "#0f141b",
        borderColor: "#263140",
    },
    cardLabel: {
        fontSize: 12,
        color: "#6f7680",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    cardLabelDark: {
        color: "#9aa4b2",
    },
    cardValue: {
        fontSize: 16,
        color: "#1d232a",
        fontWeight: "500",
    },
    cardValueDark: {
        color: "#f3f4f6",
    },
    cardValueMuted: {
        color: "#9096a0",
        fontWeight: "400",
    },
    attachmentCard: {
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e7e9ee",
        gap: 12,
    },
    attachmentCardDark: {
        backgroundColor: "#0f141b",
        borderColor: "#263140",
    },
    emptyAttachmentText: {
        color: "#6f7680",
    },
    emptyAttachmentTextDark: {
        color: "#9aa4b2",
    },
    attachmentRow: {
        flexDirection: Platform.OS === "web" ? "row" : "column",
        justifyContent: "space-between",
        alignItems: Platform.OS === "web" ? "center" : "flex-start",
        gap: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#f0f2f5",
    },
    attachmentRowCompact: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    attachmentRowDark: {
        borderBottomColor: "#263140",
    },
    attachmentMeta: {
        flex: 1,
        gap: 4,
    },
    attachmentName: {
        fontSize: 15,
        fontWeight: "500",
        color: "#1d232a",
    },
    attachmentNameDark: {
        color: "#f3f4f6",
    },
    attachmentInfo: {
        color: "#6f7680",
        fontSize: 13,
    },
    attachmentInfoDark: {
        color: "#9aa4b2",
    },
    attachmentActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    historyToggleContent: {
        minHeight: 32,
    },
    historyToggleLabel: {
        fontSize: 13,
    },
    historyGroupCard: {
        borderWidth: 1,
        borderColor: "#edf0f4",
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        padding: 14,
        gap: 10,
    },
    historyGroupCardDark: {
        backgroundColor: "#11161d",
        borderColor: "#263140",
    },
    historyGroupHeader: {
        flexDirection: Platform.OS === "web" ? "row" : "column",
        justifyContent: "space-between",
        alignItems: Platform.OS === "web" ? "center" : "flex-start",
        gap: 6,
    },
    historyGroupHeaderCompact: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    historyGroupTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1d232a",
    },
    historyGroupTitleDark: {
        color: "#f3f4f6",
    },
    historyGroupTimestamp: {
        color: "#6f7680",
        fontSize: 13,
    },
    historyGroupTimestampDark: {
        color: "#9aa4b2",
    },
    historyEntryList: {
        gap: 6,
    },
    historyEntryText: {
        fontSize: 14,
        color: "#2a3138",
        lineHeight: 20,
    },
    historyEntryTextDark: {
        color: "#d6dbe3",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
    },
    buttonRowCompact: {
        flexDirection: "column",
    },
    button: {
        marginTop: 8,
        flex: 1,
    },
    deleteButton: {
        marginTop: 8,
        flex: 1,
        borderColor: "#b3261e",
    },
});

export default DetailModal;
