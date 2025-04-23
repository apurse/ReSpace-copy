import Modal from "react-native-modal";
import { View, ScrollView, StyleSheet, Text, Dimensions, TextInput, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '@/app/_layout';
import ActionButton from '@/components/settingsComponents/actionButton';
import * as FileSystem from 'expo-file-system';
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import * as Crypto from 'expo-crypto';
import * as Icons from '../../components/indexComponents/Icons';



// Defining types for function
interface LoginModalProps {
    isVisible: boolean;
    onClose: () => void;
}
const { width, height } = Dimensions.get('window');

export const LoginModal: React.FC<LoginModalProps> = ({ isVisible, onClose }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const { socket, isConnected, sendMessage } = useSocket();
    const { loggedIn, user, setUser, db } = useAuth();
    const [notifications, setnotifications] = useState<string | null>(null);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    // 
    /**
     * Grab instance of the entered password and hash it
     * @param password The inputted password
     * @returns hashedPassword | The hashed password
     */
    const hashPassword = async (password: string) => {
        const passwordInstance = password;
        const hashedPassword = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA512,
            passwordInstance
        )
        return hashedPassword;
    }

    // Check db and fields work, and get first instance of username
    const checks = async () => {
        if (!db) {
            alert("DB not working")
            return null;
        }

        // If not filled in correctly
        if (!username || !password) {
            setnotifications('Please fill the necessary fields (Marked with \'*\')');
            setTimeout(() => setnotifications(null), 3000);
            return null;
        };

        var hashedPassword = await hashPassword(password);

        // Command for checking if username is in db
        let sqlCheckUsername = `SELECT * FROM users WHERE username = ?`;

        // Get the first instance of the inputted username and store using the parameters
        const firstResult = await db.getFirstAsync(sqlCheckUsername, username);
        const rowFound = (firstResult as { id: number, username: string, password: string })

        return { rowFound: rowFound, hashedPassword: hashedPassword };
    }


    // Check and verify that the user can login
    const userLogin = async () => {

        try {

            var checkResults = await checks();

            // If the row containing the username is found
            if (checkResults?.rowFound != null) {

                // If the hashed password input equals the row password
                if (checkResults.hashedPassword == checkResults.rowFound.password) {
                    // console.log(`logged password: ${checkResults.rowFound.password}.... entered password: ${checkResults.hashedPassword}`)
                    var password = checkResults.hashedPassword;
                    setUser({ username, password });

                    // Reset login
                    setUsername('')
                    setPassword('')
                    return;
                }
                else {
                    alert("Password is incorrect.")
                    return;
                }
            }
            else alert("Username unknown.");
        }
        catch (error) {
            console.error('Failed to login', error);
            setnotifications('Failed to login.')
            setTimeout(() => setnotifications(null), 3000);
        }
    };


    // Add new users to the database
    const addNewUser = async () => {

        try {

            // Check db and fields work, and get first instance of username
            var checkResults = await checks();


            // Reject if a row containing the username already exists
            if (checkResults?.rowFound != null) {
                alert("Username already in use!")
                return;
            }
            else {

                // Add the new username and password into the db
                let sqlInsert = `INSERT INTO users(username, password) VALUES (?, ?)`;
                await db.runAsync(
                    sqlInsert,
                    [username, checkResults?.hashedPassword]
                )

                // Log in automatically
                alert("New user added, logging in now...")
                var password = checkResults?.hashedPassword;
                setUser({ username, password });

                // Reset login
                setUsername('')
                setPassword('')
            }
        }
        catch (error) {
            console.error('Failed to login', error);
            setnotifications('Failed to login.')
            setTimeout(() => setnotifications(null), 3000);
        }
    };

    return (
        <Modal isVisible={isVisible} style={uniqueStyles.modal} onBackdropPress={onClose}>
            <View style={uniqueStyles.modalContent}>
                <ScrollView contentContainerStyle={defaultStyles.body}>

                    <TouchableOpacity style={uniqueStyles.closeButton} onPress={onClose}>
                        <Text style={uniqueStyles.closeText}>Close</Text>
                    </TouchableOpacity>
                    {/* Content */}
                    <View style={defaultStyles.pageTitleSection}>
                        <Text style={defaultStyles.pageTitle}>Login</Text>
                    </View>

                    <View style={uniqueStyles.inputField}>
                        <Text style={uniqueStyles.inputHeader}>Username</Text>
                        <TextInput
                            value={username}
                            onChangeText={setUsername}
                            style={uniqueStyles.textInput}
                            placeholder='*Enter Username or Email...*'
                            placeholderTextColor={isDarkMode ? '#000' : '#fff'}
                        />
                    </View>

                    <View style={uniqueStyles.inputField}>
                        <Text style={uniqueStyles.inputHeader}>Password</Text>
                        <TextInput
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                            style={uniqueStyles.textInput}
                            placeholder='*Enter password...*'
                            placeholderTextColor={isDarkMode ? '#000' : '#fff'}
                        />
                        <ActionButton
                            icon={React.createElement(showPassword ? Icons.EyeIcon : Icons.EyeSlashIcon)}
                            style={uniqueStyles.eyeContainer}
                            onPress={toggleShowPassword}
                        />
                    </View>

                    {notifications && <Text style={uniqueStyles.notificationText}>{notifications}</Text>}
                    <ActionButton
                        label="Forgot password?"
                        onPress={() => alert("WIP")}
                        style={uniqueStyles.forgotPassword}
                        textS={uniqueStyles.forgotPassword}
                    />

                    <ActionButton
                        label="Login"
                        onPress={userLogin}
                        style={{ width: '80%' }}
                    />

                    <View style={uniqueStyles.createAccount}>
                        <Text style={uniqueStyles.inputHeader}>Not made an account? Create one below!</Text>
                        <ActionButton
                            label="Create Account"
                            onPress={addNewUser}
                            style={{ width: '90%' }}
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};


const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({

        // ---------- MODAL SETTINGS ----------
        modal: {
            justifyContent: 'flex-end',
            margin: 0,
        },
        modalContent: {
            backgroundColor: isDarkMode ? '#000' : '#fff',
            padding: 10,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
            minHeight: '80%',
        },
        closeButton: {
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'red',
            padding: 10,
            alignItems: 'center',
            borderRadius: 5,
        },
        closeText: {
            color: "white",
            fontSize: 16,
        },


        // ---------- LOGIN PAGE SETTINGS ----------

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
            backgroundColor: isDarkMode ? 'white' : '#242424',
            color: isDarkMode ? '#000' : '#fff',
            fontSize: 14,
            fontWeight: 'bold',
            fontFamily: 'arial',
        },
        forgotPassword: {
            padding: 0,
            backgroundColor: 'null',
            textDecorationColor: '#269bd1',
            textDecorationLine: 'underline',
            color: '#269bd1'
        },
        createAccount: {
            width: '100%',
            alignItems: 'center',
            textAlign: 'center',
            padding: 20,
            marginTop: 100,
            backgroundColor: 'null',
        },
        notificationText: {
            position: 'absolute',
            top: 100,
            left: 0,
            right: 0,
            backgroundColor: isDarkMode ? 'rgba(255,255, 255, 0.7)' : 'rgba(0,0, 0, 0.7)',
            color: isDarkMode ? '#000' : '#fff',
            padding: 10,
            borderRadius: 5,
            marginBottom: 15,
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
            zIndex: 1000,
        },
        eyeContainer: {
            marginLeft: 10,
            backgroundColor: '',
            padding: 0,
            alignItems: 'center',
            borderRadius: 5,
            marginTop: 20,
            verticalAlign: 'middle',
            top: -53,
            left: 130,
        }
    });
