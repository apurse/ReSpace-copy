import { View, ScrollView, StyleSheet, Text, Dimensions, TextInput, Image } from 'react-native';
import { useEffect, useState } from 'react';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '@/app/_layout';
import ActionButton from '@/components/settingsComponents/actionButton';
import * as FileSystem from 'expo-file-system';
import { ColourPickerModal } from '@/components/LayoutComponents/colourPickerModal';
import { useSocket } from "@/hooks/useSocket";
import * as MediaLibrary from 'expo-media-library';
import uuid from 'react-native-uuid';
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useRoom } from '@/hooks/useRoom';


//  Get dimensions of the screen
const { width, height } = Dimensions.get('window');


export default function AddLayout() {

  // Hooks and theme
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { isConnected, sendMessage, QRCode } = useSocket();
  const { user } = useAuth();
  const { jsonData, updateJsonData } = useRoom();

  // Form information
  const [furnitureName, setName] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [heightF, setHeight] = useState<number>(0);
  const [widthF, setWidth] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedColour, setSelectedColour] = useState<string>('#aabbcc');
  const [QRData, setQRData] = useState<string>('');

  // Background settings
  const [hasBeenCalled, setHasBeenCalled] = useState<Boolean>(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [updatedQR, setUpdatedQR] = useState(true);
  const [notifications, setnotifications] = useState<string | null>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [loadedFurnitureIndex, setLoadedFurnitureIndex] = useState<number>(-1); // Check if the layout has been saved
  const [duplicateNumber, setDuplicateNumber] = useState<number>(0); // Check if the layout has been saved

  // Get the selected furniture
  const { selectedFurniture } = useLocalSearchParams<{ selectedFurniture: string }>();


  // Refresh layout on selected layout change
  useEffect(() => {
    if (!hasBeenCalled) {
      loadFurniture(selectedFurniture);
      setHasBeenCalled(true);
    }
  }, [selectedFurniture]);


  // Grab the new QR code once it's changed, only once
  useEffect(() => {
    if (QRCode && !updatedQR) {
      setUpdatedQR(true)
      setQRData(QRCode)
    }
  }, [QRCode, updatedQR])


  /**
  * Load the layout from the selected layout in the library.
  * @param selectedFurniture String - The selected layout title in the library
  */
  const loadFurniture = async (selectedFurniture: string) => {
    try {

      // Get the layout index within the JSON
      let furnitureIndex = jsonData[user.username]?.furniture
        .findIndex((furniture: any) => furniture.name === selectedFurniture
        );


      // If no index is found
      if (furnitureIndex === -1) {
        console.warn("Furniture not found.");
        return;
      }

      // Get each box in the current layout and add to array
      const thisFurniture = jsonData[user.username]?.furniture[furnitureIndex];

      // Set the form
      setName(thisFurniture.name);
      setModel(thisFurniture.model);
      setHeight(thisFurniture.height);
      setWidth(thisFurniture.width);
      setLength(thisFurniture.length);
      setQuantity(thisFurniture.quantity);
      setSelectedColour(thisFurniture.selectedColour);
      setQRData(thisFurniture.qrcode);


      // Set the index and downloaded state
      setLoadedFurnitureIndex(furnitureIndex)
      setIsDownloaded(false);


    } catch (err) {
      console.error("Error loading layout:", err);
    }
  };


  /**
  * Delete the selected furniture from the room JSON.
  */
  const deleteFurniture = async () => {
    try {

      // Get the layout index within the JSON
      let layoutIndex = jsonData[user.username]?.furniture
        .findIndex((furniture: any) => furniture.name === furnitureName);

      // Remove the layout
      jsonData[user.username].furniture.splice(layoutIndex, 1);

      // Write the new data 
      updateJsonData(jsonData)

    } catch (error) {
      console.error('Error deleting json data');
    }
  };


  /**
   * Download the Furniture QR code to the device.
   * @param image The base64 image string
   */
  const downloadQR = async (image: string) => {

    try {


      // Get permissions
      await requestPermission();


      // Convert base64 into a png with a file name
      const base64Code = image.split("data:image/png;base64,")[1];
      const newImage = FileSystem.documentDirectory + `${furnitureName}_${quantity}_QR_Code.png`;
      await FileSystem.writeAsStringAsync(newImage, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });


      // Save to camera roll and alert user
      MediaLibrary.saveToLibraryAsync(newImage)
        .then(() => alert('Photo added to camera roll!'))
        .catch(err => console.log('err:', err))


      // Reset form
      setName('');
      setModel('');
      setHeight(0);
      setWidth(0);
      setLength(0);
      setQuantity(0);
      setSelectedColour('#aabbcc');
      setQRData('');

      setIsDownloaded(true);

    } catch (error) {
      alert("Error downloading QR image! Please check the provided permissions.")
    }
  }


  /**
   * Save the new furniture to the furniture JSON.
   * @returns 
   */
  const saveFurniture = async () => {

    if (!furnitureName || !heightF || !widthF || !length) {

      // Show notification to fill in the fields for 3 seconds
      setnotifications('Please fill the necessary fields (Marked with \'*\')');
      setTimeout(() => setnotifications(null), 3000);

      return;
    }

    // Ensure the button changes and allow for updating the qrcode
    setIsSaved(true)
    setUpdatedQR(false)

    var nameUsed = false;
    var newName = furnitureName;

    // If this is a new layout
    if (loadedFurnitureIndex == -1) {


      // Check that the provided name is unique
      jsonData[user.username]?.furniture?.forEach((furniture: { name: string }) => {
        nameUsed = (furniture.name == furnitureName) ? true : false;
      })


      // If its not unique, make a newName with (x) on afterwards 
      if (nameUsed) {
        setDuplicateNumber(duplicateNumber + 1);
        newName = (`${furnitureName}_(${duplicateNumber})`)
      }
    }

    // Make furniture ID
    let generatedID = uuid.v4().substring(0, 5); // could duplicate itself, maybe add check

    const newFurniture = {
      furnitureID: generatedID,
      favourited: false,
      name: furnitureName,
      model: model,
      height: heightF,
      width: widthF,
      length: length,
      quantity: quantity,
      selectedColour: selectedColour,
      qrcode: QRCode
    };

    try {


      // Either overwrite or add the jsonData
      if (loadedFurnitureIndex !== -1) {
        jsonData[user.username].furniture[loadedFurnitureIndex] = newFurniture;
      } else {
        jsonData[user.username].furniture.push(newFurniture);
      }


      // Update the data in the provider
      updateJsonData(jsonData)


      // Send furniture across to server
      if (isConnected) {
        sendMessage({ type: "new_furniture", data: newFurniture });
      } else {
        alert("No connection to the WebSocket.");
      }

      // Show success notification for 3 seconds
      setnotifications('New furniture added sucessfully');
      setTimeout(() => setnotifications(null), 3000);
    }

    catch (error) {
      console.error('Failed to update/save data to json file:', error);

      // Show notifications of failure for 3 seconds
      setnotifications('Failed to add new furniture.')
      setTimeout(() => setnotifications(null), 3000);
    }
  };


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
            value={furnitureName}
            onChangeText={setName}
            style={uniqueStyles.textInput}
            placeholder='*Enter name...*'
            placeholderTextColor={isDarkMode ? '#000' : '#fff'}
          />
        </View>
        <View style={uniqueStyles.inputField}>
          <Text style={uniqueStyles.inputHeader}>Model</Text>
          <TextInput
            value={model}
            onChangeText={setModel}
            style={uniqueStyles.textInput}
            placeholder='Enter model type...'
            placeholderTextColor={isDarkMode ? '#000' : '#fff'}
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
            placeholderTextColor={isDarkMode ? '#000' : '#fff'}
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
            placeholderTextColor={isDarkMode ? '#000' : '#fff'}
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
            placeholderTextColor={isDarkMode ? '#000' : '#fff'}
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
            placeholderTextColor={isDarkMode ? '#000' : '#fff'}
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

      {isConnected ?
        (
          (!isSaved ?
            (
              <View style={uniqueStyles.buttonContainer}>
                {/* {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>} */}
                <ActionButton
                  label="Save Furniture"
                  onPress={saveFurniture}
                />
              </View>
            )
            :
            (
              <View style={uniqueStyles.buttonContainer}>
                {/* {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>} */}
                <ActionButton
                  label="Furniture Saved!"
                  onPress={() => console.log("filler")}
                  style={{ backgroundColor: 'grey' }}
                />
              </View>
            )
          )
        )
        :
        (
          <View style={uniqueStyles.buttonContainer}>
            {/* {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>} */}
            <ActionButton
              label="Connect to the websocket server"
              onPress={() => alert("Please connect to the websocket server!")}
              style={{ backgroundColor: '#00838F' }}
            />
          </View>
        )
      }

      {loadedFurnitureIndex != -1 &&
        <View style={uniqueStyles.buttonContainer}>
          <ActionButton
            label="Delete Furniture"
            onPress={async () => {
              await deleteFurniture()
              router.back();
            }}
            style={{ backgroundColor: '#C62828' }}
          />
        </View>

      }


      {QRData != '' &&

        <View style={{ alignItems: 'center' }}>
          {/* QR generation */}
          <View style={uniqueStyles.pngContainer}>
            <Image
              style={uniqueStyles.imageBody}
              source={{ uri: (`data:image/png;base64,${QRCode}`) }} />
          </View>

          {/* Download button */}
          {!isDownloaded ?
            <View style={uniqueStyles.buttonContainer}>
              {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}
              <ActionButton
                label="Download QR Code"
                onPress={() => downloadQR(`data:image/png;base64,${QRCode}`)}
              />
            </View>
            :
            <View style={uniqueStyles.buttonContainer}>
              {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}
              <ActionButton
                label="QR Downloaded!"
                onPress={() => downloadQR(`data:image/png;base64,${QRCode}`)}
                style={{ backgroundColor: 'grey' }}
              />
            </View>
          }
        </View>
      }

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
      backgroundColor: isDarkMode ? 'white' : '#242424',
      color: isDarkMode ? '#000' : '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'arial',
    },
    buttonContainer: {
      width: width * 0.8,
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
      height: 200 * 1.8,
      alignItems: 'center',
    },
    imageBody: {
      // width: 180,
      // height: 300,
      width: '100%',
      height: '100%',
    }

  });
