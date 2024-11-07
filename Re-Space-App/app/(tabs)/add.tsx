import { View, ScrollView, StyleSheet, Text } from 'react-native';

import { defaultStyles } from '../../components/defaultStyles';

export default function AddLayout() {
  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Add Layout</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
});
