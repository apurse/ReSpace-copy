
// modules go here
import { Image, StyleSheet, Platform } from 'react-native';


// components go here
// components contain most of the functionality, each page just places it
import SmallLayout from '@/components/smallLayout';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';


// the page itself
export default function Library() {
  return (

    // background stuff
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>

        {/* Content */}
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Library</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">All Layouts</ThemedText>


        {/* This is where the component gets called  */}
        <SmallLayout LayoutTitle="Rows of 8"></SmallLayout>
        {/* <SmallLayout LayoutTitle="Rows of 8" LayoutImage="..."></SmallLayout> */}
        <SmallLayout LayoutTitle="Rows of 4"></SmallLayout>
        <SmallLayout LayoutTitle="Open Space"></SmallLayout>

      </ThemedView>
    </ParallaxScrollView>
  );
}


// styling goes here, same as css
const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
