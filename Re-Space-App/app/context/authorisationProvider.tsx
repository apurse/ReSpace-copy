import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import { AppState } from "react-native";

// Create the authorisation Context
export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(false);
    const [user, setUser] = useState<object | null>();

    // Change login state
    useEffect(() => {
        if (user){
            console.log("User logged in: ", user);
            setLoggedIn(true);
            // alert("User successfully logged in!")
        }
        else{
            console.log("User not logged in");
            setLoggedIn(false);
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ loggedIn, user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
