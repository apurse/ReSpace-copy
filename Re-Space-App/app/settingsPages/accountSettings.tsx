import { useState, useEffect } from "react";
import { View, StyleSheet, Text, TextInput, Dimensions, ScrollView } from "react-native";
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '../_layout';
import { useAuth } from "@/hooks/useAuth";
import ActionButton from '@/components/settingsComponents/actionButton';
import * as FileSystem from 'expo-file-system';
import { useRoom } from '@/hooks/useRoom';


// Get dimensions of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Controller() {

    // Hooks and colours
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);
    const { user, setUser, db, hashPassword } = useAuth();
    const { roomName, jsonData, updateJsonData } = useRoom();


    // User details
    const [username, setUsername] = useState<string>('');
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');


    // On user change, set the username
    useEffect(() => {
        setUsername(user.username);
    }, [user]);


    /**
     * Clear the selected JSON data.
     * @param clearAll Boolean - Clear the entire JSON
     */
    const clearLayoutJson = async (clearAll: boolean) => {
        try {

            var updateData = {
                ...jsonData,
                users: {
                    [user.username]: {
                        ...jsonData.users[user.username],
                        layouts: []
                    }
                }
            }



            // Erase the corresponding aspect (need to fix)
            if (clearAll) updateData = {};
            else jsonData.users[user.username] = { layouts: [] };


            updateJsonData()
            alert((clearAll) ? "All layouts for all accounts have been removed" : "All layouts for this account have been removed");

        } catch (error) {
            console.error('Error deleting JSON data');
        }
    };

    return (
        <ScrollView>
            <View style={defaultStyles.body}>
                <View style={uniqueStyles.segmentContainer}>


                    {/* Page Title */}
                    <View style={defaultStyles.pageTitleSection}>
                        <Text style={defaultStyles.pageTitle}>Account Settings</Text>
                    </View>


                    {/* Credentials (username and password) */}
                    <Text style={[defaultStyles.sectionTitle, { marginTop: 10 }]}>Credentials</Text>
                    <View style={uniqueStyles.inputField}>
                        <Text style={uniqueStyles.inputHeader}>Change Username</Text>
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            style={uniqueStyles.textInput}
                        />
                    </View>

                    <ActionButton
                        label="Change username"
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
                                setUser(false);

                            } catch (error) {
                                alert("Failed to change username!")
                                console.log(error);
                            }
                        }}
                    />

                    <View style={uniqueStyles.inputField}>
                        <Text style={uniqueStyles.inputHeader}>Current Password</Text>
                        <TextInput
                            onChangeText={setCurrentPassword}
                            style={uniqueStyles.textInput}
                            placeholder='*Enter current password...*'
                        />
                        <Text style={uniqueStyles.inputHeader}>New Password</Text>
                        <TextInput
                            value={user}
                            onChangeText={setNewPassword}
                            style={uniqueStyles.textInput}
                            placeholder='*Enter new password...*'
                        />
                    </View>

                    <ActionButton
                        label="Change password"
                        onPress={async () => {
                            if (!db) {
                                alert("DB not working")
                                return null;
                            }
                            try {

                                // Hash the passwords
                                var hashedCurrent = await hashPassword(currentPassword);
                                var hashedNew = await hashPassword(newPassword);


                                // Change the password based on the username and current password
                                let sqlChangePassword = `UPDATE users SET password = ? WHERE username = ? AND password = ?`;
                                await db.runAsync(
                                    sqlChangePassword,
                                    [hashedNew, user.username, hashedCurrent]
                                )
                                if (user.password !== hashedCurrent) {
                                    setUser(false);
                                    alert("Password successfully changed!")
                                }

                            } catch (error) {
                                alert("Failed to change password!")
                                console.log(error);
                            }
                        }}
                    />


                    {/* Account Management */}
                    <Text style={defaultStyles.sectionTitle}>Management</Text>

                    <ActionButton
                        label="Delete account"
                        style={{ backgroundColor: '#C62828' }}
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
                        style={{ backgroundColor: '#C62828' }}
                        onPress={() => clearLayoutJson(false)}
                    />


                    {/* Admin settings */}
                    <Text style={defaultStyles.sectionTitle}>Admin</Text>
                    <ActionButton
                        label="Delete all layouts for ALL accounts"
                        style={{ backgroundColor: '#C62828', borderColor: isDarkMode ? '#fff' : '#000', borderWidth: 3 }}
                        onPress={() => clearLayoutJson(true)}
                    />
                    <ActionButton
                        label="Delete ALL accounts on this device"
                        style={{ backgroundColor: '#C62828', borderColor: isDarkMode ? '#fff' : '#000', borderWidth: 3 }}
                        onPress={async () => {
                            if (!db) {
                                alert("DB not working")
                                return null;
                            }
                            try {

                                // Delete the entire DB table to remove all users
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
            </View>
        </ScrollView>
    );
}

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        button: {
            borderRadius: 20,
            marginBottom: 10,
            marginLeft: 10,
            width: screenWidth * 0.9,
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
        },
        segmentContainer: {
            width: '100%',
            height: 'auto',
        }
    });
