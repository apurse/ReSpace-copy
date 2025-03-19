import { View, ScrollView, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import { Link } from 'expo-router';

// expo navigation: https://docs.expo.dev/router/navigating-pages/
// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export default function roomsManager() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Rooms Manager</Text>
      </View>

      <View style={uniqueStyles.buttonContainer}>
        <Link href="/addPages/newRoom" asChild>
          <Pressable style={uniqueStyles.button}>
            <Text style={uniqueStyles.text}>New Room</Text>
          </Pressable>
        </Link>

        <Link href="/(tabs)/library" asChild>
          <Pressable style={uniqueStyles.button}>
            <Text style={uniqueStyles.text}>Select Room</Text>
          </Pressable>
        </Link>
      </View>



    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    buttonContainer: {
      gap: width * 0.1,
    },
    button: {
      width: width * 0.75,
      height: width * 0.1,
      backgroundColor: isDarkMode ? '#fff' : '#000',
      borderRadius: 20,
      alignContent: 'center',
    },
    text: {
      textAlign: 'center',
      fontSize: 24,
      color: isDarkMode ? '#000' : '#fff',
      top: 3,
      fontWeight: '300',
    }
  });
