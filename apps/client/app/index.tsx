import { View } from 'react-native';
import InvTable from "@/src/features/inventory/components/InvTable";
import TopBar from "@/src/shared/components/navigation/TopBar";
import { InventoryProvider } from "@/src/features/inventory/context/InventoryContext";

export default function Index() {
    return (
        <InventoryProvider>
            <View style={{height: "100%"}}>
                <TopBar></TopBar>
                <InvTable></InvTable>
            </View>
        </InventoryProvider>
    );
}

