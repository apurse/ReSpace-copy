import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable, PanResponder, TextInput } from 'react-native';
import * as Icons from '../../components/indexComponents/Icons';
import { createDefaultStyles } from '@/components/defaultStyles';
import RobotList from '@/components/indexComponents/robotList';
import React, { useEffect, useRef, useState } from 'react';
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { useTheme } from '../_layout';
import { useSocket } from "@/hooks/useSocket";
import ActionButton from "@/components/settingsComponents/actionButton";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import * as FileSystem from 'expo-file-system';



// Get dimensions of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


// Local json file with layout data
const layoutJson = FileSystem.documentDirectory + 'layouts.json';


// -------- Grid Visuals --------
const roomDimensionsMM = [1200, 1200];
const gridWidth = roomDimensionsMM[0];
const gridHeight = roomDimensionsMM[1];

// const initialZoom = 0.5;
const viewGridWidth = 350;
const viewGridHeigh = 350;
// Dynamically calculate the initial zoom level based on the room size and screen size
const initialZoom = Math.min((viewGridWidth + 150) / gridWidth, (viewGridHeigh + 150) / gridHeight);

// Calculate the initial offsets to center the room in the grid
const initialOffsetX = -(screenWidth - gridWidth * initialZoom) - 350 / 2;
const initialOffsetY = (screenHeight - gridHeight * initialZoom) - 800 / 2;

// Boxes in the grid
const allBoxes = [
  { id: 1, x: 0, y: 0, width: 70, length: 30, color: 'red', rotation: 0.0 },
  { id: 2, x: 150, y: 150, width: 50, length: 150, color: 'green', rotation: 0.0 },
  { id: 3, x: 100, y: 100, width: 50, length: 30, color: 'blue', rotation: 0.0 },
];

export default function systemRunning() {

  // Define 'Box' to store in 'currentPos'  
  type Box = {
    id: number;
    x: Float;
    y: Float;
    width: number;
    length: number;
    color: string;
    rotation: Float;
  };


  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { socket, isConnected, robotData, sendMessage } = useSocket();
  const { loggedIn, user, setUser } = useAuth();


  // Back-end settings
  const [notifications, setnotifications] = useState<string | null>(null); // Notifications
  const [hasBeenCalled, setHasBeenCalled] = useState<Boolean>(false);

  // Box positions
  const [inputX, setInputX] = useState(''); // Value of input box of 'x' coordinate
  const [inputY, setInputY] = useState(''); // Value of input box of 'y' coordinate
  const [inputAngle, setInputAngle] = useState(''); // Value of angle of the rotation furniture
  const [boxes, setBoxes] = useState(allBoxes); // set boxes array
  const [placedBoxes, setPlacedBoxes] = useState<Box[]>([]); // Placed boxes of current layout
  const [selectedBox, setSelectedBox] = useState<number | null>(null); //Track active box for highlight feature

  // User settings
  const [layoutName, setlayoutName] = useState<string | undefined>();
  const [zoomLevel, setZoomLevel] = useState(initialZoom); // Check zoom level


  const squareRef = useRef(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  if (!isConnected) {
    console.warn("WebSocket not connected!");
    return;
  }

  // Get the selected layout from the library
  const selectedLayout = useLocalSearchParams();

  /**
  * Load the layout from the selected layout in the library.
  * @param selectedLayout String - The selected layout title in the library
  */
  const loadLayout = async (selectedLayout: string) => {

    // Set the title
    setlayoutName(selectedLayout)


    // Read the data from JSON
    const readData = await FileSystem.readAsStringAsync(layoutJson);
    const jsonData = JSON.parse(readData);


    // Get the layout index within the JSON
    let layoutIndex = jsonData[user.username]?.layouts
      .findIndex((layout: any) => layout.name === selectedLayout);


    // Get each box in the current layout and add to array
    var newBoxes: Box[] = [];
    jsonData[user.username]?.layouts[layoutIndex].newLayout.boxes
      .forEach((box: Box) => {
        newBoxes.push(box);
      })


    // Set all the boxes
    setBoxes(newBoxes)
  };


  // Refresh layout on selected layout change
  useEffect(() => {
    if (!hasBeenCalled) {

      // Convert from object of elements to string
      var currentTitle = "";
      for (const [key, value] of Object.entries(selectedLayout)) {
        currentTitle += value;
      }
      console.log(currentTitle);

      loadLayout(currentTitle)
      setHasBeenCalled(true)
    }

  }, [selectedLayout]);


  const createPanResponder = (id: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSelectedBox(id); // Selected box to highlighted
        var thisBox = boxes.find((box) => box.id === id)
        setInputX(String(thisBox?.x))
        setInputY(String(thisBox?.y))
        setInputAngle(String(thisBox?.rotation))
        console.log(
          `Box ${id} updated position: `,
          thisBox,
          console.log(selectedBox)
        );
      }
    });

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Title */}
      <TextInput
        value={layoutName}
        onChangeText={setlayoutName}
        style={uniqueStyles.title}
        placeholder='*New Layout ...'
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />

      {/* <Text style={defaultStyles.pageTitle}>Add Layout</Text> */}
      <Text style={uniqueStyles.zoomStyle}>Zoom: {zoomLevel.toFixed(2)}</Text>


      {/* Grid */}
      <View
        ref={squareRef}
        style={uniqueStyles.grid}
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          console.log(`Square dimensions: ${width}x${height} at (${x}, ${y})`);
        }}
      >
        <ReactNativeZoomableView
          initialOffsetX={initialOffsetX}
          initialOffsetY={initialOffsetY}
          maxZoom={10}
          minZoom={0.1}
          initialZoom={initialZoom}
          bindToBorders={false}
          pinchToZoomInSensitivity={6}
          pinchToZoomOutSensitivity={4}
          panEnabled={true}
          movementSensibility={1}

          // Set zoom center to user's gesture position (not resetting to center)
          onZoomAfter={(event: any, setGestureState: any, zoomableViewEventObject: any) => {
            setZoomLevel(zoomableViewEventObject.zoomLevel);

            // Calculate the new offsets based on the zoom level
            const zoomLevel = zoomableViewEventObject.zoomLevel;

            // Get the current zoom position 
            const gestureCenterX = zoomableViewEventObject.offsetX;
            const gestureCenterY = zoomableViewEventObject.offsetY;

            // Adjust the offsets 
            const newOffsetX = gestureCenterX - (gestureCenterX - offsetX) * zoomLevel;
            const newOffsetY = gestureCenterY - (gestureCenterY - offsetY) * zoomLevel;

            // Apply the new offsets 
            setOffsetX(newOffsetX);
            setOffsetY(newOffsetY);
          }}
        >
          {/* Internal room container */}
          <View
            style={{
              position: "absolute",
              left: offsetX,
              top: offsetY,
              width: roomDimensionsMM[0] * zoomLevel,
              height: roomDimensionsMM[1] * zoomLevel,
              backgroundColor: "rgba(255,255,255,0.5)",
              borderWidth: 3,
              borderColor: "red",
            }}
          >
            {/* Display grey squares for origin point (optional) */}
            {placedBoxes.map((box, index) => (
              <View
                key={`placed-${box.id}-${index}`}
                style={[
                  uniqueStyles.robot,
                  {
                    left: box.x * zoomLevel,
                    top: box.y * zoomLevel,
                    backgroundColor: "transparent",
                    borderWidth: 1,
                    width: box.width * zoomLevel,
                    height: box.length * zoomLevel,
                    transform: [{ rotate: `${box.rotation}deg` }],
                  },
                ]}
              >
                <Text style={[uniqueStyles.boxText, { color: "gray" }]}>{box.id}</Text>
              </View>
            ))}

            {/* Display furniture */}
            {boxes.map((box, index) => {
              const panResponder = createPanResponder(box.id);
              const isSelected = selectedBox === box.id;

              return (
                <View
                  key={`${box.id}-${index}`}
                  style={[
                    uniqueStyles.robot,
                    {
                      left: box.x * zoomLevel,
                      top: box.y * zoomLevel,
                      backgroundColor: box.color,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? "yellow" : "transparent",
                      width: box.width * zoomLevel,
                      height: box.length * zoomLevel,
                      transform: [{ rotate: `${box.rotation}deg` }],
                    },
                  ]}
                  {...panResponder.panHandlers}
                >
                  <Text style={uniqueStyles.boxText}>{box.id}</Text>
                </View>
              );
            })}
          </View>
        </ReactNativeZoomableView>
      </View>

      {/* Show coordinates */}
      <View style={uniqueStyles.coordinatesContainer}>
        <Text style={uniqueStyles.coordinates}>X = {inputX}</Text>
        <Text style={uniqueStyles.coordinates}>Y = {inputY}</Text>
        <Text style={uniqueStyles.coordinates}>Angle = {inputAngle}</Text>
      </View>


      <View style={[uniqueStyles.progressBar]}>
        <Text>Progress bar</Text>
      </View>

      <ActionButton
        label="Emergency Stop"
        icon={React.createElement(Icons.StopCircle)}
        style={uniqueStyles.stopContainer}
        onPress={() => {
          sendMessage({ type: "emergency_stop", direction: "stop" });
          alert("stop called");
        }}
      />

      {/* Robots section */}
      {/* <Text style={defaultStyles.sectionTitle}>Connected Robots: {robotData.length}</Text> */}
      <RobotList />
    </ScrollView>
  );
}

// styles unique to this page go here
const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    title: {
      fontSize: 30,
      color: isDarkMode ? '#fff' : '#000',
      textAlign: 'center',
      top: -45,
    },
    stopContainer: {
      backgroundColor: "red",
      // padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      // marginBottom: 24,
      // marginTop: 25,
      borderColor: isDarkMode ? '#fff' : '#000',
      // borderWidth: 0.5,
      width: '100%',
      height: 120,
      alignSelf: 'center',
      fontSize: 200,
    },
    progressBar: {
      backgroundColor: "blue",
      // padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      // marginBottom: 24,
      // marginTop: 25,
      marginVertical: 10,
      borderColor: isDarkMode ? '#fff' : '#000',
      borderWidth: 0.5,
      width: 0.8 * screenWidth,
      height: 20,
      alignSelf: 'center',
    },
    grid: {
      width: viewGridWidth, // * scaleX once visuals are done
      height: viewGridHeigh, // * scaleY once visuals are done
      backgroundColor: '#D3D3D3',
      position: "relative",
      borderWidth: 2,
      borderColor: "#aaa",
      top: -50,
    },
    robot: {
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: 4,
      backgroundColor: '#964B00',
    },
    boxText: {
      color: "#fff",
      fontWeight: "bold",
    },
    coordinates: {
      fontSize: 12,
      color: isDarkMode ? '#fff' : '#000',
      textAlign: 'center',
      top: 10,
      letterSpacing: 2,
    },
    zoomStyle: {
      position: 'absolute',
      fontSize: 12,
      color: isDarkMode ? '#fff' : '#000',
      top: 30,
      left: 35,
    },
    textInput: {
      color: isDarkMode ? '#fff' : '#000',
      paddingBottom: 0,
      paddingTop: 0,
      top: 10,
    },
    coordinatesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      position: 'absolute',
      top: 400,
      left: '15%',
    }
  });