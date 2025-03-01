import React, { useState, useRef } from "react";
import { Dimensions, Pressable, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useSocket } from "@/hooks/useSocket";

const { width } = Dimensions.get("window");

const ControlButton = ({
                           iconName,
                           iconSize = 24,
                           iconColor = "black",
                           buttonStyle,
                           message,
                       }: {
    iconName: keyof typeof AntDesign.glyphMap;
    iconSize?: number;
    iconColor?: string;
    buttonStyle?: object;
    message: string;
}) => {
    const { sendMessage, isConnected } = useSocket();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startSending = () => {
        if (!isConnected) {
            console.warn("WebSocket not connected!");
            return;
        }

        console.log("Starting repeated movement:", message);
        sendMessage({ type: "control", target: "respace-1", direction: message });

        intervalRef.current = setInterval(() => {
            sendMessage({ type: "control", target: "respace-1", direction: message });
        }, 100); // Send message every 100ms
    };

    const stopSending = () => {
        console.log("Stopping movement");
        if (intervalRef.current) {
            clearInterval(intervalRef.current); // Stop interval
            intervalRef.current = null;
        }
        sendMessage({ type: "control", target: "respace-1", direction: "stop" });
    };

    return (
        <Pressable
            onPressIn={startSending} // Start sending commands when button is pressed
            onPressOut={stopSending} // Stop sending commands when button is released
            style={({ pressed }) => [
                { backgroundColor: pressed ? "lightgrey" : "grey" },
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
        alignItems: "center",
        justifyContent: "center",
    },
});

export default ControlButton;
