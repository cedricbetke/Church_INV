import * as React from 'react';
import {DataTable} from 'react-native-paper';
import {Image, ScrollView, StyleSheet, View} from "react-native";
import defaultTheme from "@react-navigation/native/src/theming/DefaultTheme";
import {Status} from "@/app/inventoryItem/Status";
import {testInventoryItems} from "@/app/inventoryItem/testdata";
import {useEffect} from "react";
import InventoryItem from "@/app/inventoryItem/InventoryItem";

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
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0]; // Hole die ausgewählte Datei
        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                const newItems = [...items];
                newItems[index].geräteFoto = reader.result as string; // Speichern des Base64-Strings im Zustand
                setItems(newItems);
            };

            reader.readAsDataURL(file); // Liest die Datei als Data-URL (Base64)
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
                        {items.map((item, rowIndex) => (
                            <DataTable.Row key={item.invNr}>
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
                                                    <input
                                                        type="file"
                                                        accept="image/png, image/jpeg"
                                                        onChange={(e) => handleFileChange(e, rowIndex)} // Bild hochladen
                                                    />
                                                )}
                                            </>
                                        ) : (
                                            // Ansonsten den Wert der Zelle direkt anzeigen
                                            <>{item[col.key as keyof InventoryItem] || "N/A"}</>
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

