import { View, Text, StyleSheet, Pressable, Dimensions, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from "@/app/_layout";
import * as FileSystem from 'expo-file-system';
import { useRoom } from '@/hooks/useRoom';
import FilterButton from '@/components/libraryComponents/FilterButton';


// Get dimensions of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function RoomDetails() {

  // Hooks and colours
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode, screenWidth);
  const router = useRouter();
  var { roomName, jsonData } = useRoom();


  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Room name */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>{roomName}</Text>
      </View>

      {/* Room scan */}
      <View style={uniqueStyles.mapContainer}>
        {jsonData?.roomFiles?.png ?
          (
            <Image
              style={uniqueStyles.imageBody}
              source={{ uri: (`data:image/png;base64,${jsonData?.roomFiles?.png}`) }}
              resizeMode="contain"
            />
          ) : (
            <Text style={uniqueStyles.text}>Please scan the room using the scanning option below.</Text>
          )
        }
      </View>


      {/* Buttons */}
      <View style={uniqueStyles.filterContainer}>
        <View style={uniqueStyles.filterRow}>
          <FilterButton
            Option="Layouts"
            outlineIcon='appstore-o'
            selectedColor='green'
            onPress={() => router.push('/addPages/manageLayouts')}
          />
          <FilterButton
            Option="Furniture"
            outlineIcon='database'
            selectedColor='green'
            onPress={() => router.push('/addPages/manageFurniture')}
          />
        </View>

        <View style={uniqueStyles.filterRow}>
          <FilterButton
            Option="Scanning"
            outlineIcon='scan1'
            selectedColor='#00838F'
            onPress={() => router.push("/addPages/scanning")}
          />

          <FilterButton
            Option="Delete"
            selectedColor='red'
            outlineIcon='minuscircleo'
            onPress={async () => {
              if (!roomName) {
                alert("No room name specified.");
                return;
              }

              // Prompt the users with a check
              Alert.alert(
                'Remove this room?',
                'This will remove the room for all users on this device. This action cannot be undone.',
                [
                  {
                    text: 'Yes', onPress: async () => {


                      //  File path
                      const fileUri = `${FileSystem.documentDirectory}rooms/${roomName}.json`;

                      try {
                        //  Read room file
                        const fileInfo = await FileSystem.getInfoAsync(fileUri);

                        //  Delete file if it exists
                        if (fileInfo.exists) {
                          await FileSystem.deleteAsync(fileUri);
                          alert(`Room "${roomName}" deleted successfully.`);
                          router.push('/(tabs)/roomsManager');
                        } else {
                          alert("Room file not found.");
                        }
                      } catch (error) {
                        console.error("Failed to delete room:", error);
                        alert("An error occurred while deleting the room.");
                      }
                    }
                  },
                  { text: 'No', onPress: () => alert(`Removing room cancelled!`) },
                ],
                { cancelable: false },
              );


            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean, screenWidth: number) =>
  StyleSheet.create({
    buttonContainer: {
      gap: screenWidth * 0.05,
    },
    button: {
      width: screenWidth * 0.75,
      height: screenWidth * 0.1,
      backgroundColor: isDarkMode ? '#fff' : '#000',
      borderRadius: 20,
      alignContent: 'center',
    },
    text: {
      textAlign: 'center',
      fontSize: 24,
      color: isDarkMode ? '#fff' : '#000',
      top: 3,
      // fontWeight: '300',
    },
    mapContainer: {
      width: screenWidth * 0.75,
      aspectRatio: 1,
      borderRadius: 8,
      borderColor: 'grey',
      borderWidth: 4
    },
    imageBody: {
      width: '100%',
      height: '100%',
      borderRadius: 5
    },
    filterContainer: {
      marginTop: 20,
      gap: screenWidth * 0.05,
      width: screenWidth * 0.8,
    },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: screenWidth * 0.1,
      width: '100%',
    },
  });
