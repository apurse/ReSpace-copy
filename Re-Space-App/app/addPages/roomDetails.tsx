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

  jsonData.roomFiles.png = "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"


  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Room name */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>{roomName}</Text>
      </View>

      {/* Room scan */}
      <View style={uniqueStyles.mapContainer}>
        {jsonData.roomFiles.png ?
          (
            <Image
              style={uniqueStyles.imageBody}
              source={{ uri: (`data:image/png;base64,${jsonData?.roomFiles?.png}`) }}
            />
          ) : (
            <Text>Please scan the room using the scanning option below.</Text>
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
            onPress={() => router.push({
              pathname: "/settingsPages/controller",
              params: { scanning: "true", roomName }
            })}
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
      color: isDarkMode ? '#000' : '#fff',
      top: 3,
      fontWeight: '300',
    },
    mapContainer: {
      width: screenWidth * 0.75,
      aspectRatio: 1,
      backgroundColor: 'lightgrey',
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
