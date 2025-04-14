import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";

// Create the authorisation Context
export const AuthContext = createContext<any>(null);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(false);
    const [user, setUser] = useState<object | null>();

    // Function to connect WebSocket
    const login = useCallback(() => {
        if (loggedIn) {
            console.warn("User already logged in!");
            return;
        }

        console.log("Logging in...");
        // setLoggedIn(false)
    }, [loggedIn]);

    // Initialise WebSocket on mount
    useEffect(() => {
        login();

        // // Cleanup WebSocket only when app closes
        // return () => {
        //     if (socket) {
        //         console.log("Closing WebSocket...");
        //         socket.close();
        //     }
        //     if (reconnectInterval.current) {
        //         clearInterval(reconnectInterval.current);
        //         reconnectInterval.current = null;
        //     }
        // };
    }, [login]);

    // Handle App Background/Foreground state changes
    // useEffect(() => {
    //     const handleAppStateChange = (nextAppState: string) => {
    //         if (nextAppState === "active" && !user) {
    //             console.log("App resumed, automatically logging in...");
    //             login();
    //         } else {
    //             // Useful for knowing what the apps doing
    //             console.log("App changed state: ", nextAppState);
    //         }
    //     };

    //     const subscription = AppState.addEventListener("change", handleAppStateChange);
    //     return () => subscription.remove();
    // }, [user, login]);

    return (
        <AuthContext.Provider value={{ loggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
