import { View, ScrollView, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import { Link, router, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState, useCallback } from 'react';
import { useRoom } from '@/hooks/useRoom';

/**
 * RoomsManager.tsx
 * 
 * Display a list of saved rooms stored in the local device.
 * Allows users to create new rooms or select exiting ones to be edited.
 * Automatically fetches and updates room listing when this page is open.
 */

// Get screen window dimensions
const { width } = Dimensions.get('window');

// Path for all room files
const roomsPath = `${FileSystem.documentDirectory}rooms/`;

export default function RoomsManager() {

  // Hooks and colours
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { roomName, setRoomName } = useRoom();


  // Saved rooms
  const [rooms, setRooms] = useState<any[]>([]);

  /**
   * Fetch room files in app's local storage
   */
  const fetchRooms = async () => {

    // Ensure directory exist
    try {
      const dirInfo = await FileSystem.getInfoAsync(roomsPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(roomsPath, { intermediates: true });
      }

      // Read the files
      const files = await FileSystem.readDirectoryAsync(roomsPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      // Parse files data
      const roomDataArray = await Promise.all(jsonFiles.map(async file => {
        const filePath = roomsPath + file;
        const content = await FileSystem.readAsStringAsync(filePath);
        const data = JSON.parse(content);
        return {
          name: file.replace('.json', ''),
          data,
        };
      }));

      // Store rooms with parsed data
      setRooms(roomDataArray);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };


  // Auto refresh the page to show saved rooms
  useFocusEffect(
    useCallback(() => {
      fetchRooms();
      setRoomName("")
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Rooms Manager</Text>
      </View>

      {/* Create new room buttom */}
      <View style={uniqueStyles.buttonContainer}>
        <Link href="/addPages/newRoom" asChild>
          <Pressable style={uniqueStyles.button}>
            <Text style={uniqueStyles.text}>New Room</Text>
          </Pressable>
        </Link>
      </View>

      {/* Show saved rooms */}
      <Text style={[defaultStyles.sectionTitle, { marginBottom: 20 }]}>Existing Rooms</Text>
      <View style={{ gap: 10 }}>
        {rooms.map((room, index) => (
          <Pressable
            key={index}
            style={[uniqueStyles.button, { backgroundColor: '#7aa7ff' }]}

            // Navigate to roomDetails passing room's name and its data
            onPress={() => {
              setRoomName(room.name)
              router.push('/addPages/roomDetails')
            }}
          >
            <Text style={uniqueStyles.text}>{room.name}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    buttonContainer: {
      gap: width * 0.1,
      marginBottom: 20,
    },
    button: {
      width: width * 0.75,
      height: width * 0.1,
      backgroundColor: isDarkMode ? '#fff' : '#000',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    text: {
      fontSize: 20,
      color: isDarkMode ? '#000' : '#fff',
      fontWeight: '500',
    }
  });
