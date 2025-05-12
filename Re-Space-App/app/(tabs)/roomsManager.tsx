import { View, ScrollView, StyleSheet, Text, Dimensions, Pressable, Alert } from 'react-native';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import { router, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useEffect, useState, useCallback } from 'react';
import { useRoom } from '@/hooks/useRoom';
import { useAuth } from '@/hooks/useAuth';
import FilterButton from '@/components/libraryComponents/FilterButton';
import SmallRoom from '@/components/libraryComponents/smallRoom';

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
  const { roomName, setRoomName, jsonData, updateJsonData } = useRoom();
  const { user } = useAuth()
  const [furniture, setFurniture] = useState<any | null>(null);
  const [favouriteFurniture, setFavouriteFurniture] = useState<any | null>(null);
  const [favouritesSelected, setFavouritesSelected] = useState<boolean>(false);
  const [length, setLength] = useState<number>();


  // Saved rooms
  const [rooms, setRooms] = useState<any[]>([]);


  // Auto refresh page with saved furniture
  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [roomName])
  );


  // Refresh page on jsonData change (used for clearing)
  useEffect(() => {
    fetchRooms()
  }, [jsonData])


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


      var allFurniture: any = [];
      var favourites: any = [];

      var entries = 0;

      // Get each room JSON file
      const roomDataArray = await Promise.all(jsonFiles.map(async file => {
        const filePath = roomsPath + file;

        // Get the JSON content and filter into data and name
        const content = await FileSystem.readAsStringAsync(filePath);
        const data = JSON.parse(content);
        const name = file.replace('.json', '')

        // Push all entries into an array
        allFurniture.push(<SmallRoom key={name} RoomTitle={name} Content={content} />)
        entries++;

        // If favourited add to another array
        if (data.favourited) {
          console.log("favourited: ", name)
          favourites.push(<SmallRoom key={name} RoomTitle={name} Content={content} />)
        }

        return {
          name: name,
          data,
        };
      }));

      // Set the arrays
      setFurniture(allFurniture);
      setFavouriteFurniture(favourites)
      setLength(entries)

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

      {user ?
        (
          <>
            {/* Filters */}
            <View style={uniqueStyles.filterContainer}>

              <FilterButton
                Option="Add new"
                selectedColor='green'
                outlineIcon='pluscircleo'
                onPress={() =>
                  router.push({
                    pathname: '/addPages/newRoom',
                  })}
              />

              <FilterButton
                Option="Favourites"
                selectedColor='yellow'
                outlineIcon='staro'
                filledIcon='star'
                onPress={() => {
                  setFavouritesSelected(value => !value)
                  fetchRooms()
                }}
                selected={favouritesSelected}
              />

              <FilterButton
                Option="Clear all"
                selectedColor='red'
                outlineIcon='minuscircleo'
                onPress={() => {

                  if (length != undefined && length == 0) {
                    alert("No furniture entries to remove!")
                    return;
                  }

                  // Prompt the users with a check
                  Alert.alert(
                    'Clear all rooms?',
                    'This will remove all rooms on this device for all users. This action cannot be undone.',
                    [
                      {
                        text: 'Yes', onPress: async () => {


                          //  File path

                          rooms.forEach(async(name) => {
                            const fileUri = `${FileSystem.documentDirectory}rooms/${name}.json`;



                            try {
                              //  Read room file
                              const fileInfo = await FileSystem.getInfoAsync(fileUri);

                              //  Delete file if it exists
                              if (fileInfo.exists) {
                                await FileSystem.deleteAsync(fileUri);
                                alert(`Room "${name}" deleted successfully.`);
                                router.push('/(tabs)/roomsManager');
                              } else {
                                alert(`Room "${name}" not found.`);
                              }
                            } catch (error) {
                              console.error("Failed to delete room:", error);
                              alert("An error occurred while deleting the room.");
                            }
                          })
                        }
                      },
                      { text: 'No', onPress: () => alert(`Removing room cancelled!`) },
                    ],
                    { cancelable: false },
                  );
                }
                }
              />

            </View>


            {/* Show saved rooms */}
            <Text style={uniqueStyles.sectionTitle}>
              {!favouritesSelected ?
                (`All Rooms: ${furniture?.length}`)
                :
                (`Favourites: ${favouriteFurniture?.length}/${furniture?.length}`)
              }
            </Text>

            <View style={defaultStyles.cardSectionContainer}>
              {favouritesSelected ? favouriteFurniture : furniture}
            </View>
          </>
        )
        :
        (
          <Text style={[defaultStyles.sectionTitle, { marginBottom: 20 }]}>Please login to view rooms!</Text>
        )

      }
    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      width: '100%',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 30,
      marginBottom: 15,
      color: isDarkMode ? '#fff' : '#000',
    },
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
