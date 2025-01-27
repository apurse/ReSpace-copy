import React from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useSocket } from "@/hooks/useSocket";


const { width, height } = Dimensions.get('window');
const socket = useSocket();


// sends message data to websocket hook
const sendMessage = async (data: Record<string, unknown>) => {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.error("WebSocket is not open.");
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
                sendMessage({ "control": message });
                console.log("Sending: movement:", message);
            }}
            onPressOut={() => {
                sendMessage({ "control": "stop" });
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
        width: width * 0.2,
        height: width * 0.2,
        marginBottom: 10,
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: isDarkMode ? '#fff' : '#000',
        // backgroundColor: 'lightgrey'
    },
});

export default ControlButton;
