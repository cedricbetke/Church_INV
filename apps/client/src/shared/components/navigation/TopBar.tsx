import * as React from 'react';
import { Appbar, Button, HelperText, Modal, Portal, Text, TextInput } from 'react-native-paper';
import { StyleSheet, View } from "react-native";
import {useState} from "react";
import QrCodeScanner from "@/src/features/scanner/components/QrCodeScanner";
import {useInventory} from "@/src/features/inventory/context/InventoryContext";

const MyComponent = () => {
        const [showModal, setShowModal] = useState<boolean>(false);
        const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
        const [adminPassword, setAdminPassword] = useState("");
        const [adminError, setAdminError] = useState<string | null>(null);
        const {
            setIsAddPageVisible,
            canManageInventory,
            isAdminSessionActive,
            isAdminLoginConfigured,
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

            setAdminError("Passwort ist ungueltig.");
        };

        const handleAdminLogout = () => {
            clearAdminSession();
            setAdminPassword("");
            setAdminError(null);
            setShowAdminModal(false);
        };

        return (
            <View>
                    <Appbar.Header>
                            <Appbar.BackAction onPress={() => {
                            }}/>
                            <Appbar.Content title="ChurchINV"/>
                            <View style={[styles.adminBadge, isAdminSessionActive ? styles.adminBadgeActive : styles.adminBadgeInactive]}>
                                <Text style={[styles.adminBadgeText, isAdminSessionActive ? styles.adminBadgeTextActive : styles.adminBadgeTextInactive]}>
                                    {isAdminSessionActive ? "Admin aktiv" : "Nur lesen"}
                                </Text>
                            </View>
                            {isAdminLoginConfigured && (
                                <Appbar.Action
                                    icon={isAdminSessionActive ? "lock-open-outline" : "lock-outline"}
                                    onPress={() => setShowAdminModal(true)}
                                />
                            )}
                            {canManageInventory && (
                                <Appbar.Action icon="plus" onPress={() => setIsAddPageVisible(true)}/>
                            )}
                            <Appbar.Action icon="magnify" onPress={() => {
                            }}/>
                            <Appbar.Action icon="qrcode-scan" onPress={() => setShowModal(true)}/>
                            <Appbar.Action icon="filter" onPress={() => {}}/>
                    </Appbar.Header>
                <Portal>
                        <Modal visible={showModal} onDismiss={() => setShowModal(false)}>
                                <View style={styles.scannerModal}>
                                        <QrCodeScanner setShowModal = {setShowModal}></QrCodeScanner>
                                </View>
                        </Modal>
                        <Modal visible={showAdminModal} onDismiss={() => setShowAdminModal(false)} contentContainerStyle={styles.adminModal}>
                                <View style={styles.adminContent}>
                                        <Text variant="titleMedium">
                                                {isAdminSessionActive ? "Admin angemeldet" : "Admin-Anmeldung"}
                                        </Text>
                                        <Text variant="bodyMedium" style={styles.adminText}>
                                                {isAdminSessionActive
                                                    ? "Die Admin-Freigabe ist fuer diese Session aktiv."
                                                    : "Mit dem Admin-Passwort schaltest du Aendern und Loeschen frei."}
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
                                                        Schliessen
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
                </Portal>
            </View>
);
}

const styles = StyleSheet.create({
    scannerModal: {
        height: 500,
        padding: 20,
    },
    adminModal: {
        backgroundColor: "#ffffff",
        margin: 20,
        padding: 20,
        borderRadius: 12,
    },
    adminContent: {
        gap: 12,
    },
    adminText: {
        color: "#5f6368",
    },
    adminBadge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 4,
        borderWidth: 1,
    },
    adminBadgeActive: {
        backgroundColor: "#e8f5e9",
        borderColor: "#81c784",
    },
    adminBadgeInactive: {
        backgroundColor: "#f5f5f5",
        borderColor: "#d0d0d0",
    },
    adminBadgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    adminBadgeTextActive: {
        color: "#256029",
    },
    adminBadgeTextInactive: {
        color: "#616161",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
});

export default MyComponent;
