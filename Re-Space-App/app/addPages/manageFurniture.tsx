import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { createDefaultStyles } from '../../components/defaultStyles';
import { useTheme } from "@/app/_layout";

// Get dimensions of the screen
const { width, height } = Dimensions.get('window');

export default function RoomDetails() {

  /**
   * Hooks and colours
   */
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);
    const router = useRouter();

    return (
        <View style={defaultStyles.body}>
            
            <View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>Manage Furniture</Text>
            </View>

            {/* Add new furniture */}
            <View style={uniqueStyles.buttonContainer}>
                <Pressable style={uniqueStyles.button} onPress={() => router.push('/addPages/addFurniture')}>
                    <Text style={uniqueStyles.text}>New Furniture</Text>
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
      }
    });
