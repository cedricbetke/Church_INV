// SelectionDialog.tsx
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Dialog, Portal, TextInput, List, Button } from 'react-native-paper';

interface SelectionDialogProps {
    visible: boolean;
    onDismiss: () => void;
    title: string;
    searchQuery: string;
    onSearchChange: (text: string) => void;
    items: Array<{ id: number; name: string }>;
    onSelect: (name: string) => void;
    onAddNew: () => Promise<void>;
    isNewItem: boolean;
}

const SelectionDialog: React.FC<SelectionDialogProps> = ({
    visible,
    onDismiss,
    title,
    searchQuery,
    onSearchChange,
    items,
    onSelect,
    onAddNew,
    isNewItem
}) => {
    // Filtere die Items basierend auf der Suchanfrage
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={{backgroundColor:'#ffffff'}}>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        mode="outlined"
                        label="Suchen oder neue eingeben"
                        value={searchQuery}
                        onChangeText={onSearchChange}
                        style={styles.searchInput}
                    />

                    <ScrollView style={styles.list}>
                        {filteredItems.map((item) => (
                            <List.Item
                                key={item.id}
                                title={item.name}
                                onPress={() => onSelect(item.name)}
                                style={styles.listItem}
                            />
                        ))}

                        {isNewItem && searchQuery.trim() && (
                            <List.Item
                                title={`"${searchQuery}" als neu hinzufügen`}
                                left={props => <List.Icon {...props} icon="plus" />}
                                onPress={onAddNew}
                                style={styles.newItem}
                            />
                        )}
                    </ScrollView>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>Abbrechen</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    searchInput: {
        marginBottom: 8,
    },
    list: {
        maxHeight: 300,
    },
    listItem: {
        borderBottomWidth: 0.5,
        borderBottomColor: '#e0e0e0',
    },
    newItem: {
        backgroundColor: '#f0f0f0',
    },
});

export default SelectionDialog;