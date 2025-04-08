import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable } from 'react-native';
import * as Icons from '../../components/indexComponents/Icons';
import { createDefaultStyles } from '@/components/defaultStyles';
import RobotBox from '@/components/indexComponents/robotInfo';
import React from 'react';
import { useTheme } from '../_layout';
import { useSocket } from "@/hooks/useSocket";
import { Robot } from "@/components/models/Robot";
import ActionButton from "@/components/settingsComponents/actionButton";


// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export default function systemRunning() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { socket, isConnected, robotData, sendMessage } = useSocket();


  // Make dynamic list for number of robots
  var addRobots: any = [];
  robotData.forEach((robot: Robot) => {
    addRobots.push(<RobotBox key={robot.robot_id} robot={robot} />)
  })

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>
      <View style={[uniqueStyles.tempBox]}>
        <Text>Simulation container</Text>
      </View>


      {/* Grid with live simulation here */}


      <View style={[uniqueStyles.progressBar]}>
        <Text>Progress bar</Text>
      </View>

      <ActionButton
        label="Emergency Stop"
        icon={React.createElement(Icons.StopCircle)}
        style={uniqueStyles.stopContainer}
        onPress={() => alert("stop called")}
      />

      {/* Robots section */}
      <View style={uniqueStyles.robotBoxContainer}>
        {addRobots}
      </View>
    </ScrollView>
  );
}

// styles unique to this page go here
const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({

    stopContainer: {
      backgroundColor: "red",
      // padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      // marginBottom: 24,
      // marginTop: 25,
      borderColor: isDarkMode ? '#fff' : '#000',
      // borderWidth: 0.5,
      width: '100%',
      height: 120,
      alignSelf: 'center',
      fontSize: 200,
    },
    tempBox: {
      marginTop: -20,
      backgroundColor: "gray",
      borderColor: isDarkMode ? '#fff' : '#000',
      // borderWidth: 0.5,
      width: 0.8 * width,
      height: 0.8 * width,
      alignSelf: 'center',
    },
    progressBar: {
      backgroundColor: "blue",
      // padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      // marginBottom: 24,
      // marginTop: 25,
      marginVertical: 10,
      borderColor: isDarkMode ? '#fff' : '#000',
      borderWidth: 0.5,
      width: 0.8 * width,
      height: 20,
      alignSelf: 'center',
    },

    // Robot List Section

    robotBoxContainer: {
      backgroundColor: isDarkMode ? '#000' : '#b6b7b8', // change to slightly different to background
      width: '100%',
      borderRadius: 8,
      marginTop: 20,
      padding: 10,
      gap: '10px',
      height: height * 0.25, // needs to go to bottom
      overflow: 'scroll',
    },

  });