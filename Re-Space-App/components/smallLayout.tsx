import { StyleSheet, View, Text, Pressable, Image } from "react-native";
import * as Icons from './indexComponents/Icons';
import { useTheme } from '../app/_layout';
import { Link, router } from "expo-router";
import { useSocket } from "@/hooks/useSocket";


export default function SmallLayout({ LayoutTitle }: { LayoutTitle: any }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const uniqueStyles = createUniqueStyles(isDarkMode);
  const { isConnected, sendMessage, roomMap } = useSocket();

  if (isConnected) {
    sendMessage({ type: "room_map", data: "test" });
    console.log("refreshing")
  } else {
    // alert("No connection to the WebSocket.");
  }


  return (
    <Pressable style={uniqueStyles.layoutCard}
      onPress={() =>
        router.push({
          pathname: "/addPages/addLayout",
          params: LayoutTitle,
        })
      }>
      <View style={uniqueStyles.layoutHeader}>
        <Icons.StarIcon />
        <Icons.StarIconOutline />
        <Text style={uniqueStyles.layoutTitle}>{LayoutTitle}</Text>
      </View>
      <Image
        style={uniqueStyles.imageBody}
        source={{ uri: (`data:image/png;base64,${roomMap}`) }} />
    </Pressable>
  );
};

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    layoutCard: {
      width: '45%',
      borderColor: isDarkMode ? '#fff' : '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      height: 180,
      padding: 8,
      alignItems: 'center',
    },
    layoutHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    layoutTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 4,
      color: isDarkMode ? '#fff' : '#000',
    },
    imageBody: {
      // width: 180,
      // height: 300,
      width: '100%',
      height: '100%',
    }
  })