import React, { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

const lightTheme = {
    ...MD3LightTheme,
    colors: {
        ...MD3LightTheme.colors,
        primary: "#0f5ea8",
        secondary: "#5f6b7a",
        background: "#f5f5f7",
        surface: "#ffffff",
        surfaceVariant: "#f7f7f9",
        outline: "#dfe3e8",
        outlineVariant: "#e8eaee",
        onSurface: "#1d1d1f",
        onSurfaceVariant: "#7c7c84",
    },
};

const darkTheme = {
    ...MD3DarkTheme,
    colors: {
        ...MD3DarkTheme.colors,
        primary: "#7cc0ff",
        secondary: "#9aa8b7",
        background: "#0f1115",
        surface: "#151922",
        surfaceVariant: "#1b212c",
        outline: "#2a3340",
        outlineVariant: "#202733",
        onSurface: "#f4f7fb",
        onSurfaceVariant: "#95a1b2",
    },
};

interface AppThemeContextValue {
    isDarkMode: boolean;
    toggleTheme: () => void;
    theme: typeof lightTheme;
}

const AppThemeContext = createContext<AppThemeContextValue | undefined>(undefined);

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);

    const toggleTheme = () => {
        setIsDarkMode((current) => !current);
    };

    const theme = useMemo(
        () => (isDarkMode ? darkTheme : lightTheme),
        [isDarkMode],
    );

    return (
        <AppThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
            {children}
        </AppThemeContext.Provider>
    );
};

export const useAppThemeMode = () => {
    const context = useContext(AppThemeContext);

    if (!context) {
        throw new Error("useAppThemeMode muss innerhalb eines AppThemeProviders verwendet werden");
    }

    return context;
};
