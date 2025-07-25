export interface AddPageProps {
    visible: boolean;
    onDismiss: () => void;
    existingBrands: Hersteller[];
    onAddBrand: (brandName: string) => Promise<void>;
    onSubmit: (itemData: FormData) => void;
}
