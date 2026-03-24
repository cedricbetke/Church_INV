// FormFields.tsx
import React from 'react';
import { View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { FormData } from '@/src/features/inventory/types/FormData';
import UIGrid from './DetailGrid';


interface FormFieldsProps {
    formData: FormData;
    handleChange: (name: string, value: string) => void;
    errors: { [key: string]: string };
    loading: boolean;
    error: string | null;
    setShowStatusDialog: (show: boolean) => void;
    setShowBrandDialog: (show: boolean) => void;
    setShowModelDialog: (show: boolean) => void;
    setShowStandortDialog: (show: boolean) => void;
    setShowBereichDialog: (show: boolean) => void;
    setShowKategorieDialog: (show: boolean) => void;
    setShowVerantwortlicherDialog: (show: boolean) => void;
}

export const FormFields: React.FC<FormFieldsProps> = ({
                                                          formData,
                                                          handleChange,
                                                          errors,
                                                          loading,
                                                          error,
                                                          setShowStatusDialog,
                                                          setShowBrandDialog,
                                                          setShowModelDialog,
                                                          setShowStandortDialog,
                                                          setShowBereichDialog,
                                                          setShowKategorieDialog,
                                                          setShowVerantwortlicherDialog
                                                      }) => {
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
        } = {}
    ) => (
        <View>
            <TextInput
                mode="outlined"
                label={label}
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
            {renderField('invNr', 'Inventarnummer', { disabled: loading })}
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
            {renderField('kaufdatum', 'Kaufdatum')}
            {renderField('einkaufspreis', 'Einkaufspreis', {
                keyboardType: 'decimal-pad'
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
