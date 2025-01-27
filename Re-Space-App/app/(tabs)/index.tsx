import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import * as Icons from '../../components/indexComponents/Icons';
import { createDefaultStyles } from '../../components/defaultStyles';
import SmallLayout from '@/components/smallLayout';
import React from 'react';
import { useTheme } from '../_layout';

// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

// Battery level
const currentBatteryPerc = 67;

// Issues found
const issuesFound = 0;

// Change greeting text based on time
const getGreeting = () => {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return "Good morning!";
  } else if (currentHour < 17) {
    return "Good afternoon!";
  } else {
    return "Good evening!";
  }
};

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

  return batteryStatus.find(item => currentBatteryPerc > item.threshold) || { message: "Error", color: "#ec1a01", warning: Icons.WarningIcon, battery: Icons.WarningIcon };;
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
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);

  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>
      {/* Greeting */}
      <Text style={uniqueStyles.greeting}>{getGreeting()}</Text>
      <Icons.SearchIcon />

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

      {/* Recent layouts section */}
      <Text style={defaultStyles.sectionTitle}>Recent Layouts</Text>
      <View style={defaultStyles.cardSectionContainer}>
        <SmallLayout LayoutTitle="Groups of 2"></SmallLayout>
        <SmallLayout LayoutTitle="Rows of 8"></SmallLayout>
        <SmallLayout LayoutTitle="Rows of 4"></SmallLayout>
      </View>
    </ScrollView>
  );
}

// styles unique to this page go here
const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({

    // Greeting section

    greeting: {
      fontSize: width * 0.06,
      marginBottom: 5,
      marginTop: 5,
      textAlign: 'center',
      color: isDarkMode ? '#fff' : '#000',
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
    },

  });