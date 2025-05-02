// import React, { useState } from 'react';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../app/_layout'
import Slider from "@react-native-community/slider";

type SliderSettingProps = {
    label: string;
    min: number;
    max: number;
    value: number;
    onValueChange: (value: number) => void;
};

const SliderSetting: React.FC<SliderSettingProps> = ({ label, min, max, value, onValueChange }) => {
    // const [value, setValue] = useState((min + max) / 2);

    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);

    return (
        <View style={uniqueStyles.settingContainer}>
            <Text style={uniqueStyles.label}>{label}: {value.toFixed(0)}</Text>
            {<Slider
                style={{ width: 200, height: 40 }}
                minimumValue={min}
                maximumValue={max}
                value={value}
                onValueChange={onValueChange}
                minimumTrackTintColor="#1EB1FC"
                maximumTrackTintColor="#d3d3d3"
            />}
        </View>
    );
};

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        settingContainer: {
            // paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: isDarkMode ? '#fff' : '#000',
            marginTop: 20,
        },
        label: {
            fontSize: 16,
            marginBottom: 5,
            color: isDarkMode ? '#fff' : '#333',
        },
    });

export default SliderSetting;
