import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '../_layout';
import ControllerButton from "@/components/settingsComponents/controllerButton";

// expo navigation: https://docs.expo.dev/router/navigating-pages/
// Get dimensions of the screen
const { width, height } = Dimensions.get('window');



export default function Controller() {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);
    const uniqueStyles = createUniqueStyles(isDarkMode);


    return (
        <View style={defaultStyles.body}>

            {/* Content */}
            <View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>Controller</Text>
            </View>

            <View style={uniqueStyles.controller}>
                <View>
                    <View style={uniqueStyles.button}></View>
                    <ControllerButton iconName={"caretleft"} message='left'></ControllerButton>
                    <View style={uniqueStyles.button}></View>
                </View>
                <View>
                    <ControllerButton iconName={"caretup"} message='forward'></ControllerButton>
                    <ControllerButton iconName={"closecircleo"} message='stop'></ControllerButton>
                    <ControllerButton iconName={"caretdown"} message='backward'></ControllerButton>
                </View>
                <View>
                    <ControllerButton iconName={"arrowup"} message='raise'></ControllerButton>
                    <ControllerButton iconName={"caretright"} message='right'></ControllerButton>
                    <ControllerButton iconName={"arrowdown"} message='lower'></ControllerButton>
                </View>
            </View>

        </View>
    );
}

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        buttonContainer: {
            gap: width * 0.2,
        },
        button: {
            borderRadius: 20,
            width: width*0.2,
            height: width*0.2,
            marginBottom:10,
            marginLeft:10,
            // backgroundColor: isDarkMode ? '#fff' : '#000',
            // backgroundColor: 'lightgrey'
        },
        controller: {
            flexDirection: 'row',
            flex: 1, // the number of columns you want to divide the screen into
            justifyContent: 'center',
            marginHorizontal: "auto",
            alignItems: 'center',
            // width: 400,
            // backgroundColor: "red"
        },
        row: {
            flexDirection: "row"
        },
        text: {
            textAlign: 'center',
            fontSize: 24,
            color: isDarkMode ? '#000' : '#fff',

        }
    });
