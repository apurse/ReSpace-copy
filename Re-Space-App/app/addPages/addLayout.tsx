import React, { useState, useRef } from "react";
import { View, Text, PanResponder, StyleSheet, Dimensions } from "react-native";
import { useTheme } from "@/app/_layout";
import { createDefaultStyles } from "@/components/defaultStyles";
import ActionButton from "@/components/settingsComponents/actionButton";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

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

export default function DragAndDrop() {


    // dark mode
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);


    // set boxes array
    const [boxes, setBoxes] = useState([
        { id: 1, x: 0, y: 0, timeX: 0, timeY: 0 }, // Initial position of Box 1
        { id: 2, x: 150, y: 150, timeX: 0, timeY: 0 }, // Initial position of Box 2
    ]);

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
                    return { ...box, x: newX, y: newY, timeX: newTimeX, timeY: newTimeY};
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


    return (
        <View style={defaultStyles.body}>
            {/* Content */}
            <View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>Add Layout</Text>
            </View>
            <View
                ref={squareRef}
                style={uniqueStyles.grid}
                onLayout={(e) => {
                    const { x, y, width, height } = e.nativeEvent.layout;
                    console.log(`Square dimensions: ${width}x${height} at (${x}, ${y})`);
                }}
            >
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
                <ActionButton
                    label="Save Layout"
                    onPress={() => alert("Todo...")}
                />
                <ActionButton
                    label="Ready To Go!"
                    onPress={() => sendMessage({ type: "time", message: boxes })} // `id: ${boxes[0].id}, x: ${boxes[0].x}, y: ${boxes[0].y}`
                />
            </View>
        </View>
    );


    // -------------------------------------- WEBSOCKET STUFF --------------------------------------

    async function sendMessage(data: Record<string, unknown>) {
        const ws = new WebSocket('ws://respace-1.local:8002');
        ws.onopen = () => {
            console.log("WebSocket connection established.");
            // connection opened
            // ws.send('something'); // send a message

            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            } else {
                console.error("WebSocket is not open.");
            }
        };

        // a message was received
        ws.onmessage = e => {
            try {
                const data = JSON.parse(e.data);
                console.log("Received:", data);
            } catch (err) {
                console.error("Error parsing message:", err);
            }
        };

        ws.onerror = e => {
            // an error occurred
            console.log(e);
        };

        ws.onclose = e => {
            // connection closed
            console.log(e.code, e.reason);
        };
    }
}

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
        }

    });
