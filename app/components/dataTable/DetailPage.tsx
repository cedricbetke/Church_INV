import React from 'react';
import { Modal, Portal as PaperPortal, Button } from 'react-native-paper';
import { Image, Text } from 'react-native';
import UIGrid from '@/app/components/dataTable/DetailGrid';

interface DetailModalProps {
    visible: boolean;
    onDismiss: () => void;
    selectedItem: any;
    columns: Array<{ title: string; key: string; numeric: boolean }>;
}

const DetailModal: React.FC<DetailModalProps> = ({ visible, onDismiss, selectedItem, columns }) => {
    return (
        <PaperPortal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                }}
            >
                <UIGrid>
                    {selectedItem && (
                        <>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
                                Details zu {selectedItem.invNr}
                            </Text>
                            {selectedItem.geraeteFoto && (
                                <Image
                                    source={{ uri: selectedItem.geraeteFoto }}
                                    style={{ width: 400, height: 400, borderRadius: 10, marginBottom: 10 }}
                                />
                            )}
                            {columns.map((col) => (
                                <Text key={col.key} style={{ fontSize: 16 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{col.title}: </Text>
                                    {(selectedItem[col.key] || 'N/A').toString()}
                                </Text>
                            ))}
                            <Button
                                onPress={onDismiss}
                                style={{ marginTop: 10, backgroundColor: '#6200ea', borderRadius: 5 }}
                            >
                                Schließen
                            </Button>
                        </>
                    )}
                </UIGrid>
            </Modal>
        </PaperPortal>
    );
};

export default DetailModal;