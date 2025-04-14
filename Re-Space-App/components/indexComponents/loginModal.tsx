import Modal from "react-native-modal";
import { View, ScrollView, StyleSheet, Text, Dimensions, TextInput, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '@/app/_layout';
import ActionButton from '@/components/settingsComponents/actionButton';
import * as FileSystem from 'expo-file-system';
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";


// Defining types for function
interface LoginModalProps {
    isVisible: boolean;
    onClose: () => void;
}
const { width, height } = Dimensions.get('window');

export const LoginModal: React.FC<LoginModalProps> = ({ isVisible, onClose }) => {



    // Useful for deleting account
    // // Call function to clear the json data from device
    // const clearJsonData = async () => {
    //   try {
    //     await FileSystem.writeAsStringAsync(localJson, JSON.stringify({ Furniture: [] }));

    //     console.log('Data has been cleared');
    //   } catch (error) {
    //     console.error('Error deleting json data');
    //   }
    // };


    // Could be used for creating user
    // // Adding data to json
    // const updateData = [...jsonData.Furniture, userConnected];

    // // Write new data to json
    // await FileSystem.writeAsStringAsync(localJson, JSON.stringify({ Furniture: updateData }));

    // // Show local json file in console
    // const data = await FileSystem.readAsStringAsync(localJson);
    // // console.log('Furniture json updated:', data);

    // Get dimensions of the screen


    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { socket, isConnected, sendMessage } = useSocket();
    const { loggedIn, user, setUser } = useAuth();


    const [notifications, setnotifications] = useState<string | null>(null);


    const authorise = async () => {

        // If not filled in correctly
        if (!username || !password) {
            setnotifications('Please fill the necessary fields (Marked with \'*\')');
            setTimeout(() => setnotifications(null), 3000);

            return;
        };

        const userConnected = {
            username,
            password,
        };

        console.log(userConnected)

        try {


            // if user is in db:
            //   connect as that user
            //   on main page have "good morning ${user}
            //   add an account bit in settings

            // temp
            if (userConnected.username == "test1"){
                setUser(userConnected);
            }


            // // Tell server user has connected (optional)
            // if (isConnected) {
            //     sendMessage({ type: "account_login", data: userConnected });
            // } else {
            //     alert("No connection to the WebSocket.");
            // }

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
                        />
                    </View>

                    <View style={uniqueStyles.inputField}>
                        <Text style={uniqueStyles.inputHeader}>Password</Text>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            style={uniqueStyles.textInput}
                            placeholder='*Enter password...*'
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
                        onPress={authorise}
                        style={{ width: '80%' }}
                    />

                    <View style={uniqueStyles.createAccount}>
                        <Text style={uniqueStyles.inputHeader}>Not made an account? Create one below!</Text>
                        <ActionButton
                            label="Create Account"
                            onPress={() => alert("WIP")}
                            style={{ width: '90%' }}
                        />
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}



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
            backgroundColor: isDarkMode ? 'white' : 'black',
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
        }
    });
