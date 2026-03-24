import * as ImagePicker from "expo-image-picker";

export interface PickedImage {
    dataUrl: string;
    fileName: string;
    mimeType: string;
}

export const pickImageAsDataUrl = async (): Promise<PickedImage | null> => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
        alert("Permission to access media library is required!");
        return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) {
        return null;
    }

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? "image/jpeg";
    const extension = mimeType.split("/")[1] ?? "jpg";
    const fileName = asset.fileName ?? `geraetefoto.${extension}`;

    return {
        dataUrl: `data:${mimeType};base64,${asset.base64}`,
        fileName,
        mimeType,
    };
};

export const handleFileChange = async (index: number, items: any[], setItems: Function) => {
    const image = await pickImageAsDataUrl();

    if (image) {
        const newItems = [...items];
        newItems[index].geraeteFoto = image.dataUrl;
        setItems(newItems);
    }
};
