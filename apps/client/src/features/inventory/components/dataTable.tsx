import React from "react";
import { Image, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import {
    Button,
    Chip,
    DataTable,
    IconButton,
    Menu,
    Modal,
    Portal,
    Searchbar,
    Text,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { getValueOrFallback } from "@/src/shared/utils/helpers";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import QrCodeScanner from "@/src/features/scanner/components/QrCodeScanner";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

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
    const { isDarkMode } = useAppThemeMode();
    const { width } = useWindowDimensions();
    const [isColumnMenuVisible, setIsColumnMenuVisible] = React.useState(false);
    const [isScannerVisible, setIsScannerVisible] = React.useState(false);
    const isCompactMobile = width < 640;
    const showScannerAction = Platform.OS !== "web" || isCompactMobile;

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
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
            <View style={styles.toolbarSection}>
                <View style={[styles.toolbarRow, isCompactMobile && styles.toolbarRowMobile]}>
                    <View style={styles.searchbarContainer}>
                        <View style={[styles.searchToolsRow, isCompactMobile && styles.searchToolsRowMobile]}>
                            <Searchbar
                                placeholder="Suche nach Inventarnummer, Modell, Status, Standort..."
                                value={searchQuery}
                                onChangeText={(value) => {
                                    setSearchQuery(value);
                                    setPage(0);
                                }}
                                inputStyle={[styles.searchbarInput, isDarkMode && styles.searchbarInputDark]}
                                iconColor={isDarkMode ? "#94a3b8" : "#8e8e93"}
                                elevation={0}
                                style={[styles.searchbar, isDarkMode && styles.searchbarDark]}
                            />
                            <View style={styles.searchActions}>
                                {showScannerAction ? (
                                    <IconButton
                                        icon="qrcode-scan"
                                        mode="contained-tonal"
                                        size={20}
                                        containerColor={isDarkMode ? "#151c27" : "#ffffff"}
                                        iconColor={isDarkMode ? "#dbe6f5" : "#445160"}
                                        style={[styles.searchActionButton, isDarkMode && styles.searchActionButtonDark]}
                                        onPress={() => setIsScannerVisible(true)}
                                    />
                                ) : null}
                                <IconButton
                                    icon="filter"
                                    mode="contained-tonal"
                                    size={20}
                                    containerColor={
                                        isFilterVisible || hasActiveFilters
                                            ? (isDarkMode ? "#1d3a59" : "#e8f1ff")
                                            : (isDarkMode ? "#151c27" : "#ffffff")
                                    }
                                    iconColor={
                                        isFilterVisible || hasActiveFilters
                                            ? (isDarkMode ? "#8cc8ff" : "#0f5ea8")
                                            : (isDarkMode ? "#dbe6f5" : "#445160")
                                    }
                                    style={[styles.searchActionButton, isDarkMode && styles.searchActionButtonDark]}
                                    onPress={() => setIsFilterVisible((prev) => !prev)}
                                />
                            </View>
                        </View>
                    </View>

                    {!isCompactMobile ? (
                        <View style={[styles.toolbarAction, isCompactMobile && styles.toolbarActionMobile]}>
                            <Menu
                                visible={isColumnMenuVisible}
                                onDismiss={() => setIsColumnMenuVisible(false)}
                                anchor={(
                                    <Button
                                        mode="outlined"
                                        compact
                                        icon="table-column"
                                        onPress={() => setIsColumnMenuVisible(true)}
                                        style={[styles.columnButton, isDarkMode && styles.columnButtonDark]}
                                        contentStyle={styles.columnButtonContent}
                                        labelStyle={[styles.columnButtonLabel, isDarkMode && styles.columnButtonLabelDark]}
                                    >
                                        Spalten
                                    </Button>
                                )}
                                contentStyle={[styles.columnMenu, isDarkMode && styles.columnMenuDark]}
                            >
                                {columns.map((column) => (
                                    <Menu.Item
                                        key={column.key}
                                        title={column.title}
                                        leadingIcon={column.visible ? "checkbox-marked-outline" : "checkbox-blank-outline"}
                                        trailingIcon={column.locked ? "lock-outline" : undefined}
                                        onPress={() => {
                                            if (!column.locked) {
                                                onToggleColumnVisibility(column.key);
                                            }
                                        }}
                                    />
                                ))}
                            </Menu>
                        </View>
                    ) : null}
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
                <View style={[styles.filterPanel, isDarkMode && styles.filterPanelDark]}>
                    <View style={styles.filterHeader}>
                        <Text variant="titleSmall" style={isDarkMode ? styles.filterTitleDark : undefined}>
                            Filter
                        </Text>
                        {hasActiveFilters && (
                            <Button compact mode="text" onPress={clearFilters}>
                                Zurücksetzen
                            </Button>
                        )}
                    </View>

                    <View style={styles.filterGroup}>
                        <Text variant="labelMedium" style={isDarkMode ? styles.filterLabelDark : undefined}>Status</Text>
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
                        <Text variant="labelMedium" style={isDarkMode ? styles.filterLabelDark : undefined}>Hersteller</Text>
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
                        <Text variant="labelMedium" style={isDarkMode ? styles.filterLabelDark : undefined}>Modell</Text>
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
                        <Text variant="labelMedium" style={isDarkMode ? styles.filterLabelDark : undefined}>Bereich</Text>
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
                        <Text variant="labelMedium" style={isDarkMode ? styles.filterLabelDark : undefined}>Standort</Text>
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

            {isCompactMobile ? (
                <View style={[styles.mobileList, isDarkMode && styles.tableDark]}>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.mobileListContent}>
                        {pagedItems.map((item) => (
                            <View key={item.invNr} style={[styles.mobileCard, isDarkMode && styles.mobileCardDark]}>
                                <View style={styles.mobileCardHeader}>
                                    <View style={styles.mobileCardMeta}>
                                        <Text style={[styles.mobileInvNr, isDarkMode && styles.cellTextDark]}>#{item.invNr}</Text>
                                        <Text style={[styles.mobileModel, isDarkMode && styles.cellTextDark]}>{item.modell}</Text>
                                        <Text style={[styles.mobileStatus, isDarkMode && styles.deviceSubtitleDark]}>{item.status}</Text>
                                    </View>
                                    {item.geraeteFoto ? (
                                        <View style={[styles.thumbnailFrame, isDarkMode && styles.thumbnailFrameDark]}>
                                            <Image
                                                source={{ uri: item.geraeteFotoThumb ?? item.geraeteFoto }}
                                                style={styles.image}
                                                resizeMode="cover"
                                            />
                                        </View>
                                    ) : (
                                        <View style={[styles.photoStatus, isDarkMode && styles.photoStatusDark]}>
                                            <MaterialIcons
                                                name="image-not-supported"
                                                size={18}
                                                color={isDarkMode ? "#7f8b99" : "#888"}
                                            />
                                        </View>
                                    )}
                                </View>
                                <View style={styles.mobileFacts}>
                                    <Chip compact style={styles.mobileChip}>{item.standort}</Chip>
                                    <Chip compact style={styles.mobileChip}>{item.bereich}</Chip>
                                    {item.hersteller ? <Chip compact style={styles.mobileChip}>{item.hersteller}</Chip> : null}
                                </View>
                                <Button mode="text" onPress={() => openDetailModal(item)} contentStyle={styles.mobileDetailButtonContent}>
                                    Details ansehen
                                </Button>
                            </View>
                        ))}

                        {pagedItems.length === 0 && (
                            <View style={styles.emptyState}>
                                <Text style={isDarkMode ? styles.emptyStateTextDark : undefined}>
                                    Keine Geräte für die aktuelle Suche oder Filter gefunden.
                                </Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            ) : (
            <DataTable style={[styles.table, isDarkMode && styles.tableDark]}>
                <DataTable.Header style={[styles.tableHeader, isDarkMode && styles.tableHeaderDark]}>
                    {visibleColumns.map((column) => (
                        <DataTable.Title
                            key={column.key}
                            sortDirection={column.sortDirection}
                            numeric={column.numeric}
                            onPress={() => onSort(column.key)}
                            textStyle={[styles.tableHeaderText, isDarkMode && styles.tableHeaderTextDark]}
                        >
                            {column.title}
                        </DataTable.Title>
                    ))}
                </DataTable.Header>

                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {pagedItems.map((item) => (
                        <DataTable.Row
                            key={item.invNr}
                            onPress={() => openDetailModal(item)}
                            style={[styles.tableRow, isDarkMode && styles.tableRowDark]}
                        >
                            {visibleColumns.map((column) => (
                                <DataTable.Cell key={column.key} numeric={column.numeric}>
                                    {column.key === "foto" ? (
                                        item.geraeteFoto ? (
                                            <View style={[styles.thumbnailFrame, isDarkMode && styles.thumbnailFrameDark]}>
                                                <Image
                                                    source={{ uri: item.geraeteFotoThumb ?? item.geraeteFoto }}
                                                    style={styles.image}
                                                    resizeMode="cover"
                                                />
                                            </View>
                                        ) : (
                                            <View
                                                style={[
                                                    styles.photoStatus,
                                                    isDarkMode && styles.photoStatusDark,
                                                ]}
                                            >
                                                <MaterialIcons
                                                    name="image-not-supported"
                                                    size={18}
                                                    color={isDarkMode ? "#7f8b99" : "#888"}
                                                />
                                            </View>
                                        )
                                    ) : (
                                        <Text style={[styles.cellText, isDarkMode && styles.cellTextDark]}>
                                            {getValueOrFallback(item, column.key)}
                                        </Text>
                                    )}
                                </DataTable.Cell>
                            ))}
                        </DataTable.Row>
                    ))}

                    {pagedItems.length === 0 && (
                        <View style={styles.emptyState}>
                            <Text style={isDarkMode ? styles.emptyStateTextDark : undefined}>
                                Keine Geräte für die aktuelle Suche oder Filter gefunden.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </DataTable>
            )}

            <View style={[styles.pagination, isDarkMode && styles.paginationDark]}>
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
    containerDark: {
        backgroundColor: "#0f1115",
    },
    toolbarSection: {
        minHeight: 60,
        justifyContent: "center",
        marginBottom: 0,
        position: "relative",
    },
    toolbarRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
    },
    toolbarRowMobile: {
        flexDirection: "column",
        alignItems: "stretch",
        gap: 10,
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
        gap: 8,
    },
    searchToolsRowMobile: {
        width: "100%",
    },
    searchbar: {
        flex: 1,
        flexShrink: 1,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#dfe3e8",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.028,
        shadowRadius: 12,
    },
    searchbarDark: {
        backgroundColor: "#151922",
        borderColor: "#2a3340",
    },
    searchbarInput: {
        color: "#1d1d1f",
        fontSize: 15,
    },
    searchbarInputDark: {
        color: "#f4f7fb",
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
    searchActionButtonDark: {
        borderColor: "#2a3340",
    },
    toolbarAction: {
        position: Platform.OS === "web" ? "absolute" : "relative",
        right: Platform.OS === "web" ? 0 : undefined,
        top: Platform.OS === "web" ? 0 : undefined,
        bottom: Platform.OS === "web" ? 0 : undefined,
        alignItems: Platform.OS === "web" ? "flex-end" : "center",
        justifyContent: "center",
        paddingLeft: Platform.OS === "web" ? 12 : 0,
    },
    toolbarActionMobile: {
        position: "relative",
        right: undefined,
        top: undefined,
        bottom: undefined,
        alignItems: "stretch",
        paddingLeft: 0,
        marginTop: 8,
    },
    columnButton: {
        backgroundColor: "#ffffff",
        borderColor: "#dfe3e8",
        borderRadius: 14,
        minHeight: 40,
    },
    columnButtonDark: {
        backgroundColor: "#151922",
        borderColor: "#2a3340",
    },
    columnButtonContent: {
        minHeight: 40,
        paddingHorizontal: 2,
    },
    columnButtonLabel: {
        color: "#3a3a3c",
        fontSize: 13,
    },
    columnButtonLabelDark: {
        color: "#dbe6f5",
    },
    columnMenu: {
        backgroundColor: "#ffffff",
    },
    columnMenuDark: {
        backgroundColor: "#151922",
    },
    scannerModal: {
        height: 500,
        padding: 20,
    },
    mobileList: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dfe3e8",
        borderRadius: 20,
        overflow: "hidden",
    },
    mobileListContent: {
        padding: 12,
        gap: 12,
    },
    mobileCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e5e9ef",
        backgroundColor: "#ffffff",
        padding: 12,
        gap: 10,
    },
    mobileCardDark: {
        backgroundColor: "#151922",
        borderColor: "#2a3340",
    },
    mobileCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
    },
    mobileCardMeta: {
        flex: 1,
        gap: 4,
    },
    mobileInvNr: {
        fontSize: 13,
        fontWeight: "700",
        color: "#5f6877",
    },
    mobileModel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1d1d1f",
    },
    mobileStatus: {
        fontSize: 13,
    },
    mobileFacts: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    mobileChip: {
        alignSelf: "flex-start",
    },
    mobileDetailButtonContent: {
        justifyContent: "flex-start",
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
    tableDark: {
        backgroundColor: "#151922",
        borderColor: "#2a3340",
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
    filterPanelDark: {
        backgroundColor: "#151922",
        borderColor: "#2a3340",
    },
    filterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    filterTitleDark: {
        color: "#eef4fb",
    },
    filterGroup: {
        gap: 6,
    },
    filterLabelDark: {
        color: "#c8d1dd",
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
    tableHeaderDark: {
        backgroundColor: "#1b212c",
        borderBottomColor: "#2a3340",
    },
    tableHeaderText: {
        color: "#7c7c84",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.65,
    },
    tableHeaderTextDark: {
        color: "#95a1b2",
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
    tableRowDark: {
        borderBottomColor: "#202733",
    },
    cellText: {
        color: "#1d1d1f",
        fontSize: 14,
    },
    cellTextDark: {
        color: "#f4f7fb",
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
    paginationDark: {
        backgroundColor: "#1b212c",
        borderTopColor: "#2a3340",
    },
    photoStatus: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f1f3f6",
        borderWidth: 1,
        borderColor: "#e2e7ee",
    },
    photoStatusDark: {
        backgroundColor: "#11161d",
        borderColor: "#2a3340",
    },
    thumbnailFrame: {
        width: 42,
        height: 42,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "#eef2f6",
        borderWidth: 1,
        borderColor: "#dbe3ec",
    },
    thumbnailFrameDark: {
        backgroundColor: "#11161d",
        borderColor: "#2a3340",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    emptyState: {
        paddingVertical: 24,
        alignItems: "center",
    },
    emptyStateTextDark: {
        color: "#95a1b2",
    },
});

export default DataTableComponent;
