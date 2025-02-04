import React, { useState, useRef } from "react";
import { View, Text, PanResponder, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/app/_layout";
import { createDefaultStyles } from "@/components/defaultStyles";
import ActionButton from "@/components/settingsComponents/actionButton";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { useSocket, sendMessage } from "@/hooks/useSocket";

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
    { id: 1, x: 0, y: 0, timeX: 0, timeY: 0 },
    { id: 2, x: 150, y: 150, timeX: 0, timeY: 0 },
    { id: 3, x: 100, y: 100, timeX: 0, timeY: 0 },
];

export default function DragAndDrop() {
    // dark mode
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);
    const socket = useSocket();

    // Notifications
    const [notifications, setnotifications] = useState<string | null>(null);

    // Define 'Box' to store in 'currentPos'
    type Box = {
        id: number;
        x: Float;
        y: Float;
        timeX: Float;
        timeY: Float;
    };

    // set boxes array
    const [boxes, setBoxes] = useState(allBoxes);

    // Placed boxes of current layout
    const [placedBoxes, setPlacedBoxes] = useState<Box[]>([]);

    const squareRef = useRef(null);


    // work out new positions and timings
    const updateBoxPosition = (id: number, dx: number, dy: number) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => {
                if (box.id === id) {
                    //
                    const newX = Math.max(0, Math.min(gridDimensionsPx[0] - (uniqueStyles.robot.width + 3), box.x + dx)); // Clamp x position
                    const newY = Math.max(0, Math.min(gridDimensionsPx[1] - (uniqueStyles.robot.height + 3), box.y + dy)); // Clamp y position
                    const newTimeX = calculateTime("X", newX);
                    const newTimeY = calculateTime("Y", newY);
                    return { ...box, x: newX, y: newY };
                }
                return box;
            })
        );
    };

    // Track active box for highlight feature
    const [selectedBox, setSelectedBox] = useState<number | null>(null);

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
                    boxes.find((box) => box.id === id)
                );
            },
        });

    // Check if the layout is set or not
    const [isSet, setIsSet] = useState(false);

    // Set boxes to current layout
    const setLayout = () => {
        setIsSet(true); // Disable button function
        setPlacedBoxes((prev) => [...prev, ...boxes]); // Save boxes to new array
        sendMessage(false, { type: "current_layout", locations: boxes })

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
    const addFurniture = () => {
        // New furniture id = previous id + 1 or set to 1 if there is nothing else
        const newId = boxes.length > 0 ? Math.max(...boxes.map((box) => box.id)) + 1 : 1;

        // Default position of new box
        const newBox = { id: newId, x: gridDimensionsPx[0]/2, y: gridDimensionsPx[1]/2, timeX: 0, timeY: 0 };

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

    return (
        <View style={defaultStyles.body}>
            {/* Title */}
            <View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>Add Layout</Text>
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
                                    backgroundColor: '#964B00',
                                    borderWidth: isSelected ? 2 : 0,
                                    borderColor: isSelected ? 'yellow' : 'transparent',
                                },
                            ]}
                            {...panResponder.panHandlers}
                        >
                            <Text style={uniqueStyles.boxText}>{box.id}</Text>
                        </View>
                    );
                })}
            </View>
            {/* Need scale measurement */}

            <View style={uniqueStyles.buttonContainer}>

                {/* Show notifications */}
                {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}

                {/* Show coordinates */}
                {selectedBox !== null && (
                    <Text style={uniqueStyles.coordinates}>
                        X = {boxes.find((box) => box.id === selectedBox)?.x.toFixed(2) || 0},
                        Y = {boxes.find((box) => box.id === selectedBox)?.y.toFixed(2) || 0}
                    </Text>
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
                        onPress={addFurniture}
                        style={{ backgroundColor: '#964B00'}}
                        />
                    </>
                ) : (
                    <>
                        <ActionButton
                        label="Ready To Go!"
                        onPress={() => sendMessage(false, { type: "desired_layout", locations: boxes })}
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
    );
};

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        grid: {
            width: gridDimensionsPx[0], // * scaleX once visuals are done
            height: gridDimensionsPx[1], // * scaleY once visuals are done
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
            marginVertical: -8,
            top: 10,
        },

    });
