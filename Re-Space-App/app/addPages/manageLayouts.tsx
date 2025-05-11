import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, Alert } from 'react-native';
import { useTheme } from "@/app/_layout";
import { router } from 'expo-router';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useState, useCallback, useEffect } from 'react';
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
  const { roomName, jsonData, updateJsonData } = useRoom();

  // Layouts and favourite layouts
  const [layouts, setLayouts] = useState<any | null>(null);
  const [favouriteLayouts, setFavouriteLayouts] = useState<any | null>(null);
  const [favouritesSelected, setFavouritesSelected] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [length, setLength] = useState<number>();


  var roomScan = '';


  /**
   * Fetch layout data from room file
   */
  const getLayouts = async () => {


    try {
      if (!roomName) return;

      roomScan = jsonData?.roomFiles?.roomScan;


      // Push all layouts to an array and output as smallLayouts
      var allLayouts: any = [];
      var favourites: any = [];

      var entries = 0;


      // Filter layouts by values and push into the correct array
      jsonData.users[user.username]?.layouts?.forEach((layout: { name: string, favourited: boolean }) => {
        allLayouts.push(<SmallLayout key={layout.name} LayoutTitle={layout.name} />)
        entries++;
        if (layout.favourited) {
          favourites.push(<SmallLayout key={layout.name} LayoutTitle={layout.name} />)
        }
      })


      // Set the arrays
      setLayouts(allLayouts);
      setFavouriteLayouts(favourites)
      setLength(entries)


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

  // Refresh page on jsonData change (used for clearing)
  useEffect(() => {
    getLayouts()
  }, [jsonData])


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

        <FilterButton
          Option="Add new layout"
          outlineIcon='pluscircleo'
          selectedColor='green'
          flexValue={1}
          onPress={() => router.push('/addPages/addLayout')}
        />

        <FilterButton
          Option="Favourites"
          flexValue={1}
          selectedColor='yellow'
          outlineIcon='staro'
          filledIcon='star'
          onPress={() => {
            setFavouritesSelected(value => !value)
            getLayouts()
          }}
          selected={favouritesSelected}
        />

        <FilterButton
          Option="Clear layouts"
          outlineIcon='minuscircleo'
          flexValue={1}
          selectedColor='red'
          onPress={() => {

            if (length != undefined && length == 0) {
              alert("No layouts to remove!")
              return;
            }
            // Prompt the users with a check
            Alert.alert(
              'Clear all layouts?',
              'This will remove all layouts entries for this user in this room. This action cannot be undone.',
              [
                {
                  text: 'Yes', onPress: () => {


                    // Clear the layouts array for this user
                    const updateData = {
                      ...jsonData,
                      users: {
                        ...jsonData?.users,
                        [user.username]: {
                          ...jsonData?.users[user.username],
                          layouts: []
                        }
                      }
                    }
                    updateJsonData(updateData);
                    alert(`Cleared ${length} layouts!`);
                  }
                },
                { text: 'No', onPress: () => alert(`Clearing layouts cancelled!`) },
              ],
              { cancelable: false },
            );
          }}
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
      gap: width * 0.03,
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
