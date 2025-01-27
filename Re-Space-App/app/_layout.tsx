// _layout.tsx

import React, { createContext, useContext, useState, ReactChild } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import AsyncStorage from "@react-native-async-storage/async-storage";


// Setting the socket type based on device connection
// If socket is undefined (web) use ws, else use react native API
const socketType = (typeof WebSocket === 'undefined') ? require('ws') : WebSocket;
const socket = new socketType("ws://Douglas-MBP.local:8002/app");


// connection opened
socket.onopen = () => {
  console.log("WebSocket connection established.");
};


// a message was received
socket.onmessage = (e: { data: string; }) => {
  try {
    const data = JSON.parse(e.data);
    console.log("Received:", data);
  } catch (err) {
    console.error("Error parsing message:", err);
  };
};


// an error occurred
socket.onerror = (e: any) => {console.log(e)};


// connection closed
socket.onclose = (e: { code: any; reason: any; }) => {console.log(e.code, e.reason)};


// Context to pass data to children
export const SocketContext = createContext(socket);

interface ISocketProvider {
  children: ReactChild;
}


// Make a new prop
export const SocketProvider = (props: ISocketProvider) => (
  <SocketContext.Provider value={socket}>{props.children}</SocketContext.Provider>
);





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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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
    <SocketProvider>
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </ThemeContext.Provider>
    </SocketProvider>
  );
}
