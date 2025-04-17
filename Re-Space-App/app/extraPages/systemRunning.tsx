import { View, Text, ScrollView, StyleSheet, Dimensions, Pressable } from 'react-native';
import * as Icons from '../../components/indexComponents/Icons';
import { createDefaultStyles } from '@/components/defaultStyles';
import RobotList from '@/components/indexComponents/robotList';
import React from 'react';
import { useTheme } from '../_layout';
import { useSocket } from "@/hooks/useSocket";
import ActionButton from "@/components/settingsComponents/actionButton";


// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export default function systemRunning() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { socket, isConnected, robotData, sendMessage } = useSocket();

  if (!isConnected) {
    console.warn("WebSocket not connected!");
    return;
  }

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
        onPress={() => {
          sendMessage({ type: "emergency_stop", direction: "stop" });
          alert("stop called");
        }}
      />

      {/* Robots section */}
      <RobotList />
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
    }
  });