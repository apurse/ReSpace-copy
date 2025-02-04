import React from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useSocket, sendMessage } from "@/hooks/useSocket";


const { width, height } = Dimensions.get('window');
const socket = useSocket();

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
                sendMessage(false, { "type": "control", "target": "respace-1", "direction": message });
                console.log("Sending: movement:", message);
            }}
            onPressOut={() => {
                sendMessage(false, { "type": "control", "target": "respace-1", "direction": "stop" });
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
