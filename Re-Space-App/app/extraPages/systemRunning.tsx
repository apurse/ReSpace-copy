import { View, Text, ScrollView, StyleSheet, Dimensions, PanResponder, TextInput, ImageBackground } from 'react-native';
import * as Icons from '../../components/indexComponents/Icons';
import { createDefaultStyles } from '@/components/defaultStyles';
import RobotList from '@/components/indexComponents/robotList';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { useTheme } from '../_layout';
import { useSocket } from "@/hooks/useSocket";
import ActionButton from "@/components/settingsComponents/actionButton";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Robot } from "@/components/models/Robot";
import { useRoom } from '@/hooks/useRoom';


// Get dimensions of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const progressBarSize = screenWidth * 0.8

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

  // -------- Grid Visuals --------
  const roomDimensionsM = [
    jsonData?.roomDimensions?.roomX ? jsonData?.roomDimensions?.roomX : 5,
    jsonData?.roomDimensions?.roomY ? jsonData?.roomDimensions?.roomY : 5,
  ];
  const gridWidth = roomDimensionsM[0];
  const gridHeight = roomDimensionsM[1];

  // Square metres of room
  const squareMetres = (gridWidth) * (gridHeight);

  const scale = Math.min(
    345 / roomDimensionsM[0],
    345 / roomDimensionsM[1]
  );

  const scaledRoomWidth = gridWidth * scale;
  const scaledRoomHeight = gridHeight * scale;


  // Local room json file
  const { layoutRunning } = useLocalSearchParams<{ layoutRunning: string }>();


  // Auto refresh page with saved furniture
  useFocusEffect(
    useCallback(() => {

      // Startup the robot
      if (isConnected) {
        // sendMessage({ type: "set_mode", config: "localisation" })
      } else {
        alert("No connection to the WebSocket.");
      }
    }, [])
  );

  useEffect(() => {

    /**
     * Check the progress of the box positions
     * @param boxes The array of current boxes
     * @param boxDestinations The array of box destinations
    */
    const checkProgress = (boxes: Box[], boxDestinations: Box[]) => {

      // For each box
      boxes.forEach((box: Box) => {

        // Get the end position
        const endPos = boxDestinations.find(end => end.id === box.id)

        // If the box has reached its destination, set the total progress
        if (box.x == endPos?.x && box.y == endPos?.y) {

          setTotalProgress(prev => prev + (progressBarSize / boxes.length))


          // Tick off the boxes ...
        }
      })
    }
    checkProgress(boxes, boxDestinations)
  }, [boxes, boxDestinations])



  // Update the box coordinates based on robot position
  useEffect(() => {

    console.log("robotData called yippeeeeeeee")

    // Get the old boxes 
    robotData.forEach((robot: Robot) => {

      // Get the furniture index within the JSON
      let boxIndex = boxes.findIndex((box: Box) => box.furnitureID === robot.carrying);

      // If found, set the values
      if (boxIndex != -1) {

        boxes[boxIndex].x = robot?.locationX;
        boxes[boxIndex].y = robot?.locationY;
        boxes[boxIndex].rotation = robot?.angle;
      }
    })

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
        setTotalProgress(totalProgress + (progressBarSize / boxes.length))
        setInputY(Number(thisBox?.y))
        setInputAngle(Number(thisBox?.rotation))
        console.log(`Box ${id} updated position: `, thisBox);
      }
    });

  return (
    <ScrollView
      contentContainerStyle={defaultStyles.body}
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

      <View
        ref={squareRef}
        style={uniqueStyles.grid}
        onLayout={(e) => {
          const { x, y, width, height } = e.nativeEvent.layout;
          console.log(`Square dimensions: ${width}x${height} at (${x}, ${y})`);
        }}
      >

        {/* Internal room container */}
        <View
          style={{
            width: scaledRoomWidth,
            height: scaledRoomHeight,
            backgroundColor: "rgba(255,255,255,0.5)",
            borderWidth: 2,
            borderColor: "#FF6347",
          }}
        >
          <ImageBackground source={{ uri: (`data:image/png;base64,${jsonData?.roomFiles?.png}`) }} resizeMode="contain" style={uniqueStyles.image} />

          {/* Display grey squares for end point */}
          {boxDestinations.map((box, index) => (
            <View
              key={`placed-${box.id}-${index}`}
              style={[
                uniqueStyles.robot,
                {
                  left: box.x * scale,
                  top: box.y * scale,
                  backgroundColor: "transparent",
                  borderWidth: 1,
                  width: box.width * scale,
                  height: box.length * scale,
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
                    left: box.x * scale,
                    top: box.y * scale,
                    backgroundColor: box.color,
                    borderWidth: isSelected ? 2 : 0,
                    borderColor: isSelected ? "yellow" : "transparent",
                    width: box.width * scale,
                    height: box.length * scale,
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
    </View>


      {/* Show coordinates */ }
  <View style={uniqueStyles.coordinatesContainer}>
    <Text style={uniqueStyles.coordinates}>X = {Math.round(inputX * 100) / 100}</Text>
    <Text style={uniqueStyles.coordinates}>Y = {Math.round(inputY * 100) / 100}</Text>
    <Text style={uniqueStyles.coordinates}>Angle = {Math.round(inputAngle * 100) / 100}</Text>
  </View>


  {/* Progress bar */ }
      <Text style={[defaultStyles.sectionTitle, { top: -35 }]}>Progress</Text>
      <View style={[uniqueStyles.progressBarContainer]}>
        <View style={[uniqueStyles.progressBar]} />
      </View>


  {/* Could have as permanent on the screen */ }
  <ActionButton
    label="Emergency Stop"
    icon={React.createElement(Icons.StopCircle)}
    style={uniqueStyles.stopContainer}
    onPress={() => {
      sendMessage({ type: "emergency_stop", direction: "stop" });
      // alert("stop called");
    }}
  />


  {/* Robots section */ }
      <Text style={defaultStyles.sectionTitle}>Connected Robots: {robotData.length}</Text>
      <RobotList />
    </ScrollView >
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
      top: -30,
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
      top: -40,
      borderRadius: 8,
      marginVertical: 10,
      borderColor: isDarkMode ? '#fff' : '#000',
      borderWidth: 2,
      width: 0.8 * screenWidth,
      height: 20,
      alignSelf: 'center',
    },
    progressBar: {
      height: '100%',
      width: totalProgress,
      maxWidth: 0.79 * screenWidth,
      backgroundColor: "#00838F",
      borderRadius: 8,
    },
    grid: {
      width: 350, // * scaleX once visuals are done
      height: 350, // * scaleY once visuals are done
      backgroundColor: '#D3D3D3',
      position: "relative",
      borderWidth: 2,
      borderColor: "#aaa",
      top: -40,
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
      top: 20,
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
    },
    image: {
      flex: 1,
      justifyContent: 'center',
    }
  });