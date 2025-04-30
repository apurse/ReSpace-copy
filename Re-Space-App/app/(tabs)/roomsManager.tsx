import { View, ScrollView, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import { Link, router, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState, useCallback } from 'react';

const { width } = Dimensions.get('window');
const roomsPath = `${FileSystem.documentDirectory}rooms/`;

export default function RoomsManager() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);

  const [rooms, setRooms] = useState<any[]>([]);

  const fetchRooms = async () => {
    try {
      const dirInfo = await FileSystem.getInfoAsync(roomsPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(roomsPath, { intermediates: true });
      }

      const files = await FileSystem.readDirectoryAsync(roomsPath);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      const roomDataArray = await Promise.all(jsonFiles.map(async file => {
        const filePath = roomsPath + file;
        const content = await FileSystem.readAsStringAsync(filePath);
        const data = JSON.parse(content);
        return {
          name: file.replace('.json', ''),
          data,
        };
      }));

      setRooms(roomDataArray);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Rooms Manager</Text>
      </View>

      <View style={uniqueStyles.buttonContainer}>
        <Link href="/addPages/newRoom" asChild>
          <Pressable style={uniqueStyles.button}>
            <Text style={uniqueStyles.text}>New Room</Text>
          </Pressable>
        </Link>

        <Link href="/(tabs)/library" asChild>
          <Pressable style={uniqueStyles.button}>
            <Text style={uniqueStyles.text}>Select Room</Text>
          </Pressable>
        </Link>
      </View>

      <Text style={defaultStyles.sectionTitle}>Existing Rooms</Text>
      <View style={{ gap: 10 }}>
        {rooms.map((room, index) => (
          <Pressable
            key={index}
            style={[uniqueStyles.button, { backgroundColor: '#7aa7ff' }]}
            onPress={() =>
              router.push({
                pathname: '/addPages/roomDetails',
                params: {
                  roomName: room.name,
                  roomData: JSON.stringify(room.data),
                },
              })
            }
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
