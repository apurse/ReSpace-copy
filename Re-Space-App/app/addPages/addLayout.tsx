import React, { useState, useRef, useEffect } from "react";
import { View, Text, PanResponder, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useTheme } from "@/app/_layout";
import { createDefaultStyles } from "@/components/defaultStyles";
import ActionButton from "@/components/settingsComponents/actionButton";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { useSocket } from "@/hooks/useSocket";
import FurnitureModal from "@/components/LayoutComponents/furnitureModal";
import { FurnitureItem } from "@/components/LayoutComponents/furnitureModal";
import Icon from 'react-native-vector-icons/FontAwesome';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { Link, router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import { useAuth } from "@/hooks/useAuth";
import { useLocalSearchParams } from "expo-router";


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
    { furnitureID: '111', id: 1, x: 0, y: 0, width: 70, length: 30, color: 'red', rotation: 0.0 },
    { furnitureID: '222', id: 2, x: 150, y: 150, width: 50, length: 150, color: 'green', rotation: 0.0 },
    { furnitureID: '333', id: 3, x: 100, y: 100, width: 50, length: 30, color: 'blue', rotation: 0.0 },
];

export default function DragAndDrop() {

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

    // Hooks
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);
    const { sendMessage, isConnected } = useSocket();
    const { loggedIn, user, setUser } = useAuth();

    // Back-end settings
    const [hasBeenCalled, setHasBeenCalled] = useState<Boolean>(false);
    const [notifications, setnotifications] = useState<string | null>(null); // Notifications
    const [isModalVisible, setModalVisible] = useState(false); // State of furniture modal (to add furniture)
    const [isCurrentLayoutSet, setIsCurrentLayoutSet] = useState(false); // Check if the current layout is set or not
    const [isSaved, setIsSaved] = useState(false); // Check if the layout has been saved
    const [loadedLayoutIndex, setLoadedLayoutIndex] = useState<number>(-1); // Check if the layout has been saved
    const [duplicateNumber, setDuplicateNumber] = useState<number>(0); // Check if the layout has been saved

    // Box positions
    const [inputX, setInputX] = useState(''); // Value of input box of 'x' coordinate
    const [inputY, setInputY] = useState(''); // Value of input box of 'y' coordinate
    const [inputAngle, setInputAngle] = useState(''); // Value of angle of the rotation furniture
    const [boxes, setBoxes] = useState(allBoxes); // set boxes array
    const boxesFormatted = boxes.map(({ id, x, y, rotation }) => ({ id, x, y, rotation })); // Formatted boxes data
    const [placedBoxes, setPlacedBoxes] = useState<Box[]>([]); // Placed boxes of current layout
    const [selectedBox, setSelectedBox] = useState<number | null>(null); //Track active box for highlight feature

    // User settings
    const [rotationInterval, setRotationInterval] = useState<NodeJS.Timeout | null>(null); // Track rotation interval
    const [currentSpeed, setCurrentSpeed] = useState<number>(50); // Initial rotation speed
    const [layoutName, setlayoutName] = useState<string | undefined>();
    const [zoomLevel, setZoomLevel] = useState(initialZoom); // Check zoom level



    const squareRef = useRef(null);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);


    // Get the selected layout from the library
    const selectedLayout = useLocalSearchParams();


    // Refresh layout on selected layout change
    useEffect(() => {

        // Check selectedLayout isn't empty and has not been called
        if (Object.keys(selectedLayout).length > 0 && !hasBeenCalled) {


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


    /**
     * Load the layout from the selected layout in the library.
     * @param selectedLayout String - The selected layout title in the library
     */
    const loadLayout = async (selectedLayout: string) => {

        console.log("loadlayout called")

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


        // Set all the boxes and the layout number
        setBoxes(newBoxes)
        setLoadedLayoutIndex(layoutIndex)
    };


    /**
     * Call function to clear the layout json entry from this device
     */
    const deleteLayout = async () => {
        try {

            // Read the data from JSON
            const readData = await FileSystem.readAsStringAsync(layoutJson);
            const jsonData = JSON.parse(readData);

            // Get the layout index within the JSON
            let layoutIndex = jsonData[user.username]?.layouts
                .findIndex((layout: any) => layout.name === layoutName);

            // Remove the layout
            jsonData[user.username].layouts.splice(layoutIndex, 1);

            // Write the new data 
            await FileSystem.writeAsStringAsync(layoutJson, JSON.stringify(jsonData));
            console.log('Data has been cleared');

        } catch (error) {
            console.error('Error deleting json data');
        }

        setlayoutName('');
    };

    /**
     * Save the layout to a local JSON on the device.
     * @param oldLayoutBoxes The current layout of the furniture.
     * @param newLayoutBoxes The desired layout of the furniture.
     */
    const saveLayout = async (oldLayoutBoxes: Box[], newLayoutBoxes: Box[]) => {

        // temp until rooms have been saved
        const room = {
            name: "test"
        }


        try {
            if (!user) {
                alert("User not logged in");
                return;
            }

            // Check the layout has a name
            if (!layoutName) {
                setnotifications('Please add a unique title to this layout');
                setTimeout(() => setnotifications(null), 3000);
                return;
            }

            // If json file doesn't exist, create file
            const checkJson = await FileSystem.getInfoAsync(layoutJson);
            if (!checkJson.exists) {
                await FileSystem.writeAsStringAsync(layoutJson, JSON.stringify({

                    // Json layout with user username
                    [user.username]: {
                        layouts: []
                    }
                }));
                console.log('Json file created:', layoutJson);
            }

            // Read data from json before writing new data
            const readData = await FileSystem.readAsStringAsync(layoutJson);
            let jsonData = {
                [user.username]: {
                    layouts: []
                }
            };

            // Check there is data
            if (readData) {
                jsonData = JSON.parse(readData);
            }


            // Get all layouts
            const allLayouts: any[] = jsonData[user.username]?.layouts;


            var nameUsed = false;
            var newName = '';

            // If this is a new layout
            if (loadedLayoutIndex == -1) {


                // Check that the provided name is unique
                jsonData[user.username]?.layouts?.forEach((layout: { name: string }) => {
                    nameUsed = (layout.name == layoutName) ? true : false;
                })


                // If its not unique, make a newName with (x) on afterwards 
                if (nameUsed) {
                    setDuplicateNumber(duplicateNumber + 1);
                    newName = (`${layoutName}_(${duplicateNumber})`)
                }
            }


            // Set the json entry for each layout
            const layout = {
                name: ((nameUsed) ? newName : layoutName),
                room: room.name,
                favourited: false,
                currentLayout: {
                    boxes: oldLayoutBoxes.map(box => ({
                        furnitureID: box.furnitureID,
                        id: box.id,
                        x: box.x,
                        y: box.y,
                        width: box.width,
                        length: box.length,
                        color: box.color,
                        rotation: box.rotation,
                    }))
                },
                newLayout: {
                    boxes: newLayoutBoxes.map(box => ({
                        furnitureID: box.furnitureID,
                        id: box.id,
                        x: box.x,
                        y: box.y,
                        width: box.width,
                        length: box.length,
                        color: box.color,
                        rotation: box.rotation,
                    }))
                }
            }

            var updateData = {};

            // If a layout has been selected
            if (loadedLayoutIndex != -1) {


                // Overwrite the selected layout
                allLayouts[loadedLayoutIndex] = layout;

                updateData = {
                    ...jsonData,
                    [user.username]: {
                        layouts: allLayouts
                    }
                }
            }
            else {

                // Set the updateData location and format
                updateData = {
                    ...jsonData,
                    [user.username]: {
                        layouts: (allLayouts
                            ? [...allLayouts, layout]
                            : [layout]
                        )
                    }
                }
            }


            // Write new data to json
            await FileSystem.writeAsStringAsync(layoutJson, JSON.stringify(updateData));

            // Show local json file in console
            const data = await FileSystem.readAsStringAsync(layoutJson);
            console.log('Layout json updated:', data);

            setnotifications('New layout saved sucessfully');
            setTimeout(() => setnotifications(null), 3000);

            setIsSaved(true)
        }
        catch (error) {
            console.log('Failed to update/save data to json file:', error);
            setnotifications('Failed to save layout.')
            setTimeout(() => setnotifications(null), 3000);
        }
    }

    // work out new positions and timings
    const updateBoxPosition = (id: number, dx: number, dy: number) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => {
                if (box.id === id) {
                    // Convert degrees to radians
                    const radians = (box.rotation * Math.PI) / 180;

                    // Calculate the axis-aligned bounding box dimensions
                    const rotatedWidth = Math.abs(Math.cos(radians) * box.width) + Math.abs(Math.sin(radians) * box.length);
                    const rotatedHeight = Math.abs(Math.sin(radians) * box.width) + Math.abs(Math.cos(radians) * box.length);

                    // Adjust movement by zoom level
                    const adjustedDx = dx / zoomLevel;
                    const adjustedDy = dy / zoomLevel;

                    const centerX = box.x + box.width / 2 + adjustedDx;
                    const centerY = box.y + box.length / 2 + adjustedDy;

                    const minX = rotatedWidth / 2;
                    const minY = rotatedHeight / 2;
                    const maxX = gridWidth - rotatedWidth / 2;
                    const maxY = gridHeight - rotatedHeight / 2;

                    const clampedX = Math.max(minX, Math.min(maxX, centerX));
                    const clampedY = Math.max(minY, Math.min(maxY, centerY));

                    const finalX = clampedX - box.width / 2;
                    const finalY = clampedY - box.length / 2;


                    return { ...box, x: finalX, y: finalY };
                }
                return box;
            })
        );
    };

    //Rotate clockwise function
    const rotateBoxRight = (id: number) => {
        let counter = 0; // Slowly increase for speed

        const interval = setInterval(() => {
            // console.log("Seconds:", Math.round(counter / 10), "counter", counter);

            setBoxes((prevBoxes) =>
                prevBoxes.map((box) => {
                    if (box.id === id) {
                        const newRotation = (box.rotation + 1 + Math.round(counter / 10)) % 360; // Degree incremention (1)
                        return { ...box, rotation: newRotation };
                    }
                    return box;
                })
            );
            counter++; // Increase counter
            if (counter >= 95) { counter = 95 } // Limit the speed
        }, currentSpeed);

        setRotationInterval(interval);
    };

    // Rotate counterclockwise function
    const rotateBoxLeft = (id: number) => {
        let counter = 0; // Slowly increase for speed

        const interval = setInterval(() => {
            ;
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) => {
                    if (box.id === id) {
                        const newRotation = ((box.rotation - 1 - Math.round(counter / 10)) + 360) % 360; // Degree decremention (-1)
                        return { ...box, rotation: newRotation };
                    }
                    return box;
                })
            );
            counter++; // Increase counter
            if (counter >= 95) { counter = 95 } // Limit the speed
        }, currentSpeed);

        setRotationInterval(interval);
    }

    // Stop rotation when button is released
    const stopRotation = () => {
        if (rotationInterval) {
            clearInterval(rotationInterval);
            setRotationInterval(null);
        }
        setCurrentSpeed(50); // Reset speed back to 50
    };

    const createPanResponder = (id: number) =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setSelectedBox(id); // Selected box to highlighted
            },
            onPanResponderMove: (_, gestureState) => {
                const { dx, dy } = gestureState;
                updateBoxPosition(id, dx, dy);
            },
            onPanResponderRelease: () => {
                console.log(
                    `Box ${id} updated position: `,
                    boxes.find((box) => box.id === id),
                    console.log(selectedBox)
                );
            },
        });


    // Set boxes to current layout
    let setOldLayout = false;
    const setLayout = (newLayout: boolean) => {

        // If new layout
        setIsCurrentLayoutSet(true); // Disable button function
        setnotifications('Current layout has been set');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec
        setPlacedBoxes((prev) => [...prev, ...boxes]); // Save boxes to new array
        // sendMessage({ type: "current_layout", locations: boxesFormatted })

        let oldLayoutBoxes: Box[] = [];
        if (!setOldLayout) {
            oldLayoutBoxes = [...placedBoxes];
            setOldLayout = true;
        }

        // Save the designed layout to the json file
        if (newLayout) {
            const newLayoutBoxes = [...boxes]
            saveLayout(oldLayoutBoxes, newLayoutBoxes);
        }
    };


    // Reset layout before setting current position 
    const resetLayout = () => {
        setIsCurrentLayoutSet(false); // Activate setlayout function again
        setPlacedBoxes([]);
        setBoxes(allBoxes)

        setnotifications('Layout has been reset');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec
    };

    // Add new furniture function - This is temporary, this would be change to a more complex solution
    const addFurniture = (furniture: FurnitureItem) => {

        // New furniture id = previous id + 1 or set to 1 if there is nothing else
        const newId = boxes.length > 0 ? Math.max(...boxes.map((box) => box.id)) + 1 : 1;

        // New box (furniture) in the grid
        const newBox = {
            furnitureID: furniture.furnitureID,
            id: newId, // change to "index"
            x: roomDimensionsMM[0] / 2,
            y: roomDimensionsMM[1] / 2,
            width: furniture.width,
            length: furniture.length,
            color: furniture.selectedColour,
            rotation: 0.0,
        };

        setBoxes((prevBoxes) => [...prevBoxes, newBox]);

        setnotifications('Furniture \'' + furniture.furnitureID + '\' has been added');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec
    };

    // Delete selected furniture function
    const deleteFurniture = () => {
        if (selectedBox === null) {
            console.log('There is not furniture selected to be deleted');
            return;
        }
        setBoxes((prevBoxes) => prevBoxes.filter((box) => box.id !== selectedBox));

        setnotifications('You have deleted furniture \'' + selectedBox + '\'');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec

        setSelectedBox(null);
    };

    useEffect(() => {
        if (selectedBox !== null) {
            const box = boxes.find((box) => box.id === selectedBox);
            if (box) {
                setInputX(box.x.toFixed(2));
                setInputY(box.y.toFixed(2));
                setInputAngle(box.rotation.toFixed(0));
            }
        }
    }, [selectedBox, boxes])

    const updateX = (e: string) => {
        let newX = parseFloat(e);
        if (!isNaN(newX)) {
            newX = Math.min(Math.max(newX, 0), gridWidth);

            setBoxes((prevBoxes) =>
                prevBoxes.map((box) =>
                    box.id === selectedBox ? { ...box, x: newX } : box
                )
            );
        }
    };

    const updateY = (e: string) => {
        let newY = parseFloat(e);
        if (!isNaN(newY)) {
            newY = Math.min(Math.max(newY, 0), gridHeight);

            setBoxes((prevBoxes) =>
                prevBoxes.map((box) =>
                    box.id === selectedBox ? { ...box, y: newY } : box
                )
            );
        }
    };

    const updateAngle = (e: string) => {
        let newRotation = parseFloat(e);
        if (!isNaN(newRotation)) {
            newRotation = Math.min(Math.max(newRotation, 0), 360);

            setBoxes((prevBoxes) =>
                prevBoxes.map((box) =>
                    box.id === selectedBox ? { ...box, rotation: newRotation } : box
                )
            );
        }
    };

    // Placeholders to show present coodinates and rotation
    let coordinateX = boxes.find((box) => box.id === selectedBox)?.x.toFixed(2) || 0
    let coordinateY = boxes.find((box) => box.id === selectedBox)?.y.toFixed(2) || 0
    let rotationAngle = boxes.find((box) => box.id === selectedBox)?.rotation.toFixed(2) || 0

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={defaultStyles.body}>

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

                    {/* Rotation buttons */}
                    {/* Rotation to right */}
                    <TouchableOpacity
                        style={uniqueStyles.rotationRight}
                        onPressIn={() => selectedBox && rotateBoxRight(selectedBox)}
                        onPressOut={stopRotation}
                    >
                        <View>
                            <Icon name="undo" size={25} style={{ transform: [{ scaleX: -1 }], color: isDarkMode ? '#fff' : '#000', }} />
                        </View>
                    </TouchableOpacity>

                    {/* Rotation to left */}
                    <TouchableOpacity
                        style={uniqueStyles.rotationLeft}
                        onPressIn={() => selectedBox && rotateBoxLeft(selectedBox)}
                        onPressOut={stopRotation}
                    >
                        <View>
                            <Icon name="undo" size={25} style={{ color: isDarkMode ? '#fff' : '#000', }} />
                        </View>
                    </TouchableOpacity>

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
                            onZoomAfter={(event, setGestureState, zoomableViewEventObject) => {
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
                                {/* Display non-movable objects */}
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
                                        <Text style={[uniqueStyles.boxText, { color: "gray" }]}>{box.furnitureID}</Text>
                                    </View>
                                ))}

                                {/* Display movable objects */}
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
                    {/* Need scale measurement */}
                    <View style={uniqueStyles.buttonContainer}>

                        {/* Show notifications */}
                        {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}

                        {/* Show coordinates */}
                        {selectedBox !== null &&

                            <View style={uniqueStyles.coordinatesContainer}>
                                <Text style={uniqueStyles.coordinates}>X =</Text>
                                <TextInput
                                    value={inputX}
                                    onChangeText={(e) => setInputX(e)}
                                    onBlur={() => updateX(inputX)}
                                    style={uniqueStyles.textInput}
                                    keyboardType="numeric"
                                    placeholder={String(coordinateX)}
                                />
                                <Text style={uniqueStyles.coordinates}>Y =</Text>
                                <TextInput
                                    value={inputY}
                                    onChangeText={(e) => setInputY(e)}
                                    onBlur={() => updateY(inputY)}
                                    style={uniqueStyles.textInput}
                                    keyboardType="numeric"
                                    placeholder={String(coordinateY)}
                                />
                                <Text style={uniqueStyles.coordinates}>Angle =</Text>
                                <TextInput
                                    value={inputAngle}
                                    onChangeText={(e) => setInputAngle(e)}
                                    onBlur={() => updateAngle(inputAngle)}
                                    style={uniqueStyles.textInput}
                                    keyboardType="numeric"
                                    placeholder={String(rotationAngle)}
                                />
                            </View>
                        }

                        {/* Buttons */}
                        {/* Show different buttons depending in current location is set or not */}
                        {!isCurrentLayoutSet ? (
                            <>
                                <ActionButton
                                    label="Set Current Location"
                                    onPress={() => { setLayout(false) }}
                                />
                                <ActionButton
                                    label="Delete Furniture"
                                    onPress={deleteFurniture}
                                    style={{ backgroundColor: '#fa440c' }}
                                />
                                <ActionButton
                                    label="Add Furniture"
                                    onPress={() => setModalVisible(true)}
                                    style={{ backgroundColor: '#964B00' }}
                                />
                                <FurnitureModal
                                    isVisible={isModalVisible}
                                    onClose={() => setModalVisible(false)}
                                    onSelectFurniture={addFurniture}
                                />
                                {(loadedLayoutIndex != -1) &&
                                    <ActionButton
                                        label="Delete this layout"
                                        onPress={async () => {
                                            await deleteLayout()
                                            router.replace('../(tabs)/library')
                                        }}
                                        style={{ backgroundColor: '#fa440c' }}
                                    />
                                }
                                {/* </Link> */}
                            </>
                        ) : (
                            <>
                                {isConnected ?
                                    (isSaved ?
                                        (

                                            <Link href={{ pathname: "../extraPages/systemRunning", params: { layoutName } }} asChild>
                                                <ActionButton
                                                    label="Ready To Go!"
                                                    onPress={() => {
                                                        sendMessage({ type: "desired_layout", locations: boxesFormatted })
                                                    }}
                                                />
                                            </Link>
                                        )
                                        :
                                        (
                                            <ActionButton
                                                label="Save the layout first!"
                                                onPress={() => {
                                                    alert("Save the layout first!")
                                                }}
                                            />
                                        )
                                    )
                                    :
                                    (
                                        <ActionButton
                                            label="Connect to WebSocket!"
                                            onPress={() => {
                                                alert("WebSocket Not Connected!")
                                            }}
                                        />
                                    )
                                }

                                <ActionButton
                                    label="Reset Layout"
                                    onPress={resetLayout}
                                    style={{ backgroundColor: '#fa440c' }}
                                />
                                {!isSaved ?
                                    <ActionButton
                                        label="Save Layout"
                                        onPress={() => setLayout(true)}
                                        style={{ backgroundColor: '#76f58f' }}
                                    />
                                    :
                                    <ActionButton
                                        label="Layout saved!"
                                        onPress={() => console.log("filler")}
                                        style={{ backgroundColor: 'grey' }}
                                    />
                                }
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        title: {
            fontSize: 30,
            color: isDarkMode ? '#fff' : '#000',
            textAlign: 'center',
            top: -30,
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
        buttonContainer: {
            width: 300,
            top: -20,
        },
        notificationText: {
            position: 'absolute',
            top: 225,
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
        coordinates: {
            fontSize: 12,
            color: isDarkMode ? '#fff' : '#000',
            textAlign: 'center',
            top: 10,
            letterSpacing: 2,
        },
        rotationLeft: {
            width: 25,
            height: 25,
            left: '35%',
            top: -60,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'transparent',
        },
        rotationRight: {
            width: 25,
            height: 25,
            left: '44%',
            top: -35,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'transparent',
            borderWidth: 1,
            borderColor: 'transparent',
        },
        zoomStyle: {
            position: 'absolute',
            fontSize: 12,
            color: isDarkMode ? '#fff' : '#000',
            top: 80,
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
            top: -20,
            left: '15%',
        }

    });
