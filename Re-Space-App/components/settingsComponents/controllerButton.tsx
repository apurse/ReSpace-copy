import React from 'react';
import {Dimensions, Pressable, StyleSheet} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

async function sendMessage(data: Record<string, unknown>) {
    // Must have .local at end of hostname
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

const ControlButton = ({
                           iconName,
                           iconSize = 24,
                           iconColor = 'black',
                           buttonStyle,
                           message,
                       }: {
    onPressIn?: () => void;
    onPressOut?: () => void;
    iconName: keyof typeof AntDesign.glyphMap;
    iconSize?: number;
    iconColor?: string;
    buttonStyle?: object;
    message: string;
}) => {
    return (
        <Pressable
            onPressIn={() => {
                sendMessage({"control": message});
                console.log("Sending: movement:", message);
            }}
            onPressOut={() => {
                sendMessage({"control": "stop"});
                console.log("Sending: movement:", "stop");
            }}
            style={({ pressed }) => [
                {
                    backgroundColor: pressed ? 'lightgrey' : 'grey',
                },
                styles.button,
                buttonStyle,
            ]}
        >
            <AntDesign name={iconName} size={iconSize} color={iconColor} />
        </Pressable>
    );
};

const styles = StyleSheet.create({
    button: {
        borderRadius: 10,
        width: width*0.2,
        height: width*0.2,
        marginBottom:10,
        marginLeft:10,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: isDarkMode ? '#fff' : '#000',
        // backgroundColor: 'lightgrey'
    },
});

export default ControlButton;
