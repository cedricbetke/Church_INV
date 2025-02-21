import * as React from 'react';
import {DataTable} from 'react-native-paper';
import {Image, ScrollView, StyleSheet, View} from "react-native";
import defaultTheme from "@react-navigation/native/src/theming/DefaultTheme";
import {Status} from "@/app/Status";

const MyComponent = () => {
    const [page, setPage] = React.useState<number>(0);
    const [numberOfItemsPerPageList] = React.useState([5,10,15,20,30,50]);
    const [itemsPerPage, onItemsPerPageChange] = React.useState(
        numberOfItemsPerPageList[1]
    );
    type Column = { //type für die Titel der Tabelle
        title:string;
        key: string,
        numeric:boolean,
        sortDirection: "ascending" | "descending" | undefined;
        foto?: string; // Hier speichern wir das Bild als Base64-String
    }
    enum SortOrder { //Enum für Sortorder für Titel der Tabelle
        Ascending = "ascending",
        Descending = "descending",
    }
    const [columns, setColumns] = React.useState([
        { title: 'Dessert', key: 'invNr', numeric: false, sortDirection: undefined}, //sortDirection: SortDirection.Ascending z.B.
        { title: 'Status', key: 'stat', numeric: false, sortDirection:undefined },
        { title: 'Fat', key: 'fat', numeric: false, sortDirection:undefined },
        { title: 'Gerätefoto', key: 'foto', numeric: false, sortDirection:undefined },

    ]);

    const [items, setItems] = React.useState([
        {
            key: 1,
            invNr: '1',
            stat: Status.IN_VERWENDUNG,
            fat: 16,
            foto:"",
        },
        {
            key: 2,
            invNr: '2',
            stat: Status.AUSGEMUSTER,
            fat: 16,
            foto:"",
        },
        {
            key: 3,
            invNr: '3',
            stat: 159,
            fat: 6,
        },
        {
            key: 4,
            invNr: '4',
            stat: 305,
            fat: 3.7,
        },
        {
            key: 5,
            invNr: '5',
            stat: 305,
            fat: 3.7,
        },{
            key: 6,
            invNr: '7',
            stat: 305,
            fat: 3.7,
        },{
            key: 7,
            invNr: '8',
            stat: 305,
            fat: 3.7,
        },{
            key: 8,
            invNr: '9',
            stat: 305,
            fat: 3.7,
        },{
            key: 9,
            invNr: '10',
            stat: 305,
            fat: 3.7,
        },{
            key: 10,
            invNr: '11',
            stat: 305,
            fat: 3.7,
        },{
            key: 11,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 12,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 13,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },
        {
            key: 14,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 15,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 16,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 17,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 18,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 19,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 20,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 21,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 22,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 23,
            name: 'dritt letzte',
            calories: 262,
            fat: 16,
        },
        {
            key: 24,
            name: 'vorletzte',
            calories: 262,
            fat: 16,
        },
        {
            key: 25,
            name: 'letzte',
            calories: 262,
            fat: 16,
        },
    ]);

    // Funktion zum Hochladen eines Bildes und Speichern im Zustand
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = event.target.files?.[0]; // Hole die ausgewählte Datei
        if (file) {
            const reader = new FileReader();

            reader.onloadend = () => {
                const newItems = [...items];
                newItems[index].foto = reader.result as string; // Speichern des Base64-Strings im Zustand
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
                            <DataTable.Row key={item.key}>
                                {columns.map((col) => (
                                    <DataTable.Cell key={col.key} numeric={col.numeric}>
                                        {col.key === "foto" ? (
                                            // Wenn die Spalte "foto" ist, zeigen wir das Bild oder ein Datei-Auswahlfeld an
                                            <>
                                                {item.foto ? (
                                                    <Image
                                                        source={{ uri: item.foto }}
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
                                            item[col.key as keyof typeof item]
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

