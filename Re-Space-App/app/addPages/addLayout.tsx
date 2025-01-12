import React, { useState, useRef } from "react";
import {View, Text, PanResponder, StyleSheet, Dimensions} from "react-native";
import {useTheme} from "@/app/_layout";
import {createDefaultStyles} from "@/components/defaultStyles";
import ActionButton from "@/components/settingsComponents/actionButton";

// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

// -------- Grid Visuals --------

const roomSize = [600, 900];
const gridSize = [0.8 * width, 0.55 * height];

const tableWidth = 50;

var scaleX = roomSize[0] / gridSize[0];
var scaleY = roomSize[1] / gridSize[1];


export default function DragAndDrop() {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);



    const [boxes, setBoxes] = useState([
        { id: 1, x: 50, y: 50 }, // Initial position of Box 1
        { id: 2, x: 150, y: 150 }, // Initial position of Box 2
    ]);

    const squareRef = useRef(null);

    const updateBoxPosition = (id: number, dx: number, dy: number) => {
        setBoxes((prevBoxes) =>
            prevBoxes.map((box) => {
                if (box.id === id) {
                    const newX = Math.max(0, Math.min(gridSize[0] - 60, box.x + dx)); // Clamp x position
                    const newY = Math.max(0, Math.min(gridSize[1] - 100, box.y + dy)); // Clamp y position
                    return { ...box, x: newX, y: newY };
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
                                uniqueStyles.table,
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
                    onPress={() => alert("Todo...")}
                />
            </View>
        </View>
    );
}

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        grid: {
            width: gridSize[0], // * scaleX once visuals are done
            height: gridSize[1], // * scaleY once visuals are done
            backgroundColor: '#D3D3D3',
            position: "relative",
            borderWidth: 2,
            borderColor: "#aaa",
        },
        table: {
            width: 60,
            height: 100,
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 4,
            backgroundColor: '#964B00'
        },
        boxText: {
            color: "#fff",
            fontWeight: "bold",
        },
        buttonContainer: {
            width: gridSize[0],
        }

    });
