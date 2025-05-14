import { useState, useEffect } from "react";
import { View, StyleSheet, Text, Dimensions, ScrollView } from "react-native";
import { createDefaultStyles } from '@/components/defaultStyles';
import { useTheme } from '../_layout';
import ControllerButton from "@/components/settingsComponents/controllerButton";
import DropDownPicker from "react-native-dropdown-picker";
import { useSocket } from "@/hooks/useSocket";
import { Robot } from "@/components/models/Robot";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function Controller() {

    // Hooks and colours
    const { theme } = useTheme();
    const { robotData } = useSocket();
    const isDarkMode = theme === 'dark';
    const defaultStyles = createDefaultStyles(isDarkMode);

    // Robot settings
    const [selectedRobot, setSelectedRobot] = useState(robotData.length > 0 ? robotData[0].robot_id : "");
    const [robotList, setRobotList] = useState<{ label: string; value: string }[]>([]);

    // Appearance settings
    const [dropDownVisible, setDropDownVisible] = useState(false);
    const uniqueStyles = createUniqueStyles(isDarkMode);


    // Update the robot list on robotData change
    useEffect(() => {
        const updatedRobotList = robotData.map((robot: Robot) => ({
            label: robot.robot_id,
            value: robot.robot_id,
        }));

        setRobotList(updatedRobotList);

        // Auto select the first robot if none are selected
        if (updatedRobotList.length > 0 && !selectedRobot) {
            setSelectedRobot(updatedRobotList[0].value);
        }
    }, [robotData]);


    return (
        <View style={defaultStyles.body}>

            {/* Page Title */}
            < View style={defaultStyles.pageTitleSection}>
                <Text style={defaultStyles.pageTitle}>Controller</Text>
            </View>


            {/* Dropdown Box */}
            <View style={uniqueStyles.dropdownContainer}>
                <Text style={uniqueStyles.label}>Select Robot:</Text>
                <DropDownPicker
                    open={dropDownVisible}
                    value={selectedRobot}
                    items={robotList}
                    setOpen={setDropDownVisible}
                    setValue={setSelectedRobot}
                    setItems={setRobotList}
                    placeholder="Select a Robot"
                    style={uniqueStyles.picker}
                    dropDownContainerStyle={uniqueStyles.dropDownContainer}
                />
            </View>


            {/* Controller Buttons */}
            <View style={uniqueStyles.controller}>
                <View>
                    <View style={uniqueStyles.button} />
                    <ControllerButton iconName={"caretleft"} message='left' targetRobot={selectedRobot} />
                    <View style={uniqueStyles.button} />
                </View>
                <View>
                    <ControllerButton iconName={"caretup"} message='forward' targetRobot={selectedRobot}></ControllerButton>
                    <ControllerButton iconName={"closecircleo"} message='stop' targetRobot={selectedRobot}></ControllerButton>
                    <ControllerButton iconName={"caretdown"} message='backward' targetRobot={selectedRobot}></ControllerButton>
                </View>
                <View>
                    <ControllerButton iconName={"arrowup"} message='raise' targetRobot={selectedRobot}></ControllerButton>
                    <ControllerButton iconName={"caretright"} message='right' targetRobot={selectedRobot}></ControllerButton>
                    <ControllerButton iconName={"arrowdown"} message='lower' targetRobot={selectedRobot}></ControllerButton>
                </View>
            </View>

        </View >
    );
}

const createUniqueStyles = (isDarkMode: boolean) =>
    StyleSheet.create({
        dropdownContainer: {
            width: "95%",
            alignSelf: "center",
            top: 0,
        },
        label: {
            fontSize: 18,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 5,
            color: isDarkMode ? "#fff" : "#000",
        },
        picker: {
            backgroundColor: "#f0f0f0",
            borderRadius: 5,
            paddingHorizontal: 10,
            zIndex: 100,
        },
        dropDownContainer: {
            backgroundColor: "#fff",
            borderColor: "#ccc",
            zIndex: 100,
        },
        controller: {
            top: 0,
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        button: {
            borderRadius: 20,
            width: screenWidth * 0.2,
            height: screenWidth * 0.2,
            marginBottom: 10,
            marginLeft: 10,
        }
    });
