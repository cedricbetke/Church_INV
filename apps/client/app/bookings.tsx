import { View } from "react-native";
import { InventoryProvider } from "@/src/features/inventory/context/InventoryContext";
import { useAppThemeMode } from "@/src/shared/theme/AppThemeContext";
import BookingPage from "@/src/features/bookings/components/BookingPage";

export default function BookingsRoute() {
    const { isDarkMode } = useAppThemeMode();

    return (
        <InventoryProvider>
            <View style={{ flex: 1, backgroundColor: isDarkMode ? "#0f1115" : "#f5f5f7" }}>
                <BookingPage />
            </View>
        </InventoryProvider>
    );
}
