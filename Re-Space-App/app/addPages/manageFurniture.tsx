import { View, Text, StyleSheet, Dimensions, ScrollView, RefreshControl, Alert } from 'react-native';
import { useTheme } from "@/app/_layout";
import { router } from 'expo-router';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useState, useCallback, useEffect } from 'react';
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
  const { roomName, jsonData, updateJsonData } = useRoom();

  // furniture and favourite furniture
  const [furniture, setFurniture] = useState<any | null>(null);
  const [favouriteFurniture, setFavouriteFurniture] = useState<any | null>(null);
  const [favouritesSelected, setFavouritesSelected] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);
  const [length, setLength] = useState<number>();


  /**
   * Fetch layout data from room file
   */
  const getFurniture = async () => {


    try {
      if (!roomName) return;


      // Push all furniture to an array and output as smallFurniture
      var allFurniture: any = [];
      var favourites: any = [];

      var entries = 0;


      // Filter furniture by values and push into the correct array
      jsonData.users[user.username]?.furniture?.forEach((furniture: { name: string, favourited: boolean }) => {
        allFurniture.push(<SmallFurniture key={furniture.name} FurnitureTitle={furniture.name} />)
        entries++;
        if (furniture.favourited) {
          favourites.push(<SmallFurniture key={furniture.name} FurnitureTitle={furniture.name} />)
        }
      })


      // Set the arrays
      setFurniture(allFurniture);
      setFavouriteFurniture(favourites)
      setLength(entries)

    } catch (error) {
      console.error("Failed to load furniture", error);
    }
  };

  
  // Auto refresh page with saved furniture
  useFocusEffect(
    useCallback(() => {
      getFurniture();
    }, [roomName])
  );


  // Refresh page on jsonData change (used for clearing)
  useEffect(() => {
    getFurniture()
  }, [jsonData])


  return (
    <ScrollView
      contentContainerStyle={defaultStyles.body}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={getFurniture} />
      }>


      <View style={defaultStyles.pageTitleSection}>
        <Text style={[defaultStyles.pageTitle, { fontSize: 38 }]}>Manage Furniture</Text>
      </View>

      {/* Filters */}
      <View style={uniqueStyles.filterContainer}>

        <FilterButton
          Option="Add new furniture"
          flexValue={1}
          iconName='pluscircleo'
          onPress={() =>
            router.push({
              pathname: '/addPages/addFurniture',
              params: { roomName }
            })}
        />

        <FilterButton
          Option="Favourites"
          flexValue={1}
          iconName='staro'
          onPress={() => {
            setFavouritesSelected(value => !value)
            getFurniture()
          }}
          selected={favouritesSelected}
        />

        <FilterButton
          Option="Clear furniture"
          flexValue={1}
          iconName='minuscircleo'
          onPress={() => {

            // Prompt the users with a check
            Alert.alert(
              'Clear all furniture?',
              'This will remove all furniture entries for this user in this room. This action cannot be undone.',
              [
                {
                  text: 'Yes', onPress: () => {  
                    
                    
                    // Clear the furniture array for this user
                    const updateData = {
                      ...jsonData,
                      users: {
                        ...jsonData?.users,
                        [user.username]: {
                          ...jsonData?.users[user.username],
                          furniture: []
                        }
                      }
                    }
                    updateJsonData(updateData);
                    alert(`Cleared ${length} furniture entries!`);
                  }
                },
                { text: 'No', onPress: () => alert(`Clearing furniture cancelled!`) },
              ],
              { cancelable: false },
            );
          }
          }
        />

      </View>


      {/* Show furniture if logged in */}
      {user &&
        <>
          <Text style={uniqueStyles.sectionTitle}>
            {!favouritesSelected ?
              (`All Furniture: ${furniture?.length}`)
              :
              (`Favourites: ${favouriteFurniture?.length}/${furniture?.length}`)
            }
          </Text>

          <View style={defaultStyles.cardSectionContainer}>
            {favouritesSelected ? favouriteFurniture : furniture}
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
