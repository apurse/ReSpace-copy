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


export default function AddFurniture() {

  // Hooks and colours
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { isConnected, sendMessage, QRCode } = useSocket();
  const { user } = useAuth();
  const { jsonData, updateJsonData } = useRoom();

  // Form information
  const [furnitureName, setFurnitureName] = useState<string>('');
  const [furnitureID, setFurnitureID] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [heightF, setHeight] = useState<number>(0);
  const [widthF, setWidth] = useState<number>(0);
  const [length, setLength] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedColour, setSelectedColour] = useState<string>('#aabbcc');
  const [localQRCode, setLocalQRCode] = useState<string>('');

  // Background settings
  const [hasBeenCalled, setHasBeenCalled] = useState<Boolean>(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [updatedQR, setUpdatedQR] = useState(true);
  const [notifications, setnotifications] = useState<string | null>(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
  const [loadedFurnitureIndex, setLoadedFurnitureIndex] = useState<number>(-1);
  const [duplicateNumber, setDuplicateNumber] = useState<number>(0);


  // Get the selected furniture
  const { selectedFurniture } = useLocalSearchParams<{ selectedFurniture: string }>();


  // Refresh furniture on selected furniture change
  useEffect(() => {

    // If selected, load furniture
    if (selectedFurniture && !hasBeenCalled) {
      loadFurniture(selectedFurniture);
      setHasBeenCalled(true);
    }

    // If not, set furniture ID
    else {
      console.log("New furniture being added!")
      let id = uuid.v4().substring(0, 6)
      setFurnitureID(id);
    }
  }, [selectedFurniture]);


  // Let users edit the form after saving
  useEffect(() => {
    if (isSaved) {
      setIsSaved(false)
      loadFurniture(furnitureName)

    }
  }, [furnitureName, furnitureID, widthF, length, heightF, model, quantity, selectedColour])


  // Grab the new QR code once it's changed, only once
  useEffect(() => {
    if (QRCode && !updatedQR) {
      setUpdatedQR(true)
      setLocalQRCode(QRCode)
      saveFurniture()
    }
  }, [QRCode])


  /**
  * Load the furniture from the selected furniture in the library.
  * @param selectedFurniture String - The selected furniture title in the library
  */
  const loadFurniture = async (selectedFurniture: string) => {
    try {

      // Get the furniture index within the JSON
      let furnitureIndex = jsonData.users[user.username]?.furniture
        .findIndex((furniture: any) => furniture.name === selectedFurniture
        );


      // If no index is found
      if (furnitureIndex === -1) {
        console.warn("Furniture not found.");
        return;
      }

      // Get each box in the current furniture and add to array
      const thisFurniture = jsonData.users[user.username]?.furniture[furnitureIndex];

      // Set the form
      setFurnitureName(thisFurniture.name);
      setFurnitureID(thisFurniture.furnitureID);
      setModel(thisFurniture.model);
      setHeight(thisFurniture.height);
      setWidth(thisFurniture.width);
      setLength(thisFurniture.length);
      setQuantity(thisFurniture.quantity);
      setSelectedColour(thisFurniture.selectedColour);
      setLocalQRCode(thisFurniture.qrcode);


      // Set the index and downloaded state
      setLoadedFurnitureIndex(furnitureIndex)
      setIsDownloaded(false);


    } catch (err) {
      console.error("Error loading furniture:", err);
    }
  };


  /**
  * Delete the selected furniture from the room JSON.
  */
  const deleteFurniture = async () => {
    try {

      // Get the furniture index within the JSON
      let furnitureIndex = jsonData.users[user.username]?.furniture
        .findIndex((furniture: any) => furniture.name === furnitureName);

      // Remove the furniture
      jsonData.users[user.username].furniture.splice(furnitureIndex, 1);

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

      setIsDownloaded(true);

    } catch (error) {
      alert("Error downloading QR image! Please check the provided permissions.")
    }
  }


  /**
   * Get the newQR code from the communication hub.
   */
  const getNewQR = async () => {


    // Prepare the furniture Data
    await prepFurniture()


    // Ensure the button changes and allow for updating the qrcode
    setIsSaved(true)
    setUpdatedQR(false)


    // Set the filtered furniture
    const filteredFurniture = {
      furnitureID: furnitureID,
      name: furnitureName,
      model: model,
    }

    try {

      // Send furniture across to server to get qr
      if (isConnected) {
        sendMessage({ type: "new_furniture", data: filteredFurniture });
      } else {
        alert("No connection to the WebSocket.");
      }
    }

    catch (error) {
      console.error('Failed to update/save data to json file:', error);

      // Show notifications of failure for 3 seconds
      setnotifications('Failed to add new furniture.')
      setTimeout(() => setnotifications(null), 3000);
    }
  };


  /**
   * Check the data provided is correct.
   */
  const prepFurniture = async () => {

    if (!furnitureName || !heightF || !widthF || !length) {

      // Show notification to fill in the fields for 3 seconds
      setnotifications('Please fill the necessary fields (Marked with \'*\')');
      setTimeout(() => setnotifications(null), 3000);

      return;
    }


    // If this is a new furniture
    if (loadedFurnitureIndex == -1) {


      // Check that the provided name is unique
      var nameUsed = false;
      jsonData.users[user.username]?.furniture?.forEach((furniture: { name: string }) => {
        nameUsed = (furniture.name == furnitureName) ? true : false;
      })


      // If its not unique, make a newName with (x) on afterwards 
      if (nameUsed) {
        setDuplicateNumber(duplicateNumber + 1);
        setFurnitureName(`${furnitureName}_(${duplicateNumber})`)
      }
    }
  }


  /**
   * Save the new furniture to the furniture JSON.
   */
  const saveFurniture = async () => {

    const newFurniture = {
      furnitureID: furnitureID,
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
        jsonData.users[user.username].furniture[loadedFurnitureIndex] = newFurniture;
      } else {
        jsonData.users[user.username].furniture.push(newFurniture);
      }

      // Update the data in the provider
      updateJsonData(jsonData)

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
            onChangeText={setFurnitureName}
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
          <Text style={uniqueStyles.inputHeader}>Height (mm)</Text>
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
          <Text style={uniqueStyles.inputHeader}>Width (mm)</Text>
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
          <Text style={uniqueStyles.inputHeader}>Length (mm)</Text>
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
                  onPress={getNewQR}
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


      {localQRCode != '' &&

        <View style={{ alignItems: 'center' }}>
          {/* QR generation */}
          <View style={uniqueStyles.pngContainer}>
            <Image
              style={uniqueStyles.imageBody}
              source={{ uri: (`data:image/png;base64,${localQRCode}`) }} />
          </View>

          {/* Download button */}
          {!isDownloaded ?
            <View style={uniqueStyles.buttonContainer}>
              {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}
              <ActionButton
                label="Download QR Code"
                onPress={() => downloadQR(`data:image/png;base64,${localQRCode}`)}
              />
            </View>
            :
            <View style={uniqueStyles.buttonContainer}>
              {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}
              <ActionButton
                label="QR Downloaded!"
                onPress={() => downloadQR(`data:image/png;base64,${localQRCode}`)}
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
