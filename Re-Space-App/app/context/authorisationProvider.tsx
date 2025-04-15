import React, { createContext, useState, useEffect, useRef, useCallback } from "react";
import * as SQLite from 'expo-sqlite';


// Create the authorisation Context
export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [loggedIn, setLoggedIn] = useState<boolean | null>(false);
    const [user, setUser] = useState<object | null>();
    const [db, setdb] = useState<SQLite.SQLiteDatabase | null>(null);


    // Setup the database by accessing the file and checking the table exists
    const setupDB = async () => {
        const getdb = await SQLite.openDatabaseAsync('usersDB.db');
        await getdb.runAsync(`
            CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, username TEXT NOT NULL, password TEXT NOT NULL);
        `);
        setdb(getdb)
    }

    setupDB();


    // Change login state
    useEffect(() => {
        if (user) {
            console.log("User logged in: ", user);
            setLoggedIn(true);
        }
        else {
            console.log("User not logged in");
            setLoggedIn(false);
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ loggedIn, user, setUser, db }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
