import { View, Text, ScrollView, Image } from 'react-native';
import * as Icons from '../indexComponents/Icons';
import { styles } from '../indexComponents/styles';
import SmallLayout from '@/components/smallLayout';
import React from 'react';

// Battery level
const currentBatteryPerc = 45;

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
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Greeting */}
      <Text style={styles.greeting}>{getGreeting()}</Text>
      <Icons.SearchIcon />

      {/* ReSpace monitoring status section */}
      <View style={[styles.statusCard, { backgroundColor: colorW || color }]}>
        <Text style={styles.statusTitle}>ReSpace Monitoring</Text>
        <View style={styles.statusIcons}>
          {React.createElement(battery)}
          {React.createElement(warningI || warning)}
        </View>
        <Text style={styles.statusText}>{messageW || message}</Text>
        <Text style={styles.statusText}>{currentBatteryPerc}%</Text>
      </View>

      {/* Recent layouts section */}
      <Text style={styles.sectionTitle}>Recent Layouts</Text>
      <View style={styles.layoutContainer}>
        <SmallLayout LayoutTitle="Groups of 2"></SmallLayout>
        <SmallLayout LayoutTitle="Rows of 8"></SmallLayout>
        <SmallLayout LayoutTitle="Rows of 4"></SmallLayout>
      </View>
    </ScrollView>
  );
}
