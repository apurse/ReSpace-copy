import React, {useEffect, useState} from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import ToggleSetting from '@/components/settingsComponents/toggle';
import SliderSetting from '@/components/settingsComponents/slider';
import ActionButton from '@/components/settingsComponents/actionButton';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    const [test, setTest] = useState(false);
    const [movementSpeed, setMovementSpeed] = useState(2);
    const [batteryNotificationThreshold, setBatteryNotificationThreshold] = useState(15);

    useEffect(() => {
        loadLocalSettings();
    }, []);

    async function loadLocalSettings() {
        if (hasLoaded) return;
        hasLoaded = true;

        try {
            const test = await AsyncStorage.getItem('test');
            setTest(test === 'true');
        } catch (error) {
            console.error("Error loading settings:", error);
            setTest(false);
        }

        try {
            const movementSpeed = await AsyncStorage.getItem('movementSpeed');
            setMovementSpeed(movementSpeed != null ? parseFloat(movementSpeed) : 2);
        } catch (error) {
            console.error("Error loading 'movementSpeed' setting:", error);
            setMovementSpeed(-1);
        }

        try {
            const stopWhenHumansPresent = await AsyncStorage.getItem('stopWhenHumansPresent');
            console.log("Stop: " + stopWhenHumansPresent);
            setStopWhenHumansPresent(stopWhenHumansPresent === 'true');
        } catch (error) {
            console.error("Error loading 'stopWhenHumansPresent' setting:", error);
            setStopWhenHumansPresent(false);
        }

        try {
            const completedTasks = await AsyncStorage.getItem('completedTasks');
            setCompletedTasks(completedTasks === 'true');
        } catch (error) {
            console.error("Error loading 'completedTasks' setting:", error);
            setCompletedTasks(false);
        }

        try {
            const collisions = await AsyncStorage.getItem('collisions');
            setCollisions(collisions === 'true');
        } catch (error) {
            console.error("Error loading 'collisions' setting:", error);
            setCollisions(false);
        }

        try {
            const batteryLevels = await AsyncStorage.getItem('batteryLevels');
            setBatteryLevels(batteryLevels === 'true');
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
        // Todo: Missing darkmode toggle saving

    }

    async function onChangeFunction(settingFunction: any, key: any, value: any) {
        if (value != null) {
            settingFunction(value);
            console.log("Changing value: " + value.toString());
            await AsyncStorage.setItem(key.toString(), value.toString());
            // alert("Key: " + settingFunction.toString());
        }
        // Darkmode storage WIP
        //  else {
        //     settingFunction();
        //     if (theme == 'dark') {
        //         await AsyncStorage.setItem(key, true.toString());
        //     } else {
        //         await AsyncStorage.setItem(key, false.toString());
        //     }
        //
        //     // alert("Toggled ==> " + settingFunction.toString());
        // }
        // TODO: Setup communication interface eg: Communication.Send(value)
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
                <ToggleSetting label="Test"
                               onValueChange={(value) => onChangeFunction(setTest, "test", value)}
                               value={test}
                />

                <ToggleSetting
                    label="Stop when humans present"
                    onValueChange={(value) => onChangeFunction(setStopWhenHumansPresent, "stopWhenHumansPresent", value)}
                    value={stopWhenHumansPresent}
                />
                <ActionButton
                    label="Re-map room"
                    onPress={() => alert("Mapping...")}
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
                    onValueChange={() => onChangeFunction(toggleTheme, "isDarkMode", null)}
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
});

export default SettingsPage;
