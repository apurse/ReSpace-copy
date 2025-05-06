import { View, ScrollView, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import { Link, router } from 'expo-router';

// expo navigation: https://docs.expo.dev/router/navigating-pages/
// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export default function AddLayout() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Add</Text>
      </View>

      <View style={uniqueStyles.buttonContainer}>
        <Pressable
          style={uniqueStyles.button}
          onPress={() =>
            router.push('/addPages/addLayout')}
        >
          <Text style={uniqueStyles.text}>Add Layout</Text>
        </Pressable>

        <Pressable
          style={uniqueStyles.button}
          onPress={() =>
            router.push('/addPages/addFurniture')}
        >
          <Text style={uniqueStyles.text}>Add Furniture</Text>
        </Pressable>
      </View>



    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    buttonContainer: {
      gap: width * 0.2,
    },
    button: {
      width: width * 0.5,
      height: width * 0.5,
      backgroundColor: isDarkMode ? '#fff' : '#212121',
      borderRadius: 20,
    },
    text: {
      textAlign: 'center',
      fontSize: 24,
      color: isDarkMode ? '#000' : '#fff',

    }
  });
