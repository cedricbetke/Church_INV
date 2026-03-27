// DropdownSelectWithModal.tsx

import React, { useState } from 'react';
import {
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Text,
    Modal,
    StyleSheet,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import { HelperText } from 'react-native-paper';

interface DropdownSelectProps {
    label: string;
    value: string;
    options: string[];
    onSelect: (selectedValue: string) => void;
    error?: string;
    placeholder?: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
                                                           label,
                                                           value,
                                                           options,
                                                           onSelect,
                                                           error,
                                                           placeholder
                                                       }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [internalOptions, setInternalOptions] = useState<string[]>(options);

    const filteredOptions = internalOptions.filter(option =>
        option.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showCreateOption =
        searchQuery.length > 0 &&
        !internalOptions.map(o => o.toLowerCase()).includes(searchQuery.toLowerCase());

    const handleSelect = (selectedValue: string) => {
        onSelect(selectedValue);
        setModalVisible(false);
        setSearchQuery('');
    };

    const handleCreate = () => {
        const newValue = searchQuery.trim();
        if (newValue === '') return;

        const updatedOptions = [...internalOptions, newValue];
        setInternalOptions(updatedOptions);
        handleSelect(newValue);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    placeholder={placeholder || label}
                    value={value}
                    editable={false}
                />
            </TouchableOpacity>

            {error && <HelperText type="error">{error}</HelperText>}

            <Modal
                visible={isModalVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContainer}>
                            <TextInput
                                autoFocus
                                style={styles.searchInput}
                                placeholder="Suchen oder erstellen..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />

                            <FlatList
                                data={filteredOptions}
                                keyExtractor={(item, index) => index.toString()}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleSelect(item)}>
                                        <Text style={styles.dropdownItem}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                                ListFooterComponent={
                                    showCreateOption ? (
                                        <TouchableOpacity onPress={handleCreate}>
                                            <Text style={styles.createItem}>➕ Erstelle "{searchQuery}"</Text>
                                        </TouchableOpacity>
                                    ) : null
                                }
                                ListEmptyComponent={
                                    !showCreateOption ? (
                                        <Text style={styles.noResults}>Keine Ergebnisse gefunden</Text>
                                    ) : null
                                }
                            />

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.closeButtonText}>Abbrechen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
    inputError: {
        borderColor: 'red',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        maxHeight: '80%',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        borderRadius: 4,
        marginBottom: 12,
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    createItem: {
        padding: 12,
        color: '#007aff',
        fontWeight: 'bold',
        backgroundColor: '#f0f0f0',
    },
    noResults: {
        padding: 12,
        color: '#888',
        fontStyle: 'italic',
    },
    closeButton: {
        marginTop: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#007aff',
        fontWeight: 'bold',
    },
});

export default DropdownSelect;
