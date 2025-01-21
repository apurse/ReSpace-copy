import { View, ScrollView, StyleSheet, Text, Dimensions, TextInput } from 'react-native';
import React, { useState } from 'react';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '@/app/_layout';
import Furniture from '@/components/LayoutComponents/furniture';
import ActionButton from '@/components/settingsComponents/actionButton';
import furnitureData from '@/Jsons/FurnitureData.json';


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

  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [heightF, setHeight] = useState('');
  const [widthF, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [quantity, setQuantity] = useState('');
  const [colour, setColour] = useState('');

  const saveFurniture = () => {
    const newFurniture = {
      name,
      model,
      height: heightF,
      width: widthF,
      length,
      quantity,
      colour,
    };

    furnitureData.Furniture.push(newFurniture);
    console.log('New data pushed');

    // Reset form
    setName('');
    setModel('');
    setHeight('');
    setWidth('');
    setLength('');
    setQuantity('');
    setColour('');
  };

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Add Furniture</Text>
      </View>

      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={uniqueStyles.textInput} placeholder='Enter name...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Model</Text>
        <TextInput value={model} onChangeText={setModel} style={uniqueStyles.textInput} placeholder='Enter model type...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Height</Text>
        <TextInput value={heightF} onChangeText={setHeight} style={uniqueStyles.textInput} placeholder='Enter height value...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Width</Text>
        <TextInput value={widthF} onChangeText={setWidth} style={uniqueStyles.textInput} placeholder='Enter width value...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Length</Text>
        <TextInput value={length} onChangeText={setLength} style={uniqueStyles.textInput} placeholder='Enter length value...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Quantity</Text>
        <TextInput value={quantity} onChangeText={setQuantity} style={uniqueStyles.textInput} placeholder='Enter quantity value...'></TextInput>
      </View>
      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Colour</Text>
        <TextInput value={colour} onChangeText={setColour} style={uniqueStyles.textInput} placeholder='Enter colour...'></TextInput>
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
