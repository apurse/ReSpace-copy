import { StyleSheet, View, Text, Dimensions, TouchableOpacity } from "react-native";
import { useTheme } from '../../app/_layout';

const { width, height } = Dimensions.get('window');


export default function FilterButton({ Option, onPress, selected }: { Option: string; onPress: () => void; selected?: boolean; }) {

  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const uniqueStyles = createUniqueStyles(isDarkMode);


  return (
    <TouchableOpacity style={selected ? uniqueStyles.activeLayoutCard : uniqueStyles.layoutCard} onPress={onPress}>
      <Text style={uniqueStyles.layoutTitle}>{Option}</Text>
    </TouchableOpacity>

  );
};

const createUniqueStyles = (isDarkMode: boolean) =>
  StyleSheet.create({
    activeLayoutCard: {
      width: width / 4,
      borderColor: isDarkMode ? '#fff' : '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      height: width / 4,
      padding: 8,
      alignItems: 'center',
      backgroundColor: 'red'
    },
    layoutCard: {
      width: width / 4,
      borderColor: isDarkMode ? '#fff' : '#ddd',
      borderWidth: 1,
      borderRadius: 8,
      height: width / 4,
      padding: 8,
      alignItems: 'center',
      opacity: 20
    },
    layoutTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 4,
      color: isDarkMode ? '#fff' : '#000',
    }
  })