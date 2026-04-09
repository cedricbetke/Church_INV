import React from "react";
import { Image, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import {
    Button,
    Chip,
    DataTable,
    IconButton,
    List,
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

const getCompactChipLabel = (value?: string | null, maxLength = 24) => {
    const trimmed = value?.trim();

    if (!trimmed) {
        return "";
    }

    return trimmed.length > 11 ? `${trimmed.slice(0, 10)}…` : trimmed;
};

const getResponsiveChipLabel = (value?: string | null, maxLength = 24) => {
    if (maxLength <= 11) {
        return getCompactChipLabel(value);
    }

    const trimmed = value?.trim();

    if (!trimmed) {
        return "";
    }

    return trimmed.length > maxLength ? `${trimmed.slice(0, maxLength - 3)}...` : trimmed;
};

const normalizeSearchValue = (value: string | number) => String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const getInventorySearchTerms = (item: InventoryItem) => {
    const isoDate = item.kaufdatum ? new Date(item.kaufdatum).toISOString().slice(0, 10) : null;
    const localizedDate = item.kaufdatum
        ? new Intl.DateTimeFormat("de-DE").format(new Date(item.kaufdatum))
        : null;
    const invNrValue = String(item.invNr).trim();

    const rawTerms = [
        invNrValue,
        `INV-${invNrValue}`,
        item.hersteller,
        item.modell,
        item.objekttyp,
        item.standort,
        item.status,
        item.bereich,
        item.kategorie,
        item.verantwortlicher,
        item.seriennummer,
        isoDate,
        localizedDate,
        ...item.attachments.map((attachment) => attachment.name),
    ].filter(Boolean) as Array<string | number>;

    const normalizedTerms = rawTerms
        .map((term) => normalizeSearchValue(term))
        .filter(Boolean);

    return Array.from(new Set(normalizedTerms));
};

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
        objekttypen,
        bereiche,
        standorte,
        filters,
        setFilters,
        isFilterVisible,
        setIsFilterVisible,
        setIsAddPageVisible,
        setScannedCode,
        canManageInventory,
    } = useInventory();
    const { isDarkMode } = useAppThemeMode();
    const { width, height } = useWindowDimensions();
    const [isColumnMenuVisible, setIsColumnMenuVisible] = React.useState(false);
    const [isScannerVisible, setIsScannerVisible] = React.useState(false);
    const [isItemsPerPageMenuVisible, setIsItemsPerPageMenuVisible] = React.useState(false);
    const [expandedFilterKey, setExpandedFilterKey] = React.useState<keyof typeof filters | null>(null);
    const isCompactMobile = width < 640;
    const showScannerAction = Platform.OS !== "web" || isCompactMobile;
    const webSearchbarShadowStyle = Platform.OS === "web" ? { boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.028)" } : null;
    const webTableShadowStyle = Platform.OS === "web" ? { boxShadow: "0px 10px 24px rgba(0, 0, 0, 0.028)" } : null;
    const shouldWrapFilterChips = Platform.OS === "web";
    const filterOptionsMaxHeight = Math.max(180, Math.min(360, Math.floor(height * 0.38)));
    const isDesktopFilterSheet = Platform.OS === "web" && width >= 960;

    const visibleColumns = columns.filter((column) => column.visible);
    const normalizedQuery = normalizeSearchValue(searchQuery);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    const filteredItems = items.filter((item) => {
        const searchTerms = queryTokens.length > 0 ? getInventorySearchTerms(item) : [];

        return (
            (queryTokens.length === 0 || queryTokens.every((token) => searchTerms.some((value) => value.includes(token)))) &&
            (filters.status === "" || item.status === filters.status) &&
            (filters.hersteller === "" || item.hersteller === filters.hersteller) &&
            (filters.modell === "" || item.modell === filters.modell) &&
            (filters.objekttyp === "" || item.objekttyp === filters.objekttyp) &&
            (filters.bereich === "" || item.bereich === filters.bereich) &&
            (filters.standort === "" || item.standort === filters.standort)
        );
    });

    const pagedItems = filteredItems.slice(from, to);
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
    const paginationLabel = filteredItems.length === 0 ? "0-0 von 0" : `${from + 1}-${Math.min(to, filteredItems.length)} von ${filteredItems.length}`;
    const hasActiveFilters = Boolean(
        filters.status || filters.hersteller || filters.modell || filters.objekttyp || filters.bereich || filters.standort,
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
            objekttyp: "",
            bereich: "",
            standort: "",
        });
        setExpandedFilterKey(null);
        setPage(0);
    };

    const toggleExpandedFilter = (filterKey: keyof typeof filters) => {
        setExpandedFilterKey((current) => current === filterKey ? null : filterKey);
    };

    const renderFilterOptions = (
        filterKey: keyof typeof filters,
        options: { id: string | number; name: string }[],
    ) => {
        const chipElements = options.map((option) => (
            <Chip
                key={`${filterKey}-${option.id}`}
                selected={filters[filterKey] === option.name}
                onPress={() => handleFilterChange(filterKey, option.name)}
                compact={isCompactMobile}
                style={[
                    styles.filterChip,
                    shouldWrapFilterChips && styles.filterChipWrapped,
                ]}
                textStyle={styles.filterChipText}
            >
                {getResponsiveChipLabel(option.name, shouldWrapFilterChips ? 32 : 18)}
            </Chip>
        ));

        if (shouldWrapFilterChips) {
            return <View style={styles.chipWrapRow}>{chipElements}</View>;
        }

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {chipElements}
            </ScrollView>
        );
    };

    const renderFilterSection = (
        filterKey: keyof typeof filters,
        label: string,
        options: { id: string | number; name: string }[],
    ) => {
        const selectedValue = filters[filterKey];
        const description = selectedValue
            ? `Aktiv: ${getResponsiveChipLabel(selectedValue, 36)}`
            : `${options.length} Optionen`;

        return (
            <View style={[styles.filterAccordion, isDarkMode && styles.filterAccordionDark]}>
                <List.Accordion
                    title={label}
                    description={description}
                    expanded={expandedFilterKey === filterKey}
                    onPress={() => toggleExpandedFilter(filterKey)}
                    style={styles.filterAccordionHeader}
                    titleStyle={[styles.filterAccordionTitle, isDarkMode && styles.filterAccordionTitleDark]}
                    descriptionStyle={[styles.filterAccordionDescription, isDarkMode && styles.filterAccordionDescriptionDark]}
                    left={(props) => (
                        <List.Icon
                            {...props}
                            icon={selectedValue ? "filter-check-outline" : "filter-outline"}
                            color={selectedValue ? (isDarkMode ? "#8cc8ff" : "#0f5ea8") : props.color}
                        />
                    )}
                >
                    <View style={styles.filterAccordionContent}>
                        {selectedValue ? (
                            <Button
                                compact
                                mode="text"
                                onPress={() => handleFilterChange(filterKey, selectedValue)}
                                style={styles.filterClearButton}
                            >
                                Auswahl entfernen
                            </Button>
                        ) : null}
                        <ScrollView
                            style={[styles.filterOptionsScroll, { maxHeight: filterOptionsMaxHeight }]}
                            contentContainerStyle={styles.filterOptionsScrollContent}
                            nestedScrollEnabled
                            showsVerticalScrollIndicator
                        >
                            {renderFilterOptions(filterKey, options)}
                        </ScrollView>
                    </View>
                </List.Accordion>
            </View>
        );
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
                                style={[styles.searchbar, webSearchbarShadowStyle, isDarkMode && styles.searchbarDark]}
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
                                {canManageInventory && isCompactMobile ? (
                                    <IconButton
                                        icon="plus"
                                        mode="contained-tonal"
                                        size={20}
                                        containerColor={isDarkMode ? "#151c27" : "#ffffff"}
                                        iconColor={isDarkMode ? "#dbe6f5" : "#445160"}
                                        style={[styles.searchActionButton, isDarkMode && styles.searchActionButtonDark]}
                                        onPress={() => setIsAddPageVisible(true)}
                                    />
                                ) : null}
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

            <Portal>
                <Modal
                    visible={isFilterVisible}
                    onDismiss={() => setIsFilterVisible(false)}
                    contentContainerStyle={[
                        styles.filterModalContainer,
                        isDesktopFilterSheet ? styles.filterModalContainerDesktop : styles.filterModalContainerMobile,
                    ]}
                >
                    <View
                        style={[
                            styles.filterSheet,
                            isDesktopFilterSheet ? styles.filterSheetDesktop : styles.filterSheetMobile,
                            isDarkMode && styles.filterSheetDark,
                        ]}
                    >
                    <View style={styles.filterHeader}>
                        <View style={styles.filterHeaderTextBlock}>
                            <Text variant="titleMedium" style={isDarkMode ? styles.filterTitleDark : undefined}>
                                Filter
                            </Text>
                            <Text style={[styles.filterSubtitle, isDarkMode && styles.filterSubtitleDark]}>
                                {hasActiveFilters ? "Aktive Filter anpassen" : "Ergebnisse eingrenzen"}
                            </Text>
                        </View>
                        <View style={styles.filterHeaderActions}>
                            {hasActiveFilters ? (
                                <Button compact mode="text" onPress={clearFilters}>
                                    Zurücksetzen
                                </Button>
                            ) : null}
                            <IconButton
                                icon="close"
                                size={18}
                                onPress={() => setIsFilterVisible(false)}
                                style={styles.filterCloseButton}
                            />
                        </View>
                    </View>

                        <ScrollView
                            style={styles.filterPanelScroll}
                            contentContainerStyle={styles.filterPanelScrollContent}
                            showsVerticalScrollIndicator
                        >
                            {renderFilterSection("status", "Status", states)}
                            {renderFilterSection("hersteller", "Hersteller", brands)}
                            {renderFilterSection("modell", "Modell", models)}
                            {renderFilterSection("objekttyp", "Objekttyp", objekttypen)}
                            {renderFilterSection("bereich", "Bereich", bereiche)}
                            {renderFilterSection("standort", "Standort", standorte)}
                        </ScrollView>
                    </View>
                </Modal>
            </Portal>

            {isCompactMobile ? (
                <View style={[styles.mobileList, isDarkMode && styles.tableDark]}>
                    <ScrollView style={styles.scrollView} contentContainerStyle={styles.mobileListContent}>
                        {pagedItems.map((item) => (
                            <View
                                key={item.invNr}
                                style={[
                                    styles.mobileCard,
                                    isCompactMobile && styles.mobileCardCompact,
                                    isDarkMode && styles.mobileCardDark,
                                ]}
                            >
                                <View style={[styles.mobileCardHeader, isCompactMobile && styles.mobileCardHeaderCompact]}>
                                    <View style={[styles.mobileCardMeta, isCompactMobile && styles.mobileCardMetaCompact]}>
                                        <Text style={[styles.mobileInvNr, isCompactMobile && styles.mobileInvNrCompact, isDarkMode && styles.cellTextDark]}>
                                            #{item.invNr}
                                        </Text>
                                        <Text
                                            numberOfLines={2}
                                            style={[styles.mobileModel, isCompactMobile && styles.mobileModelCompact, isDarkMode && styles.cellTextDark]}
                                        >
                                            {item.modell}
                                        </Text>
                                        <Text
                                            numberOfLines={1}
                                            style={[styles.mobileStatus, isCompactMobile && styles.mobileStatusCompact, isDarkMode && styles.deviceSubtitleDark]}
                                        >
                                            {item.status}
                                        </Text>
                                    </View>
                                    <View style={isCompactMobile ? styles.mobileThumbnailSlotCompact : undefined}>
                                        {item.geraeteFoto ? (
                                            <View
                                                style={[
                                                    styles.thumbnailFrame,
                                                    isCompactMobile && styles.thumbnailFrameCompact,
                                                    isCompactMobile && styles.thumbnailFramePriority,
                                                    isDarkMode && styles.thumbnailFrameDark,
                                                ]}
                                            >
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
                                                    isCompactMobile && styles.photoStatusCompact,
                                                    isCompactMobile && styles.thumbnailFramePriority,
                                                    isDarkMode && styles.photoStatusDark,
                                                ]}
                                            >
                                                <MaterialIcons
                                                    name="image-not-supported"
                                                    size={isCompactMobile ? 16 : 18}
                                                    color={isDarkMode ? "#7f8b99" : "#888"}
                                                />
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <Button
                                    mode="text"
                                    compact={isCompactMobile}
                                    onPress={() => openDetailModal(item)}
                                    contentStyle={[styles.mobileDetailButtonContent, isCompactMobile && styles.mobileDetailButtonContentCompact]}
                                    labelStyle={isCompactMobile ? styles.mobileDetailButtonLabelCompact : undefined}
                                >
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
            <DataTable style={[styles.table, webTableShadowStyle, isDarkMode && styles.tableDark]}>
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

            <View
                style={[
                    styles.pagination,
                    Platform.OS === "web" && isCompactMobile && styles.paginationCompact,
                    isDarkMode && styles.paginationDark,
                ]}
            >
                {Platform.OS === "web" && isCompactMobile ? (
                    <View style={styles.paginationCompactWrap}>
                        <View style={[styles.paginationCompactRow, isDarkMode && styles.paginationCompactRowDark]}>
                            <View style={styles.paginationCompactControls}>
                                <Menu
                                    visible={isItemsPerPageMenuVisible}
                                    onDismiss={() => setIsItemsPerPageMenuVisible(false)}
                                    anchor={(
                                        <Button
                                            compact
                                            mode="outlined"
                                            onPress={() => setIsItemsPerPageMenuVisible(true)}
                                            style={[styles.paginationSizeButton, isDarkMode && styles.paginationSizeButtonDark]}
                                            contentStyle={styles.paginationSizeButtonContent}
                                            labelStyle={[styles.paginationSizeButtonLabel, isDarkMode && styles.paginationSizeButtonLabelDark]}
                                            icon="chevron-down"
                                        >
                                            {itemsPerPage}
                                        </Button>
                                    )}
                                >
                                    {numberOfItemsPerPageList.map((option) => (
                                        <Menu.Item
                                            key={`items-per-page-${option}`}
                                            onPress={() => {
                                                setIsItemsPerPageMenuVisible(false);
                                                onItemsPerPageChange(option);
                                            }}
                                            title={`${option}`}
                                        />
                                    ))}
                                </Menu>
                                <View style={[styles.paginationArrowRow, isDarkMode && styles.paginationArrowRowDark]}>
                                    <IconButton
                                        icon="page-first"
                                        size={18}
                                        disabled={page === 0}
                                        onPress={() => setPage(0)}
                                        style={styles.paginationIconButton}
                                    />
                                    <IconButton
                                        icon="chevron-left"
                                        size={18}
                                        disabled={page === 0}
                                        onPress={() => setPage(Math.max(0, page - 1))}
                                        style={styles.paginationIconButton}
                                    />
                                    <IconButton
                                        icon="chevron-right"
                                        size={18}
                                        disabled={page >= totalPages - 1}
                                        onPress={() => setPage(Math.min(totalPages - 1, page + 1))}
                                        style={styles.paginationIconButton}
                                    />
                                    <IconButton
                                        icon="page-last"
                                        size={18}
                                        disabled={page >= totalPages - 1}
                                        onPress={() => setPage(totalPages - 1)}
                                        style={styles.paginationIconButton}
                                    />
                                </View>
                            </View>
                        </View>
                        <Text style={[styles.paginationCompactLabel, isDarkMode && styles.paginationCompactLabelDark]}>
                            {paginationLabel}
                        </Text>
                    </View>
                ) : Platform.OS === "web" ? (
                    <DataTable.Pagination
                        page={page}
                        numberOfPages={totalPages}
                        onPageChange={setPage}
                        label={paginationLabel}
                        numberOfItemsPerPageList={numberOfItemsPerPageList}
                        numberOfItemsPerPage={itemsPerPage}
                        onItemsPerPageChange={onItemsPerPageChange}
                        showFastPaginationControls
                    />
                ) : (
                    <DataTable.Pagination
                        page={page}
                        numberOfPages={totalPages}
                        onPageChange={setPage}
                        label={paginationLabel}
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
        gap: 6,
    },
    searchbar: {
        flex: 1,
        flexShrink: 1,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#dfe3e8",
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
        padding: 10,
        gap: 10,
    },
    mobileCard: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e5e9ef",
        backgroundColor: "#ffffff",
        padding: 12,
        gap: 10,
        width: "100%",
    },
    mobileCardCompact: {
        padding: 8,
        gap: 6,
        borderRadius: 12,
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
    mobileCardHeaderCompact: {
        alignItems: "center",
        gap: 12,
    },
    mobileCardMeta: {
        flex: 1,
        gap: 2,
        minWidth: 0,
    },
    mobileCardMetaCompact: {
        paddingTop: 4,
        paddingRight: 2,
    },
    mobileInvNr: {
        fontSize: 13,
        fontWeight: "700",
        color: "#5f6877",
    },
    mobileInvNrCompact: {
        fontSize: 11,
    },
    mobileModel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1d1d1f",
    },
    mobileModelCompact: {
        fontSize: 13,
        lineHeight: 16,
    },
    mobileStatus: {
        fontSize: 13,
    },
    mobileStatusCompact: {
        fontSize: 11,
    },
    mobileThumbnailSlotCompact: {
        paddingTop: 2,
        paddingRight: 2,
        alignSelf: "flex-start",
    },
    mobileDetailButtonContent: {
        justifyContent: "flex-start",
    },
    mobileDetailButtonContentCompact: {
        justifyContent: "flex-start",
        minHeight: 24,
    },
    mobileDetailButtonLabelCompact: {
        fontSize: 12,
    },
    table: {
        flex: 1,
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#dfe3e8",
        borderRadius: 20,
        overflow: "hidden",
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
    filterModalContainer: {
        flex: 1,
        margin: 0,
    },
    filterModalContainerDesktop: {
        justifyContent: "flex-start",
        alignItems: "flex-end",
    },
    filterModalContainerMobile: {
        justifyContent: "flex-end",
    },
    filterSheet: {
        backgroundColor: "#ffffff",
        borderColor: "#e5e5ea",
        borderWidth: 1,
        shadowColor: "#111827",
        shadowOpacity: 0.14,
        shadowRadius: 28,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },
    filterSheetDesktop: {
        width: 420,
        maxWidth: "92%",
        height: "100%",
        borderTopLeftRadius: 28,
        borderBottomLeftRadius: 28,
        paddingTop: 18,
        paddingHorizontal: 18,
        paddingBottom: 24,
    },
    filterSheetMobile: {
        width: "100%",
        maxHeight: "82%",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 18,
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    filterSheetDark: {
        backgroundColor: "#151922",
        borderColor: "#2a3340",
    },
    filterHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        paddingBottom: 12,
    },
    filterHeaderTextBlock: {
        flex: 1,
        gap: 2,
    },
    filterHeaderActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    filterTitleDark: {
        color: "#eef4fb",
    },
    filterSubtitle: {
        color: "#6b7280",
        fontSize: 13,
    },
    filterSubtitleDark: {
        color: "#9aa7b8",
    },
    filterCloseButton: {
        margin: 0,
    },
    filterPanelScroll: {
        flex: 1,
    },
    filterPanelScrollContent: {
        gap: 12,
        paddingBottom: 16,
    },
    filterAccordion: {
        borderWidth: 1,
        borderColor: "#e8eaee",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fbfcfe",
    },
    filterAccordionDark: {
        backgroundColor: "#11161d",
        borderColor: "#2a3340",
    },
    filterAccordionHeader: {
        backgroundColor: "transparent",
    },
    filterAccordionTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1f2937",
    },
    filterAccordionTitleDark: {
        color: "#eef4fb",
    },
    filterAccordionDescription: {
        color: "#6b7280",
        fontSize: 12,
    },
    filterAccordionDescriptionDark: {
        color: "#9aa7b8",
    },
    filterAccordionContent: {
        paddingHorizontal: 14,
        paddingBottom: 14,
        gap: 10,
    },
    filterOptionsScroll: {
        width: "100%",
    },
    filterOptionsScrollContent: {
        paddingRight: 4,
    },
    filterClearButton: {
        alignSelf: "flex-start",
        marginLeft: -8,
    },
    chipWrapRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: 8,
        width: "100%",
    },
    chipRow: {
        gap: 8,
        paddingRight: 8,
    },
    filterChip: {
        maxWidth: "100%",
    },
    filterChipWrapped: {
        maxWidth: 260,
    },
    filterChipText: {
        fontSize: 13,
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
    paginationCompact: {
        minHeight: 0,
        paddingVertical: 0,
    },
    paginationCompactWrap: {
        width: "100%",
        alignItems: "center",
        gap: 2,
        paddingHorizontal: 0,
        paddingTop: 2,
        paddingBottom: 2,
    },
    paginationCompactRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 0,
        backgroundColor: "transparent",
        borderWidth: 0,
    },
    paginationCompactRowDark: {
        backgroundColor: "transparent",
    },
    paginationCompactControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
    },
    paginationArrowRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        paddingLeft: 10,
        borderLeftWidth: 1,
        borderLeftColor: "#e5e7eb",
    },
    paginationArrowRowDark: {
        borderLeftColor: "#334154",
    },
    paginationSizeButton: {
        margin: 0,
        minWidth: 62,
        borderRadius: 14,
        borderColor: "transparent",
        backgroundColor: "#f7f9fc",
    },
    paginationSizeButtonDark: {
        backgroundColor: "#1d2633",
        borderColor: "transparent",
    },
    paginationSizeButtonContent: {
        height: 32,
        flexDirection: "row-reverse",
    },
    paginationSizeButtonLabel: {
        fontSize: 13,
    },
    paginationSizeButtonLabelDark: {
        color: "#eef4fb",
    },
    paginationIconButton: {
        margin: 0,
        width: 30,
        height: 30,
    },
    paginationCompactLabel: {
        fontSize: 12,
        color: "#6b7280",
        textAlign: "center",
        lineHeight: 15,
        width: "100%",
    },
    paginationCompactLabelDark: {
        color: "#aab4c2",
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
    photoStatusCompact: {
        width: 64,
        height: 64,
        borderRadius: 14,
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
    thumbnailFrameCompact: {
        width: 72,
        height: 72,
        borderRadius: 14,
    },
    thumbnailFramePriority: {
        borderWidth: 1,
        borderColor: "#c9d5e3",
        backgroundColor: "#f3f6fa",
        shadowColor: "#1f2937",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
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
