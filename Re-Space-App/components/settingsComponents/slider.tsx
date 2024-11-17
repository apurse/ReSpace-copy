import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../app/_layout'
// import Slider from "@react-native-community/slider";


const SliderSetting = ({ label, min = 0, max = 100}: { label: string, min: number, max: number}) => {
    const [value, setValue] = useState((min + max) / 2);

    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);

    return (
        <View style={uniqueStyles.settingContainer}>
            <Text style={uniqueStyles.label}>{label}: {value.toFixed(0)}</Text>
            {/* <Slider
                style={{ width: 200, height: 40 }}
                minimumValue={min}
                maximumValue={max}
                value={value}
                onValueChange={setValue}
                minimumTrackTintColor="#1EB1FC"
                maximumTrackTintColor="#d3d3d3"
            /> */}
        </View>
    );
};

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        settingContainer: {
            paddingVertical: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#ddd',
        },
        label: {
            fontSize: 16,
            marginBottom: 5,
            color: isDarkMode ? '#fff' : '#333',
        },
    });

export default SliderSetting;
