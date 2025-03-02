
// modules go here
import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';


// components go here
// components contain most of the functionality, each page just places it
import SmallLayout from '@/components/smallLayout';
import FilterButton from '@/components/libraryComponents/FilterButton';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';

const { width, height } = Dimensions.get('window');

// the page itself
export default function Library() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);


  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>
      {/* Content */}
      < View style={defaultStyles.pageTitleSection} >
        <Text style={defaultStyles.pageTitle}>Library</Text>
      </View >
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


      <Text style={defaultStyles.sectionTitle}>All Layouts</Text>
      <View style={defaultStyles.cardSectionContainer}>
        <SmallLayout LayoutTitle="Rows of 2"></SmallLayout>
        <SmallLayout LayoutTitle="Rows of 6"></SmallLayout>
        <SmallLayout LayoutTitle="Rows of 8"></SmallLayout>
        <SmallLayout LayoutTitle="Rows of 10"></SmallLayout>
        <SmallLayout LayoutTitle="Groups of 2"></SmallLayout>
        <SmallLayout LayoutTitle="Groups of 4"></SmallLayout>
        <SmallLayout LayoutTitle="Groups of 6"></SmallLayout>
        <SmallLayout LayoutTitle="Groups of 8"></SmallLayout>
        <SmallLayout LayoutTitle="Open Space"></SmallLayout>
        <SmallLayout LayoutTitle="Open Space 2"></SmallLayout>
        <SmallLayout LayoutTitle="Circle"></SmallLayout>
        <SmallLayout LayoutTitle="U-shape"></SmallLayout>
      </View>

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
