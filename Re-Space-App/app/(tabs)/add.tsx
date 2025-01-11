import { View, ScrollView, StyleSheet, Text } from 'react-native';

import { createDefaultStyles } from '../../components/defaultStyles';
import Furniture from '@/components/LayoutComponents/furniture';
import { useTheme } from '../_layout';

export default function AddLayout() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Add Layout</Text>
      </View>

      <Furniture furnitureName="Table" furnitureID="240"></Furniture>


    </ScrollView>
  );
}

const uniqueStyles = StyleSheet.create({
});
