// https://reactnative.dev/docs/network

import React, {useContext, useEffect, useState} from 'react';
import { StyleSheet, ScrollView, Text, View, Pressable, Dimensions } from 'react-native';
import ToggleSetting from '@/components/settingsComponents/toggle';
import SliderSetting from '@/components/settingsComponents/slider';
import ActionButton from '@/components/settingsComponents/actionButton';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from "expo-router";
import {useSocket} from "@/hooks/useSocket";
import { Robot } from "@/components/models/Robot";
// import { testLatency } from "@/hooks/useSocket";

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    let hasLoaded = false;


    // Add state for each independent toggle
    const [stopWhenHumansPresent, setStopWhenHumansPresent] = useState(false);
    const [completedTasks, setCompletedTasks] = useState(false);
    const [collisions, setCollisions] = useState(false);
    const [batteryLevels, setBatteryLevels] = useState(false);
    // const [test, setTest] = useState(false);
    const [movementSpeed, setMovementSpeed] = useState(2);
    const [batteryNotificationThreshold, setBatteryNotificationThreshold] = useState(15);
    const { socket, isConnected, robotData, sendMessage} = useSocket();
    // Convert dictionary into an array of robots for iteration


    // Use this in future to dynamically update
    // useEffect(() => {
    //     console.log("UI Component Updated with robotData:", robotData); // Logs when UI receives updates
    // }, [robotData]); // Triggers only when robotData updates


    useEffect(() => {
        loadLocalSettings();
    }, []);

    async function loadLocalSettings() {
        if (hasLoaded) return;
        hasLoaded = true;


        try {
            const movementSpeed = await AsyncStorage.getItem('movementSpeed');
            setMovementSpeed(movementSpeed != null ? parseFloat(movementSpeed) : 2);
        } catch (error) {
            console.error("Error loading 'movementSpeed' setting:", error);
            setMovementSpeed(-1);
        }

        try {
            const stopWhenHumansPresent = await AsyncStorage.getItem('stopWhenHumansPresent');
            setStopWhenHumansPresent(stopWhenHumansPresent == 'true');
        } catch (error) {
            console.error("Error loading 'stopWhenHumansPresent' setting:", error);
            setStopWhenHumansPresent(false);
        }

        try {
            const completedTasks = await AsyncStorage.getItem('completedTasks');
            setCompletedTasks(completedTasks == 'true');
        } catch (error) {
            console.error("Error loading 'completedTasks' setting:", error);
            setCompletedTasks(false);
        }

        try {
            const collisions = await AsyncStorage.getItem('collisions');
            setCollisions(collisions == 'true');
        } catch (error) {
            console.error("Error loading 'collisions' setting:", error);
            setCollisions(false);
        }

        try {
            const batteryLevels = await AsyncStorage.getItem('batteryLevels');
            setBatteryLevels(batteryLevels == 'true');
        } catch (error) {
            console.error("Error loading 'batteryLevels' setting:", error);
            setBatteryLevels(false);
        }

        try {
            const batteryNotificationThreshold = await AsyncStorage.getItem('batteryNotification');
            setBatteryNotificationThreshold(batteryNotificationThreshold != null ? parseFloat(batteryNotificationThreshold) : 15);
        } catch (error) {
            console.error("Error loading 'batteryNotification' setting:", error);
            setBatteryNotificationThreshold(-1);
        }

    }


    async function onChangeFunction(settingFunction: any, key: any, value: any) {
        if (value != null) {
            settingFunction(value);
            console.log("Changing value: " + value.toString());
            await AsyncStorage.setItem(key.toString(), value.toString());
            // alert("Key: " + settingFunction.toString());

        }
    }

    return (
        <ScrollView contentContainerStyle={defaultStyles.body}>
            <View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>
                    Settings
                </Text>
            </View>

            <View style={uniqueStyles.segmentContainer}>
                <View style={uniqueStyles.segmentTitleContainer}>
                    <Text style={[uniqueStyles.segmentTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                        Robot Settings
                    </Text>
                </View>

                <SliderSetting label="Movement Speed"
                    min={1}
                    max={3}
                    value={movementSpeed}
                    onValueChange={(value) => onChangeFunction(setMovementSpeed, "movementSpeed", value)}
                />
                {/*<ToggleSetting label="Test"*/}
                {/*    onValueChange={(value) => onChangeFunction(setTest, "test", value)}*/}
                {/*    value={test}*/}
                {/*/>*/}

                <ToggleSetting
                    label="Stop when humans present"
                    onValueChange={(value) => onChangeFunction(setStopWhenHumansPresent, "stopWhenHumansPresent", value)}
                    value={stopWhenHumansPresent}
                />
                <ActionButton
                    label="Re-map room"
                    onPress={() => alert("Re-mapping room")}
                />

                <Link href="/controller/controller" asChild>
                    <Pressable style={uniqueStyles.button}>
                        <Text style={uniqueStyles.buttonText}>Controller</Text>
                    </Pressable>
                </Link>

                <ActionButton
                    label="Test Connection"
                    onPress={async () => {
                        if (isConnected) {
                            // alert("Connected")
                            robotData.forEach((robot: Robot) => {
                                console.log(`🦾 ID: ${robot.robot_id}, 🔋 Battery: ${robot.battery}%`);
                            })
                        } else {
                            alert("No connection to the WebSocket.");
                        }
                        // let timeTaken = await testLatency({ type: "debug", message: "Testing message!" })
                        // alert(`${timeTaken}ms`);
                        alert("Todo, fix test Connection");
                    }}
                />
            </View>

            <View style={uniqueStyles.segmentContainer}>
                <View style={uniqueStyles.segmentTitleContainer}>
                    <Text style={[uniqueStyles.segmentTitle, { color: isDarkMode ? '#fff' : '#000' }]}>
                        App Settings
                    </Text>
                </View>

                <Text style={defaultStyles.sectionTitle}>
                    Notification Preferences
                </Text>
                <ToggleSetting
                    label="Completed Tasks"
                    value={completedTasks}
                    onValueChange={(value) => onChangeFunction(setCompletedTasks, "completedTasks", value)}
                />
                <ToggleSetting
                    label="Collisions"
                    value={collisions}
                    onValueChange={(value) => onChangeFunction(setCollisions, "collisions", value)}
                />
                <ToggleSetting
                    label="Battery Levels"
                    value={batteryLevels}
                    onValueChange={(value) => onChangeFunction(setBatteryLevels, "batteryLevels", value)}
                />
                <SliderSetting
                    label="Battery Notification Threshold"
                    min={1}
                    max={25}
                    value={batteryNotificationThreshold}
                    onValueChange={(value) => onChangeFunction(setBatteryNotificationThreshold, "batteryNotification", value)}
                />

                <Text style={defaultStyles.sectionTitle}>
                    Analytics and Reporting
                </Text>
                <ActionButton
                    label="Task History Logs"
                    onPress={() => alert("Todo...")}
                />

                <Text style={defaultStyles.sectionTitle}>
                    Theme
                </Text>
                <ToggleSetting
                    label="Dark Mode"
                    value={isDarkMode}
                    onValueChange={() => onChangeFunction(toggleTheme, "isDarkMode", theme == 'light')}
                />
            </View>
        </ScrollView>
    );
};

const uniqueStyles = StyleSheet.create({
    segmentContainer: {
        width: '100%',
        height: 'auto',
    },
    segmentTitleContainer: {
        width: '100%',
        height: 'auto',
    },
    segmentTitle: {
        textAlign: 'center',
        fontSize: 30,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 15,
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default SettingsPage;
