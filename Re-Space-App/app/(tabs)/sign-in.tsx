import { View, ScrollView, StyleSheet, Text, Dimensions, TextInput, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '@/app/_layout';
import ActionButton from '@/components/settingsComponents/actionButton';
import furnitureData from '@/Jsons/FurnitureData.json';
import * as FileSystem from 'expo-file-system';
import { useSocket } from "@/hooks/useSocket";
import * as MediaLibrary from 'expo-media-library';



// Get dimensions of the screen
const { width, height } = Dimensions.get('window');


export default function SignIn() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const { socket, isConnected, robotData, sendMessage, QRCode } = useSocket();


  return (
    <ScrollView contentContainerStyle={defaultStyles.body}>

      {/* Content */}
      <View style={defaultStyles.pageTitleSection}>
        <Text style={defaultStyles.pageTitle}>Sign in page</Text>
      </View>

      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          style={uniqueStyles.textInput}
          placeholder='*Enter Username or Email...*'
        />
      </View>

      <View style={uniqueStyles.inputField}>
        <Text style={uniqueStyles.inputHeader}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={uniqueStyles.textInput}
          placeholder='*Enter password...*'
        />
      </View>

      <ActionButton
        label="Forgot password?"
        onPress={() => alert("WIP")}
        style={uniqueStyles.forgotPassword}
        textS={uniqueStyles.forgotPassword}
      />

      <ActionButton
        label="Login"
        onPress={() => alert("WIP")}
        style={{ width: '80%' }}
      />

      <View style={uniqueStyles.createAccount}>
        <Text style={uniqueStyles.inputHeader}>Not made an account? Create one below!</Text>
        <ActionButton
          label="Create Account"
          onPress={() => alert("WIP")}
          style={{ width: '90%' }}
        />
      </View>
    </ScrollView>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    inputField: {
      width: '100%',
      padding: 20,
      paddingBottom: 0,
    },
    inputHeader: {
      fontSize: 16,
      color: isDarkMode ? '#fff' : '#333',
      paddingBottom: 5,
    },
    textInput: {
      width: '100%',
      borderRadius: 4,
      paddingLeft: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: 40,
      backgroundColor: isDarkMode ? 'white' : 'black',
      color: isDarkMode ? '#000' : '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'arial',
    },
    forgotPassword: {
      // alignItems: 'baseline',
      padding: 0,
      backgroundColor: 'null',
      textDecorationColor: '#269bd1',
      textDecorationLine: 'underline',
      color: '#269bd1'
    },
    createAccount: {
      width: '100%',
      alignItems: 'center',
      textAlign: 'center',
      padding: 20,
      // verticalAlign: 'bottom',
      marginTop: 100,
      backgroundColor: 'null',
    },
  });
