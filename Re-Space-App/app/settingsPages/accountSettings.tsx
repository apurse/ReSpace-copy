import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TextInput, Dimensions, ScrollView } from "react-native";
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '../_layout';
import { useAuth } from "@/hooks/useAuth";
import ActionButton from '@/components/settingsComponents/actionButton';
import * as FileSystem from 'expo-file-system';



const layoutJson = FileSystem.documentDirectory + 'layouts.json';

const { width, height } = Dimensions.get('window');

export default function Controller() {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);

    const { loggedIn, user, setUser, db } = useAuth();
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');


    useEffect(() => {
        setUsername(user.username);
    }, [user]);


    // Call function to clear the json data from device
    const clearJsonData = async (all: boolean) => {
        try {


            // Read data from json before writing new data
            const readData = await FileSystem.readAsStringAsync(layoutJson);
            let jsonData = {
                [user.username]: {
                    layouts: []
                }
            };

            // Check there is data
            if (readData) jsonData = JSON.parse(readData);


            // Erase the corresponding aspect
            if (all) jsonData = {};
            else jsonData[user.username] = { layouts: [] };


            // Write to JSON and alert user
            await FileSystem.writeAsStringAsync(layoutJson, JSON.stringify(jsonData));
            alert((all) ? "All layouts for all accounts have been removed" : "All layouts for this account have been removed");


            // Show it happening 
            const data = await FileSystem.readAsStringAsync(layoutJson);
            console.log('Layout json updated:', data);

        } catch (error) {
            console.error('Error deleting JSON data');
        }
    };

    return (
        <ScrollView>

            <View style={defaultStyles.body}>

                {/* Page Title */}
                <View style={defaultStyles.pageTitleSection}>
                    <Text style={defaultStyles.pageTitle}>Account Settings</Text>
                </View>

                <View style={uniqueStyles.inputField}>
                    <Text style={uniqueStyles.inputHeader}>Change Username</Text>
                    <TextInput
                        value={username}
                        onChangeText={setUsername}
                        style={uniqueStyles.textInput}
                    // placeholder='{}'
                    />
                </View>

                <ActionButton
                    label="Change username"
                    // textS={uniqueStyles.buttonText}
                    onPress={async () => {
                        if (!db) {
                            alert("DB not working")
                            return null;
                        }
                        try {

                            // Update the username
                            let sqlUpdateUsername = `UPDATE users SET username = ? WHERE username = ?`;
                            await db.runAsync(
                                sqlUpdateUsername,
                                [username, user.username]
                            )
                            alert("Username successfully changed!")

                            // need to add dynamic refresh, log user out then back in 

                            // await setUser(false);
                            // await setUser(user)

                        } catch (error) {
                            alert("Failed to change username!")
                            console.log(error);
                        }
                    }
                    }
                />

                <View style={uniqueStyles.inputField}>
                    <Text style={uniqueStyles.inputHeader}>Current Password</Text>
                    <TextInput
                        onChangeText={setPassword}
                        style={uniqueStyles.textInput}
                    // placeholder='*Enter password...*'
                    />
                    <Text style={uniqueStyles.inputHeader}>New Password</Text>
                    <TextInput
                        value={user}
                        onChangeText={setPassword}
                        style={uniqueStyles.textInput}
                    // placeholder='*Enter password...*'
                    />
                </View>



                <ActionButton
                    label="Change password"
                    // textS={uniqueStyles.buttonText}
                    onPress={() => alert("WIP")

                        // async () => {
                        // if (!db) {
                        //     alert("DB not working")
                        //     return null;
                        // }
                        // try {

                        //     // Add the new username and password into the db
                        //     let sqlDelete = `UPDATE users SET username = ? WHERE username = ?`;
                        //     await db.runAsync(
                        //         sqlDelete,
                        //         [user.username]
                        //     )
                        //     setUser(false);
                        //     alert("User successfully deleted!")

                        // } catch (error) {
                        //     alert("Failed to delete user!")
                        //     console.log(error);
                        // }}
                    }
                />
                <ActionButton
                    label="Delete account"
                    // textS={uniqueStyles.buttonText}
                    onPress={async () => {
                        if (!db) {
                            alert("DB not working")
                            return null;
                        }
                        try {

                            // Delete the user from the db
                            let sqlDelete = `DELETE FROM users WHERE username = ?`;
                            await db.runAsync(
                                sqlDelete,
                                [user.username]
                            )
                            setUser(false);
                            alert("User successfully deleted!")

                        } catch (error) {
                            alert("Failed to delete user!")
                            console.log(error);
                        }
                    }}
                />
                <ActionButton
                    label="Delete all layouts for this account"
                    // textS={uniqueStyles.buttonText}
                    onPress={() => clearJsonData(false)}
                />

                <Text style={defaultStyles.sectionTitle}>Admin</Text>
                <ActionButton
                    label="Delete all layouts for ALL accounts"
                    // textS={uniqueStyles.buttonText}
                    onPress={() => clearJsonData(true)}
                />
                <ActionButton
                    label="Delete ALL accounts on this device"
                    // textS={uniqueStyles.buttonText}
                    onPress={async () => {
                        if (!db) {
                            alert("DB not working")
                            return null;
                        }
                        try {

                            // Delete the entire table to remove all users
                            await db.runAsync(`DROP TABLE IF EXISTS users`)
                            setUser(false);
                            alert("All users removed!")

                        } catch (error) {
                            alert("Failed to delete all users!")
                            console.log(error);
                        }
                    }}
                />
            </View>
        </ScrollView>
    );
}

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        button: {
            borderRadius: 20,
            // width: width * 0.9,
            // height: width * 0.2,
            marginBottom: 10,
            marginLeft: 10,
        },
        inputField: {
            width: '100%',
            padding: 20,
            paddingBottom: 0,
        },
        inputHeader: {
            fontSize: 16,
            color: isDarkMode ? '#fff' : '#333',
            paddingBottom: 5,
        },
        textInput: {
            width: '100%',
            borderRadius: 4,
            paddingLeft: 4,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 40,
            backgroundColor: isDarkMode ? 'white' : 'black',
            color: isDarkMode ? '#000' : '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            fontFamily: 'arial',
        }
    });
