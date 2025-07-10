import React, { useState, useEffect } from 'react';
import {View, ScrollView, StyleSheet, SafeAreaView} from 'react-native';
import { 
    Text, 
    TextInput, 
    Button, 
    Card, 
    Chip, 
    List, 
    Divider, 
    IconButton,
    Surface,
    Title,
    Paragraph,
    Badge,
    Dialog,
    Portal
} from 'react-native-paper';
import { TimePickerModal, DatePickerInput,DatePickerModal   } from 'react-native-paper-dates';
import { testInventoryItems } from "@/app/inventoryItem/testdata";
import InventoryItem from "@/app/inventoryItem/InventoryItem";

// Interface für ausgewählte Items mit Menge und spezifischen Items
interface SelectedItem {
    item: InventoryItem;          // Repräsentatives Item für die Anzeige
    quantity: number;             // Anzahl der ausgewählten Items
    specificItems: InventoryItem[]; // Konkrete Items die ausgewählt wurden (mit spezifischen InvNr)
}

// Interface für gruppierte Items nach Modell, Standort und Hersteller
interface GroupedItem {
    key: string;        // Eindeutiger Schlüssel für die Gruppierung
    modell: string;     // Modellbezeichnung
    standort: string;   // Standort des Items
    hersteller: string; // Hersteller des Items
    items: InventoryItem[]; // Alle Items in dieser Gruppe
    count: number;      // Anzahl der Items in der Gruppe
}

const BookingIndex = () => {
    // State für die Suchfunktion
    const [searchQuery, setSearchQuery] = useState('');

    // State für ausgewählte Items in der aktuellen Buchung
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    
    // State für alle verfügbaren Items (aus Testdaten)
    const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
    
    // State für Buchungsdetails
    const [bookingDate, setBookingDate] = useState('');      // Datum der Buchung
    const [bookingPerson, setBookingPerson] = useState('');  // Person/Abteilung die bucht
    const [bookingReason, setBookingReason] = useState('');  // Grund für die Buchung (optional)

    const [inputDateStart, setInputDateStart] = React.useState(undefined);
    const [inputDateEnd, setInputDateEnd] = React.useState(undefined);

    // State für Mengenauswahl-Dialog
    const [quantityDialog, setQuantityDialog] = useState<{
        visible: boolean;           // Dialog sichtbar oder nicht
        groupedItem: GroupedItem | null; // Aktuell ausgewählte Gruppe von Items
        selectedQuantity: number;   // Ausgewählte Menge im Dialog
    }>({
        visible: false,
        groupedItem: null,
        selectedQuantity: 1
    });

    // Beim Laden der Komponente die Testdaten laden
    useEffect(() => {
        setAvailableItems(testInventoryItems);
    }, []);
    const showMode = () => {
        setShow(true);
    };
    const showDatepicker = () => {
        showMode();
    };
    /**
     * Gruppiert Items nach Modell, Standort und Hersteller
     * Gleiche Items werden zu einer Gruppe zusammengefasst
     */
    const groupItems = (items: InventoryItem[]): GroupedItem[] => {
        const groups: { [key: string]: GroupedItem } = {};
        
        items.forEach(item => {
            // Eindeutiger Schlüssel für die Gruppierung
            const key = `${item.modell}-${item.standort}-${item.hersteller}`;
            
            // Neue Gruppe erstellen wenn noch nicht vorhanden
            if (!groups[key]) {
                groups[key] = {
                    key,
                    modell: item.modell,
                    standort: item.standort,
                    hersteller: item.hersteller,
                    items: [],
                    count: 0
                };
            }
            
            // Item zur Gruppe hinzufügen
            groups[key].items.push(item);
            groups[key].count++;
        });
        
        return Object.values(groups);
    };

    /**
     * Filtert verfügbare Items (entfernt bereits ausgewählte Items)
     * Verhindert Doppelbuchungen derselben InvNr
     */
    const getAvailableItems = (): InventoryItem[] => {
        // Sammle alle bereits ausgewählten Inventarnummern
        const selectedInvNrs = selectedItems.flatMap(si => 
            si.specificItems.map(item => item.invNr)
        );
        
        // Filtere Items die noch nicht ausgewählt wurden
        return availableItems.filter(item => 
            !selectedInvNrs.includes(item.invNr)
        );
    };

    /**
     * Filtert Items basierend auf der Suchanfrage
     * Durchsucht InvNr, Modell, Standort und Hersteller
     */
    const filteredItems = getAvailableItems().filter(item => 
        String(item.invNr).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.modell).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.standort).toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.hersteller).toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Gruppiere die gefilterten Suchergebnisse
    const groupedSearchResults = groupItems(filteredItems);

    /**
     * Öffnet den Dialog zur Mengenauswahl für eine Gruppe von Items
     */
    const openQuantityDialog = (groupedItem: GroupedItem) => {
        setQuantityDialog({
            visible: true,
            groupedItem,
            selectedQuantity: Math.min(1, groupedItem.count) // Minimum 1, maximum verfügbare Anzahl
        });
    };

    /**
     * Fügt ausgewählte Items zur Buchung hinzu
     * Wählt die ersten X Items aus der Gruppe basierend auf der Menge
     */
    const addItemsToBooking = () => {
        const { groupedItem, selectedQuantity } = quantityDialog;
        
        if (!groupedItem || selectedQuantity <= 0) return;

        // Wähle die ersten X Items aus der Gruppe (FIFO-Prinzip)
        const specificItems = groupedItem.items.slice(0, selectedQuantity);
        
        // Erstelle neuen SelectedItem-Eintrag
        const newSelectedItem: SelectedItem = {
            item: groupedItem.items[0], // Erstes Item als Repräsentant für die Anzeige
            quantity: selectedQuantity,
            specificItems
        };

        // Füge zur Liste der ausgewählten Items hinzu
        setSelectedItems(prev => [...prev, newSelectedItem]);
        
        // Dialog schließen und Suche zurücksetzen
        setQuantityDialog({ visible: false, groupedItem: null, selectedQuantity: 1 });
        setSearchQuery('');
    };

    /**
     * Entfernt ein Item aus der Buchung basierend auf dem Index
     */
    const removeItemFromBooking = (index: number) => {
        setSelectedItems(prev => prev.filter((_, i) => i !== index));
    };

    /**
     * Verarbeitet die finale Buchung
     * Validiert Eingaben und erstellt die Buchung
     */
    const handleBooking = () => {
        // Berechne Gesamtanzahl der Items
        const totalItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0);
        
        // Validierung: Mindestens ein Item erforderlich
        if (totalItems === 0) {
            alert('Bitte wählen Sie mindestens ein Item aus.');
            return;
        }
        
        // Validierung: Pflichtfelder prüfen
        if (!bookingDate || !bookingPerson) {
            alert('Bitte füllen Sie alle Pflichtfelder aus.');
            return;
        }

        // Sammle alle spezifischen Items für die Buchung
        const allSpecificItems = selectedItems.flatMap(si => si.specificItems);
        
        // Buchungsdaten für Backend/Logging vorbereiten
        console.log('Buchung erstellt:', {
            items: allSpecificItems.map(item => item.invNr),
            date: bookingDate,
            person: bookingPerson,
            reason: bookingReason
        });

        // Erfolgsbestätigung anzeigen
        alert(`Buchung erfolgreich erstellt!\n${totalItems} Items für ${bookingPerson} am ${bookingDate}`);
        
        // Reset aller Felder nach erfolgreicher Buchung
        setSelectedItems([]);
        setBookingDate('');
        setBookingPerson('');
        setBookingReason('');
    };

    // Berechne Gesamtanzahl der ausgewählten Items für die Anzeige
    const totalSelectedItems = selectedItems.reduce((sum, si) => sum + si.quantity, 0);

    return (
        <ScrollView style={styles.container}>
            <Title style={styles.title}>Neue Buchung erstellen</Title>

            {/* Sektion 1: Buchungsdetails eingeben */}
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Buchungsdetails</Title>
                    {/* Datum der Buchung (Pflichtfeld) */}
                    <SafeAreaView style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, gap:12 }}>
                        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                            <DatePickerInput
                                locale="de"
                                label="Datum Start"
                                value={inputDateStart}
                                onChange={(d) => setInputDateStart(d)}
                                inputMode="start"
                            />
                        </View>
                        <View style={{ justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                            <DatePickerInput
                                locale="de"
                                label="Datum Ende"
                                value={inputDateEnd}
                                onChange={(d) => setInputDateEnd(d)}
                                inputMode="start"
                            />
                        </View>
                    </SafeAreaView>
                    {/* Person/Abteilung die bucht (Pflichtfeld) */}
                    <TextInput
                        label="Person/Abteilung *"
                        placeholder="Wer bucht die Items?"
                        value={bookingPerson}
                        onChangeText={setBookingPerson}
                        style={styles.input}
                        mode="outlined"
                    />
                    {/* Grund für die Buchung (optional, mehrzeilig) */}
                    <TextInput
                        label="Grund (optional)"
                        placeholder="Wofür werden die Items benötigt?"
                        value={bookingReason}
                        onChangeText={setBookingReason}
                        style={styles.input}
                        mode="outlined"
                        multiline
                        numberOfLines={3}
                    />
                </Card.Content>
            </Card>

            {/* Sektion 2: Anzeige der ausgewählten Items */}
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Ausgewählte Items ({totalSelectedItems})</Title>
                    {selectedItems.length === 0 ? (
                        <Paragraph>Noch keine Items ausgewählt.</Paragraph>
                    ) : (
                        <View style={styles.selectedItemsContainer}>
                            {selectedItems.map((selectedItem, index) => (
                                <View key={index} style={styles.selectedItemRow}>
                                    {/* Chip mit Menge und Lösch-Option */}
                                    <Chip
                                        onClose={() => removeItemFromBooking(index)}
                                        style={styles.chip}
                                    >
                                        {selectedItem.quantity}x {selectedItem.item.modell}
                                    </Chip>
                                    {/* Zusätzliche Item-Details */}
                                    <Text style={styles.itemDetails}>
                                        {selectedItem.item.standort} | {selectedItem.item.hersteller}
                                    </Text>
                                    {/* Spezifische Inventarnummern anzeigen */}
                                    <Text style={styles.itemNumbers}>
                                        InvNr: {selectedItem.specificItems.map(item => item.invNr).join(', ')}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}
                </Card.Content>
            </Card>

            {/* Sektion 3: Item-Suche und Hinzufügen */}
            <Card style={styles.card}>
                <Card.Content>
                    <Title>Items hinzufügen</Title>
                    {/* Suchfeld mit Lupe und Lösch-Icon */}
                    <TextInput
                        label="Nach Items suchen"
                        placeholder="InvNr, Modell, Standort oder Hersteller eingeben..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.input}
                        mode="outlined"
                        left={<TextInput.Icon icon="magnify" />}
                        right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : undefined}
                    />

                    {/* Suchergebnisse anzeigen (nur wenn Suchtext vorhanden) */}
                    {searchQuery && (
                        <Surface style={styles.searchResults}>
                            {groupedSearchResults.length === 0 ? (
                                <Paragraph style={styles.noResults}>
                                    Keine verfügbaren Items gefunden.
                                </Paragraph>
                            ) : (
                                <>
                                    {/* Header mit Anzahl gefundener Gruppen */}
                                    <Text style={styles.resultsHeader}>
                                        {groupedSearchResults.length} verschiedene Items gefunden:
                                    </Text>
                                    {/* Scrollbare Liste der gruppierten Ergebnisse */}
                                    <ScrollView 
                                        style={styles.resultsScrollView}
                                        nestedScrollEnabled={true}
                                        showsVerticalScrollIndicator={true}
                                    >
                                        {groupedSearchResults.map((groupedItem) => (
                                            <List.Item
                                                key={groupedItem.key}
                                                title={`${groupedItem.modell} (${groupedItem.hersteller})`}
                                                description={`Standort: ${groupedItem.standort}`}
                                                left={() => <List.Icon icon="laptop" />}
                                                right={() => (
                                                    <View style={styles.itemRightSection}>
                                                        {/* Badge mit Anzahl verfügbarer Items */}
                                                        <Badge style={styles.countBadge}>
                                                            {groupedItem.count}
                                                        </Badge>
                                                        {/* Plus-Button zum Hinzufügen */}
                                                        <IconButton
                                                            icon="plus"
                                                            onPress={() => openQuantityDialog(groupedItem)}
                                                            iconColor="#1976d2"
                                                        />
                                                    </View>
                                                )}
                                                onPress={() => openQuantityDialog(groupedItem)}
                                                style={styles.listItem}
                                            />
                                        ))}
                                    </ScrollView>
                                </>
                            )}
                        </Surface>
                    )}
                </Card.Content>
            </Card>

            {/* Dialog für Mengenauswahl */}
            <Portal>
                <Dialog 
                    visible={quantityDialog.visible} 
                    onDismiss={() => setQuantityDialog({ visible: false, groupedItem: null, selectedQuantity: 1 })}
                >
                    <Dialog.Title>Menge auswählen</Dialog.Title>
                    <Dialog.Content>
                        {quantityDialog.groupedItem && (
                            <>
                                {/* Item-Informationen anzeigen */}
                                <Paragraph>
                                    {quantityDialog.groupedItem.modell} ({quantityDialog.groupedItem.hersteller})
                                </Paragraph>
                                <Paragraph>
                                    Standort: {quantityDialog.groupedItem.standort}
                                </Paragraph>
                                <Paragraph style={styles.availableCount}>
                                    Verfügbar: {quantityDialog.groupedItem.count} Stück
                                </Paragraph>
                                
                                {/* Menge mit Plus/Minus-Buttons auswählen */}
                                <View style={styles.quantitySelector}>
                                    <IconButton
                                        icon="minus"
                                        disabled={quantityDialog.selectedQuantity <= 1}
                                        onPress={() => setQuantityDialog(prev => ({
                                            ...prev,
                                            selectedQuantity: Math.max(1, prev.selectedQuantity - 1)
                                        }))}
                                    />
                                    <Text style={styles.quantityText}>
                                        {quantityDialog.selectedQuantity}
                                    </Text>
                                    <IconButton
                                        icon="plus"
                                        disabled={quantityDialog.selectedQuantity >= (quantityDialog.groupedItem?.count || 0)}
                                        onPress={() => setQuantityDialog(prev => ({
                                            ...prev,
                                            selectedQuantity: Math.min(
                                                prev.groupedItem?.count || 1, 
                                                prev.selectedQuantity + 1
                                            )
                                        }))}
                                    />
                                </View>
                            </>
                        )}
                    </Dialog.Content>
                    <Dialog.Actions>
                        {/* Dialog-Buttons */}
                        <Button onPress={() => setQuantityDialog({ visible: false, groupedItem: null, selectedQuantity: 1 })}>
                            Abbrechen
                        </Button>
                        <Button mode="contained" onPress={addItemsToBooking}>
                            Hinzufügen
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>

            {/* Button zum Abschließen der Buchung */}
            <Button
                mode="contained"
                onPress={handleBooking}
                style={styles.bookButton}
                disabled={totalSelectedItems === 0 || !bookingDate || !bookingPerson} // Deaktiviert wenn Pflichtfelder fehlen
            >
                Buchung erstellen ({totalSelectedItems} Items)
            </Button>
        </ScrollView>
    );
};

// Styling für die gesamte Komponente
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        marginBottom: 16,
        textAlign: 'center',
    },
    card: {
        marginBottom: 16,
        elevation: 4, // Schatten für Android
    },
    input: {
        marginBottom: 12,
    },
    selectedItemsContainer: {
        marginTop: 8,
    },
    selectedItemRow: {
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
    },
    chip: {
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    itemDetails: {
        fontSize: 12,
        color: '#666',
        marginBottom: 2,
    },
    itemNumbers: {
        fontSize: 10,
        color: '#999',
    },
    searchResults: {
        marginTop: 12,
        borderRadius: 8,
        overflow: 'hidden',
    },
    resultsHeader: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#1976d2',
        paddingHorizontal: 8,
        paddingTop: 8,
    },
    resultsScrollView: {
        maxHeight: 200, // Begrenzte Höhe für bessere UX
    },
    listItem: {
        paddingVertical: 4,
    },
    itemRightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countBadge: {
        marginRight: 8,
    },
    noResults: {
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#666',
        padding: 16,
    },
    availableCount: {
        fontWeight: 'bold',
        color: '#1976d2',
        marginTop: 8,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    quantityText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 20,
        minWidth: 40,
        textAlign: 'center',
    },
    bookButton: {
        marginVertical: 24,
        paddingVertical: 8,
    },
});

export default BookingIndex;