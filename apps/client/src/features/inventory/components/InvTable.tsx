import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Snackbar } from "react-native-paper";
import axios from "axios";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import { CreateGeraetPayload } from "@/src/features/inventory/types/CreateGeraetPayload";
import { Column } from "./dataTable";
import DetailModal from "./DetailPage";
import DataTableComponent from "./dataTable";
import AddPage from "./AddPage";
import geraeteService from "@/src/features/inventory/services/geraeteService";

const DEFAULT_COLUMNS: Column[] = [
    { title: "InvNr", key: "invNr", numeric: false, sortDirection: "ascending" },
    { title: "Status", key: "status", numeric: false, sortDirection: undefined },
    { title: "Modell", key: "modell", numeric: false, sortDirection: undefined },
    { title: "Standort", key: "standort", numeric: false, sortDirection: undefined },
    { title: "Foto", key: "foto", numeric: false, sortDirection: undefined },
];

const compareValues = (
    left: string | number | undefined,
    right: string | number | undefined,
    direction: "ascending" | "descending",
) => {
    const leftValue = left ?? "";
    const rightValue = right ?? "";

    let result = 0;

    if (typeof leftValue === "number" && typeof rightValue === "number") {
        result = leftValue - rightValue;
    } else {
        result = String(leftValue).localeCompare(String(rightValue), "de", { sensitivity: "base" });
    }

    return direction === "ascending" ? result : -result;
};

const getMutationErrorMessage = (error: unknown) => {
    if (!axios.isAxiosError(error)) {
        return error instanceof Error ? error.message : "Aktion konnte nicht ausgefuehrt werden.";
    }

    if (!error.response) {
        return "Der Server ist nicht erreichbar. Bitte Verbindung und API-URL pruefen.";
    }

    const { status, data } = error.response;
    const backendMessage =
        typeof data === "string"
            ? data
            : typeof data?.message === "string"
                ? data.message
                : typeof data?.error === "string"
                    ? data.error
                    : null;

    if (status === 403) {
        return backendMessage ?? "Diese Aktion ist nur mit Admin-Rechten erlaubt.";
    }

    if (status === 503) {
        return backendMessage ?? "Die Admin-Freigabe ist auf dem Server nicht konfiguriert.";
    }

    if (status === 404) {
        return backendMessage ?? "Der Datensatz wurde nicht gefunden.";
    }

    if (status >= 500) {
        return backendMessage ?? "Serverfehler beim Speichern.";
    }

    return backendMessage ?? "Aktion konnte nicht ausgefuehrt werden.";
};

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
    const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
    const [columns, setColumns] = useState<Column[]>(DEFAULT_COLUMNS);

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

    const handleSort = (key: Column["key"]) => {
        setColumns((currentColumns) =>
            currentColumns.map((column) => {
                if (column.key !== key) {
                    return {
                        ...column,
                        sortDirection: undefined,
                    };
                }

                const nextDirection =
                    column.sortDirection === undefined
                        ? "ascending"
                        : column.sortDirection === "ascending"
                            ? "descending"
                            : undefined;

                return {
                    ...column,
                    sortDirection: nextDirection,
                };
            }),
        );
        setPage(0);
    };

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
            setFeedbackMessage(getMutationErrorMessage(error));
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
            setFeedbackMessage(getMutationErrorMessage(error));
            throw error;
        }
    };

    const activeSortColumn = columns.find((column) => column.sortDirection);
    const sortedItems = [...items].sort((left, right) => {
        if (!activeSortColumn?.sortDirection) {
            return 0;
        }

        switch (activeSortColumn.key) {
            case "invNr":
                return compareValues(left.invNr, right.invNr, activeSortColumn.sortDirection);
            case "status":
                return compareValues(left.status, right.status, activeSortColumn.sortDirection);
            case "modell":
                return compareValues(left.modell, right.modell, activeSortColumn.sortDirection);
            case "standort":
                return compareValues(left.standort, right.standort, activeSortColumn.sortDirection);
            case "foto":
                return compareValues(
                    left.geraeteFoto ? 1 : 0,
                    right.geraeteFoto ? 1 : 0,
                    activeSortColumn.sortDirection,
                );
            default:
                return 0;
        }
    });

    const from = page * itemsPerPage;
    const to = Math.min((page + 1) * itemsPerPage, sortedItems.length);

    return (
        <View style={styles.container}>
            <DataTableComponent
                columns={columns}
                from={from}
                to={to}
                items={sortedItems}
                openDetailModal={openDetailModal}
                page={page}
                setPage={setPage}
                onSort={handleSort}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={onItemsPerPageChange}
                numberOfItemsPerPageList={numberOfItemsPerPageList}
            />
            <DetailModal
                visible={visibleModal}
                onDismiss={() => setVisibleModal(false)}
                selectedItem={selectedItem}
                columns={columns}
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
            <Snackbar
                visible={Boolean(feedbackMessage)}
                onDismiss={() => setFeedbackMessage(null)}
                duration={3500}
            >
                {feedbackMessage ?? ""}
            </Snackbar>
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
