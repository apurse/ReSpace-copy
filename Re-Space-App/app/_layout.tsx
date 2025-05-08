import { createContext, useContext, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SocketProvider } from "./context/webSocketProvider";
import { AuthProvider } from "./context/authorisationProvider";
import { RoomProvider } from "./context/roomProvider";


// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Theme Context (toggle theme light to dark)
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => { },
});

// Hook to use theme context
export const useTheme = () => useContext(ThemeContext);
export default function RootLayout() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Load dark mode setting from local storage
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const isDarkModeStored = await AsyncStorage.getItem('isDarkMode');
        if (isDarkModeStored === 'true') {
          setTheme('dark');
        } else {
          setTheme('light');
        }
      } catch (error) {
        console.error('Failed to fetch theme from AsyncStorage:', error);
      }
    };

    initializeTheme();

  }, []);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <SocketProvider>
        <RoomProvider>
          <ThemeContext.Provider value={{ theme, toggleTheme }}>
            <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack >
            </ThemeProvider>
          </ThemeContext.Provider>
        </RoomProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
