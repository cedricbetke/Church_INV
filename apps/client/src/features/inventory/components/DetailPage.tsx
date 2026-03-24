import React from 'react';
import { Modal, Portal as PaperPortal, Button, Surface } from 'react-native-paper';
import { Image, Text, ScrollView, View, StyleSheet, Platform } from 'react-native';
import InventoryItem from '@/src/features/inventory/types/InventoryItem';
import { Column } from './dataTable';

interface DetailModalProps {
    visible: boolean;
    onDismiss: () => void;
    selectedItem: InventoryItem | null;
    columns: Column[];
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

const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <Surface style={styles.detailCard}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardValue}>{value}</Text>
    </Surface>
);

const DetailModal: React.FC<DetailModalProps> = ({ visible, onDismiss, selectedItem }) => {
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

                            <Surface style={styles.heroCard}>
                                <View style={styles.heroContent}>
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
                                <Text style={styles.sectionTitle}>Stammdaten</Text>
                                <View style={styles.detailGrid}>
                                    <DetailRow label="Status" value={getDisplayValue(selectedItem.status)} />
                                    <DetailRow label="Modell" value={getDisplayValue(selectedItem.modell)} />
                                    <DetailRow label="Bereich" value={getDisplayValue(selectedItem.bereich)} />
                                    <DetailRow label="Standort" value={getDisplayValue(selectedItem.standort)} />
                                    <DetailRow label="Kategorie" value={getDisplayValue(selectedItem.kategorie)} />
                                    <DetailRow label="Verantwortlicher" value={getDisplayValue(selectedItem.verantwortlicher)} />
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Zusatzdaten</Text>
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

                            <Button
                                mode="contained"
                                onPress={onDismiss}
                                style={styles.button}
                            >
                                Schließen
                            </Button>
                        </View>
                    )}
                </ScrollView>
            </Modal>
        </PaperPortal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        margin: 20,
        maxHeight: '90%',
        width: Platform.OS === 'web' ? 'min(1100px, 96vw)' : undefined,
        alignSelf: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 18,
    },
    heroCard: {
        padding: 18,
        borderRadius: 16,
        marginBottom: 22,
        backgroundColor: '#f6f3ee',
        elevation: 1,
        borderWidth: 1,
        borderColor: '#ebe3d6',
    },
    heroContent: {
        flexDirection: Platform.OS === 'web' ? 'row' : 'column',
        alignItems: 'center',
        gap: 20,
    },
    image: {
        width: 220,
        height: 220,
        borderRadius: 12,
        backgroundColor: '#ffffff',
    },
    imagePlaceholder: {
        width: 220,
        height: 220,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#d8cdbb',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
    },
    imagePlaceholderText: {
        color: '#7a6f62',
    },
    heroMeta: {
        gap: 4,
        flex: 1,
        width: Platform.OS === 'web' ? undefined : '100%',
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#222222',
    },
    heroSubtitle: {
        fontSize: 14,
        color: '#6b6258',
        marginBottom: 8,
    },
    heroBadgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 6,
    },
    heroBadge: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#ffffff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eadfce',
        minWidth: 140,
    },
    heroBadgeLabel: {
        fontSize: 12,
        color: '#7b7064',
        marginBottom: 2,
    },
    heroBadgeValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2f2a24',
    },
    section: {
        marginBottom: 22,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: '#333333',
        marginBottom: 12,
    },
    detailGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    detailCard: {
        padding: 14,
        borderRadius: 12,
        backgroundColor: '#ffffff',
        elevation: 1,
        width: Platform.OS === 'web' ? '49%' : '100%',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#efefef',
    },
    cardLabel: {
        fontSize: 13,
        color: '#666666',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 16,
        color: '#222222',
    },
    button: {
        marginTop: 10,
        borderRadius: 5,
    },
});

export default DetailModal;
