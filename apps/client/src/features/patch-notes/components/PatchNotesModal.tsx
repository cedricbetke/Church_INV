import React from "react";
import { Linking, ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, Modal, Text } from "react-native-paper";
import { patchNotesData } from "@/src/features/patch-notes/data/patchNotes";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

interface PatchNotesModalProps {
    visible: boolean;
    onDismiss: () => void;
}

const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
};

const openIssueLink = async (url: string) => {
    try {
        await Linking.openURL(url);
    } catch (error) {
        console.error("Issue-Link konnte nicht geöffnet werden:", error);
    }
};

const PatchNotesModal: React.FC<PatchNotesModalProps> = ({ visible, onDismiss }) => {
    const { isDarkMode } = useAppThemeMode();
    const latestEntry = patchNotesData.entries[0];

    return (
        <Modal
            visible={visible}
            onDismiss={onDismiss}
            contentContainerStyle={[styles.modal, isDarkMode && styles.modalDark]}
        >
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text variant="headlineSmall" style={[styles.title, isDarkMode && styles.titleDark]}>
                        Patch Notes
                    </Text>
                    <Text variant="bodyMedium" style={[styles.subtleText, isDarkMode && styles.subtleTextDark]}>
                        Neu in {patchNotesData.app}. Die neuesten Änderungen stehen oben.
                    </Text>
                </View>

                <View style={[styles.latestCard, isDarkMode && styles.latestCardDark]}>
                    <Text variant="labelMedium" style={[styles.latestLabel, isDarkMode && styles.latestLabelDark]}>
                        Aktuell
                    </Text>
                    <Text variant="titleLarge" style={[styles.latestVersion, isDarkMode && styles.titleDark]}>
                        Version {latestEntry.version}
                    </Text>
                    <Text variant="bodyMedium" style={[styles.subtleText, isDarkMode && styles.subtleTextDark]}>
                        {latestEntry.title} - {formatDate(latestEntry.date)}
                    </Text>
                </View>

                <View style={styles.entries}>
                    {patchNotesData.entries.map((entry, index) => (
                        <View
                            key={`${entry.version}-${entry.date}`}
                            style={[styles.entryCard, isDarkMode && styles.entryCardDark]}
                        >
                            <View style={styles.entryHeader}>
                                <Text variant="titleMedium" style={[styles.entryTitle, isDarkMode && styles.titleDark]}>
                                    {entry.title}
                                </Text>
                                <Text variant="bodySmall" style={[styles.subtleText, isDarkMode && styles.subtleTextDark]}>
                                    Version {entry.version} - {formatDate(entry.date)}
                                </Text>
                            </View>

                            <Text variant="bodyMedium" style={[styles.summary, isDarkMode && styles.summaryDark]}>
                                {entry.summary}
                            </Text>

                            {entry.issueUrl ? (
                                <Button
                                    mode="text"
                                    compact
                                    onPress={() => void openIssueLink(entry.issueUrl!)}
                                    contentStyle={styles.issueButtonContent}
                                    style={styles.issueButton}
                                    labelStyle={styles.issueButtonLabel}
                                >
                                    {entry.issueLabel ?? "Issue öffnen"}
                                </Button>
                            ) : null}

                            <View style={styles.itemList}>
                                {entry.items.map((item) => (
                                    <View key={item} style={styles.itemRow}>
                                        <View style={[styles.dot, isDarkMode && styles.dotDark]} />
                                        <Text
                                            variant="bodyMedium"
                                            style={[styles.itemText, isDarkMode && styles.itemTextDark]}
                                        >
                                            {item}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            {index < patchNotesData.entries.length - 1 && (
                                <Divider style={[styles.divider, isDarkMode && styles.dividerDark]} />
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Button mode="outlined" onPress={onDismiss}>
                        Schlie\u00dfen
                    </Button>
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        backgroundColor: "#ffffff",
        margin: 20,
        borderRadius: 20,
        maxHeight: "88%",
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    modalDark: {
        backgroundColor: "#151a22",
        borderColor: "#263140",
    },
    content: {
        padding: 22,
        gap: 18,
    },
    header: {
        gap: 6,
    },
    title: {
        color: "#111827",
        fontWeight: "700",
    },
    titleDark: {
        color: "#f4f7fb",
    },
    subtleText: {
        color: "#6b7280",
    },
    subtleTextDark: {
        color: "#94a3b8",
    },
    latestCard: {
        padding: 18,
        borderRadius: 18,
        backgroundColor: "#f7f9fc",
        borderWidth: 1,
        borderColor: "#e4e9f0",
        gap: 4,
    },
    latestCardDark: {
        backgroundColor: "#10161f",
        borderColor: "#263140",
    },
    latestLabel: {
        color: "#0f5ea8",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    latestLabelDark: {
        color: "#8dc9ff",
    },
    latestVersion: {
        fontWeight: "700",
    },
    entries: {
        gap: 12,
    },
    entryCard: {
        padding: 18,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e8ecf2",
        gap: 12,
    },
    entryCardDark: {
        backgroundColor: "#10161f",
        borderColor: "#263140",
    },
    entryHeader: {
        gap: 4,
    },
    entryTitle: {
        fontWeight: "600",
    },
    summary: {
        color: "#374151",
        lineHeight: 21,
    },
    summaryDark: {
        color: "#d3dbe6",
    },
    issueButton: {
        alignSelf: "flex-start",
        marginLeft: -8,
        marginTop: -4,
    },
    issueButtonContent: {
        paddingHorizontal: 0,
    },
    issueButtonLabel: {
        color: "#0f5ea8",
        fontWeight: "700",
    },
    itemList: {
        gap: 8,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 999,
        backgroundColor: "#0f5ea8",
        marginTop: 7,
    },
    dotDark: {
        backgroundColor: "#8dc9ff",
    },
    itemText: {
        flex: 1,
        color: "#1f2937",
        lineHeight: 21,
    },
    itemTextDark: {
        color: "#e5edf7",
    },
    divider: {
        marginTop: 4,
        backgroundColor: "#edf1f6",
    },
    dividerDark: {
        backgroundColor: "#202938",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 4,
    },
});

export default PatchNotesModal;
