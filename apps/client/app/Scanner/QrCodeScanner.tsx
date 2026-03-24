import {CameraView} from "expo-camera";
import {StyleSheet} from "react-native";
import {useState} from "react";

type CameraProps = {
    setShowModal: (value: boolean) => void;
};

const MyComponent: React.FC<CameraProps> = ({ setShowModal }) => {
    const [scanned, setScanned] = useState(false); // ✅ Zustand, um Mehrfach-Scans zu verhindern
    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (!scanned) {
            setScanned(true); // Scanning deaktivieren
            console.log("data", data);

            // Kamera nach kurzer Verzögerung schließen (falls nötig)
            setTimeout(() => {
                setShowModal(false);
                setScanned(false); // Scanner zurücksetzen, falls Modal erneut geöffnet wird
            }, 500);
        }
    };

    return (
        <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned} // ✅ Event nur auslösen, wenn nicht gescannt wurde
        />
    );
};

export default MyComponent;