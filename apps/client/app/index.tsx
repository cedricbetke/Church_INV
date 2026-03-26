import { View } from 'react-native';
import InvTable from "@/src/features/inventory/components/InvTable";
import TopBar from "@/src/shared/components/navigation/TopBar";
import { InventoryProvider } from "@/src/features/inventory/context/InventoryContext";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

export default function Index() {
    const { isDarkMode } = useAppThemeMode();

    return (
        <InventoryProvider>
            <View style={{height: "100%", backgroundColor: isDarkMode ? "#0f1115" : "#f5f5f7"}}>
                <TopBar></TopBar>
                <InvTable></InvTable>
            </View>
        </InventoryProvider>
    );
}
