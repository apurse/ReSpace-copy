import React, { useState } from "react";
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
    const { sendMessage, robotData, isConnected  } = useSocket();

    return (
        <Pressable
            onPressIn={() => {
                sendMessage({ type: "control", target: "respace-1", direction: message });
                console.log("🚀 Sending movement:", message);
            }}
            onPressOut={() => {
                sendMessage({ type: "control", target: "respace-1", direction: "stop" });
                console.log("🛑 Stopping movement");
            }}
            style={({ pressed }) => [
                {
                    backgroundColor: pressed ? "lightgrey" : "grey",
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
        alignItems: "center",
        justifyContent: "center",
    },
});

export default ControlButton;
