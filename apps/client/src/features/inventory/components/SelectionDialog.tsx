import React from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { Button, Dialog, List, Portal, TextInput } from "react-native-paper";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

interface SelectionDialogProps {
    visible: boolean;
    onDismiss: () => void;
    title: string;
    searchQuery: string;
    onSearchChange: (text: string) => void;
    items: Array<{ id: number; name: string }>;
    onSelect: (name: string) => void;
    onAddNew: () => Promise<void>;
    canCreateNew: boolean;
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
    canCreateNew,
    isNewItem,
}) => {
    const { isDarkMode } = useAppThemeMode();
    const searchLabel = canCreateNew ? "Suchen oder neue eingeben" : "Suchen oder auswählen";

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss} style={[styles.dialog, isDarkMode && styles.dialogDark]}>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        mode="outlined"
                        label={searchLabel}
                        value={searchQuery}
                        onChangeText={onSearchChange}
                        style={[styles.searchInput, isDarkMode && styles.searchInputDark]}
                    />

                    <ScrollView style={styles.list}>
                        {filteredItems.map((item) => (
                            <List.Item
                                key={item.id}
                                title={item.name}
                                onPress={() => onSelect(item.name)}
                                style={[styles.listItem, isDarkMode && styles.listItemDark]}
                                titleStyle={isDarkMode ? styles.listItemTitleDark : undefined}
                            />
                        ))}

                        {canCreateNew && isNewItem && searchQuery.trim() && (
                            <List.Item
                                title={`"${searchQuery}" als neu hinzufügen`}
                                left={(props) => <List.Icon {...props} icon="plus" />}
                                onPress={onAddNew}
                                style={[styles.newItem, isDarkMode && styles.newItemDark]}
                                titleStyle={isDarkMode ? styles.listItemTitleDark : undefined}
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
    dialog: {
        backgroundColor: "#ffffff",
        alignSelf: "center",
        width: Platform.OS === "web" ? "92%" : undefined,
        maxWidth: 560,
    },
    dialogDark: {
        backgroundColor: "#161b22",
    },
    searchInput: {
        marginBottom: 8,
    },
    searchInputDark: {
        backgroundColor: "#11161d",
    },
    list: {
        maxHeight: 280,
    },
    listItem: {
        borderBottomWidth: 0.5,
        borderBottomColor: "#e0e0e0",
    },
    listItemDark: {
        borderBottomColor: "#273142",
        backgroundColor: "#161b22",
    },
    listItemTitleDark: {
        color: "#f3f4f6",
    },
    newItem: {
        backgroundColor: "#f0f0f0",
    },
    newItemDark: {
        backgroundColor: "#1f2937",
    },
});

export default SelectionDialog;
