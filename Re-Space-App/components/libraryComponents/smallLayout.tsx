import { StyleSheet, View, Text, Pressable } from "react-native";
import * as Icons from '../indexComponents/Icons';
import { useTheme } from '../../app/_layout';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRoom } from '@/hooks/useRoom';


/**
 * A small layout displaying the title and favourite status which when clicked, loads up the corresponding layout.
 * @param LayoutTitle String - The title of the layout. 
 * @param roomName String - The name of the room the layout is for. 
 */
export default function SmallLayout({ LayoutTitle }: { LayoutTitle: any; }) {

  // Hooks and colours
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDarkMode = theme === 'dark';
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { roomName, jsonData, updateJsonData } = useRoom();

  // Settings
  const [isFavourited, setIsFavourited] = useState<boolean>(false);


  // Global variables
  var allLayouts: any[] = [];


  /**
  * Get the layout JSON and layout information.
  * @returns layoutIndex - the index of the layout within the JSON.
  */
  const getJson = async () => {


    // Get the layout index within the JSON
    const layoutIndex = jsonData.users[user.username]?.layouts
      .findIndex((layout: any) => layout.name === LayoutTitle);


    // Get all layouts and overwrite the selected layout
    allLayouts = jsonData.users[user.username]?.layouts;


    // Set the favourited value
    setIsFavourited(allLayouts[layoutIndex].favourited);

    return layoutIndex;
  };


  // Update on each load
  useEffect(() => {
    getJson()
  }, [roomName, LayoutTitle])


  /**
   * Set a layout as favourited within the JSON entry.
   */
  const toggleFavourite = async () => {

    const index = await getJson();


    // Invert the current favourite value
    const inverseFavourited = !isFavourited;
    setIsFavourited(inverseFavourited)
    allLayouts[index].favourited = inverseFavourited;


    // Write the new data to the JSON
    const updateData = {
      ...jsonData,
      users: {
        ...jsonData?.users,
        [user.username]: {
          ...jsonData.users[user.username],
          layouts: allLayouts
        }
      }
    }

    updateJsonData(updateData);
  }


  return (
    <Pressable
      style={uniqueStyles.layoutCardContainer}
      onPress={() => {
        router.push({
          pathname: "/addPages/addLayout",
          params: { selectedLayout: LayoutTitle },
        })
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
        <Text style={uniqueStyles.layoutTitle}>{LayoutTitle}</Text>
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
    layoutTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 4,
      color: isDarkMode ? '#fff' : '#000',
    },
    imageBody: {
      // width: 180,
      // height: 300,
      width: '100%',
      height: '100%',
    }
  })