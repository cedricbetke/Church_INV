import React from "react";
import { DataTable, Button, Searchbar } from "react-native-paper";
import { ScrollView, Text, View, Image, StyleSheet } from "react-native";
import { getValueOrFallback } from "@/src/shared/utils/helpers";
import { handleFileChange } from "@/src/shared/utils/ImagePickerUtil";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";

export interface Column {
    sortDirection: "ascending" | "descending" | undefined;
    title: string;
    key: keyof InventoryItem | "foto";
    numeric: boolean;
}

interface DataTableProps {
    columns: Column[];
    from: number;
    to: number;
    openDetailModal: (item: InventoryItem) => void;
    page: number;
    setPage: (page: number) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    numberOfItemsPerPageList: number[];
}

const DataTableComponent: React.FC<DataTableProps> = ({
    columns,
    from,
    to,
    openDetailModal,
    page,
    setPage,
    itemsPerPage,
    onItemsPerPageChange,
    numberOfItemsPerPageList,
}) => {
    const { searchQuery, setSearchQuery, items, setItems } = useInventory();

    const filteredItems = items.filter((item) => (
        String(item.invNr).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.modell).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.standort).toLowerCase().includes(searchQuery.toLowerCase())
    ));

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Suche..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            <DataTable style={styles.table}>
                <DataTable.Header>
                    {columns.map((column) => (
                        <DataTable.Title
                            key={column.key}
                            sortDirection={column.sortDirection}
                            numeric={column.numeric}
                        >
                            {column.title}
                        </DataTable.Title>
                    ))}
                </DataTable.Header>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {filteredItems.slice(from, to).map((item, rowIndex) => (
                        <DataTable.Row key={item.invNr} onPress={() => openDetailModal(item)}>
                            {columns.map((column) => (
                                <DataTable.Cell key={column.key} numeric={column.numeric}>
                                    {column.key === "foto" ? (
                                        item.geraeteFoto ? (
                                            <Image
                                                source={{ uri: item.geraeteFoto }}
                                                style={styles.image}
                                            />
                                        ) : (
                                            <Button onPress={() => handleFileChange(rowIndex, items, setItems)}>
                                                Upload Image
                                            </Button>
                                        )
                                    ) : (
                                        <Text>{getValueOrFallback(item, column.key)}</Text>
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
                    onPageChange={setPage}
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
        flex: 1,
        justifyContent: "space-between",
        height: "100%",
        overflow: "hidden",
    },
    table: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    pagination: {
        width: "100%",
        marginTop: "auto",
        backgroundColor: "white",
        paddingTop: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 5,
    },
});

export default DataTableComponent;
