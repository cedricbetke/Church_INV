import React from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { HelperText, TextInput } from "react-native-paper";
import { FormData } from "@/src/features/inventory/types/FormData";
import UIGrid from "./DetailGrid";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

const formatTodayForDateInput = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

interface FormFieldsProps {
    formData: FormData;
    handleChange: (name: string, value: string) => void;
    errors: { [key: string]: string };
    loading: boolean;
    error: string | null;
    invNrDisabled?: boolean;
    isModelSelectionEnabled: boolean;
    isKategorieSelectionEnabled: boolean;
    setShowStatusDialog: (show: boolean) => void;
    setShowObjekttypDialog: (show: boolean) => void;
    setShowBrandDialog: (show: boolean) => void;
    setShowModelDialog: (show: boolean) => void;
    setShowStandortDialog: (show: boolean) => void;
    setShowBereichDialog: (show: boolean) => void;
    setShowKategorieDialog: (show: boolean) => void;
    setShowVerantwortlicherDialog: (show: boolean) => void;
    setShowKaufdatumPicker: (show: boolean) => void;
}

const REQUIRED_FIELDS = new Set<keyof FormData>([
    "invNr",
    "hersteller",
    "objekttyp",
    "modell",
    "bereich",
    "status",
]);

const getFieldLabel = (name: keyof FormData, label: string) => (
    REQUIRED_FIELDS.has(name) ? `${label} *` : label
);

export const FormFields: React.FC<FormFieldsProps> = ({
    formData,
    handleChange,
    errors,
    loading,
    error,
    invNrDisabled = false,
    isModelSelectionEnabled,
    isKategorieSelectionEnabled,
    setShowStatusDialog,
    setShowObjekttypDialog,
    setShowBrandDialog,
    setShowModelDialog,
    setShowStandortDialog,
    setShowBereichDialog,
    setShowKategorieDialog,
    setShowVerantwortlicherDialog,
    setShowKaufdatumPicker,
}) => {
    const { isDarkMode } = useAppThemeMode();
    const { width } = useWindowDimensions();
    const isCompactViewport = width < 640;

    const renderWebDateField = () => (
        <View style={styles.dateFieldWrapper}>
            <Text
                style={[
                    styles.dateFieldLabel,
                    isDarkMode && styles.dateFieldLabelDark,
                    errors.kaufdatum && styles.dateFieldLabelError,
                ]}
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
                    border: errors.kaufdatum ? "1px solid #b3261e" : isDarkMode ? "1px solid #6b7280" : "1px solid #79747e",
                    backgroundColor: isDarkMode ? "#11161d" : "#ffffff",
                    color: isDarkMode ? "#f3f4f6" : "#1f2937",
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
            helperText?: string;
        } = {},
    ) => (
        <View>
            <TextInput
                mode="outlined"
                label={getFieldLabel(name, label)}
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
                style={[styles.fieldInput, isDarkMode && styles.fieldInputDark]}
            />
            {errors[name] && <HelperText type="error">{errors[name]}</HelperText>}
            {!errors[name] && options.helperText && <HelperText type="info">{options.helperText}</HelperText>}
            {name === "invNr" && loading && (
                <HelperText type="info">Lade Inventarnummer...</HelperText>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {error && <HelperText type="error">{error}</HelperText>}
            <UIGrid columns={2} xGap={16} yGap={8}>
                {renderField("invNr", "Inventarnummer", { disabled: loading || invNrDisabled })}
                {renderField("hersteller", "Hersteller", {
                    onFocus: () => setShowBrandDialog(true),
                    onPressIn: () => setShowBrandDialog(true),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("objekttyp", "Objekttyp", {
                    onFocus: () => setShowObjekttypDialog(true),
                    onPressIn: () => setShowObjekttypDialog(true),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("modell", "Modell", {
                    disabled: !isModelSelectionEnabled,
                    onFocus: isModelSelectionEnabled ? () => setShowModelDialog(true) : undefined,
                    onPressIn: isModelSelectionEnabled ? () => setShowModelDialog(true) : undefined,
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                    placeholder: !isModelSelectionEnabled && isCompactViewport ? "Zuerst Hersteller + Objekttyp" : undefined,
                    helperText: !isModelSelectionEnabled && !isCompactViewport ? "Bitte zuerst Hersteller und Objekttyp wählen" : undefined,
                })}
                {renderField("serien_nr", "Seriennummer")}
                {Platform.OS === "web"
                    ? renderWebDateField()
                    : renderField("kaufdatum", "Kaufdatum", {
                        placeholder: "YYYY-MM-DD",
                        onFocus: () => setShowKaufdatumPicker(true),
                        onPressIn: () => setShowKaufdatumPicker(true),
                        rightIcon: "calendar",
                        selectionOnly: true,
                    })}
                {renderField("einkaufspreis", "Einkaufspreis", {
                    keyboardType: "decimal-pad",
                    placeholder: "0,00",
                })}
                {renderField("zustandshinweis", "Zustandshinweis")}
                {renderField("standort", "Standort", {
                    onFocus: () => setShowStandortDialog(true),
                    onPressIn: () => setShowStandortDialog(true),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("bereich", "Bereich", {
                    onFocus: () => setShowBereichDialog(true),
                    onPressIn: () => setShowBereichDialog(true),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("kategorie", "Kategorie", {
                    disabled: !isKategorieSelectionEnabled,
                    onFocus: isKategorieSelectionEnabled ? () => setShowKategorieDialog(true) : undefined,
                    onPressIn: isKategorieSelectionEnabled ? () => setShowKategorieDialog(true) : undefined,
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                    placeholder: !isKategorieSelectionEnabled && isCompactViewport ? "Zuerst Bereich wählen" : undefined,
                    helperText: !isKategorieSelectionEnabled && !isCompactViewport ? "Bitte zuerst einen Bereich wählen" : undefined,
                })}
                {renderField("status", "Status", {
                    onFocus: () => setShowStatusDialog(true),
                    onPressIn: () => setShowStatusDialog(true),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("verantwortlicher", "Verantwortlicher", {
                    onFocus: () => setShowVerantwortlicherDialog(true),
                    onPressIn: () => setShowVerantwortlicherDialog(true),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
            </UIGrid>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 8,
    },
    dateFieldWrapper: {
        position: "relative",
        paddingTop: 4,
    },
    dateFieldLabel: {
        position: "absolute",
        top: -4,
        left: 12,
        zIndex: 1,
        paddingHorizontal: 4,
        backgroundColor: "#ffffff",
        color: "#6750a4",
        fontSize: 12,
    },
    dateFieldLabelDark: {
        backgroundColor: "#151a22",
        color: "#a5b4fc",
    },
    dateFieldLabelError: {
        color: "#b3261e",
    },
    fieldInput: {
        backgroundColor: "#ffffff",
    },
    fieldInputDark: {
        backgroundColor: "#11161d",
    },
});
