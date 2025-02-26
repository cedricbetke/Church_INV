import {CameraView} from "expo-camera";
import {StyleSheet} from "react-native";
import {useState} from "react";
type CameraProps = {
    setShowModal: (value: boolean)=>void;
};
const myComponent : React.FC<CameraProps> = ({setShowModal}) => {
    const [scanned, setScanned] = useState(false);
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
        <CameraView style={StyleSheet.absoluteFillObject} //Todo: Funktion hinzufügen, was der QRCode-Scanner machen soll; Soll: Item suchen durch Scan
        facing={"back"}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        >
        </CameraView>
    );
}
export default myComponent;