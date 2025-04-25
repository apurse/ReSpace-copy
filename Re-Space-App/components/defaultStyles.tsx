import { StyleSheet, Dimensions } from 'react-native';

// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

// Function to generate styles dynamically based on theme
export const createDefaultStyles = (isDarkMode: boolean) => StyleSheet.create({

  // main body
  body: {
    flexGrow: 1,
    padding: 16,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: isDarkMode ? '#222' : '#fff',
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
    color: isDarkMode ? '#fff' : '#000', 
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 40, // 20 is even
    color: isDarkMode ? '#fff' : '#000', 
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
  },
});
