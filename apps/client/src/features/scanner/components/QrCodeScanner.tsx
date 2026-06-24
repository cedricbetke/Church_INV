import { CameraView, useCameraPermissions } from "expo-camera";
import { StyleSheet, View } from "react-native";
import { useMemo, useState } from "react";
import { Button, Text } from "react-native-paper";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";
import { canUseQrScannerInCurrentContext } from "@/src/features/scanner/utils/scannerAvailability";

type CameraProps = {
    setShowModal: (value: boolean) => void;
    onScan: (value: string) => void;
};

const QrCodeScanner: React.FC<CameraProps> = ({ setShowModal, onScan }) => {
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const { isDarkMode } = useAppThemeMode();

    const isSecureWebContext = useMemo(canUseQrScannerInCurrentContext, []);

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            onScan(data);

            // Close slightly after the scan callback so the parent can resolve the device first
            // without immediately tearing down the camera on repeated detections.
            setTimeout(() => {
                setShowModal(false);
                setScanned(false);
            }, 500);
        }
    };

    if (!isSecureWebContext) {
        return (
            <View style={[styles.stateContainer, isDarkMode && styles.stateContainerDark]}>
                <Text variant="titleMedium" style={[styles.stateTitle, isDarkMode && styles.stateTitleDark]}>
                    Kamera im Browser nicht verfügbar
                </Text>
                <Text style={[styles.stateText, isDarkMode && styles.stateTextDark]}>
                    Auf mobilen Browsern funktioniert der Scanner meist nur in einem sicheren Kontext
                    wie HTTPS oder localhost. Über eine normale LAN-HTTP-URL wird die Kamera oft blockiert.
                </Text>
                <Button mode="contained" onPress={() => setShowModal(false)}>
                    Schließen
                </Button>
            </View>
        );
    }

    if (!permission) {
        return (
            <View style={[styles.stateContainer, isDarkMode && styles.stateContainerDark]}>
                <Text variant="titleMedium" style={[styles.stateTitle, isDarkMode && styles.stateTitleDark]}>
                    Kamera wird vorbereitet
                </Text>
                <Text style={[styles.stateText, isDarkMode && styles.stateTextDark]}>Bitte einen Moment warten.</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[styles.stateContainer, isDarkMode && styles.stateContainerDark]}>
                <Text variant="titleMedium" style={[styles.stateTitle, isDarkMode && styles.stateTitleDark]}>
                    Kamerazugriff erforderlich
                </Text>
                <Text style={[styles.stateText, isDarkMode && styles.stateTextDark]}>
                    Für den QR-/Barcode-Scanner muss der Browser Zugriff auf die Kamera erhalten.
                </Text>
                <View style={styles.actions}>
                    <Button mode="outlined" onPress={() => setShowModal(false)}>
                        Abbrechen
                    </Button>
                    <Button mode="contained" onPress={() => void requestPermission()}>
                        Kamera erlauben
                    </Button>
                </View>
            </View>
        );
    }

    return (
        <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
    );
};

const styles = StyleSheet.create({
    stateContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        padding: 24,
        gap: 14,
    },
    stateContainerDark: {
        backgroundColor: "#151922",
    },
    stateTitle: {
        color: "#1d1d1f",
        textAlign: "center",
    },
    stateTitleDark: {
        color: "#f4f7fb",
    },
    stateText: {
        textAlign: "center",
        color: "#445160",
        maxWidth: 420,
        lineHeight: 21,
    },
    stateTextDark: {
        color: "#dbe6f5",
    },
    actions: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 12,
        marginTop: 8,
    },
});

export default QrCodeScanner;


