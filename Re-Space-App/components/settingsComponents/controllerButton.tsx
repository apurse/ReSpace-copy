import { useRef } from "react";
import { Dimensions, Pressable, StyleSheet, Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useSocket } from "@/hooks/useSocket";

const { width } = Dimensions.get("window");

const ControlButton = ({
    iconName,
    iconSize = 24,
    iconColor = "black",
    buttonStyle,
    message,
    targetRobot,
    text,
}: {
    iconName?: keyof typeof AntDesign.glyphMap;
    iconSize?: number;
    iconColor?: string;
    buttonStyle?: object;
    message?: string;
    targetRobot?: string;
    text?: string
}) => {
    const { sendMessage, isConnected } = useSocket();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startSending = () => {
        if (!isConnected) {
            console.warn("WebSocket not connected!");
            return;
        }

        console.log("Starting repeated movement:", message);
        sendMessage({ type: "control", target: targetRobot, direction: message });

        intervalRef.current = setInterval(() => {
            sendMessage({ type: "control", target: targetRobot, direction: message });
        }, 100); // Send message every 100ms
    };

    const stopSending = () => {
        console.log("Stopping movement");
        if (intervalRef.current) {
            clearInterval(intervalRef.current); // Stop interval
            intervalRef.current = null;
        }
        sendMessage({ type: "control", target: targetRobot, direction: "stop" });
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
            {text &&
                <Text style={styles.text}>{text}</Text>
            }
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
    text: {
        fontSize: 18,
        fontWeight: 'bold'
    }
});

export default ControlButton;
