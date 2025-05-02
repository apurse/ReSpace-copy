import { View, RefreshControl, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import SmallLayout from '@/components/smallLayout';
import FilterButton from '@/components/libraryComponents/FilterButton';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from 'react';


const { width, height } = Dimensions.get('window');


export default function Library() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { loggedIn, user, setUser } = useAuth();
  const [layouts, setLayouts] = useState<any | null>(null); // Notifications
  const [favouriteLayouts, setFavouriteLayouts] = useState<any | null>(null); // Notifications
  const [favouritesSelected, setFavouritesSelected] = useState<boolean>(false); // Notifications
  const [refreshing, setRefreshing] = useState(false);


  /**
   * Get the saved layouts from the layout JSON.
   * @returns 
   */
  const getLayouts = async () => {


    // Get the layout JSON
    const layoutJson = FileSystem.documentDirectory + 'layouts.json';
    const checkJson = await FileSystem.getInfoAsync(layoutJson);
    if (!checkJson.exists) return;


    // Read data from json before writing new data
    const readData = await FileSystem.readAsStringAsync(layoutJson);
    const jsonData = JSON.parse(readData);


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
  }

  // Refresh on user change
  useEffect(() => {
    getLayouts()
  }, [user]);

  return (
    <ScrollView
      contentContainerStyle={defaultStyles.body}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getLayouts} />
      }>
      < View style={defaultStyles.pageTitleSection} >
        <Text style={defaultStyles.pageTitle}>Library</Text>
      </View >

      {/* Filters */}
      <Text style={uniqueStyles.sectionTitle}>Filters</Text>
      <View style={uniqueStyles.filterContainer}>
        <FilterButton
          Option="Favourites"
          onPress={() => {
            setFavouritesSelected(value => !value)
            console.log("favourites value: ", favouritesSelected)
            getLayouts()
          }}
          selected={favouritesSelected}
        />
        <FilterButton
          Option="Layouts"
          onPress={() => alert("WIP")}
        />
        <FilterButton
          Option="Furniture"
          onPress={() => alert("WIP")}
        />
      </View>

      {/* Show layouts if logged in */}
      {user &&
      <><Text style={uniqueStyles.sectionTitle}>{!favouritesSelected ? (`All Layouts: ${layouts?.length}`) : (`Favourites: ${favouriteLayouts?.length}/${layouts?.length}`)}</Text><View style={defaultStyles.cardSectionContainer}>
          {favouritesSelected ? favouriteLayouts : layouts}
        </View></>
      }

    </ScrollView>
  );
}


// styling goes here, same as css
const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: width * 0.04,
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
