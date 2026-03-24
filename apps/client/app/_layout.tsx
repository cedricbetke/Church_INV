import { Stack } from 'expo-router';
import {DefaultTheme, PaperProvider} from "react-native-paper";
import {SafeAreaProvider} from "react-native-safe-area-context";

export default function RootLayout() {
  return (
      <PaperProvider theme={MyCustomTheme}>
            <Stack>
              <Stack.Screen name="index" options={{ title: 'ChurchINV', headerShown: false }} />
            </Stack>
      </PaperProvider>
  );
}

const MyCustomTheme = {
    flexShrink:1,
  ...DefaultTheme,
    flex:1,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1976d2',
      //surfaceVariant: '#000000',
      // Beispiel für eine Hauptfarbe (violett)
   /* accent: '#03dac4',  // Beispiel für eine Akzentfarbe (cyan)
    background: '#ffffff', // Hintergrundfarbe
    surface: '#ffffff', // Farbe für die Oberfläche
    text: '#000000', // Textfarbe
    disabled: '#f0f0f0', // Farbe für deaktivierte Elemente
    placeholder: '#bdbdbd', // Platzhalterfarbe
    backdrop: '#000000', // Farbe für den Hintergrund
    // Füge hier weitere Farbänderungen hinzu
    */
  },
};