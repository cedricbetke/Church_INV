import React from "react";
import { Modal, Portal as PaperPortal, Button, Surface, Text } from "react-native-paper";
import { Alert, Image, ScrollView, View, StyleSheet, Platform, Linking } from "react-native";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import { Column } from "./dataTable";

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

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.detailItem}>
        <Surface style={styles.detailCard}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={[styles.cardValue, isUnsetValue(value) && styles.cardValueMuted]}>{value}</Text>
        </Surface>
    </View>
);

const DetailModal: React.FC<DetailModalProps> = ({
    visible,
    onDismiss,
    selectedItem,
    canManageInventory,
    onEdit,
    onDelete,
}) => {
    const confirmDelete = async (item: InventoryItem) => {
        if (Platform.OS === "web") {
            if (globalThis.confirm(`Geraet ${item.invNr} wirklich loeschen?`)) {
                await onDelete(item);
            }
            return;
        }

        Alert.alert(
            "Geraet loeschen",
            `Geraet ${item.invNr} wirklich loeschen?`,
            [
                { text: "Abbrechen", style: "cancel" },
                {
                    text: "Loeschen",
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
                contentContainerStyle={styles.modalContainer}
            >
                <ScrollView>
                    {selectedItem && (
                        <View>
                            <Text style={styles.title}>
                                Details zu {selectedItem.invNr}
                            </Text>
                            <Text style={styles.subtitle}>Inventaruebersicht und aktuelle Zuordnung</Text>

                            <Surface style={styles.heroCard}>
                                <View style={styles.heroContent}>
                                    <View style={styles.imageFrame}>
                                        {selectedItem.geraeteFoto ? (
                                            <Image
                                                source={{ uri: selectedItem.geraeteFoto }}
                                                style={styles.image}
                                                resizeMode="contain"
                                            />
                                        ) : (
                                            <View style={styles.imagePlaceholder}>
                                                <Text style={styles.imagePlaceholderText}>Kein Foto hinterlegt</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.heroMeta}>
                                        <Text style={styles.heroTitle}>{selectedItem.modell}</Text>
                                        <Text style={styles.heroSubtitle}>
                                            Inventarnummer {selectedItem.invNr}
                                        </Text>
                                        <View style={styles.heroBadgeRow}>
                                            <View style={styles.heroBadge}>
                                                <Text style={styles.heroBadgeLabel}>Status</Text>
                                                <Text style={styles.heroBadgeValue}>{getDisplayValue(selectedItem.status)}</Text>
                                            </View>
                                            <View style={styles.heroBadge}>
                                                <Text style={styles.heroBadgeLabel}>Bereich</Text>
                                                <Text style={styles.heroBadgeValue}>{getDisplayValue(selectedItem.bereich)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </Surface>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Stammdaten</Text>
                                    <View style={styles.sectionLine} />
                                </View>
                                <View style={styles.detailGrid}>
                                    <DetailRow label="Status" value={getDisplayValue(selectedItem.status)} />
                                    <DetailRow label="Objekttyp" value={getDisplayValue(selectedItem.objekttyp)} />
                                    <DetailRow label="Modell" value={getDisplayValue(selectedItem.modell)} />
                                    <DetailRow label="Bereich" value={getDisplayValue(selectedItem.bereich)} />
                                    <DetailRow label="Standort" value={getDisplayValue(selectedItem.standort)} />
                                    <DetailRow label="Kategorie" value={getDisplayValue(selectedItem.kategorie)} />
                                    <DetailRow label="Verantwortlicher" value={getDisplayValue(selectedItem.verantwortlicher)} />
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Zusatzdaten</Text>
                                    <View style={styles.sectionLine} />
                                </View>
                                <View style={styles.detailGrid}>
                                    <DetailRow label="Kaufdatum" value={formatDate(selectedItem.kaufdatum)} />
                                    <DetailRow label="Einkaufspreis" value={formatCurrency(selectedItem.einkaufspreis)} />
                                    <DetailRow label="Seriennummer" value={getDisplayValue(selectedItem.seriennummer)} />
                                    <DetailRow
                                        label="Foto"
                                        value={selectedItem.geraeteFoto ? "Vorhanden" : "Nicht gesetzt"}
                                    />
                                </View>
                            </View>

                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Dokumente</Text>
                                    <View style={styles.sectionLine} />
                                </View>
                                <Surface style={styles.attachmentCard}>
                                    {selectedItem.attachments.length === 0 ? (
                                        <Text style={styles.emptyAttachmentText}>Noch keine Dokumente hinterlegt.</Text>
                                    ) : (
                                        selectedItem.attachments.map((attachment) => (
                                            <View key={attachment.id} style={styles.attachmentRow}>
                                                <View style={styles.attachmentMeta}>
                                                    <Text style={styles.attachmentName}>{attachment.name}</Text>
                                                    <Text style={styles.attachmentInfo}>
                                                        Hochgeladen am {attachment.uploadedAt.toLocaleDateString("de-DE")}
                                                    </Text>
                                                </View>
                                                <View style={styles.attachmentActions}>
                                                    <Button mode="text" onPress={() => void openAttachment(attachment.file)}>
                                                        Oeffnen
                                                    </Button>
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </Surface>
                            </View>

                            <View style={styles.buttonRow}>
                                {canManageInventory && (
                                    <>
                                        <Button
                                            mode="outlined"
                                            onPress={() => onEdit(selectedItem)}
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
                                            Loeschen
                                        </Button>
                                    </>
                                )}
                                <Button
                                    mode="contained"
                                    onPress={onDismiss}
                                    style={styles.button}
                                >
                                    Schliessen
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
    title: {
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 4,
        color: "#151515",
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
    heroContent: {
        flexDirection: Platform.OS === "web" ? "row" : "column",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
    },
    imageFrame: {
        padding: 10,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e4e6ea",
    },
    image: {
        width: 220,
        height: 220,
        borderRadius: 14,
        backgroundColor: "#ffffff",
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
    imagePlaceholderText: {
        color: "#737983",
    },
    heroMeta: {
        gap: 6,
        flex: 1,
        width: Platform.OS === "web" ? undefined : "100%",
    },
    heroTitle: {
        fontSize: 30,
        fontWeight: "bold",
        color: "#222222",
    },
    heroSubtitle: {
        fontSize: 14,
        color: "#61656d",
        marginBottom: 8,
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
    heroBadgeLabel: {
        fontSize: 12,
        color: "#70757d",
        marginBottom: 2,
    },
    heroBadgeValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1f2328",
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
    sectionLine: {
        flex: 1,
        height: 1,
        backgroundColor: "#e5e7eb",
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
    detailCard: {
        padding: 14,
        borderRadius: 12,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e7e9ee",
    },
    cardLabel: {
        fontSize: 12,
        color: "#6f7680",
        marginBottom: 4,
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
    cardValue: {
        fontSize: 16,
        color: "#1d232a",
        fontWeight: "600",
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
    emptyAttachmentText: {
        color: "#6f7680",
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
    attachmentMeta: {
        flex: 1,
        gap: 4,
    },
    attachmentName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1d232a",
    },
    attachmentInfo: {
        color: "#6f7680",
        fontSize: 13,
    },
    attachmentActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
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
