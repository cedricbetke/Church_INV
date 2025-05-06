import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { TextInput, Button, Portal, Dialog, List, Modal, Title } from 'react-native-paper';

interface Brand {
    id: number;
    name: string;
}

interface AddItemModalProps {
    visible: boolean;
    onDismiss: () => void;
    existingBrands: Brand[];
    onAddBrand: (brandName: string) => Promise<void>;
    onSubmit: (itemData: any) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
                                                       visible,
                                                       onDismiss,
                                                       existingBrands,
                                                       onAddBrand,
                                                       onSubmit
                                                   }) => {
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [showBrandDialog, setShowBrandDialog] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isNewBrand, setIsNewBrand] = useState(false);

    // Weitere Formularfelder hier...
    const [itemNumber, setItemNumber] = useState('');
    const [description, setDescription] = useState('');

    const filteredBrands = existingBrands.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleBrandSelect = (brandName: string) => {
        setSelectedBrand(brandName);
        setShowBrandDialog(false);
        setSearchQuery('');
    };

    const handleAddNewBrand = async () => {
        if (searchQuery.trim()) {
            await onAddBrand(searchQuery);
            handleBrandSelect(searchQuery);
            setIsNewBrand(false);
        }
    };

    const handleSubmit = () => {
        onSubmit({
            brand: selectedBrand,
            itemNumber,
            description,
            // Weitere Felder hier...
        });
        resetForm();
        onDismiss();
    };

    const resetForm = () => {
        setSelectedBrand('');
        setItemNumber('');
        setDescription('');
        // Weitere Felder zurücksetzen...
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.modalContainer}
            >
                <ScrollView>
                    <Title style={styles.title}>Neuen Artikel hinzufügen</Title>

                    <View style={styles.form}>
                        <TextInput
                            mode="outlined"
                            label="Artikelnummer"
                            value={itemNumber}
                            onChangeText={setItemNumber}
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Marke"
                            value={selectedBrand}
                            onFocus={() => setShowBrandDialog(true)}
                            right={<TextInput.Icon icon="chevron-down" />}
                            style={styles.input}
                        />

                        <TextInput
                            mode="outlined"
                            label="Beschreibung"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                            style={styles.input}
                        />

                        {/* Weitere Formularfelder hier... */}

                        <View style={styles.buttonContainer}>
                            <Button
                                mode="outlined"
                                onPress={onDismiss}
                                style={styles.button}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                style={styles.button}
                            >
                                Speichern
                            </Button>
                        </View>
                    </View>
                </ScrollView>

                {/* Dialog für Markenauswahl */}
                <Portal>
                    <Dialog visible={showBrandDialog} onDismiss={() => setShowBrandDialog(false)}>
                        <Dialog.Title>Marke auswählen</Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                                mode="outlined"
                                label="Marke suchen oder neue eingeben"
                                value={searchQuery}
                                onChangeText={text => {
                                    setSearchQuery(text);
                                    setIsNewBrand(!filteredBrands.some(
                                        brand => brand.name.toLowerCase() === text.toLowerCase()
                                    ));
                                }}
                                style={styles.searchInput}
                            />

                            <ScrollView style={styles.brandList}>
                                {filteredBrands.map((brand) => (
                                    <List.Item
                                        key={brand.id}
                                        title={brand.name}
                                        onPress={() => handleBrandSelect(brand.name)}
                                        style={styles.listItem}
                                    />
                                ))}

                                {isNewBrand && searchQuery.trim() && (
                                    <List.Item
                                        title={`"${searchQuery}" als neue Marke hinzufügen`}
                                        left={props => <List.Icon {...props} icon="plus" />}
                                        onPress={handleAddNewBrand}
                                        style={styles.newBrandItem}
                                    />
                                )}
                            </ScrollView>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={() => setShowBrandDialog(false)}>Abbrechen</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 10,
        maxHeight: '90%',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    form: {
        gap: 10,
    },
    input: {
        marginBottom: 12,
    },
    searchInput: {
        marginBottom: 8,
    },
    brandList: {
        maxHeight: 300,
    },
    listItem: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    newBrandItem: {
        backgroundColor: '#f0f0f0',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
    },
});

export default AddItemModal;