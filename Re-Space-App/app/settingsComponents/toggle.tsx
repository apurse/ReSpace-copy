import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

const ToggleSetting = ({ label }: { label: string}) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(previousState => !previousState);

    return (
        <View style={styles.settingContainer}>
        <Text style={styles.label}>{label}</Text>
            <Switch
    trackColor={{ false: "#767577", true: "#81b0ff" }}
    thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
    onValueChange={toggleSwitch}
    value={isEnabled}
    />
    </View>
);
};

const styles = StyleSheet.create({
    settingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    label: {
        fontSize: 16,
        color: '#333',
    },
});

export default ToggleSetting;
