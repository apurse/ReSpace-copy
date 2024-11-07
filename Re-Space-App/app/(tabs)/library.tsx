
// modules go here
import { View, ScrollView, StyleSheet, Text } from 'react-native';


// components go here
// components contain most of the functionality, each page just places it
import SmallLayout from '@/components/smallLayout';
import { defaultStyles } from '../../components/defaultStyles';


// the page itself
export default function Library() {
  return (

    <ScrollView contentContainerStyle={defaultStyles.container}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Library</Text>
      </View>

      <Text style={defaultStyles.sectionTitle}>All Layouts</Text>
      <View style={defaultStyles.cardSectionContainer}>
        <SmallLayout LayoutTitle="Rows of 8"></SmallLayout>
        {/* <SmallLayout LayoutTitle="Rows of 8" LayoutImage="..."></SmallLayout> */}
        <SmallLayout LayoutTitle="Rows of 4"></SmallLayout>
        <SmallLayout LayoutTitle="Open Space"></SmallLayout>
        <SmallLayout LayoutTitle="Open Space"></SmallLayout>
        <SmallLayout LayoutTitle="Open Space"></SmallLayout>
        <SmallLayout LayoutTitle="Open Space"></SmallLayout>
      </View>

    </ScrollView>
  );
}


// styling goes here, same as css
const styles = StyleSheet.create({
});
