import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from "@/app/_layout";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { createDefaultStyles } from '../../components/defaultStyles';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState } from 'react';
import SmallLayout from '@/components/smallLayout';
import { useAuth } from "@/hooks/useAuth";

const { width } = Dimensions.get('window');

export default function ManageLayouts() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const router = useRouter();
  const { roomName } = useLocalSearchParams<{ roomName?: string }>();

  const { user } = useAuth();

  const [layouts, setLayouts] = useState<JSX.Element[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const getRoomLayouts = async () => {
    setRefreshing(true);
    try {
      if (!roomName) return;

      const roomPath = `${FileSystem.documentDirectory}rooms/${roomName}.json`;
      const fileCheck = await FileSystem.getInfoAsync(roomPath);
      if (!fileCheck.exists) return;

      const data = await FileSystem.readAsStringAsync(roomPath);
      const parsed = JSON.parse(data);

      const layoutsArray = parsed[user.username]?.layouts ?? [];

      const layoutElements = layoutsArray.map((layout: { name: string }) => (
        <SmallLayout key={layout.name} LayoutTitle={layout.name} roomName={roomName} />
      ));

      setLayouts(layoutElements);
    } catch (error) {
      console.error("Failed to laod layouts", error);
    } finally {
      setRefreshing(false);
    }
    
  };

  useEffect(() => {
    getRoomLayouts();
  }, [roomName]);

  return (
    <ScrollView
      contentContainerStyle={defaultStyles.body}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getRoomLayouts} />
      }
    >
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Manage Layouts</Text>
      </View>

      <View style={uniqueStyles.buttonContainer}>
        <Pressable
          style={uniqueStyles.button}
          onPress={() => router.push({ pathname: '/addPages/addLayout', params: { roomName } })}
        >
          <Text style={uniqueStyles.text}>New Layout</Text>
        </Pressable>
      </View>

      <Text style={defaultStyles.sectionTitle}>Saved Layouts</Text>
      
      <View style={defaultStyles.cardSectionContainer}>
      {layouts && layouts.length > 0 ? (
        layouts
      ) : (
        <Text style={defaultStyles.sectionTitle}>No layouts founrrd.</Text>
      )}
      </View>
    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    buttonContainer: {
      gap: width * 0.1,
    },
    button: {
      width: width * 0.75,
      height: width * 0.1,
      backgroundColor: isDarkMode ? '#fff' : '#000',
      borderRadius: 20,
      alignContent: 'center',
      justifyContent: 'center',
    },
    text: {
      textAlign: 'center',
      fontSize: 24,
      color: isDarkMode ? '#000' : '#fff',
      fontWeight: '300',
    },
  });
