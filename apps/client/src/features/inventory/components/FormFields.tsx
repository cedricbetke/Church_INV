import React from "react";
import { Platform, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { HelperText, IconButton, TextInput } from "react-native-paper";
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
    const [packlisteDraft, setPacklisteDraft] = React.useState("");
    const packlisteItems = React.useMemo(
        () => formData.packliste
            .split(/\r?\n/)
            .map((entry) => entry.trim())
            .filter(Boolean),
        [formData.packliste],
    );
    const openSelectionDialog = (showDialog: (show: boolean) => void) => {
        if (Platform.OS === "web" && typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        showDialog(true);
    };

    const updatePacklisteItems = (items: string[]) => {
        handleChange("packliste", items.join("\n"));
    };

    const handleAddPacklisteItem = () => {
        const nextItem = packlisteDraft.trim();
        if (!nextItem) {
            return;
        }

        updatePacklisteItems([...packlisteItems, nextItem]);
        setPacklisteDraft("");
    };

    const handleRemovePacklisteItem = (index: number) => {
        updatePacklisteItems(packlisteItems.filter((_, itemIndex) => itemIndex !== index));
    };

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
            multiline?: boolean;
            numberOfLines?: number;
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
                multiline={options.multiline}
                numberOfLines={options.numberOfLines}
                right={options.rightIcon ? <TextInput.Icon icon={options.rightIcon} /> : undefined}
                style={[styles.fieldInput, options.multiline && styles.multilineInput, isDarkMode && styles.fieldInputDark]}
            />
            {errors[name] && <HelperText type="error">{errors[name]}</HelperText>}
            {!errors[name] && options.helperText && <HelperText type="info">{options.helperText}</HelperText>}
            {name === "invNr" && loading && (
                <HelperText type="info">Lade Inventarnummer...</HelperText>
            )}
        </View>
    );

    const renderPacklisteEditor = () => (
        <View style={[styles.packlisteSection, isDarkMode && styles.packlisteSectionDark]}>
            <View style={styles.packlisteHeader}>
                <Text style={[styles.packlisteTitle, isDarkMode && styles.packlisteTitleDark]}>Packliste</Text>
                <Text style={[styles.packlisteHint, isDarkMode && styles.packlisteHintDark]}>Optional</Text>
            </View>
            <View style={styles.packlisteInputRow}>
                <TextInput
                    mode="outlined"
                    label="Eintrag hinzufügen"
                    placeholder="z. B. 1x Netzteil"
                    value={packlisteDraft}
                    onChangeText={setPacklisteDraft}
                    onSubmitEditing={handleAddPacklisteItem}
                    returnKeyType="done"
                    style={[styles.fieldInput, styles.packlisteInput, isDarkMode && styles.fieldInputDark]}
                />
                <IconButton
                    icon="plus"
                    mode="contained-tonal"
                    size={22}
                    disabled={!packlisteDraft.trim()}
                    onPress={handleAddPacklisteItem}
                    style={styles.packlisteAddButton}
                    accessibilityLabel="Packlisten-Eintrag hinzufügen"
                />
            </View>
            {packlisteItems.length === 0 ? (
                <HelperText type="info">Ein Zubehörteil pro Eintrag hinzufügen.</HelperText>
            ) : (
                <View style={styles.packlisteItems}>
                    {packlisteItems.map((item, index) => (
                        <View key={`${item}-${index}`} style={[styles.packlisteItem, isDarkMode && styles.packlisteItemDark]}>
                            <Text style={[styles.packlisteItemText, isDarkMode && styles.packlisteItemTextDark]}>{item}</Text>
                            <IconButton
                                icon="close"
                                size={18}
                                onPress={() => handleRemovePacklisteItem(index)}
                                style={styles.packlisteRemoveButton}
                                accessibilityLabel="Packlisten-Eintrag entfernen"
                            />
                        </View>
                    ))}
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {error && <HelperText type="error">{error}</HelperText>}
            <UIGrid columns={2} xGap={16} yGap={8}>
                {renderField("invNr", "Inventarnummer", { disabled: loading || invNrDisabled })}
                {renderField("hersteller", "Hersteller", {
                    onFocus: () => openSelectionDialog(setShowBrandDialog),
                    onPressIn: () => openSelectionDialog(setShowBrandDialog),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("objekttyp", "Objekttyp", {
                    onFocus: () => openSelectionDialog(setShowObjekttypDialog),
                    onPressIn: () => openSelectionDialog(setShowObjekttypDialog),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("modell", "Modell", {
                    disabled: !isModelSelectionEnabled,
                    onFocus: isModelSelectionEnabled ? () => openSelectionDialog(setShowModelDialog) : undefined,
                    onPressIn: isModelSelectionEnabled ? () => openSelectionDialog(setShowModelDialog) : undefined,
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
                        onFocus: () => openSelectionDialog(setShowKaufdatumPicker),
                        onPressIn: () => openSelectionDialog(setShowKaufdatumPicker),
                        rightIcon: "calendar",
                        selectionOnly: true,
                    })}
                {renderField("einkaufspreis", "Einkaufspreis", {
                    keyboardType: "decimal-pad",
                    placeholder: "0,00",
                })}
                {renderField("zustandshinweis", "Zustandshinweis")}
                {renderField("standort", "Standort", {
                    onFocus: () => openSelectionDialog(setShowStandortDialog),
                    onPressIn: () => openSelectionDialog(setShowStandortDialog),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("bereich", "Bereich", {
                    onFocus: () => openSelectionDialog(setShowBereichDialog),
                    onPressIn: () => openSelectionDialog(setShowBereichDialog),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("kategorie", "Kategorie", {
                    disabled: !isKategorieSelectionEnabled,
                    onFocus: isKategorieSelectionEnabled ? () => openSelectionDialog(setShowKategorieDialog) : undefined,
                    onPressIn: isKategorieSelectionEnabled ? () => openSelectionDialog(setShowKategorieDialog) : undefined,
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                    placeholder: !isKategorieSelectionEnabled && isCompactViewport ? "Zuerst Bereich wählen" : undefined,
                    helperText: !isKategorieSelectionEnabled && !isCompactViewport ? "Bitte zuerst einen Bereich wählen" : undefined,
                })}
                {renderField("status", "Status", {
                    onFocus: () => openSelectionDialog(setShowStatusDialog),
                    onPressIn: () => openSelectionDialog(setShowStatusDialog),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
                {renderField("verantwortlicher", "Verantwortlicher", {
                    onFocus: () => openSelectionDialog(setShowVerantwortlicherDialog),
                    onPressIn: () => openSelectionDialog(setShowVerantwortlicherDialog),
                    rightIcon: "chevron-down",
                    selectionOnly: true,
                })}
            </UIGrid>
            {renderPacklisteEditor()}
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
    multilineInput: {
        minHeight: 120,
    },
    fieldInputDark: {
        backgroundColor: "#11161d",
    },
    packlisteSection: {
        gap: 12,
        marginTop: 8,
        padding: 14,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        backgroundColor: "#fafafa",
    },
    packlisteSectionDark: {
        backgroundColor: "#0f141b",
        borderColor: "#263140",
    },
    packlisteHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
    },
    packlisteTitle: {
        color: "#1f2937",
        fontSize: 16,
        fontWeight: "600",
    },
    packlisteTitleDark: {
        color: "#f3f4f6",
    },
    packlisteHint: {
        color: "#666",
        fontSize: 12,
        fontWeight: "600",
    },
    packlisteHintDark: {
        color: "#9aa4b2",
    },
    packlisteInputRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    packlisteInput: {
        flex: 1,
    },
    packlisteAddButton: {
        margin: 0,
        width: 48,
        height: 48,
    },
    packlisteItems: {
        gap: 8,
    },
    packlisteItem: {
        minHeight: 44,
        paddingLeft: 12,
        borderWidth: 1,
        borderColor: "#dfe3e8",
        borderRadius: 8,
        backgroundColor: "#ffffff",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    packlisteItemDark: {
        backgroundColor: "#11161d",
        borderColor: "#334155",
    },
    packlisteItemText: {
        flex: 1,
        color: "#1f2937",
        fontSize: 15,
        lineHeight: 20,
    },
    packlisteItemTextDark: {
        color: "#f3f4f6",
    },
    packlisteRemoveButton: {
        margin: 0,
    },
});
