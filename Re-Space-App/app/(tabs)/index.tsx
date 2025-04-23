import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import * as Icons from '../../components/indexComponents/Icons';
import { createDefaultStyles } from '@/components/defaultStyles';
import RobotList from '@/components/indexComponents/robotList';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../_layout';
import { useSocket } from "@/hooks/useSocket";
import { LoginModal } from '@/components/indexComponents/loginModal';
import { useAuth } from "@/hooks/useAuth";


// Get dimensions of the screen
const { width, height } = Dimensions.get('window');
const currentBatteryPerc = 67;
const issuesFound = 0;

// Monitoring status card based on percentage/battery level
const batteryLevel = () => {

  const batteryStatus = [
    { threshold: 90, message: "Ready to go!", color: "#52be80", warning: Icons.ThumbsUpIcon, battery: Icons.BatteryIcon },
    { threshold: 70, message: "Good to go", color: "#52be80", warning: Icons.ThumbsUpIcon, battery: Icons.BatteryIcon3Q },
    { threshold: 30, message: "Good to go", color: "#52be80", warning: Icons.ThumbsUpIcon, battery: Icons.BatteryIconHalf },
    { threshold: 15, message: "Battery low", color: "#dbd803", warning: Icons.BatteryIconCharge, battery: Icons.BatteryIconLow },
    { threshold: 0, message: "Needs charging!", color: "#ec1a01", warning: Icons.BatteryIconCharge, battery: Icons.BatteryIconLow },
    { threshold: -1, message: "No battery", color: "#ec1a01", warning: Icons.BatteryIconCharge, battery: Icons.BatteryIconNull }
  ];

  return batteryStatus.find(item => currentBatteryPerc > item.threshold) || { message: "Error", color: "#ec1a01", warning: Icons.WarningIcon, battery: Icons.WarningIcon }
};

// Change status if any issues found
const warnings = () => {
  if (issuesFound) {
    return { messageW: "Issues found!", colorW: "#ec1a01", warningI: Icons.WarningIcon };
  }
}

// batteryLevel function variables
const { message, color, warning, battery } = batteryLevel();

// warnings function variables
const { messageW = "", colorW = "", warningI = null } = warnings() || {};

export default function HomeScreen() {

  const [isModalVisible, setModalVisible] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(true); // set to true while developing
  const [greeting, setGreeting] = useState<string | null>();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { socket, isConnected, robotData, sendMessage } = useSocket();
  const { loggedIn, user } = useAuth();


  // Change greeting text based on time
  function getGreeting() {
    const currentHour = new Date().getHours();


    // Set custom messages based on hours
    var statement = (currentHour < 12) ? "Good morning!"
      : (currentHour < 17) ? "Good afternoon!"
        : "Good evening!";


    // If logged in, change statement to include username
    if (user) statement = `${statement.substring(0, statement.length - 1)}, ${user.username}!`;

    setGreeting(statement)
  };


  // Listen to user login changes
  useEffect(() => {
    getGreeting();
    setModalVisible(false);
  }, [user]);


  // Load login modal on startup if not logged in
  useEffect(() => {
    if (!user && !hasSeenModal) {
      setHasSeenModal(true)
      setModalVisible(true)
    }
  }, [user, hasSeenModal])


  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Login button */}
      {!user &&
        <TouchableOpacity style={uniqueStyles.loginButton} onPress={() => setModalVisible(true)}>
          <View style={uniqueStyles.loginButtonContent}>
            <Icons.UserIcon />
            <Text style={uniqueStyles.loginButtonText}>Login</Text>
          </View>
        </TouchableOpacity>
      }

      {/* Greeting */}
      <Text style={uniqueStyles.greeting}>{greeting}</Text>

      {/* ReSpace monitoring status section */}
      <View style={[uniqueStyles.statusCard, { backgroundColor: colorW || color }]}>
        <Text style={uniqueStyles.statusTitle}>ReSpace Monitoring</Text>
        <View style={uniqueStyles.statusIcons}>
          {React.createElement(battery)}
          {React.createElement(warningI || warning)}
        </View>
        <Text style={uniqueStyles.statusText}>{messageW || message}</Text>
        <Text style={uniqueStyles.statusText}>{currentBatteryPerc}%</Text>
      </View>

      {/* Robots section */}
      <Text style={defaultStyles.sectionTitle}>Connected Robots: {robotData.length}</Text>
      <RobotList />

      <LoginModal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}


const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({

    // Greeting and login section

    greeting: {
      fontSize: width * 0.06,
      marginBottom: 5,
      marginTop: 5,
      textAlign: 'center',
      color: isDarkMode ? '#fff' : '#000',
    },
    loginButton: {
      position: 'absolute',
      top: 10,
      left: 10,
      backgroundColor: isDarkMode ? '#e6e6e6' : '#4a4a4a',
      padding: 10,
      alignItems: 'center',
      borderRadius: 5,
    },
    loginButtonContent: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
    },
    loginButtonText: {
      textAlignVertical: 'center',
      color: isDarkMode ? '#000' : '#fff',
      fontSize: 18,
    },

    // Status card section

    statusCard: {
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 25,
      borderColor: isDarkMode ? '#fff' : '#000',
      borderWidth: 0.5,
      width: '90%',
      minHeight: 150,
      alignSelf: 'center',
    },
    statusTitle: {
      fontSize: width * 0.08,
      color: '#fff',
      fontWeight: '400',
      marginBottom: 8,
    },
    statusText: {
      fontSize: width * 0.06,
      color: '#fff',
      fontWeight: '400',
    },
    statusIcons: {
      flexDirection: 'row',
      gap: width * 0.3,
      marginBottom: 5,
      marginTop: 5,
      fontSize: height * 0.07,
    }

  });