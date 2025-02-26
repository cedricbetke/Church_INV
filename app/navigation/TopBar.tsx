import * as React from 'react';
import {Appbar, Modal, Portal} from 'react-native-paper';
import {useNavigation} from "expo-router";
import { View} from "react-native";
import {useState} from "react";
import QrCodeScanner from "@/app/Scanner/QrCodeScanner";

const MyComponent = () => {
        const [showModal, setShowModal] = useState<boolean>(false);

        return (
            <View>
                    <Appbar.Header>
                            <Appbar.BackAction onPress={() => {
                            }}/>
                            <Appbar.Content title="ChurchINV"/>
                            <Appbar.Action icon="plus" onPress={() => {
                            }}/>
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