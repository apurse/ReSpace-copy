import { View, ScrollView, StyleSheet, Text, Dimensions } from 'react-native';

import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import Furniture from '@/components/LayoutComponents/furniture';
import ActionButton from '@/components/settingsComponents/actionButton';
import { TextInput } from 'react-native-gesture-handler';


// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

// -------- Grid Visuals --------

const roomSize = [600, 900];
const gridSize = [0.8 * width, 0.55 * height];

const tableWidth = 50;

var scaleX = roomSize[0] / gridSize[0];
var scaleY = roomSize[1] / gridSize[1];



export default function AddLayout() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);


  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Add Furniture</Text>
      </View>

      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Height</Text>
        <TextInput style={uniqueStyles.textInput} placeholder='Enter height value...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Width</Text>
        <TextInput style={uniqueStyles.textInput} placeholder='Enter width value...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Length</Text>
        <TextInput style={uniqueStyles.textInput} placeholder='Enter length value...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Quantity</Text>
        <TextInput style={uniqueStyles.textInput} placeholder='Enter quantity value...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Colour</Text>
        <TextInput style={uniqueStyles.textInput} placeholder='Enter colour...'></TextInput>
      </View>

      <View style={uniqueStyles.buttonContainer}>
        <ActionButton
          label="Save Furniture"
          onPress={() => alert("Todo...")}
        />
      </View>

    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    inputField: {

    },
    inputHeader: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#333',
    },
    textInput: {
      width: width * 0.3,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 30,
      backgroundColor: isDarkMode ? '#fff' : '#000',
      color: isDarkMode ? '#000' : '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'arial',
    },
    buttonContainer: {
      width: gridSize[0],
    }

  });
