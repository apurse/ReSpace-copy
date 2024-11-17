
// modules go here
import { View, ScrollView, StyleSheet, Text } from 'react-native';


// components go here
// components contain most of the functionality, each page just places it
import SmallLayout from '@/components/smallLayout';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';


// the page itself
export default function Library() {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
  return (

    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Library</Text>
      </View>

      <Text style={defaultStyles.sectionTitle}>All Layouts</Text>
      <View style={defaultStyles.cardSectionContainer}>
        <SmallLayout LayoutTitle="Rows of 2"></SmallLayout>
        {/* <SmallLayout LayoutTitle="Rows of 8" LayoutImage="..."></SmallLayout> */}
        <SmallLayout LayoutTitle="Rows of 4"></SmallLayout>
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
const styles = StyleSheet.create({
});
