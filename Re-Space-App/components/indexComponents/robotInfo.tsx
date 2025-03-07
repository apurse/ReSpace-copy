import { StyleSheet, View, Text } from "react-native";
import * as Icons from './Icons';
import { useTheme } from '@/app/_layout';
import { Robot } from "@/components/models/Robot";


export default function robotInfo({ robot }: { robot: Robot }) {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);

    // functionality goes here

    // the component structure
    return (
        <View style={uniqueStyles.container}>
            {/* image of robot */}
            <Text style={uniqueStyles.text}>ID: {robot.robot_id.slice(0, 6)}</Text>
            <Text style={uniqueStyles.text}>Battery: {robot.battery}</Text>
            <Text style={uniqueStyles.text}>Current activity: {robot.current_activity}</Text>
            <Text style={uniqueStyles.text}>Location X: {robot.locationX.toFixed(2)}</Text>
            <Text style={uniqueStyles.text}>Location Y: {robot.locationY.toFixed(2)}</Text>
        </View>
    );
};


// css styling

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        container: {
            width: '100%',
            backgroundColor: isDarkMode ? '#52be80' : '#fff',
            borderColor: isDarkMode ? '#fff' : '#000',
            borderWidth: 1,
            borderRadius: 8,
            height: 115,
            padding: 8,
            alignItems: 'center',
        },
        text: {
            fontSize: 16,
            fontWeight: 'bold',
            marginLeft: 4,
            color: isDarkMode ? '#fff' : '#000',
        },
        image: {
            width: 80,
            height: 80,
            borderRadius: 4,
        }
    })