
// modules go here
import { View, ScrollView, StyleSheet } from 'react-native';


// components go here
// components contain most of the functionality, each page just places it
import SmallLayout from '@/components/smallLayout';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


// the page itself
export default function Library() {
  return (

    <ScrollView contentContainerStyle={styles.container}>

      {/* Content */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Library</ThemedText>
      </ThemedView>


      <ThemedText type="subtitle">All Layouts</ThemedText>
      <View style={styles.cardSectionContainer}>
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
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardSectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
