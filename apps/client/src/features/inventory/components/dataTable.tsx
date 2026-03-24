import React from "react";
import { Button, Chip, DataTable, Searchbar, Text } from "react-native-paper";
import { ScrollView, View, Image, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getValueOrFallback } from "@/src/shared/utils/helpers";
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
    items: InventoryItem[];
    openDetailModal: (item: InventoryItem) => void;
    page: number;
    setPage: (page: number) => void;
    onSort: (key: Column["key"]) => void;
    itemsPerPage: number;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    numberOfItemsPerPageList: number[];
}

const DataTableComponent: React.FC<DataTableProps> = ({
    columns,
    from,
    to,
    items,
    openDetailModal,
    page,
    setPage,
    onSort,
    itemsPerPage,
    onItemsPerPageChange,
    numberOfItemsPerPageList,
}) => {
    const {
        searchQuery,
        setSearchQuery,
        states,
        brands,
        models,
        bereiche,
        standorte,
        filters,
        setFilters,
        isFilterVisible,
    } = useInventory();

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const searchableValues = (item: InventoryItem) => [
        item.invNr,
        item.hersteller,
        item.modell,
        item.standort,
        item.status,
        item.bereich,
        item.kategorie,
        item.verantwortlicher,
        item.seriennummer,
    ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

    const filteredItems = items.filter((item) => (
        (normalizedQuery === "" || searchableValues(item).some((value) => value.includes(normalizedQuery))) &&
        (filters.status === "" || item.status === filters.status) &&
        (filters.hersteller === "" || item.hersteller === filters.hersteller) &&
        (filters.modell === "" || item.modell === filters.modell) &&
        (filters.bereich === "" || item.bereich === filters.bereich) &&
        (filters.standort === "" || item.standort === filters.standort)
    ));

    const pagedItems = filteredItems.slice(from, to);
    const hasActiveFilters = Boolean(
        filters.status || filters.hersteller || filters.modell || filters.bereich || filters.standort,
    );

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: prev[key] === value ? "" : value,
        }));
        setPage(0);
    };

    const clearFilters = () => {
        setFilters({
            status: "",
            hersteller: "",
            modell: "",
            bereich: "",
            standort: "",
        });
        setPage(0);
    };

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Suche nach Inventarnummer, Modell, Status, Standort..."
                value={searchQuery}
                onChangeText={(value) => {
                    setSearchQuery(value);
                    setPage(0);
                }}
            />
            {isFilterVisible && (
                <View style={styles.filterPanel}>
                    <View style={styles.filterHeader}>
                        <Text variant="titleSmall">Filter</Text>
                        {hasActiveFilters && (
                            <Button compact mode="text" onPress={clearFilters}>
                                Zuruecksetzen
                            </Button>
                        )}
                    </View>
                    <View style={styles.filterGroup}>
                        <Text variant="labelMedium">Status</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {states.map((state) => (
                                <Chip
                                    key={`status-${state.id}`}
                                    selected={filters.status === state.name}
                                    onPress={() => handleFilterChange("status", state.name)}
                                >
                                    {state.name}
                                </Chip>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.filterGroup}>
                        <Text variant="labelMedium">Hersteller</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {brands.map((brand) => (
                                <Chip
                                    key={`hersteller-${brand.id}`}
                                    selected={filters.hersteller === brand.name}
                                    onPress={() => handleFilterChange("hersteller", brand.name)}
                                >
                                    {brand.name}
                                </Chip>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.filterGroup}>
                        <Text variant="labelMedium">Modell</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {models.map((model) => (
                                <Chip
                                    key={`modell-${model.id}`}
                                    selected={filters.modell === model.name}
                                    onPress={() => handleFilterChange("modell", model.name)}
                                >
                                    {model.name}
                                </Chip>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.filterGroup}>
                        <Text variant="labelMedium">Bereich</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {bereiche.map((bereich) => (
                                <Chip
                                    key={`bereich-${bereich.id}`}
                                    selected={filters.bereich === bereich.name}
                                    onPress={() => handleFilterChange("bereich", bereich.name)}
                                >
                                    {bereich.name}
                                </Chip>
                            ))}
                        </ScrollView>
                    </View>
                    <View style={styles.filterGroup}>
                        <Text variant="labelMedium">Standort</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                            {standorte.map((standort) => (
                                <Chip
                                    key={`standort-${standort.id}`}
                                    selected={filters.standort === standort.name}
                                    onPress={() => handleFilterChange("standort", standort.name)}
                                >
                                    {standort.name}
                                </Chip>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            )}
            <DataTable style={styles.table}>
                <DataTable.Header>
                    {columns.map((column) => (
                        <DataTable.Title
                            key={column.key}
                            sortDirection={column.sortDirection}
                            numeric={column.numeric}
                            onPress={() => onSort(column.key)}
                        >
                            {column.title}
                        </DataTable.Title>
                    ))}
                </DataTable.Header>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {pagedItems.map((item) => (
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
                                            <MaterialIcons name="image-not-supported" size={22} color="#888" />
                                        )
                                    ) : (
                                        <Text>{getValueOrFallback(item, column.key)}</Text>
                                    )}
                                </DataTable.Cell>
                            ))}
                        </DataTable.Row>
                    ))}
                    {pagedItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text>Keine Geraete fuer die aktuelle Suche oder Filter gefunden.</Text>
                        </View>
                    )}
                </ScrollView>
            </DataTable>
            <View style={styles.pagination}>
                <DataTable.Pagination
                    page={page}
                    numberOfPages={Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))}
                    onPageChange={setPage}
                    label={filteredItems.length === 0 ? "0-0 of 0" : `${from + 1}-${Math.min(to, filteredItems.length)} of ${filteredItems.length}`}
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
    filterPanel: {
        marginTop: 10,
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        gap: 10,
    },
    filterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    filterGroup: {
        gap: 6,
    },
    chipRow: {
        gap: 8,
        paddingRight: 8,
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
    emptyState: {
        paddingVertical: 24,
        alignItems: "center",
    },
});

export default DataTableComponent;
