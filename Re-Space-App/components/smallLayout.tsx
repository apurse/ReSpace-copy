import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import * as Icons from './indexComponents/Icons';
import { useTheme } from '../app/_layout';
import { Link, router } from "expo-router";
import { useSocket } from "@/hooks/useSocket";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import * as FileSystem from 'expo-file-system';


export default function SmallLayout({ LayoutTitle, roomName }: { LayoutTitle: any; roomName: string }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { roomMap } = useSocket();
  const [isFavourited, setIsFavourited] = useState<boolean>(false);
  const { user } = useAuth();


  var layoutJson = '';
  var readData = '';
  let jsonData = {
    [user.username]: {
      layouts: []
    }
  };
  var allLayouts: any[] = [];
  var layoutIndex = -1;


  // Update on each load
  useEffect(() => {


    /**
     * Get the layout JSON and layout information.
     */
    const getJson = async () => {

      // Read and check there is JSON data
      layoutJson = FileSystem.documentDirectory + 'layouts.json';
      readData = await FileSystem.readAsStringAsync(layoutJson);
      if (readData) jsonData = JSON.parse(readData);

      
      // Get the layout index within the JSON
      layoutIndex = jsonData[user.username]?.layouts
        .findIndex((layout: any) => layout.name === LayoutTitle);


      // Get all layouts and overwrite the selected layout
      allLayouts = jsonData[user.username]?.layouts;


      // Set the favourited value
      setIsFavourited(allLayouts[layoutIndex].favourited);
    };


    getJson()
  })


  /**
   * Set a layout as favourited within the JSON entry.
   */
  const toggleFavourite = async () => {


    // Invert the current favourite value
    const inverseFavourited = !isFavourited;
    setIsFavourited(inverseFavourited)

    allLayouts[layoutIndex].favourited = inverseFavourited;


    // Write the new data to the JSON
    const updateData = {
      ...jsonData,
      [user.username]: {
        layouts: allLayouts
      }
    }
    await FileSystem.writeAsStringAsync(layoutJson, JSON.stringify(updateData));
  }


  return (
    <Pressable
      style={uniqueStyles.layoutCardContainer}
      onPress={() =>
        router.push({
          pathname: "/addPages/addLayout",
          params: { layoutName: LayoutTitle, roomName},
        })
      }>

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

      <Image
        style={uniqueStyles.imageBody}
        source={{ uri: (`data:image/png;base64,${roomMap}`) }} />
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
      height: '50%',
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