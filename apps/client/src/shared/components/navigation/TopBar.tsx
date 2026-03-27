import * as React from "react";
import { useState } from "react";
import { router } from "expo-router";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Appbar, Button, HelperText, Modal, Portal, Text, TextInput } from "react-native-paper";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import MasterdataAdminModal from "@/src/features/masterdata/components/MasterdataAdminModal";
import PatchNotesModal from "@/src/features/patch-notes/components/PatchNotesModal";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

const TopBar = () => {
    const { width } = useWindowDimensions();
    const isCompactViewport = width < 640;
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showMasterdataModal, setShowMasterdataModal] = useState(false);
    const [showPatchNotesModal, setShowPatchNotesModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [adminError, setAdminError] = useState<string | null>(null);
    const { isDarkMode, toggleTheme } = useAppThemeMode();

    const {
        canManageInventory,
        isAdminSessionActive,
        isAdminLoginConfigured,
        brands,
        objekttypen,
        models,
        addBrand,
        addObjectType,
        addModel,
        activateAdminSession,
        clearAdminSession,
    } = useInventory();

    const handleAdminLogin = () => {
        if (activateAdminSession(adminPassword)) {
            setAdminPassword("");
            setAdminError(null);
            setShowAdminModal(false);
            return;
        }

        setAdminError("Passwort ist ung\u00fcltig.");
    };

    const handleAdminLogout = () => {
        clearAdminSession();
        setAdminPassword("");
        setAdminError(null);
        setShowAdminModal(false);
    };

    return (
        <View>
            <Appbar.Header style={[styles.header, isDarkMode && styles.headerDark, isCompactViewport && styles.headerCompact]}>
                <Appbar.BackAction iconColor={isDarkMode ? "#dbe6f5" : "#445160"} onPress={() => {}} />
                <Appbar.Content title="ChurchINV" titleStyle={[styles.title, isDarkMode && styles.titleDark, isCompactViewport && styles.titleCompact]} />
                <View
                    style={[
                        styles.adminBadge,
                        isCompactViewport && styles.adminBadgeCompact,
                        isAdminSessionActive ? styles.adminBadgeActive : styles.adminBadgeInactive,
                        isDarkMode && (isAdminSessionActive ? styles.adminBadgeActiveDark : styles.adminBadgeInactiveDark),
                    ]}
                >
                    <Text
                        style={[
                            styles.adminBadgeText,
                            isCompactViewport && styles.adminBadgeTextCompact,
                            isAdminSessionActive ? styles.adminBadgeTextActive : styles.adminBadgeTextInactive,
                            isDarkMode && (isAdminSessionActive ? styles.adminBadgeTextActiveDark : styles.adminBadgeTextInactiveDark),
                        ]}
                    >
                        {isCompactViewport
                            ? (isAdminSessionActive ? "Admin" : "Lesen")
                            : (isAdminSessionActive ? "Admin aktiv" : "Nur lesen")}
                    </Text>
                </View>
                {!isCompactViewport && (
                    <Appbar.Action
                        icon="history"
                        color={isDarkMode ? "#dbe6f5" : "#445160"}
                        onPress={() => setShowPatchNotesModal(true)}
                    />
                )}
                {canManageInventory && (
                    <Appbar.Action
                        icon="calendar-plus"
                        color={isDarkMode ? "#dbe6f5" : "#445160"}
                        onPress={() => router.push("/bookings")}
                    />
                )}
                <Appbar.Action
                    icon={isDarkMode ? "weather-sunny" : "moon-waning-crescent"}
                    color={isDarkMode ? "#dbe6f5" : "#445160"}
                    onPress={toggleTheme}
                />
                {isAdminLoginConfigured && (
                    <Appbar.Action
                        icon={isAdminSessionActive ? "lock-open-outline" : "lock-outline"}
                        color={isDarkMode ? "#dbe6f5" : "#445160"}
                        onPress={() => setShowAdminModal(true)}
                    />
                )}
                {canManageInventory && (
                    <Appbar.Action
                        icon="database-cog-outline"
                        color={isDarkMode ? "#dbe6f5" : "#445160"}
                        onPress={() => setShowMasterdataModal(true)}
                    />
                )}
                {canManageInventory && !isCompactViewport && (
                    <Appbar.Action
                        icon="plus"
                        color={isDarkMode ? "#dbe6f5" : "#445160"}
                        onPress={() => setIsAddPageVisible(true)}
                    />
                )}
            </Appbar.Header>

            <Portal>
                <Modal
                    visible={showAdminModal}
                    onDismiss={() => setShowAdminModal(false)}
                    contentContainerStyle={[styles.adminModal, isDarkMode && styles.adminModalDark]}
                >
                    <View style={styles.adminContent}>
                        <Text variant="titleMedium" style={isDarkMode ? styles.adminTitleDark : undefined}>
                            {isAdminSessionActive ? "Admin angemeldet" : "Admin-Anmeldung"}
                        </Text>
                        <Text variant="bodyMedium" style={[styles.adminText, isDarkMode && styles.adminTextDark]}>
                            {isAdminSessionActive
                                ? "Die Admin-Freigabe ist f\u00fcr diese Session aktiv."
                                : "Mit dem Admin-Passwort schaltest du \u00c4ndern und L\u00f6schen frei."}
                        </Text>
                        {!isAdminSessionActive && (
                            <>
                                <TextInput
                                    mode="outlined"
                                    label="Admin-Passwort"
                                    value={adminPassword}
                                    onChangeText={(value) => {
                                        setAdminPassword(value);
                                        if (adminError) {
                                            setAdminError(null);
                                        }
                                    }}
                                    secureTextEntry
                                />
                                {adminError && <HelperText type="error">{adminError}</HelperText>}
                            </>
                        )}
                        <View style={styles.actionRow}>
                            <Button mode="outlined" onPress={() => setShowAdminModal(false)}>
                                Schließen
                            </Button>
                            {isAdminSessionActive ? (
                                <Button mode="contained" onPress={handleAdminLogout}>
                                    Abmelden
                                </Button>
                            ) : (
                                <Button mode="contained" onPress={handleAdminLogin}>
                                    Anmelden
                                </Button>
                            )}
                        </View>
                    </View>
                </Modal>

                {showMasterdataModal && (
                    <MasterdataAdminModal
                        visible={showMasterdataModal}
                        onDismiss={() => setShowMasterdataModal(false)}
                        brands={brands}
                        objekttypen={objekttypen}
                        models={models}
                        addBrand={addBrand}
                        addObjectType={addObjectType}
                        addModel={addModel}
                    />
                )}

                {showPatchNotesModal && (
                    <PatchNotesModal
                        visible={showPatchNotesModal}
                        onDismiss={() => setShowPatchNotesModal(false)}
                    />
                )}
            </Portal>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: "#f7f7f8",
        borderBottomWidth: 1,
        borderBottomColor: "#e7e7ea",
        elevation: 0,
        shadowOpacity: 0,
        paddingHorizontal: 8,
        minHeight: 68,
    },
    headerCompact: {
        paddingHorizontal: 4,
        minHeight: 60,
    },
    headerDark: {
        backgroundColor: "#121722",
        borderBottomColor: "#212938",
    },
    title: {
        color: "#111111",
        fontSize: 23,
        fontWeight: "700",
        letterSpacing: -0.35,
    },
    titleCompact: {
        fontSize: 19,
    },
    titleDark: {
        color: "#f5f7fb",
    },
    adminModal: {
        backgroundColor: "#ffffff",
        margin: 20,
        padding: 20,
        borderRadius: 14,
    },
    adminModalDark: {
        backgroundColor: "#151922",
    },
    adminContent: {
        gap: 12,
    },
    adminTitleDark: {
        color: "#f5f7fb",
    },
    adminText: {
        color: "#6e6e73",
    },
    adminTextDark: {
        color: "#a2adbb",
    },
    adminBadge: {
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 5,
        marginRight: 8,
        borderWidth: 1,
    },
    adminBadgeCompact: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 4,
    },
    adminBadgeActive: {
        backgroundColor: "#eef6ee",
        borderColor: "#cfe5cf",
    },
    adminBadgeActiveDark: {
        backgroundColor: "#173226",
        borderColor: "#28513c",
    },
    adminBadgeInactive: {
        backgroundColor: "#f0f1f3",
        borderColor: "#e0e2e6",
    },
    adminBadgeInactiveDark: {
        backgroundColor: "#1b2230",
        borderColor: "#2a3344",
    },
    adminBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.1,
    },
    adminBadgeTextCompact: {
        fontSize: 10,
    },
    adminBadgeTextActive: {
        color: "#2d6a36",
    },
    adminBadgeTextActiveDark: {
        color: "#b8e0c0",
    },
    adminBadgeTextInactive: {
        color: "#6e6e73",
    },
    adminBadgeTextInactiveDark: {
        color: "#a2adbb",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
});

export default TopBar;
