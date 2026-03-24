// FormFields.tsx
import React from 'react';
import { Platform, Text, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { FormData } from '@/src/features/inventory/types/FormData';
import UIGrid from './DetailGrid';

const formatTodayForDateInput = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface FormFieldsProps {
    formData: FormData;
    handleChange: (name: string, value: string) => void;
    errors: { [key: string]: string };
    loading: boolean;
    error: string | null;
    invNrDisabled?: boolean;
    setShowStatusDialog: (show: boolean) => void;
    setShowBrandDialog: (show: boolean) => void;
    setShowModelDialog: (show: boolean) => void;
    setShowStandortDialog: (show: boolean) => void;
    setShowBereichDialog: (show: boolean) => void;
    setShowKategorieDialog: (show: boolean) => void;
    setShowVerantwortlicherDialog: (show: boolean) => void;
    setShowKaufdatumPicker: (show: boolean) => void;
}

export const FormFields: React.FC<FormFieldsProps> = ({
                                                          formData,
                                                          handleChange,
                                                          errors,
                                                          loading,
                                                          error,
                                                          invNrDisabled = false,
                                                          setShowStatusDialog,
                                                          setShowBrandDialog,
                                                          setShowModelDialog,
                                                          setShowStandortDialog,
                                                          setShowBereichDialog,
                                                          setShowKategorieDialog,
                                                          setShowVerantwortlicherDialog,
                                                          setShowKaufdatumPicker
                                                      }) => {
    const renderWebDateField = () => (
        <View style={{ position: 'relative', paddingTop: 4 }}>
            <Text
                style={{
                    position: 'absolute',
                    top: -4,
                    left: 12,
                    zIndex: 1,
                    paddingHorizontal: 4,
                    backgroundColor: '#ffffff',
                    color: errors.kaufdatum ? '#b3261e' : '#6750a4',
                    fontSize: 12,
                }}
            >
                Kaufdatum
            </Text>
            {React.createElement("input", {
                type: "date",
                value: formData.kaufdatum,
                max: formatTodayForDateInput(),
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => handleChange("kaufdatum", event.target.value),
                style: {
                    width: "100%",
                    height: 56,
                    minHeight: 56,
                    maxHeight: 56,
                    padding: "16px 12px 12px 12px",
                    margin: 0,
                    borderRadius: 4,
                    border: errors.kaufdatum ? "1px solid #b3261e" : "1px solid #79747e",
                    backgroundColor: "#ffffff",
                    fontSize: 16,
                    boxSizing: "border-box",
                    outline: "none",
                },
            })}
            {errors.kaufdatum && <HelperText type="error">{errors.kaufdatum}</HelperText>}
        </View>
    );

    const renderField = (
        name: keyof FormData & string,
        label: string,
        options: {
            disabled?: boolean;
            keyboardType?: "default" | "decimal-pad";
            onFocus?: () => void;
            onPressIn?: () => void;
            rightIcon?: string;
            selectionOnly?: boolean;
            placeholder?: string;
        } = {}
    ) => (
        <View>
            <TextInput
                mode="outlined"
                label={label}
                placeholder={options.placeholder}
                value={formData[name]}
                onChangeText={(value) => handleChange(name, value)}
                error={!!errors[name]}
                disabled={options.disabled}
                keyboardType={options.keyboardType}
                onFocus={options.onFocus}
                onPressIn={options.onPressIn}
                showSoftInputOnFocus={!options.selectionOnly}
                right={options.rightIcon ? <TextInput.Icon icon={options.rightIcon} /> : undefined}
                style={{ backgroundColor: 'white' }}
            />
            {errors[name] && <HelperText type="error">{errors[name]}</HelperText>}
            {name === 'invNr' && loading && (
                <HelperText type="info">Lade Inventarnummer...</HelperText>
            )}
            {name === 'invNr' && error && (
                <HelperText type="error">{error}</HelperText>
            )}
        </View>
    );

    return (
        <UIGrid columns={2} xGap={16} yGap={8}>
            {renderField('invNr', 'Inventarnummer', { disabled: loading || invNrDisabled })}
            {renderField('hersteller', 'Hersteller', {
                onFocus: () => setShowBrandDialog(true),
                onPressIn: () => setShowBrandDialog(true),
                rightIcon: 'chevron-down'
            })}
            {renderField('modell', 'Modell', {
                onFocus: () => setShowModelDialog(true),
                onPressIn: () => setShowModelDialog(true),
                rightIcon: 'chevron-down',
                selectionOnly: true
            })}
            {renderField('serien_nr', 'Seriennummer')}
            {Platform.OS === 'web'
                ? renderWebDateField()
                : renderField('kaufdatum', 'Kaufdatum', {
                    placeholder: 'YYYY-MM-DD',
                    onFocus: () => setShowKaufdatumPicker(true),
                    onPressIn: () => setShowKaufdatumPicker(true),
                    rightIcon: 'calendar',
                    selectionOnly: true
                })}
            {renderField('einkaufspreis', 'Einkaufspreis', {
                keyboardType: 'decimal-pad',
                placeholder: '0,00'
            })}
            {renderField('standort', 'Standort', {
                onFocus: () => setShowStandortDialog(true),
                onPressIn: () => setShowStandortDialog(true),
                rightIcon: 'chevron-down',
                selectionOnly: true
            })}
            {renderField('bereich', 'Bereich', {
                onFocus: () => setShowBereichDialog(true),
                onPressIn: () => setShowBereichDialog(true),
                rightIcon: 'chevron-down',
                selectionOnly: true
            })}
            {renderField('kategorie', 'Kategorie', {
                onFocus: () => setShowKategorieDialog(true),
                onPressIn: () => setShowKategorieDialog(true),
                rightIcon: 'chevron-down',
                selectionOnly: true
            })}
            {renderField('status', 'Status', {
                onFocus: () => setShowStatusDialog(true),
                onPressIn: () => setShowStatusDialog(true),
                rightIcon: 'chevron-down',
                selectionOnly: true
            })}
            {renderField('verantwortlicher', 'Verantwortlicher', {
                onFocus: () => setShowVerantwortlicherDialog(true),
                onPressIn: () => setShowVerantwortlicherDialog(true),
                rightIcon: 'chevron-down',
                selectionOnly: true
            })}
        </UIGrid>
    );
};
