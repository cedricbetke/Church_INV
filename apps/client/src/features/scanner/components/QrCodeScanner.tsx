import { CameraView } from "expo-camera";
import { StyleSheet } from "react-native";
import { useState } from "react";

type CameraProps = {
    setShowModal: (value: boolean) => void;
};

const QrCodeScanner: React.FC<CameraProps> = ({ setShowModal }) => {
    const [scanned, setScanned] = useState(false);

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

    return (
        <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        />
    );
};

export default QrCodeScanner;
