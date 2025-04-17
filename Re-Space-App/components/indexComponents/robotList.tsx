import { StyleSheet, View, Dimensions, Text } from "react-native";
import * as Icons from './Icons';
import { useTheme } from '@/app/_layout';
import { Robot } from "@/components/models/Robot";
import { useSocket } from "@/hooks/useSocket";
import RobotBox from '@/components/indexComponents/robotInfo';

const { width, height } = Dimensions.get('window');


export default function robotList() {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const uniqueStyles = createUniqueStyles(isDarkMode);
    const { socket, isConnected, robotData, sendMessage } = useSocket();


    // Make dynamic list for number of robots
    var addRobots: any = [];
    robotData.forEach((robot: Robot) => {
        addRobots.push(<RobotBox key={robot.robot_id} robot={robot} />)
    })

    return (
        <View style={uniqueStyles.robotBoxContainer}>
            {addRobots}
        </View>
    );
};


const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        robotBoxContainer: {
            backgroundColor: isDarkMode ? '#000' : '#b6b7b8', // change to slightly different to background
            width: '90%',
            borderRadius: 8,
            marginTop: 20,
            padding: 10,
            gap: '10px',
            height: height * 0.45, // needs to go to bottom
            overflow: 'scroll',
        },
    })