import { View, ScrollView, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import { Link } from 'expo-router';

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

      <Link href="/addPages/addLayout" asChild>
        <Pressable>
          <Text>Add Layout</Text>
        </Pressable>
      </Link>

      <Link href="/addPages/addFurniture" asChild>
        <Pressable>
          <Text>Add Furniture</Text>
        </Pressable>
      </Link>



    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({

  });
