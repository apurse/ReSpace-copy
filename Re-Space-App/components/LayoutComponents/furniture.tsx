import React, { useRef, useState } from "react";
import { StyleSheet, View, Text, PanResponder, Animated } from "react-native";
import * as Icons from '../indexComponents/Icons';
import { useTheme } from '../../app/_layout';


// drag and drop: https://reactnative.dev/docs/panresponder
// dragging functionality: https://www.geeksforgeeks.org/how-to-implement-drag-and-drop-functionality-in-react-native/
export default function Furniture({ furnitureName, furnitureID }: { furnitureName: any, furnitureID: any }) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);

    const [dragging, setDragging] = useState(false);

    // ref for position
    const pan = useRef(new Animated.ValueXY()).current;


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


    // store coordinates in JSON


    // the component structure
    return (
        <Animated.View
            style={[
                uniqueStyles.table,
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
            backgroundColor: '#964B00'
        }
    })