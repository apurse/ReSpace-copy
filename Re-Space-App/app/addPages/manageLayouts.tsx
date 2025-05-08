import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from "@/app/_layout";
import { router } from 'expo-router';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useState, useCallback } from 'react';
import SmallLayout from '@/components/libraryComponents/smallLayout';
import { useAuth } from "@/hooks/useAuth";
import { useFocusEffect } from '@react-navigation/native';
import FilterButton from '@/components/libraryComponents/FilterButton';
import { useRoom } from '@/hooks/useRoom';


// Get dimensions of the screen
const { width } = Dimensions.get('window');

export default function ManageLayouts() {

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

  var roomScan = '';


  /**
   * Fetch layout data from room file
   */
  const getLayouts = async () => {


    try {
      if (!roomName) return;

      roomScan = jsonData.roomFiles.roomScan;


      // Push all layouts to an array and output as smallLayouts
      var allLayouts: any = [];
      var favourites: any = [];


      // Filter layouts by values and push into the correct array
      jsonData[user.username]?.layouts?.forEach((layout: { name: string, favourited: boolean }) => {
        allLayouts.push(<SmallLayout key={layout.name} LayoutTitle={layout.name} />)
        if (layout.favourited) {
          favourites.push(<SmallLayout key={layout.name} LayoutTitle={layout.name} />)
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
        <Text style={defaultStyles.pageTitle}>Manage Layouts</Text>
      </View>

      {/* Filters */}
      {/* <Text style={uniqueStyles.sectionTitle}>Filters</Text> */}
      <View style={uniqueStyles.filterContainer}>
        
        
        {/* Make twice as big and white */}
        <FilterButton
          Option="Add new layout"
          flexValue={1}
          onPress={() => router.push('/addPages/addLayout')}
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
              (`All Layouts: ${layouts?.length}`)
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
    }
  });
