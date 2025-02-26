import * as React from 'react';
import {DataTable, Modal, Portal, Button} from 'react-native-paper';
import { Image, ScrollView, StyleSheet, Text, View} from "react-native";
import defaultTheme from "@react-navigation/native/src/theming/DefaultTheme";
import {Status} from "@/app/inventoryItem/Status";
import {testInventoryItems} from "@/app/inventoryItem/testdata";
import {useEffect, useState} from "react";
import InventoryItem from "@/app/inventoryItem/InventoryItem";
import * as ImagePicker from 'expo-image-picker';

const MyComponent = () => {
    const [page, setPage] = React.useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([5,10,15,20,30,50]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[1]
    );
    enum SortOrder { //Enum für Sortorder für Titel der Tabelle
        Ascending = "ascending",
        Descending = "descending",
    }
    const [columns, setColumns] = React.useState([
        { title: 'InvNr', key: 'invNr', numeric: false, sortDirection: undefined}, //sortDirection: SortDirection.Ascending z.B.
        { title: 'Status', key: 'stat', numeric: false, sortDirection:undefined },
        { title: 'Modell', key: 'modell', numeric: false, sortDirection:undefined },
        { title: 'Standort', key: 'standort', numeric: false, sortDirection:undefined },
        { title: 'Foto', key: 'foto', numeric: false, sortDirection:undefined },

    ]);

    const [items, setItems] = React.useState<InventoryItem[]>([]);
    useEffect(() => {
        // Hier kannst du die Testdaten verwenden, anstatt sie von einer API zu laden:
        setItems(testInventoryItems);
    }, []);

    // Funktion zum Hochladen eines Bildes und Speichern im Zustand
    const handleFileChange = async (index: number) => {
        // Request media library permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            alert('Permission to access media library is required!');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            const newItems = [...items];
            newItems[index].geräteFoto = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setItems(newItems);
        }
    };

    const overriddenStyle = StyleSheet.flatten([
        defaultTheme,
        { flexShrink: 1 }, // Überschreibt den Default
    ]);
    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, items.length);

    React.useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);

    const [visibleModal, setVisibleModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const openDetailModal = (item: any) => {
        setSelectedItem(item);
        setVisibleModal(true);
    };
// Step 1: Extract constant
    const FALLBACK_VALUE = "N/A";

// Step 2: Extract function with meaningful name and type annotations
    function getValueOrFallback<T>(
        item: T,
        key: keyof T,
        fallback: string = FALLBACK_VALUE
    ): string {
        return (item[key] as string) || fallback;
    }

    return (
        <View style={styles.container}>
                <DataTable style={styles.datacontainer}>
                        <DataTable.Header>
                        {columns.map((col) => (
                            <DataTable.Title sortDirection={col.sortDirection} key={col.key} numeric={col.numeric}>
                                {col.title}
                            </DataTable.Title>
                        ))}
                    </DataTable.Header>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                        {items.slice(from, to).map((item, rowIndex) => (
                            <DataTable.Row key={item.invNr} onPress={() => openDetailModal(item)}>
                                {columns.map((col) => (
                                    <DataTable.Cell key={col.key} numeric={col.numeric}>
                                        {col.key === "foto" ? (
                                            // Wenn die Spalte "foto" ist, zeigen wir das Bild oder ein Datei-Auswahlfeld an
                                            <>
                                                {item.geräteFoto ? (
                                                    <Image
                                                        source={{ uri: item.geräteFoto }}
                                                        style={{ width: 50, height: 50, borderRadius: 5 }}
                                                    />
                                                ) : (
                                                    <Button onPress={()=>handleFileChange(rowIndex)}> Upload Image </Button>
                                                )}
                                            </>
                                        ) : (
                                            // Ansonsten den Wert der Zelle direkt anzeigen
                                            <Text>{getValueOrFallback(item,col.key as keyof InventoryItem)}</Text>
                                        )}
                                    </DataTable.Cell>
                                ))}
                            </DataTable.Row>
                        ))}
                    </ScrollView>
                </DataTable>
            <View style={styles.pagination}>
                <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.ceil(items.length / itemsPerPage)}
                    onPageChange={(page) => setPage(page)}
                    label={`${from + 1}-${to} of ${items.length}`}
                    numberOfItemsPerPageList={numberOfItemsPerPageList}
                    numberOfItemsPerPage={itemsPerPage}
                    onItemsPerPageChange={onItemsPerPageChange}
                    showFastPaginationControls
                />
            </View>
            {/* Detail-Modal */}
            <Portal>
                <Modal
                    visible={visibleModal}
                    onDismiss={() => setVisibleModal(false)}
                    contentContainerStyle={{
                        backgroundColor: "white",
                        padding: 20,
                        borderRadius: 10,
                        alignItems: "center",
                    }}
                >
                    {selectedItem && (
                        <>
                            <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
                                Details zu {selectedItem.invNr}
                            </Text>
                            {selectedItem.geräteFoto && (
                                <Image
                                    source={{ uri: selectedItem.geräteFoto }}
                                    style={{ width: 400, height: 400, borderRadius: 10, marginBottom: 10 }}
                                />
                            )}
                            {columns.map((col) => (
                                <Text key={col.key} style={{ fontSize: 16 }}>
                                    <Text style={{ fontWeight: "bold" }}>{col.title}: </Text>
                                    {selectedItem[col.key as keyof typeof selectedItem] || "N/A"}
                                </Text>
                            ))}
                            <Button
                                onPress={() => setVisibleModal(false)}
                                style={{
                                    marginTop: 10, // Button-Abstand oben
                                    backgroundColor: '#6200ea', // Hintergrundfarbe
                                    borderRadius: 5, // Runder Rand
                                }}
                            >
                                Schließen
                            </Button>
                        </>
                    )}
                </Modal>
            </Portal>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        display: "flex",
        flex:1,
        justifyContent:"space-between",
        height:"100%",
        overflow:"hidden",

    },
    datacontainer:{
        flex:1,
    },
    scrollView: {
        flex:1,
    },
    scrollContent: {
        flexGrow: 1, // Verhindert, dass der ScrollView größer als der Bildschirm wird
    },
    pagination: {
        width:"100%",
        marginTop:"auto",
        backgroundColor: 'white',
        paddingTop:15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});

export default MyComponent;

