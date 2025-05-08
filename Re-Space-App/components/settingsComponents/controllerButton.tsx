import { useRef, useState } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
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
    const [called, setCalled] = useState(false);

    /**
     * Send control messages to the target robot with a direction
     * @returns 
     */
    const startSending = () => {
        if (!isConnected) {
            console.warn("WebSocket not connected!");
            return;
        }

        console.log("Starting repeated movement:", message);
        sendMessage({ type: "control", target: targetRobot, direction: message });

        intervalRef.current = setInterval(() => {
            sendMessage({ type: "control", target: targetRobot, direction: message });
        }, 100); // repeat every 0.1 seconds
    };


    /**
     * Clear the sending interval and tell the robot to stop
     */
    const stopSending = () => {
        console.log("Stopping movement");
        if (intervalRef.current) {
            clearInterval(intervalRef.current); // Stop interval
            intervalRef.current = null;
        }
        sendMessage({ type: "control", target: targetRobot, direction: "stop" });
    };

    /**
     * Scanning-unique buttons, start the robot and save the layout
     */
    const scanningFunctions = () => {
        //if (text == "Start") sendMessage({ type: "control", target: targetRobot, direction: "stop" });
        if (text == "Save") sendMessage({ type: "get_map", target: targetRobot });

        setCalled(false)
    }

    return (
        <View>

            {text ?
            
                // Scanning unique buttons
                (
                    <Pressable
                        onPressIn={() => {
                            if (!called) {
                                setCalled(true)
                                scanningFunctions()
                            }
                        }}
                        style={({ pressed }) => [
                            { backgroundColor: pressed ? "lightgrey" : "green" },
                            styles.button,
                            buttonStyle,
                        ]}
                    >
                        <Text style={styles.text}>{text}</Text>
                    </Pressable>
                )
                :

                // Normal controller buttons
                <Pressable
                    onPressIn={startSending}
                    onPressOut={stopSending}
                    style={({ pressed }) => [
                        { backgroundColor: pressed ? "lightgrey" : "grey" },
                        styles.button,
                        buttonStyle,
                    ]}
                >
                    <AntDesign name={iconName} size={iconSize} color={iconColor} />
                </Pressable>
            }
        </View >
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
