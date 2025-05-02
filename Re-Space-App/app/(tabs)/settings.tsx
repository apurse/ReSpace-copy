import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, Pressable, Dimensions } from 'react-native';
import ToggleSetting from '@/components/settingsComponents/toggle';
import SliderSetting from '@/components/settingsComponents/slider';
import ActionButton from '@/components/settingsComponents/actionButton';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from "expo-router";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";
import * as Icons from '../../components/indexComponents/Icons';

// Get dimensions of the screen
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');


const SettingsPage = () => {

    // Hooks and colours
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);
    const { isConnected, sendMessage, latencyData } = useSocket();
    const { user, setUser } = useAuth();

    // Settings
    const [stopWhenHumansPresent, setStopWhenHumansPresent] = useState(true);
    const [completedTasks, setCompletedTasks] = useState(false);
    const [collisions, setCollisions] = useState(false);
    const [batteryLevels, setBatteryLevels] = useState(false);
    const [movementSpeed, setMovementSpeed] = useState(2);
    const [batteryNotificationThreshold, setBatteryNotificationThreshold] = useState(15);

    let hasLoaded = false;


    // Display latency data when value changes
    useEffect(() => {
        if (latencyData != undefined) {
            alert(`Websocket latency: ${latencyData}ms`);
        }
    }, [latencyData]);


    // On page refresh, load local settings
    useEffect(() => {
        loadLocalSettings();
    }, []);


    /**
     * Retrieve and set the devices saved settings
     */
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


    /**
     * Change the setting value based on user interaction.
     * @param settingFunction The setting value being changes.
     * @param key The setting key ?
     * @param value The value being set for the setting.
     */
    async function onChangeFunction(settingFunction: any, key: any, value: any) {
        if (value != null) {
            settingFunction(value);
            console.log("Changing value: " + value.toString());
            await AsyncStorage.setItem(key.toString(), value.toString());
        }
    }

    return (
        <ScrollView contentContainerStyle={defaultStyles.body}>


            {/* Page title */}
            <View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>
                    Settings
                </Text>
            </View>


            {/* Account settings */}
            <View style={uniqueStyles.segmentContainer}>
                {user ?
                    <Link href="/settingsPages/accountSettings" asChild>
                        <Pressable style={uniqueStyles.accountSettings}>
                            <Icons.UserCircle />
                            <View>
                                <Text style={[uniqueStyles.buttonText, { fontSize: 24, fontWeight: 'bold' }]}>{user.username}</Text>
                                <Text style={[uniqueStyles.buttonText, { fontSize: 16 }]}>Account settings</Text>
                            </View>
                        </Pressable>
                    </Link>
                    :
                    <Pressable style={uniqueStyles.accountSettings}>
                        <Icons.UserCircle />
                        <View>
                            <Text style={[uniqueStyles.buttonText, { fontSize: 24, fontWeight: 'bold' }]}>Please Login!</Text>
                            <Text style={[uniqueStyles.buttonText, { fontSize: 16 }]}>Account settings</Text>
                        </View>
                    </Pressable>
                }
            </View>


            {/* Robot Settings */}
            <View style={uniqueStyles.segmentContainer}>
                <Text style={uniqueStyles.subSectionTitle}>
                    Robot Settings
                </Text>

                <SliderSetting label="Movement Speed"
                    min={1}
                    max={3}
                    value={movementSpeed}
                    onValueChange={(value) => onChangeFunction(setMovementSpeed, "movementSpeed", value)}
                />

                <ToggleSetting
                    label="Stop when humans present"
                    onValueChange={(value) => onChangeFunction(setStopWhenHumansPresent, "stopWhenHumansPresent", value)}
                    value={stopWhenHumansPresent}
                />

                <ActionButton
                    label="Re-map room"
                    onPress={() => alert("Re-mapping room")}
                    style={uniqueStyles.button}
                />

                <ActionButton
                    label="Controller"
                    style={uniqueStyles.button}
                    onPress={() => {
                        router.push("/settingsPages/controller")
                    }}
                />

                <ActionButton
                    label="Test Connection"
                    style={uniqueStyles.button}
                    onPress={async () => {
                        if (isConnected) {
                            sendMessage({ type: "latency_test", start_time: Date.now() });
                        } else {
                            alert("No connection to the WebSocket.");
                        }
                    }}
                />
            </View>


            {/* App Settings */}
            <View style={uniqueStyles.segmentContainer}>
                <Text style={uniqueStyles.subSectionTitle}>
                    App Settings
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
                <ActionButton
                    label="Task History Logs"
                    onPress={() => alert("Todo...")}
                />

                <Text style={uniqueStyles.subSectionTitle}>
                    Theme
                </Text>
                <ToggleSetting
                    label="Dark Mode"
                    value={isDarkMode}
                    onValueChange={() => onChangeFunction(toggleTheme, "isDarkMode", theme == 'light')}
                />
            </View>

            {/* Sign out button */}
            {user &&
                <Link href="/" asChild>
                    <ActionButton
                        label="Sign out"
                        onPress={() => {
                            setUser(false)
                            alert(`Signed out of ${user.username}!`)
                        }}
                        style={uniqueStyles.signOut}
                        textS={uniqueStyles.signOut}
                    />
                </Link>
            }
        </ScrollView>
    );
};

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        accountSettings: {
            flexDirection: 'row',
            gap: 10,
            verticalAlign: 'middle',
            marginTop: 40,
            width: '100%'
        },
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
            color: isDarkMode ? '#fff' : '#000',
            marginTop: 30,
            marginBottom: -10,
        },
        button: {
            paddingVertical: 15,
            borderColor: 'white',
            borderRadius: 5,
            borderStyle: 'solid',
            marginTop: 20,
        },
        buttonText: {
            color: isDarkMode ? '#fff' : '#000',
            fontSize: 18,
            fontWeight: '500',
        },
        signOut: {
            padding: 0,
            backgroundColor: 'null',
            color: 'red'
        },
        subSectionTitle: {
            fontSize: 26,
            fontWeight: 'bold',
            color: isDarkMode ? '#fff' : '#000',
            marginTop: 30,
            marginBottom: -10,
        }
    });

export default SettingsPage;
