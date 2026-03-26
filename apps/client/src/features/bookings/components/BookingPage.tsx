import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import axios from "axios";
import { Appbar, Button, Card, Chip, Checkbox, Divider, Surface, Text, TextInput } from "react-native-paper";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useInventory } from "@/src/features/inventory/context/InventoryContext";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";
import buchungService from "@/src/features/bookings/services/buchungService";
import { Booking } from "@/src/features/bookings/types/Booking";

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

const BookingPage = () => {
    const { isDarkMode, toggleTheme } = useAppThemeMode();
    const { items, canManageInventory } = useInventory();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [titel, setTitel] = useState("");
    const [bucherName, setBucherName] = useState("");
    const [zweck, setZweck] = useState("");
    const [startDatum, setStartDatum] = useState("");
    const [endDatum, setEndDatum] = useState("");
    const [activeDateField, setActiveDateField] = useState<"start" | "end" | null>(null);
    const [selectedInvNrs, setSelectedInvNrs] = useState<number[]>([]);
    const [feedback, setFeedback] = useState<string | null>(null);

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

    useEffect(() => {
        void loadBookings();
    }, []);

    const filteredItems = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de-DE");

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
    }, [items, searchQuery]);

    const sortedBookings = useMemo(
        () => [...bookings].sort((left, right) => new Date(left.startDatum).getTime() - new Date(right.startDatum).getTime()),
        [bookings],
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

    const resetForm = () => {
        setTitel("");
        setBucherName("");
        setZweck("");
        setStartDatum("");
        setEndDatum("");
        setSelectedInvNrs([]);
    };

    const handleToggleDevice = (invNr: number) => {
        setSelectedInvNrs((current) =>
            current.includes(invNr)
                ? current.filter((value) => value !== invNr)
                : [...current, invNr],
        );
    };

    const handleDateConfirm = (date: Date) => {
        const formattedDate = formatDateForInput(date);

        if (activeDateField === "start") {
            setStartDatum(formattedDate);
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

    const handleDeleteBooking = async (bookingId: number) => {
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
    };

    return (
        <View style={[styles.page, isDarkMode && styles.pageDark]}>
            <Appbar.Header style={[styles.header, isDarkMode && styles.headerDark]}>
                <Appbar.BackAction iconColor={isDarkMode ? "#dbe6f5" : "#445160"} onPress={() => router.back()} />
                <Appbar.Content
                    title="Buchungen"
                    subtitle="Mehrere Geräte pro Buchung, sauber nach Zeitraum geplant"
                    titleStyle={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}
                    subtitleStyle={[styles.headerSubtitle, isDarkMode && styles.headerSubtitleDark]}
                />
                <Appbar.Action
                    icon={isDarkMode ? "weather-sunny" : "moon-waning-crescent"}
                    color={isDarkMode ? "#dbe6f5" : "#445160"}
                    onPress={toggleTheme}
                />
            </Appbar.Header>

            <ScrollView contentContainerStyle={styles.content}>
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
                    <Surface style={[styles.formCard, isDarkMode && styles.formCardDark]}>
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
                                    onChange={setStartDatum}
                                    isDarkMode={isDarkMode}
                                />
                            ) : (
                                <TextInput
                                    mode="outlined"
                                    label="Von"
                                    placeholder="2026-03-26 18:00"
                                    value={startDatum ? formatDateForDisplayInput(startDatum) : ""}
                                    onChangeText={setStartDatum}
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

                        <TextInput
                            mode="outlined"
                            label="Geräte suchen"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                        />

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
                            {selectedInvNrs.length} Gerät(e) ausgewählt
                        </Text>

                        {feedback && (
                            <Text style={[styles.feedbackText, isDarkMode && styles.feedbackTextDark]}>
                                {feedback}
                            </Text>
                        )}

                        <View style={styles.actionRow}>
                            <Button mode="outlined" onPress={resetForm}>
                                Leeren
                            </Button>
                            {canManageInventory && (
                                <Button mode="contained" onPress={() => void handleCreateBooking()} loading={isSubmitting}>
                                    Buchung anlegen
                                </Button>
                            )}
                        </View>
                    </Surface>

                    <Surface style={[styles.listCard, isDarkMode && styles.listCardDark]}>
                        <View style={styles.listHeader}>
                            <View>
                                <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Bestehende Buchungen</Text>
                                <Text style={[styles.sectionHint, isDarkMode && styles.sectionHintDark]}>
                                    Hier ist der Bereich, der spaeter gut an Planning Center andocken kann.
                                </Text>
                            </View>
                            {isLoading ? <Chip compact>lädt</Chip> : <Chip compact>{sortedBookings.length} Einträge</Chip>}
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
                            ))
                        )}
                    </Surface>
                </View>
            </ScrollView>

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
    header: {
        backgroundColor: "#f7f7f8",
        borderBottomWidth: 1,
        borderBottomColor: "#e7e7ea",
        elevation: 0,
        shadowOpacity: 0,
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
    deviceListCard: {
        borderRadius: 14,
        backgroundColor: "#fbfbfc",
        borderWidth: 1,
        borderColor: "#e3e6eb",
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
    feedbackText: {
        marginTop: 10,
        color: "#0f5ea8",
    },
    feedbackTextDark: {
        color: "#8abfff",
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
        marginTop: 8,
    },
    listDivider: {
        marginVertical: 12,
    },
});

export default BookingPage;
