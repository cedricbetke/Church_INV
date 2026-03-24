import React from 'react';
import { DataTable, Button, Searchbar } from 'react-native-paper';
import { ScrollView, Text, View, Image , StyleSheet} from 'react-native';
import { getValueOrFallback } from '@/app/utils/helpers';
import { handleFileChange } from '@/app/utils/ImagePickerUtil';
import {useInventory} from "@/src/features/inventory/context/InventoryContext";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
interface Column {
    sortDirection: "ascending" | "descending" | undefined;
    title: string;
    key: string;
    numeric: boolean;
}

interface DataTableModalProps {
    columns: Column[];
    from: number;
    to: number;
    openDetailModal: (item: any) => void;
    // Pagination-Props:
    page: number;
    setPage: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    numberOfItemsPerPageList: number[];

}

const DataTableComponent: React.FC<DataTableModalProps> = ({ columns, from, to, openDetailModal,  page,
                                                               setPage,
                                                               itemsPerPage,
                                                               onItemsPerPageChange,
                                                               numberOfItemsPerPageList, }) => {
    const {searchQuery, setSearchQuery} = useInventory();
    const {items,setItems} = useInventory();
    const filteredItems = items.filter(item => {
        return (
            String(item.invNr).toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.modell).toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.standort).toLowerCase().includes(searchQuery.toLowerCase())
        );
    });
    return (
        <View style={styles.container}>
            {/* Textinput für die Suche */}
            <Searchbar
                placeholder={"Suche..."}
                value={searchQuery}
                onChangeText={(query) => setSearchQuery(query)} // Aktualisiere die searchQuery
                //style={{ marginBottom: 10 }}
            />
            <DataTable style={styles.datacontainer}>
                <DataTable.Header>
                    {columns.map((col) => (
                        <DataTable.Title sortDirection={col.sortDirection} key={col.key} numeric={col.numeric}>
                            {col.title}
                        </DataTable.Title>
                    ))}
                </DataTable.Header>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {filteredItems.slice(from, to).map((item, rowIndex) => (
                        <DataTable.Row key={item.invNr} onPress={() => openDetailModal(item)}>
                            {columns.map((col) => (
                                <DataTable.Cell key={col.key} numeric={col.numeric}>
                                    {col.key === "foto" ? (
                                        // Wenn die Spalte "foto" ist, zeigen wir das Bild oder ein Datei-Auswahlfeld an
                                        <>
                                            {item.geraeteFoto ? (
                                                <Image
                                                    source={{ uri: item.geraeteFoto }}
                                                    style={{ width: 50, height: 50, borderRadius: 5 }}
                                                />
                                            ) : (
                                                <Button onPress={()=>handleFileChange(rowIndex,items,setItems)}> Upload Image </Button>
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
        </View>
    );
}
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
        width: "100%",
        marginTop: "auto",
        backgroundColor: 'white',
        paddingTop: 15,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },

});
export default DataTableComponent;

