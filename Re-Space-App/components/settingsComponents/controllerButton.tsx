import { useRef } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import { TabBarIonicons, TabBarMaterial, TabBarFontAwesome } from '@/components/navigation/TabBarIcon';
import { useSocket } from "@/hooks/useSocket";
import { useTheme } from '@/app/_layout';

const { width } = Dimensions.get("window");

const ControlButton = ({
    iconName,
    iconSize = 24,
    buttonStyle,
    message,
    targetRobot,
    text,
    onPress,
}: {
    iconName?: string;
    iconSize?: number;
    buttonStyle?: object;
    message?: string;
    targetRobot?: string;
    text?: string
    onPress?: () => void
}) => {
    const { sendMessage, isConnected } = useSocket();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);


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

    return (
        <View>
            {text ?
                // Scanning unique buttons
                (
                    <Pressable
                        onPress={() => {
                            if (onPress) onPress()
                        }}
                        style={({ pressed }) => [
                            { backgroundColor: pressed ? "lightgrey" : "green" },
                            uniqueStyles.button,
                            buttonStyle,
                        ]}
                    >
                        <Text style={uniqueStyles.text}>{text}</Text>
                    </Pressable>
                )
                :

                // Normal controller buttons
                <Pressable
                    onPressIn={startSending}
                    onPressOut={stopSending}
                    style={({ pressed }) => [
                        { backgroundColor: pressed ? (isDarkMode ? "grey" : "grey") : (isDarkMode ? "#000" : "#fff") },
                        uniqueStyles.button,
                        buttonStyle,
                    ]}
                >
                    {iconName &&
                        <TabBarFontAwesome name={iconName as any} size={iconSize} style={uniqueStyles.buttonIcon} />
                    }
                </Pressable>
            }
        </View >
    );
};

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        button: {
            width: width * 0.2,
            height: width * 0.2,
            marginBottom: 10,
            marginLeft: 10,
            alignItems: "center",
            justifyContent: "center",
            color: "green",
            borderRadius: 10,
            borderColor: isDarkMode ? "#fff" : "#000",
            borderWidth: 2.5
        },
        buttonIcon: {
            color: isDarkMode ? "#fff" : "#000"
        },
        text: {
            color: isDarkMode ? '#fff' : '#000',
            fontSize: 18,
            fontWeight: 'bold'
        }
    });

export default ControlButton;
