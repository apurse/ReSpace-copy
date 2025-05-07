import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useTheme } from "@/app/_layout";
import { router, useLocalSearchParams } from 'expo-router';
import { createDefaultStyles } from '../../components/defaultStyles';
import * as FileSystem from 'expo-file-system';
import { useState, useCallback } from 'react';
import SmallFurniture from '@/components/libraryComponents/smallFurniture';
import { useAuth } from "@/hooks/useAuth";
import { useFocusEffect } from '@react-navigation/native';
import FilterButton from '@/components/libraryComponents/FilterButton';
import { useRoom } from '@/hooks/useRoom';

// Get dimensions of the screen
const { width } = Dimensions.get('window');

export default function ManageFurniture() {

  // Hooks and colours
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { user } = useAuth();
  const { roomName, jsonData } = useRoom();

  // Layouts and favourite layouts
  const [layouts, setLayouts] = useState<any | null>(null);
  const [favouriteLayouts, setFavouriteLayouts] = useState<any | null>(null);
  const [favouritesSelected, setFavouritesSelected] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);


  /**
   * Fetch layout data from room file
   */
  const getLayouts = async () => {


    try {
      if (!roomName) return;


      // Push all layouts to an array and output as smallLayouts
      var allLayouts: any = [];
      var favourites: any = [];


      // Filter layouts by values and push into the correct array
      jsonData[user.username]?.furniture?.forEach((furniture: { name: string, favourited: boolean }) => {
        allLayouts.push(<SmallFurniture key={furniture.name} FurnitureTitle={furniture.name} roomName={roomName} />)
        if (furniture.favourited) {
          favourites.push(<SmallFurniture key={furniture.name} FurnitureTitle={furniture.name} roomName={roomName} />)
        }
      })


      // Set the arrays
      setLayouts(allLayouts);
      setFavouriteLayouts(favourites)

    } catch (error) {
      console.error("Failed to load layouts", error);
    }
  };

  /**
   * Auto refresh page with saved layouts
   */
  useFocusEffect(
    useCallback(() => {
      getLayouts();
    }, [roomName])
  );


  return (
    <ScrollView
      contentContainerStyle={defaultStyles.body}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getLayouts} />
      }>


      <View style={defaultStyles.pageTitleSection}>
        <Text style={[defaultStyles.pageTitle, {fontSize: 38}]}>Manage Furniture</Text>
      </View>

      {/* Filters */}
      {/* <Text style={uniqueStyles.sectionTitle}>Filters</Text> */}
      <View style={uniqueStyles.filterContainer}>


        {/* Make twice as big and white */}
        <FilterButton
          Option="Add new furniture"
          flexValue={1}
          onPress={() =>
            router.push({
              pathname: '/addPages/addFurniture',
              params: { roomName }
            })}
        />


        <FilterButton
          Option="Favourites"
          flexValue={1}
          onPress={() => {
            setFavouritesSelected(value => !value)
            getLayouts()
          }}
          selected={favouritesSelected}
        />

      </View>


      {/* Show layouts if logged in */}
      {user &&
        <>
          <Text style={uniqueStyles.sectionTitle}>
            {!favouritesSelected ?
              (`All Furniture: ${layouts?.length}`)
              :
              (`Favourites: ${favouriteLayouts?.length}/${layouts?.length}`)
            }
          </Text>

          <View style={defaultStyles.cardSectionContainer}>
            {favouritesSelected ? favouriteLayouts : layouts}
          </View>
        </>
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
      gap: width * 0.1,
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
    }
  });
