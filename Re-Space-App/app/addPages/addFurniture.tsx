import { View, ScrollView, StyleSheet, Text, Dimensions, TextInput } from 'react-native';
import React, { useState } from 'react';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '@/app/_layout';
import ActionButton from '@/components/settingsComponents/actionButton';
import furnitureData from '@/Jsons/FurnitureData.json';
import * as FileSystem from 'expo-file-system';

// Local json file with furniture data
const localJson = FileSystem.documentDirectory + 'FurnitureData.json';

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

  const [name, setName] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [heightF, setHeight] = useState<number>(0);
  const [widthF, setWidth] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [colour, setColour] = useState<string>('');

  const saveFurniture = async () => {
    const newFurniture = {
      name,
      model,
      height: heightF,
      width: widthF,
      length,
      quantity,
      colour,
    };

    // Adding data to json
    //const updateData = [...furnitureData.Furniture, newFurniture];

    try {
      // Read data from json before writing new data
      const readData = await FileSystem.readAsStringAsync(localJson);
      let jsonData = {};

      // Check there is data
      if (readData) {
        jsonData = JSON.parse(readData);
      }

      // Adding data to json
      // Ignore 'Furniture' error, this is due there is nothing in 'jsonData' yet.
      const updateData = [...(jsonData.Furniture || []), newFurniture];

      // Write new data to json
      await FileSystem.writeAsStringAsync(localJson, JSON.stringify({ Furniture : updateData }));

      // Show local json file in console
      const data  = await FileSystem.readAsStringAsync(localJson);
      console.log('Furniture json updated:', data);

      // Reset form
      setName('');
      setModel('');
      setHeight(0);
      setWidth(0);
      setLength(0);
      setQuantity(0);
      setColour('');
    } catch (error) {
      console.error('Failed to update/save data to json file:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Add Furniture</Text>
      </View>

      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Name</Text>
        <TextInput 
          value={name} 
          onChangeText={setName} 
          style={uniqueStyles.textInput} 
          placeholder='Enter name...'
        />
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Model</Text>
        <TextInput 
          value={model} 
          onChangeText={setModel} 
          style={uniqueStyles.textInput} 
          placeholder='Enter model type...'
        />
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Height</Text>
        <TextInput
          // If there is nothing ('0') then show empty string (to keep placeholder)
          value={heightF ? heightF.toString() : ''}
          // Check update value with a number
          onChangeText={(text) => setHeight(Number(text))}
          style={uniqueStyles.textInput} 
          placeholder='Enter height value...'
          keyboardType="numeric"
        />
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Width</Text>
        <TextInput
          // If there is nothing ('0') then show empty string (to keep placeholder) 
          value={widthF ? widthF.toString() : ''}
          // Check update value with a number
          onChangeText={(text) => setWidth(Number(text))} 
          style={uniqueStyles.textInput} 
          placeholder='Enter width value...'
          keyboardType="numeric"
        />
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Length</Text>
        <TextInput
          // If there is nothing ('0') then show empty string (to keep placeholder)
          value={length ? length.toString() : ''}
          // Check update value with a number 
          onChangeText={(text) => setLength(Number(text))} 
          style={uniqueStyles.textInput} 
          placeholder='Enter length value...'
          keyboardType="numeric"
        />
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Quantity</Text>
        <TextInput
          // If there is nothing ('0') then show empty string (to keep placeholder)
          value={quantity ? quantity.toString() : ''}
          // Check update value with a number
          onChangeText={(text) => setQuantity(Number(text))} 
          style={uniqueStyles.textInput} 
          placeholder='Enter quantity value...'
          keyboardType="numeric"
        />
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Colour</Text>
        <TextInput 
          value={colour} 
          onChangeText={setColour} 
          style={uniqueStyles.textInput} 
          placeholder='Enter colour...'
        />
      </View>

      <View style={uniqueStyles.buttonContainer}>
        <ActionButton
          label="Save Furniture"
          onPress={saveFurniture}
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
      width: width * 0.5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 40,
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
