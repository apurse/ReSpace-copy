import { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, PanResponder, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from "react-native";
import { useTheme } from "@/app/_layout";
import { createDefaultStyles } from "@/components/defaultStyles";
import ActionButton from "@/components/settingsComponents/actionButton";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { useSocket } from "@/hooks/useSocket";
import FurnitureModal from "@/components/LayoutComponents/furnitureModal";
import { FurnitureItem } from "@/components/LayoutComponents/furnitureModal";
import Icon from 'react-native-vector-icons/FontAwesome';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useAuth } from "@/hooks/useAuth";
import { useRoom } from '@/hooks/useRoom';


// Get dimensions of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


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

    // Hooks and colours
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);
    var { isConnected, sendMessage } = useSocket();
    const { user } = useAuth();
    const { roomName, jsonData, updateJsonData } = useRoom();


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
    const [placedBoxes, setPlacedBoxes] = useState<Box[]>([]); // Placed boxes of current layout
    const [selectedBox, setSelectedBox] = useState<number | null>(null); //Track active box for highlight feature

    // User settings
    const [rotationInterval, setRotationInterval] = useState<NodeJS.Timeout | null>(null); // Track rotation interval
    const [currentSpeed, setCurrentSpeed] = useState<number>(50); // Initial rotation speed
    const [layoutName, setlayoutHeading] = useState<string | undefined>();

    const squareRef = useRef(null);
    const [offsetX, setOffsetX] = useState(0);
    const [offsetY, setOffsetY] = useState(0);

    // -------- Grid Visuals --------
    const roomDimensionsMetres = [
        jsonData?.roomDimensions?.roomX ? jsonData?.roomDimensions?.roomX : 5000,
        jsonData?.roomDimensions?.roomY ? jsonData?.roomDimensions?.roomY : 5000,
    ];
    const gridWidth = roomDimensionsMetres[0];
    const gridHeight = roomDimensionsMetres[1];

    const roomSize = Math.max(gridWidth, gridHeight);
    const minZoom = Math.max(0.1, Math.min(1, 1.05 - 0.22 * Math.log10(roomSize)));


    // Dynamically calculate the initial zoom level based on the room size and screen size
    const initialZoom = minZoom

    const [zoomLevel, setZoomLevel] = useState(1); // Check zoom level

    // Zoom able/disable function
    const [zoomEnabled, setZoomEnabled] = useState(true);

    // Local room json file
    var { selectedLayout } = useLocalSearchParams<{ selectedLayout: string }>();

    // Refresh layout on selected layout change
    useEffect(() => {
        console.log("useEffect called")
        if (!hasBeenCalled && selectedLayout != undefined) {
            loadLayout(selectedLayout);
            console.log("selectedLayout:", selectedLayout)
            setHasBeenCalled(true);
        }
    }, [selectedLayout]);


    // Send room files to the hub on load
    useFocusEffect(
        useCallback(() => {
            console.log("focus called")
            sendMessage({ type: "load_map", data: jsonData.roomFiles });
        }, [])
    );


    /**
     * Load the layout from the selected layout in the library.
     * @param selectedLayout String - The selected layout title in the library
     */
    const loadLayout = async (selectedLayout: string) => {
        try {

            // Set the title
            setlayoutHeading(selectedLayout);

            // Get the layout index within the JSON
            let layoutIndex = jsonData.users[user.username]?.layouts
                .findIndex((layout: any) => layout.name === selectedLayout
                );


            // If no index is found
            if (layoutIndex === -1) {
                console.warn("Layout not found.");
                return;
            }

            // Get each box in the current layout and add to array
            var newBoxes: Box[] = [];
            jsonData.users[user.username]?.layouts[layoutIndex].currentLayout.boxes
                .forEach((box: Box) => {
                    newBoxes.push(box);
                });


            // Set all the boxes and the layout number
            setBoxes(newBoxes);
            setLoadedLayoutIndex(layoutIndex);
        } catch (err) {
            console.error("Error loading layout:", err);
        }
    };


    /**
     * Call function to clear the layout json entry from this device
     */
    const deleteLayout = async () => {
        try {

            // Get the layout index within the JSON
            let layoutIndex = jsonData.users[user.username]?.layouts
                .findIndex((layout: any) => layout.name === layoutName);

            // Remove the layout
            jsonData.users[user.username].layouts.splice(layoutIndex, 1);

            // Write the new data 
            updateJsonData(jsonData)

        } catch (error) {
            console.error('Error deleting json data');
        }

        setlayoutHeading('');
    };

    /**
     * Save the layout to the room JSON on the device.
     * @param oldLayoutBoxes The current layout of the furniture.
     * @param newLayoutBoxes The desired layout of the furniture.
     */
    const saveLayout = async (oldLayoutBoxes: Box[], newLayoutBoxes: Box[]) => {
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


            var nameUsed = false;
            var newName = layoutName;

            // If this is a new layout
            if (loadedLayoutIndex == -1) {


                // Check that the provided name is unique
                jsonData.users[user.username]?.layouts?.forEach((layout: { name: string }) => {
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
                name: newName,
                room: roomName,
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

            // Either overwrite or add the jsonData
            if (loadedLayoutIndex !== -1) {
                jsonData.users[user.username].layouts[loadedLayoutIndex] = layout;
            } else {
                jsonData.users[user.username].layouts.push(layout);
            }

            // Update the data in the provider
            updateJsonData(jsonData)


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
    let setCurrentLayout = false;

    /**
     * Set the corresponding layout
     * @param desiredLayout boolean - The layout that needs setting (false = current, true = desired)
     */
    const setLayout = async (desiredLayout: boolean) => {

        setIsCurrentLayoutSet(true);

        // Save new boxes
        setPlacedBoxes((prev) => [...prev, ...boxes]);

        let currentLayoutBoxes: Box[] = [];

        // If the current layout hasnt been set, set the current boxes
        if (!setCurrentLayout) {
            currentLayoutBoxes = [...placedBoxes];
            setCurrentLayout = true;

            // Send current layout to the hub 
            if (isConnected) {
                sendMessage({ type: "current_layout", locations: currentLayoutBoxes })
            } else {
                alert("No connection to the WebSocket.");
            }

            // Show notification for 3 sec
            setnotifications('Current layout has been set');
            setTimeout(() => setnotifications(null), 3000);
        }

        // If desired layout, set new boxes and save
        if (desiredLayout) {
            const newLayoutBoxes = [...boxes]


            // Send desired layout to the hub 
            if (isConnected) {
                sendMessage({ type: "desired_layout", locations: newLayoutBoxes })
            } else {
                alert("No connection to the WebSocket.");
            }


            saveLayout(currentLayoutBoxes, newLayoutBoxes);
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
            x: roomDimensionsMetres[0] / 2,
            y: roomDimensionsMetres[1] / 2,
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

    //  Fix coordinates with two decimals after inputing a number
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

    //  Update X coordinate value with input
    const updateX = (e: string) => {
        let newX = parseFloat(e);
        if (!isNaN(newX)) {
            newX = Math.min(Math.max(newX, 0), gridWidth); // Set limit

            //  Update box X placement
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) =>
                    box.id === selectedBox ? { ...box, x: newX } : box
                )
            );
        }
    };

    //  Update Y coordinate value with input
    const updateY = (e: string) => {
        let newY = parseFloat(e);
        if (!isNaN(newY)) {
            newY = Math.min(Math.max(newY, 0), gridHeight); // Set limit

            //  Update box Y placement
            setBoxes((prevBoxes) =>
                prevBoxes.map((box) =>
                    box.id === selectedBox ? { ...box, y: newY } : box
                )
            );
        }
    };

    //  Update angle value with input
    const updateAngle = (e: string) => {
        let newRotation = parseFloat(e);
        if (!isNaN(newRotation)) {
            newRotation = Math.min(Math.max(newRotation, 0), 360); // Set limit

            //   Update box angle
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
            {/* <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            > */}
            <View style={defaultStyles.body}>

                {/* Title */}
                <TextInput
                    value={layoutName}
                    onChangeText={setlayoutHeading}
                    style={uniqueStyles.title}
                    placeholder='*New Layout ...'
                    placeholderTextColor={isDarkMode ? '#fff' : '#000'}
                />

                {/* Show zoom value */}
                <Text style={uniqueStyles.zoomStyle}>Zoom: {zoomLevel.toFixed(2)}</Text>

                <ActionButton
                    label={zoomEnabled ? "Disable Zoom" : "Enable Zoom"}
                    onPress={() => setZoomEnabled((prev) => !prev)}
                    style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        top: 45,
                        alignSelf: "center",
                        backgroundColor: zoomEnabled ? "#f66" : "#2E7D32",
                        borderRadius: 6,
                        minWidth: 100,
                        position: 'absolute', 
                    }}
                />

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
                    {/* Zoom function settings */}
                    <ReactNativeZoomableView
                        maxZoom={1}
                        minZoom={initialZoom}
                        contentWidth={gridWidth / 3.5}
                        contentHeight={gridHeight / 3.5}
                        initialZoom={initialZoom * 2}
                        bindToBorders={true}
                        pinchToZoomInSensitivity={5}
                        pinchToZoomOutSensitivity={5}   
                        movementSensibility={1}
                        panEnabled={zoomEnabled}
                        zoomEnabled={zoomEnabled}

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
                                //position: "absolute",
                                // left: offsetX,
                                // top: offsetY,
                                width: roomDimensionsMetres[0] * zoomLevel,
                                height: roomDimensionsMetres[1] * zoomLevel,
                                backgroundColor: "rgba(255,255,255,0.5)",
                                borderWidth: 3,
                                borderColor: "red",
                            }}
                        >
                            <ImageBackground source={{ uri: (`data:image/png;base64,${jsonData?.roomFiles?.png}`), }} resizeMode="contain" style={uniqueStyles.image} />
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
                                style={{ backgroundColor: '#1565C0' }}
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
                                        router.back();
                                    }}
                                    style={{ backgroundColor: '#C62828' }}
                                />
                            }
                        </>
                    ) : (
                        <>
                            {isConnected ?
                                (isSaved ?
                                    (
                                        <ActionButton
                                            label="Ready To Go!"
                                            onPress={() => {

                                                // Go to systemRunning
                                                router.replace({
                                                    pathname: "/extraPages/systemRunning",
                                                    params: { layoutRunning: layoutName, roomName },
                                                })
                                            }}
                                        />
                                    )
                                    :
                                    (
                                        <ActionButton
                                            label={(loadedLayoutIndex == -1) ? "Save the layout first!" : "Update the layout first!"}
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
                                style={{ backgroundColor: '#455A64' }}
                            />
                            {!isSaved ?
                                <ActionButton
                                    label={(loadedLayoutIndex == -1) ? "Save Layout" : "Update Layout"}
                                    onPress={() => layoutName ? setLayout(true) : alert("Please add a title to this layout!")}
                                    style={{ backgroundColor: '#00838F' }}
                                />
                                :
                                <ActionButton
                                    label={(loadedLayoutIndex == -1) ? "Layout Saved!" : "Layout Updated!"}
                                    onPress={() => console.log("filler")}
                                    style={{ backgroundColor: '#00838F' }}
                                />
                            }
                        </>
                    )}
                </View>
            </View>
            {/* </ScrollView> */}
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
            width: 350, // * scaleX once visuals are done
            height: 350, // * scaleY once visuals are done
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
        },
        image: {
            flex: 1,
            justifyContent: 'center',
        },

    });
