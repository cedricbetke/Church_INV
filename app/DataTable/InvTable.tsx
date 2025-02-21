import * as React from 'react';
import { DataTable } from 'react-native-paper';
import {ScrollView, View} from "react-native";
import {StyleSheet} from "react-native";
import defaultTheme from "@react-navigation/native/src/theming/DefaultTheme";
import {UNDEFINED} from "turbo-stream/dist/utils";

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
    }
    enum SortOrder { //Enum für Sortorder für Titel der Tabelle
        Ascending = "ascending",
        Descending = "descending",
        Undefined = UNDEFINED,
    }
    const [columns, setColumns] = React.useState([
        { title: 'Dessert', key: 'name', numeric: false, sortDirection: undefined}, //sortDirection: SortDirection.Ascending z.B.
        { title: 'Calories', key: 'calories', numeric: false, sortDirection:undefined },
        { title: 'Fat', key: 'fat', numeric: false, sortDirection:undefined },
        { title: 'Gerätefoto', key: 'foto', numeric: false, sortDirection:undefined },

    ]);

    const [items, setItems] = React.useState([
        {
            key: 1,
            name: 'Cupcake',
            calories: 356,
            fat: 16,
        },
        {
            key: 2,
            name: 'Eclair',
            calories: 262,
            fat: 16,
        },
        {
            key: 3,
            name: 'Frozen yogurt',
            calories: 159,
            fat: 6,
        },
        {
            key: 4,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },
        {
            key: 5,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 6,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 7,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 8,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 9,
            name: 'Gingerbread',
            calories: 305,
            fat: 3.7,
        },{
            key: 10,
            name: 'Gingerbread',
            calories: 305,
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
                        {items.map((item) => (
                            <DataTable.Row key={item.key}>
                                {columns.map((col) => (
                                    <DataTable.Cell key={col.key} numeric={col.numeric}>
                                        {item[col.key as keyof typeof item]}
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

