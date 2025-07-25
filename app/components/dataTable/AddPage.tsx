import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Modal, Portal, Button, Title } from 'react-native-paper';
import { FormFields } from './FormFields';
import { useInventory } from '@/app/context/InventoryContext';
import SelectionDialog from './SelectionDialog';
import { FormData } from '@/app/types/FormData';

interface AddPageProps {
    visible: boolean;
    onDismiss: () => void;
    existingBrands: Array<{ id: number; name: string }>;
    existingModels: Array<{ id: number; name: string }>;
    onAddBrand: (brandName: string) => Promise<void>;
    onSubmit: (itemData: any) => Promise<void>;
}

const AddPage: React.FC<AddPageProps> = ({visible, onDismiss, existingModels, existingBrands, onAddBrand, onSubmit}) => {
    const { states, fetchMaxGeraeteId } = useInventory();
    const [showStatusDialog, setShowStatusDialog] = useState(false);
    const [showBrandDialog, setShowBrandDialog] = useState(false);
    const [showModelDialog, setShowModelDialog] = useState(false);
    const [statusSearchQuery, setStatusSearchQuery] = useState('');
    const [brandSearchQuery, setBrandSearchQuery] = useState('');
    const [modelSearchQuery, setModelSearchQuery] = useState('');
    const [isNewBrand, setIsNewBrand] = useState(false);
    const [isNewModel, setIsNewModel] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingNewBrand, setPendingNewBrand] = useState<string | null>(null); // Neue Brand die erst beim Submit erstellt wird

    const [formData, setFormData] = useState<FormData>({
        invNr: '',
        modell: '',
        hersteller: '',
        serien_nr: '',
        kaufdatum: '',
        einkaufspreis: '',
        standort: '',
        bereich: '',
        kategorie: '',
        status: '',
        verantwortlicher: ''
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (visible) {
            const loadMaxId = async () => {
                try {
                    setLoading(true);
                    const maxId = await fetchMaxGeraeteId();
                    setFormData(prev => ({
                        ...prev,
                        invNr: (maxId).toString()
                    }));
                } catch (err) {
                    console.error('Fehler beim Laden der Max-ID:', err);
                    setError('Fehler beim Laden der Max-ID');
                } finally {
                    setLoading(false);
                }
            };
            loadMaxId();
        }
    }, [visible, fetchMaxGeraeteId]);

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBrandSelect = (brandName: string) => {
        handleChange('hersteller', brandName);
        setShowBrandDialog(false);
        setBrandSearchQuery('');
    };

    const handleAddNewBrand = async () => { //Todo: Nur adden wenn form submitted wird. Vorher nicht. Stand jetzt: auswhlen von Brand bedeuted erstellen in DB
        if (brandSearchQuery.trim()) {
            //speichere den neuen Brand-Namen für das spätere Erstellen beim submit
            setPendingNewBrand(brandSearchQuery)
            handleBrandSelect(brandSearchQuery)
            setIsNewBrand(false);
        }
    };

    const handleModelSelect = (modelName: string) => {
        handleChange('modell', modelName);
        setShowModelDialog(false);
        setModelSearchQuery('');
    };

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.invNr) newErrors.invNr = 'Inventarnummer ist erforderlich';
        if (!formData.modell) newErrors.modell = 'Modell ist erforderlich';
        if (!formData.status) newErrors.status = 'Status ist erforderlich';
        if (!formData.hersteller) newErrors.hersteller = 'Hersteller ist erforderlich';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            try {
                if (pendingNewBrand) {
                    await onAddBrand(pendingNewBrand);
                    setPendingNewBrand(null);

                }
                onSubmit(formData);
                setFormData({
                    invNr: '',
                    modell: '',
                    hersteller: '',
                    serien_nr: '',
                    kaufdatum: '',
                    einkaufspreis: '',
                    standort: '',
                    bereich: '',
                    kategorie: '',
                    status: '',
                    verantwortlicher: ''
                });
                onDismiss();
            }catch (error){
                console.error('Fehler beim Speichern:', error);
                setError('Fehler beim speichern des Items');
            }

        }
    };

    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={styles.modalContainer}
            >
                <ScrollView>
                    <Title style={styles.title}>Neuen Artikel hinzufügen</Title>
                    <View style={styles.form}>
                        <FormFields
                            formData={formData}
                            handleChange={handleChange}
                            errors={errors}
                            loading={loading}
                            error={error}
                            setShowStatusDialog={setShowStatusDialog}
                            setShowBrandDialog={setShowBrandDialog}
                            setShowModelDialog={setShowModelDialog}
                        />
                        <View style={styles.buttonContainer}>
                            <Button
                                mode="outlined"
                                onPress={onDismiss}
                                style={styles.button}
                            >
                                Abbrechen
                            </Button>
                            <Button
                                mode="contained"
                                onPress={handleSubmit}
                                style={styles.button}
                            >
                                Speichern
                            </Button>
                        </View>
                    </View>
                </ScrollView>

                <SelectionDialog
                    visible={showStatusDialog}
                    onDismiss={() => setShowStatusDialog(false)}
                    title="Status auswählen"
                    searchQuery={statusSearchQuery}
                    onSearchChange={setStatusSearchQuery}
                    items={states}
                    onSelect={(statusName) => {
                        handleChange('status', statusName);
                        setShowStatusDialog(false);
                        setStatusSearchQuery('');
                    }}
                    onAddNew={async () => {
                        console.log('Neue Status können nur vom Administrator hinzugefügt werden');
                    }}
                    isNewItem={false}
                />

                <SelectionDialog
                    visible={showBrandDialog}
                    onDismiss={() => setShowBrandDialog(false)}
                    title="Hersteller auswählen"
                    searchQuery={brandSearchQuery}
                    onSearchChange={(text) => {
                        setBrandSearchQuery(text);
                        setIsNewBrand(!existingBrands.some(
                            brand => brand.name.toLowerCase() === text.toLowerCase()
                        ));
                    }}
                    items={existingBrands}
                    onSelect={handleBrandSelect}
                    onAddNew={handleAddNewBrand}
                    isNewItem={isNewBrand}
                />

                <SelectionDialog
                    visible={showModelDialog}
                    onDismiss={() => setShowModelDialog(false)}
                    title="Modell auswählen"
                    searchQuery={modelSearchQuery}
                    onSearchChange={(text) => {
                        setModelSearchQuery(text);
                        setIsNewModel(true); // Hier könnte man auch gegen existierende Modelle prüfen
                    }}
                    items={existingModels} // Hier könnten die verfügbaren Modelle eingefügt werden
                    onSelect={handleModelSelect}
                    onAddNew={async () => {
                        handleModelSelect(modelSearchQuery);
                        return Promise.resolve();
                    }}
                    isNewItem={isNewModel}
                />
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        backgroundColor: 'white',
        margin: 20,
        padding: 20,
        borderRadius: 10,
        maxHeight: '90%',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
    },
    form: {
        gap: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    button: {
        flex: 1,
        marginHorizontal: 5,
    },
});

export default AddPage;