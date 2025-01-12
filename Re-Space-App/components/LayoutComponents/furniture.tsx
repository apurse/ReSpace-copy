import React, { useRef, useState } from "react";
import { StyleSheet, View, Text, PanResponder, Animated } from "react-native";
import * as Icons from '../indexComponents/Icons';
import { useTheme } from '../../app/_layout';


// drag and drop: https://reactnative.dev/docs/panresponder
// dragging functionality: https://www.geeksforgeeks.org/how-to-implement-drag-and-drop-functionality-in-react-native/
// get position: https://reactnative.dev/docs/animatedvaluexy#getlayout
export default function Furniture({ gridDimensions, furnitureName, furnitureID }: { gridDimensions: any, furnitureName: any, furnitureID: any }) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);


    const [dragging, setDragging] = useState(false);


    // ref for position
    const pan = useRef(new Animated.ValueXY()).current;


    // Get position of furniture top left
    const positionJSON = JSON.stringify(pan.getTranslateTransform());
    const position = JSON.parse(positionJSON);

    // Get position of furniture midpoint

    var tableWidth = uniqueStyles.table.width;
    var tableHeight = uniqueStyles.table.height;

    var positionX = parseFloat(position[0].translateX) + tableWidth / 2;
    var positionY = parseFloat(position[1].translateY) + tableHeight / 2;
    console.log(`X: ${positionX}`, `Y: ${positionY}`);

    
    // left
    if (positionX < tableWidth / 2) {
        console.log("X Outside");
        positionX = positionX + (tableWidth / 2);
        // change position here
    }

    // right
    if (positionX + tableWidth / 2 > gridDimensions[0]) {
        console.log("X Outside");
        positionX = gridDimensions[0] - tableWidth;
    }

    // top
    if (positionY < tableHeight / 2) {
        console.log("Y Outside");
        positionY = positionY + (tableHeight / 2);
    }
    
    // bottom
    if (positionY + tableHeight / 2 > gridDimensions[1]) {
        console.log("Y Outside");
        positionY = gridDimensions[1] - tableHeight;
    }


    // snapping functionality


    // output coordinates once done


    // create new gesture responder
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,


            // on click, set dragging 
            onPanResponderGrant: () => { setDragging(true) },


            // update and animate position when moved
            onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }]),


            // on release, finish dragging
            onPanResponderRelease: () => {
                pan.extractOffset();
                setDragging(false);
            },
        })
    ).current;


    // the component structure
    return (
        <Animated.View
            style={[
                uniqueStyles.table, // could change to be customisable by user inputs, dimensions and colour
                {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }],
                    opacity: dragging ? 0.8 : 1,
                },
            ]}
            {...panResponder.panHandlers}
        >
            <Text style={uniqueStyles.name}>{furnitureName}</Text>
            <Text style={uniqueStyles.ID}>ID: {furnitureID}</Text>
        </Animated.View>
    );
};


// css styling

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        name: {
            fontSize: 16,
            fontWeight: 'bold',
            marginLeft: 4,
            color: isDarkMode ? '#fff' : '#000',
        },
        ID: {
            fontSize: 12,
            fontWeight: 'bold',
            marginLeft: 4,
            color: isDarkMode ? '#fff' : '#000',
        },
        table: {
            width: 60,
            height: 100,
            borderRadius: 4,
            backgroundColor: '#964B00',
            // borderColor: '#000',
            // borderWidth: 3
        }
    })