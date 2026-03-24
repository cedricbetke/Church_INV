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
}

export const FormFields: React.FC<FormFieldsProps> = ({
                                                          formData,
                                                          handleChange,
                                                          errors,
                                                          loading,
                                                          error,
                                                          setShowStatusDialog,
                                                          setShowBrandDialog,
                                                          setShowModelDialog
                                                      }) => {
    const renderField = (
        name: keyof FormData & string,
        label: string,
        options: {
            disabled?: boolean;
            keyboardType?: "default" | "decimal-pad";
            onFocus?: () => void;
            rightIcon?: string;
            isDatePicker?: boolean;
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
                rightIcon: 'chevron-down'
            })}
            {renderField('modell', 'Modell', {
                onFocus: () => setShowModelDialog(true),
                rightIcon: 'chevron-down'
            })}
            {renderField('serien_nr', 'Seriennummer')}
            {renderField('kaufdatum', 'Kaufdatum')}
            {renderField('einkaufspreis', 'Einkaufspreis', {
                keyboardType: 'decimal-pad'
            })}
            {renderField('standort', 'Standort')}
            {renderField('bereich', 'Bereich')}
            {renderField('kategorie', 'Kategorie')}
            {renderField('status', 'Status', {
                onFocus: () => setShowStatusDialog(true),
                rightIcon: 'chevron-down'
            })}
            {renderField('verantwortlicher', 'Verantwortlicher')}
        </UIGrid>
    );
};
