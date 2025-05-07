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
    marginBottom: 20,
    // height: 100,
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? '#fff' : '#000',
  },

  pageTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: isDarkMode ? '#fff' : '#000',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 40, // 20 is even
    color: isDarkMode ? '#fff' : '#000',
    textAlign: 'center',
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
  }
});
