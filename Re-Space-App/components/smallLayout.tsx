import { StyleSheet, View, Text } from "react-native";
import * as Icons from './indexComponents/Icons';
import { useTheme } from '../app/_layout';


// function with parameters
// parameter bug: https://stackoverflow.com/questions/40745992/binding-element-index-implicitly-has-an-any-type
export default function SmallLayout({ LayoutTitle }: { LayoutTitle: any }) {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const uniqueStyles = createUniqueStyles(isDarkMode);

    // add image parameter when ready


    // functionality goes here


    // the component structure
    return (
        <View style={uniqueStyles.layoutCard}>
          <View style={uniqueStyles.layoutHeader}>
            <Icons.StarIcon />
            <Icons.StarIconOutline />
            <Text style={uniqueStyles.layoutTitle}>{LayoutTitle}</Text>
          </View>
          {/* <Image source={{ uri: 'https://via.placeholder.com/100' }} style={styles.layoutImage} /> */}
        </View>
    );
};


// css styling

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
    layoutImage: {
      width: 80,
      height: 80,
      borderRadius: 4,
    }
  })