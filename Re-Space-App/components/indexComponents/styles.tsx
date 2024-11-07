import { StyleSheet, Dimensions } from 'react-native';

// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      paddingTop: 40, 
      backgroundColor: '#fff',
    },

    // Greeting section

    greeting: {
      fontSize: width * 0.06,
      marginBottom: 5,
      marginTop: 5,
      textAlign: 'center',
    },

    // Status monitoring section

    statusCard: {
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 25,
      borderColor: '#000',
      borderWidth: 0.5,
      width: '90%',
      minHeight: 150,
      alignSelf: 'center',
    },
    statusTitle: {
      fontSize: width * 0.08,
      color: '#fff',
      fontWeight: '400',
      marginBottom: 8,
    },
    statusText: {
      fontSize: width * 0.06,
      color: '#fff',
      fontWeight: '400',
    },

    // Recent layout section

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

    // Icons
    
    statusIcons: {
        flexDirection: 'row',
        gap: width * 0.3,
        marginBottom: 5,
        marginTop: 5,
        fontSize: height * 0.07,
    },
    outlineIcon: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    searchIcon: {
        position: 'absolute',
        top: 16,
        right: 16,
        marginTop: 10,
    },
  });