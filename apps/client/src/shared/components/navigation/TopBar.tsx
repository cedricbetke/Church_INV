import * as React from "react";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Button, HelperText, Modal, Portal, Text, TextInput } from "react-native-paper";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import MasterdataAdminModal from "@/src/features/masterdata/components/MasterdataAdminModal";

const TopBar = () => {
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showMasterdataModal, setShowMasterdataModal] = useState(false);
    const [adminPassword, setAdminPassword] = useState("");
    const [adminError, setAdminError] = useState<string | null>(null);

    const {
        setIsAddPageVisible,
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

        setAdminError("Passwort ist ungültig.");
    };

    const handleAdminLogout = () => {
        clearAdminSession();
        setAdminPassword("");
        setAdminError(null);
        setShowAdminModal(false);
    };

    return (
        <View>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => {}} />
                <Appbar.Content title="ChurchINV" titleStyle={styles.title} />
                <View style={[styles.adminBadge, isAdminSessionActive ? styles.adminBadgeActive : styles.adminBadgeInactive]}>
                    <Text style={[styles.adminBadgeText, isAdminSessionActive ? styles.adminBadgeTextActive : styles.adminBadgeTextInactive]}>
                        {isAdminSessionActive ? "Admin aktiv" : "Nur lesen"}
                    </Text>
                </View>
                {isAdminLoginConfigured && (
                    <Appbar.Action
                        icon={isAdminSessionActive ? "lock-open-outline" : "lock-outline"}
                        color="#445160"
                        onPress={() => setShowAdminModal(true)}
                    />
                )}
                {canManageInventory && (
                    <Appbar.Action
                        icon="database-cog-outline"
                        color="#445160"
                        onPress={() => setShowMasterdataModal(true)}
                    />
                )}
                {canManageInventory && (
                    <Appbar.Action icon="plus" color="#445160" onPress={() => setIsAddPageVisible(true)} />
                )}
            </Appbar.Header>
            <Portal>
                <Modal
                    visible={showAdminModal}
                    onDismiss={() => setShowAdminModal(false)}
                    contentContainerStyle={styles.adminModal}
                >
                    <View style={styles.adminContent}>
                        <Text variant="titleMedium">
                            {isAdminSessionActive ? "Admin angemeldet" : "Admin-Anmeldung"}
                        </Text>
                        <Text variant="bodyMedium" style={styles.adminText}>
                            {isAdminSessionActive
                                ? "Die Admin-Freigabe ist für diese Session aktiv."
                                : "Mit dem Admin-Passwort schaltest du Ändern und Löschen frei."}
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
    title: {
        color: "#111111",
        fontSize: 23,
        fontWeight: "700",
        letterSpacing: -0.35,
    },
    adminModal: {
        backgroundColor: "#ffffff",
        margin: 20,
        padding: 20,
        borderRadius: 14,
    },
    adminContent: {
        gap: 12,
    },
    adminText: {
        color: "#6e6e73",
    },
    adminBadge: {
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 5,
        marginRight: 8,
        borderWidth: 1,
    },
    adminBadgeActive: {
        backgroundColor: "#eef6ee",
        borderColor: "#cfe5cf",
    },
    adminBadgeInactive: {
        backgroundColor: "#f0f1f3",
        borderColor: "#e0e2e6",
    },
    adminBadgeText: {
        fontSize: 11,
        fontWeight: "600",
        letterSpacing: 0.1,
    },
    adminBadgeTextActive: {
        color: "#2d6a36",
    },
    adminBadgeTextInactive: {
        color: "#6e6e73",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
});

export default TopBar;
