import { StyleSheet, Dimensions } from 'react-native';

// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export const defaultStyles = StyleSheet.create({

  // main body

  body: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#fff',
  },

  pageTitleSection: {
    width: '100%',
    height: 100,
    alignItems: 'center',
  },

  pageTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },




  // small layout

  cardSectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: width * 0.04,
    width: '100%',
  },


  // icons

  searchIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    marginTop: 10,
  },

  starOutlineIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
  }
});