import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import * as Icons from '../indexComponents/Icons';
import { useTheme } from '../../app/_layout';
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useRoom } from '@/hooks/useRoom';
import { useAuth } from "@/hooks/useAuth";
import * as FileSystem from 'expo-file-system';



/**
 * A small layout displaying the title and favourite status which when clicked, loads up the corresponding layout.
 * @param RoomTitle String - The title of the layout. 
 */
export default function SmallLayout({ RoomTitle, FilePath }: { RoomTitle: any; FilePath: string; }) {

  interface Room {
    roomFiles: {
      yaml: string,
      png: string,
    },
    users: {
      [username: string]: {
        roomFavourited: boolean,
        furniture: [],
        layouts: []
      }
    }
  }

  // Hooks and colours
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const uniqueStyles = createUniqueStyles(isDarkMode);

  // Settings
  const [isFavourited, setIsFavourited] = useState<boolean>(false);
  const [localJson, setLocalJson] = useState<Room>();
  const { updateJsonData, setRoomName, getRoomData } = useRoom()
  const { user } = useAuth()


  // On load, call once
  useEffect(() => {
    fetchRoom()
  }, [])

  // Auto refresh page with saved furniture
  useFocusEffect(
    useCallback(() => {
      fetchRoom();
    }, [])
  );

  /**
     * Load the jsonData and record as local instance
     */
  const fetchRoom = async () => {

    const roomPath = `${FileSystem.documentDirectory}rooms/${RoomTitle}.json`;

    // Read room file, return if file does not exist
    const fileCheck = await FileSystem.getInfoAsync(roomPath);
    if (!fileCheck.exists) return;


    // Read and parse data from room file
    const data = await FileSystem.readAsStringAsync(roomPath);
    const thisData = JSON.parse(data);
    setLocalJson(thisData)

    // If favourited, set favourited
    if (thisData?.users?.[user.username].roomFavourited) setIsFavourited(true)
  }

  /**
   * Set a layout as favourited within the JSON entry.
   */
  const toggleFavourite = async () => {

    // Invert the current favourite value
    const inverseFavourited = !isFavourited;
    setIsFavourited(inverseFavourited);


    // Write the new data to the JSON
    const updateData = {
      ...localJson,
      users: {
        ...localJson?.users,
        [user.username]: {
          ...localJson?.users?.[user.username],
          roomFavourited: inverseFavourited
        }
      }
    }

    updateJsonData(updateData, FilePath);
  }


  return (
    <Pressable
      style={uniqueStyles.layoutCardContainer}
      onPress={async () => {

        // Get the data (time issue) and set the title afterwards
        await getRoomData(RoomTitle)
        setRoomName(RoomTitle);
        router.push('/addPages/roomDetails');
      }}
    >


      {/* Title and favourited icon */}
      <View style={uniqueStyles.layoutHeader}>
        <Pressable
          onPress={toggleFavourite}>
          {isFavourited ?
            <Icons.StarIcon />
            :
            <Icons.StarIconOutline />
          }
        </Pressable>
        <Text style={uniqueStyles.RoomTitle}>{RoomTitle}</Text>
      </View>


      {/* Content */}
      <View style={uniqueStyles.content}>
        {localJson?.roomFiles?.png &&
          <Image
            style={uniqueStyles.imageBody}
            // resizeMode="contain"
            source={{ uri: (`data:image/png;base64,${localJson?.roomFiles?.png}`) }} />
        }
      </View>


    </Pressable>
  );
};

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    layoutCardContainer: {
      width: '45%',
      borderColor: isDarkMode ? '#fff' : '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      height: 200,
      padding: 8,
      alignItems: 'center',
    },
    layoutHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    layoutCardContent: {
      width: '100%',
      height: '100%',
      backgroundColor: 'red',
    },
    RoomTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 4,
      color: isDarkMode ? '#fff' : '#000',
    },
    imageBody: {
      width: '100%',
      aspectRatio: 1,
    },
    content: {
      width: '100%',
      height: '100%',
      justifyContent: "center",
      alignItems: "center",
    },
    robot: {
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 4,
      backgroundColor: '#964B00',
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
    },
    boxText: {
      color: "#fff",
      fontWeight: "bold",
    }
  })
