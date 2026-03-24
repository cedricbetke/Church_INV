import * as ImagePicker from 'expo-image-picker';

export const handleFileChange = async (index: number, items: any[], setItems: Function) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
        alert('Permission to access media library is required!');
        return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0].base64) {
        const newItems = [...items];
        newItems[index].geraeteFoto = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setItems(newItems);
    }
};

// utils/helpers.tsx
export const getValueOrFallback = <T,>(item: T, key: keyof T, fallback: string = "N/A"): string => {
    return (item[key] as string) || fallback;
};