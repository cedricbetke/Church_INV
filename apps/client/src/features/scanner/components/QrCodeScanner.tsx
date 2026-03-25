import { CameraView, useCameraPermissions } from "expo-camera";
import { StyleSheet, View } from "react-native";
import { useMemo, useState } from "react";
import { Button, Text } from "react-native-paper";

type CameraProps = {
    setShowModal: (value: boolean) => void;
};

const QrCodeScanner: React.FC<CameraProps> = ({ setShowModal }) => {
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const isSecureWebContext = useMemo(() => {
        if (typeof window === "undefined") {
            return true;
        }

        return window.isSecureContext;
    }, []);

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true);
            console.log("data", data);

            setTimeout(() => {
                setShowModal(false);
                setScanned(false);
            }, 500);
        }
    };

    if (!isSecureWebContext) {
        return (
            <View style={styles.stateContainer}>
                <Text variant="titleMedium">Kamera im Browser nicht verfuegbar</Text>
                <Text style={styles.stateText}>
                    Auf mobilen Browsern funktioniert der Scanner meist nur in einem sicheren Kontext
                    wie HTTPS oder localhost. Ueber eine normale LAN-HTTP-URL wird die Kamera oft blockiert.
                </Text>
                <Button mode="contained" onPress={() => setShowModal(false)}>
                    Schliessen
                </Button>
            </View>
        );
    }

    if (!permission) {
        return (
            <View style={styles.stateContainer}>
                <Text variant="titleMedium">Kamera wird vorbereitet</Text>
                <Text style={styles.stateText}>Bitte einen Moment warten.</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.stateContainer}>
                <Text variant="titleMedium">Kamerazugriff erforderlich</Text>
                <Text style={styles.stateText}>
                    Fuer den QR-Scanner muss der Browser Zugriff auf die Kamera erhalten.
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
        padding: 24,
        gap: 14,
    },
    stateText: {
        textAlign: "center",
        color: "#5f6368",
        maxWidth: 420,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
});

export default QrCodeScanner;
