import React from "react";
import { Button, Chip, DataTable, IconButton, Menu, Modal, Portal, Searchbar, Text } from "react-native-paper";
import { ScrollView, View, Image, StyleSheet, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getValueOrFallback } from "@/src/shared/utils/helpers";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import QrCodeScanner from "@/src/features/scanner/components/QrCodeScanner";

export interface Column {
    sortDirection: "ascending" | "descending" | undefined;
    title: string;
    key: keyof InventoryItem | "foto";
    numeric: boolean;
    visible: boolean;
    locked?: boolean;
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
    onToggleColumnVisibility: (key: Column["key"]) => void;
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
    onToggleColumnVisibility,
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
        setIsFilterVisible,
        setScannedCode,
    } = useInventory();
    const [isColumnMenuVisible, setIsColumnMenuVisible] = React.useState(false);
    const [isScannerVisible, setIsScannerVisible] = React.useState(false);
    const visibleColumns = columns.filter((column) => column.visible);

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
            <View style={styles.toolbarSection}>
                <View style={styles.toolbarRow}>
                <View style={styles.searchbarContainer}>
                    <View style={styles.searchToolsRow}>
                        <Searchbar
                            placeholder="Suche nach Inventarnummer, Modell, Status, Standort..."
                            value={searchQuery}
                            onChangeText={(value) => {
                                setSearchQuery(value);
                                setPage(0);
                            }}
                            inputStyle={styles.searchbarInput}
                            iconColor="#8e8e93"
                            elevation={0}
                            style={styles.searchbar}
                        />
                        <View style={styles.searchActions}>
                            <IconButton
                                icon="qrcode-scan"
                                mode="contained-tonal"
                                size={20}
                                containerColor="#ffffff"
                                iconColor="#445160"
                                style={styles.searchActionButton}
                                onPress={() => setIsScannerVisible(true)}
                            />
                            <IconButton
                                icon="filter"
                                mode="contained-tonal"
                                size={20}
                                containerColor={isFilterVisible || hasActiveFilters ? "#e8f1ff" : "#ffffff"}
                                iconColor={isFilterVisible || hasActiveFilters ? "#0f5ea8" : "#445160"}
                                style={styles.searchActionButton}
                                onPress={() => setIsFilterVisible((prev) => !prev)}
                            />
                        </View>
                    </View>
                </View>
                    <View style={styles.toolbarAction}>
                        <Menu
                            visible={isColumnMenuVisible}
                            onDismiss={() => setIsColumnMenuVisible(false)}
                            anchor={(
                                <Button
                                    mode="outlined"
                                    compact
                                    icon="table-column"
                                    onPress={() => setIsColumnMenuVisible(true)}
                                    style={styles.columnButton}
                                    contentStyle={styles.columnButtonContent}
                                    labelStyle={styles.columnButtonLabel}
                                >
                                    Spalten
                                </Button>
                            )}
                            contentStyle={styles.columnMenu}
                        >
                            {columns.map((column) => (
                                <Menu.Item
                                    key={column.key}
                                    title={column.title}
                                    leadingIcon={
                                        column.visible ? "checkbox-marked-outline" : "checkbox-blank-outline"
                                    }
                                    trailingIcon={column.locked ? "lock-outline" : undefined}
                                    onPress={() => {
                                        if (column.locked) {
                                            return;
                                        }
                                        onToggleColumnVisibility(column.key);
                                    }}
                                />
                            ))}
                        </Menu>
                    </View>
                </View>
            </View>
            <Portal>
                <Modal visible={isScannerVisible} onDismiss={() => setIsScannerVisible(false)}>
                    <View style={styles.scannerModal}>
                        <QrCodeScanner
                            setShowModal={setIsScannerVisible}
                            onScan={(value) => setScannedCode(value)}
                        />
                    </View>
                </Modal>
            </Portal>
            {isFilterVisible && (
                <View style={styles.filterPanel}>
                    <View style={styles.filterHeader}>
                        <Text variant="titleSmall">Filter</Text>
                        {hasActiveFilters && (
                            <Button compact mode="text" onPress={clearFilters}>
                                Zurücksetzen
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
                <DataTable.Header style={styles.tableHeader}>
                    {visibleColumns.map((column) => (
                        <DataTable.Title
                            key={column.key}
                            sortDirection={column.sortDirection}
                            numeric={column.numeric}
                            onPress={() => onSort(column.key)}
                            textStyle={styles.tableHeaderText}
                        >
                            {column.title}
                        </DataTable.Title>
                    ))}
                </DataTable.Header>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {pagedItems.map((item) => (
                        <DataTable.Row key={item.invNr} onPress={() => openDetailModal(item)} style={styles.tableRow}>
                            {visibleColumns.map((column) => (
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
                                        <Text style={styles.cellText}>{getValueOrFallback(item, column.key)}</Text>
                                    )}
                                </DataTable.Cell>
                            ))}
                        </DataTable.Row>
                    ))}
                    {pagedItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text>Keine Geräte für die aktuelle Suche oder Filter gefunden.</Text>
                        </View>
                    )}
                </ScrollView>
            </DataTable>
            <View style={styles.pagination}>
                {Platform.OS === "web" ? (
                    <DataTable.Pagination
                        page={page}
                        numberOfPages={Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))}
                        onPageChange={setPage}
                        label={filteredItems.length === 0 ? "0-0 von 0" : `${from + 1}-${Math.min(to, filteredItems.length)} von ${filteredItems.length}`}
                        numberOfItemsPerPageList={numberOfItemsPerPageList}
                        numberOfItemsPerPage={itemsPerPage}
                        onItemsPerPageChange={onItemsPerPageChange}
                        showFastPaginationControls
                    />
                ) : (
                    <DataTable.Pagination
                        page={page}
                        numberOfPages={Math.max(1, Math.ceil(filteredItems.length / itemsPerPage))}
                        onPageChange={setPage}
                        label={filteredItems.length === 0 ? "0-0 von 0" : `${from + 1}-${Math.min(to, filteredItems.length)} von ${filteredItems.length}`}
                        showFastPaginationControls
                    />
                )}
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
        backgroundColor: "#f5f5f7",
    },
    toolbarSection: {
        minHeight: 76,
        justifyContent: "center",
        marginBottom: 2,
        position: "relative",
    },
    toolbarRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    searchbarContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    searchToolsRow: {
        width: Platform.OS === "web" ? "72%" : "100%",
        maxWidth: 780,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    searchbar: {
        flex: 1,
        flexShrink: 1,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#dfe3e8",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.035,
        shadowRadius: 16,
    },
    searchbarInput: {
        color: "#1d1d1f",
        fontSize: 15,
    },
    searchActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    searchActionButton: {
        margin: 0,
        borderWidth: 1,
        borderColor: "#dfe3e8",
    },
    toolbarAction: {
        position: Platform.OS === "web" ? "absolute" : "relative",
        right: Platform.OS === "web" ? 0 : undefined,
        top: Platform.OS === "web" ? 0 : undefined,
        bottom: Platform.OS === "web" ? 0 : undefined,
        alignItems: Platform.OS === "web" ? "flex-end" : "center",
        justifyContent: "center",
        paddingLeft: Platform.OS === "web" ? 16 : 0,
    },
    columnButton: {
        backgroundColor: "#ffffff",
        borderColor: "#dfe3e8",
        borderRadius: 14,
        minHeight: 42,
    },
    columnButtonContent: {
        minHeight: 42,
        paddingHorizontal: 2,
    },
    columnButtonLabel: {
        color: "#3a3a3c",
        fontSize: 13,
    },
    columnMenu: {
        backgroundColor: "#ffffff",
    },
    scannerModal: {
        height: 500,
        padding: 20,
    },
    table: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dfe3e8",
        borderRadius: 20,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.028,
        shadowRadius: 24,
    },
    filterPanel: {
        marginTop: 4,
        marginBottom: 14,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#e5e5ea",
        gap: 12,
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
    tableHeader: {
        backgroundColor: "#f7f7f9",
        borderBottomWidth: 1,
        borderBottomColor: "#e8eaee",
        minHeight: 44,
    },
    tableHeaderText: {
        color: "#7c7c84",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.65,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    tableRow: {
        borderBottomWidth: 1,
        borderBottomColor: "#eff1f4",
        minHeight: 56,
    },
    cellText: {
        color: "#1d1d1f",
        fontSize: 14,
    },
    pagination: {
        width: "100%",
        marginTop: "auto",
        backgroundColor: "#f9f9fb",
        minHeight: 60,
        paddingVertical: 4,
        justifyContent: "center",
        borderTopWidth: 1,
        borderTopColor: "#e8eaee",
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
