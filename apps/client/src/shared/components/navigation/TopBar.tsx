import * as React from 'react';
import {Appbar, Modal, Portal} from 'react-native-paper';
import { View} from "react-native";
import {useState} from "react";
import QrCodeScanner from "@/src/features/scanner/components/QrCodeScanner";
import {useInventory} from "@/src/features/inventory/context/InventoryContext";

const MyComponent = () => {
        const [showModal, setShowModal] = useState<boolean>(false);
        const {setIsAddPageVisible} = useInventory();
        return (
            <View>
                    <Appbar.Header>
                            <Appbar.BackAction onPress={() => {
                            }}/>
                            <Appbar.Content title="ChurchINV"/>
                            <Appbar.Action icon="plus" onPress={() => setIsAddPageVisible(true)}/>
                            <Appbar.Action icon="magnify" onPress={() => {
                            }}/>
                            <Appbar.Action icon="qrcode-scan" onPress={() => setShowModal(true)}/>
                            <Appbar.Action icon="filter" onPress={() => {}}/>
                    </Appbar.Header>
                <Portal>
                        <Modal visible={showModal} onDismiss={() => setShowModal(false)}>
                                <View style={{ height: 500, padding: 20 }}>
                                        <QrCodeScanner setShowModal = {setShowModal}></QrCodeScanner>
                                </View>
                        </Modal>
                </Portal>
            </View>
);
}
export default MyComponent;
