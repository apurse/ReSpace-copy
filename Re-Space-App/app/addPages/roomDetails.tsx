import { View, Text, StyleSheet, Pressable, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from "@/app/_layout";
import * as FileSystem from 'expo-file-system';
import { useRoom } from '@/hooks/useRoom';


// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export default function RoomDetails() {

  // Hooks and colours
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const router = useRouter();
  const { roomName, jsonData } = useRoom();


  return (
    <View style={defaultStyles.body}>

      {/* Room name */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>{roomName}</Text>
      </View>


      <View style={uniqueStyles.buttonContainer}>

        {/* Go to manage layout page */}
        <Pressable
          style={uniqueStyles.button}
          onPress={() => router.push('/addPages/manageLayouts')}
        >
          <Text style={uniqueStyles.text}>Manage Layouts</Text>
        </Pressable>

        {/* Go to manage furniture page */}
        <Pressable
          style={uniqueStyles.button}
          onPress={() => router.push('/addPages/manageFurniture')}
        >
          <Text style={uniqueStyles.text}>Manage Furniture</Text>
        </Pressable>

        {jsonData?.png &&
          <View style={uniqueStyles.mapContainer}>
            {/* Render the new image */}
            <Image
              style={uniqueStyles.imageBody}
              source={{ uri: (`data:image/png;base64,${jsonData?.roomFiles.png}`) }}
            />
          </View>
        }

        <Pressable
          style={uniqueStyles.button}
          onPress={() => {
            var temp = "true"
            console.log(temp)
            router.push({
              pathname: "/settingsPages/controller",
              params: { scanning: temp, roomName }
            })
          }}
        ><Text style={uniqueStyles.text}>Scan Room</Text>
        </Pressable>

        {/* Delete current room */}
        <Pressable
          style={[uniqueStyles.button, { backgroundColor: '#FF6969' }]}
          onPress={async () => {
            if (!roomName) {
              alert("No room name specified.");
              return;
            }

            //  File path
            const fileUri = `${FileSystem.documentDirectory}rooms/${roomName}.json`;

            try {
              //  Read room file
              const fileInfo = await FileSystem.getInfoAsync(fileUri);

              //  Delete file if it exists
              if (fileInfo.exists) {
                await FileSystem.deleteAsync(fileUri);
                alert(`Room "${roomName}" deleted successfully.`);
                router.push('/(tabs)/roomsManager');  //  Go back to room manager page after deliting current room file
              } else {
                alert("Room file not found.");
              }
            } catch (error) {
              console.error("Failed to delete room:", error);
              alert("An error occurred while deleting the room.");
            }
          }}
        >
          <Text style={uniqueStyles.text}>Delete This Room</Text>
        </Pressable>
      </View>


    </View>
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
    },
    text: {
      textAlign: 'center',
      fontSize: 24,
      color: isDarkMode ? '#000' : '#fff',
      top: 3,
      fontWeight: '300',
    },
    mapContainer: {
      width: '100%',
      height: 300,
      backgroundColor: 'grey'
    },
    imageBody: {
      width: '100%',
      height: '100%',
    }
  });
