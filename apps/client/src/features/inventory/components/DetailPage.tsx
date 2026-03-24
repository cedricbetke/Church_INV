import React from 'react';
import { Modal, Portal as PaperPortal, Button, List, Surface } from 'react-native-paper';
import { Image, Text, ScrollView, View, StyleSheet } from 'react-native';

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
                    margin: 20,
                    maxHeight: '90%',
                }}
            >
                <ScrollView>
                    {selectedItem && (
                        <View>
                            <Text style={styles.title}>
                                Details zu {selectedItem.invNr}
                            </Text>

                            {selectedItem.geraeteFoto && (
                                <Image
                                    source={{ uri: selectedItem.geraeteFoto }}
                                    style={styles.image}
                                />
                            )}

                            <List.Section>
                                {columns.map((col) => (
                                    <Surface key={col.key} style={styles.surface}>
                                        <List.Item
                                            title={col.title}
                                            description={selectedItem[col.key]?.toString() || 'N/A'}
                                            titleStyle={styles.itemTitle}
                                            descriptionStyle={styles.itemDescription}
                                            style={styles.listItem}
                                        />
                                    </Surface>
                                ))}
                            </List.Section>

                            <Button
                                mode="contained"
                                onPress={onDismiss}
                                style={styles.button}
                            >
                                Schließen
                            </Button>
                        </View>
                    )}
                </ScrollView>
            </Modal>
        </PaperPortal>
    );
};

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    image: {
        width: 400,
        height: 400,
        borderRadius: 10,
        marginBottom: 10,
    },
    surface: {
        marginVertical: 4,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    },
    listItem: {
        padding: 8,
    },
    itemTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333333',
    },
    itemDescription: {
        fontSize: 15,
        color: '#666666',
        marginTop: 4,
    },
    button: {
        marginTop: 10,
        backgroundColor: '#6200ea',
        borderRadius: 5,
    },
});

export default DetailModal;