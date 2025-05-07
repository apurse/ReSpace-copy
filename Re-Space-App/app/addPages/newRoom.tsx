import { View, ScrollView, StyleSheet, Text, Dimensions, Pressable, Button, TextInput } from 'react-native';
import { useState } from 'react';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from "@/app/_layout";
import { useRouter } from 'expo-router';
import { createRoomIfNotExists } from '@/components/libraryComponents/roomCreator';
import { useAuth } from '@/hooks/useAuth';
import { useRoom } from '@/hooks/useRoom';

// expo navigation: https://docs.expo.dev/router/navigating-pages/
// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export default function newRoom() {

  /**
   * Hooks and colours
   */
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const defaultStyles = createDefaultStyles(isDarkMode);
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const router = useRouter();
  const { roomName, setupRoomJSON, setRoomName } = useRoom();

  //  Room name
  const [tempName, setTempName] = useState('');

  return (
    <View style={defaultStyles.body}>
      <View style={uniqueStyles.buttonContainer}>

        {/* Input room's name */}
        <TextInput
          placeholder="Type new room's name"
          value={tempName}
          onChangeText={setTempName}
          style={uniqueStyles.textInput}
        />
        <Pressable
          style={[uniqueStyles.button, { backgroundColor: '#4CAF50' }]}
          onPress={async () => {
            setupRoomJSON(tempName)
          }}
        >
          <Text style={uniqueStyles.text}>Create</Text>
        </Pressable>
        {/* Cancel new room, go back to previous page */}
        <Pressable style={[uniqueStyles.button, { backgroundColor: '#fa440c' }]} onPress={() => router.back()}>
          <Text style={uniqueStyles.text}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    buttonContainer: {
      gap: width * 0.1,
    },
    button: {
      width: width * 0.75,
      height: width * 0.1,
      backgroundColor: isDarkMode ? '#fff' : '#000',
      borderRadius: 20,
      alignContent: 'center',
    },
    text: {
      textAlign: 'center',
      fontSize: 24,
      color: isDarkMode ? '#000' : '#fff',
      top: 3,
      fontWeight: '300',
    },
    textInput: {
      borderRadius: 4,
      paddingLeft: width * 0.2,
      alignItems: 'center',
      height: 40,
      backgroundColor: isDarkMode ? 'white' : 'black',
      color: isDarkMode ? '#000' : '#fff',
      fontSize: 14,
      fontWeight: 'bold',
      fontFamily: 'arial',
    },
  });
