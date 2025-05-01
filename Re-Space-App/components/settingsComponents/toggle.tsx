import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../../app/_layout';

type ToggleSettingProps = {
    label: string;          // Label for the setting
    value: boolean;         // External value to control the switch state
    onValueChange: (value: boolean) => void; // Callback when the switch is toggled
};

const ToggleSetting: React.FC<ToggleSettingProps> = ({ label, value, onValueChange }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);

    return (
        <View style={uniqueStyles.settingContainer}>
            <Text style={uniqueStyles.label}>{label}</Text>
            <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={value ? "#f5dd4b" : "#f4f3f4"}
                onValueChange={onValueChange}
                value={value}
            />
        </View>
    );
};

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        settingContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#fff' : '#000',
        },
        label: {
            fontSize: 16,
            color: isDarkMode ? '#fff' : '#333',
        },
    });

export default ToggleSetting;
