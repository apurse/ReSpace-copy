import { StyleSheet, View, Text, Pressable } from "react-native";
import * as Icons from '../indexComponents/Icons';
import { useTheme } from '../../app/_layout';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as FileSystem from 'expo-file-system';

/**
 * An entry of the furniture, displaying the title and favourite status which when clicked, loads it up.
 * @param FurnitureTitle String - The title of the furniture. 
 * @param roomName String - The name of the room the furniture is for. 
 */
export default function SmallFurniture({ FurnitureTitle, roomName }: { FurnitureTitle: any; roomName: string }) {

  // Box class
  type Box = {
    furnitureID: string;
    id: number;
    width: number;
    length: number;
    selectedColour: string;
  };

  // Hooks and colours
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDarkMode = theme === 'dark';
  const uniqueStyles = createUniqueStyles(isDarkMode);

  // Settings
  const [isFavourited, setIsFavourited] = useState<boolean>(false);
  const [box, setBox] = useState<Box>();


  // Global variables
  const furnitureJson = `${FileSystem.documentDirectory}rooms/${roomName}.json`;
  var allFurniture: any[] = [];
  let jsonData = {
    [user.username]: {
      furniture: []
    }
  };


  /**
  * Get the room JSON and furniture information.
  * @returns furnitureIndex - the index of the furniture within the JSON.
  */
  const getJson = async () => {


    // Read and check there is JSON data
    const readData = await FileSystem.readAsStringAsync(furnitureJson);
    if (readData) jsonData = JSON.parse(readData);


    // Get the furniture index within the JSON
    const furnitureIndex = jsonData[user.username]?.furniture
      .findIndex((furniture: any) => furniture.name === FurnitureTitle);


    // Get all furniture and overwrite the selected value
    allFurniture = jsonData[user.username]?.furniture;


    // Set the favourited value and box
    setIsFavourited(allFurniture[furnitureIndex].favourited);
    setBox(allFurniture[furnitureIndex])

    return furnitureIndex;
  };


  // Update on each load
  useEffect(() => {
    getJson()
  }, [roomName, FurnitureTitle])


  /**
   * Set a furniture as favourited within the JSON entry.
   */
  const toggleFavourite = async () => {

    var index = await getJson()

    // Invert and set the current favourite value
    const inverseFavourited = !isFavourited;
    setIsFavourited(inverseFavourited)
    allFurniture[index].favourited = inverseFavourited;


    // Write the new data to the JSON
    const updateData = {
      ...jsonData,
      [user.username]: {
        ...jsonData[user.username],
        furniture: allFurniture
      }
    }

    await FileSystem.writeAsStringAsync(furnitureJson, JSON.stringify(updateData));
  }


  return (
    <Pressable
      style={uniqueStyles.furnitureCardContainer}
      onPress={() => {
        router.push({
          pathname: "/addPages/addLayout",
          params: { selectedLayout: FurnitureTitle, roomName },
        })
      }}
    >

      {/* Title and favourited icon */}
      <View style={uniqueStyles.furnitureHeader}>
        <Pressable
          onPress={toggleFavourite}>
          {isFavourited ?
            <Icons.StarIcon />
            :
            <Icons.StarIconOutline />
          }
        </Pressable>
        <Text style={uniqueStyles.furnitureTitle}>{FurnitureTitle}</Text>
      </View>


      {/* Content */}
      <View style={uniqueStyles.content}>
        {box &&
          <View
            style={[
              uniqueStyles.robot,
              {
                backgroundColor: box.selectedColour,
                width: box.width,
                height: box.length,
                aspectRatio: box.width / box.length
              },
            ]}
          >
            <Text style={uniqueStyles.boxText}>{box.furnitureID}</Text>
          </View>
        }
      </View>

    </Pressable>
  );
};

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    furnitureCardContainer: {
      width: '45%',
      borderColor: isDarkMode ? '#fff' : '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      height: 200,
      padding: 8,
      alignItems: 'center',
    },
    furnitureHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    furnitureTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 4,
      color: isDarkMode ? '#fff' : '#000',
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