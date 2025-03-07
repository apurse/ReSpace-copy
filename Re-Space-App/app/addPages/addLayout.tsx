import React, { useState, useRef, useEffect } from "react";
import { View, Text, PanResponder, StyleSheet, Dimensions, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform} from "react-native";
import { useTheme } from "@/app/_layout";
import { createDefaultStyles } from "@/components/defaultStyles";
import ActionButton from "@/components/settingsComponents/actionButton";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { useSocket } from "@/hooks/useSocket";
import FurnitureModal from "@/components/LayoutComponents/furnitureModal";
import { FurnitureItem } from "@/components/LayoutComponents/furnitureModal";
import Icon from 'react-native-vector-icons/FontAwesome';
import { CurrentRenderContext } from "@react-navigation/native";
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { setGestureState } from "react-native-reanimated";
import { isPosition } from "react-native-drax";


// Get dimensions of the screen
const { width, height } = Dimensions.get('window');


// -------- Grid Visuals --------

// const pixelsPerMM = 3.78;
// const robotDimensions = [250, 250]; // mm

const gridDimensionsPx = [0.8 * width, 0.8 * width];
const roomDimensionsMM = [1600, 1600];


var scaleX = gridDimensionsPx[0] / roomDimensionsMM[0];
var scaleY = gridDimensionsPx[1] / roomDimensionsMM[1];


// Calculate running time for distance
function calculateTime(axis: string, distance: Float) {

    if (axis == "X")
        distance = distance * scaleX
    else
        distance = distance * scaleY

    const robotSpeedMM = 190 / 2; // hardcoded mm

    const time = distance / robotSpeedMM;
    return time;
}

// Boxes in the grid
const allBoxes = [
    { id: 1, x: 0, y: 0, width:70, length: 30, color: 'red', rotation: 0.0},
    { id: 2, x: 150, y: 150, width:50, length: 150, color: 'green', rotation: 0.0 },
    { id: 3, x: 100, y: 100, width:50, length: 30, color: 'blue', rotation: 0.0 },
];

export default function DragAndDrop() {
    
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
    
    // dark mode
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);

    //const socket = useSocket(); <-- Not being use

    const [notifications, setnotifications] = useState<string | null>(null); // Notifications

    const [boxes, setBoxes] = useState(allBoxes); // set boxes array
    const boxesFormatted = boxes.map(({ id, x, y, rotation }) => ({ id, x, y, rotation })); // Formatted boxes data
    const [placedBoxes, setPlacedBoxes] = useState<Box[]>([]); // Placed boxes of current layout

    const squareRef = useRef(null);

    const [rotationInterval, setRotationInterval] = useState<NodeJS.Timeout | null>(null); // Track rotation interval
    const [currentSpeed, setCurrentSpeed] = useState<number>(50); // Initial rotation speed

    const [selectedBox, setSelectedBox] = useState<number | null>(null); //Track active box for highlight feature
    const [isSet, setIsSet] = useState(false); // Check if the layout is set or not
    const [isModalVisible, setModalVisible] = useState(false); // State of furniture modal (to add furniture)
    const [zoomLevel, setZoomLevel] = useState(1); // Check zoom level

    const { sendMessage } = useSocket();

    const [inputX, setInputX] = useState(''); // Value of input box of 'x' coordinate
    const [inputY, setInputY] = useState(''); // Value of input box of 'y' coordinate
    const [inputAngle, setInputAngle] = useState(''); // Value of angle of the rotation furniture

    const [gridWidth, setGridWidth] = useState(0); // Actual grid 'x' width display on grid
    const [gridHeight, setGridHeight] = useState(0); // Actual grid 'y' height display on grid

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

                    const centerX = box.x + box.width / 2 + dx;
                    const centerY = box.y + box.length / 2 + dy;

                    const minX = rotatedWidth / 2;
                    const minY = rotatedHeight / 2;
                    const maxX = gridDimensionsPx[0] - rotatedWidth / 2;
                    const maxY = gridDimensionsPx[1] - rotatedHeight / 2;

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
            if (counter >= 95) { counter = 95} // Limit the speed
        }, currentSpeed);
    
        setRotationInterval(interval);
    };

    // Rotate counterclockwise function
    const rotateBoxLeft = (id: number) => {
        let counter = 0; // Slowly increase for speed

        const interval = setInterval(() => {;
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
            if (counter >= 95) { counter = 95} // Limit the speed
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
    const setLayout = () => {
        setIsSet(true); // Disable button function
        setPlacedBoxes((prev) => [...prev, ...boxes]); // Save boxes to new array
        sendMessage({ type: "current_layout", locations: boxesFormatted })

        setnotifications('Current layout has been set');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec
    };


    // Reset layout before setting current position 
    const resetLayout = () => {
        setIsSet(false); // Activate setlayout function again
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
             id: newId, 
             x: gridDimensionsPx[0]/2, 
             y: gridDimensionsPx[1]/2,
             width: furniture.width, 
             length: furniture.length, 
             color: furniture.selectedColour,
             rotation: 0.0,
        };

        setBoxes((prevBoxes) => [...prevBoxes, newBox]);

        setnotifications('Furniture \'' + newId + '\' has been added');
        setTimeout(() => setnotifications(null), 3000); // Show notification for 3 sec
    };

    // Delete selected furniture function
    const deleteFurniture = () => {
        if (selectedBox === null){
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

    const updateX = (e : string) => {
        let newX = parseFloat(e);
        if (!isNaN(newX)) {
            newX = Math.min(Math.max(newX, 0), 280);

            setBoxes((prevBoxes) => 
                prevBoxes.map((box) => 
                    box.id === selectedBox ? {...box, x: newX} : box
                )
            );
        }
    };

    const updateY = (e : string) => {
        let newY = parseFloat(e);
        if (!isNaN(newY)) {
            newY = Math.min(Math.max(newY, 0), 180);

            setBoxes((prevBoxes) => 
                prevBoxes.map((box) => 
                    box.id === selectedBox ? {...box, y: newY} : box
                )
            );
        }
    };

    const updateAngle = (e : string) => {
        let newRotation = parseFloat(e);
        if (!isNaN(newRotation)) {
            newRotation = Math.min(Math.max(newRotation, 0), 360);
            
            setBoxes((prevBoxes) => 
                prevBoxes.map((box) => 
                    box.id === selectedBox ? {...box, rotation: newRotation} : box
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
                    <View style={defaultStyles.pageTitleSection}>
                        <Text style={defaultStyles.pageTitle}>Add Layout</Text>
                        <Text style={uniqueStyles.zoomStyle}>Zoom: {zoomLevel.toFixed(2)}</Text>
                        {/* Rotation buttons */}
                        {/* Rotation to right */}
                        <TouchableOpacity
                            style={uniqueStyles.rotationRight}
                            onPressIn={() => selectedBox && rotateBoxRight(selectedBox)}
                            onPressOut={stopRotation}
                        >
                            <View>
                                <Icon name="undo" size={25} style={{transform: [{ scaleX: -1 }], color: isDarkMode ? '#fff' : '#000',}}/>
                            </View>
                        </TouchableOpacity>

                        {/* Rotation to left */}
                        <TouchableOpacity
                            style={uniqueStyles.rotationLeft}
                            onPressIn={() => selectedBox && rotateBoxLeft(selectedBox)}
                            onPressOut={stopRotation}
                        >
                            <View>
                                <Icon name="undo" size={25} style={{ color: isDarkMode ? '#fff' : '#000',}}/>
                            </View>
                        </TouchableOpacity>
                    </View>

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
                            maxZoom={10}
                            minZoom={1}
                            initialZoom={1}
                            disablePanOnInitialZoom={true}

                            // Update zoom level
                            onZoomAfter={(event, setGestureState, zoomableViewEventObject) => {
                                setZoomLevel(zoomableViewEventObject.zoomLevel); 
                            }}
                        >
                            {/* Display not moving boxes */}
                            {placedBoxes.map((box) => (
                                <View
                                    key={`placed-${box.id}`} // Create unique id for placed boxes
                                    style={[
                                        uniqueStyles.robot,
                                        {
                                            left: box.x,
                                            top: box.y,
                                            backgroundColor: "transparent",
                                            borderWidth: 1,
                                            width: box.width,
                                            height: box.length,
                                            transform: [{ rotate: `${box.rotation}deg` }],
                                        },
                                    ]}
                                >
                                    <Text style={[uniqueStyles.boxText, { color: "gray" }]}>{box.id}</Text>
                                </View>
                            ))}

                            {/* Display moving boxes */}
                            {boxes.map((box) => {
                                const panResponder = createPanResponder(box.id);

                                // Check if box is selected to highlighted
                                const isSelected = selectedBox === box.id;

                                return (
                                    <View
                                        key={box.id}
                                        style={[
                                            uniqueStyles.robot,
                                            {
                                                left: box.x,
                                                top: box.y,
                                                backgroundColor: box.color,
                                                borderWidth: isSelected ? 2 : 0,
                                                borderColor: isSelected ? 'yellow' : 'transparent',
                                                width: box.width,
                                                height: box.length,
                                                transform: [{ rotate: `${box.rotation}deg` }],
                                            },
                                        ]}
                                        {...panResponder.panHandlers}
                                    >
                                        <Text style={uniqueStyles.boxText}>{box.id}</Text>
                                    </View>
                                );
                            })}
                        </ReactNativeZoomableView>
                    </View>
                    {/* Need scale measurement */}
                    <View style={uniqueStyles.buttonContainer}>

                        {/* Show notifications */}
                        {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}

                        {/* Show coordinates */}
                        {selectedBox !== null && (

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
                        )}

                        {/* Buttons */}
                        {/* Show different buttons depending in current location is set or not */}
                        {!isSet ? (
                            <>
                                <ActionButton
                                    label="Set Current Location"
                                    onPress={setLayout}
                                />
                                <ActionButton
                                    label="Delete Furniture"
                                    onPress={deleteFurniture}
                                    style={{ backgroundColor: '#fa440c'}}
                                />
                                <ActionButton
                                    label="Add Furniture"
                                    onPress={() => setModalVisible(true)}
                                    style={{ backgroundColor: '#964B00'}}
                                />
                                <FurnitureModal 
                                    isVisible={isModalVisible}
                                    onClose={() => setModalVisible(false)}
                                    onSelectFurniture={addFurniture}
                                />
                            </>
                        ) : (
                            <>
                                <ActionButton
                                label="Ready To Go!"
                                onPress={() => {
                                    sendMessage({ type: "desired_layout", locations: boxesFormatted })
                                }}
                                />
                                <ActionButton
                                label="Reset Layout"
                                onPress={resetLayout}
                                style={{ backgroundColor: '#fa440c'}}
                                />
                                <ActionButton
                                label="Save Layout"
                                onPress={() => console.log('working on it')}
                                style={{ backgroundColor: '#76f58f'}}
                                />
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
        grid: {
            width: gridDimensionsPx[0] + 5, // * scaleX once visuals are done
            height: gridDimensionsPx[1] + 5, // * scaleY once visuals are done
            backgroundColor: '#D3D3D3',
            position: "relative",
            borderWidth: 2,
            borderColor: "#aaa",
        },
        robot: {
            width: 250 * scaleX,
            height: 250 * scaleY,
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 4,
            backgroundColor: '#964B00'
        },
        circle: {
            width: 340 * scaleX,
            borderRadius: 90,
            backgroundColor: "green"
        },
        boxText: {
            color: "#fff",
            fontWeight: "bold",
        },
        buttonContainer: {
            width: gridDimensionsPx[0],
            top: 10,
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
            left: '30%',
            bottom: '15%',
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: 'transparent', 
            borderWidth: 1,  
            borderColor: 'transparent',
        },
        rotationRight: {
            width: 25,
            height: 25,
            left: '40%',
            top: '10%',
            justifyContent: 'center', 
            alignItems: 'center', 
            backgroundColor: 'transparent', 
            borderWidth: 1,  
            borderColor: 'transparent',
        },
        zoomStyle: {
            position: 'absolute',
            fontSize: 10,
            color: isDarkMode ? '#fff' : '#000',
            top: 85,
            left: 25,
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
            top: -15,
            left: '15%',
        }

    });
