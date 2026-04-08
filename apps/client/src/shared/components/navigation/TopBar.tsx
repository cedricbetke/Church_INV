import * as React from "react";
import { useState } from "react";
import { router } from "expo-router";
import { Image, Linking, StyleSheet, View, useWindowDimensions } from "react-native";
import { Appbar, Button, HelperText, Modal, Portal, Text, TextInput, Tooltip } from "react-native-paper";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import MasterdataAdminModal from "@/src/features/masterdata/components/MasterdataAdminModal";
import { patchNotesData } from "@/src/features/patch-notes/data/patchNotes";
import PatchNotesModal from "@/src/features/patch-notes/components/PatchNotesModal";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

const CHURCHINV_LOGO = require("../../../../assets/images/churchinv-header-icon.png");
const BUG_ISSUE_URL =
    "https://github.com/cedricbetke/Church_INV/issues/new?labels=bug&title=Bug%3A%20&body=Bitte%20hier%20kurz%20beschreiben%3A%0A%0A-%20Was%20ist%20kaputt%20oder%20unerwartet%3F%0A-%20Wie%20kann%20man%20es%20nachstellen%3F%0A-%20Auf%20welcher%20Ansicht%20oder%20welchem%20Geraet%20passiert%20es%3F%0A";
const FEATURE_ISSUE_URL =
    "https://github.com/cedricbetke/Church_INV/issues/new?labels=enhancement&title=Feature%3A%20&body=Bitte%20hier%20kurz%20beschreiben%3A%0A%0A-%20Was%20wuenschst%20du%20dir%3F%0A-%20Welches%20Problem%20wuerde%20das%20loesen%3F%0A-%20Wie%20sollte%20es%20sich%20verhalten%3F%0A";
const CURRENT_VERSION = patchNotesData.entries[0]?.version ?? "0.0.0";

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

        setAdminError("Passwort ist ung\u00fcltig.");
    };

    const handleAdminLogout = () => {
        clearAdminSession();
        setAdminPassword("");
        setAdminError(null);
        setShowAdminModal(false);
    };

    const handleOpenBugReport = () => {
        void Linking.openURL(BUG_ISSUE_URL);
    };

    const handleOpenFeatureRequest = () => {
        void Linking.openURL(FEATURE_ISSUE_URL);
    };

    const renderAction = (
        icon: string,
        tooltip: string,
        onPress: () => void,
        options?: { style?: object },
    ) => (
        <Tooltip
            title={tooltip}
            enterTouchDelay={350}
            leaveTouchDelay={50}
            theme={{
                roundness: 10,
                colors: {
                    onSurface: isDarkMode ? "#253041" : "#445160",
                    surface: isDarkMode ? "#dbe6f5" : "#f5f7fb",
                },
            }}
        >
            <Appbar.Action
                icon={icon}
                color={isDarkMode ? "#dbe6f5" : "#445160"}
                onPress={onPress}
                style={options?.style}
            />
        </Tooltip>
    );

    return (
        <View>
            <Appbar.Header style={[styles.header, isDarkMode && styles.headerDark, isCompactViewport && styles.headerCompact]}>
                <View style={styles.leftCluster}>
                    <View style={styles.titleStack}>
                        <View style={styles.brandRow}>
                            <Image
                                source={CHURCHINV_LOGO}
                                style={[styles.logo, isCompactViewport && styles.logoCompact]}
                                resizeMode="contain"
                            />
                            <View style={styles.wordmark}>
                                <Text style={[styles.wordmarkChurch, isDarkMode && styles.wordmarkChurchDark, isCompactViewport && styles.wordmarkChurchCompact]}>
                                    Church
                                </Text>
                                <Text style={[styles.wordmarkInv, isCompactViewport && styles.wordmarkInvCompact]}>
                                    INV
                                </Text>
                            </View>
                        </View>
                        {isCompactViewport ? (
                            <View style={[styles.betaBadge, styles.betaBadgeBelowTitle, isDarkMode && styles.betaBadgeDark]}>
                                <Text style={[styles.betaBadgeText, styles.betaBadgeTextCompact, isDarkMode && styles.betaBadgeTextDark]}>
                                    Beta
                                </Text>
                            </View>
                        ) : null}
                    </View>
                    {!isCompactViewport && (
                        <View style={[styles.betaBadge, isDarkMode && styles.betaBadgeDark]}>
                            <Text style={[styles.betaBadgeText, isDarkMode && styles.betaBadgeTextDark]}>
                                {`Beta ${CURRENT_VERSION}`}
                            </Text>
                        </View>
                    )}
                    {!isCompactViewport && (
                        <>
                            {renderAction("text-box-outline", "Patch Notes", () => setShowPatchNotesModal(true), {
                                style: styles.leftClusterAction,
                            })}
                            {renderAction("bug-outline", "Bug", handleOpenBugReport, {
                                style: styles.leftClusterAction,
                            })}
                            {renderAction("lightbulb-outline", "Feature", handleOpenFeatureRequest, {
                                style: styles.leftClusterAction,
                            })}
                        </>
                    )}
                </View>
                <View style={styles.headerSpacer} />
                {!isCompactViewport && (
                    <View
                        style={[
                            styles.adminBadge,
                            isAdminSessionActive ? styles.adminBadgeActive : styles.adminBadgeInactive,
                            isDarkMode && (isAdminSessionActive ? styles.adminBadgeActiveDark : styles.adminBadgeInactiveDark),
                        ]}
                    >
                        <Text
                            style={[
                                styles.adminBadgeText,
                                isAdminSessionActive ? styles.adminBadgeTextActive : styles.adminBadgeTextInactive,
                                isDarkMode && (isAdminSessionActive ? styles.adminBadgeTextActiveDark : styles.adminBadgeTextInactiveDark),
                            ]}
                        >
                            {isAdminSessionActive ? "Admin aktiv" : "Nur lesen"}
                        </Text>
                    </View>
                )}
                <View style={styles.rightCluster}>
                    {canManageInventory && (
                        renderAction("calendar-plus", "Buchungen", () => router.push("/bookings"))
                    )}
                    {renderAction(isDarkMode ? "weather-sunny" : "moon-waning-crescent", isDarkMode ? "Hell" : "Dunkel", toggleTheme)}
                    {isAdminLoginConfigured && (
                        renderAction(
                            isAdminSessionActive ? "lock-open-outline" : "lock-outline",
                            isAdminSessionActive ? "Admin aus" : "Admin an",
                            () => setShowAdminModal(true),
                        )
                    )}
                    {canManageInventory && (
                        renderAction("database-cog-outline", "Stammdaten", () => setShowMasterdataModal(true))
                    )}
                    {canManageInventory && !isCompactViewport && (
                        renderAction("plus", "Neu", () => setIsAddPageVisible(true))
                    )}
                </View>
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
    leftCluster: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    titleStack: {
        justifyContent: "center",
        gap: 2,
    },
    brandRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    logo: {
        width: 36,
        height: 36,
    },
    logoCompact: {
        width: 32,
        height: 32,
    },
    wordmark: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    wordmarkChurch: {
        color: "#222328",
        fontSize: 21,
        fontWeight: "800",
        letterSpacing: -0.55,
    },
    wordmarkChurchCompact: {
        fontSize: 18,
    },
    wordmarkChurchDark: {
        color: "#f3f5f9",
    },
    wordmarkInv: {
        color: "#1677ff",
        fontSize: 21,
        fontWeight: "800",
        letterSpacing: -0.55,
    },
    wordmarkInvCompact: {
        fontSize: 18,
    },
    leftClusterAction: {
        marginLeft: 2,
        marginRight: 0,
    },
    betaBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 999,
        backgroundColor: "#eef2ff",
        borderWidth: 1,
        borderColor: "#d9e0ff",
    },
    betaBadgeBelowTitle: {
        alignSelf: "flex-start",
        paddingHorizontal: 6,
        paddingVertical: 1,
    },
    betaBadgeDark: {
        backgroundColor: "#1b2740",
        borderColor: "#334c79",
    },
    betaBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#4f46e5",
        letterSpacing: 0.3,
        textTransform: "uppercase",
    },
    betaBadgeTextCompact: {
        fontSize: 10,
    },
    betaBadgeTextDark: {
        color: "#a5b4fc",
    },
    headerSpacer: {
        flex: 1,
        minWidth: 0,
    },
    rightCluster: {
        flexDirection: "row",
        alignItems: "center",
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

