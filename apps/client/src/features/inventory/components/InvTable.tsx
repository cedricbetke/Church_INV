import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import { CreateGeraetPayload } from "@/src/features/inventory/types/CreateGeraetPayload";
import { Column } from "./dataTable";
import DetailModal from "./DetailPage";
import DataTableComponent from "./dataTable";
import AddPage from "./AddPage";
import geraeteService from "@/src/features/inventory/services/geraeteService";

const DEFAULT_COLUMNS: Column[] = [
    { title: "InvNr", key: "invNr", numeric: false, sortDirection: undefined },
    { title: "Status", key: "status", numeric: false, sortDirection: undefined },
    { title: "Modell", key: "modell", numeric: false, sortDirection: undefined },
    { title: "Standort", key: "standort", numeric: false, sortDirection: undefined },
    { title: "Foto", key: "foto", numeric: false, sortDirection: undefined },
];

const InvTable = () => {
    const {
        numberOfItemsPerPageList,
        selectedItem,
        setSelectedItem,
        editingItem,
        setEditingItem,
        canManageInventory,
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

    const openEditModal = (item: InventoryItem) => {
        if (!canManageInventory) {
            return;
        }

        setEditingItem(item);
        setIsAddPageVisible(true);
    };

    const closeAddPage = () => {
        setEditingItem(null);
        setIsAddPageVisible(false);
    };

    useEffect(() => {
        setPage(0);
    }, [itemsPerPage]);

    const handleAddBrand = async (brandName: string) => await addBrand(brandName);

    const handleSubmit = async (itemData: CreateGeraetPayload) => {
        try {
            if (editingItem) {
                if (!canManageInventory) {
                    throw new Error("Nur Admins duerfen Geraete bearbeiten.");
                }

                await geraeteService.update(editingItem.invNr, itemData);
            } else {
                if (!canManageInventory) {
                    throw new Error("Nur Admins duerfen Geraete anlegen.");
                }

                await geraeteService.create(itemData);
            }

            await fetchItems();
        } catch (error) {
            console.error("Fehler beim Speichern des Geraets:", error);
            throw error;
        }
    };

    const handleDelete = async (item: InventoryItem) => {
        if (!canManageInventory) {
            throw new Error("Nur Admins duerfen Geraete loeschen.");
        }

        try {
            await geraeteService.delete(item.invNr);
            setVisibleModal(false);
            if (selectedItem?.invNr === item.invNr) {
                setSelectedItem(null);
            }
            await fetchItems();
        } catch (error) {
            console.error("Fehler beim Loeschen des Geraets:", error);
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
                canManageInventory={canManageInventory}
                onEdit={(item) => {
                    setVisibleModal(false);
                    openEditModal(item);
                }}
                onDelete={handleDelete}
            />
            <AddPage
                visible={isAddPageVisible}
                onDismiss={closeAddPage}
                existingBrands={brands}
                existingModels={models}
                onAddBrand={handleAddBrand}
                onSubmit={handleSubmit}
                editingItem={editingItem}
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
