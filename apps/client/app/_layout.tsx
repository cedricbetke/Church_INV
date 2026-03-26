import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { AppThemeProvider, useAppThemeMode } from "@/src/shared/theme/AppThemeContext";

const AppShell = () => {
    const { theme } = useAppThemeMode();

    return (
        <PaperProvider theme={theme}>
            <Stack>
                <Stack.Screen name="index" options={{ title: "ChurchINV", headerShown: false }} />
                <Stack.Screen name="bookings" options={{ title: "Buchungen", headerShown: false }} />
            </Stack>
        </PaperProvider>
    );
};

export default function RootLayout() {
    return (
        <AppThemeProvider>
            <AppShell />
        </AppThemeProvider>
    );
}
