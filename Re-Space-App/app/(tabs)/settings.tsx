import React, { useState } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import ToggleSetting from '@/components/settingsComponents/toggle';
import SliderSetting from '@/components/settingsComponents/slider';
import ActionButton from '@/components/settingsComponents/actionButton';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from '../_layout';

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);

    // Add state for each independent toggle
    const [stopWhenHumansPresent, setStopWhenHumansPresent] = useState(false);
    const [completedTasks, setCompletedTasks] = useState(false);
    const [collisions, setCollisions] = useState(false);
    const [batteryLevels, setBatteryLevels] = useState(false);
    const [test, setTest] = useState(false);


    function onChangeFunction(settingFunction: any, value: any) {
        if (value != null) {
            settingFunction(value);
            alert("Changed ==> " + value);
        } else {
            settingFunction();
            alert("Toggled ==> " + settingFunction.toString());
        }
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

                <SliderSetting label="Movement Speed" min={1} max={3}/>
                <ToggleSetting label="Test"
                               onValueChange={(value) => onChangeFunction(setTest, value)}
                               value={test}
                />

                <ToggleSetting
                    label="Stop when humans present"
                    value={stopWhenHumansPresent}
                    onValueChange={(value) => onChangeFunction(setStopWhenHumansPresent, value)}
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
                    onValueChange={(value) => onChangeFunction(setCompletedTasks, value)}
                />
                <ToggleSetting
                    label="Collisions"
                    value={collisions}
                    onValueChange={(value) => onChangeFunction(setCollisions, value)}
                />
                <ToggleSetting
                    label="Battery Levels"
                    value={batteryLevels}
                    onValueChange={(value) => onChangeFunction(setBatteryLevels, value)}
                />
                <SliderSetting label="Battery Notification Threshold" min={1} max={25} />

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
                    onValueChange={() => onChangeFunction(toggleTheme, null)}
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
