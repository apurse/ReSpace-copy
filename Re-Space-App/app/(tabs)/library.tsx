import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';
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
  const { loggedIn, user, setUser } = useAuth();
  const [layouts, setLayouts] = useState<any | null>(null); // Notifications


  const getLayouts = async () => {

    // if (!user) {
    //   alert("Not logged in!")
    //   return;
    // }

    const layoutJson = FileSystem.documentDirectory + 'layouts.json';
    const checkJson = await FileSystem.getInfoAsync(layoutJson);
    if (!checkJson.exists) return;

    // Read data from json before writing new data
    const readData = await FileSystem.readAsStringAsync(layoutJson);
    const jsonData = JSON.parse(readData);


    // Push all layouts to an array and output as smallLayouts
    var addLayouts: any = [];
    jsonData[user.username].layouts.forEach((layout: { name: unknown; }) => {
      console.log(layout.name)
      addLayouts.push(<SmallLayout LayoutTitle={layout.name} />)
    })

    setLayouts(addLayouts);
  }

  // Refresh on user change
  useEffect(() => {
    getLayouts()
  }, [user]);

  // Refresh on user change
  // useEffect(() => {
  //   const handleAppStateChange = (nextAppState: string) => {
  //     if (nextAppState === "active") getLayouts()
  //   };

  //   const subscription = AppState.addEventListener("change", handleAppStateChange);
  //   return () => subscription.remove();
  // }, [user]);

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>
      < View style={defaultStyles.pageTitleSection} >
        <Text style={defaultStyles.pageTitle}>Library</Text>
      </View >

      {/* Filters */}
      <Text style={defaultStyles.sectionTitle}>Filters</Text>
      <View style={uniqueStyles.filterContainer}>
        <FilterButton
          Option="Rooms"
          onPress={() => alert("WIP")}
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
      <Text style={defaultStyles.sectionTitle}>All Layouts</Text>
      {user &&
        <View style={defaultStyles.cardSectionContainer}>
          {layouts}
        </View>
      }

    </ScrollView>
  );
}


// styling goes here, same as css
const uniqueStyles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: width * 0.04,
    width: '100%',
  }
});
