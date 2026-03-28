import React, { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { FlatList, Linking, Platform, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import axios from "axios";
import { Appbar, Button, Card, Chip, Checkbox, Divider, IconButton, Modal, Portal, Surface, Text, TextInput } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";
import buchungService from "@/src/features/bookings/services/buchungService";
import { Booking } from "@/src/features/bookings/types/Booking";
import pcoMappingService from "@/src/features/bookings/services/pcoMappingService";
import { PcoMapping } from "@/src/features/bookings/types/PcoMapping";
import pcoPlanSuggestionService from "@/src/features/bookings/services/pcoPlanSuggestionService";
import { PcoPlanSuggestion } from "@/src/features/bookings/types/PcoPlanSuggestion";
import InventoryItem from "@/src/features/inventory/types/InventoryItem";
import QrCodeScanner from "@/src/features/scanner/components/QrCodeScanner";

const parseDateInput = (value: string) => {
    const normalized = value.trim().replace(" ", "T");
    const parsed = new Date(normalized);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)) {
        return `${normalized}:00`;
    }

    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(normalized)) {
        return normalized;
    }

    return normalized;
};

const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatDateForDisplayInput = (value: string) => {
    const parsed = new Date(parseDateInput(value) ?? value);

    if (Number.isNaN(parsed.getTime())) {
        return value;
    }

    return formatDateForInput(parsed);
};

const formatBookingDate = (value: string) =>
    new Date(value).toLocaleString("de-DE", {
        dateStyle: "medium",
        timeStyle: "short",
    });

const WebDateTimeField = ({
    label,
    value,
    onChange,
    isDarkMode,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    isDarkMode: boolean;
}) => (
    <View style={styles.webDateField}>
        <View style={[styles.webDateOutline, isDarkMode && styles.webDateOutlineDark]}>
            <Text style={[styles.webDateLabel, isDarkMode && styles.webDateLabelDark]}>{label}</Text>
        </View>
        <input
            type="datetime-local"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            style={{
                width: "100%",
                height: 56,
                borderRadius: 4,
                border: `1px solid ${isDarkMode ? "#6b7280" : "#79747e"}`,
                paddingInline: 14,
                backgroundColor: isDarkMode ? "#151922" : "#f7f7f9",
                color: isDarkMode ? "#f5f7fb" : "#111827",
                fontSize: 15,
                boxSizing: "border-box",
            }}
        />
    </View>
);

const formatDateRange = (booking: Booking) =>
    `${formatBookingDate(booking.startDatum)} bis ${formatBookingDate(booking.endDatum)}`;

const getCalendarDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const alignEndDateWithStart = ({
    previousStartValue,
    nextStartValue,
    currentEndValue,
}: {
    previousStartValue: string;
    nextStartValue: string;
    currentEndValue: string;
}) => {
    const nextStartRaw = parseDateInput(nextStartValue);

    if (!nextStartRaw) {
        return currentEndValue;
    }

    const nextStartDate = new Date(nextStartRaw);
    const currentEndRaw = parseDateInput(currentEndValue);

    if (!currentEndRaw) {
        return formatDateForInput(nextStartDate);
    }

    const currentEndDate = new Date(currentEndRaw);
    const previousStartRaw = parseDateInput(previousStartValue);
    const shouldMoveEndDate =
        !previousStartRaw ||
        getCalendarDateKey(currentEndDate) === getCalendarDateKey(new Date(previousStartRaw)) ||
        currentEndDate.getTime() < nextStartDate.getTime();

    if (!shouldMoveEndDate) {
        return currentEndValue;
    }

    const shiftedEndDate = new Date(currentEndDate);
    shiftedEndDate.setFullYear(nextStartDate.getFullYear(), nextStartDate.getMonth(), nextStartDate.getDate());

    if (shiftedEndDate.getTime() < nextStartDate.getTime()) {
        return formatDateForInput(nextStartDate);
    }

    return formatDateForInput(shiftedEndDate);
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const startOfWeek = (date: Date) => {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);
    return result;
};

const endOfWeek = (date: Date) => {
    const result = startOfWeek(date);
    result.setDate(result.getDate() + 6);
    result.setHours(23, 59, 59, 999);
    return result;
};

const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);

const getDayKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const isSameDay = (left: Date, right: Date) => getDayKey(left) === getDayKey(right);

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

type BookingViewMode = "list" | "calendar";

const BookingCalendarPanel = React.memo(
    ({
        isDarkMode,
        isLoading,
        bookings,
        canManageInventory,
        onDeleteBooking,
        isCompactViewport,
        bookingViewMode,
        onChangeViewMode,
    }: {
        isDarkMode: boolean;
        isLoading: boolean;
        bookings: Booking[];
        canManageInventory: boolean;
        onDeleteBooking: (bookingId: number) => void;
        isCompactViewport: boolean;
        bookingViewMode: BookingViewMode;
        onChangeViewMode: (mode: BookingViewMode) => void;
    }) => {
        const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
        const [selectedDate, setSelectedDate] = useState(() => new Date());

        const monthLabel = useMemo(
            () =>
                visibleMonth.toLocaleDateString("de-DE", {
                    month: "long",
                    year: "numeric",
                }),
            [visibleMonth],
        );

        const calendarDays = useMemo(() => {
            const monthStart = startOfMonth(visibleMonth);
            const monthEnd = endOfMonth(visibleMonth);
            const gridStart = startOfWeek(monthStart);
            const gridEnd = endOfWeek(monthEnd);
            const days: Date[] = [];

            for (let cursor = new Date(gridStart); cursor <= gridEnd; cursor = addDays(cursor, 1)) {
                days.push(new Date(cursor));
            }

            return days;
        }, [visibleMonth]);

        const bookingsByDay = useMemo(() => {
            const map = new Map<string, Booking[]>();

            bookings.forEach((booking) => {
                const start = new Date(booking.startDatum);
                const end = new Date(booking.endDatum);
                const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());

                while (cursor <= last) {
                    const key = getDayKey(cursor);
                    const current = map.get(key) ?? [];
                    current.push(booking);
                    map.set(key, current);
                    cursor.setDate(cursor.getDate() + 1);
                }
            });

            return map;
        }, [bookings]);

        const selectedDayBookings = useMemo(() => {
            const selectedKey = getDayKey(selectedDate);
            return (bookingsByDay.get(selectedKey) ?? []).slice().sort((left, right) => {
                return new Date(left.startDatum).getTime() - new Date(right.startDatum).getTime();
            });
        }, [bookingsByDay, selectedDate]);

        useEffect(() => {
            const visibleKeys = new Set(calendarDays.map(getDayKey));
            if (!visibleKeys.has(getDayKey(selectedDate))) {
                setSelectedDate(calendarDays[0] ?? new Date());
            }
        }, [calendarDays, selectedDate]);

        return (
            <Surface
                style={[
                    styles.listCard,
                    isDarkMode && styles.listCardDark,
                    isCompactViewport && styles.listCardCompact,
                ]}
            >
                <View style={styles.listHeader}>
                    <View style={styles.listHeaderText}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Buchungskalender</Text>
                        <Text style={[styles.sectionHint, isDarkMode && styles.sectionHintDark]}>
                            Monatliche Übersicht über Zeiträume und Überschneidungen.
                        </Text>
                    </View>
                    <View style={styles.listHeaderControls}>
                        <View style={styles.bookingViewModeSwitch}>
                            <Button
                                compact
                                mode={bookingViewMode === "list" ? "contained-tonal" : "text"}
                                onPress={() => onChangeViewMode("list")}
                                style={[
                                    styles.bookingViewModeButton,
                                    bookingViewMode === "list" && styles.bookingViewModeButtonActive,
                                ]}
                            >
                                Liste
                            </Button>
                            <Button
                                compact
                                mode={bookingViewMode === "calendar" ? "contained-tonal" : "text"}
                                onPress={() => onChangeViewMode("calendar")}
                                style={[
                                    styles.bookingViewModeButton,
                                    bookingViewMode === "calendar" && styles.bookingViewModeButtonActive,
                                ]}
                            >
                                Kalender
                            </Button>
                        </View>
                        <Chip compact style={isCompactViewport ? styles.listHeaderChipCompact : undefined}>
                            {isLoading ? "laedt" : `${bookings.length} Eintraege`}
                        </Chip>
                    </View>
                </View>

                <View style={styles.calendarToolbar}>
                    <Button compact mode="text" onPress={() => setVisibleMonth((current) => addMonths(current, -1))}>
                        Zurück
                    </Button>
                    <Text style={[styles.calendarMonthLabel, isDarkMode && styles.calendarMonthLabelDark]}>{monthLabel}</Text>
                    <Button compact mode="text" onPress={() => setVisibleMonth((current) => addMonths(current, 1))}>
                        Weiter
                    </Button>
                </View>

                <ScrollView horizontal={isCompactViewport} showsHorizontalScrollIndicator={false}>
                    <View style={isCompactViewport ? styles.calendarScrollContent : undefined}>
                        <View style={styles.calendarWeekdayRow}>
                            {weekdayLabels.map((label) => (
                                <Text key={label} style={[styles.calendarWeekday, isDarkMode && styles.calendarWeekdayDark]}>
                                    {label}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.calendarGrid}>
                            {calendarDays.map((day) => {
                                const dayKey = getDayKey(day);
                                const dayBookings = bookingsByDay.get(dayKey) ?? [];
                                const isOutsideMonth = day.getMonth() !== visibleMonth.getMonth();
                                const isSelected = isSameDay(day, selectedDate);

                                return (
                                    <Card
                                        key={dayKey}
                                        onPress={() => setSelectedDate(day)}
                                        style={[
                                            styles.calendarDayCell,
                                            isDarkMode && styles.calendarDayCellDark,
                                            isOutsideMonth && styles.calendarDayCellMuted,
                                            isDarkMode && isOutsideMonth && styles.calendarDayCellMutedDark,
                                            isSelected && styles.calendarDayCellSelected,
                                        ]}
                                    >
                                        <Card.Content style={styles.calendarDayContent}>
                                            <Text
                                                style={[
                                                    styles.calendarDayNumber,
                                                    isDarkMode && styles.calendarDayNumberDark,
                                                    isOutsideMonth && styles.calendarDayNumberMuted,
                                                    isSelected && styles.calendarDayNumberSelected,
                                                ]}
                                            >
                                                {day.getDate()}
                                            </Text>
                                            <View style={styles.calendarDayIndicators}>
                                                {dayBookings.slice(0, 3).map((booking) => (
                                                    <View
                                                        key={`${dayKey}-${booking.id}`}
                                                        style={[styles.calendarDayDot, isDarkMode && styles.calendarDayDotDark]}
                                                    />
                                                ))}
                                            </View>
                                            {dayBookings.length > 0 ? (
                                                <Text style={[styles.calendarDayCount, isDarkMode && styles.calendarDayCountDark]}>
                                                    {dayBookings.length} Buchung{dayBookings.length === 1 ? "" : "en"}
                                                </Text>
                                            ) : null}
                                        </Card.Content>
                                    </Card>
                                );
                            })}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.calendarAgendaHeader}>
                    <Text style={[styles.sectionTitle, styles.calendarAgendaTitle, isDarkMode && styles.sectionTitleDark]}>
                        {selectedDate.toLocaleDateString("de-DE", { dateStyle: "full" })}
                    </Text>
                </View>

                {selectedDayBookings.length === 0 ? (
                    <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                        Keine Buchungen an diesem Tag.
                    </Text>
                ) : (
                    selectedDayBookings.map((booking, index) => (
                        <View key={`agenda-${booking.id}`}>
                            <Card style={[styles.bookingCard, isDarkMode && styles.bookingCardDark]}>
                                <Card.Content>
                                    <View style={styles.bookingCardHeader}>
                                        <View style={styles.bookingCardMeta}>
                                            <Text style={[styles.bookingTitle, isDarkMode && styles.bookingTitleDark]}>
                                                {booking.titel}
                                            </Text>
                                            <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                                Für {booking.bucherName}
                                            </Text>
                                        </View>
                                        <Chip compact>{booking.status}</Chip>
                                    </View>

                                    <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                        {formatDateRange(booking)}
                                    </Text>

                                    {booking.zweck ? (
                                        <Text style={[styles.bookingPurpose, isDarkMode && styles.bookingPurposeDark]}>
                                            {booking.zweck}
                                        </Text>
                                    ) : null}

                                    <View style={styles.bookingDeviceChipRow}>
                                        {booking.geraete.map((geraet) => (
                                            <Chip key={`${booking.id}-${geraet.invNr}`} compact style={styles.deviceChip}>
                                                {geraet.invNr} {geraet.modell}
                                            </Chip>
                                        ))}
                                    </View>

                                    {canManageInventory ? (
                                        <View style={styles.bookingActions}>
                                            <Button
                                                mode="text"
                                                onPress={() => onDeleteBooking(booking.id)}
                                                textColor="#b3261e"
                                            >
                                                Löschen
                                            </Button>
                                        </View>
                                    ) : null}
                                </Card.Content>
                            </Card>
                            {index < selectedDayBookings.length - 1 ? <Divider style={styles.listDivider} /> : null}
                        </View>
                    ))
                )}
            </Surface>
        );
    },
);

const normalizeInventoryCodeCandidates = (rawValue: string) => {
    const trimmed = rawValue.trim();
    const upperTrimmed = trimmed.toUpperCase();
    const withoutPrefix = upperTrimmed.startsWith("INV-") ? upperTrimmed.slice(4) : upperTrimmed;
    const numericOnly = withoutPrefix.replace(/\D/g, "");
    const normalizedNumeric = numericOnly ? String(Number(numericOnly)) : null;

    return new Set(
        [
            trimmed,
            upperTrimmed,
            withoutPrefix,
            numericOnly || null,
            normalizedNumeric && normalizedNumeric !== "NaN" ? normalizedNumeric : null,
        ].filter(Boolean) as string[],
    );
};

const isPcoEnabled = process.env.EXPO_PUBLIC_ENABLE_PCO === "true";
type SelectionMode = "single" | "model";
type ModelGroup = {
    key: string;
    modell: string;
    hersteller: string | null;
    standort: string | null;
    bereich: string | null;
    items: InventoryItem[];
};

const BookingDeviceSelector = React.memo(
    ({
        isDarkMode,
        searchQuery,
        onSearchQueryChange,
        selectionMode,
        onSelectionModeChange,
        filteredItems,
        groupedModelItems,
        selectedInvNrs,
        onToggleDevice,
        onSetModelQuantity,
        selectedInvChipSummary,
        showScannerAction,
        onOpenScanner,
    }: {
        isDarkMode: boolean;
        searchQuery: string;
        onSearchQueryChange: (value: string) => void;
        selectionMode: SelectionMode;
        onSelectionModeChange: (mode: SelectionMode) => void;
        filteredItems: InventoryItem[];
        groupedModelItems: ModelGroup[];
        selectedInvNrs: number[];
        onToggleDevice: (invNr: number) => void;
        onSetModelQuantity: (groupKey: string, quantity: number) => void;
        selectedInvChipSummary: React.ReactNode;
        showScannerAction: boolean;
        onOpenScanner: () => void;
    }) => {
        const selectedSet = useMemo(() => new Set(selectedInvNrs), [selectedInvNrs]);

        return (
            <>
                <View style={styles.searchActionRow}>
                    <TextInput
                        mode="outlined"
                        label="Geräte suchen"
                        value={searchQuery}
                        onChangeText={onSearchQueryChange}
                        style={[styles.searchInput, styles.searchInputCompact]}
                    />
                    {showScannerAction ? (
                        <IconButton
                            icon="qrcode-scan"
                            mode="contained-tonal"
                            size={20}
                            containerColor={isDarkMode ? "#151c27" : "#ffffff"}
                            iconColor={isDarkMode ? "#dbe6f5" : "#445160"}
                            style={[styles.searchScannerButton, isDarkMode && styles.searchScannerButtonDark]}
                            onPress={onOpenScanner}
                        />
                    ) : null}
                </View>
                <View style={styles.selectionModeRow}>
                    <Chip compact selected={selectionMode === "single"} onPress={() => onSelectionModeChange("single")}>
                        Einzelgeräte
                    </Chip>
                    <Chip compact selected={selectionMode === "model"} onPress={() => onSelectionModeChange("model")}>
                        Nach Modell
                    </Chip>
                </View>

                {selectionMode === "single" ? (
                    <Surface style={[styles.deviceListCard, isDarkMode && styles.deviceListCardDark]}>
                        <ScrollView style={styles.deviceList} nestedScrollEnabled>
                            {filteredItems.map((item) => {
                                const checked = selectedSet.has(item.invNr);

                                return (
                                    <View key={item.invNr} style={[styles.deviceRow, isDarkMode && styles.deviceRowDark]}>
                                        <Checkbox
                                            status={checked ? "checked" : "unchecked"}
                                            onPress={() => onToggleDevice(item.invNr)}
                                        />
                                        <View style={styles.deviceMeta}>
                                            <Text style={[styles.deviceTitle, isDarkMode && styles.deviceTitleDark]}>
                                                {item.invNr} · {item.modell}
                                            </Text>
                                            <Text style={[styles.deviceSubtitle, isDarkMode && styles.deviceSubtitleDark]}>
                                                {[item.hersteller, item.standort, item.bereich].filter(Boolean).join(" · ")}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </Surface>
                ) : (
                    <Surface style={[styles.deviceListCard, isDarkMode && styles.deviceListCardDark]}>
                        <ScrollView style={styles.deviceList} nestedScrollEnabled>
                            {groupedModelItems.map((group) => {
                                const selectedCount = group.items.filter((item) => selectedSet.has(item.invNr)).length;

                                return (
                                    <View key={group.key} style={[styles.deviceRow, styles.modelGroupRow, isDarkMode && styles.deviceRowDark]}>
                                        <View style={styles.deviceMeta}>
                                            <Text style={[styles.deviceTitle, isDarkMode && styles.deviceTitleDark]}>
                                                {group.modell}
                                            </Text>
                                            <Text style={[styles.deviceSubtitle, isDarkMode && styles.deviceSubtitleDark]}>
                                                {[group.hersteller, group.standort, group.bereich].filter(Boolean).join(" · ")}
                                            </Text>
                                            <Text style={[styles.groupAvailability, isDarkMode && styles.deviceSubtitleDark]}>
                                                {selectedCount} von {group.items.length} ausgewählt
                                            </Text>
                                        </View>
                                        <View style={styles.quantityControls}>
                                            <Button
                                                compact
                                                mode="outlined"
                                                onPress={() => onSetModelQuantity(group.key, selectedCount - 1)}
                                                disabled={selectedCount === 0}
                                            >
                                                -
                                            </Button>
                                            <Text style={[styles.quantityValue, isDarkMode && styles.deviceTitleDark]}>
                                                {selectedCount}
                                            </Text>
                                            <Button
                                                compact
                                                mode="outlined"
                                                onPress={() => onSetModelQuantity(group.key, selectedCount + 1)}
                                                disabled={selectedCount >= group.items.length}
                                            >
                                                +
                                            </Button>
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </Surface>
                )}

                <Text style={[styles.selectionInfo, isDarkMode && styles.selectionInfoDark]}>
                    {selectedInvNrs.length} Gerät(e) ausgewählt
                </Text>

                {selectedInvChipSummary}
            </>
        );
    },
);

const BookingListPanelLegacy = React.memo(
    ({
        isDarkMode,
        isLoading,
        bookings,
        canManageInventory,
        onDeleteBooking,
    }: {
        isDarkMode: boolean;
        isLoading: boolean;
        bookings: Booking[];
        canManageInventory: boolean;
        onDeleteBooking: (bookingId: number) => void;
    }) => (
        <Surface style={[styles.listCard, isDarkMode && styles.listCardDark]}>
            <View style={styles.listHeader}>
                <View>
                    <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Bestehende Buchungen</Text>
                    <Text style={[styles.sectionHint, isDarkMode && styles.sectionHintDark]}>
                        Hier ist der Bereich, der später gut an Planning Center andocken kann.
                    </Text>
                </View>
                {isLoading ? <Chip compact>lädt</Chip> : <Chip compact>{bookings.length} Einträge</Chip>}
            </View>

            {bookings.length === 0 && !isLoading ? (
                <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                    Noch keine Buchungen vorhanden.
                </Text>
            ) : (
                bookings.map((booking, index) => (
                    <View key={booking.id}>
                        <Card style={[styles.bookingCard, isDarkMode && styles.bookingCardDark]}>
                            <Card.Content>
                                <View style={styles.bookingCardHeader}>
                                    <View style={styles.bookingCardMeta}>
                                        <Text style={[styles.bookingTitle, isDarkMode && styles.bookingTitleDark]}>
                                            {booking.titel}
                                        </Text>
                                        <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                            Für {booking.bucherName}
                                        </Text>
                                    </View>
                                    <Chip compact>{booking.status}</Chip>
                                </View>

                                <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                    {formatDateRange(booking)}
                                </Text>
                                {booking.zweck ? (
                                    <Text style={[styles.bookingPurpose, isDarkMode && styles.bookingPurposeDark]}>
                                        {booking.zweck}
                                    </Text>
                                ) : null}

                                <View style={styles.bookingDeviceChipRow}>
                                    {booking.geraete.map((geraet) => (
                                        <Chip key={`${booking.id}-${geraet.invNr}`} compact style={styles.deviceChip}>
                                            {geraet.invNr} {geraet.modell}
                                        </Chip>
                                    ))}
                                </View>

                                {canManageInventory && (
                                    <View style={styles.bookingActions}>
                                        <Button
                                            mode="text"
                                            onPress={() => onDeleteBooking(booking.id)}
                                            textColor="#b3261e"
                                        >
                                            Löschen
                                        </Button>
                                    </View>
                                )}
                            </Card.Content>
                        </Card>
                        {index < bookings.length - 1 ? <Divider style={styles.listDivider} /> : null}
                    </View>
                ))
            )}
        </Surface>
    ),
);

const BookingListPanel = React.memo(
    ({
        isDarkMode,
        isLoading,
        bookings,
        canManageInventory,
        onDeleteBooking,
        isCompactViewport,
        bookingViewMode,
        onChangeViewMode,
    }: {
        isDarkMode: boolean;
        isLoading: boolean;
        bookings: Booking[];
        canManageInventory: boolean;
        onDeleteBooking: (bookingId: number) => void;
        isCompactViewport: boolean;
        bookingViewMode: BookingViewMode;
        onChangeViewMode: (mode: BookingViewMode) => void;
    }) => {
        const [expandedBookingIds, setExpandedBookingIds] = useState<number[]>([]);

        useEffect(() => {
            const bookingIds = new Set(bookings.map((booking) => booking.id));
            setExpandedBookingIds((current) => current.filter((id) => bookingIds.has(id)));
        }, [bookings]);

        const toggleBooking = (bookingId: number) => {
            setExpandedBookingIds((current) =>
                current.includes(bookingId)
                    ? current.filter((id) => id !== bookingId)
                    : [...current, bookingId],
            );
        };

        return (
            <Surface
                style={[
                    styles.listCard,
                    isDarkMode && styles.listCardDark,
                    isCompactViewport && styles.listCardCompact,
                ]}
            >
                <View style={styles.listHeader}>
                    <View style={styles.listHeaderText}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Bestehende Buchungen</Text>
                        <Text style={[styles.sectionHint, isDarkMode && styles.sectionHintDark]}>
                            Hier ist der Bereich, der spaeter gut an Planning Center andocken kann.
                        </Text>
                    </View>
                    <View style={styles.listHeaderControls}>
                        <View style={styles.bookingViewModeSwitch}>
                            <Button
                                compact
                                mode={bookingViewMode === "list" ? "contained-tonal" : "text"}
                                onPress={() => onChangeViewMode("list")}
                                style={[
                                    styles.bookingViewModeButton,
                                    bookingViewMode === "list" && styles.bookingViewModeButtonActive,
                                ]}
                            >
                                Liste
                            </Button>
                            <Button
                                compact
                                mode={bookingViewMode === "calendar" ? "contained-tonal" : "text"}
                                onPress={() => onChangeViewMode("calendar")}
                                style={[
                                    styles.bookingViewModeButton,
                                    bookingViewMode === "calendar" && styles.bookingViewModeButtonActive,
                                ]}
                            >
                                Kalender
                            </Button>
                        </View>
                        <Chip compact style={isCompactViewport ? styles.listHeaderChipCompact : undefined}>
                            {isLoading ? "laedt" : `${bookings.length} Eintraege`}
                        </Chip>
                    </View>
                </View>

                {bookings.length === 0 && !isLoading ? (
                    <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                        Noch keine Buchungen vorhanden.
                    </Text>
                ) : (
                    bookings.map((booking, index) => {
                        const isExpanded = expandedBookingIds.includes(booking.id);

                        return (
                            <View key={booking.id}>
                                <Card style={[styles.bookingCard, isDarkMode && styles.bookingCardDark]}>
                                    <Card.Content>
                                        <View style={styles.bookingCardHeader}>
                                            <View style={styles.bookingCardMeta}>
                                                <Text style={[styles.bookingTitle, isDarkMode && styles.bookingTitleDark]}>
                                                    {booking.titel}
                                                </Text>
                                                <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                                    Fuer {booking.bucherName}
                                                </Text>
                                            </View>
                                            <View style={styles.bookingHeaderActions}>
                                                <Chip compact>{booking.status}</Chip>
                                                <Button mode="text" compact onPress={() => toggleBooking(booking.id)}>
                                                    {isExpanded ? "Weniger" : "Anzeigen"}
                                                </Button>
                                            </View>
                                        </View>

                                        <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                            {formatDateRange(booking)}
                                        </Text>

                                        {isExpanded ? (
                                            <>
                                                {booking.zweck ? (
                                                    <Text style={[styles.bookingPurpose, isDarkMode && styles.bookingPurposeDark]}>
                                                        {booking.zweck}
                                                    </Text>
                                                ) : null}

                                                <View style={styles.bookingDeviceChipRow}>
                                                    {booking.geraete.map((geraet) => (
                                                        <Chip key={`${booking.id}-${geraet.invNr}`} compact style={styles.deviceChip}>
                                                            {geraet.invNr} {geraet.modell}
                                                        </Chip>
                                                    ))}
                                                </View>

                                                {canManageInventory ? (
                                                    <View style={styles.bookingActions}>
                                                        <Button
                                                            mode="text"
                                                            onPress={() => onDeleteBooking(booking.id)}
                                                            textColor="#b3261e"
                                                        >
                                                            Loeschen
                                                        </Button>
                                                    </View>
                                                ) : null}
                                            </>
                                        ) : null}
                                    </Card.Content>
                                </Card>
                                {index < bookings.length - 1 ? <Divider style={styles.listDivider} /> : null}
                            </View>
                        );
                    })
                )}
            </Surface>
        );
    },
);

const BookingPage = () => {
    const { isDarkMode, toggleTheme } = useAppThemeMode();
    const { items, canManageInventory } = useInventory();
    const { width } = useWindowDimensions();
    const isCompactViewport = width < 820;
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMappings, setIsLoadingMappings] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingMapping, setIsSavingMapping] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mappingSearchQuery, setMappingSearchQuery] = useState("");
    const [titel, setTitel] = useState("");
    const [bucherName, setBucherName] = useState("");
    const [zweck, setZweck] = useState("");
    const [startDatum, setStartDatum] = useState("");
    const [endDatum, setEndDatum] = useState("");
    const [activeDateField, setActiveDateField] = useState<"start" | "end" | null>(null);
    const [selectedInvNrs, setSelectedInvNrs] = useState<number[]>([]);
    const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");
    const [bookingViewMode, setBookingViewMode] = useState<BookingViewMode>("calendar");
    const [pcoMappings, setPcoMappings] = useState<PcoMapping[]>([]);
    const [pcoSuggestions, setPcoSuggestions] = useState<PcoPlanSuggestion[]>([]);
    const [activeMappingId, setActiveMappingId] = useState<number | null>(null);
    const [selectedMappingInvNrs, setSelectedMappingInvNrs] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [mappingFeedback, setMappingFeedback] = useState<string | null>(null);
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const showScannerAction = Platform.OS !== "web" || width < 768;

    const loadBookings = async () => {
        setIsLoading(true);
        try {
            const data = await buchungService.getAll();
            setBookings(data);
        } catch (error) {
            console.error("Fehler beim Laden der Buchungen:", error);
            setFeedback("Buchungen konnten nicht geladen werden.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadPcoMappings = async () => {
        setIsLoadingMappings(true);
        try {
            const data = await pcoMappingService.getAll();
            setPcoMappings(data);
        } catch (error) {
            console.error("Fehler beim Laden der PCO-Mappings:", error);
            setMappingFeedback("PCO-Mappings konnten nicht geladen werden.");
        } finally {
            setIsLoadingMappings(false);
        }
    };

    const loadPcoSuggestions = async () => {
        setIsLoadingSuggestions(true);
        try {
            const data = await pcoPlanSuggestionService.getAll();
            setPcoSuggestions(data);
        } catch (error) {
            console.error("Fehler beim Laden der PCO-Planvorschläge:", error);
            setMappingFeedback("PCO-Planvorschläge konnten nicht geladen werden.");
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    useEffect(() => {
        void loadBookings();

        if (isPcoEnabled) {
            void loadPcoMappings();
            void loadPcoSuggestions();
        }
    }, []);

    const deferredSearchQuery = useDeferredValue(searchQuery);
    const deferredMappingSearchQuery = useDeferredValue(mappingSearchQuery);
    const deferredStartDatum = useDeferredValue(startDatum);
    const deferredEndDatum = useDeferredValue(endDatum);

    const filteredItems = useMemo(() => {
        const normalizedQuery = deferredSearchQuery.trim().toLocaleLowerCase("de-DE");

        return items
            .filter((item) => {
                if (!normalizedQuery) {
                    return true;
                }

                return [
                    String(item.invNr),
                    item.modell,
                    item.hersteller,
                    item.standort,
                    item.bereich,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLocaleLowerCase("de-DE").includes(normalizedQuery));
            })
            .sort((left, right) => left.invNr - right.invNr);
    }, [items, deferredSearchQuery]);

    const groupedModelItems = useMemo(() => {
        const groups = new Map<
            string,
            {
                key: string;
                modell: string;
                hersteller: string | null;
                standort: string | null;
                bereich: string | null;
                items: typeof filteredItems;
            }
        >();

        for (const item of filteredItems) {
            const key = [
                item.modell ?? "",
                item.hersteller ?? "",
                item.standort ?? "",
                item.bereich ?? "",
            ].join("||");

            if (!groups.has(key)) {
                groups.set(key, {
                    key,
                    modell: item.modell,
                    hersteller: item.hersteller ?? null,
                    standort: item.standort ?? null,
                    bereich: item.bereich ?? null,
                    items: [],
                });
            }

            groups.get(key)?.items.push(item);
        }

        return [...groups.values()]
            .map((group) => ({
                ...group,
                items: [...group.items].sort((left, right) => left.invNr - right.invNr),
            }))
            .sort((left, right) => {
                const byModel = left.modell.localeCompare(right.modell, "de");
                if (byModel !== 0) {
                    return byModel;
                }

                return (left.standort ?? "").localeCompare(right.standort ?? "", "de");
            });
    }, [filteredItems]);

    const sortedBookings = useMemo(
        () => [...bookings].sort((left, right) => new Date(left.startDatum).getTime() - new Date(right.startDatum).getTime()),
        [bookings],
    );

    const sortedPcoMappings = useMemo(
        () => [...pcoMappings].sort((left, right) => left.pcoServiceTypeName.localeCompare(right.pcoServiceTypeName, "de")),
        [pcoMappings],
    );

    const summary = useMemo(() => {
        const now = Date.now();
        const activeBookings = sortedBookings.filter((booking) => new Date(booking.endDatum).getTime() >= now);
        const bookedDeviceCount = activeBookings.reduce((count, booking) => count + booking.geraete.length, 0);

        return {
            total: sortedBookings.length,
            active: activeBookings.length,
            devices: bookedDeviceCount,
        };
    }, [sortedBookings]);

    const filteredMappingItems = useMemo(() => {
        const normalizedQuery = deferredMappingSearchQuery.trim().toLocaleLowerCase("de-DE");

        return items
            .filter((item) => {
                if (!normalizedQuery) {
                    return true;
                }

                return [
                    String(item.invNr),
                    item.modell,
                    item.hersteller,
                    item.standort,
                    item.bereich,
                ]
                    .filter(Boolean)
                    .some((value) => String(value).toLocaleLowerCase("de-DE").includes(normalizedQuery));
            })
            .sort((left, right) => left.invNr - right.invNr);
    }, [items, deferredMappingSearchQuery]);

    const activeMapping = useMemo(
        () => sortedPcoMappings.find((mapping) => mapping.id === activeMappingId) ?? null,
        [sortedPcoMappings, activeMappingId],
    );

    const upcomingPcoSuggestions = useMemo(
        () => pcoSuggestions.filter((suggestion) => new Date(suggestion.sortDate).getTime() >= Date.now()).slice(0, 12),
        [pcoSuggestions],
    );

    const selectedInvChipSummary = useMemo(() => {
        if (selectedInvNrs.length === 0) {
            return null;
        }

        return (
            <View style={styles.selectedInvChipRow}>
                {[...selectedInvNrs].sort((left, right) => left - right).slice(0, 20).map((invNr) => (
                    <Chip key={`selected-${invNr}`} compact style={styles.deviceChip}>
                        #{invNr}
                    </Chip>
                ))}
                {selectedInvNrs.length > 20 ? (
                    <Chip compact style={styles.deviceChip}>
                        +{selectedInvNrs.length - 20} weitere
                    </Chip>
                ) : null}
            </View>
        );
    }, [selectedInvNrs]);

    const currentBookingConflicts = useMemo(() => {
        const normalizedStart = parseDateInput(deferredStartDatum);
        const normalizedEnd = parseDateInput(deferredEndDatum);

        if (!normalizedStart || !normalizedEnd || selectedInvNrs.length === 0) {
            return [];
        }

        const startTime = new Date(normalizedStart).getTime();
        const endTime = new Date(normalizedEnd).getTime();

        if (Number.isNaN(startTime) || Number.isNaN(endTime) || startTime >= endTime) {
            return [];
        }

        const selectedSet = new Set(selectedInvNrs);

        return sortedBookings
            .map((booking) => {
                const bookingStart = new Date(booking.startDatum).getTime();
                const bookingEnd = new Date(booking.endDatum).getTime();
                const overlapsInTime = startTime < bookingEnd && endTime > bookingStart;

                if (!overlapsInTime) {
                    return null;
                }

                const overlappingDevices = booking.geraete.filter((geraet) => selectedSet.has(geraet.invNr));

                if (overlappingDevices.length === 0) {
                    return null;
                }

                return {
                    booking,
                    overlappingDevices,
                };
            })
            .filter(Boolean) as Array<{
            booking: Booking;
            overlappingDevices: Booking["geraete"];
        }>;
    }, [deferredStartDatum, deferredEndDatum, selectedInvNrs, sortedBookings]);

    const hasBlockingConflicts = currentBookingConflicts.length > 0;

    const bookingListContent = useMemo(() => {
        if (sortedBookings.length === 0 && !isLoading) {
            return (
                <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                    Noch keine Buchungen vorhanden.
                </Text>
            );
        }

        return sortedBookings.map((booking, index) => (
            <View key={booking.id}>
                <Card style={[styles.bookingCard, isDarkMode && styles.bookingCardDark]}>
                    <Card.Content>
                        <View style={styles.bookingCardHeader}>
                            <View style={styles.bookingCardMeta}>
                                <Text style={[styles.bookingTitle, isDarkMode && styles.bookingTitleDark]}>
                                    {booking.titel}
                                </Text>
                                <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                    Für {booking.bucherName}
                                </Text>
                            </View>
                            <Chip compact>{booking.status}</Chip>
                        </View>

                        <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                            {formatDateRange(booking)}
                        </Text>
                        {booking.zweck ? (
                            <Text style={[styles.bookingPurpose, isDarkMode && styles.bookingPurposeDark]}>
                                {booking.zweck}
                            </Text>
                        ) : null}

                        <View style={styles.bookingDeviceChipRow}>
                            {booking.geraete.map((geraet) => (
                                <Chip key={`${booking.id}-${geraet.invNr}`} compact style={styles.deviceChip}>
                                    {geraet.invNr} {geraet.modell}
                                </Chip>
                            ))}
                        </View>

                        {canManageInventory && (
                            <View style={styles.bookingActions}>
                                <Button
                                    mode="text"
                                    onPress={() => void handleDeleteBooking(booking.id)}
                                    textColor="#b3261e"
                                >
                                    Löschen
                                </Button>
                            </View>
                        )}
                    </Card.Content>
                </Card>
                {index < sortedBookings.length - 1 ? <Divider style={styles.listDivider} /> : null}
            </View>
        ));
    }, [sortedBookings, isLoading, isDarkMode, canManageInventory]);

    const resetForm = () => {
        setTitel("");
        setBucherName("");
        setZweck("");
        setStartDatum("");
        setEndDatum("");
        setSelectedInvNrs([]);
    };

    const handleToggleDevice = useCallback((invNr: number) => {
        setSelectedInvNrs((current) =>
            current.includes(invNr)
                ? current.filter((value) => value !== invNr)
                : [...current, invNr],
        );
    }, []);

    const handleSetModelQuantity = useCallback((groupKey: string, quantity: number) => {
        const group = groupedModelItems.find((entry) => entry.key === groupKey);

        if (!group) {
            return;
        }

        const clampedQuantity = Math.max(0, Math.min(quantity, group.items.length));
        const chosenInvNrs = group.items.slice(0, clampedQuantity).map((item) => item.invNr);
        const groupInvNrs = new Set(group.items.map((item) => item.invNr));

        setSelectedInvNrs((current) => [
            ...current.filter((invNr) => !groupInvNrs.has(invNr)),
            ...chosenInvNrs,
        ]);
    }, [groupedModelItems]);

    const handleScannedBookingCode = useCallback((scannedValue: string) => {
        const normalizedCode = scannedValue.trim();

        if (!normalizedCode) {
            return;
        }

        const codeCandidates = normalizeInventoryCodeCandidates(normalizedCode);

        const matchedItem = items.find((item) => {
            const normalizedInvNr = String(item.invNr).trim();
            return codeCandidates.has(normalizedInvNr) || codeCandidates.has(`INV-${normalizedInvNr}`);
        });

        if (!matchedItem) {
            setFeedback(`Kein Gerät zu QR-Code "${normalizedCode}" gefunden.`);
            return;
        }

        setSelectedInvNrs((current) => {
            if (current.includes(matchedItem.invNr)) {
                return current;
            }

            return [...current, matchedItem.invNr];
        });

        setFeedback(`Gerät ${matchedItem.invNr} zur Buchung hinzugefügt.`);
    }, [items]);

    const handleOpenScanner = useCallback(() => {
        setIsScannerVisible(true);
    }, []);

    const handleOpenMappingEditor = (mapping: PcoMapping) => {
        setActiveMappingId(mapping.id);
        setSelectedMappingInvNrs(mapping.geraete.map((device) => device.invNr));
        setMappingSearchQuery("");
        setMappingFeedback(null);
    };

    const handleToggleMappingDevice = (invNr: number) => {
        setSelectedMappingInvNrs((current) =>
            current.includes(invNr)
                ? current.filter((value) => value !== invNr)
                : [...current, invNr],
        );
    };

    const handleStartDateChange = useCallback((nextValue: string) => {
        setStartDatum((currentStart) => {
            setEndDatum((currentEnd) =>
                alignEndDateWithStart({
                    previousStartValue: currentStart,
                    nextStartValue: nextValue,
                    currentEndValue: currentEnd,
                }),
            );

            return nextValue;
        });
    }, []);

    const handleDateConfirm = (date: Date) => {
        const formattedDate = formatDateForInput(date);

        if (activeDateField === "start") {
            handleStartDateChange(formattedDate);
        }

        if (activeDateField === "end") {
            setEndDatum(formattedDate);
        }

        setActiveDateField(null);
    };

    const handleCreateBooking = async () => {
        const normalizedStart = parseDateInput(startDatum);
        const normalizedEnd = parseDateInput(endDatum);

        if (!titel.trim() || !bucherName.trim() || !normalizedStart || !normalizedEnd || selectedInvNrs.length === 0) {
            setFeedback("Titel, Buchen für, Zeitraum und mindestens ein Gerät sind erforderlich.");
            return;
        }

        if (hasBlockingConflicts) {
            setFeedback("Die Buchung kollidiert mit bestehenden Reservierungen. Bitte Zeitraum oder Geraete anpassen.");
            return;
        }

        setIsSubmitting(true);
        try {
            await buchungService.create({
                titel: titel.trim(),
                bucher_name: bucherName.trim(),
                zweck: zweck.trim() || undefined,
                start_datum: normalizedStart,
                end_datum: normalizedEnd,
                geraete_inv_nr: selectedInvNrs,
            });

            resetForm();
            setFeedback("Buchung erfolgreich angelegt.");
            await loadBookings();
        } catch (error) {
            console.error("Fehler beim Anlegen der Buchung:", error);

            if (axios.isAxiosError(error)) {
                const message =
                    typeof error.response?.data?.error === "string"
                        ? error.response.data.error
                        : null;
                setFeedback(message ?? "Buchung konnte nicht angelegt werden.");
            } else {
                setFeedback("Buchung konnte nicht angelegt werden.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteBooking = useCallback(async (bookingId: number) => {
        setIsSubmitting(true);
        try {
            await buchungService.delete(bookingId);
            setFeedback("Buchung gelöscht.");
            await loadBookings();
        } catch (error) {
            console.error("Fehler beim Löschen der Buchung:", error);
            setFeedback("Buchung konnte nicht gelöscht werden.");
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    const handleSaveMapping = async () => {
        if (!activeMapping) {
            return;
        }

        setIsSavingMapping(true);
        try {
            await pcoMappingService.update(activeMapping.id, {
                aktiv: activeMapping.aktiv,
                geraete_inv_nr: selectedMappingInvNrs,
            });

            setMappingFeedback("PCO-Mapping gespeichert.");
            await loadPcoMappings();
        } catch (error) {
            console.error("Fehler beim Speichern des PCO-Mappings:", error);
            setMappingFeedback("PCO-Mapping konnte nicht gespeichert werden.");
        } finally {
            setIsSavingMapping(false);
        }
    };

    const handleApplySuggestion = (suggestion: PcoPlanSuggestion) => {
        setTitel(suggestion.bookingTitle);
        setZweck(
            `Aus Planning Center übernommen · ${suggestion.serviceTypeName}${suggestion.seriesTitle ? ` · ${suggestion.seriesTitle}` : ""}`,
        );
        setStartDatum(formatDateForInput(new Date(suggestion.sortDate)));

        if (suggestion.suggestedEndDatum) {
            setEndDatum(formatDateForInput(new Date(suggestion.suggestedEndDatum)));
        }

        setSelectedInvNrs(suggestion.geraete.map((device) => device.invNr));
        setFeedback(`PCO-Plan "${suggestion.displayTitle}" wurde ins Formular übernommen.`);
    };

    const handleToggleMappingActive = async (mapping: PcoMapping) => {
        setIsSavingMapping(true);
        try {
            const geraeteInvNrs =
                activeMappingId === mapping.id
                    ? selectedMappingInvNrs
                    : mapping.geraete.map((device) => device.invNr);

            const updated = await pcoMappingService.update(mapping.id, {
                aktiv: !mapping.aktiv,
                geraete_inv_nr: geraeteInvNrs,
            });

            setPcoMappings((current) =>
                current.map((entry) => (entry.id === updated.id ? updated : entry)),
            );

            if (activeMappingId === mapping.id) {
                setSelectedMappingInvNrs(updated.geraete.map((device) => device.invNr));
            }

            setMappingFeedback(updated.aktiv ? "Mapping aktiviert." : "Mapping deaktiviert.");
        } catch (error) {
            console.error("Fehler beim Umschalten des PCO-Mappings:", error);
            setMappingFeedback("Mapping-Status konnte nicht aktualisiert werden.");
        } finally {
            setIsSavingMapping(false);
        }
    };

    return (
        <View style={[styles.page, isDarkMode && styles.pageDark]}>
            <Appbar.Header style={[styles.header, isDarkMode && styles.headerDark]}>
                <Appbar.BackAction iconColor={isDarkMode ? "#dbe6f5" : "#445160"} onPress={() => router.back()} />
                <Appbar.Content
                    title="Buchungen"
                    subtitle="Mehrere Geräte pro Buchung, sauber nach Zeitraum geplant"
                    subtitle="Mehrere Geräte pro Buchung, sauber nach Zeitraum geplant"
                    subtitleStyle={[styles.headerSubtitle, isDarkMode && styles.headerSubtitleDark]}
                />
                <Appbar.Action
                    icon={isDarkMode ? "weather-sunny" : "moon-waning-crescent"}
                    color={isDarkMode ? "#dbe6f5" : "#445160"}
                    onPress={toggleTheme}
                />
            </Appbar.Header>

            <FlatList
                data={[{ key: "booking-page" }]}
                renderItem={() => null}
                contentContainerStyle={styles.content}
                ListHeaderComponent={(
                    <>
                <View style={styles.summaryRow}>
                    <Card style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
                        <Card.Content>
                            <Text style={[styles.summaryLabel, isDarkMode && styles.summaryLabelDark]}>Buchungen gesamt</Text>
                            <Text style={[styles.summaryValue, isDarkMode && styles.summaryValueDark]}>{summary.total}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
                        <Card.Content>
                            <Text style={[styles.summaryLabel, isDarkMode && styles.summaryLabelDark]}>Aktive / kommende</Text>
                            <Text style={[styles.summaryValue, isDarkMode && styles.summaryValueDark]}>{summary.active}</Text>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.summaryCard, isDarkMode && styles.summaryCardDark]}>
                        <Card.Content>
                            <Text style={[styles.summaryLabel, isDarkMode && styles.summaryLabelDark]}>Geräte reserviert</Text>
                            <Text style={[styles.summaryValue, isDarkMode && styles.summaryValueDark]}>{summary.devices}</Text>
                        </Card.Content>
                    </Card>
                </View>

                <View style={styles.mainGrid}>
                    <Surface
                        style={[
                            styles.formCard,
                            isDarkMode && styles.formCardDark,
                            isCompactViewport && styles.formCardCompact,
                        ]}
                    >
                        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Neue Buchung</Text>
                        <Text style={[styles.sectionHint, isDarkMode && styles.sectionHintDark]}>
                            Der erste Schnitt ist bewusst einfach gehalten und eignet sich gut als Basis für Planning Center.
                        </Text>

                        <View style={styles.formGrid}>
                            <TextInput mode="outlined" label="Titel" value={titel} onChangeText={setTitel} style={styles.input} />
                            <TextInput mode="outlined" label="Buchen für" value={bucherName} onChangeText={setBucherName} style={styles.input} />
                            {Platform.OS === "web" ? (
                                <WebDateTimeField
                                    label="Von"
                                    value={startDatum ? formatDateForDisplayInput(startDatum) : ""}
                                    onChange={handleStartDateChange}
                                    isDarkMode={isDarkMode}
                                />
                            ) : (
                                <TextInput
                                    mode="outlined"
                                    label="Von"
                                    placeholder="2026-03-26 18:00"
                                    value={startDatum ? formatDateForDisplayInput(startDatum) : ""}
                                    onChangeText={handleStartDateChange}
                                    style={styles.input}
                                    right={<TextInput.Icon icon="calendar" onPress={() => setActiveDateField("start")} />}
                                />
                            )}
                            {Platform.OS === "web" ? (
                                <WebDateTimeField
                                    label="Bis"
                                    value={endDatum ? formatDateForDisplayInput(endDatum) : ""}
                                    onChange={setEndDatum}
                                    isDarkMode={isDarkMode}
                                />
                            ) : (
                                <TextInput
                                    mode="outlined"
                                    label="Bis"
                                    placeholder="2026-03-26 22:00"
                                    value={endDatum ? formatDateForDisplayInput(endDatum) : ""}
                                    onChangeText={setEndDatum}
                                    style={styles.input}
                                    right={<TextInput.Icon icon="calendar" onPress={() => setActiveDateField("end")} />}
                                />
                            )}
                            <TextInput
                                mode="outlined"
                                label="Zweck"
                                value={zweck}
                                onChangeText={setZweck}
                                multiline
                                style={[styles.input, styles.fullWidthInput]}
                            />
                        </View>

                        <BookingDeviceSelector
                            isDarkMode={isDarkMode}
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            selectionMode={selectionMode}
                            onSelectionModeChange={setSelectionMode}
                            filteredItems={filteredItems}
                            groupedModelItems={groupedModelItems}
                            selectedInvNrs={selectedInvNrs}
                            onToggleDevice={handleToggleDevice}
                            onSetModelQuantity={handleSetModelQuantity}
                            selectedInvChipSummary={selectedInvChipSummary}
                            showScannerAction={showScannerAction}
                            onOpenScanner={handleOpenScanner}
                        />

                        {false ? (
                        <>
                        <TextInput
                            mode="outlined"
                            label="Geraete suchen"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                        />
                        <View style={styles.selectionModeRow}>
                            <Chip compact selected={selectionMode === "single"} onPress={() => setSelectionMode("single")}>
                                Einzelgeraete
                            </Chip>
                            <Chip compact selected={selectionMode === "model"} onPress={() => setSelectionMode("model")}>
                                Nach Modell
                            </Chip>
                        </View>

                        {selectionMode === "single" ? (
                        <Surface style={[styles.deviceListCard, isDarkMode && styles.deviceListCardDark]}>
                            <ScrollView style={styles.deviceList}>
                                {filteredItems.map((item) => {
                                    const checked = selectedInvNrs.includes(item.invNr);

                                    return (
                                        <View key={item.invNr} style={[styles.deviceRow, isDarkMode && styles.deviceRowDark]}>
                                            <Checkbox
                                                status={checked ? "checked" : "unchecked"}
                                                onPress={() => handleToggleDevice(item.invNr)}
                                            />
                                            <View style={styles.deviceMeta}>
                                                <Text style={[styles.deviceTitle, isDarkMode && styles.deviceTitleDark]}>
                                                    {item.invNr} - {item.modell}
                                                </Text>
                                                <Text style={[styles.deviceSubtitle, isDarkMode && styles.deviceSubtitleDark]}>
                                                    {[item.hersteller, item.standort, item.bereich].filter(Boolean).join(" - ")}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}
                            </ScrollView>
                        </Surface>
                        ) : (
                            <Surface style={[styles.deviceListCard, isDarkMode && styles.deviceListCardDark]}>
                                <ScrollView style={styles.deviceList}>
                                    {groupedModelItems.map((group) => {
                                        const selectedCount = group.items.filter((item) => selectedInvNrs.includes(item.invNr)).length;

                                        return (
                                            <View key={group.key} style={[styles.deviceRow, styles.modelGroupRow, isDarkMode && styles.deviceRowDark]}>
                                                <View style={styles.deviceMeta}>
                                                    <Text style={[styles.deviceTitle, isDarkMode && styles.deviceTitleDark]}>
                                                        {group.modell}
                                                    </Text>
                                                    <Text style={[styles.deviceSubtitle, isDarkMode && styles.deviceSubtitleDark]}>
                                                        {[group.hersteller, group.standort, group.bereich].filter(Boolean).join(" - ")}
                                                    </Text>
                                                    <Text style={[styles.groupAvailability, isDarkMode && styles.deviceSubtitleDark]}>
                                                        {selectedCount} von {group.items.length} ausgewaehlt
                                                    </Text>
                                                </View>
                                                <View style={styles.quantityControls}>
                                                    <Button
                                                        compact
                                                        mode="outlined"
                                                        onPress={() => handleSetModelQuantity(group.key, selectedCount - 1)}
                                                        disabled={selectedCount === 0}
                                                    >
                                                        -
                                                    </Button>
                                                    <Text style={[styles.quantityValue, isDarkMode && styles.deviceTitleDark]}>
                                                        {selectedCount}
                                                    </Text>
                                                    <Button
                                                        compact
                                                        mode="outlined"
                                                        onPress={() => handleSetModelQuantity(group.key, selectedCount + 1)}
                                                        disabled={selectedCount >= group.items.length}
                                                    >
                                                        +
                                                    </Button>
                                                </View>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            </Surface>
                        )}

                        <Text style={[styles.selectionInfo, isDarkMode && styles.selectionInfoDark]}>
                            {selectedInvNrs.length} Geraet(e) ausgewaehlt
                        </Text>

                        {selectedInvChipSummary}
                        </>
                        ) : null}

                        {feedback && (
                            <Text style={[styles.feedbackText, isDarkMode && styles.feedbackTextDark]}>
                                {feedback}
                            </Text>
                        )}

                        {hasBlockingConflicts && (
                            <Surface style={[styles.conflictCard, isDarkMode && styles.conflictCardDark]}>
                                <Text style={[styles.conflictTitle, isDarkMode && styles.conflictTitleDark]}>
                                    Konflikte mit bestehenden Buchungen
                                </Text>
                                <Text style={[styles.conflictHint, isDarkMode && styles.conflictHintDark]}>
                                    Diese Kombination aus Zeitraum und Geräten überschneidet sich bereits mit vorhandenen Buchungen.
                                </Text>

                                <View style={styles.conflictList}>
                                    {currentBookingConflicts.map(({ booking, overlappingDevices }) => (
                                        <View key={`conflict-${booking.id}`} style={[styles.conflictItem, isDarkMode && styles.conflictItemDark]}>
                                            <View style={styles.conflictItemHeader}>
                                                <Text style={[styles.conflictBookingTitle, isDarkMode && styles.conflictTitleDark]}>
                                                    {booking.titel}
                                                </Text>
                                                <Chip compact style={styles.conflictChip}>
                                                    {booking.status}
                                                </Chip>
                                            </View>
                                            <Text style={[styles.conflictMeta, isDarkMode && styles.conflictHintDark]}>
                                                {formatDateRange(booking)}
                                            </Text>
                                            <Text style={[styles.conflictMeta, isDarkMode && styles.conflictHintDark]}>
                                                Betroffene Geräte: {overlappingDevices.map((geraet) => `#${geraet.invNr}`).join(", ")}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </Surface>
                        )}

                        <View style={styles.actionRow}>
                            <Button mode="outlined" onPress={resetForm}>
                                Leeren
                            </Button>
                            {canManageInventory && (
                                <Button mode="contained" onPress={() => void handleCreateBooking()} loading={isSubmitting} disabled={hasBlockingConflicts}>
                                    Buchung anlegen
                                </Button>
                            )}
                        </View>
                    </Surface>

                    <View
                        style={[
                            styles.listPanelWrap,
                            isCompactViewport && styles.listCardCompactWrap,
                        ]}
                    >
                        {bookingViewMode === "list" ? (
                            <BookingListPanel
                                isDarkMode={isDarkMode}
                                isLoading={isLoading}
                                bookings={sortedBookings}
                                canManageInventory={canManageInventory}
                                onDeleteBooking={handleDeleteBooking}
                                isCompactViewport={isCompactViewport}
                                bookingViewMode={bookingViewMode}
                                onChangeViewMode={setBookingViewMode}
                            />
                        ) : (
                            <BookingCalendarPanel
                                isDarkMode={isDarkMode}
                                isLoading={isLoading}
                                bookings={sortedBookings}
                                canManageInventory={canManageInventory}
                                onDeleteBooking={handleDeleteBooking}
                                isCompactViewport={isCompactViewport}
                                bookingViewMode={bookingViewMode}
                                onChangeViewMode={setBookingViewMode}
                            />
                        )}
                    </View>

                    {false ? (
                    <Surface style={[styles.listCard, isDarkMode && styles.listCardDark]}>
                        <View style={styles.listHeader}>
                            <View>
                                <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Bestehende Buchungen</Text>
                                <Text style={[styles.sectionHint, isDarkMode && styles.sectionHintDark]}>
                                    Hier ist der Bereich, der spaeter gut an Planning Center andocken kann.
                                </Text>
                            </View>
                            {isLoading ? <Chip compact>laedt</Chip> : <Chip compact>{sortedBookings.length} Eintraege</Chip>}
                        </View>

                        {sortedBookings.length === 0 && !isLoading ? (
                            <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                                Noch keine Buchungen vorhanden.
                            </Text>
                        ) : (
                            sortedBookings.map((booking, index) => (
                                <View key={booking.id}>
                                    <Card style={[styles.bookingCard, isDarkMode && styles.bookingCardDark]}>
                                        <Card.Content>
                                            <View style={styles.bookingCardHeader}>
                                                <View style={styles.bookingCardMeta}>
                                                    <Text style={[styles.bookingTitle, isDarkMode && styles.bookingTitleDark]}>
                                                        {booking.titel}
                                                    </Text>
                                                    <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                                        Fuer {booking.bucherName}
                                                    </Text>
                                                </View>
                                                <Chip compact>{booking.status}</Chip>
                                            </View>

                                            <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                                {formatDateRange(booking)}
                                            </Text>
                                            {booking.zweck ? (
                                                <Text style={[styles.bookingPurpose, isDarkMode && styles.bookingPurposeDark]}>
                                                    {booking.zweck}
                                                </Text>
                                            ) : null}

                                            <View style={styles.bookingDeviceChipRow}>
                                                {booking.geraete.map((geraet) => (
                                                    <Chip key={`${booking.id}-${geraet.invNr}`} compact style={styles.deviceChip}>
                                                        {geraet.invNr} {geraet.modell}
                                                    </Chip>
                                                ))}
                                            </View>

                                            {canManageInventory && (
                                                <View style={styles.bookingActions}>
                                                    <Button
                                                        mode="text"
                                                        onPress={() => void handleDeleteBooking(booking.id)}
                                                        textColor="#b3261e"
                                                    >
                                                        Loeschen
                                                    </Button>
                                                </View>
                                            )}
                                        </Card.Content>
                                    </Card>
                                    {index < sortedBookings.length - 1 ? <Divider style={styles.listDivider} /> : null}
                                </View>
                            ))
                        )}
                    </Surface>
                    ) : null}

                    {isPcoEnabled ? (
                        <>
                            <Surface style={[styles.listCard, isDarkMode && styles.listCardDark]}>
                                <View style={styles.listHeader}>
                                    <View>
                                        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Nächste PCO-Pläne</Text>
                                        <Text style={[styles.sectionHint, isDarkMode && styles.sectionHintDark]}>
                                            Übernehme einen Plan direkt als Buchungsvorschlag mit gemappten Geräten.
                                        </Text>
                                    </View>
                                    {isLoadingSuggestions ? <Chip compact>lädt</Chip> : <Chip compact>{upcomingPcoSuggestions.length} Vorschläge</Chip>}
                                </View>

                                {upcomingPcoSuggestions.length === 0 && !isLoadingSuggestions ? (
                                    <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                                        Keine kommenden PCO-Pläne gefunden.
                                    </Text>
                                ) : (
                                    upcomingPcoSuggestions.map((suggestion, index) => (
                                        <View key={`${suggestion.serviceTypeId}-${suggestion.id}`}>
                                            <Card style={[styles.bookingCard, isDarkMode && styles.bookingCardDark]}>
                                                <Card.Content>
                                                    <View style={styles.bookingCardHeader}>
                                                        <View style={styles.bookingCardMeta}>
                                                            <Text style={[styles.bookingTitle, isDarkMode && styles.bookingTitleDark]}>
                                                                {suggestion.displayTitle}
                                                            </Text>
                                                            <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                                                {suggestion.serviceTypeName}
                                                            </Text>
                                                        </View>
                                                        <Chip compact style={suggestion.hasMapping ? styles.activeChip : styles.inactiveChip}>
                                                            {suggestion.hasMapping ? `${suggestion.geraete.length} Geräte` : "Kein Mapping"}
                                                        </Chip>
                                                    </View>

                                                    <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                                        {formatBookingDate(suggestion.sortDate)}
                                                    </Text>
                                                    {suggestion.seriesTitle ? (
                                                        <Text style={[styles.bookingPurpose, isDarkMode && styles.bookingPurposeDark]}>
                                                            Serie: {suggestion.seriesTitle}
                                                        </Text>
                                                    ) : null}

                                                    <View style={styles.bookingActions}>
                                                        <Button mode="text" onPress={() => handleApplySuggestion(suggestion)}>
                                                            In Formular übernehmen
                                                        </Button>
                                                        {suggestion.planningCenterUrl ? (
                                                            <Button
                                                                mode="text"
                                                                onPress={() => void Linking.openURL(suggestion.planningCenterUrl ?? "")}
                                                            >
                                                                PCO öffnen
                                                            </Button>
                                                        ) : null}
                                                    </View>
                                                </Card.Content>
                                            </Card>
                                            {index < upcomingPcoSuggestions.length - 1 ? <Divider style={styles.listDivider} /> : null}
                                        </View>
                                    ))
                                )}
                            </Surface>

                            <Surface style={[styles.listCard, isDarkMode && styles.listCardDark]}>
                                <View style={styles.listHeader}>
                                    <View>
                                        <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>PCO-Mappings</Text>
                                        <Text style={[styles.sectionHint, isDarkMode && styles.sectionHintDark]}>
                                            Service Types aus Planning Center mit Standard-Geräten verknüpfen.
                                        </Text>
                                    </View>
                                    {isLoadingMappings ? <Chip compact>lädt</Chip> : <Chip compact>{sortedPcoMappings.length} Typen</Chip>}
                                </View>

                                {mappingFeedback ? (
                                    <Text style={[styles.feedbackText, isDarkMode && styles.feedbackTextDark, styles.mappingFeedback]}>
                                        {mappingFeedback}
                                    </Text>
                                ) : null}

                                {sortedPcoMappings.map((mapping, index) => (
                                    <View key={mapping.id}>
                                        <Card style={[styles.bookingCard, isDarkMode && styles.bookingCardDark]}>
                                            <Card.Content>
                                                <View style={styles.bookingCardHeader}>
                                                    <View style={styles.bookingCardMeta}>
                                                        <Text style={[styles.bookingTitle, isDarkMode && styles.bookingTitleDark]}>
                                                            {mapping.pcoServiceTypeName}
                                                        </Text>
                                                        <Text style={[styles.bookingInfo, isDarkMode && styles.bookingInfoDark]}>
                                                            {mapping.isVirtual
                                                                ? `Virtuell aus ${mapping.sourceServiceTypeName ?? "Service Type"}${mapping.sourceSeriesTitle ? ` · ${mapping.sourceSeriesTitle}` : ""}`
                                                                : `PCO Service Type ${mapping.pcoServiceTypeId}`}
                                                        </Text>
                                                    </View>
                                                    <Chip compact style={mapping.aktiv ? styles.activeChip : styles.inactiveChip}>
                                                        {mapping.aktiv ? "aktiv" : "inaktiv"}
                                                    </Chip>
                                                </View>

                                                <View style={styles.bookingDeviceChipRow}>
                                                    {mapping.geraete.length > 0 ? (
                                                        mapping.geraete.map((geraet) => (
                                                            <Chip key={`${mapping.id}-${geraet.invNr}`} compact style={styles.deviceChip}>
                                                                {geraet.invNr} {geraet.modell ?? ""}
                                                            </Chip>
                                                        ))
                                                    ) : (
                                                        <Text style={[styles.emptyStateText, isDarkMode && styles.emptyStateTextDark]}>
                                                            Noch keine Standard-Geräte zugeordnet.
                                                        </Text>
                                                    )}
                                                </View>

                                                {canManageInventory && (
                                                    <View style={styles.bookingActions}>
                                                        <Button
                                                            mode="text"
                                                            onPress={() => handleOpenMappingEditor(mapping)}
                                                        >
                                                            Geräte zuordnen
                                                        </Button>
                                                        <Button
                                                            mode="text"
                                                            onPress={() => void handleToggleMappingActive(mapping)}
                                                            loading={isSavingMapping && activeMappingId === mapping.id}
                                                        >
                                                            {mapping.aktiv ? "Deaktivieren" : "Aktivieren"}
                                                        </Button>
                                                    </View>
                                                )}

                                                {activeMappingId === mapping.id && canManageInventory ? (
                                                    <View style={styles.mappingEditor}>
                                                        <TextInput
                                                            mode="outlined"
                                                            label="Geräte für dieses Mapping suchen"
                                                            value={mappingSearchQuery}
                                                            onChangeText={setMappingSearchQuery}
                                                            style={styles.searchInput}
                                                        />

                                                        <Surface style={[styles.deviceListCard, isDarkMode && styles.deviceListCardDark]}>
                                                            <ScrollView style={styles.mappingDeviceList}>
                                                                {filteredMappingItems.map((item) => {
                                                                    const checked = selectedMappingInvNrs.includes(item.invNr);

                                                                    return (
                                                                        <View key={`mapping-${mapping.id}-${item.invNr}`} style={[styles.deviceRow, isDarkMode && styles.deviceRowDark]}>
                                                                            <Checkbox
                                                                                status={checked ? "checked" : "unchecked"}
                                                                                onPress={() => handleToggleMappingDevice(item.invNr)}
                                                                            />
                                                                            <View style={styles.deviceMeta}>
                                                                                <Text style={[styles.deviceTitle, isDarkMode && styles.deviceTitleDark]}>
                                                                                    {item.invNr} · {item.modell}
                                                                                </Text>
                                                                                <Text style={[styles.deviceSubtitle, isDarkMode && styles.deviceSubtitleDark]}>
                                                                                    {[item.hersteller, item.standort, item.bereich].filter(Boolean).join(" · ")}
                                                                                </Text>
                                                                            </View>
                                                                        </View>
                                                                    );
                                                                })}
                                                            </ScrollView>
                                                        </Surface>

                                                        <Text style={[styles.selectionInfo, isDarkMode && styles.selectionInfoDark]}>
                                                            {selectedMappingInvNrs.length} Gerät(e) für dieses Mapping ausgewählt
                                                        </Text>

                                                        <View style={styles.actionRow}>
                                                            <Button
                                                                mode="outlined"
                                                                onPress={() => {
                                                                    setActiveMappingId(null);
                                                                    setSelectedMappingInvNrs([]);
                                                                    setMappingSearchQuery("");
                                                                    setMappingFeedback(null);
                                                                }}
                                                            >
                                                                Schließen
                                                            </Button>
                                                            <Button
                                                                mode="contained"
                                                                onPress={() => void handleSaveMapping()}
                                                                loading={isSavingMapping}
                                                            >
                                                                Mapping speichern
                                                            </Button>
                                                        </View>
                                                    </View>
                                                ) : null}
                                            </Card.Content>
                                        </Card>
                                        {index < sortedPcoMappings.length - 1 ? <Divider style={styles.listDivider} /> : null}
                                    </View>
                                ))}
                            </Surface>
                        </>
                    ) : null}
                </View>
                    </>
                )}
            />

            <Portal>
                <Modal visible={isScannerVisible} onDismiss={() => setIsScannerVisible(false)}>
                    <View style={styles.scannerModal}>
                        <QrCodeScanner
                            setShowModal={setIsScannerVisible}
                            onScan={handleScannedBookingCode}
                        />
                    </View>
                </Modal>
            </Portal>

            {Platform.OS !== "web" && (
                <DateTimePickerModal
                    isVisible={activeDateField !== null}
                    mode="datetime"
                    date={new Date(parseDateInput(activeDateField === "end" ? endDatum : startDatum) ?? Date.now())}
                    onConfirm={handleDateConfirm}
                    onCancel={() => setActiveDateField(null)}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: "#f5f5f7",
    },
    pageDark: {
        backgroundColor: "#0f1115",
    },
    scannerModal: {
        marginHorizontal: 20,
        height: 420,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: "#000000",
    },
    header: {
        backgroundColor: "#f7f7f8",
        borderBottomWidth: 1,
        borderBottomColor: "#e7e7ea",
        elevation: 0,
    },
    headerDark: {
        backgroundColor: "#121722",
        borderBottomColor: "#212938",
    },
    headerTitle: {
        color: "#111111",
        fontSize: 22,
        fontWeight: "700",
    },
    headerTitleDark: {
        color: "#f5f7fb",
    },
    headerSubtitle: {
        color: "#66707f",
    },
    headerSubtitleDark: {
        color: "#9aa4b2",
    },
    content: {
        padding: 18,
        gap: 18,
    },
    summaryRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        minWidth: 180,
        backgroundColor: "#ffffff",
    },
    summaryCardDark: {
        backgroundColor: "#151922",
    },
    summaryLabel: {
        fontSize: 13,
        color: "#687180",
    },
    summaryLabelDark: {
        color: "#9aa4b2",
    },
    summaryValue: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginTop: 6,
    },
    summaryValueDark: {
        color: "#f5f7fb",
    },
    mainGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 16,
        alignItems: "flex-start",
    },
    formCard: {
        flex: 1,
        minWidth: 360,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#ffffff",
    },
    formCardCompact: {
        minWidth: 0,
        width: "100%",
    },
    formCardDark: {
        backgroundColor: "#151922",
    },
    listCard: {
        flex: 1.2,
        minWidth: 360,
        padding: 16,
        borderRadius: 18,
        backgroundColor: "#ffffff",
    },
    listPanelWrap: {
        flex: 1.2,
        minWidth: 360,
    },
    listCardCompact: {
        minWidth: 0,
        width: "100%",
    },
    listCardCompactWrap: {
        width: "100%",
        minWidth: 0,
        flex: 0,
    },
    listCardDark: {
        backgroundColor: "#151922",
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#111827",
    },
    sectionTitleDark: {
        color: "#f5f7fb",
    },
    sectionHint: {
        marginTop: 4,
        color: "#6b7280",
        fontSize: 13,
    },
    sectionHintDark: {
        color: "#9aa4b2",
    },
    formGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 12,
        columnGap: 0,
        marginTop: 16,
    },
    input: {
        width: "49.2%",
    },
    webDateField: {
        width: "49.2%",
        position: "relative",
        justifyContent: "center",
        minHeight: 56,
    },
    webDateOutline: {
        position: "absolute",
        left: 12,
        top: -8,
        zIndex: 1,
        paddingHorizontal: 4,
        backgroundColor: "#f8f9fb",
    },
    webDateOutlineDark: {
        backgroundColor: "#151922",
    },
    webDateLabel: {
        fontSize: 12,
        color: "#5f6877",
    },
    webDateLabelDark: {
        color: "#aab4c2",
    },
    fullWidthInput: {
        width: "100%",
    },
    searchInput: {
        marginTop: 16,
        marginBottom: 12,
    },
    searchActionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 16,
        marginBottom: 12,
    },
    searchInputCompact: {
        flex: 1,
        marginTop: 0,
        marginBottom: 0,
    },
    searchScannerButton: {
        margin: 0,
        borderWidth: 1,
        borderColor: "#dbe0e6",
    },
    searchScannerButtonDark: {
        borderColor: "#2a3344",
    },
    selectionModeRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    bookingViewModeSwitch: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    bookingViewModeButton: {
        margin: 0,
        borderRadius: 10,
    },
    bookingViewModeButtonActive: {
        borderRadius: 10,
    },
    deviceListCard: {
        borderRadius: 14,
        backgroundColor: "#fbfbfc",
        borderWidth: 1,
        borderColor: "#e3e6eb",
        overflow: "hidden",
    },
    deviceListCardDark: {
        backgroundColor: "#11161d",
        borderColor: "#2a3344",
    },
    deviceList: {
        maxHeight: 300,
    },
    deviceRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#eef1f5",
    },
    deviceRowDark: {
        borderBottomColor: "#202938",
    },
    modelGroupRow: {
        justifyContent: "space-between",
        gap: 12,
    },
    deviceMeta: {
        flex: 1,
        gap: 2,
    },
    deviceTitle: {
        fontSize: 14,
        fontWeight: "500",
        color: "#111827",
    },
    deviceTitleDark: {
        color: "#f5f7fb",
    },
    deviceSubtitle: {
        fontSize: 12,
        color: "#6b7280",
    },
    deviceSubtitleDark: {
        color: "#9aa4b2",
    },
    selectionInfo: {
        marginTop: 10,
        color: "#576171",
        fontSize: 13,
    },
    selectionInfoDark: {
        color: "#b5c0cf",
    },
    selectedInvChipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flexShrink: 0,
        marginLeft: 12,
    },
    quantityValue: {
        minWidth: 18,
        textAlign: "center",
        fontSize: 14,
        fontWeight: "700",
        color: "#111827",
    },
    groupAvailability: {
        marginTop: 2,
        fontSize: 12,
        color: "#6b7280",
    },
    feedbackText: {
        marginTop: 10,
        color: "#0f5ea8",
    },
    feedbackTextDark: {
        color: "#8abfff",
    },
    conflictCard: {
        marginTop: 12,
        padding: 14,
        borderRadius: 14,
        backgroundColor: "#fff4f4",
        borderWidth: 1,
        borderColor: "#ef9a9a",
        gap: 10,
    },
    conflictCardDark: {
        backgroundColor: "#2a1518",
        borderColor: "#a4474f",
    },
    conflictTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#9f1d1d",
    },
    conflictTitleDark: {
        color: "#ffb4b4",
    },
    conflictHint: {
        fontSize: 13,
        color: "#7f1d1d",
    },
    conflictHintDark: {
        color: "#efc6c6",
    },
    conflictList: {
        gap: 10,
    },
    conflictItem: {
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#f4c7c7",
        gap: 4,
    },
    conflictItemDark: {
        borderTopColor: "#60333a",
    },
    conflictItemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 8,
    },
    conflictBookingTitle: {
        flex: 1,
        fontSize: 14,
        fontWeight: "700",
        color: "#7f1d1d",
    },
    conflictMeta: {
        fontSize: 12,
        color: "#7f1d1d",
    },
    conflictChip: {
        backgroundColor: "#f7dede",
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    listHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 16,
    },
    listHeaderText: {
        flex: 1,
        minWidth: 0,
    },
    listHeaderControls: {
        alignItems: "flex-end",
        gap: 8,
    },
    listHeaderChipCompact: {
        alignSelf: "flex-start",
        maxWidth: 110,
    },
    calendarToolbar: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        marginBottom: 14,
    },
    calendarMonthLabel: {
        flex: 1,
        textAlign: "center",
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
        textTransform: "capitalize",
    },
    calendarMonthLabelDark: {
        color: "#f5f7fb",
    },
    calendarWeekdayRow: {
        flexDirection: "row",
        marginBottom: 8,
        justifyContent: "space-between",
    },
    calendarScrollContent: {
        minWidth: 760,
    },
    calendarWeekday: {
        width: "14%",
        textAlign: "center",
        fontSize: 12,
        fontWeight: "700",
        color: "#6b7280",
    },
    calendarWeekdayDark: {
        color: "#9aa4b2",
    },
    calendarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: 8,
    },
    calendarDayCell: {
        width: "14%",
        minWidth: 0,
        minHeight: 74,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#e3e6eb",
        backgroundColor: "#fbfbfc",
        margin: 0,
        paddingHorizontal: 0,
    },
    calendarDayCellDark: {
        backgroundColor: "#11161d",
        borderColor: "#2a3344",
    },
    calendarDayCellMuted: {
        opacity: 0.55,
    },
    calendarDayCellMutedDark: {
        opacity: 0.5,
    },
    calendarDayCellSelected: {
        borderColor: "#7c5cff",
        backgroundColor: "#f5f1ff",
    },
    calendarDayContent: {
        flex: 1,
        padding: 8,
        gap: 4,
    },
    calendarDayNumber: {
        fontSize: 13,
        fontWeight: "700",
        color: "#111827",
    },
    calendarDayNumberDark: {
        color: "#f5f7fb",
    },
    calendarDayNumberMuted: {
        color: "#7b8391",
    },
    calendarDayNumberSelected: {
        color: "#5b33d6",
    },
    calendarDayIndicators: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        minHeight: 10,
    },
    calendarDayDot: {
        width: 6,
        height: 6,
        borderRadius: 999,
        backgroundColor: "#4f7cff",
    },
    calendarDayDotDark: {
        backgroundColor: "#8abfff",
    },
    calendarDayCount: {
        fontSize: 11,
        color: "#5f6877",
    },
    calendarDayCountDark: {
        color: "#aab4c2",
    },
    calendarAgendaHeader: {
        marginTop: 18,
        marginBottom: 12,
    },
    calendarAgendaTitle: {
        fontSize: 16,
    },
    emptyStateText: {
        color: "#6b7280",
    },
    emptyStateTextDark: {
        color: "#9aa4b2",
    },
    bookingCard: {
        backgroundColor: "#fbfbfc",
    },
    bookingCardDark: {
        backgroundColor: "#11161d",
    },
    bookingCardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 8,
    },
    bookingHeaderActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    bookingCardMeta: {
        flex: 1,
    },
    bookingTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
    },
    bookingTitleDark: {
        color: "#f5f7fb",
    },
    bookingInfo: {
        color: "#5f6877",
        fontSize: 13,
        marginTop: 2,
    },
    bookingInfoDark: {
        color: "#aab4c2",
    },
    bookingPurpose: {
        marginTop: 10,
        color: "#374151",
        fontSize: 13,
    },
    bookingPurposeDark: {
        color: "#d6dbe3",
    },
    bookingDeviceChipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    deviceChip: {
        marginRight: 0,
    },
    bookingActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 8,
        marginTop: 8,
    },
    mappingEditor: {
        marginTop: 14,
    },
    mappingDeviceList: {
        maxHeight: 260,
    },
    mappingFeedback: {
        marginBottom: 12,
    },
    activeChip: {
        backgroundColor: "#eef6ee",
    },
    inactiveChip: {
        backgroundColor: "#f0f1f3",
    },
    listDivider: {
        marginVertical: 12,
    },
});

export default BookingPage;




