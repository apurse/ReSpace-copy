import { View, Text, ScrollView, StyleSheet, Dimensions, PanResponder, TextInput } from 'react-native';
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
import { Robot } from "@/components/models/Robot";
import { useRoom } from '@/hooks/useRoom';


// Get dimensions of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


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

export default function systemRunning() {

  // Define 'Box' to store in 'currentPos'  
  type Box = {
    furnitureID: string;
    id: number;
    x: Float;
    y: Float;
    width: number;
    length: number;
    color: string;
    rotation: Float;
  };


  // Hooks and colours
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const { isConnected, robotData, sendMessage } = useSocket();
  const { user } = useAuth();
  const { roomName, jsonData, updateJsonData } = useRoom();

  // Back-end settings
  const [hasBeenCalled, setHasBeenCalled] = useState<Boolean>(false);
  const squareRef = useRef(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  // Box positions
  const [inputX, setInputX] = useState<Float>(0);
  const [inputY, setInputY] = useState<Float>(0);
  const [inputAngle, setInputAngle] = useState<Float>(0);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [boxDestinations, setBoxDestinations] = useState<Box[]>([]);
  const [selectedBox, setSelectedBox] = useState<number | null>(null);
  const [totalProgress, setTotalProgress] = useState<Float>(0);
  const uniqueStyles = createUniqueStyles(isDarkMode, totalProgress);

  // User settings
  const [layoutName, setlayoutName] = useState<string | undefined>();
  const [zoomLevel, setZoomLevel] = useState(initialZoom);


  // Local room json file
  const { layoutRunning } = useLocalSearchParams<{ layoutRunning: string }>();


  if (!isConnected) {
    console.warn("WebSocket not connected!");
    return;
  }

  // Update the box coordinates based on robot position
  useEffect(() => {

    // Get the old boxes 
    robotData.forEach((robot: Robot) => {

      // Get the furniture index within the JSON
      let boxIndex = boxes.findIndex((box: Box) => box.furnitureID === robot.carrying);

      // If found, set the values
      if (boxIndex != -1) {

        boxes[boxIndex].x = robot?.locationX;
        boxes[boxIndex].y = robot?.locationY;
        boxes[boxIndex].rotation = robot?.angle;


        // calculate error margin
        // if within 2cm eg

        if (boxes[boxIndex] == boxDestinations[boxIndex]) {

          // Set new progress
          var newProgress = totalProgress + (1 / boxes.length)
          setTotalProgress(newProgress)
        }
      }
    }
    )

    setBoxes(boxes)
  }, [robotData])


  /**
  * Load the layout from the selected layout in the library.
  * @param selectedLayout String - The selected layout title in the library
  */
  const loadLayout = async (selectedLayout: string) => {


    // Set the title
    setlayoutName(selectedLayout)


    // Get the layout index within the JSON
    let layoutIndex = jsonData.users[user.username]?.layouts
      .findIndex((layout: any) => layout.name === selectedLayout);


    // Set the current position of each box
    var newBoxes: Box[] = [];
    jsonData.users[user.username]?.layouts[layoutIndex].currentLayout.boxes
      .forEach((box: Box) => {
        newBoxes.push(box);
      })


    // Set the destinations as the grey boxes
    var destinations: Box[] = [];
    jsonData.users[user.username]?.layouts[layoutIndex].newLayout.boxes
      .forEach((box: Box) => {
        destinations.push(box);
      })


    // Set all the boxes
    setBoxes(newBoxes)
    setBoxDestinations(destinations)
  };

  // for each box, destination - current pos, could save into array?
  // overall progress - if position = destination, progress (bar width) = (boxes done) / total boxes


  // Refresh layout on selected layout change
  useEffect(() => {

    console.log("selectedLayout: ", layoutRunning)
    console.log("roomName: ", roomName)
    if (!hasBeenCalled) {

      try {
        if (layoutRunning) {
          loadLayout(layoutRunning)
          setHasBeenCalled(true)
        }
      } catch (error) {
        console.error(error)
      }
    }

  }, [layoutRunning]);


  /**
   * Manage the box interactions, only on click here.
   * @param id The box id
   */
  const createPanResponder = (id: number) =>
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setSelectedBox(id); // Selected box to highlighted
        var thisBox = boxes.find((box) => box.id === id)
        setInputX(Number(thisBox?.x))
        setInputY(Number(thisBox?.y))
        setInputAngle(Number(thisBox?.rotation))
        console.log(`Box ${id} updated position: `, thisBox);
      }
    });

  return (
    <ScrollView
      contentContainerStyle={defaultStyles.body}
    // stickyHeaderIndices={[0]}
    // showsVerticalScrollIndicator={false}
    >


      {/* Title */}
      <TextInput
        value={layoutName}
        onChangeText={setlayoutName}
        style={uniqueStyles.title}
        placeholder='*New Layout ...'
        placeholderTextColor={isDarkMode ? '#fff' : '#000'}
      />


      {/* Grid */}
      <Text style={uniqueStyles.zoomStyle}>Zoom: {zoomLevel.toFixed(2)}</Text>
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

            {/* Display grey squares for end point */}
            {boxDestinations.map((box, index) => (
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
                <Text style={[uniqueStyles.boxText, { color: "gray" }]}>{box.furnitureID}</Text>
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
                  <Text style={uniqueStyles.boxText}>{box.furnitureID}</Text>
                </View>
              );
            })}
          </View>
        </ReactNativeZoomableView>
      </View>


      {/* Show coordinates */}
      <View style={uniqueStyles.coordinatesContainer}>
        <Text style={uniqueStyles.coordinates}>X = {Math.round(inputX * 100) / 100}</Text>
        <Text style={uniqueStyles.coordinates}>Y = {Math.round(inputY * 100) / 100}</Text>
        <Text style={uniqueStyles.coordinates}>Angle = {Math.round(inputAngle * 100) / 100}</Text>
      </View>


      {/* Progress bar */}
      <View style={[uniqueStyles.progressBarContainer]}>
        <Text>Progress bar</Text>
        <View style={[uniqueStyles.progressBar]} />
      </View>


      {/* Could have as permanent on the screen */}
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
      <Text style={defaultStyles.sectionTitle}>Connected Robots: {robotData.length}</Text>
      <RobotList />
    </ScrollView>
  );
}

// styles unique to this page go here
const createUniqueStyles = (isDarkMode: boolean, totalProgress: number) =>
  StyleSheet.create({
    title: {
      fontSize: 30,
      color: isDarkMode ? '#fff' : '#000',
      textAlign: 'center',
      top: -45,
    },
    stopContainer: {
      backgroundColor: "red",
      borderRadius: 8,
      alignItems: 'center',
      borderColor: isDarkMode ? '#fff' : '#000',
      width: '100%',
      height: 120,
      alignSelf: 'center',
      fontSize: 200,
    },
    progressBarContainer: {
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 10,
      borderColor: isDarkMode ? '#fff' : '#000',
      borderWidth: 0.5,
      width: 0.8 * screenWidth,
      height: 20,
      alignSelf: 'center',
    },
    progressBar: {
      height: '100%',
      width: totalProgress,
      backgroundColor: "blue",
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
      gap: 20, // make consistent
    }
  });