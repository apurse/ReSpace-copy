import { StyleSheet, Dimensions } from 'react-native';

// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export const defaultStyles = StyleSheet.create({

  // main body

  body: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#fff',
  },

  pageTitleSection: {
    width: '100%',
    height: 180,
  },

  pageTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
    color: '#333',
  },




  // small layout

  cardSectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },


  // icons

  searchIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    marginTop: 10,
  },
});