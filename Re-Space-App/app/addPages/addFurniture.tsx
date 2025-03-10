import { View, ScrollView, StyleSheet, Text, Dimensions, TextInput, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '@/app/_layout';
import ActionButton from '@/components/settingsComponents/actionButton';
import furnitureData from '@/Jsons/FurnitureData.json';
import * as FileSystem from 'expo-file-system';
import Furniture from '@/components/LayoutComponents/furniture';
import { ColourPickerModal } from '@/components/LayoutComponents/colourPickerModal';
import { useSocket } from "@/hooks/useSocket";
import { red } from 'react-native-reanimated/lib/typescript/Colors';



// Local json file with furniture data
const localJson = FileSystem.documentDirectory + 'FurnitureData.json';


// Call function to clear the json data from device
const clearJsonData = async () => {
  try {
    await FileSystem.writeAsStringAsync(localJson, JSON.stringify({ Furniture: [] }));

    console.log('Data has been cleared');
  } catch (error) {
    console.error('Error deleting json data');
  }
};

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

  // Notifications
  const [notifications, setnotifications] = useState<string | null>(null);

  const [name, setName] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [heightF, setHeight] = useState<number>(0);
  const [widthF, setWidth] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedColour, setSelectedColour] = useState<string>('#aabbcc');
  const [QRData, setQRData] = useState<string>('');
  const { socket, isConnected, robotData, sendMessage, QRCode } = useSocket();


  // State of furniture modal (to add furniture)
  const [isModalVisible, setModalVisible] = useState(false);

  const downloadQR = async () => {
    // download image locally
  }
  const saveFurniture = async () => {

    if (!name || !heightF || !widthF || !length || !quantity) {
      // Show notifications to fill the fields
      setnotifications('Please fill the necessary fields (Marked with \'*\')');

      // Show notifications for 3 sec
      setTimeout(() => setnotifications(null), 3000);

      // Uncomment and click 'save furniture' with nothing on the fields (need reset expo)
      //
      //  clearJsonData();

      return;
    }

    const newFurniture = {
      name,
      model,
      height: heightF,
      width: widthF,
      length,
      quantity,
      selectedColour,
      // QRData
    };

    try {
      // Check if json file exist
      const checkJson = await FileSystem.getInfoAsync(localJson);

      // If json file doesn't exist, create file
      if (!checkJson.exists) {
        await FileSystem.writeAsStringAsync(localJson, JSON.stringify({ Furniture: [] }));
        console.log('Json file created:', localJson);
      }

      // Read data from json before writing new data
      const readData = await FileSystem.readAsStringAsync(localJson);
      let jsonData = { Furniture: [] }; // Give empty array to stop showing an error

      // Check there is data
      if (readData) {
        jsonData = JSON.parse(readData);
      }

      // Adding data to json
      const updateData = [...jsonData.Furniture, newFurniture];



      // Send furniture across to server
      if (isConnected) {
        sendMessage({ type: "new_furniture", data: newFurniture });
      } else {
        alert("No connection to the WebSocket.");
      }
      // Write new data to json
      await FileSystem.writeAsStringAsync(localJson, JSON.stringify({ Furniture: updateData }));

      // Show local json file in console
      const data = await FileSystem.readAsStringAsync(localJson);
      console.log('Furniture json updated:', data);

      // Show notifications of successful
      setnotifications('New furniture added sucessfully');

      // Show notifications for 3 sec
      setTimeout(() => setnotifications(null), 3000);

      // Reset form
      setName('');
      setModel('');
      setHeight(0);
      setWidth(0);
      setLength(0);
      setQuantity(0);
      setSelectedColour('#aabbcc');
      setQRData('');
      console.log(addQRCode.length)
      addQRCode.pop();
      console.log(addQRCode.length)

    }
    catch (error) {
      console.error('Failed to update/save data to json file:', error);

      // Show notifications of failure
      setnotifications('Failed to add new furniture.')

      // Show notifications for 3 sec
      setTimeout(() => setnotifications(null), 3000);
    }
  };

  var addQRCode: any = [];

  // When the QRcode has been recieved
  if (QRCode != null && addQRCode.length == 0) {
    // setQRData(QRCode);

    addQRCode.push(
      <View style={{ alignItems: 'center' }}>
        {/* QR generation */}
        <View style={uniqueStyles.pngContainer}>
          <Image
            style={uniqueStyles.imageBody}
            source={{ uri: (`data:image/png;base64,${QRCode}`) }} />
        </View>
        {/* Print button */}
        <View style={uniqueStyles.buttonContainer}>
          {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}
          <ActionButton
            label="Print QR Code"
            onPress={downloadQR}
          />
        </View>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Add Furniture</Text>
      </View>

      <View style={uniqueStyles.inputRow}>
        <View style={uniqueStyles.inputField}>
          <Text style={uniqueStyles.inputHeader}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={uniqueStyles.textInput}
            placeholder='*Enter name...*'
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
      </View>


      <View style={uniqueStyles.inputRow}>
        <View style={uniqueStyles.inputField}>
          <Text style={uniqueStyles.inputHeader}>Height</Text>
          <TextInput
            // If there is nothing ('0') then show empty string (to keep placeholder)
            value={heightF ? heightF.toString() : ''}
            // Check update value with a number
            onChangeText={(text) => setHeight(Number(text))}
            style={uniqueStyles.textInput}
            placeholder='*Enter height value...*'
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
            placeholder='*Enter width value...*'
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={uniqueStyles.inputRow}>
        <View style={uniqueStyles.inputField}>
          <Text style={uniqueStyles.inputHeader}>Length</Text>
          <TextInput
            // If there is nothing ('0') then show empty string (to keep placeholder)
            value={length ? length.toString() : ''}
            // Check update value with a number 
            onChangeText={(text) => setLength(Number(text))}
            style={uniqueStyles.textInput}
            placeholder='*Enter length value...*'
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
            placeholder='*Enter quantity value...*'
            keyboardType="numeric"
          />
        </View>
      </View>


      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        {/* <Text style={uniqueStyles.inputHeader}>Colour</Text> */}
        <ActionButton
          label="Pick a colour"
          style={{ right: 15 }}
          onPress={() => setModalVisible(true)}
        />

        <Text style={[uniqueStyles.colourSelected, { backgroundColor: selectedColour }]}></Text>

        {/* Modal popup */}
        <ColourPickerModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          selectedColour={selectedColour}
          onSelectedColour={setSelectedColour}
        />
      </View>

      <View style={uniqueStyles.buttonContainer}>
        {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}
        <ActionButton
          label="Save Furniture"
          onPress={saveFurniture}
        />
      </View>

      {addQRCode}

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
      paddingBottom: 5,
    },
    inputRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      // gap: width * 0.01,
      width: '100%',
      paddingBottom: 20,
      alignItems: 'center'
    },
    textInput: {
      width: width * 0.43,
      borderRadius: 4,
      paddingLeft: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 40,
      backgroundColor: isDarkMode ? 'white' : 'black',
      color: isDarkMode ? '#000' : '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'arial',
    },
    buttonContainer: {
      width: gridSize[0],
    },
    notificationText: {
      position: 'absolute',
      top: 100,
      left: 0,
      right: 0,
      backgroundColor: isDarkMode ? 'rgba(255,255, 255, 0.7)' : 'rgba(0,0, 0, 0.7)',
      color: isDarkMode ? '#000' : '#fff',
      padding: 10,
      borderRadius: 5,
      marginBottom: 15,
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      zIndex: 1000,
    },
    colourSelected: {
      padding: 20,
      marginTop: 20,
      width: 50,
      height: 50,
      borderRadius: 30
    },
    pngContainer: {
      marginTop: 20,
      width: 200,
      borderColor: isDarkMode ? '#fff' : '#ddd',
      borderWidth: 1,
      height: 200 * 1.7,
      alignItems: 'center',
    },
    imageBody: {
      // width: 180,
      // height: 300,
      width: '100%',
      height: '100%',
    }

  });
