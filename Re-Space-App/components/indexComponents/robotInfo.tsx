import { StyleSheet, View, Text } from "react-native";
import * as Icons from './Icons';
import { useTheme } from '../../app/_layout';


export default function robotInfo() {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);

    // functionality goes here

    // needs to listen for robot status
    // const robot = {type: "status", robot_id: <UUID>, battery: <int>, location: {x: <int>, y: <int>}, current_activity: "<task_id>"}


    // the component structure
    return (
        <View style={uniqueStyles.container}>
            {/* image of robot */}
            <Text style={uniqueStyles.text}>robot.robot_id</Text>
            <Text style={uniqueStyles.text}>robot.battery</Text>
            <Text style={uniqueStyles.text}>robot.current_activity</Text>
            <Text style={uniqueStyles.text}>robot.location.x</Text>
            <Text style={uniqueStyles.text}>robot.location.y</Text>
        </View>
    );
};


// css styling

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        container: {
            width: '100%',
            backgroundColor: isDarkMode ? '#ddd' : '#fff',
            borderColor: isDarkMode ? '#fff' : '#000',
            borderWidth: 1,
            borderRadius: 8,
            height: 120,
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