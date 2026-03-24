// Dialogs.tsx
import React from 'react';
import SelectionDialog from './SelectionDialog';

interface StatusDialogProps {
    visible: boolean;
    onDismiss: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    states: Array<{ id: number; name: string }>;
    handleChange: (field: string, value: string) => void;
}

export const StatusDialog: React.FC<StatusDialogProps> = ({
                                                              visible,
                                                              onDismiss,
                                                              searchQuery,
                                                              setSearchQuery,
                                                              states,
                                                              handleChange
                                                          }) => (
    <SelectionDialog
        visible={visible}
        onDismiss={onDismiss}
        title="Status auswählen"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        items={states}
        onSelect={(statusName) => {
            handleChange('status', statusName);
            onDismiss();
            setSearchQuery('');
        }}
        onAddNew={async () => {
            console.log('Neue Status können nur vom Administrator hinzugefügt werden');
        }}
        isNewItem={false}
    />
);

// Optional: Auch für andere Dialoge die Interfaces definieren
interface BrandDialogProps {
    visible: boolean;
    onDismiss: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    brands: Array<{ id: number; name: string }>;
    handleBrandSelect: (brandName: string) => void;
    handleAddNewBrand: () => Promise<void>;
    isNewBrand: boolean;
}

export const BrandDialog: React.FC<BrandDialogProps> = ({
                                                            visible,
                                                            onDismiss,
                                                            searchQuery,
                                                            setSearchQuery,
                                                            brands,
                                                            handleBrandSelect,
                                                            handleAddNewBrand,
                                                            isNewBrand
                                                        }) => (
    <SelectionDialog
        visible={visible}
        onDismiss={onDismiss}
        title="Hersteller auswählen"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        items={brands}
        onSelect={handleBrandSelect}
        onAddNew={handleAddNewBrand}
        isNewItem={isNewBrand}
    />
);

// Ähnliche Struktur für ModelDialog
interface ModelDialogProps {
    visible: boolean;
    onDismiss: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    models: Array<{ id: number; name: string }>;
    handleModelSelect: (modelName: string) => void;
    handleAddNewModel: () => Promise<void>;
    isNewModel: boolean;
}

export const ModelDialog: React.FC<ModelDialogProps> = ({
                                                            visible,
                                                            onDismiss,
                                                            searchQuery,
                                                            setSearchQuery,
                                                            models,
                                                            handleModelSelect,
                                                            handleAddNewModel,
                                                            isNewModel
                                                        }) => (
    <SelectionDialog
        visible={visible}
        onDismiss={onDismiss}
        title="Modell auswählen"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        items={models}
        onSelect={handleModelSelect}
        onAddNew={handleAddNewModel}
        isNewItem={isNewModel}
    />
);