import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from "react-native";
import { useTheme } from '../../app/_layout';
import { AntDesign } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');


export default function FilterButton({ Option, onPress, selected, outlineIcon, filledIcon, selectedColor }: { Option: string; onPress: () => void; selected?: boolean; outlineIcon: keyof typeof AntDesign.glyphMap; filledIcon?: keyof typeof AntDesign.glyphMap; selectedColor: string; }) {

  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const uniqueStyles = createUniqueStyles(isDarkMode, selectedColor);


  return (
    <View>
      {!selected ?
        (
          <TouchableOpacity style={uniqueStyles.layoutCard} onPress={onPress}>
            <AntDesign name={outlineIcon} style={uniqueStyles.iconStyle} />
            <Text style={uniqueStyles.layoutTitle}>{Option}</Text>
          </TouchableOpacity>
        )
        :
        (
          <TouchableOpacity style={uniqueStyles.layoutCard} onPress={onPress}>
            <AntDesign name={filledIcon? filledIcon : outlineIcon} style={uniqueStyles.activeIconStyle} />
            <Text style={uniqueStyles.layoutTitle}>{Option}</Text>
          </TouchableOpacity>
        )
      }
    </View>
  );
};

const createUniqueStyles = (isDarkMode: boolean, selectedColor: string) =>
  StyleSheet.create({


    // Container
    layoutCard: {
      aspectRatio: 1,
      minWidth: width / 3.5,
      flexBasis: '20%',
      borderColor: selectedColor,
      borderWidth: 3,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center'
    },


    // Titles
    layoutTitle: {
      marginTop: 7,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 4,
      color: isDarkMode ? '#fff' : '#000',
      textAlign: 'center'
    },
    activeLayoutTitle: {
      marginTop: 7,
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 4,
      color: isDarkMode ? '#000' : '#fff',
      textAlign: 'center'
    },


    // Icons
    iconStyle: {
      fontSize: 30,
      color: isDarkMode ? '#fff' : '#000',
      marginTop: 5,
    },
    activeIconStyle: {
      fontSize: 30,
      color: selectedColor,
      marginTop: 5,
    }
  })