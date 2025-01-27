import React, { useState, useRef } from "react";
import { View, Text, PanResponder, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/app/_layout";
import { createDefaultStyles } from "@/components/defaultStyles";
import ActionButton from "@/components/settingsComponents/actionButton";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { useSocket } from "@/hooks/useSocket";

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

// Boxes/furnitures in the grid
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
                    return { ...box, x: newX, y: newY, timeX: newTimeX, timeY: newTimeY };
                }
                return box;
            })
        );
    };


    const createPanResponder = (id: number) =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
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
        if (isSet) return; // Do nothing if already set
        setIsSet(true); // Disable button function
        setPlacedBoxes((prev) => [...prev, ...boxes]); // Save boxes to new array

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


    // Send WebSocket data
    const sendMessage = async (data: Record<string, unknown>) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(data));
        } else {
            console.error("WebSocket is not open.");
        };
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
                    return (
                        <View
                            key={box.id}
                            style={[
                                uniqueStyles.robot,
                                {
                                    left: box.x,
                                    top: box.y,
                                    backgroundColor: '#964B00',
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

            {/* Buttons */}
            <View style={uniqueStyles.buttonContainer}>
                {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}
                <ActionButton
                    label="Set Current Location"
                    onPress={setLayout}
                    style={isSet ? { backgroundColor: "rgba(76, 175, 80, 0.3)" } : {}}
                    textS={isSet ? { color: "rgba(250, 250, 250, 0.3" } : {}}
                />
                <ActionButton
                    label="Ready To Go!"
                    onPress={() => sendMessage({ type: "time", message: boxes })} // `id: ${boxes[0].id}, x: ${boxes[0].x}, y: ${boxes[0].y}`
                />
                <ActionButton
                    label="Reset Layout"
                    onPress={resetLayout}
                />
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

    });
