import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import { FormData } from "@/src/features/inventory/types/FormData";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import { Column } from "./dataTable";
import DetailModal from "./DetailPage";
import DataTableComponent from "./dataTable";
import AddPage from "./AddPage";

const DEFAULT_COLUMNS: Column[] = [
    { title: "InvNr", key: "invNr", numeric: false, sortDirection: undefined },
    { title: "Status", key: "statusid", numeric: false, sortDirection: undefined },
    { title: "Modell", key: "modell", numeric: false, sortDirection: undefined },
    { title: "Standort", key: "standort", numeric: false, sortDirection: undefined },
    { title: "Foto", key: "foto", numeric: false, sortDirection: undefined },
];

const InvTable = () => {
    const {
        numberOfItemsPerPageList,
        selectedItem,
        setSelectedItem,
        brands,
        addBrand,
        fetchItems,
        isAddPageVisible,
        setIsAddPageVisible,
        models,
        items,
    } = useInventory();

    const [page, setPage] = useState<number>(0);
    const [itemsPerPage, onItemsPerPageChange] = useState(numberOfItemsPerPageList[1]);
    const [visibleModal, setVisibleModal] = useState(false);

    const openDetailModal = (item: InventoryItem) => {
        setSelectedItem(item);
        setVisibleModal(true);
    };

    useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);

    const handleAddBrand = async (brandName: string) => await addBrand(brandName);

    const handleSubmit = async (_itemData: FormData) => {
        try {
            await fetchItems();
        } catch (error) {
            console.error("Fehler beim Einfuegen eines neuen Geraets:", error);
            throw error;
        }
    };

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, items.length);

    return (
        <View style={styles.container}>
            <DataTableComponent
                columns={DEFAULT_COLUMNS}
                from={from}
                to={to}
                openDetailModal={openDetailModal}
                page={page}
                setPage={setPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                numberOfItemsPerPageList={numberOfItemsPerPageList}
            />
            <DetailModal
                visible={visibleModal}
                onDismiss={() => setVisibleModal(false)}
                selectedItem={selectedItem}
                columns={DEFAULT_COLUMNS}
            />
            <AddPage
                visible={isAddPageVisible}
                onDismiss={() => setIsAddPageVisible(false)}
                existingBrands={brands}
                existingModels={models}
                onAddBrand={handleAddBrand}
                onSubmit={handleSubmit}
            />
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
});

export default InvTable;
