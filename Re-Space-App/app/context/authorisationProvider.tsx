import React, { createContext, useState } from "react";
import * as SQLite from 'expo-sqlite';


// Create the authorisation Context
export const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<object | null>();
    const [db, setdb] = useState<SQLite.SQLiteDatabase | null>(null);


    /**
     * Setup the authorisation database and check if the table exists
     */
    const setupDB = async () => {
        try {

            const getdb = await SQLite.openDatabaseAsync('usersDB.db');
            await getdb.runAsync(`
                CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY NOT NULL, username TEXT NOT NULL, password TEXT NOT NULL);
                `);
            setdb(getdb)

        } catch (error) {
            console.error("DB setup error:", error)
        }
    }

    setupDB();

    return (
        <AuthContext.Provider value={{ user, setUser, db }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
