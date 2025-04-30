import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";
import { Robot } from "@/components/models/Robot";

// Create the WebSocket Context
export const WebSocketContext = createContext<any>(null);

const WS_URL = "ws://respace-hub.local:8002/app";


export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [robotData, setRobotData] = useState<Robot[]>([]);
    const [latencyData, setLatencyData] = useState<number>();
    const [QRCode, setQRCode] = useState<string>();
    const [roomMap, setRoomMap] = useState<string>();
    const reconnectInterval = useRef<NodeJS.Timeout | null>(null);

    // Function to connect WebSocket
    const connectWebSocket = useCallback(() => {
        if (socket) {
            console.warn("WebSocket already connected!");
            return;
        }

        console.log("Connecting WebSocket...");

        const ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log("WebSocket connection established.");
            setIsConnected(true);
            setSocket(ws);

            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current); // Clear previous reconnect attempts
                reconnectInterval.current = null;
            }
        };

        ws.onerror = (error) => {
            console.log("WebSocket Error:", error);
            setIsConnected(false);
            setSocket(null);
            setRobotData([]);

            // Start reconnection loop if not already running
            if (!reconnectInterval.current) {
                console.log("Starting reconnection attempts...");
                reconnectInterval.current = setInterval(() => {
                    connectWebSocket();
                }, 50000000); // Retry every 5 seconds
            }
        };

        ws.onclose = (e) => {
            console.warn(`WebSocket closed: ${e.reason}`);
            setIsConnected(false);
            setSocket(null);
            setRobotData([]);

            // Start reconnection loop if not already running
            if (!reconnectInterval.current) {
                console.log("Starting reconnection attempts...");
                reconnectInterval.current = setInterval(() => {
                    connectWebSocket();
                }, 5000); // Retry every 5 seconds
            }
        };


        // a message was received
        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                // console.log("Received:", data);

                // Only update state if type === "status"
                if (data.type === "robot_list") {
                    // If empty, update to empty list
                    if (!Array.isArray(data.robots)) {
                        setRobotData([]);
                        return
                    }
                    console.log("Initial Data incoming: ", data.robots);
                    // Convert JSON data into Robot objects
                    const newRobotData = data.robots.map((robot: { robot_id: string; battery: number; location: { x: number; y: number; }; current_activity: string; carrying: string | null; angle: number;}) =>
                        new Robot(
                            robot.robot_id,
                            robot.battery,
                            robot.location,
                            robot.current_activity,
                            robot.carrying,// furniture ID
                            robot.angle
                        )
                    );
                    setRobotData(newRobotData); // Array of robot objects

                } else if (data.type === "latency_test") {
                    const timeTaken = Date.now() - Number(data.start_time);
                    setLatencyData(timeTaken)
                    console.log("Time taken: ${timeTaken} ms");
                    // Reset to undefined after 1 second
                    // This prevents the same result not notifying the user due to no data update
                    setTimeout(() => {
                        setLatencyData(undefined);
                        console.log("Latency data reset");
                    }, 1000);

                } else if (data.type === "new_furniture") {

                    const base64String = data.base64;
                    setQRCode(base64String);
                    // console.log(base64String);

                } else if (data.type === "room_map") {

                    const base64String = data.base64;
                    setRoomMap(base64String);
                    // console.log(base64String);

                } else {
                    console.log("Ignored message (not status):", data.type);
                }
            } catch (err) {
                console.error("Error parsing message:", err);
            }
        };
    }, []);

    // Initialise WebSocket on mount
    useEffect(() => {
        connectWebSocket();

        // Cleanup WebSocket only when app closes
        return () => {
            if (socket) {
                console.log("Closing WebSocket...");
                socket.close();
            }
            if (reconnectInterval.current) {
                clearInterval(reconnectInterval.current);
                reconnectInterval.current = null;
            }
        };
    }, [connectWebSocket]);

    // Handle App Background/Foreground state changes
    useEffect(() => {
        const handleAppStateChange = (nextAppState: string) => {
            if (nextAppState === "active" && !isConnected) {
                console.log("App resumed, attempting WebSocket reconnection...");
                connectWebSocket();
            } else {
                // Useful for knowing what the apps doing
                console.log("App changed state: ", nextAppState);
            }
        };

        const subscription = AppState.addEventListener("change", handleAppStateChange);
        return () => subscription.remove();
    }, [isConnected, connectWebSocket]);

    return (
        <WebSocketContext.Provider value={{ socket, isConnected, robotData, latencyData, QRCode, roomMap }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export default SocketProvider;
